import { NextRequest, NextResponse } from 'next/server';
import { callAI } from '@/lib/ai-helper';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey, model, provider = 'openai' } = body;

    if (!apiKey) {
      return NextResponse.json({ error: 'API key is required' }, { status: 400 });
    }

    // Test AI API connection using the unified helper
    const testSettings = {
      provider: provider as 'openai' | 'claude',
      apiKey,
      model: model || (provider === 'claude' ? 'claude-3-5-sonnet-20241022' : 'gpt-3.5-turbo'),
      temperature: 0.7,
    };

    const message = await callAI(
      [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Say "API connection successful!"' }
      ],
      testSettings
    );

    return NextResponse.json({
      success: true,
      message: message
    });

  } catch (error: any) {
    console.error('Error testing AI:', error);
    return NextResponse.json({
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}
