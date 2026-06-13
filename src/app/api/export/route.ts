import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET — Export all links and security settings as a downloadable JSON file
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeLogs = searchParams.get('includeLogs') !== 'false'; // default true

    const [links, blockedResources, privacySettings, securityLogs] = await Promise.all([
      db.link.findMany({ orderBy: { createdAt: 'desc' } }),
      db.blockedResource.findMany({ orderBy: { createdAt: 'desc' } }),
      db.privacySetting.findMany({ orderBy: { settingKey: 'asc' } }),
      includeLogs
        ? db.securityLog.findMany({ orderBy: { createdAt: 'desc' } })
        : Promise.resolve([]),
    ]);

    const exportData = {
      version: '2.0',
      exportDate: new Date().toISOString(),
      links,
      blockedResources,
      privacySettings,
      securityLogs,
    };

    const filename = `julius-export-${new Date().toISOString().slice(0, 10)}.json`;

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('[Export GET Error]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export data' },
      { status: 500 }
    );
  }
}
