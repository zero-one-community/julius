import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || 'cybersecurity latest news';
    
    // Use z-ai-web-dev-sdk for web search
    const ZAI = (await import('z-ai-web-dev-sdk')).default;
    const zai = await ZAI.create();
    
    const searchResults = await zai.functions.invoke('web_search', {
      query: query,
      num: 10,
      recency_days: 7,
    });
    
    return NextResponse.json({
      success: true,
      data: searchResults,
    });
  } catch (error) {
    console.error('News search error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const query = body.query || 'cybersecurity latest news';
    
    const ZAI = (await import('z-ai-web-dev-sdk')).default;
    const zai = await ZAI.create();
    
    const searchResults = await zai.functions.invoke('web_search', {
      query: query,
      num: 10,
      recency_days: 7,
    });
    
    return NextResponse.json({
      success: true,
      data: searchResults,
    });
  } catch (error) {
    console.error('News search error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}
