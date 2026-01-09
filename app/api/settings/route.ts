import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET settings
export async function GET() {
  try {
    const settings = await prisma.systemSettings.findMany();

    // Convert array to object
    const settingsObj: any = {};
    settings.forEach((setting) => {
      settingsObj[setting.key] = setting.value;
    });

    return NextResponse.json(settingsObj);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// POST/UPDATE settings
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Update each setting
    for (const [key, value] of Object.entries(body)) {
      await prisma.systemSettings.upsert({
        where: { key },
        update: { value: value as string },
        create: {
          key,
          value: value as string,
          description: `System setting for ${key}`,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    );
  }
}
