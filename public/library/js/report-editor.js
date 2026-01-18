/* ===================================
   محرر التقارير - المكتبة الإسلامية
   =================================== */

const ReportEditor = {
    currentReport: null,
    savedReports: [],
    autoSaveInterval: null,

    /**
     * تهيئة محرر التقارير
     */
    init() {
        this.loadSavedReports();
        this.bindEvents();
        this.setupAutoSave();
        console.log('Report Editor initialized');
    },

    /**
     * ربط الأحداث
     */
    bindEvents() {
        const textarea = document.getElementById('report-content');
        const titleInput = document.getElementById('report-title');
        const authorInput = document.getElementById('report-author');

        // تحديث الحالة أثناء الكتابة
        textarea?.addEventListener('input', () => {
            this.updateStatus();
            this.markUnsaved();
        });

        titleInput?.addEventListener('input', () => {
            this.markUnsaved();
        });

        authorInput?.addEventListener('input', () => {
            this.markUnsaved();
        });

        // أزرار التنسيق
        document.getElementById('bold-btn')?.addEventListener('click', () => {
            this.applyFormat('bold');
        });

        document.getElementById('italic-btn')?.addEventListener('click', () => {
            this.applyFormat('italic');
        });

        document.getElementById('underline-btn')?.addEventListener('click', () => {
            this.applyFormat('underline');
        });

        document.getElementById('heading-btn')?.addEventListener('click', () => {
            this.insertHeading();
        });

        document.getElementById('quote-btn')?.addEventListener('click', () => {
            this.insertQuote();
        });

        document.getElementById('list-btn')?.addEventListener('click', () => {
            this.insertList();
        });

        // أزرار التراجع والإعادة
        document.getElementById('undo-btn')?.addEventListener('click', () => {
            document.execCommand('undo', false, null);
        });

        document.getElementById('redo-btn')?.addEventListener('click', () => {
            document.execCommand('redo', false, null);
        });

        // أزرار الإجراءات الرئيسية
        document.getElementById('download-btn')?.addEventListener('click', () => {
            this.downloadReport();
        });

        document.getElementById('print-btn')?.addEventListener('click', () => {
            this.printReport();
        });

        document.getElementById('share-btn')?.addEventListener('click', () => {
            this.shareReport();
        });

        document.getElementById('save-btn')?.addEventListener('click', () => {
            this.saveReport();
        });

        document.getElementById('preview-btn')?.addEventListener('click', () => {
            this.togglePreview();
        });

        document.getElementById('clear-report-btn')?.addEventListener('click', () => {
            if (confirm('هل تريد حذف جميع المحتوى؟')) {
                document.getElementById('report-content').value = '';
                document.getElementById('report-title').value = '';
                this.updateStatus();
                this.markUnsaved();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 's') {
                    e.preventDefault();
                    this.saveReport();
                }
            }
        });
    },

    /**
     * تطبيق تنسيق
     */
    applyFormat(format) {
        const textarea = document.getElementById('report-content');
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);

        if (!selectedText) {
            this.showToast('الرجاء تحديد نص أولاً');
            return;
        }

        let formattedText = selectedText;

        switch (format) {
            case 'bold':
                formattedText = `**${selectedText}**`;
                break;
            case 'italic':
                formattedText = `*${selectedText}*`;
                break;
            case 'underline':
                formattedText = `__${selectedText}__`;
                break;
        }

        const newText = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
        textarea.value = newText;
        textarea.setSelectionRange(start + formattedText.length, start + formattedText.length);

        this.updateStatus();
        this.markUnsaved();
    },

    /**
     * إدراج عنوان
     */
    insertHeading() {
        const textarea = document.getElementById('report-content');
        const start = textarea.selectionStart;
        const heading = '## عنوان جديد\n';

        const newText = textarea.value.substring(0, start) + heading + textarea.value.substring(start);
        textarea.value = newText;

        this.updateStatus();
        this.markUnsaved();
    },

    /**
     * إدراج اقتباس
     */
    insertQuote() {
        const textarea = document.getElementById('report-content');
        const start = textarea.selectionStart;
        const quote = '\n> اقتباس من النص\n\n';

        const newText = textarea.value.substring(0, start) + quote + textarea.value.substring(start);
        textarea.value = newText;

        this.updateStatus();
        this.markUnsaved();
    },

    /**
     * إدراج قائمة
     */
    insertList() {
        const textarea = document.getElementById('report-content');
        const start = textarea.selectionStart;
        const list = '\n- عنصر الأول\n- عنصر الثاني\n- عنصر الثالث\n\n';

        const newText = textarea.value.substring(0, start) + list + textarea.value.substring(start);
        textarea.value = newText;

        this.updateStatus();
        this.markUnsaved();
    },

    /**
     * تحديث الحالة
     */
    updateStatus() {
        const content = document.getElementById('report-content').value;
        const charCount = content.length;
        const wordCount = content.trim().split(/\s+/).filter(w => w).length;

        document.getElementById('char-count').textContent = charCount;
        document.getElementById('word-count').textContent = wordCount;
    },

    /**
     * وضع علامة غير محفوظ
     */
    markUnsaved() {
        const statusEl = document.getElementById('auto-save-status');
        statusEl.textContent = 'غير محفوظ';
        statusEl.style.color = 'var(--accent-dark)';
    },

    /**
     * الحفظ التلقائي
     */
    setupAutoSave() {
        this.autoSaveInterval = setInterval(() => {
            this.autoSave();
        }, 30000); // كل 30 ثانية
    },

    /**
     * حفظ تلقائي
     */
    autoSave() {
        const content = document.getElementById('report-content').value;
        if (content.trim()) {
            const report = {
                title: document.getElementById('report-title').value || 'تقرير بدون عنوان',
                content: content,
                author: document.getElementById('report-author').value,
                category: document.getElementById('report-category').value,
                timestamp: new Date(),
                isAutoSave: true
            };

            localStorage.setItem('report-autosave', JSON.stringify(report));

            const statusEl = document.getElementById('auto-save-status');
            statusEl.textContent = 'محفوظ تلقائياً';
            statusEl.style.color = 'var(--text-muted)';
        }
    },

    /**
     * حفظ التقرير
     */
    saveReport() {
        const title = document.getElementById('report-title').value.trim();
        const content = document.getElementById('report-content').value.trim();

        if (!content) {
            this.showToast('الرجاء إدخال محتوى التقرير');
            return;
        }

        const report = {
            id: Date.now(),
            title: title || 'تقرير بدون عنوان',
            content: content,
            author: document.getElementById('report-author').value,
            category: document.getElementById('report-category').value,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        this.savedReports.push(report);
        localStorage.setItem('saved-reports', JSON.stringify(this.savedReports));

        this.showToast('تم حفظ التقرير بنجاح');

        // تحديث حالة الحفظ
        const statusEl = document.getElementById('auto-save-status');
        statusEl.textContent = 'محفوظ';
        statusEl.style.color = 'var(--accent-primary)';
    },

    /**
     * تحميل التقرير
     */
    downloadReport() {
        const title = document.getElementById('report-title').value || 'تقريري';
        const content = document.getElementById('report-content').value;
        const author = document.getElementById('report-author').value;

        if (!content.trim()) {
            this.showToast('لا يوجد محتوى لتحميله');
            return;
        }

        const text = `${title}\n${'='.repeat(title.length)}\n\nالكاتب: ${author || 'غير محدد'}\nالتاريخ: ${new Date().toLocaleDateString('ar-EG')}\n\n${content}`;

        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${title}.txt`;
        link.click();

        this.showToast('تم تحميل التقرير بنجاح');
    },

    /**
     * طباعة التقرير
     */
    printReport() {
        const title = document.getElementById('report-title').value || 'تقريري';
        const content = document.getElementById('report-content').value;
        const author = document.getElementById('report-author').value;

        if (!content.trim()) {
            this.showToast('لا يوجد محتوى لطباعته');
            return;
        }

        const printWindow = window.open('', '', 'height=600,width=800');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html dir="rtl">
            <head>
                <meta charset="utf-8">
                <title>${title}</title>
                <style>
                    body { font-family: "Amiri", serif; direction: rtl; }
                    h1 { text-align: center; margin-bottom: 20px; }
                    .header { text-align: center; margin-bottom: 30px; color: #666; }
                    .content { line-height: 1.8; white-space: pre-wrap; }
                </style>
            </head>
            <body>
                <h1>${this.escapeHtml(title)}</h1>
                <div class="header">
                    <p>الكاتب: ${this.escapeHtml(author || 'غير محدد')}</p>
                    <p>التاريخ: ${new Date().toLocaleDateString('ar-EG')}</p>
                </div>
                <div class="content">${this.escapeHtml(content)}</div>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();

        this.showToast('تم فتح نافذة الطباعة');
    },

    /**
     * مشاركة التقرير
     */
    shareReport() {
        const title = document.getElementById('report-title').value || 'تقريري';
        const content = document.getElementById('report-content').value;

        if (!content.trim()) {
            this.showToast('لا يوجد محتوى للمشاركة');
            return;
        }

        const shareText = `${title}\n${content}`;

        if (navigator.share) {
            navigator.share({
                title: title,
                text: shareText
            }).catch(err => console.log('Error sharing:', err));
        } else {
            // نسخ إلى الحافظة كبديل
            navigator.clipboard.writeText(shareText).then(() => {
                this.showToast('تم نسخ التقرير إلى الحافظة');
            });
        }
    },

    /**
     * المعاينة
     */
    togglePreview() {
        const editor = document.querySelector('.editor-content');
        editor.classList.toggle('preview-mode');

        if (editor.classList.contains('preview-mode')) {
            const content = document.getElementById('report-content').value;
            const preview = document.createElement('div');
            preview.className = 'report-preview';
            preview.innerHTML = this.markdownToHtml(content);
            editor.innerHTML = '';
            editor.appendChild(preview);
        } else {
            const textarea = document.createElement('textarea');
            textarea.id = 'report-content';
            textarea.className = 'report-textarea';
            textarea.placeholder = 'ابدأ في كتابة تقريرك هنا...';
            textarea.value = document.getElementById('report-content')?.value || '';
            editor.innerHTML = '';
            editor.appendChild(textarea);

            // إعادة ربط أحداث التيكست إريا
            this.bindEvents();
        }
    },

    /**
     * تحويل Markdown إلى HTML
     */
    markdownToHtml(markdown) {
        let html = this.escapeHtml(markdown);

        // الفقرات
        html = html.replace(/\n\n/g, '</p><p>');
        html = '<p>' + html + '</p>';

        // العناوين
        html = html.replace(/## (.*?)<\/p>/g, '</p><h2>$1</h2><p>');

        // التنسيق الجريء
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // التنسيق المائل
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

        // الاقتباسات
        html = html.replace(/&gt; (.*?)<\/p>/g, '</p><blockquote>$1</blockquote><p>');

        return html;
    },

    /**
     * تحميل التقارير المحفوظة
     */
    loadSavedReports() {
        try {
            const saved = localStorage.getItem('saved-reports');
            this.savedReports = saved ? JSON.parse(saved) : [];
        } catch (e) {
            this.savedReports = [];
        }
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
    ReportEditor.init();
});

// تصدير للاستخدام العام
window.ReportEditor = ReportEditor;
