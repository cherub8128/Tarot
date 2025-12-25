/**
 * Spread Selector Component
 * Handles spread type selection UI
 * 
 * @module components/spread-selector
 */

import { SPREADS } from '../data/tarot-deck.js';

/**
 * Spread configuration with icons
 */
const SPREAD_CONFIG = {
    daily: {
        icon: 'fa-sun',
        iconColor: 'text-amber-400',
        description: '하루를 위한 1장의 카드'
    },
    three: {
        icon: 'fa-hourglass-half',
        iconColor: 'text-purple-400',
        description: '흐름을 읽는 3장의 카드'
    },
    choice: {
        icon: 'fa-scale-balanced',
        iconColor: 'text-emerald-400',
        description: '선택의 기로에서'
    },
    love: {
        icon: 'fa-heart',
        iconColor: 'text-rose-400',
        description: '나, 그 사람, 그리고 우리'
    },
    mbs: {
        icon: 'fa-spa',
        iconColor: 'text-cyan-400',
        description: '내면의 균형 찾기'
    },
    celtic: {
        icon: 'fa-cross',
        iconColor: 'text-amber-200',
        description: '깊이 있는 10장의 통찰'
    }
};

/**
 * Create spread selector UI
 * @param {Function} onSelect - Callback when spread is selected
 * @returns {HTMLElement} Spread selector container
 */
export function createSpreadSelector(onSelect) {
    const container = document.createElement('div');
    container.className = 'w-full max-w-4xl text-center space-y-6 fade-in';

    container.innerHTML = `
        <div class="glass-panel p-8">
            <h2 class="text-2xl serif mb-6 text-amber-100">어떤 조언이 필요하신가요?</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="spread-grid">
                <!-- Spread buttons will be inserted here -->
            </div>
        </div>
    `;

    const grid = container.querySelector('#spread-grid');

    Object.entries(SPREADS).forEach(([key, spread]) => {
        const config = SPREAD_CONFIG[key];
        const button = createSpreadButton(key, spread.name, config, onSelect);
        grid.appendChild(button);
    });

    return container;
}

/**
 * Create individual spread button
 * @param {string} type - Spread type key
 * @param {string} name - Spread display name
 * @param {Object} config - Button configuration
 * @param {Function} onSelect - Selection callback
 * @returns {HTMLElement} Button element
 */
function createSpreadButton(type, name, config, onSelect) {
    const button = document.createElement('button');
    button.className = 'spread-card group';

    // Celtic cross spans full width on mobile/tablet
    if (type === 'celtic') {
        button.classList.add('col-span-1', 'md:col-span-2', 'lg:col-span-1');
    }

    button.innerHTML = `
        <i class="fas ${config.icon} text-2xl ${config.iconColor} mb-2 group-hover:scale-110 transition-transform"></i>
        <h3 class="font-bold text-white">${name}</h3>
        <p class="text-xs text-slate-400 mt-1">${config.description}</p>
    `;

    button.addEventListener('click', () => onSelect(type));

    return button;
}

/**
 * Get spread info by type
 * @param {string} type - Spread type key
 * @returns {Object} Spread data with config
 */
export function getSpreadInfo(type) {
    return {
        ...SPREADS[type],
        ...SPREAD_CONFIG[type]
    };
}
