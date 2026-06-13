import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Seed default privacy settings if none exist
async function seedPrivacySettings() {
  const count = await db.privacySetting.count();
  if (count > 0) return;

  const defaults = [
    { settingKey: 'vpn_enforcement', settingValue: 'disabled', description: 'Enforce VPN connection for all browsing' },
    { settingKey: 'dns_over_https', settingValue: 'enabled', description: 'Use DNS-over-HTTPS to prevent DNS leaks' },
    { settingKey: 'tracker_blocking', settingValue: 'enabled', description: 'Block known tracking domains' },
    { settingKey: 'ad_blocking', settingValue: 'enabled', description: 'Block advertisement domains' },
    { settingKey: 'webrtc_leak_protection', settingValue: 'enabled', description: 'Prevent WebRTC from leaking real IP' },
    { settingKey: 'canvas_fingerprint_protection', settingValue: 'disabled', description: 'Randomize canvas fingerprint' },
    { settingKey: 'auto_https', settingValue: 'enabled', description: 'Upgrade HTTP connections to HTTPS' },
    { settingKey: 'tor_routing', settingValue: 'disabled', description: 'Route traffic through Tor network' },
  ];

  await db.privacySetting.createMany({ data: defaults });
}

// GET — Return security logs, blocked resources count, and privacy settings
export async function GET() {
  try {
    await seedPrivacySettings();

    const [logs, blockedResources, privacySettings] = await Promise.all([
      db.securityLog.findMany({
        take: 50,
        orderBy: { createdAt: 'desc' },
      }),
      db.blockedResource.findMany({
        where: { active: true },
      }),
      db.privacySetting.findMany(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        logs,
        blockedCount: blockedResources.length,
        blockedResources,
        privacySettings,
      },
    });
  } catch (error) {
    console.error('[Security GET Error]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch security data' },
      { status: 500 }
    );
  }
}

// POST — Actions based on `action` field
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'block': {
        const { domain, reason, category } = body;
        if (!domain) {
          return NextResponse.json(
            { success: false, error: 'Domain is required' },
            { status: 400 }
          );
        }

        // Upsert so we don't duplicate
        const blocked = await db.blockedResource.upsert({
          where: { domain },
          update: { reason: reason || 'user-blocked', category: category || 'custom', active: true },
          create: { domain, reason: reason || 'user-blocked', category: category || 'custom', active: true },
        });

        await db.securityLog.create({
          data: {
            eventType: 'block_applied',
            details: JSON.stringify({ domain, reason, category }),
            action: 'blocked',
          },
        });

        return NextResponse.json({ success: true, data: blocked }, { status: 201 });
      }

      case 'unblock': {
        const { domain } = body;
        if (!domain) {
          return NextResponse.json(
            { success: false, error: 'Domain is required' },
            { status: 400 }
          );
        }

        const existing = await db.blockedResource.findUnique({ where: { domain } });
        if (!existing) {
          return NextResponse.json(
            { success: false, error: 'Domain not found in blocked resources' },
            { status: 404 }
          );
        }

        await db.blockedResource.update({
          where: { domain },
          data: { active: false },
        });

        await db.securityLog.create({
          data: {
            eventType: 'block_applied',
            details: JSON.stringify({ domain, action: 'unblocked' }),
            action: 'allowed',
          },
        });

        return NextResponse.json({ success: true, message: `Domain ${domain} unblocked` });
      }

      case 'tunnel': {
        const { details } = body;

        await db.securityLog.create({
          data: {
            eventType: 'tunnel_created',
            details: details ? JSON.stringify(details) : null,
            action: 'tunneled',
          },
        });

        return NextResponse.json({ success: true, message: 'Tunnel creation logged' }, { status: 201 });
      }

      case 'scan': {
        // Run a security scan simulation
        const [activeLogs, blockedResources, privacySettings, openSessions] = await Promise.all([
          db.securityLog.count({
            where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
          }),
          db.blockedResource.count({ where: { active: true } }),
          db.privacySetting.findMany(),
          db.surfSession.count({ where: { status: 'active' } }),
        ]);

        // Calculate security score based on various factors
        let score = 50; // Base score

        // Privacy settings contribution (up to +30)
        const enabledPrivacy = privacySettings.filter(
          (s) => s.settingValue === 'enabled' && ['vpn_enforcement', 'dns_over_https', 'tracker_blocking', 'ad_blocking', 'webrtc_leak_protection', 'auto_https'].includes(s.settingKey)
        ).length;
        score += enabledPrivacy * 5;

        // Blocked resources are good (+2 each, up to +10)
        score += Math.min(blockedResources, 5) * 2;

        // Active sessions are a minor risk (-5 each, up to -15)
        score -= Math.min(openSessions, 3) * 5;

        // Recent security events can indicate issues (-2 each, up to -10)
        if (activeLogs > 10) score -= Math.min(activeLogs - 10, 5) * 2;

        // Clamp
        score = Math.max(0, Math.min(100, score));

        const findings: string[] = [];

        if (enabledPrivacy < 4) {
          findings.push('Multiple privacy settings are disabled — enable DNS-over-HTTPS, tracker blocking, and ad blocking');
        }
        if (openSessions > 0) {
          findings.push(`${openSessions} active surf session(s) detected — close unused sessions`);
        }
        const vpnSetting = privacySettings.find((s) => s.settingKey === 'vpn_enforcement');
        if (vpnSetting && vpnSetting.settingValue === 'disabled') {
          findings.push('VPN enforcement is disabled — your IP may be exposed');
        }
        const torSetting = privacySettings.find((s) => s.settingKey === 'tor_routing');
        if (torSetting && torSetting.settingValue === 'enabled') {
          findings.push('Tor routing is active — ensure it is configured correctly');
        }
        if (activeLogs > 5) {
          findings.push(`${activeLogs} security events in the last 24 hours — review logs for anomalies`);
        }
        if (blockedResources === 0) {
          findings.push('No blocked resources configured — add known trackers and ad domains');
        }

        let statusLabel: string;
        if (score >= 80) statusLabel = 'secure';
        else if (score >= 60) statusLabel = 'moderate';
        else if (score >= 40) statusLabel = 'vulnerable';
        else statusLabel = 'critical';

        await db.securityLog.create({
          data: {
            eventType: 'privacy_alert',
            details: JSON.stringify({ score, statusLabel, findings }),
            riskLevel: score >= 60 ? 'low' : score >= 40 ? 'medium' : 'high',
            action: 'warned',
          },
        });

        return NextResponse.json({
          success: true,
          data: {
            score,
            status: statusLabel,
            findings,
            checks: {
              privacySettingsEnabled: enabledPrivacy,
              privacySettingsTotal: privacySettings.length,
              blockedResources,
              activeSessions: openSessions,
              recentSecurityEvents: activeLogs,
            },
          },
        });
      }

      case 'update_privacy': {
        const { settingKey, settingValue } = body;
        if (!settingKey) {
          return NextResponse.json(
            { success: false, error: 'settingKey is required' },
            { status: 400 }
          );
        }

        const setting = await db.privacySetting.upsert({
          where: { settingKey },
          update: { settingValue: settingValue || 'enabled' },
          create: { settingKey, settingValue: settingValue || 'enabled' },
        });

        await db.securityLog.create({
          data: {
            eventType: 'privacy_alert',
            details: JSON.stringify({ settingKey, settingValue, action: 'updated' }),
            action: 'allowed',
          },
        });

        return NextResponse.json({ success: true, data: setting });
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}. Valid actions: block, unblock, tunnel, scan, update_privacy` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('[Security POST Error]', error);
    return NextResponse.json(
      { success: false, error: 'Security operation failed' },
      { status: 500 }
    );
  }
}
