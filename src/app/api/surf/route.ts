import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Suspicious TLDs commonly used for phishing/malware
const SUSPICIOUS_TLDS = [
  '.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top', '.work',
  '.biz', '.info', '.click', '.link', '.zip', '.review', '.country',
  '.stream', '.download', '.racing', '.win', '.party', '.cricket',
];

// Known safe domains
const SAFE_DOMAINS = [
  'google.com', 'github.com', 'wikipedia.org', 'stackoverflow.com',
  'mozilla.org', 'python.org', 'nodejs.org', 'npmjs.com',
  'microsoft.com', 'apple.com', 'amazon.com', 'cloudflare.com',
];

// Domain threat heuristics
function analyzeDomain(url: string): { threats: string[]; score: number } {
  const threats: string[] = [];
  let score = 100;

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return { threats: ['Invalid URL format'], score: 0 };
  }

  const hostname = parsedUrl.hostname.toLowerCase();
  const protocol = parsedUrl.protocol;

  // Check protocol
  if (protocol === 'http:') {
    threats.push('Insecure HTTP connection — data transmitted in plaintext');
    score -= 15;
  }

  // Check for suspicious TLD
  const tld = '.' + hostname.split('.').pop();
  if (SUSPICIOUS_TLDS.includes(tld)) {
    threats.push(`Suspicious TLD detected: ${tld} — commonly used in phishing/malware campaigns`);
    score -= 25;
  }

  // Check for IP address instead of domain
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
    threats.push('Direct IP address used instead of domain name — potential malicious host');
    score -= 20;
  }

  // Check for excessively long subdomain
  const subdomainCount = hostname.split('.').length - 2;
  if (subdomainCount > 3) {
    threats.push('Excessive subdomain depth — possible phishing or C2 infrastructure');
    score -= 10;
  }

  // Check for homograph attack indicators (mixed scripts)
  if (/[^\x00-\x7F]/.test(hostname)) {
    threats.push('Non-ASCII characters in domain — possible homograph/phishing attack');
    score -= 30;
  }

  // Check for typosquatting indicators (double letters, common brand misspellings)
  if (/(.)\1{2,}/.test(hostname)) {
    threats.push('Unusual character repetition in domain — possible typosquatting');
    score -= 10;
  }

  // Check for very long hostname
  if (hostname.length > 50) {
    threats.push('Unusually long domain name — often associated with auto-generated malicious domains');
    score -= 10;
  }

  // Known safe domain bonus
  if (SAFE_DOMAINS.some((safe) => hostname === safe || hostname.endsWith('.' + safe))) {
    score = Math.max(score, 85);
    // Remove generic threats for known safe domains
    const idx = threats.findIndex((t) => t.includes('Insecure HTTP'));
    if (idx === -1) {
      // No HTTP warning for safe domains using HTTPS
    }
  }

  // Clamp score
  score = Math.max(0, Math.min(100, score));

  return { threats, score };
}

// GET — Return recent surf sessions
export async function GET() {
  try {
    const sessions = await db.surfSession.findMany({
      take: 50,
      orderBy: { startTime: 'desc' },
    });

    return NextResponse.json({ success: true, data: sessions });
  } catch (error) {
    console.error('[Surf GET Error]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch surf sessions' },
      { status: 500 }
    );
  }
}

// POST — Submit a URL for security checking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    const hostname = parsedUrl.hostname.toLowerCase();

    // Check against blocked resources
    const blocked = await db.blockedResource.findUnique({
      where: { domain: hostname },
    });

    if (blocked && blocked.active) {
      // Increment hit counter
      await db.blockedResource.update({
        where: { domain: hostname },
        data: { hits: { increment: 1 } },
      });

      // Create blocked surf session
      await db.surfSession.create({
        data: {
          url,
          status: 'blocked',
          securityOk: false,
          threats: `blocked:${blocked.reason}`,
        },
      });

      // Log the event
      await db.securityLog.create({
        data: {
          eventType: 'threat_found',
          details: JSON.stringify({ url, domain: hostname, reason: blocked.reason, category: blocked.category }),
          riskLevel: 'high',
          action: 'blocked',
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          safe: false,
          threats: [`Domain is blocked: ${blocked.reason} (${blocked.category})`],
          securityScore: 0,
          recommendation: 'Access denied — this domain is in the blocked resources list. Use the Security Center to unblock if needed.',
        },
      });
    }

    // Analyze domain for threats
    const analysis = analyzeDomain(url);

    // Determine if safe
    const safe = analysis.score >= 60 && analysis.threats.length === 0;

    // Build recommendation
    let recommendation: string;
    if (analysis.score >= 80) {
      recommendation = 'URL appears safe. Standard precautions apply.';
    } else if (analysis.score >= 60) {
      recommendation = 'URL appears mostly safe but has minor concerns. Proceed with caution and avoid entering sensitive information.';
    } else if (analysis.score >= 40) {
      recommendation = 'URL has significant security concerns. Do not enter credentials or personal data. Consider using VPN and sandboxed browser.';
    } else {
      recommendation = 'URL is highly suspicious. Avoid visiting this site. If necessary, use an isolated environment with no personal data.';
    }

    // Create surf session record
    const sessionStatus = safe ? 'active' : analysis.score >= 40 ? 'active' : 'blocked';
    await db.surfSession.create({
      data: {
        url,
        status: sessionStatus,
        securityOk: safe,
        threats: analysis.threats.join(','),
      },
    });

    // Log threats if any
    if (analysis.threats.length > 0) {
      await db.securityLog.create({
        data: {
          eventType: 'threat_found',
          details: JSON.stringify({
            url,
            domain: hostname,
            threats: analysis.threats,
            score: analysis.score,
          }),
          riskLevel: analysis.score >= 60 ? 'low' : analysis.score >= 40 ? 'medium' : 'high',
          action: safe ? 'warned' : 'blocked',
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        safe,
        threats: analysis.threats,
        securityScore: analysis.score,
        recommendation,
      },
    });
  } catch (error) {
    console.error('[Surf POST Error]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check URL security' },
      { status: 500 }
    );
  }
}
