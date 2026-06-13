import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Known VPN / hosting / proxy ISP keywords for heuristic detection
const VPN_ISP_KEYWORDS = [
  'vpn', 'proxy', 'hosting', 'cloud', 'datacenter', 'data center',
  'server', 'vps', 'dedicated', 'cloudflare', 'amazon', 'aws',
  'google cloud', 'gcp', 'microsoft azure', 'azure', 'digitalocean',
  'linode', 'akamai', 'ovh', 'hetzner', 'vultr', 'oracle cloud',
  'alibaba cloud', 'tencent cloud', 'rackspace', 'm247', 'datacamp',
  'psychz', 'quadranet', 'choose', 'leaseweb', 'serverius',
  'datahouse', 'softlayer', 'ibm cloud',
];

const TOR_EXIT_KEYWORDS = ['tor', 'tor-exit', 'tor exit', 'tor project'];

function detectVpnProxy(ipInfo: { isp?: string; org?: string; as?: string }): {
  isVpn: boolean;
  isProxy: boolean;
  isTor: boolean;
  riskLevel: string;
  vpnSuggested: boolean;
} {
  const combined = `${ipInfo.isp || ''} ${ipInfo.org || ''} ${ipInfo.as || ''}`.toLowerCase();

  const isTor = TOR_EXIT_KEYWORDS.some(kw => combined.includes(kw));
  const isVpn = VPN_ISP_KEYWORDS.some(kw => combined.includes(kw)) && !isTor;
  const isProxy = combined.includes('proxy');

  let riskLevel = 'low';
  let vpnSuggested = false;

  if (isTor) {
    riskLevel = 'medium';
  } else if (isVpn || isProxy) {
    riskLevel = 'low';
    vpnSuggested = false;
  } else {
    // Residential / real IP — high risk, VPN strongly suggested
    riskLevel = 'high';
    vpnSuggested = true;
  }

  if (isProxy && !isVpn && !isTor) {
    riskLevel = 'medium';
  }

  return { isVpn, isProxy, isTor, riskLevel, vpnSuggested };
}

export async function GET(request: NextRequest) {
  try {
    // 1. Extract IP from headers
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const clientIp = forwarded?.split(',')[0]?.trim() || realIp || '127.0.0.1';

    // 2. Call external geolocation API
    let geoData: Record<string, unknown> = {};
    try {
      const geoRes = await fetch(`http://ip-api.com/json/${clientIp === '127.0.0.1' ? '' : clientIp}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query,hosting,proxy`);
      if (geoRes.ok) {
        geoData = await geoRes.json();
      }
    } catch {
      // External API unreachable — use fallback
      geoData = {};
    }

    const status = geoData.status as string | undefined;

    // 3. Build response from geo data or fallback
    const ip = (geoData.query as string) || clientIp;
    const city = (geoData.city as string) || 'Unknown';
    const region = (geoData.regionName as string) || 'Unknown';
    const country = (geoData.country as string) || 'Unknown';
    const isp = (geoData.isp as string) || 'Unknown';
    const lat = (geoData.lat as number) ?? 0;
    const lon = (geoData.lon as number) ?? 0;
    const timezone = (geoData.timezone as string) || 'UTC';

    // 4. VPN / Proxy / Tor detection
    const detection = detectVpnProxy({
      isp: isp,
      org: (geoData.org as string) || '',
      as: (geoData.as as string) || '',
    });

    // Override with API-provided flags if available
    if (status === 'success') {
      if (geoData.proxy === true && !detection.isProxy) detection.isProxy = true;
      if (geoData.hosting === true && !detection.isVpn) detection.isVpn = true;
      // If API says hosting but we didn't detect VPN, still recalculate
      if (geoData.hosting === true) {
        detection.riskLevel = detection.isTor ? 'medium' : 'low';
        detection.vpnSuggested = false;
      }
    }

    const result = {
      ip,
      city,
      region,
      country,
      isp,
      lat,
      lon,
      timezone,
      isVpn: detection.isVpn,
      isProxy: detection.isProxy,
      isTor: detection.isTor,
      riskLevel: detection.riskLevel,
      vpnSuggested: detection.vpnSuggested,
    };

    // 5. Log to SecurityLog
    await db.securityLog.create({
      data: {
        eventType: 'ip_detected',
        ipAddress: ip,
        isp: isp,
        country: country,
        city: city,
        isVpn: detection.isVpn,
        isProxy: detection.isProxy,
        isTor: detection.isTor,
        riskLevel: detection.riskLevel,
        details: JSON.stringify({
          region,
          timezone,
          lat,
          lon,
          vpnSuggested: detection.vpnSuggested,
        }),
        action: detection.vpnSuggested ? 'warned' : 'allowed',
      },
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('[IP API Error]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to detect IP information' },
      { status: 500 }
    );
  }
}
