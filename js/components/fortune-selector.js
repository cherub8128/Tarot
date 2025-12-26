/**
 * Fortune Selector Component
 * Main menu for selecting fortune type and reading mode
 * 
 * @module components/fortune-selector
 */

import { FORTUNE_TYPES, READING_MODES } from '../data/fortune-types.js';
import { SPREADS } from '../data/tarot-deck.js';

/**
 * Create main fortune selector UI
 * @param {Object} callbacks - Callback functions
 * @returns {HTMLElement} Fortune selector container
 */
export function createFortuneSelector(callbacks) {
    const container = document.createElement('div');
    container.className = 'w-full max-w-5xl space-y-8 fade-in';

    container.innerHTML = `
        <!-- Fortune Type Selection -->
        <div class="glass-panel p-6 md:p-8">
            <h2 class="text-2xl serif mb-2 text-primary text-center">어떤 운세가 궁금하신가요?</h2>
            <p class="text-secondary text-sm text-center mb-6">궁금한 분야를 선택하세요</p>
            
            <div id="fortune-types" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <!-- Fortune type buttons -->
            </div>
        </div>
        
        <!-- Reading Mode Selection (hidden initially) -->
        <div id="mode-section" class="glass-panel p-6 md:p-8 hidden fade-in-scale">
            <h2 class="text-xl serif mb-4 text-primary text-center">리딩 방식을 선택하세요</h2>
            
            <div class="flex flex-col md:flex-row gap-4 justify-center">
                <button id="mode-spread" class="fortune-btn flex-1 max-w-xs">
                    <i class="fas fa-layer-group fortune-btn-icon text-accent"></i>
                    <span class="fortune-btn-label">스프레드 선택</span>
                    <span class="fortune-btn-desc">정해진 배열로 카드를 뽑습니다</span>
                </button>
                
                <button id="mode-open" class="fortune-btn flex-1 max-w-xs">
                    <i class="fas fa-comment-dots fortune-btn-icon text-accent-sec"></i>
                    <span class="fortune-btn-label">자유 질문</span>
                    <span class="fortune-btn-desc">질문을 입력하고 카드 수를 선택합니다</span>
                </button>
            </div>
        </div>
        
        <!-- Spread Selection (hidden initially) -->
        <div id="spread-section" class="glass-panel p-6 md:p-8 hidden fade-in-scale">
            <h2 class="text-xl serif mb-4 text-primary text-center">스프레드를 선택하세요</h2>
            <div id="spread-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <!-- Spread buttons -->
            </div>
        </div>
        
        <!-- Open Question Section (hidden initially) -->
        <div id="question-section" class="glass-panel p-6 md:p-8 hidden fade-in-scale">
            <h2 class="text-xl serif mb-4 text-primary text-center">질문을 입력하세요</h2>
            
            <div class="max-w-2xl mx-auto space-y-4">
                <textarea 
                    id="open-question-input"
                    class="question-input"
                    rows="3"
                    placeholder="예: 새로운 직장으로 옮기는 것이 좋을까요? / 이번 시험 결과는 어떨까요?"
                ></textarea>
                
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-4">
                        <span class="text-secondary text-sm">카드 수:</span>
                        <div class="flex gap-2">
                            ${[1, 3, 5].map(n => `
                                <button class="card-count-btn px-4 py-2 rounded-lg ${n === 3 ? 'active' : ''}" data-count="${n}">
                                    ${n}장
                                </button>
                            `).join('')}
                        </div>
                    </div>
                    
                    <button id="start-open-reading" class="btn-primary">
                        <i class="fas fa-magic mr-2"></i>시작하기
                    </button>
                </div>
            </div>
        </div>
    `;

    // Render fortune type buttons
    const fortuneTypesContainer = container.querySelector('#fortune-types');
    Object.values(FORTUNE_TYPES).forEach(fortune => {
        const btn = createFortuneTypeButton(fortune, () => {
            // Highlight selected
            container.querySelectorAll('#fortune-types .fortune-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Show mode section
            container.querySelector('#mode-section').classList.remove('hidden');
            container.querySelector('#spread-section').classList.add('hidden');
            container.querySelector('#question-section').classList.add('hidden');

            callbacks.onFortuneSelect?.(fortune.id);
        });
        fortuneTypesContainer.appendChild(btn);
    });

    // Render spread buttons
    const spreadGrid = container.querySelector('#spread-grid');
    Object.entries(SPREADS).forEach(([key, spread]) => {
        const btn = createSpreadButton(key, spread, () => {
            callbacks.onSpreadSelect?.(key);
        });
        spreadGrid.appendChild(btn);
    });

    // Mode button handlers
    container.querySelector('#mode-spread').addEventListener('click', () => {
        container.querySelector('#spread-section').classList.remove('hidden');
        container.querySelector('#question-section').classList.add('hidden');
        callbacks.onModeSelect?.('spread');
    });

    container.querySelector('#mode-open').addEventListener('click', () => {
        container.querySelector('#question-section').classList.remove('hidden');
        container.querySelector('#spread-section').classList.add('hidden');
        callbacks.onModeSelect?.('openQuestion');
    });

    // Card count buttons
    container.querySelectorAll('.card-count-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            container.querySelectorAll('.card-count-btn').forEach(b => {
                b.classList.remove('active');
            });
            btn.classList.add('active');
        });
    });

    // Start open reading
    container.querySelector('#start-open-reading').addEventListener('click', () => {
        const question = container.querySelector('#open-question-input').value.trim();
        const cardCount = parseInt(container.querySelector('.card-count-btn.active').dataset.count);
        callbacks.onOpenQuestion?.(question, cardCount);
    });

    return container;
}

/**
 * Create fortune type button
 */
function createFortuneTypeButton(fortune, onClick) {
    const btn = document.createElement('button');
    btn.className = 'fortune-btn';
    // Use fortune.color if desired, or override with theme colors
    // Here keeping fortune.color for icon distinctiveness, but using CSS variables for button parts
    btn.innerHTML = `
        <i class="fas ${fortune.icon} fortune-btn-icon ${fortune.color}"></i>
        <span class="fortune-btn-label">${fortune.name}</span>
        <span class="fortune-btn-desc">${fortune.description}</span>
    `;
    btn.addEventListener('click', onClick);
    return btn;
}

/**
 * Create spread button
 */
function createSpreadButton(key, spread, onClick) {
    const icons = {
        single: 'fa-square',
        twoChoice: 'fa-scale-balanced',
        threeCard: 'fa-ellipsis',
        diamond: 'fa-diamond',
        cross: 'fa-plus',
        celtic: 'fa-cross'
    };

    const btn = document.createElement('button');
    btn.className = 'spread-card group';
    // Removed hardcoded text-amber-400 and text-white
    btn.innerHTML = `
        <i class="fas ${icons[key] || 'fa-layer-group'} text-2xl text-accent mb-2 group-hover:scale-110 transition-transform"></i>
        <h3 class="font-bold text-primary">${spread.name}</h3>
        <p class="text-xs text-secondary mt-1">${spread.description || spread.cardCount + '장'}</p>
    `;
    btn.addEventListener('click', onClick);
    return btn;
}
