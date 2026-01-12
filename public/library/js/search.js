/* ===================================
   نظام البحث - المكتبة الإسلامية
   =================================== */

const SearchManager = {
    // العناصر
    elements: {
        searchInput: null,
        searchBtn: null,
        searchResults: null,
        searchOverlay: null
    },

    // حالة البحث
    state: {
        query: '',
        results: [],
        isLoading: false,
        filters: {
            category: 'all',
            author: 'all'
        }
    },

    // إعدادات
    settings: {
        minQueryLength: 2,
        debounceDelay: 300,
        maxResults: 50
    },

    // مؤقت debounce
    debounceTimer: null,

    /**
     * تهيئة نظام البحث
     */
    init() {
        this.cacheElements();
        this.bindEvents();
        this.setupKeyboardShortcuts();
        console.log('Search Manager initialized');
    },

    /**
     * تخزين العناصر مؤقتاً
     */
    cacheElements() {
        this.elements.searchInput = document.querySelector('.search-input, #search-input');
        this.elements.searchBtn = document.querySelector('.search-btn, #search-btn');
        this.elements.searchResults = document.querySelector('.search-results, #search-results');
        this.elements.searchOverlay = document.querySelector('.search-overlay, #search-overlay');
    },

    /**
     * ربط الأحداث
     */
    bindEvents() {
        // حدث الكتابة في حقل البحث
        if (this.elements.searchInput) {
            this.elements.searchInput.addEventListener('input', (e) => {
                this.handleSearchInput(e.target.value);
            });

            this.elements.searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.performSearch();
                } else if (e.key === 'Escape') {
                    this.clearSearch();
                }
            });

            this.elements.searchInput.addEventListener('focus', () => {
                if (this.state.query.length >= this.settings.minQueryLength) {
                    this.showResults();
                }
            });
        }

        // زر البحث
        if (this.elements.searchBtn) {
            this.elements.searchBtn.addEventListener('click', () => {
                this.performSearch();
            });
        }

        // النقر خارج نتائج البحث
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-bar, .search-results')) {
                this.hideResults();
            }
        });
    },

    /**
     * إعداد اختصارات لوحة المفاتيح
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K لفتح البحث
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.focusSearch();
            }

            // / لفتح البحث (إذا لم يكن في حقل إدخال)
            if (e.key === '/' && !this.isInputFocused()) {
                e.preventDefault();
                this.focusSearch();
            }
        });
    },

    /**
     * التحقق إذا كان التركيز على حقل إدخال
     */
    isInputFocused() {
        const activeElement = document.activeElement;
        return activeElement.tagName === 'INPUT' ||
               activeElement.tagName === 'TEXTAREA' ||
               activeElement.isContentEditable;
    },

    /**
     * التركيز على حقل البحث
     */
    focusSearch() {
        if (this.elements.searchInput) {
            this.elements.searchInput.focus();
            this.elements.searchInput.select();
        }
    },

    /**
     * معالجة إدخال البحث
     */
    handleSearchInput(value) {
        this.state.query = value.trim();

        // إلغاء المؤقت السابق
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        // التحقق من الحد الأدنى للأحرف
        if (this.state.query.length < this.settings.minQueryLength) {
            this.hideResults();
            return;
        }

        // تأخير البحث (debounce)
        this.debounceTimer = setTimeout(() => {
            this.performSearch();
        }, this.settings.debounceDelay);
    },

    /**
     * تنفيذ البحث
     */
    performSearch() {
        const query = this.state.query;

        if (query.length < this.settings.minQueryLength) {
            return;
        }

        this.setLoading(true);

        // البحث في البيانات
        setTimeout(() => {
            const results = this.search(query);
            this.state.results = results;
            this.renderResults(results);
            this.setLoading(false);
        }, 100);
    },

    /**
     * دالة البحث الرئيسية
     */
    search(query) {
        if (!window.LibraryData) {
            console.warn('Library data not loaded');
            return [];
        }

        const results = [];
        const lowerQuery = query.toLowerCase();
        const { category, author } = this.state.filters;

        // البحث في الكتب
        const bookResults = window.LibraryData.searchBooks(query);
        bookResults.forEach(book => {
            // تطبيق الفلاتر
            if (category !== 'all' && book.category !== category) return;
            if (author !== 'all' && book.author !== author) return;

            results.push({
                type: 'book',
                id: book.id,
                title: book.title,
                subtitle: window.LibraryData.getAuthorName(book.author),
                category: window.LibraryData.getCategoryById(book.category)?.name,
                url: `book.html?id=${book.id}`
            });
        });

        // البحث في المحتوى
        const contentResults = window.LibraryData.globalSearch(query);
        contentResults.forEach(result => {
            // تطبيق الفلاتر
            const book = window.LibraryData.getBookById(result.bookId);
            if (category !== 'all' && book?.category !== category) return;
            if (author !== 'all' && book?.author !== author) return;

            results.push({
                type: 'content',
                id: `${result.bookId}-${result.sectionId}`,
                title: result.sectionTitle,
                subtitle: `${result.bookTitle} - ${result.chapterTitle}`,
                excerpt: this.highlightQuery(result.excerpt, query),
                url: `book.html?id=${result.bookId}&section=${result.sectionId}`
            });
        });

        // ترتيب النتائج
        return results.slice(0, this.settings.maxResults);
    },

    /**
     * تمييز الكلمة المبحوث عنها
     */
    highlightQuery(text, query) {
        if (!text || !query) return text;

        const regex = new RegExp(`(${this.escapeRegex(query)})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    },

    /**
     * تجنب الأحرف الخاصة في regex
     */
    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    },

    /**
     * عرض النتائج
     */
    renderResults(results) {
        if (!this.elements.searchResults) {
            this.createResultsContainer();
        }

        if (results.length === 0) {
            this.elements.searchResults.innerHTML = `
                <div class="search-empty">
                    <div class="search-empty-icon">🔍</div>
                    <p>لم يتم العثور على نتائج</p>
                    <span>حاول استخدام كلمات مختلفة</span>
                </div>
            `;
        } else {
            const html = results.map(result => this.renderResultItem(result)).join('');
            this.elements.searchResults.innerHTML = `
                <div class="search-results-header">
                    <span>تم العثور على ${results.length} نتيجة</span>
                </div>
                <div class="search-results-list">
                    ${html}
                </div>
            `;
        }

        this.showResults();
    },

    /**
     * عرض عنصر نتيجة واحد
     */
    renderResultItem(result) {
        const icon = result.type === 'book' ? '📖' : '📄';

        return `
            <a href="${result.url}" class="search-result-item" data-type="${result.type}">
                <span class="search-result-icon">${icon}</span>
                <div class="search-result-content">
                    <div class="search-result-title">${result.title}</div>
                    <div class="search-result-subtitle">${result.subtitle}</div>
                    ${result.excerpt ? `<div class="search-result-excerpt">${result.excerpt}</div>` : ''}
                </div>
                ${result.category ? `<span class="search-result-badge">${result.category}</span>` : ''}
            </a>
        `;
    },

    /**
     * إنشاء حاوية النتائج
     */
    createResultsContainer() {
        const container = document.createElement('div');
        container.className = 'search-results';
        container.id = 'search-results';

        const searchBar = document.querySelector('.search-bar');
        if (searchBar) {
            searchBar.appendChild(container);
        } else {
            document.body.appendChild(container);
        }

        this.elements.searchResults = container;
    },

    /**
     * إظهار النتائج
     */
    showResults() {
        if (this.elements.searchResults) {
            this.elements.searchResults.classList.add('visible');
        }
    },

    /**
     * إخفاء النتائج
     */
    hideResults() {
        if (this.elements.searchResults) {
            this.elements.searchResults.classList.remove('visible');
        }
    },

    /**
     * مسح البحث
     */
    clearSearch() {
        this.state.query = '';
        this.state.results = [];

        if (this.elements.searchInput) {
            this.elements.searchInput.value = '';
        }

        this.hideResults();
    },

    /**
     * تعيين حالة التحميل
     */
    setLoading(isLoading) {
        this.state.isLoading = isLoading;

        if (this.elements.searchBtn) {
            this.elements.searchBtn.classList.toggle('loading', isLoading);
        }

        if (this.elements.searchInput) {
            this.elements.searchInput.classList.toggle('loading', isLoading);
        }
    },

    /**
     * تعيين الفلاتر
     */
    setFilters(filters) {
        this.state.filters = { ...this.state.filters, ...filters };

        if (this.state.query.length >= this.settings.minQueryLength) {
            this.performSearch();
        }
    },

    /**
     * الحصول على URL مع معاملات البحث
     */
    getSearchUrl(query) {
        return `search.html?q=${encodeURIComponent(query)}`;
    },

    /**
     * الانتقال إلى صفحة البحث
     */
    goToSearchPage() {
        if (this.state.query.length >= this.settings.minQueryLength) {
            window.location.href = this.getSearchUrl(this.state.query);
        }
    },

    /**
     * الحصول على معاملات البحث من URL
     */
    getQueryFromUrl() {
        const params = new URLSearchParams(window.location.search);
        return params.get('q') || '';
    }
};

// تهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    SearchManager.init();
});

// تصدير للاستخدام العام
window.SearchManager = SearchManager;
