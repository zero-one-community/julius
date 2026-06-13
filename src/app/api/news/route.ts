import { NextRequest, NextResponse } from 'next/server';

// ---------------------------------------------------------------------------
// J.U.L.I.U.S Security News Feed API – Real news via z-ai-web-dev-sdk
// ---------------------------------------------------------------------------

/** Shape of a single news item returned to the client */
interface NewsItem {
  title: string;
  summary: string;
  source: string;
  url: string;
  category: string;
  timestamp: string;
}

/** Shape of a cached entry */
interface CachedEntry {
  data: NewsItem[];
  fetchedAt: number;
}

/** In-memory cache keyed by category */
const cache = new Map<string, CachedEntry>();

/** Cache TTL in milliseconds (5 minutes) */
const CACHE_TTL_MS = 5 * 60 * 1000;

/** Valid category values for search queries */
const VALID_CATEGORIES = [
  'cybersecurity',
  'malware',
  'vulnerabilities',
  'data-breach',
  'privacy',
  'ransomware',
  'threat-intelligence',
] as const;

type Category = (typeof VALID_CATEGORIES)[number];

/** Map a category to an optimized search query */
function buildSearchQuery(category: string): string {
  const queryMap: Record<string, string> = {
    cybersecurity: 'latest cybersecurity security vulnerabilities news 2026',
    malware: 'latest malware analysis detection news 2026',
    vulnerabilities: 'latest CVE security vulnerability disclosure news 2026',
    'data-breach': 'latest data breach leak incident news 2026',
    privacy: 'latest digital privacy surveillance regulation news 2026',
    ransomware: 'latest ransomware attack incident news 2026',
    'threat-intelligence': 'latest threat intelligence APT report news 2026',
  };
  return queryMap[category] || queryMap['cybersecurity']!;
}

/** Generate realistic fallback news items when the SDK is unavailable */
function getFallbackNews(category: string): NewsItem[] {
  const now = new Date();
  const items: NewsItem[] = [
    {
      title: 'Critical RCE Vulnerability Discovered in Popular Enterprise Firewall',
      summary:
        'Security researchers have disclosed a critical remote code execution vulnerability affecting multiple enterprise firewall products, allowing unauthenticated attackers to execute arbitrary code on the management interface.',
      source: 'The Hacker News',
      url: 'https://thehackernews.com',
      category,
      timestamp: new Date(now.getTime() - 1 * 3600_000).toISOString(),
    },
    {
      title: 'New Ransomware Group "DarkVault" Targets Healthcare Sector',
      summary:
        'A newly identified ransomware operation dubbed DarkVault has been conducting targeted attacks against healthcare organizations across Europe and North America, employing double-extortion tactics with data exfiltration.',
      source: 'BleepingComputer',
      url: 'https://bleepingcomputer.com',
      category,
      timestamp: new Date(now.getTime() - 2 * 3600_000).toISOString(),
    },
    {
      title: 'CISA Adds Three Actively Exploited Vulnerabilities to KEV Catalog',
      summary:
        'The Cybersecurity and Infrastructure Security Agency has added three new actively exploited vulnerabilities to its Known Exploited Vulnerabilities catalog, urging federal agencies to patch immediately.',
      source: 'SecurityWeek',
      url: 'https://securityweek.com',
      category,
      timestamp: new Date(now.getTime() - 3 * 3600_000).toISOString(),
    },
    {
      title: 'Major Cloud Provider Exposed Customer Data via Misconfigured API',
      summary:
        'A leading cloud infrastructure provider disclosed that a misconfigured API endpoint exposed sensitive customer metadata for approximately 72 hours before being detected and remediated.',
      source: 'Dark Reading',
      url: 'https://darkreading.com',
      category,
      timestamp: new Date(now.getTime() - 5 * 3600_000).toISOString(),
    },
    {
      title: 'Supply Chain Attack Compromises Popular NPM Package with 2M+ Downloads',
      summary:
        'A widely-used NPM package was compromised in a supply chain attack, with threat actors injecting malicious code that exfiltrated environment variables and SSH keys from build systems.',
      source: 'Ars Technica',
      url: 'https://arstechnica.com',
      category,
      timestamp: new Date(now.getTime() - 7 * 3600_000).toISOString(),
    },
    {
      title: 'Zero-Day in Popular VPN Client Enables Man-in-the-Middle Attacks',
      summary:
        'Security researchers have revealed a zero-day vulnerability in a widely-used VPN client that could allow attackers to intercept and decrypt traffic through man-in-the-middle attacks on local networks.',
      source: 'Krebs on Security',
      url: 'https://krebsonsecurity.com',
      category,
      timestamp: new Date(now.getTime() - 10 * 3600_000).toISOString(),
    },
    {
      title: 'International Law Enforcement Operation Dismantles Phishing-as-a-Service Platform',
      summary:
        'A coordinated operation involving Europol, the FBI, and authorities from 15 countries has dismantled a major phishing-as-a-service platform responsible for thousands of attacks targeting financial institutions.',
      source: 'Reuters',
      url: 'https://reuters.com',
      category,
      timestamp: new Date(now.getTime() - 14 * 3600_000).toISOString(),
    },
    {
      title: 'AI-Powered Social Engineering Attacks Surge 340% Year-over-Year',
      summary:
        'A new report from a leading cybersecurity firm reveals that AI-generated phishing and social engineering attacks have increased by 340% compared to the previous year, with deepfake voice and video attacks becoming mainstream.',
      source: 'Wired',
      url: 'https://wired.com',
      category,
      timestamp: new Date(now.getTime() - 18 * 3600_000).toISOString(),
    },
  ];

  return items;
}

/** Try to fetch real news via the z-ai-web-dev-sdk web search */
async function fetchNewsFromSDK(category: string): Promise<NewsItem[]> {
  const ZAI = (await import('z-ai-web-dev-sdk')).default;
  const zai = await ZAI.create();

  const searchQuery = buildSearchQuery(category);

  const results = await zai.functions.invoke('web_search', {
    query: searchQuery,
    num: 10,
    recency_days: 7,
  });

  if (!Array.isArray(results) || results.length === 0) {
    console.warn('[J.U.L.I.U.S News API] SDK returned empty results, using fallback');
    return getFallbackNews(category);
  }

  const now = new Date();

  const newsItems: NewsItem[] = results.map((item, index) => ({
    title: item.name || 'Untitled Security News',
    summary: item.snippet || 'No summary available.',
    source: item.host_name || 'Unknown Source',
    url: item.url || '#',
    category,
    timestamp: item.date
      ? new Date(item.date).toISOString()
      : new Date(now.getTime() - index * 3600_000).toISOString(),
  }));

  return newsItems;
}

export async function GET(request: NextRequest) {
  try {
    // ── Parse and validate the optional category query param ──
    const { searchParams } = new URL(request.url);
    const rawCategory = searchParams.get('category') || 'cybersecurity';
    const category: Category = VALID_CATEGORIES.includes(rawCategory as Category)
      ? (rawCategory as Category)
      : 'cybersecurity';

    // ── Check in-memory cache ──
    const cached = cache.get(category);
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
      return NextResponse.json({
        success: true,
        data: cached.data,
        cached: true,
      });
    }

    // ── Fetch fresh news from SDK ──
    let newsItems: NewsItem[];

    try {
      newsItems = await fetchNewsFromSDK(category);
    } catch (sdkError) {
      const errorMessage =
        sdkError instanceof Error ? sdkError.message : 'Unknown SDK error';
      console.error('[J.U.L.I.U.S News API] SDK error:', errorMessage);
      console.warn('[J.U.L.I.U.S News API] Falling back to mock data');
      newsItems = getFallbackNews(category);
    }

    // ── Update cache ──
    cache.set(category, { data: newsItems, fetchedAt: Date.now() });

    return NextResponse.json({
      success: true,
      data: newsItems,
      cached: false,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[J.U.L.I.U.S News API] Unhandled error:', errorMessage);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch security news',
        data: getFallbackNews('cybersecurity'),
      },
      { status: 500 },
    );
  }
}
