/* ===================================
   جلب النص الذكي - المكتبة الإسلامية
   =================================== */

const SmartFetch = {
    suggestedTexts: [
        {
            name: 'حديث الكساء',
            description: 'حديث شريف يتناول فضائل أهل البيت عليهم السلام',
            keywords: ['كساء', 'أهل البيت', 'الخمسة', 'محمد', 'علي', 'فاطمة']
        },
        {
            name: 'دعاء كميل',
            description: 'دعاء من أدعية قنوت الليل المشهورة',
            keywords: ['كميل', 'دعاء', 'ليل', 'قنوت', 'علي']
        },
        {
            name: 'آية التطهير',
            description: 'الآية التي تتحدث عن تطهير أهل البيت',
            keywords: ['تطهير', 'آية', 'أهل البيت', 'إنما']
        },
        {
            name: 'خطبة الغدير',
            description: 'خطبة النبي في يوم غدير خم',
            keywords: ['غدير', 'خم', 'خطبة', 'علي', 'الولاية']
        },
        {
            name: 'دعاء أبي حمزة',
            description: 'دعاء موسى بن عبدالله أبي حمزة الثمالي',
            keywords: ['أبو حمزة', 'دعاء', 'توبة', 'أنت ربي']
        },
        {
            name: 'زيارة عاشوراء',
            description: 'زيارة الإمام الحسين في يوم عاشوراء',
            keywords: ['عاشوراء', 'زيارة', 'حسين', 'محرم']
        },
        {
            name: 'سجدة الشكر',
            description: 'سجدة يسجدها المؤمن شكراً لله',
            keywords: ['سجدة', 'شكر', 'عبادة', 'دعاء']
        },
        {
            name: 'حديث النور',
            description: 'حديث يتناول نور الأنوار والحكمة الإلهية',
            keywords: ['نور', 'حديث', 'معرفة', 'إلهية']
        }
    ],

    recentSearches: [],

    /**
     * تهيئة ميزة الجلب الذكي
     */
    init() {
        this.loadRecentSearches();
        console.log('Smart Fetch initialized');
    },

    /**
     * فتح حوار الجلب الذكي
     */
    open(initialText = '') {
        this.showSmartFetchModal(initialText);
    },

    /**
     * عرض نافذة الجلب الذكي
     */
    showSmartFetchModal(initialText = '') {
        const modal = document.createElement('div');
        modal.id = 'smart-fetch-modal';
        modal.className = 'smart-fetch-modal';
        modal.innerHTML = `
            <div class="smart-fetch-overlay"></div>
            <div class="smart-fetch-container">
                <div class="smart-fetch-header">
                    <h2>البحث الذكي عن النصوص</h2>
                    <button class="smart-fetch-close" aria-label="إغلاق">&times;</button>
                </div>

                <div class="smart-fetch-content">
                    <!-- حقل الإدخال -->
                    <div class="smart-fetch-search">
                        <input
                            type="text"
                            id="smart-fetch-input"
                            class="smart-fetch-input"
                            placeholder="ماذا تريد أن تجد؟ (مثال: حديث الكساء، دعاء كميل)"
                            value="${initialText}"
                            autocomplete="off"
                        >
                        <button class="smart-fetch-search-btn">
                            <span>🔍</span>
                            <span>ابحث</span>
                        </button>
                    </div>

                    <!-- الاقتراحات -->
                    <div class="smart-fetch-suggestions" id="smart-fetch-suggestions">
                        <h3>نصوص مقترحة:</h3>
                        <div class="suggestions-grid">
                            ${this.suggestedTexts.map((text, idx) => `
                                <div class="suggestion-card" data-index="${idx}">
                                    <div class="suggestion-icon">📖</div>
                                    <div class="suggestion-name">${text.name}</div>
                                    <div class="suggestion-desc">${text.description}</div>
                                    <button class="suggestion-btn">جلب</button>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- نتائج البحث -->
                    <div class="smart-fetch-results" id="smart-fetch-results" style="display: none;">
                        <div class="results-loading">
                            <div class="spinner"></div>
                            <p>جاري البحث...</p>
                        </div>
                    </div>

                    <!-- البحث الأخير -->
                    ${this.recentSearches.length > 0 ? `
                        <div class="smart-fetch-recent">
                            <h3>بحث سابق:</h3>
                            <div class="recent-list">
                                ${this.recentSearches.slice(0, 5).map(item => `
                                    <button class="recent-item" data-query="${item.query}">
                                        <span class="recent-icon">⏱</span>
                                        <span>${item.query}</span>
                                        <span class="recent-count">${item.count} نتيجة</span>
                                    </button>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // ربط الأحداث
        this.bindModalEvents(modal);

        // إظهار النافذة
        setTimeout(() => modal.classList.add('visible'), 10);

        // التركيز على حقل الإدخال
        document.getElementById('smart-fetch-input').focus();
    },

    /**
     * ربط أحداث النافذة
     */
    bindModalEvents(modal) {
        // إغلاق النافذة
        modal.querySelector('.smart-fetch-close').addEventListener('click', () => {
            this.closeModal(modal);
        });

        modal.querySelector('.smart-fetch-overlay').addEventListener('click', () => {
            this.closeModal(modal);
        });

        // الضغط على Escape
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeModal(modal);
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);

        // حقل البحث
        const input = modal.querySelector('#smart-fetch-input');
        const searchBtn = modal.querySelector('.smart-fetch-search-btn');

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.performSearch(modal, input.value);
            }
        });

        searchBtn.addEventListener('click', () => {
            this.performSearch(modal, input.value);
        });

        // الاقتراحات
        modal.querySelectorAll('.suggestion-card').forEach((card, idx) => {
            card.addEventListener('click', () => {
                const suggestion = this.suggestedTexts[idx];
                this.fetchSuggestion(modal, suggestion);
            });

            card.querySelector('.suggestion-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                const suggestion = this.suggestedTexts[idx];
                this.fetchSuggestion(modal, suggestion);
            });
        });

        // البحث الأخير
        modal.querySelectorAll('.recent-item').forEach(item => {
            item.addEventListener('click', () => {
                const query = item.dataset.query;
                this.performSearch(modal, query);
            });
        });
    },

    /**
     * تنفيذ البحث الذكي
     */
    performSearch(modal, query) {
        if (!query.trim()) {
            this.showToast('الرجاء إدخال نص البحث');
            return;
        }

        const resultsContainer = modal.querySelector('#smart-fetch-results');
        const suggestionsContainer = modal.querySelector('#smart-fetch-suggestions');

        // إظهار منطقة النتائج
        suggestionsContainer.style.display = 'none';
        resultsContainer.style.display = 'block';

        // محاكاة البحث
        setTimeout(() => {
            const results = this.searchForText(query);
            this.displaySearchResults(modal, results, query);
            this.addToRecentSearches(query, results.length);
        }, 800);
    },

    /**
     * جلب نص مقترح
     */
    fetchSuggestion(modal, suggestion) {
        const resultsContainer = modal.querySelector('#smart-fetch-results');
        const suggestionsContainer = modal.querySelector('#smart-fetch-suggestions');

        // إظهار منطقة النتائج
        suggestionsContainer.style.display = 'none';
        resultsContainer.style.display = 'block';

        // محاكاة الجلب
        setTimeout(() => {
            const results = this.searchForText(suggestion.name);
            this.displaySearchResults(modal, results, suggestion.name);
            this.addToRecentSearches(suggestion.name, results.length);
        }, 600);
    },

    /**
     * البحث عن نص في البيانات
     */
    searchForText(query) {
        if (!window.LibraryData) {
            return [];
        }

        // محاكاة البحث
        const results = [];
        const books = window.LibraryData.getBooks();

        books.forEach(book => {
            // البحث في كل فصل
            if (book.chapters) {
                book.chapters.forEach((chapter, chIdx) => {
                    // محاكاة نتيجة بحث واحدة لكل فصل يحتوي على الكلمات المفتاحية
                    const keywordMatch = this.matchKeywords(query, chapter.title);
                    if (keywordMatch) {
                        results.push({
                            bookId: book.id,
                            bookTitle: book.title,
                            chapterId: `ch${chIdx}`,
                            chapterTitle: chapter.title,
                            sectionId: 's1',
                            excerpt: `قطعة من ${chapter.title} تتعلق بـ "${query}"...`,
                            relevance: keywordMatch
                        });
                    }
                });
            }
        });

        // ترتيب النتائج حسب الملاءمة
        return results.sort((a, b) => b.relevance - a.relevance);
    },

    /**
     * مطابقة الكلمات المفتاحية
     */
    matchKeywords(query, text) {
        let score = 0;
        const queryWords = query.split(' ');

        queryWords.forEach(word => {
            if (text.includes(word)) {
                score += 10;
            }
        });

        // إذا كان النص يحتوي على جزء من الاستعلام
        if (text.includes(query)) {
            score += 20;
        }

        return score;
    },

    /**
     * عرض نتائج البحث
     */
    displaySearchResults(modal, results, query) {
        const resultsContainer = modal.querySelector('#smart-fetch-results');

        if (results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="no-results">
                    <div class="no-results-icon">📭</div>
                    <p>لم نجد نصوص عن "${query}"</p>
                    <p class="no-results-hint">حاول البحث بكلمات أخرى</p>
                    <button class="btn btn-secondary" onclick="document.querySelector('#smart-fetch-input').value = ''; document.querySelector('#smart-fetch-input').focus();">
                        جرب بحث جديد
                    </button>
                </div>
            `;
            return;
        }

        const html = `
            <div class="results-header">
                <h3>وجدنا ${results.length} نتيجة عن "${query}"</h3>
            </div>
            <div class="results-list">
                ${results.map((result, idx) => `
                    <div class="fetch-result-item">
                        <div class="result-book">
                            <span class="result-icon">📖</span>
                            <strong>${result.bookTitle}</strong>
                        </div>
                        <div class="result-chapter">
                            <span class="chapter-title">${result.chapterTitle}</span>
                        </div>
                        <p class="result-excerpt">${result.excerpt}</p>
                        <div class="result-actions">
                            <button class="btn btn-primary btn-sm" data-book="${result.bookId}" data-section="${result.sectionId}">
                                فتح في الكتاب
                            </button>
                            <button class="btn btn-ghost btn-sm copy-result-btn" data-text="${result.excerpt}">
                                نسخ
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        resultsContainer.innerHTML = html;

        // ربط أزرار الفتح
        resultsContainer.querySelectorAll('[data-book]').forEach(btn => {
            btn.addEventListener('click', () => {
                const bookId = btn.dataset.book;
                const sectionId = btn.dataset.section;
                window.location.href = `book.html?id=${bookId}&section=${sectionId}`;
            });
        });

        // ربط أزرار النسخ
        resultsContainer.querySelectorAll('.copy-result-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                navigator.clipboard.writeText(btn.dataset.text);
                this.showToast('تم النسخ بنجاح');
            });
        });
    },

    /**
     * إضافة البحث إلى السجل
     */
    addToRecentSearches(query, count) {
        // إزالة البحث إذا كان موجود
        this.recentSearches = this.recentSearches.filter(item => item.query !== query);

        // إضافة البحث في البداية
        this.recentSearches.unshift({ query, count, timestamp: new Date() });

        // الاحتفاظ بآخر 10 بحث
        this.recentSearches = this.recentSearches.slice(0, 10);

        // حفظ في localStorage
        this.saveRecentSearches();
    },

    /**
     * حفظ البحث الأخير
     */
    saveRecentSearches() {
        localStorage.setItem('smart-fetch-recent', JSON.stringify(this.recentSearches));
    },

    /**
     * تحميل البحث الأخير
     */
    loadRecentSearches() {
        try {
            const saved = localStorage.getItem('smart-fetch-recent');
            this.recentSearches = saved ? JSON.parse(saved) : [];
        } catch (e) {
            this.recentSearches = [];
        }
    },

    /**
     * إغلاق النافذة
     */
    closeModal(modal) {
        modal.classList.remove('visible');
        setTimeout(() => {
            modal.remove();
        }, 150);
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
    SmartFetch.init();
});

// تصدير للاستخدام العام
window.SmartFetch = SmartFetch;
