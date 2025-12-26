/**
 * Theme Loader Module
 * Manages color theme switching with localStorage persistence
 * 
 * @module utils/theme-loader
 */

const STORAGE_KEY = 'tarot_theme';
const DEFAULT_THEME = 'midnight';

// Theme definitions with metadata
export const THEMES = {
    midnight: {
        name: '미드나잇',
        description: '신비로운 밤',
        preview: ['#0f172a', '#1e1b4b', '#fbbf24']
    },
    monochrome: {
        name: '모노크롬',
        description: '클래식 흑백',
        preview: ['#000000', '#111111', '#ffffff']
    },
    pure_white: {
        name: '퓨어 화이트',
        description: '우아한 골드',
        preview: ['#ffffff', '#fef3c7', '#d97706']
    },
    rose_quartz: {
        name: '로즈 쿼츠',
        description: '부드러운 핑크',
        preview: ['#1a0a10', '#2d1520', '#f9a8d4']
    },
    serenity_blue: {
        name: '세레니티 블루',
        description: '차분한 하늘',
        preview: ['#0a1628', '#1e3a5f', '#7dd3fc']
    },
    living_coral: {
        name: '리빙 코랄',
        description: '활기찬 코랄',
        preview: ['#1a0f0a', '#2d1a12', '#fb923c']
    },
    ultra_violet: {
        name: '울트라 바이올렛',
        description: '창의적 보라',
        preview: ['#14081f', '#2d1b4e', '#a855f7']
    },
    classic_blue: {
        name: '클래식 블루',
        description: '로열 네이비',
        preview: ['#001233', '#001845', '#0466c8']
    },
    greenery: {
        name: '그리너리',
        description: '신비한 숲',
        preview: ['#132a13', '#1a3c1a', '#90be6d']
    },
    viva_magenta: {
        name: '비바 마젠타',
        description: '대담한 마젠타',
        preview: ['#1a050a', '#3b0714', '#be123c']
    },
    peach_fuzz: {
        name: '피치 퍼즈',
        description: '따뜻한 복숭아',
        preview: ['#1a140a', '#2d2012', '#fbbf24']
    }
};

/**
 * Load saved theme or default
 */
export function initTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);
    const theme = saved && THEMES[saved] ? saved : DEFAULT_THEME;
    applyTheme(theme);
    return theme;
}

/**
 * Apply a theme by loading its CSS
 */
export function applyTheme(themeName) {
    if (!THEMES[themeName]) {
        console.warn(`Theme "${themeName}" not found, using default`);
        themeName = DEFAULT_THEME;
    }

    // Remove existing theme class
    document.body.classList.forEach(cls => {
        if (cls.startsWith('theme-')) {
            document.body.classList.remove(cls);
        }
    });

    // Add new theme class
    document.body.classList.add(`theme-${themeName}`);

    // Save preference
    localStorage.setItem(STORAGE_KEY, themeName);

    console.log(`🎨 Theme applied: ${themeName}`);
    return themeName;
}

/**
 * Get current theme
 */
export function getCurrentTheme() {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME;
}

/**
 * Get all available themes
 */
export function getThemeList() {
    return Object.entries(THEMES).map(([id, data]) => ({
        id,
        ...data
    }));
}
