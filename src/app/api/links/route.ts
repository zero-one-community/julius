import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { readFileSync } from 'fs';
import { join } from 'path';

// Seed links from JSON if DB is empty
async function seedIfNeeded() {
  const count = await db.link.count();
  if (count > 0) return;

  try {
    const filePath = join(process.cwd(), 'src/data/links.json');
    const raw = readFileSync(filePath, 'utf-8');
    const { links } = JSON.parse(raw) as {
      links: Array<{
        name: string;
        url: string;
        description: string;
        category: string;
        level: string;
        tags: string[];
        starred: boolean;
        active: boolean;
      }>;
    };

    await db.link.createMany({
      data: links.map((l) => ({
        name: l.name,
        url: l.url,
        description: l.description,
        category: l.category,
        level: l.level,
        tags: Array.isArray(l.tags) ? l.tags.join(',') : l.tags,
        starred: l.starred,
        active: l.active,
      })),
    });
  } catch (err) {
    console.error('[Links Seed Error]', err);
  }
}

// GET — Return all links, with optional filters
export async function GET(request: NextRequest) {
  try {
    await seedIfNeeded();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const level = searchParams.get('level');
    const starred = searchParams.get('starred');

    const where: Record<string, unknown> = {};
    if (category) where.category = category;
    if (level) where.level = level;
    if (starred === 'true') where.starred = true;

    const links = await db.link.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: links });
  } catch (error) {
    console.error('[Links GET Error]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch links' },
      { status: 500 }
    );
  }
}

// POST — Add a new link or batch of links
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Batch mode: { links: [...] }
    if (Array.isArray(body.links) && body.links.length > 0) {
      const validLinks = body.links.filter(
        (l: Record<string, unknown>) => l.name && l.url
      );

      if (validLinks.length === 0) {
        return NextResponse.json(
          { success: false, error: 'No valid links provided. Each link requires name and url.' },
          { status: 400 }
        );
      }

      const created = await db.link.createMany({
        data: validLinks.map((l: Record<string, unknown>) => ({
          name: String(l.name),
          url: String(l.url),
          description: String(l.description || ''),
          category: String(l.category || 'general'),
          level: String(l.level || 'L1'),
          tags: Array.isArray(l.tags) ? (l.tags as string[]).join(',') : String(l.tags || ''),
        })),
      });

      return NextResponse.json(
        { success: true, data: { count: created.count }, batch: true },
        { status: 201 }
      );
    }

    // Single link mode
    const { name, url, description, category, level, tags } = body;

    if (!name || !url) {
      return NextResponse.json(
        { success: false, error: 'Name and URL are required' },
        { status: 400 }
      );
    }

    const link = await db.link.create({
      data: {
        name,
        url,
        description: description || '',
        category: category || 'general',
        level: level || 'L1',
        tags: Array.isArray(tags) ? tags.join(',') : (tags || ''),
      },
    });

    return NextResponse.json({ success: true, data: link }, { status: 201 });
  } catch (error) {
    console.error('[Links POST Error]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create link' },
      { status: 500 }
    );
  }
}

// PATCH — Update a link (including starred toggle)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Link ID is required' },
        { status: 400 }
      );
    }

    // Convert tags array to comma-separated string if provided as array
    if (updates.tags && Array.isArray(updates.tags)) {
      updates.tags = updates.tags.join(',');
    }

    const link = await db.link.update({
      where: { id },
      data: updates,
    });

    return NextResponse.json({ success: true, data: link });
  } catch (error) {
    console.error('[Links PATCH Error]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update link' },
      { status: 500 }
    );
  }
}

// DELETE — Delete a link
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Link ID is required' },
        { status: 400 }
      );
    }

    await db.link.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Link deleted' });
  } catch (error) {
    console.error('[Links DELETE Error]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete link' },
      { status: 500 }
    );
  }
}
