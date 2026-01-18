/* ===================================
   أين ورد هذا النص - المكتبة الإسلامية
   =================================== */

const TextFinder = {
    isSearching: false,
    searchResults: [],

    /**
     * البحث عن أماكن ورود النص
     */
    find(text) {
        if (!text || text.length < 3) {
            this.showMessage('يرجى إدخال نص أطول (3 أحرف على الأقل)', 'warning');
            return;
        }

        if (!window.AIFeatures || !window.LibraryData) {
            this.showMessage('البيانات غير متاحة', 'error');
            return;
        }

        this.isSearching = true;
        this.showSearching();

        // محاكاة البحث
        setTimeout(() => {
            this.searchResults = window.LibraryData.globalSearch(text);
            this.displayResults(text);
            this.isSearching = false;
        }, 1000);
    },

    /**
     * عرض حالة البحث
     */
    showSearching() {
        if (window.AIFeatures) {
            window.AIFeatures.setModalContent(`
                <div class="find-searching">
                    <div class="spinner spinner-lg"></div>
                    <p>جاري البحث في جميع الكتب...</p>
                    <div class="search-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: 0%"></div>
                        </div>
                        <p class="progress-text">0%</p>
                    </div>
                </div>
            `);

            window.AIFeatures.openModal('find', 'أين ورد هذا النص؟');

            // محاكاة التقدم
            let progress = 0;
            const interval = setInterval(() => {
                progress += Math.random() * 30;
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(interval);
                }
                const fill = document.querySelector('.progress-fill');
                const text = document.querySelector('.progress-text');
                if (fill && text) {
                    fill.style.width = progress + '%';
                    text.textContent = Math.floor(progress) + '%';
                }
            }, 200);
        }
    },

    /**
     * عرض النتائج
     */
    displayResults(searchText) {
        if (this.searchResults.length === 0) {
            this.showNoResults(searchText);
            return;
        }

        const html = `
            <div class="find-results-container">
                <div class="find-stats">
                    <h3>📊 وُجد النص في <strong>${this.searchResults.length}</strong> موضع</h3>
                    <p class="find-query">البحث عن: <strong>"${searchText}"</strong></p>
                </div>

                <div class="find-results-list">
                    ${this.groupResultsByBook(this.searchResults).map(bookGroup => `
                        <div class="find-book-group">
                            <div class="book-header">
                                <h4>📖 ${bookGroup.bookTitle}</h4>
                                <span class="result-count">${bookGroup.results.length} موضع</span>
                            </div>

                            <div class="book-results">
                                ${bookGroup.results.slice(0, 5).map(result => `
                                    <div class="result-item">
                                        <div class="result-location">
                                            <strong>${result.chapterTitle}</strong>
                                            <small>${result.sectionTitle}</small>
                                        </div>

                                        <div class="result-excerpt">
                                            ${this.highlightText(result.excerpt, searchText)}
                                        </div>

                                        <div class="result-actions">
                                            <a href="book.html?id=${result.bookId}&section=${result.sectionId}"
                                               class="btn btn-sm btn-primary">فتح</a>
                                        </div>
                                    </div>
                                `).join('')}

                                ${bookGroup.results.length > 5 ? `
                                    <div class="more-results">
                                        ... و ${bookGroup.results.length - 5} نتائج أخرى
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div class="find-actions">
                    <button onclick="TextFinder.exportResults()" class="btn btn-secondary">
                        📊 تصدير النتائج
                    </button>
                    <button onclick="TextFinder.openAllResults()" class="btn btn-primary">
                        🔗 فتح الكل في تبويبات
                    </button>
                </div>
            </div>
        `;

        if (window.AIFeatures) {
            window.AIFeatures.setModalContent(html);
        }
    },

    /**
     * تجميع النتائج حسب الكتاب
     */
    groupResultsByBook(results) {
        const grouped = {};

        results.forEach(result => {
            if (!grouped[result.bookId]) {
                grouped[result.bookId] = {
                    bookId: result.bookId,
                    bookTitle: result.bookTitle,
                    results: []
                };
            }
            grouped[result.bookId].results.push(result);
        });

        return Object.values(grouped);
    },

    /**
     * تمييز النص المبحوث عنه
     */
    highlightText(text, query) {
        if (!text || !query) return text;

        const regex = new RegExp(`(${this.escapeRegex(query)})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    },

    /**
     * تجنب الأحرف الخاصة
     */
    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    },

    /**
     * عرض رسالة عدم وجود نتائج
     */
    showNoResults(searchText) {
        const html = `
            <div class="find-no-results">
                <div class="empty-icon">🔍</div>
                <h3>لم يتم العثور على نتائج</h3>
                <p>البحث عن: <strong>"${searchText}"</strong></p>
                <p class="hint">
                    حاول البحث عن كلمات أخرى أو أجزاء مختلفة من النص
                </p>
            </div>
        `;

        if (window.AIFeatures) {
            window.AIFeatures.setModalContent(html);
        }
    },

    /**
     * تصدير النتائج
     */
    exportResults() {
        if (this.searchResults.length === 0) {
            this.showMessage('لا توجد نتائج للتصدير', 'warning');
            return;
        }

        // إنشاء نص للتصدير
        let exportText = 'نتائج البحث\n';
        exportText += '='.repeat(50) + '\n\n';

        this.groupResultsByBook(this.searchResults).forEach(bookGroup => {
            exportText += `📖 ${bookGroup.bookTitle}\n`;
            exportText += '-'.repeat(40) + '\n';

            bookGroup.results.slice(0, 5).forEach(result => {
                exportText += `  • ${result.chapterTitle} - ${result.sectionTitle}\n`;
                exportText += `    ${result.excerpt.substring(0, 100)}...\n\n`;
            });

            exportText += '\n';
        });

        // نسخ إلى الحافظة
        navigator.clipboard.writeText(exportText).then(() => {
            this.showMessage('تم نسخ النتائج بنجاح', 'success');
        });
    },

    /**
     * فتح جميع النتائج في تبويبات
     */
    openAllResults() {
        if (this.searchResults.length === 0) {
            this.showMessage('لا توجد نتائج', 'warning');
            return;
        }

        // فتح كل نتيجة في تبويب جديد
        this.searchResults.slice(0, 10).forEach((result, index) => {
            const url = `book.html?id=${result.bookId}&section=${result.sectionId}`;
            setTimeout(() => {
                window.open(url, '_blank');
            }, index * 300); // تأخير بين كل فتح
        });

        this.showMessage(`تم فتح ${Math.min(10, this.searchResults.length)} تبويبات`, 'success');
    },

    /**
     * عرض رسالة
     */
    showMessage(message, type = 'info') {
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
    }
};

// تصدير للاستخدام العام
window.TextFinder = TextFinder;
