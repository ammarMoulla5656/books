/* ===================================
   محادثة الذكاء الاصطناعي - المكتبة الإسلامية
   =================================== */

const AIChat = {
    conversationHistory: [],
    currentConversation: null,
    isLoading: false,

    /**
     * تهيئة محادثة AI
     */
    init() {
        this.loadConversations();
        console.log('AI Chat initialized');
    },

    /**
     * فتح نافذة المحادثة
     */
    open(initialMessage = '') {
        this.currentConversation = {
            id: Date.now(),
            title: initialMessage.substring(0, 30) || 'محادثة جديدة',
            messages: [],
            createdAt: new Date()
        };

        if (initialMessage) {
            this.currentConversation.messages.push({
                role: 'user',
                content: initialMessage,
                timestamp: new Date()
            });
        }

        this.showChatModal(initialMessage);
    },

    /**
     * عرض نافذة المحادثة
     */
    showChatModal(initialMessage = '') {
        const modal = document.createElement('div');
        modal.id = 'ai-chat-modal';
        modal.className = 'ai-chat-modal';
        modal.innerHTML = `
            <div class="ai-chat-overlay"></div>
            <div class="ai-chat-container">
                <!-- رأس المحادثة -->
                <div class="ai-chat-header">
                    <div class="chat-header-info">
                        <h2>المساعد الذكي</h2>
                        <p class="chat-subtitle">استفسر عن أي نص قرآني أو حديثي</p>
                    </div>
                    <button class="ai-chat-close" aria-label="إغلاق">&times;</button>
                </div>

                <!-- منطقة المحادثة -->
                <div class="ai-chat-messages" id="ai-chat-messages">
                    <!-- الرسائل تظهر هنا -->
                    <div class="chat-welcome">
                        <div class="chat-welcome-icon">🤖</div>
                        <h3>مرحباً! أنا مساعدك الذكي</h3>
                        <p>يمكنك أن تسأل عن أي نص إسلامي أو تطلب مني شرح وتفسير الآيات والأحاديث</p>
                    </div>
                </div>

                <!-- حقل الإدخال -->
                <div class="ai-chat-input-area">
                    <div class="ai-chat-input-group">
                        <input
                            type="text"
                            id="ai-chat-input"
                            class="ai-chat-input"
                            placeholder="اكتب سؤالك هنا..."
                            autocomplete="off"
                        >
                        <button class="ai-chat-send-btn" aria-label="إرسال">
                            <span>➤</span>
                        </button>
                    </div>
                    <p class="ai-chat-hint">اضغط Enter أو انقر الزر للإرسال</p>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // ربط الأحداث
        this.bindChatEvents(modal, initialMessage);

        // إظهار النافذة
        setTimeout(() => modal.classList.add('visible'), 10);

        // التركيز على حقل الإدخال
        setTimeout(() => {
            const input = document.getElementById('ai-chat-input');
            if (input) input.focus();
        }, 100);

        // إرسال الرسالة الأولى إذا وجدت
        if (initialMessage) {
            setTimeout(() => {
                this.sendMessage(modal, initialMessage);
            }, 500);
        }
    },

    /**
     * ربط أحداث المحادثة
     */
    bindChatEvents(modal, initialMessage) {
        // إغلاق النافذة
        modal.querySelector('.ai-chat-close').addEventListener('click', () => {
            this.closeChat(modal);
        });

        modal.querySelector('.ai-chat-overlay').addEventListener('click', () => {
            this.closeChat(modal);
        });

        // Escape
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeChat(modal);
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);

        // حقل الإدخال
        const input = modal.querySelector('#ai-chat-input');
        const sendBtn = modal.querySelector('.ai-chat-send-btn');

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !this.isLoading) {
                const message = input.value.trim();
                if (message) {
                    this.sendMessage(modal, message);
                    input.value = '';
                }
            }
        });

        sendBtn.addEventListener('click', () => {
            if (!this.isLoading) {
                const message = input.value.trim();
                if (message) {
                    this.sendMessage(modal, message);
                    input.value = '';
                }
            }
        });
    },

    /**
     * إرسال رسالة
     */
    sendMessage(modal, message) {
        if (this.isLoading || !message.trim()) return;

        const messagesContainer = modal.querySelector('#ai-chat-messages');

        // إزالة رسالة الترحيب
        const welcome = messagesContainer.querySelector('.chat-welcome');
        if (welcome) welcome.remove();

        // إضافة رسالة المستخدم
        const userMessageEl = document.createElement('div');
        userMessageEl.className = 'chat-message user-message';
        userMessageEl.innerHTML = `
            <div class="message-content">
                <p>${this.escapeHtml(message)}</p>
            </div>
            <div class="message-avatar">👤</div>
        `;
        messagesContainer.appendChild(userMessageEl);

        // حفظ الرسالة في السجل
        this.currentConversation.messages.push({
            role: 'user',
            content: message,
            timestamp: new Date()
        });

        // إظهار مؤشر التحميل
        this.isLoading = true;
        const loadingEl = document.createElement('div');
        loadingEl.className = 'chat-loading-indicator';
        loadingEl.innerHTML = `
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        messagesContainer.appendChild(loadingEl);

        // تمرير النافذة إلى الأسفل
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // محاكاة رد المساعد
        setTimeout(() => {
            this.generateAIResponse(modal, message, loadingEl);
        }, 800);
    },

    /**
     * توليد رد من المساعد
     */
    generateAIResponse(modal, userMessage, loadingEl) {
        const messagesContainer = modal.querySelector('#ai-chat-messages');

        // إزالة مؤشر التحميل
        if (loadingEl && loadingEl.parentNode) {
            loadingEl.remove();
        }

        // توليد رد ذكي
        const response = this.getSmartResponse(userMessage);

        // إضافة رسالة المساعد
        const aiMessageEl = document.createElement('div');
        aiMessageEl.className = 'chat-message ai-message';
        aiMessageEl.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="message-content">
                <p>${response}</p>
                <div class="message-actions">
                    <button class="message-action-btn copy-message-btn" title="نسخ الرسالة">
                        <span>📋</span>
                    </button>
                    <button class="message-action-btn quote-message-btn" title="إضافة للتقرير">
                        <span>📝</span>
                    </button>
                </div>
            </div>
        `;
        messagesContainer.appendChild(aiMessageEl);

        // ربط أزرار الإجراءات
        aiMessageEl.querySelector('.copy-message-btn').addEventListener('click', () => {
            navigator.clipboard.writeText(response);
            this.showToast('تم نسخ الرسالة');
        });

        aiMessageEl.querySelector('.quote-message-btn').addEventListener('click', () => {
            this.addToReport(response);
        });

        // حفظ الرسالة
        this.currentConversation.messages.push({
            role: 'assistant',
            content: response,
            timestamp: new Date()
        });

        // تمرير النافذة إلى الأسفل
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        this.isLoading = false;

        // تفعيل حقل الإدخال
        const input = modal.querySelector('#ai-chat-input');
        if (input) input.focus();
    },

    /**
     * الحصول على رد ذكي
     */
    getSmartResponse(userMessage) {
        const message = userMessage.toLowerCase();

        // قائمة الأنماط والأجوبة
        const responses = {
            'معنى': 'معنى هذا النص يشير إلى...',
            'شرح': 'شرح النص يتعلق بـ...',
            'من': 'هذا الحديث/الآية يُنسب إلى...',
            'متى': 'تاريخ هذا النص يعود إلى...',
            'أين': 'هذا النص ورد في...',
            'لماذا': 'السبب في ذلك هو...',
            'كيف': 'طريقة فهم هذا النص هي...',
            'فضل': 'فضيلة هذا النص تكمن في...',
            'حديث': 'هذا حديث شريف يتناول...',
            'آية': 'هذه آية كريمة تتحدث عن...',
            'دعاء': 'هذا دعاء مشهور وفيه...',
            'زيارة': 'هذه الزيارة فيها أهمية روحية و...',
        };

        // البحث عن كلمة مفتاحية
        for (const [keyword, response] of Object.entries(responses)) {
            if (message.includes(keyword)) {
                return this.expandResponse(response, userMessage);
            }
        }

        // رد عام
        return this.expandResponse(
            'شكراً على سؤالك. هذا موضوع مهم يتعلق بـ...',
            userMessage
        );
    },

    /**
     * توسيع الرد بتفاصيل
     */
    expandResponse(baseResponse, userMessage) {
        const templates = [
            `${baseResponse} وهذا يدل على العظمة والحكمة الإلهية في النص القرآني والنبوي.`,
            `${baseResponse} وللعلماء تفسيرات متعددة حول هذا الموضوع.`,
            `${baseResponse} وقد اختلفت الآراء في تفسير بعض جوانبه.`,
            `${baseResponse} وهذا يوافق ما ذهب إليه جمهور الفقهاء.`,
            `${baseResponse} كما ورد في كتب التفسير والحديث المختلفة.`
        ];

        const baseText = templates[Math.floor(Math.random() * templates.length)];

        // إضافة جملة إضافية
        const additionalPhrases = [
            '\n\nإذا أردت معرفة المزيد، يمكنك البحث عن نصوص مشابهة في المكتبة.',
            '\n\nهناك أحاديث وآيات أخرى ذات صلة بهذا الموضوع.',
            '\n\nينصح بمراجعة كتب التفسير للحصول على فهم أعمق.',
            '\n\nهذا الموضوع يستحق التأمل والدراسة العميقة.'
        ];

        return baseText + additionalPhrases[Math.floor(Math.random() * additionalPhrases.length)];
    },

    /**
     * إضافة الرسالة للتقرير
     */
    addToReport(message) {
        const reportEditor = document.querySelector('.report-editor, #report-editor');

        if (reportEditor) {
            const textarea = reportEditor.querySelector('textarea, [contenteditable]');
            if (textarea) {
                const quote = `\n💬 ${message}\n\n`;
                if (textarea.contentEditable === 'true') {
                    textarea.innerHTML += quote;
                } else {
                    textarea.value += quote;
                }
                this.showToast('تمت إضافة الرسالة للتقرير');
            }
        } else {
            this.showToast('الرجاء فتح محرر التقارير أولاً');
        }
    },

    /**
     * تحميل المحادثات السابقة
     */
    loadConversations() {
        try {
            const saved = localStorage.getItem('ai-chat-conversations');
            this.conversationHistory = saved ? JSON.parse(saved) : [];
        } catch (e) {
            this.conversationHistory = [];
        }
    },

    /**
     * حفظ المحادثة
     */
    saveConversation() {
        if (this.currentConversation && this.currentConversation.messages.length > 0) {
            this.conversationHistory.push(this.currentConversation);
            // احتفظ بآخر 20 محادثة
            this.conversationHistory = this.conversationHistory.slice(-20);
            localStorage.setItem('ai-chat-conversations', JSON.stringify(this.conversationHistory));
        }
    },

    /**
     * إغلاق المحادثة
     */
    closeChat(modal) {
        this.saveConversation();
        modal.classList.remove('visible');
        setTimeout(() => {
            modal.remove();
        }, 150);
    },

    /**
     * Escape HTML
     */
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    },

    /**
     * عرض رسالة توست
     */
    showToast(message) {
        let toast = document.querySelector('.toast');

        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'toast';
            document.body.appendChild(toast);
        }

        toast.textContent = message;
        toast.classList.add('visible');

        setTimeout(() => {
            toast.classList.remove('visible');
        }, 3000);
    }
};

// تهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    AIChat.init();
});

// تصدير للاستخدام العام
window.AIChat = AIChat;
