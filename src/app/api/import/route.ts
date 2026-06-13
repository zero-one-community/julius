import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface LinkInput {
  name?: string;
  url?: string;
  description?: string;
  category?: string;
  level?: string;
  tags?: string;
  starred?: boolean;
  active?: boolean;
}

interface BlockedResourceInput {
  domain?: string;
  reason?: string;
  category?: string;
  active?: boolean;
  hits?: number;
}

interface PrivacySettingInput {
  settingKey?: string;
  settingValue?: string;
  description?: string;
}

interface SecurityLogInput {
  eventType?: string;
  ipAddress?: string;
  isp?: string;
  country?: string;
  city?: string;
  isVpn?: boolean;
  isProxy?: boolean;
  isTor?: boolean;
  riskLevel?: string;
  details?: string;
  action?: string;
}

interface ImportPayload {
  version?: string;
  links?: LinkInput[];
  blockedResources?: BlockedResourceInput[];
  privacySettings?: PrivacySettingInput[];
  securityLogs?: SecurityLogInput[];
}

// POST — Import data from a JSON structure matching the export format
export async function POST(request: NextRequest) {
  try {
    const body: ImportPayload = await request.json();

    // Validate top-level structure
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Invalid import data: expected a JSON object' },
        { status: 400 }
      );
    }

    if (body.version && body.version !== '2.0') {
      return NextResponse.json(
        { success: false, error: `Unsupported export version: ${body.version}. Only version 2.0 is supported.` },
        { status: 400 }
      );
    }

    const summary = {
      linksImported: 0,
      linksSkipped: 0,
      blockedResourcesImported: 0,
      blockedResourcesSkipped: 0,
      privacySettingsImported: 0,
      privacySettingsSkipped: 0,
      securityLogsImported: 0,
      securityLogsSkipped: 0,
    };

    // --- Import Links ---
    if (Array.isArray(body.links)) {
      for (const link of body.links) {
        if (!link.name || !link.url) {
          summary.linksSkipped++;
          continue;
        }
        try {
          await db.link.create({
            data: {
              name: link.name,
              url: link.url,
              description: link.description || '',
              category: link.category || 'general',
              level: link.level || 'L1',
              tags: link.tags || '',
              starred: link.starred ?? false,
              active: link.active ?? true,
            },
          });
          summary.linksImported++;
        } catch (err) {
          console.error('[Import Link Error]', err);
          summary.linksSkipped++;
        }
      }
    }

    // --- Import Blocked Resources (find by domain, then update or create) ---
    if (Array.isArray(body.blockedResources)) {
      for (const resource of body.blockedResources) {
        if (!resource.domain) {
          summary.blockedResourcesSkipped++;
          continue;
        }
        try {
          const existing = await db.blockedResource.findFirst({
            where: { domain: resource.domain },
          });
          if (existing) {
            await db.blockedResource.update({
              where: { id: existing.id },
              data: {
                reason: resource.reason || existing.reason,
                category: resource.category || existing.category,
                active: resource.active ?? existing.active,
                hits: resource.hits ?? existing.hits,
              },
            });
          } else {
            await db.blockedResource.create({
              data: {
                domain: resource.domain,
                reason: resource.reason || 'user-blocked',
                category: resource.category || 'custom',
                active: resource.active ?? true,
                hits: resource.hits ?? 0,
              },
            });
          }
          summary.blockedResourcesImported++;
        } catch (err) {
          console.error('[Import BlockedResource Error]', err);
          summary.blockedResourcesSkipped++;
        }
      }
    }

    // --- Import Privacy Settings (upsert by settingKey) ---
    if (Array.isArray(body.privacySettings)) {
      for (const setting of body.privacySettings) {
        if (!setting.settingKey) {
          summary.privacySettingsSkipped++;
          continue;
        }
        try {
          await db.privacySetting.upsert({
            where: { settingKey: setting.settingKey },
            update: {
              settingValue: setting.settingValue || 'enabled',
              description: setting.description || null,
            },
            create: {
              settingKey: setting.settingKey,
              settingValue: setting.settingValue || 'enabled',
              description: setting.description || null,
            },
          });
          summary.privacySettingsImported++;
        } catch (err) {
          console.error('[Import PrivacySetting Error]', err);
          summary.privacySettingsSkipped++;
        }
      }
    }

    // --- Import Security Logs (create only — logs are append-only) ---
    if (Array.isArray(body.securityLogs)) {
      for (const log of body.securityLogs) {
        if (!log.eventType) {
          summary.securityLogsSkipped++;
          continue;
        }
        try {
          await db.securityLog.create({
            data: {
              eventType: log.eventType,
              ipAddress: log.ipAddress || null,
              isp: log.isp || null,
              country: log.country || null,
              city: log.city || null,
              isVpn: log.isVpn ?? false,
              isProxy: log.isProxy ?? false,
              isTor: log.isTor ?? false,
              riskLevel: log.riskLevel || 'low',
              details: log.details || null,
              action: log.action || null,
            },
          });
          summary.securityLogsImported++;
        } catch (err) {
          console.error('[Import SecurityLog Error]', err);
          summary.securityLogsSkipped++;
        }
      }
    }

    // Log the import event
    await db.securityLog.create({
      data: {
        eventType: 'privacy_alert',
        details: JSON.stringify({
          action: 'data_import',
          summary,
        }),
        riskLevel: 'low',
        action: 'allowed',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Data import completed',
      summary,
    });
  } catch (error) {
    console.error('[Import POST Error]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to import data' },
      { status: 500 }
    );
  }
}
