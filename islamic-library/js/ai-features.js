/* ===================================
   ميزات الذكاء الاصطناعي - المكتبة الإسلامية
   =================================== */

const AIFeatures = {
    // إعدادات API (للربط مستقبلاً)
    apiConfig: {
        endpoint: '', // سيتم تعيينه لاحقاً
        apiKey: ''    // سيتم تعيينه لاحقاً
    },

    // حالة النافذة
    modalState: {
        isOpen: false,
        type: null, // 'summarize' | 'explain' | 'search'
        content: null
    },

    /**
     * تهيئة ميزات AI
     */
    init() {
        this.createModal();
        this.bindEvents();
        console.log('AI Features initialized');
    },

    /**
     * إنشاء نافذة AI
     */
    createModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'ai-modal';
        modal.innerHTML = `
            <div class="modal ai-modal">
                <div class="modal-header ai-modal-header">
                    <div class="ai-modal-title">
                        <div class="ai-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 2a4 4 0 0 1 4 4v1a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z"></path>
                                <path d="M6 8a6 6 0 0 0 12 0"></path>
                                <path d="M12 14v8"></path>
                                <path d="M8 18h8"></path>
                            </svg>
                        </div>
                        <h3 class="modal-title" id="ai-modal-title">المساعد الذكي</h3>
                    </div>
                    <button class="modal-close" onclick="AIFeatures.closeModal()">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <div class="modal-body" id="ai-modal-body">
                    <!-- المحتوى سيتم إضافته ديناميكياً -->
                </div>
                <div class="modal-footer" id="ai-modal-footer">
                    <button class="btn btn-secondary" onclick="AIFeatures.closeModal()">إغلاق</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    },

    /**
     * ربط الأحداث
     */
    bindEvents() {
        // إغلاق النافذة بالنقر خارجها
        document.getElementById('ai-modal')?.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.closeModal();
            }
        });

        // إغلاق بزر Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modalState.isOpen) {
                this.closeModal();
            }
        });
    },

    /**
     * فتح النافذة
     */
    openModal(type, title) {
        const modal = document.getElementById('ai-modal');
        const modalTitle = document.getElementById('ai-modal-title');

        if (modal && modalTitle) {
            modalTitle.textContent = title;
            modal.classList.add('active');
            this.modalState.isOpen = true;
            this.modalState.type = type;
            document.body.style.overflow = 'hidden';
        }
    },

    /**
     * إغلاق النافذة
     */
    closeModal() {
        const modal = document.getElementById('ai-modal');

        if (modal) {
            modal.classList.remove('active');
            this.modalState.isOpen = false;
            this.modalState.type = null;
            document.body.style.overflow = '';
        }
    },

    /**
     * تعيين محتوى النافذة
     */
    setModalContent(html) {
        const body = document.getElementById('ai-modal-body');
        if (body) {
            body.innerHTML = html;
        }
    },

    /**
     * عرض حالة التحميل
     */
    showLoading() {
        this.setModalContent(`
            <div class="ai-loading">
                <div class="ai-loading-dots">
                    <div class="ai-loading-dot"></div>
                    <div class="ai-loading-dot"></div>
                    <div class="ai-loading-dot"></div>
                </div>
                <p>جاري المعالجة...</p>
            </div>
        `);
    },

    /**
     * تلخيص المحتوى
     */
    summarizeContent(content) {
        this.openModal('summarize', 'تلخيص المحتوى');
        this.showLoading();

        // محاكاة طلب API (سيتم استبداله بطلب حقيقي)
        setTimeout(() => {
            const summary = this.generateMockSummary(content);
            this.displaySummary(summary);
        }, 1500);
    },

    /**
     * عرض التلخيص
     */
    displaySummary(summary) {
        this.setModalContent(`
            <div class="ai-response">
                <div class="ai-response-header">
                    <span class="ai-response-label">ملخص المحتوى:</span>
                </div>
                <div class="ai-response-content arabic-text">
                    ${summary}
                </div>
            </div>
            <div class="ai-actions">
                <button class="btn btn-secondary btn-sm" onclick="AIFeatures.copyResponse()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    نسخ
                </button>
            </div>
        `);
    },

    /**
     * شرح النص
     */
    explainText(text) {
        this.openModal('explain', 'شرح النص');
        this.showLoading();
        this.modalState.content = text;

        // محاكاة طلب API (سيتم استبداله بطلب حقيقي)
        setTimeout(() => {
            const explanation = this.generateMockExplanation(text);
            this.displayExplanation(text, explanation);
        }, 1500);
    },

    /**
     * عرض الشرح
     */
    displayExplanation(originalText, explanation) {
        this.setModalContent(`
            <div class="ai-original-text">
                <div class="ai-response-label">النص الأصلي:</div>
                <blockquote class="arabic-text">${originalText}</blockquote>
            </div>
            <div class="ai-response">
                <div class="ai-response-header">
                    <span class="ai-response-label">الشرح:</span>
                </div>
                <div class="ai-response-content arabic-text">
                    ${explanation}
                </div>
            </div>
            <div class="ai-actions">
                <button class="btn btn-secondary btn-sm" onclick="AIFeatures.copyResponse()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    نسخ الشرح
                </button>
                <button class="btn btn-primary btn-sm" onclick="AIFeatures.askMore()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                    اسأل المزيد
                </button>
            </div>
        `);
    },

    /**
     * البحث الذكي
     */
    smartSearch(query) {
        this.openModal('search', 'البحث الذكي');
        this.showLoading();

        // محاكاة طلب API
        setTimeout(() => {
            const results = this.performSmartSearch(query);
            this.displaySearchResults(query, results);
        }, 1500);
    },

    /**
     * عرض نتائج البحث الذكي
     */
    displaySearchResults(query, results) {
        if (results.length === 0) {
            this.setModalContent(`
                <div class="ai-empty">
                    <div class="ai-empty-icon">🔍</div>
                    <p>لم أجد نتائج مطابقة لـ "${query}"</p>
                    <span>حاول استخدام كلمات مختلفة أو وصف أكثر تفصيلاً</span>
                </div>
            `);
            return;
        }

        const resultsHtml = results.map(result => `
            <a href="${result.url}" class="ai-search-result">
                <div class="ai-search-result-title">${result.title}</div>
                <div class="ai-search-result-meta">${result.book} - ${result.chapter}</div>
                <div class="ai-search-result-excerpt">${result.excerpt}</div>
                <div class="ai-search-result-relevance">
                    <span class="relevance-bar" style="width: ${result.relevance}%"></span>
                    <span class="relevance-text">${result.relevance}% مطابقة</span>
                </div>
            </a>
        `).join('');

        this.setModalContent(`
            <div class="ai-search-header">
                <p>البحث عن: <strong>"${query}"</strong></p>
                <span>وجدت ${results.length} نتيجة</span>
            </div>
            <div class="ai-search-results">
                ${resultsHtml}
            </div>
        `);
    },

    /**
     * نسخ الرد
     */
    copyResponse() {
        const content = document.querySelector('.ai-response-content');
        if (content) {
            navigator.clipboard.writeText(content.textContent).then(() => {
                this.showToast('تم النسخ');
            });
        }
    },

    /**
     * اسأل المزيد
     */
    askMore() {
        const input = prompt('ما الذي تريد معرفته أكثر؟');
        if (input && this.modalState.content) {
            this.explainText(this.modalState.content + '\n\nسؤال إضافي: ' + input);
        }
    },

    /**
     * توليد ملخص وهمي (للعرض فقط)
     */
    generateMockSummary(content) {
        // هذه دالة وهمية للعرض، سيتم استبدالها بـ API حقيقي
        const sentences = content.split('.').filter(s => s.trim().length > 20);
        const summaryPoints = sentences.slice(0, 3);

        return `
            <p>يتناول هذا النص عدة نقاط أساسية:</p>
            <ul>
                ${summaryPoints.map(point => `<li>${point.trim()}.</li>`).join('')}
            </ul>
            <p class="ai-note">
                <strong>ملاحظة:</strong> هذا ملخص تجريبي. عند ربط النظام بخدمة AI حقيقية، سيكون التلخيص أكثر دقة وشمولية.
            </p>
        `;
    },

    /**
     * توليد شرح وهمي (للعرض فقط)
     */
    generateMockExplanation(text) {
        // هذه دالة وهمية للعرض، سيتم استبدالها بـ API حقيقي
        return `
            <p>هذا النص يشير إلى مفهوم مهم في الفكر الإسلامي. دعنا نفصّله:</p>
            <p><strong>المعنى العام:</strong> النص يتحدث عن موضوع ديني يتطلب فهماً عميقاً للسياق الذي ورد فيه.</p>
            <p><strong>السياق التاريخي:</strong> ورد هذا النص في سياق معين يجب مراعاته عند فهم المعنى.</p>
            <p><strong>الدلالة الفقهية/العقدية:</strong> يمكن استنباط عدة أحكام ومفاهيم من هذا النص.</p>
            <p class="ai-note">
                <strong>ملاحظة:</strong> هذا شرح تجريبي. عند ربط النظام بخدمة AI حقيقية، سيكون الشرح أكثر تفصيلاً ودقة.
            </p>
        `;
    },

    /**
     * تنفيذ بحث ذكي وهمي
     */
    performSmartSearch(query) {
        if (!window.LibraryData) return [];

        const results = window.LibraryData.globalSearch(query);

        return results.slice(0, 10).map((result, index) => ({
            title: result.sectionTitle,
            book: result.bookTitle,
            chapter: result.chapterTitle,
            excerpt: result.excerpt,
            url: `book.html?id=${result.bookId}&section=${result.sectionId}`,
            relevance: Math.max(50, 100 - (index * 8))
        }));
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
        }, 2000);
    },

    /**
     * تكوين API (للاستخدام المستقبلي)
     */
    configure(config) {
        this.apiConfig = { ...this.apiConfig, ...config };
    },

    /**
     * إرسال طلب للـ API (للاستخدام المستقبلي)
     */
    async callAPI(endpoint, data) {
        if (!this.apiConfig.endpoint) {
            console.warn('API not configured');
            return null;
        }

        try {
            const response = await fetch(`${this.apiConfig.endpoint}/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiConfig.apiKey}`
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API call failed:', error);
            throw error;
        }
    }
};

// تهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    AIFeatures.init();
});

// تصدير للاستخدام العام
window.AIFeatures = AIFeatures;
