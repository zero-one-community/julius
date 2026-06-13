import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { readFileSync } from 'fs';
import { join } from 'path';

// Seed notifications from JSON if DB is empty
async function seedIfNeeded() {
  const count = await db.notification.count();
  if (count > 0) return;

  try {
    const filePath = join(process.cwd(), 'src/data/notifications.json');
    const raw = readFileSync(filePath, 'utf-8');
    const { notifications } = JSON.parse(raw) as {
      notifications: Array<{
        title: string;
        message: string;
        type: string;
        priority: string;
        category: string;
        read: boolean;
        actionUrl?: string | null;
        actionLabel?: string | null;
      }>;
    };

    await db.notification.createMany({
      data: notifications.map((n) => ({
        title: n.title,
        message: n.message,
        type: n.type,
        priority: n.priority,
        category: n.category,
        read: n.read,
        actionUrl: n.actionUrl ?? null,
        actionLabel: n.actionLabel ?? null,
      })),
    });
  } catch (err) {
    console.error('[Notifications Seed Error]', err);
  }
}

// GET — Return all notifications
export async function GET() {
  try {
    await seedIfNeeded();
    const notifications = await db.notification.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: notifications });
  } catch (error) {
    console.error('[Notifications GET Error]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// POST — Create a new notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, message, type, priority, category, actionUrl, actionLabel } = body;

    if (!title || !message) {
      return NextResponse.json(
        { success: false, error: 'Title and message are required' },
        { status: 400 }
      );
    }

    const notification = await db.notification.create({
      data: {
        title,
        message,
        type: type || 'info',
        priority: priority || 'low',
        category: category || 'system',
        actionUrl: actionUrl || null,
        actionLabel: actionLabel || null,
      },
    });

    return NextResponse.json({ success: true, data: notification }, { status: 201 });
  } catch (error) {
    console.error('[Notifications POST Error]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}

// PATCH — Mark notification(s) as read
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, read } = body;

    if (id === 'all' || id === undefined) {
      // Mark all as read
      await db.notification.updateMany({
        where: { read: false },
        data: { read: read !== undefined ? read : true },
      });
      return NextResponse.json({ success: true, message: 'All notifications marked as read' });
    }

    // Mark single notification
    const notification = await db.notification.update({
      where: { id },
      data: { read: read !== undefined ? read : true },
    });

    return NextResponse.json({ success: true, data: notification });
  } catch (error) {
    console.error('[Notifications PATCH Error]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update notification' },
      { status: 500 }
    );
  }
}

// DELETE — Delete a notification
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Notification ID is required' },
        { status: 400 }
      );
    }

    await db.notification.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    console.error('[Notifications DELETE Error]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete notification' },
      { status: 500 }
    );
  }
}
