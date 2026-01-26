'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AISettingsPage() {
  const [provider, setProvider] = useState('openai');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gpt-4-turbo-preview');
  const [temperature, setTemperature] = useState(0.7);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [testLoading, setTestLoading] = useState(false);

  // تحميل الإعدادات المحفوظة
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/admin/ai-settings-v2');
      if (response.ok) {
        const data = await response.json();
        if (data.provider) setProvider(data.provider);
        if (data.model) setModel(data.model);
        if (data.temperature !== undefined) setTemperature(data.temperature);
        // لا نحمل API key لأسباب أمنية، لكن نعرض آخر 4 أحرف إذا كانت موجودة
        if (data.apiKey && data.apiKey !== '') {
          setApiKey(''); // نبقي الحقل فارغاً
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const getModelsByProvider = () => {
    if (provider === 'claude') {
      return [
        { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet (أحدث)' },
        { value: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku (سريع ورخيص)' },
        { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus' },
        { value: 'claude-3-sonnet-20240229', label: 'Claude 3 Sonnet' },
      ];
    }
    return [
      { value: 'gpt-4-turbo-preview', label: 'GPT-4 Turbo' },
      { value: 'gpt-4', label: 'GPT-4' },
      { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
      { value: 'gpt-4o', label: 'GPT-4o' },
    ];
  };

  const handleTest = async () => {
    if (!apiKey || apiKey.trim() === '') {
      setMessage('❌ الرجاء إدخال API Key أولاً');
      return;
    }

    setTestLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/test-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey, model, provider }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✅ الاتصال ناجح! ' + data.message);
      } else {
        setMessage('❌ فشل الاتصال: ' + (data.error || 'خطأ غير معروف'));
      }
    } catch (error: any) {
      setMessage('❌ حدث خطأ: ' + error.message);
    } finally {
      setTestLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/ai-settings-v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey, model, temperature, provider }),
      });

      if (response.ok) {
        setMessage('✅ تم حفظ الإعدادات بنجاح!');
      } else {
        setMessage('❌ حدث خطأ في حفظ الإعدادات');
      }
    } catch (error) {
      setMessage('❌ حدث خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/secret-admin-panel-xyz/dashboard" className="text-blue-600 hover:underline">
            ← العودة للوحة التحكم
          </Link>
          <h1 className="text-3xl font-bold mt-4">⚙️ إعدادات الذكاء الاصطناعي</h1>
        </div>

        <form onSubmit={handleSave} className="bg-white rounded-lg shadow p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">🤖 مزود الذكاء الاصطناعي</label>
            <select
              value={provider}
              onChange={(e) => {
                setProvider(e.target.value);
                // تحديث النموذج الافتراضي عند تغيير المزود
                if (e.target.value === 'claude') {
                  setModel('claude-3-5-sonnet-20241022');
                } else {
                  setModel('gpt-4-turbo-preview');
                }
              }}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="openai">OpenAI (GPT)</option>
              <option value="claude">Anthropic (Claude)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              🔑 {provider === 'claude' ? 'Claude' : 'OpenAI'} API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={provider === 'claude' ? 'sk-ant-...' : 'sk-...'}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              احصل على المفتاح من {' '}
              {provider === 'claude' ? (
                <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer" className="text-blue-600">
                  console.anthropic.com
                </a>
              ) : (
                <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600">
                  platform.openai.com
                </a>
              )}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">🤖 النموذج</label>
            <select value={model} onChange={(e) => setModel(e.target.value)} className="w-full px-4 py-2 border rounded-lg">
              {getModelsByProvider().map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">🌡️ Temperature: {temperature}</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          {message && (
            <div className={`p-4 rounded-lg ${message.startsWith('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {message}
            </div>
          )}

          <div className="flex gap-4">
            <button type="button" onClick={handleTest} disabled={testLoading} className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50">
              {testLoading ? 'جاري الاختبار...' : '🧪 اختبار الاتصال'}
            </button>
            <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'جاري الحفظ...' : '💾 حفظ الإعدادات'}
            </button>
          </div>
        </form>

        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">الميزات التي ستُفعّل:</h2>
          <ul className="space-y-3">
            <li>🔍 أين ورد النص؟ - البحث في جميع الكتب</li>
            <li>📖 جلب النص الذكي - البحث الدلالي</li>
            <li>🤖 المحادثة الذكية - مساعد AI</li>
            <li>✨ الشرح والتلخيص</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
