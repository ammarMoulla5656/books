/* ===================================
   قارئ الكتب - المكتبة الإسلامية
   =================================== */

const BookReader = {
    // البيانات
    currentBook: null,
    currentChapter: null,
    currentSection: null,

    // العناصر
    elements: {
        sidebar: null,
        toc: null,
        content: null,
        toolbar: null,
        progressBar: null
    },

    // الإعدادات
    settings: {
        fontSize: 18,
        fontSizeMin: 14,
        fontSizeMax: 28,
        fontSizeStep: 2,
        lineHeight: 2.2
    },

    // العلامات المرجعية
    bookmarks: [],

    /**
     * تهيئة قارئ الكتب
     */
    init() {
        this.cacheElements();
        this.loadSettings();
        this.loadBookmarks();
        this.bindEvents();
        this.loadBookFromUrl();
        console.log('Book Reader initialized');
    },

    /**
     * تخزين العناصر
     */
    cacheElements() {
        this.elements.sidebar = document.querySelector('.book-sidebar');
        this.elements.toc = document.querySelector('.book-toc');
        this.elements.content = document.querySelector('.reading-content, .book-content');
        this.elements.toolbar = document.querySelector('.toolbar');
        this.elements.progressBar = document.querySelector('.reading-progress-bar');
    },

    /**
     * تحميل الإعدادات المحفوظة
     */
    loadSettings() {
        try {
            const saved = localStorage.getItem('book-reader-settings');
            if (saved) {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
            }
        } catch (e) {
            console.warn('Could not load settings:', e);
        }
    },

    /**
     * حفظ الإعدادات
     */
    saveSettings() {
        try {
            localStorage.setItem('book-reader-settings', JSON.stringify(this.settings));
        } catch (e) {
            console.warn('Could not save settings:', e);
        }
    },

    /**
     * تحميل العلامات المرجعية
     */
    loadBookmarks() {
        try {
            const saved = localStorage.getItem('book-reader-bookmarks');
            if (saved) {
                this.bookmarks = JSON.parse(saved);
            }
        } catch (e) {
            console.warn('Could not load bookmarks:', e);
        }
    },

    /**
     * حفظ العلامات المرجعية
     */
    saveBookmarks() {
        try {
            localStorage.setItem('book-reader-bookmarks', JSON.stringify(this.bookmarks));
        } catch (e) {
            console.warn('Could not save bookmarks:', e);
        }
    },

    /**
     * ربط الأحداث
     */
    bindEvents() {
        // شريط التمرير للتقدم
        window.addEventListener('scroll', () => {
            this.updateReadingProgress();
        });

        // اختصارات لوحة المفاتيح
        document.addEventListener('keydown', (e) => {
            this.handleKeyboard(e);
        });

        // تحديد النص
        document.addEventListener('mouseup', () => {
            this.handleTextSelection();
        });

        // أزرار شريط الأدوات
        this.bindToolbarEvents();
    },

    /**
     * ربط أحداث شريط الأدوات
     */
    bindToolbarEvents() {
        // زر تكبير الخط
        document.addEventListener('click', (e) => {
            if (e.target.closest('[data-action="font-increase"]')) {
                this.increaseFontSize();
            }
            if (e.target.closest('[data-action="font-decrease"]')) {
                this.decreaseFontSize();
            }
            if (e.target.closest('[data-action="bookmark"]')) {
                this.toggleBookmark();
            }
            if (e.target.closest('[data-action="summarize"]')) {
                this.summarizeContent();
            }
            if (e.target.closest('[data-action="search-book"]')) {
                this.openBookSearch();
            }
            if (e.target.closest('[data-action="toggle-sidebar"]')) {
                this.toggleSidebar();
            }
        });
    },

    /**
     * معالجة اختصارات لوحة المفاتيح
     */
    handleKeyboard(e) {
        // السهم الأيسر - التالي
        if (e.key === 'ArrowLeft' && !this.isInputFocused()) {
            this.goToNext();
        }
        // السهم الأيمن - السابق
        if (e.key === 'ArrowRight' && !this.isInputFocused()) {
            this.goToPrevious();
        }
        // + تكبير الخط
        if (e.key === '+' || e.key === '=') {
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                this.increaseFontSize();
            }
        }
        // - تصغير الخط
        if (e.key === '-') {
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                this.decreaseFontSize();
            }
        }
        // B للعلامة المرجعية
        if (e.key === 'b' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            this.toggleBookmark();
        }
    },

    /**
     * التحقق إذا كان التركيز على حقل إدخال
     */
    isInputFocused() {
        const active = document.activeElement;
        return active.tagName === 'INPUT' ||
               active.tagName === 'TEXTAREA' ||
               active.isContentEditable;
    },

    /**
     * تحميل الكتاب من URL
     */
    loadBookFromUrl() {
        const params = new URLSearchParams(window.location.search);
        const bookId = params.get('id');
        const sectionId = params.get('section');

        if (bookId) {
            this.loadBook(bookId, sectionId);
        }
    },

    /**
     * تحميل كتاب
     */
    loadBook(bookId, sectionId = null) {
        if (!window.LibraryData) {
            console.error('Library data not available');
            return;
        }

        const book = window.LibraryData.getBookById(bookId);
        if (!book) {
            console.error('Book not found:', bookId);
            this.showError('لم يتم العثور على الكتاب');
            return;
        }

        this.currentBook = book;

        // تحديث العنوان
        document.title = `${book.title} - المكتبة الإسلامية`;

        // عرض الفهرس
        this.renderTableOfContents();

        // تحميل القسم المحدد أو الأول
        if (sectionId) {
            this.loadSection(sectionId);
        } else if (book.chapters && book.chapters.length > 0) {
            const firstChapter = book.chapters[0];
            if (firstChapter.sections && firstChapter.sections.length > 0) {
                this.loadSection(firstChapter.sections[0].id);
            }
        }

        // تطبيق الإعدادات
        this.applySettings();
    },

    /**
     * عرض فهرس الكتاب
     */
    renderTableOfContents() {
        if (!this.elements.toc || !this.currentBook) return;

        const chapters = this.currentBook.chapters || [];

        const html = chapters.map(chapter => `
            <li class="toc-chapter" data-chapter="${chapter.id}">
                <div class="toc-chapter-title" onclick="BookReader.toggleChapter('${chapter.id}')">
                    <span>${chapter.title}</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </div>
                <ul class="toc-sections">
                    ${(chapter.sections || []).map(section => `
                        <li class="toc-section"
                            data-section="${section.id}"
                            onclick="BookReader.loadSection('${section.id}')">
                            ${section.title}
                        </li>
                    `).join('')}
                </ul>
            </li>
        `).join('');

        this.elements.toc.innerHTML = `<ul class="toc">${html}</ul>`;
    },

    /**
     * فتح/إغلاق فصل في الفهرس
     */
    toggleChapter(chapterId) {
        const chapter = document.querySelector(`[data-chapter="${chapterId}"]`);
        if (chapter) {
            chapter.classList.toggle('expanded');
        }
    },

    /**
     * تحميل قسم معين
     */
    loadSection(sectionId) {
        if (!this.currentBook) return;

        // البحث عن القسم
        let foundSection = null;
        let foundChapter = null;

        for (const chapter of this.currentBook.chapters || []) {
            for (const section of chapter.sections || []) {
                if (section.id === sectionId) {
                    foundSection = section;
                    foundChapter = chapter;
                    break;
                }
            }
            if (foundSection) break;
        }

        if (!foundSection) {
            console.error('Section not found:', sectionId);
            return;
        }

        this.currentChapter = foundChapter;
        this.currentSection = foundSection;

        // عرض المحتوى
        this.renderContent(foundSection);

        // تحديث الفهرس
        this.updateTocActive(sectionId, foundChapter.id);

        // تحديث URL
        this.updateUrl(sectionId);

        // التمرير للأعلى
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    /**
     * عرض المحتوى
     */
    renderContent(section) {
        if (!this.elements.content) return;

        const content = section.content || '';
        const paragraphs = content.split('\n\n').filter(p => p.trim());

        const html = `
            <div class="content-header">
                <h2 class="content-title">${section.title}</h2>
                <div class="content-meta">
                    <span>${this.currentBook.title}</span>
                    <span>•</span>
                    <span>${this.currentChapter.title}</span>
                </div>
            </div>
            <div class="content-body arabic-text">
                ${paragraphs.map(p => `<p>${p}</p>`).join('')}
            </div>
            <div class="content-navigation">
                <button class="btn btn-secondary" onclick="BookReader.goToPrevious()" id="prev-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                    السابق
                </button>
                <button class="btn btn-primary" onclick="BookReader.goToNext()" id="next-btn">
                    التالي
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </button>
            </div>
        `;

        this.elements.content.innerHTML = html;

        // تحديث أزرار التنقل
        this.updateNavigationButtons();
    },

    /**
     * تحديث العنصر النشط في الفهرس
     */
    updateTocActive(sectionId, chapterId) {
        // إزالة الحالة النشطة السابقة
        document.querySelectorAll('.toc-section.active').forEach(el => {
            el.classList.remove('active');
        });

        // إضافة الحالة النشطة الجديدة
        const activeSection = document.querySelector(`[data-section="${sectionId}"]`);
        if (activeSection) {
            activeSection.classList.add('active');
        }

        // فتح الفصل الحالي
        const chapter = document.querySelector(`[data-chapter="${chapterId}"]`);
        if (chapter && !chapter.classList.contains('expanded')) {
            chapter.classList.add('expanded');
        }
    },

    /**
     * تحديث URL
     */
    updateUrl(sectionId) {
        const url = new URL(window.location);
        url.searchParams.set('section', sectionId);
        window.history.replaceState({}, '', url);
    },

    /**
     * الانتقال للقسم التالي
     */
    goToNext() {
        const nextSection = this.getAdjacentSection(1);
        if (nextSection) {
            this.loadSection(nextSection.id);
        }
    },

    /**
     * الانتقال للقسم السابق
     */
    goToPrevious() {
        const prevSection = this.getAdjacentSection(-1);
        if (prevSection) {
            this.loadSection(prevSection.id);
        }
    },

    /**
     * الحصول على القسم المجاور
     */
    getAdjacentSection(direction) {
        if (!this.currentBook || !this.currentSection) return null;

        const allSections = [];
        for (const chapter of this.currentBook.chapters || []) {
            for (const section of chapter.sections || []) {
                allSections.push(section);
            }
        }

        const currentIndex = allSections.findIndex(s => s.id === this.currentSection.id);
        const nextIndex = currentIndex + direction;

        if (nextIndex >= 0 && nextIndex < allSections.length) {
            return allSections[nextIndex];
        }

        return null;
    },

    /**
     * تحديث أزرار التنقل
     */
    updateNavigationButtons() {
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');

        if (prevBtn) {
            prevBtn.disabled = !this.getAdjacentSection(-1);
        }

        if (nextBtn) {
            nextBtn.disabled = !this.getAdjacentSection(1);
        }
    },

    /**
     * تحديث شريط تقدم القراءة
     */
    updateReadingProgress() {
        if (!this.elements.progressBar) return;

        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

        this.elements.progressBar.style.width = `${progress}%`;
    },

    /**
     * تكبير حجم الخط
     */
    increaseFontSize() {
        if (this.settings.fontSize < this.settings.fontSizeMax) {
            this.settings.fontSize += this.settings.fontSizeStep;
            this.applySettings();
            this.saveSettings();
        }
    },

    /**
     * تصغير حجم الخط
     */
    decreaseFontSize() {
        if (this.settings.fontSize > this.settings.fontSizeMin) {
            this.settings.fontSize -= this.settings.fontSizeStep;
            this.applySettings();
            this.saveSettings();
        }
    },

    /**
     * تطبيق الإعدادات
     */
    applySettings() {
        if (this.elements.content) {
            this.elements.content.style.fontSize = `${this.settings.fontSize}px`;
            this.elements.content.style.lineHeight = this.settings.lineHeight;
        }
    },

    /**
     * تبديل العلامة المرجعية
     */
    toggleBookmark() {
        if (!this.currentBook || !this.currentSection) return;

        const bookmarkId = `${this.currentBook.id}-${this.currentSection.id}`;
        const existingIndex = this.bookmarks.findIndex(b => b.id === bookmarkId);

        if (existingIndex >= 0) {
            this.bookmarks.splice(existingIndex, 1);
            this.showToast('تم إزالة العلامة المرجعية');
        } else {
            this.bookmarks.push({
                id: bookmarkId,
                bookId: this.currentBook.id,
                bookTitle: this.currentBook.title,
                sectionId: this.currentSection.id,
                sectionTitle: this.currentSection.title,
                date: new Date().toISOString()
            });
            this.showToast('تم إضافة العلامة المرجعية');
        }

        this.saveBookmarks();
        this.updateBookmarkButton();
    },

    /**
     * تحديث زر العلامة المرجعية
     */
    updateBookmarkButton() {
        const btn = document.querySelector('[data-action="bookmark"]');
        if (!btn || !this.currentBook || !this.currentSection) return;

        const bookmarkId = `${this.currentBook.id}-${this.currentSection.id}`;
        const isBookmarked = this.bookmarks.some(b => b.id === bookmarkId);

        btn.classList.toggle('active', isBookmarked);
    },

    /**
     * فتح/إغلاق الشريط الجانبي
     */
    toggleSidebar() {
        if (this.elements.sidebar) {
            this.elements.sidebar.classList.toggle('open');
        }
    },

    /**
     * معالجة تحديد النص
     */
    handleTextSelection() {
        const selection = window.getSelection();
        const selectedText = selection.toString().trim();

        if (selectedText.length > 0) {
            this.showSelectionToolbar(selection, selectedText);
        } else {
            this.hideSelectionToolbar();
        }
    },

    /**
     * عرض شريط أدوات التحديد
     */
    showSelectionToolbar(selection, text) {
        let toolbar = document.querySelector('.selection-toolbar');

        if (!toolbar) {
            toolbar = document.createElement('div');
            toolbar.className = 'selection-toolbar';
            toolbar.innerHTML = `
                <button class="toolbar-btn" data-action="explain" title="اشرح">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                </button>
                <button class="toolbar-btn" data-action="copy" title="نسخ">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                </button>
            `;
            document.body.appendChild(toolbar);

            // أحداث الأزرار
            toolbar.addEventListener('click', (e) => {
                const action = e.target.closest('[data-action]')?.dataset.action;
                if (action === 'explain') {
                    this.explainText(text);
                } else if (action === 'copy') {
                    this.copyText(text);
                }
            });
        }

        // تحديد موضع الشريط
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        toolbar.style.top = `${rect.top + window.scrollY - 50}px`;
        toolbar.style.left = `${rect.left + (rect.width / 2)}px`;
        toolbar.style.transform = 'translateX(-50%)';
        toolbar.classList.add('visible');
    },

    /**
     * إخفاء شريط أدوات التحديد
     */
    hideSelectionToolbar() {
        const toolbar = document.querySelector('.selection-toolbar');
        if (toolbar) {
            toolbar.classList.remove('visible');
        }
    },

    /**
     * نسخ النص
     */
    copyText(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showToast('تم النسخ');
        }).catch(() => {
            this.showToast('فشل النسخ');
        });
        this.hideSelectionToolbar();
    },

    /**
     * شرح النص بالذكاء الاصطناعي
     */
    explainText(text) {
        if (window.AIFeatures) {
            window.AIFeatures.explainText(text);
        }
        this.hideSelectionToolbar();
    },

    /**
     * تلخيص المحتوى
     */
    summarizeContent() {
        if (!this.currentSection) return;

        if (window.AIFeatures) {
            window.AIFeatures.summarizeContent(this.currentSection.content);
        }
    },

    /**
     * فتح البحث داخل الكتاب
     */
    openBookSearch() {
        // يمكن تنفيذ نافذة بحث داخل الكتاب هنا
        const query = prompt('ابحث في الكتاب:');
        if (query && this.currentBook) {
            const results = window.LibraryData.searchInBook(this.currentBook.id, query);
            console.log('Search results:', results);
            // عرض النتائج
        }
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
     * عرض رسالة خطأ
     */
    showError(message) {
        if (this.elements.content) {
            this.elements.content.innerHTML = `
                <div class="error-state">
                    <div class="error-icon">⚠️</div>
                    <h3>${message}</h3>
                    <a href="index.html" class="btn btn-primary">العودة للرئيسية</a>
                </div>
            `;
        }
    }
};

// تهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    // التحقق من أننا في صفحة الكتاب
    if (document.querySelector('.book-reader, .book-content')) {
        BookReader.init();
    }
});

// تصدير للاستخدام العام
window.BookReader = BookReader;
