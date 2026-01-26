import { NextRequest, NextResponse } from 'next/server';
import { getAISettings } from '@/lib/ai-helper';
import { prisma } from '@/lib/prisma';

// GET - Load AI settings
export async function GET(request: NextRequest) {
  try {
    const settings = await getAISettings();

    return NextResponse.json({
      apiKey: settings.apiKey ? '***' + settings.apiKey.slice(-4) : '',
      model: settings.model,
      temperature: settings.temperature,
      provider: settings.provider,
    });
  } catch (error) {
    console.error('Error loading AI settings:', error);
    return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 });
  }
}

// POST - Save AI settings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey, model, temperature, provider = 'openai' } = body;

    // Save provider
    const existingProvider = await prisma.$queryRaw`SELECT * FROM settings WHERE key = 'ai_provider' LIMIT 1`;
    if (Array.isArray(existingProvider) && existingProvider.length > 0) {
      await prisma.$executeRaw`UPDATE settings SET value = ${provider}, "updatedAt" = CURRENT_TIMESTAMP WHERE key = 'ai_provider'`;
    } else {
      await prisma.$executeRaw`INSERT INTO settings (id, key, value, encrypted, "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, 'ai_provider', ${provider}, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`;
    }

    // Save API key
    if (apiKey && apiKey !== '') {
      const existing = await prisma.$queryRaw`SELECT * FROM settings WHERE key = 'ai_api_key' LIMIT 1`;

      if (Array.isArray(existing) && existing.length > 0) {
        await prisma.$executeRaw`UPDATE settings SET value = ${apiKey}, encrypted = true, "updatedAt" = CURRENT_TIMESTAMP WHERE key = 'ai_api_key'`;
      } else {
        await prisma.$executeRaw`INSERT INTO settings (id, key, value, encrypted, "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, 'ai_api_key', ${apiKey}, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`;
      }
    }

    // Save model
    const existingModel = await prisma.$queryRaw`SELECT * FROM settings WHERE key = 'ai_model' LIMIT 1`;

    if (Array.isArray(existingModel) && existingModel.length > 0) {
      await prisma.$executeRaw`UPDATE settings SET value = ${model}, "updatedAt" = CURRENT_TIMESTAMP WHERE key = 'ai_model'`;
    } else {
      await prisma.$executeRaw`INSERT INTO settings (id, key, value, encrypted, "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, 'ai_model', ${model}, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`;
    }

    // Save temperature
    const tempString = temperature.toString();
    const existingTemp = await prisma.$queryRaw`SELECT * FROM settings WHERE key = 'ai_temperature' LIMIT 1`;

    if (Array.isArray(existingTemp) && existingTemp.length > 0) {
      await prisma.$executeRaw`UPDATE settings SET value = ${tempString}, "updatedAt" = CURRENT_TIMESTAMP WHERE key = 'ai_temperature'`;
    } else {
      await prisma.$executeRaw`INSERT INTO settings (id, key, value, encrypted, "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, 'ai_temperature', ${tempString}, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving AI settings:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
