'use client';

import { useState, useRef, useEffect } from 'react';

interface AIChatProps {
  onClose: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIChat({ onClose }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: inputValue };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    // محاكاة رد AI
    setTimeout(() => {
      const aiResponse: Message = {
        role: 'assistant',
        content: getSmartResponse(inputValue)
      };
      setMessages((prev) => [...prev, aiResponse]);
      setLoading(false);
    }, 1000);
  };

  const getSmartResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();

    if (message.includes('معنى') || message.includes('شرح')) {
      return 'معنى هذا النص يشير إلى العظمة والحكمة الإلهية في النص القرآني والنبوي. وللعلماء تفسيرات متعددة حول هذا الموضوع.\n\nإذا أردت معرفة المزيد، يمكنك البحث عن نصوص مشابهة في المكتبة.';
    }

    if (message.includes('حديث') || message.includes('آية')) {
      return 'هذا موضوع مهم يتعلق بالنصوص الإسلامية الشريفة. كما ورد في كتب التفسير والحديث المختلفة.\n\nهناك أحاديث وآيات أخرى ذات صلة بهذا الموضوع.';
    }

    return 'شكراً على سؤالك. هذا موضوع مهم يستحق التأمل والدراسة العميقة. ينصح بمراجعة كتب التفسير للحصول على فهم أعمق.';
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={containerStyle} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={headerStyle}>
          <div>
            <h2 style={{ margin: 0, fontSize: 'var(--font-size-lg)', fontWeight: 600 }}>
              المساعد الذكي
            </h2>
            <p style={{ margin: 'var(--spacing-xs) 0 0 0', opacity: 0.9, fontSize: 'var(--font-size-sm)' }}>
              استفسر عن أي نص قرآني أو حديثي
            </p>
          </div>
          <button onClick={onClose} style={closeButtonStyle}>
            &times;
          </button>
        </div>

        {/* Messages */}
        <div style={messagesStyle}>
          {messages.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '64px', marginBottom: 'var(--spacing-lg)' }}>🤖</div>
              <h3 style={{ color: 'var(--text-primary)', margin: '0 0 var(--spacing-sm) 0' }}>
                مرحباً! أنا مساعدك الذكي
              </h3>
              <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', maxWidth: '300px', lineHeight: 1.6 }}>
                يمكنك أن تسأل عن أي نص إسلامي أو تطلب مني شرح وتفسير الآيات والأحاديث
              </p>
            </div>
          ) : (
            <>
              {messages.map((message, idx) => (
                <div key={idx} style={message.role === 'user' ? userMessageStyle : aiMessageStyle}>
                  <div style={{ fontSize: '24px', flexShrink: 0 }}>
                    {message.role === 'user' ? '👤' : '🤖'}
                  </div>
                  <div style={messageContentStyle(message.role)}>
                    <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                      {message.content}
                    </p>
                  </div>
                </div>
              ))}

              {loading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', padding: 'var(--spacing-md)' }}>
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <span style={typingDotStyle}></span>
                    <span style={{ ...typingDotStyle, animationDelay: '0.2s' }}></span>
                    <span style={{ ...typingDotStyle, animationDelay: '0.4s' }}></span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        <div style={inputAreaStyle}>
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
            <input
              type="text"
              className="input"
              placeholder="اكتب سؤالك هنا..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              style={{ flex: 1 }}
            />
            <button
              onClick={handleSend}
              disabled={loading || !inputValue.trim()}
              style={sendButtonStyle}
            >
              ➤
            </button>
          </div>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', margin: 0 }}>
            اضغط Enter أو انقر الزر للإرسال
          </p>
        </div>
      </div>
    </div>
  );
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0, 0, 0, 0.5)',
  backdropFilter: 'blur(4px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 6100
};

const containerStyle: React.CSSProperties = {
  background: 'var(--bg-secondary)',
  border: '1px solid var(--border-color)',
  borderRadius: 'var(--radius-2xl)',
  width: '90%',
  maxWidth: '600px',
  height: '80vh',
  maxHeight: '600px',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: 'var(--shadow-xl)'
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: 'var(--spacing-lg)',
  borderBottom: '1px solid var(--border-color)',
  background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-dark) 100%)',
  borderRadius: 'var(--radius-2xl) var(--radius-2xl) 0 0',
  color: 'white'
};

const closeButtonStyle: React.CSSProperties = {
  width: '32px',
  height: '32px',
  border: 'none',
  background: 'rgba(255, 255, 255, 0.2)',
  color: 'white',
  fontSize: '24px',
  cursor: 'pointer',
  borderRadius: 'var(--radius-md)'
};

const messagesStyle: React.CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  padding: 'var(--spacing-lg)',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--spacing-md)'
};

const userMessageStyle: React.CSSProperties = {
  display: 'flex',
  gap: 'var(--spacing-md)',
  justifyContent: 'flex-end',
  flexDirection: 'row-reverse'
};

const aiMessageStyle: React.CSSProperties = {
  display: 'flex',
  gap: 'var(--spacing-md)'
};

const messageContentStyle = (role: string): React.CSSProperties => ({
  maxWidth: '75%',
  background: role === 'user' ? 'var(--accent-primary)' : 'var(--accent-light)',
  color: role === 'user' ? 'white' : 'inherit',
  borderRadius: 'var(--radius-lg)',
  padding: 'var(--spacing-md) var(--spacing-lg)',
  border: role === 'assistant' ? '1px solid var(--border-color)' : 'none'
});

const inputAreaStyle: React.CSSProperties = {
  padding: 'var(--spacing-lg)',
  borderTop: '1px solid var(--border-color)',
  background: 'var(--bg-secondary)'
};

const sendButtonStyle: React.CSSProperties = {
  width: '44px',
  height: '44px',
  padding: 0,
  background: 'var(--accent-primary)',
  border: 'none',
  borderRadius: 'var(--radius-lg)',
  color: 'white',
  fontSize: '18px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const typingDotStyle: React.CSSProperties = {
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  background: 'var(--accent-primary)',
  animation: 'typing 1.4s infinite'
};
