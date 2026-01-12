/* ===================================
   إدارة الثيمات - المكتبة الإسلامية
   =================================== */

const ThemeManager = {
    // المفتاح المستخدم في localStorage
    STORAGE_KEY: 'islamic-library-theme',

    // الثيم الافتراضي
    DEFAULT_THEME: 'light',

    // الثيمات المتاحة
    THEMES: ['light', 'dark'],

    // الثيم الحالي
    currentTheme: null,

    /**
     * تهيئة مدير الثيمات
     */
    init() {
        // الحصول على الثيم المحفوظ أو الافتراضي
        this.currentTheme = this.getSavedTheme() || this.getSystemPreference() || this.DEFAULT_THEME;

        // تطبيق الثيم
        this.applyTheme(this.currentTheme);

        // إعداد مستمع تغيير تفضيلات النظام
        this.setupSystemPreferenceListener();

        // إعداد أزرار التبديل
        this.setupToggleButtons();

        console.log('Theme Manager initialized:', this.currentTheme);
    },

    /**
     * الحصول على الثيم المحفوظ
     */
    getSavedTheme() {
        try {
            return localStorage.getItem(this.STORAGE_KEY);
        } catch (e) {
            console.warn('Unable to access localStorage:', e);
            return null;
        }
    },

    /**
     * حفظ الثيم
     */
    saveTheme(theme) {
        try {
            localStorage.setItem(this.STORAGE_KEY, theme);
        } catch (e) {
            console.warn('Unable to save theme to localStorage:', e);
        }
    },

    /**
     * الحصول على تفضيل النظام
     */
    getSystemPreference() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    },

    /**
     * إعداد مستمع تغيير تفضيلات النظام
     */
    setupSystemPreferenceListener() {
        if (window.matchMedia) {
            const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

            darkModeMediaQuery.addEventListener('change', (e) => {
                // فقط إذا لم يكن هناك تفضيل محفوظ
                if (!this.getSavedTheme()) {
                    this.applyTheme(e.matches ? 'dark' : 'light');
                }
            });
        }
    },

    /**
     * تطبيق الثيم
     */
    applyTheme(theme) {
        if (!this.THEMES.includes(theme)) {
            console.warn('Invalid theme:', theme);
            theme = this.DEFAULT_THEME;
        }

        // تحديث الثيم الحالي
        this.currentTheme = theme;

        // تطبيق الثيم على العنصر الجذر
        document.documentElement.setAttribute('data-theme', theme);

        // تحديث meta theme-color للموبايل
        this.updateMetaThemeColor(theme);

        // تحديث أزرار التبديل
        this.updateToggleButtons(theme);

        // إطلاق حدث تغيير الثيم
        this.dispatchThemeChangeEvent(theme);
    },

    /**
     * تبديل الثيم
     */
    toggle() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
        this.saveTheme(newTheme);
    },

    /**
     * تعيين ثيم معين
     */
    setTheme(theme) {
        this.applyTheme(theme);
        this.saveTheme(theme);
    },

    /**
     * الحصول على الثيم الحالي
     */
    getTheme() {
        return this.currentTheme;
    },

    /**
     * التحقق إذا كان الثيم داكن
     */
    isDark() {
        return this.currentTheme === 'dark';
    },

    /**
     * التحقق إذا كان الثيم فاتح
     */
    isLight() {
        return this.currentTheme === 'light';
    },

    /**
     * تحديث meta theme-color
     */
    updateMetaThemeColor(theme) {
        let metaThemeColor = document.querySelector('meta[name="theme-color"]');

        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.name = 'theme-color';
            document.head.appendChild(metaThemeColor);
        }

        metaThemeColor.content = theme === 'dark' ? '#0a0a14' : '#f5f5f0';
    },

    /**
     * إعداد أزرار التبديل
     */
    setupToggleButtons() {
        // البحث عن جميع أزرار تبديل الثيم
        document.addEventListener('click', (e) => {
            const toggleBtn = e.target.closest('.theme-toggle, [data-theme-toggle]');
            if (toggleBtn) {
                e.preventDefault();
                this.toggle();
            }
        });
    },

    /**
     * تحديث أزرار التبديل
     */
    updateToggleButtons(theme) {
        const toggleButtons = document.querySelectorAll('.theme-toggle, [data-theme-toggle]');

        toggleButtons.forEach(btn => {
            // تحديث aria-label
            btn.setAttribute('aria-label',
                theme === 'dark' ? 'تبديل إلى الوضع الفاتح' : 'تبديل إلى الوضع الداكن'
            );

            // تحديث data-theme
            btn.setAttribute('data-current-theme', theme);
        });
    },

    /**
     * إطلاق حدث تغيير الثيم
     */
    dispatchThemeChangeEvent(theme) {
        const event = new CustomEvent('themechange', {
            detail: { theme, isDark: theme === 'dark' }
        });
        document.dispatchEvent(event);
    },

    /**
     * الاستماع لتغييرات الثيم
     */
    onThemeChange(callback) {
        document.addEventListener('themechange', (e) => {
            callback(e.detail);
        });
    }
};

// تهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.init();
});

// تصدير للاستخدام العام
window.ThemeManager = ThemeManager;
