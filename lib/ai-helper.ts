import { prisma } from '@/lib/prisma';

export interface AISettings {
  provider: 'openai' | 'claude';
  apiKey: string | null;
  model: string;
  temperature: number;
}

export async function getAISettings(): Promise<AISettings> {
  const apiKey = await prisma.$queryRaw`SELECT * FROM settings WHERE key = 'ai_api_key' LIMIT 1`;
  const model = await prisma.$queryRaw`SELECT * FROM settings WHERE key = 'ai_model' LIMIT 1`;
  const temperature = await prisma.$queryRaw`SELECT * FROM settings WHERE key = 'ai_temperature' LIMIT 1`;
  const provider = await prisma.$queryRaw`SELECT * FROM settings WHERE key = 'ai_provider' LIMIT 1`;

  return {
    provider: Array.isArray(provider) && provider.length > 0 ? (provider[0] as any).value : 'openai',
    apiKey: Array.isArray(apiKey) && apiKey.length > 0 ? (apiKey[0] as any).value : null,
    model: Array.isArray(model) && model.length > 0 ? (model[0] as any).value : 'gpt-4-turbo-preview',
    temperature: Array.isArray(temperature) && temperature.length > 0 ? parseFloat((temperature[0] as any).value) : 0.7,
  };
}

export async function callAI(messages: Array<{ role: string; content: string }>, settings?: AISettings) {
  const aiSettings = settings || await getAISettings();

  if (!aiSettings.apiKey) {
    throw new Error('API key not configured');
  }

  if (aiSettings.provider === 'claude') {
    return await callClaude(messages, aiSettings);
  } else {
    return await callOpenAI(messages, aiSettings);
  }
}

async function callOpenAI(messages: Array<{ role: string; content: string }>, settings: AISettings) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${settings.apiKey}`,
    },
    body: JSON.stringify({
      model: settings.model,
      messages,
      temperature: settings.temperature,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'OpenAI API error');
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

async function callClaude(messages: Array<{ role: string; content: string }>, settings: AISettings) {
  // تحويل الرسائل إلى تنسيق Claude
  const systemMessage = messages.find(m => m.role === 'system');
  const userMessages = messages.filter(m => m.role !== 'system');

  // Claude يحتاج تنسيق مختلف للرسائل
  const claudeMessages = userMessages.map(m => ({
    role: m.role === 'user' ? 'user' : 'assistant',
    content: m.content,
  }));

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': settings.apiKey!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: settings.model,
      messages: claudeMessages,
      system: systemMessage?.content || '',
      temperature: settings.temperature,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Claude API error');
  }

  const data = await response.json();
  return data.content[0]?.text || '';
}
