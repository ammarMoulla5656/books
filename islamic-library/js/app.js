/* ===================================
   التطبيق الرئيسي - المكتبة الإسلامية
   =================================== */

const App = {
    // حالة التطبيق
    state: {
        isLoading: true,
        currentPage: null,
        scrollY: 0
    },

    /**
     * تهيئة التطبيق
     */
    init() {
        this.detectCurrentPage();
        this.setupNavbar();
        this.setupMobileMenu();
        this.setupBackToTop();
        this.setupLazyLoading();
        this.renderDynamicContent();
        this.hideLoadingScreen();

        console.log('Islamic Library App initialized');
    },

    /**
     * تحديد الصفحة الحالية
     */
    detectCurrentPage() {
        const path = window.location.pathname;

        if (path.includes('book.html')) {
            this.state.currentPage = 'book';
        } else if (path.includes('category.html')) {
            this.state.currentPage = 'category';
        } else if (path.includes('search.html')) {
            this.state.currentPage = 'search';
        } else {
            this.state.currentPage = 'home';
        }
    },

    /**
     * إعداد شريط التنقل
     */
    setupNavbar() {
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;

        // تأثير التمرير
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });

        // تحديد الرابط النشط
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = navbar.querySelectorAll('.nav-link');

        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPath || (currentPath === '' && href === 'index.html')) {
                link.classList.add('active');
            }
        });
    },

    /**
     * إعداد قائمة الموبايل
     */
    setupMobileMenu() {
        const toggleBtn = document.querySelector('.navbar-toggle');
        const mobileMenu = document.querySelector('.mobile-menu');
        const overlay = document.querySelector('.mobile-menu-overlay');

        if (!toggleBtn) return;

        // إنشاء العناصر إذا لم تكن موجودة
        if (!mobileMenu) {
            this.createMobileMenu();
        }

        toggleBtn.addEventListener('click', () => {
            this.toggleMobileMenu();
        });

        overlay?.addEventListener('click', () => {
            this.closeMobileMenu();
        });
    },

    /**
     * إنشاء قائمة الموبايل
     */
    createMobileMenu() {
        const menu = document.createElement('div');
        menu.className = 'mobile-menu';
        menu.innerHTML = `
            <nav class="mobile-nav">
                <a href="index.html" class="mobile-nav-link">الرئيسية</a>
                <a href="search.html" class="mobile-nav-link">البحث</a>
                <a href="category.html?id=fiqh" class="mobile-nav-link">الفقه</a>
                <a href="category.html?id=aqeedah" class="mobile-nav-link">العقائد</a>
                <a href="category.html?id=hadith" class="mobile-nav-link">الحديث</a>
                <a href="category.html?id=tafsir" class="mobile-nav-link">التفسير</a>
            </nav>
            <div class="mobile-menu-footer">
                <p>المكتبة الإسلامية</p>
            </div>
        `;

        const overlay = document.createElement('div');
        overlay.className = 'mobile-menu-overlay';

        document.body.appendChild(overlay);
        document.body.appendChild(menu);
    },

    /**
     * فتح/إغلاق قائمة الموبايل
     */
    toggleMobileMenu() {
        const menu = document.querySelector('.mobile-menu');
        const overlay = document.querySelector('.mobile-menu-overlay');
        const toggle = document.querySelector('.navbar-toggle');

        menu?.classList.toggle('open');
        overlay?.classList.toggle('open');
        toggle?.classList.toggle('active');

        // منع التمرير
        document.body.style.overflow = menu?.classList.contains('open') ? 'hidden' : '';
    },

    /**
     * إغلاق قائمة الموبايل
     */
    closeMobileMenu() {
        const menu = document.querySelector('.mobile-menu');
        const overlay = document.querySelector('.mobile-menu-overlay');
        const toggle = document.querySelector('.navbar-toggle');

        menu?.classList.remove('open');
        overlay?.classList.remove('open');
        toggle?.classList.remove('active');
        document.body.style.overflow = '';
    },

    /**
     * إعداد زر العودة للأعلى
     */
    setupBackToTop() {
        let backToTop = document.querySelector('.back-to-top');

        if (!backToTop) {
            backToTop = document.createElement('button');
            backToTop.className = 'back-to-top';
            backToTop.innerHTML = `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="18 15 12 9 6 15"></polyline>
                </svg>
            `;
            backToTop.setAttribute('aria-label', 'العودة للأعلى');
            document.body.appendChild(backToTop);
        }

        // إظهار/إخفاء الزر
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        });

        // النقر للعودة للأعلى
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    },

    /**
     * إعداد التحميل الكسول للصور
     */
    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                        }
                        imageObserver.unobserve(img);
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    },

    /**
     * عرض المحتوى الديناميكي
     */
    renderDynamicContent() {
        switch (this.state.currentPage) {
            case 'home':
                this.renderHomePage();
                break;
            case 'category':
                this.renderCategoryPage();
                break;
            case 'search':
                this.renderSearchPage();
                break;
        }
    },

    /**
     * عرض الصفحة الرئيسية
     */
    renderHomePage() {
        // عرض التصنيفات
        this.renderCategories();

        // عرض الكتب المميزة
        this.renderFeaturedBooks();
    },

    /**
     * عرض التصنيفات
     */
    renderCategories() {
        const container = document.querySelector('.categories-grid, #categories-grid');
        if (!container || !window.LibraryData) return;

        const categories = window.LibraryData.getCategories();

        const html = categories.map(cat => `
            <a href="category.html?id=${cat.id}" class="category-card">
                <div class="category-icon">${cat.icon}</div>
                <h3 class="category-name">${cat.name}</h3>
                <p class="category-count">${cat.count} كتاب</p>
            </a>
        `).join('');

        container.innerHTML = html;
    },

    /**
     * عرض الكتب المميزة
     */
    renderFeaturedBooks() {
        const container = document.querySelector('.featured-books, #featured-books');
        if (!container || !window.LibraryData) return;

        const books = window.LibraryData.getFeaturedBooks();

        const html = books.map(book => this.renderBookCard(book)).join('');

        container.innerHTML = html;
    },

    /**
     * عرض بطاقة كتاب
     */
    renderBookCard(book) {
        const author = window.LibraryData.getAuthorName(book.author);
        const category = window.LibraryData.getCategoryById(book.category);

        return `
            <article class="book-card" onclick="window.location.href='book.html?id=${book.id}'">
                <div class="book-card-cover">
                    <img src="${book.cover}" alt="${book.title}" loading="lazy">
                    <div class="book-card-overlay">
                        <div class="book-card-actions">
                            <button class="btn btn-primary btn-sm">قراءة</button>
                        </div>
                    </div>
                </div>
                <div class="book-card-content">
                    <span class="book-card-category">${category?.name || ''}</span>
                    <h3 class="book-card-title">${book.title}</h3>
                    <p class="book-card-author">${author}</p>
                    <div class="book-card-stats">
                        <span class="book-card-stat">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                            </svg>
                            ${book.chaptersCount} فصل
                        </span>
                        <span class="book-card-stat">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                            </svg>
                            ${book.pagesCount} صفحة
                        </span>
                    </div>
                </div>
            </article>
        `;
    },

    /**
     * عرض صفحة التصنيف
     */
    renderCategoryPage() {
        const params = new URLSearchParams(window.location.search);
        const categoryId = params.get('id');

        if (!categoryId || !window.LibraryData) return;

        const category = window.LibraryData.getCategoryById(categoryId);
        const books = window.LibraryData.getBooksByCategory(categoryId);

        // تحديث العنوان
        const titleEl = document.querySelector('.category-title, #category-title');
        const descEl = document.querySelector('.category-description, #category-description');
        const countEl = document.querySelector('.category-book-count, #category-count');

        if (titleEl) titleEl.textContent = category?.name || 'تصنيف غير معروف';
        if (descEl) descEl.textContent = category?.description || '';
        if (countEl) countEl.textContent = `${books.length} كتاب`;

        // عرض الكتب
        const container = document.querySelector('.category-books, #category-books');
        if (container) {
            const html = books.map(book => this.renderBookCard(book)).join('');
            container.innerHTML = html || '<p class="empty-state">لا توجد كتب في هذا التصنيف</p>';
        }

        // تحديث عنوان الصفحة
        document.title = `${category?.name || 'تصنيف'} - المكتبة الإسلامية`;
    },

    /**
     * عرض صفحة البحث
     */
    renderSearchPage() {
        const params = new URLSearchParams(window.location.search);
        const query = params.get('q');

        if (!query) return;

        // تعيين قيمة البحث في الحقل
        const searchInput = document.querySelector('.search-input, #search-input');
        if (searchInput) {
            searchInput.value = query;
        }

        // تنفيذ البحث
        if (window.SearchManager) {
            window.SearchManager.state.query = query;
            window.SearchManager.performSearch();
        }
    },

    /**
     * إخفاء شاشة التحميل
     */
    hideLoadingScreen() {
        const loader = document.querySelector('.loading-screen');
        if (loader) {
            setTimeout(() => {
                loader.classList.add('hidden');
                setTimeout(() => loader.remove(), 300);
            }, 500);
        }

        this.state.isLoading = false;
    },

    /**
     * إظهار رسالة توست
     */
    showToast(message, type = 'info') {
        let toast = document.querySelector('.toast');

        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'toast';
            document.body.appendChild(toast);
        }

        toast.textContent = message;
        toast.className = `toast toast-${type}`;
        toast.classList.add('visible');

        setTimeout(() => {
            toast.classList.remove('visible');
        }, 3000);
    },

    /**
     * تنسيق الأرقام
     */
    formatNumber(num) {
        return new Intl.NumberFormat('ar-EG').format(num);
    },

    /**
     * اختصار النص
     */
    truncateText(text, maxLength = 100) {
        if (text.length <= maxLength) return text;
        return text.slice(0, maxLength).trim() + '...';
    }
};

// إضافة أنماط Toast
const toastStyles = document.createElement('style');
toastStyles.textContent = `
    .toast {
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%) translateY(20px);
        background: var(--bg-secondary);
        color: var(--text-primary);
        padding: var(--spacing-md) var(--spacing-xl);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-lg);
        border: 1px solid var(--border-color);
        z-index: 3000;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
    }

    .toast.visible {
        opacity: 1;
        visibility: visible;
        transform: translateX(-50%) translateY(0);
    }

    .toast-success { border-color: var(--success); }
    .toast-error { border-color: var(--error); }
    .toast-warning { border-color: var(--warning); }

    /* أنماط AI إضافية */
    .ai-original-text {
        background: var(--bg-tertiary);
        border-radius: var(--radius-md);
        padding: var(--spacing-md);
        margin-bottom: var(--spacing-lg);
    }

    .ai-original-text blockquote {
        margin: var(--spacing-sm) 0 0;
        padding-right: var(--spacing-md);
        border-right: 3px solid var(--accent-primary);
        font-style: italic;
    }

    .ai-response-label {
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: var(--spacing-sm);
        display: block;
    }

    .ai-response-content {
        line-height: 2;
    }

    .ai-response-content ul {
        margin: var(--spacing-md) 0;
    }

    .ai-response-content li {
        margin-bottom: var(--spacing-sm);
    }

    .ai-note {
        background: var(--islamic-gold-light);
        padding: var(--spacing-md);
        border-radius: var(--radius-md);
        margin-top: var(--spacing-lg);
        font-size: var(--font-size-sm);
    }

    .ai-actions {
        display: flex;
        gap: var(--spacing-sm);
        margin-top: var(--spacing-lg);
        padding-top: var(--spacing-md);
        border-top: 1px solid var(--border-color);
    }

    .ai-empty {
        text-align: center;
        padding: var(--spacing-2xl);
    }

    .ai-empty-icon {
        font-size: 48px;
        margin-bottom: var(--spacing-md);
    }

    .ai-search-header {
        margin-bottom: var(--spacing-lg);
        padding-bottom: var(--spacing-md);
        border-bottom: 1px solid var(--border-color);
    }

    .ai-search-result {
        display: block;
        padding: var(--spacing-md);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        margin-bottom: var(--spacing-sm);
        text-decoration: none;
        color: inherit;
        transition: all var(--transition-fast);
    }

    .ai-search-result:hover {
        border-color: var(--accent-primary);
        background: var(--bg-hover);
    }

    .ai-search-result-title {
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: var(--spacing-xs);
    }

    .ai-search-result-meta {
        font-size: var(--font-size-sm);
        color: var(--text-muted);
        margin-bottom: var(--spacing-sm);
    }

    .ai-search-result-excerpt {
        font-size: var(--font-size-sm);
        color: var(--text-secondary);
        line-height: 1.6;
    }

    .ai-search-result-relevance {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        margin-top: var(--spacing-sm);
    }

    .relevance-bar {
        height: 4px;
        background: var(--accent-primary);
        border-radius: var(--radius-full);
    }

    .relevance-text {
        font-size: var(--font-size-xs);
        color: var(--text-muted);
    }

    /* نتائج البحث المنسدلة */
    .search-results {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-xl);
        margin-top: var(--spacing-sm);
        max-height: 400px;
        overflow-y: auto;
        opacity: 0;
        visibility: hidden;
        transform: translateY(-10px);
        transition: all var(--transition-fast);
        z-index: 100;
    }

    .search-results.visible {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
    }

    .search-results-header {
        padding: var(--spacing-sm) var(--spacing-md);
        background: var(--bg-tertiary);
        border-bottom: 1px solid var(--border-color);
        font-size: var(--font-size-sm);
        color: var(--text-muted);
    }

    .search-result-item {
        display: flex;
        align-items: flex-start;
        gap: var(--spacing-md);
        padding: var(--spacing-md);
        text-decoration: none;
        color: inherit;
        border-bottom: 1px solid var(--border-light);
        transition: background var(--transition-fast);
    }

    .search-result-item:hover {
        background: var(--bg-hover);
    }

    .search-result-item:last-child {
        border-bottom: none;
    }

    .search-result-icon {
        font-size: 20px;
        flex-shrink: 0;
    }

    .search-result-content {
        flex: 1;
        min-width: 0;
    }

    .search-result-title {
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 2px;
    }

    .search-result-subtitle {
        font-size: var(--font-size-sm);
        color: var(--text-muted);
    }

    .search-result-excerpt {
        font-size: var(--font-size-sm);
        color: var(--text-secondary);
        margin-top: var(--spacing-xs);
    }

    .search-result-excerpt mark {
        background: var(--islamic-gold-light);
        color: inherit;
        padding: 0 2px;
        border-radius: 2px;
    }

    .search-result-badge {
        font-size: var(--font-size-xs);
        background: var(--accent-light);
        color: var(--accent-primary);
        padding: 2px 8px;
        border-radius: var(--radius-full);
        flex-shrink: 0;
    }

    .search-empty {
        text-align: center;
        padding: var(--spacing-xl);
        color: var(--text-muted);
    }

    .search-empty-icon {
        font-size: 32px;
        margin-bottom: var(--spacing-sm);
    }
`;
document.head.appendChild(toastStyles);

// تهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// تصدير للاستخدام العام
window.App = App;
