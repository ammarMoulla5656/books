import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';



// GET - Load AI settings
export async function GET(request: NextRequest) {
  try {
    const apiKey = await prisma.$queryRaw`SELECT * FROM settings WHERE key = 'openai_api_key' LIMIT 1`;
    const model = await prisma.$queryRaw`SELECT * FROM settings WHERE key = 'openai_model' LIMIT 1`;
    const temperature = await prisma.$queryRaw`SELECT * FROM settings WHERE key = 'openai_temperature' LIMIT 1`;

    const apiKeyValue = Array.isArray(apiKey) && apiKey.length > 0 ? (apiKey[0] as any).value : '';
    const modelValue = Array.isArray(model) && model.length > 0 ? (model[0] as any).value : 'gpt-4-turbo-preview';
    const temperatureValue = Array.isArray(temperature) && temperature.length > 0 ? parseFloat((temperature[0] as any).value) : 0.7;

    return NextResponse.json({
      apiKey: apiKeyValue ? '***' + apiKeyValue.slice(-4) : '',
      model: modelValue,
      temperature: temperatureValue,
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
    const { apiKey, model, temperature } = body;

    // Save API key
    if (apiKey && apiKey !== '') {
      const existing = await prisma.$queryRaw`SELECT * FROM settings WHERE key = 'openai_api_key' LIMIT 1`;

      if (Array.isArray(existing) && existing.length > 0) {
        await prisma.$executeRaw`UPDATE settings SET value = ${apiKey}, encrypted = true, "updatedAt" = CURRENT_TIMESTAMP WHERE key = 'openai_api_key'`;
      } else {
        await prisma.$executeRaw`INSERT INTO settings (id, key, value, encrypted, "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, 'openai_api_key', ${apiKey}, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`;
      }
    }

    // Save model
    const existingModel = await prisma.$queryRaw`SELECT * FROM settings WHERE key = 'openai_model' LIMIT 1`;

    if (Array.isArray(existingModel) && existingModel.length > 0) {
      await prisma.$executeRaw`UPDATE settings SET value = ${model}, "updatedAt" = CURRENT_TIMESTAMP WHERE key = 'openai_model'`;
    } else {
      await prisma.$executeRaw`INSERT INTO settings (id, key, value, encrypted, "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, 'openai_model', ${model}, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`;
    }

    // Save temperature
    const tempString = temperature.toString();
    const existingTemp = await prisma.$queryRaw`SELECT * FROM settings WHERE key = 'openai_temperature' LIMIT 1`;

    if (Array.isArray(existingTemp) && existingTemp.length > 0) {
      await prisma.$executeRaw`UPDATE settings SET value = ${tempString}, "updatedAt" = CURRENT_TIMESTAMP WHERE key = 'openai_temperature'`;
    } else {
      await prisma.$executeRaw`INSERT INTO settings (id, key, value, encrypted, "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, 'openai_temperature', ${tempString}, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving AI settings:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
