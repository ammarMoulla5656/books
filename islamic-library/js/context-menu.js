/* ===================================
   قائمة السياق الذكية - المكتبة الإسلامية
   =================================== */

const SmartContextMenu = {
    menu: null,
    selectedText: '',
    menuPosition: { x: 0, y: 0 },

    /**
     * تهيئة قائمة السياق
     */
    init() {
        this.createMenu();
        this.bindEvents();
        console.log('Smart Context Menu initialized');
    },

    /**
     * إنشاء عنصر القائمة
     */
    createMenu() {
        const menu = document.createElement('div');
        menu.className = 'smart-context-menu';
        menu.id = 'smart-context-menu';
        menu.innerHTML = `
            <div class="context-menu-list">
                <button class="context-menu-item" data-action="copy">
                    <span class="menu-icon">📋</span>
                    <span class="menu-text">نسخ</span>
                </button>

                <div class="context-menu-divider"></div>

                <button class="context-menu-item ai-action" data-action="explain">
                    <span class="menu-icon">⭐</span>
                    <span class="menu-text">شرح هذا النص</span>
                </button>

                <button class="context-menu-item ai-action" data-action="summarize">
                    <span class="menu-icon">⭐</span>
                    <span class="menu-text">تلخيص</span>
                </button>

                <button class="context-menu-item ai-action" data-action="find-occurrences">
                    <span class="menu-icon">⭐</span>
                    <span class="menu-text">أين ورد؟</span>
                </button>

                <div class="context-menu-divider"></div>

                <button class="context-menu-item" data-action="smart-fetch">
                    <span class="menu-icon">📖</span>
                    <span class="menu-text">جلب نص مشابه</span>
                </button>

                <button class="context-menu-item" data-action="google-search">
                    <span class="menu-icon">🔗</span>
                    <span class="menu-text">البحث في Google</span>
                </button>

                <div class="context-menu-divider"></div>

                <button class="context-menu-item" data-action="add-to-report">
                    <span class="menu-icon">📝</span>
                    <span class="menu-text">إضافة للتقرير</span>
                </button>

                <button class="context-menu-item" data-action="bookmark">
                    <span class="menu-icon">🔖</span>
                    <span class="menu-text">إضافة علامة</span>
                </button>

                <button class="context-menu-item ai-action" data-action="ai-chat">
                    <span class="menu-icon">⭐</span>
                    <span class="menu-text">مناقشة مع AI</span>
                </button>
            </div>
        `;

        document.body.appendChild(menu);
        this.menu = menu;
    },

    /**
     * ربط الأحداث
     */
    bindEvents() {
        // إظهار القائمة عند كليك يمين
        document.addEventListener('contextmenu', (e) => {
            const selection = window.getSelection().toString().trim();

            // فقط إذا كان هناك نص محدد
            if (selection.length > 0) {
                e.preventDefault();
                this.selectedText = selection;
                this.show(e.clientX, e.clientY);
                return false;
            }
        });

        // إغلاق القائمة عند النقر في مكان آخر
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.smart-context-menu')) {
                this.hide();
            }
        });

        // الضغط على Escape لإغلاق
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hide();
            }
        });

        // معالجة الأزرار
        this.menu.querySelectorAll('.context-menu-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = btn.dataset.action;
                this.handleAction(action);
                this.hide();
            });
        });
    },

    /**
     * إظهار القائمة
     */
    show(x, y) {
        this.menu.classList.add('visible');

        // حساب الموضع
        this.menuPosition.x = x;
        this.menuPosition.y = y;

        // التحقق من الحدود
        const rect = this.menu.getBoundingClientRect();
        const adjustedX = x;
        const adjustedY = y;

        // إذا كانت القائمة خارج الشاشة من الأسفل
        if (window.innerHeight - y < rect.height) {
            this.menu.style.top = (y - rect.height) + 'px';
        } else {
            this.menu.style.top = y + 'px';
        }

        // إذا كانت القائمة خارج الشاشة من اليسار
        if (window.innerWidth - x < rect.width) {
            this.menu.style.right = (window.innerWidth - x) + 'px';
            this.menu.style.left = 'auto';
        } else {
            this.menu.style.left = x + 'px';
            this.menu.style.right = 'auto';
        }
    },

    /**
     * إخفاء القائمة
     */
    hide() {
        this.menu.classList.remove('visible');
        this.selectedText = '';
    },

    /**
     * معالجة الإجراءات
     */
    handleAction(action) {
        const text = this.selectedText;

        switch (action) {
            case 'copy':
                this.copyText(text);
                break;

            case 'explain':
                this.explainText(text);
                break;

            case 'summarize':
                this.summarizeText(text);
                break;

            case 'find-occurrences':
                this.findOccurrences(text);
                break;

            case 'smart-fetch':
                this.smartFetch(text);
                break;

            case 'google-search':
                this.googleSearch(text);
                break;

            case 'add-to-report':
                this.addToReport(text);
                break;

            case 'bookmark':
                this.bookmarkText(text);
                break;

            case 'ai-chat':
                this.aiChat(text);
                break;
        }
    },

    /**
     * نسخ النص
     */
    copyText(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showToast('تم النسخ بنجاح');
        }).catch(() => {
            this.showToast('فشل النسخ');
        });
    },

    /**
     * شرح النص
     */
    explainText(text) {
        if (window.AIFeatures) {
            window.AIFeatures.explainText(text);
        } else {
            this.showToast('ميزة الشرح غير متاحة حالياً');
        }
    },

    /**
     * تلخيص النص
     */
    summarizeText(text) {
        if (window.AIFeatures) {
            // إنشاء محتوى وهمي للتلخيص
            const summary = this.generateSummary(text);
            window.AIFeatures.displaySummary(summary);
            window.AIFeatures.openModal('summarize', 'تلخيص');
        } else {
            this.showToast('ميزة التلخيص غير متاحة حالياً');
        }
    },

    /**
     * توليد ملخص للنص
     */
    generateSummary(text) {
        // هذا مثال بسيط - يمكن تحسينه لاحقاً
        const sentences = text.split('.');
        const summary = sentences.slice(0, 2).join('.');

        return `
            <p><strong>الملخص:</strong></p>
            <p>${summary}</p>
            <p class="ai-note">
                <strong>ملاحظة:</strong> هذا ملخص تلقائي لجزء من النص.
            </p>
        `;
    },

    /**
     * البحث عن أماكن ورود النص
     */
    findOccurrences(text) {
        if (window.TextFinder) {
            window.TextFinder.find(text);
        } else {
            this.showToast('ميزة البحث غير متاحة');
        }
    },

    /**
     * جلب نص مشابه
     */
    smartFetch(text) {
        if (window.SmartFetch) {
            window.SmartFetch.open(text);
        } else {
            this.showToast('ميزة الجلب الذكي غير متاحة');
        }
    },

    /**
     * البحث في Google
     */
    googleSearch(text) {
        const url = `https://www.google.com/search?q=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    },

    /**
     * إضافة للتقرير
     */
    addToReport(text) {
        // فحص إذا كان هناك محرر تقارير مفتوح
        const reportEditor = document.querySelector('.report-editor, #report-editor');

        if (reportEditor) {
            // إدراج النص في محرر التقارير
            const textarea = reportEditor.querySelector('textarea, [contenteditable]');
            if (textarea) {
                const quote = `\n> "${text}"\n\n`;
                if (textarea.contentEditable === 'true') {
                    textarea.innerHTML += quote;
                } else {
                    textarea.value += quote;
                }
                this.showToast('تمت إضافة النص للتقرير');
            }
        } else {
            // فتح محرر التقارير جديد
            this.showToast('يمكنك إضافة النص للتقرير بعد فتح محرر التقارير');
            // يمكن فتح صفحة report-editor.html هنا
        }
    },

    /**
     * إضافة علامة مرجعية
     */
    bookmarkText(text) {
        const bookmark = {
            text: text,
            book: this.getCurrentBookId(),
            section: this.getCurrentSectionId(),
            timestamp: new Date().toISOString()
        };

        try {
            let bookmarks = JSON.parse(localStorage.getItem('text-bookmarks') || '[]');
            bookmarks.push(bookmark);
            localStorage.setItem('text-bookmarks', JSON.stringify(bookmarks));
            this.showToast('تمت إضافة العلامة');
        } catch (e) {
            this.showToast('فشل حفظ العلامة');
        }
    },

    /**
     * مناقشة مع AI
     */
    aiChat(text) {
        if (window.AIFeatures) {
            // فتح نافذة الدردشة مع السؤال الأولي
            window.AIFeatures.openModal('chat', 'المحادثة الذكية');

            const chatContent = `
                <div class="ai-chat">
                    <div class="chat-message ai-message">
                        <p>👤 <strong>أنت:</strong> ${text}</p>
                    </div>
                    <div class="chat-loading">
                        <div class="spinner spinner-sm"></div>
                        <p>جاري المعالجة...</p>
                    </div>
                </div>
            `;

            window.AIFeatures.setModalContent(chatContent);
        }
    },

    /**
     * الحصول على معرف الكتاب الحالي
     */
    getCurrentBookId() {
        const params = new URLSearchParams(window.location.search);
        return params.get('id') || 'unknown';
    },

    /**
     * الحصول على معرف القسم الحالي
     */
    getCurrentSectionId() {
        const params = new URLSearchParams(window.location.search);
        return params.get('section') || 'unknown';
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
    SmartContextMenu.init();
});

// تصدير للاستخدام العام
window.SmartContextMenu = SmartContextMenu;
