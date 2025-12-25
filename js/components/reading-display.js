/**
 * Reading Display Component
 * Renders tarot reading interpretation with AI copy feature
 * 
 * @module components/reading-display
 */

import { SPREADS } from '../data/tarot-deck.js';

/**
 * Create reading display
 * @param {Object[]} selectedCards - Array of selected card objects with isReversed flag
 * @param {string} spreadType - Type of spread used
 * @returns {HTMLElement} Reading display container
 */
export function createReadingDisplay(selectedCards, spreadType) {
    const container = document.createElement('div');
    container.className = 'w-full max-w-4xl space-y-6 fade-in pb-12';

    const spread = SPREADS[spreadType];

    container.innerHTML = `
        <div class="glass-panel p-6 md:p-10">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-slate-600 pb-4">
                <h2 class="text-3xl serif text-amber-100">리딩 결과</h2>
            </div>
            
            <div id="reading-cards" class="space-y-8">
                <!-- Card interpretations will be inserted here -->
            </div>
            
            <div id="reading-advice" class="mt-8">
                <!-- Advice section will be inserted here -->
            </div>
            
            <!-- Question Input Section -->
            <div class="mt-10 p-6 bg-slate-700/50 rounded-xl border border-slate-600">
                <h3 class="text-lg font-bold text-purple-300 mb-3">
                    <i class="fas fa-robot mr-2"></i>AI에게 더 자세히 물어보기
                </h3>
                <p class="text-slate-400 text-sm mb-4">질문을 입력하면 타로 결과와 함께 복사됩니다.</p>
                <div class="flex flex-col gap-3">
                    <textarea 
                        id="user-question" 
                        class="w-full p-4 bg-slate-800 border border-slate-600 rounded-xl text-slate-200 placeholder-slate-500 focus:border-purple-500 focus:outline-none resize-none"
                        rows="3" 
                        placeholder="예: 이 상황에서 제가 어떻게 행동해야 할까요? / 연애 운이 좋아지려면 어떻게 해야 하나요?"></textarea>
                    <button id="copy-for-ai" class="btn-copy self-end">
                        <i class="fas fa-copy"></i>
                        <span>결과 복사하기</span>
                    </button>
                </div>
            </div>
            
            <div class="mt-12 text-center">
                <button id="reset-btn" class="btn-secondary">
                    <i class="fas fa-redo mr-2"></i>다시 하기
                </button>
            </div>
        </div>
    `;

    // Render card interpretations
    const cardsContainer = container.querySelector('#reading-cards');
    selectedCards.forEach((card, idx) => {
        const positionName = spread.positions[idx] || `#${idx + 1}`;
        const interpretation = createCardInterpretation(card, positionName);
        cardsContainer.appendChild(interpretation);
    });

    // Render advice
    const adviceContainer = container.querySelector('#reading-advice');
    adviceContainer.appendChild(createAdvice(spreadType));

    // Setup copy button with question input
    const copyBtn = container.querySelector('#copy-for-ai');
    const questionInput = container.querySelector('#user-question');

    copyBtn.addEventListener('click', () => {
        const userQuestion = questionInput.value.trim();
        copyForAI(selectedCards, spreadType, userQuestion);
        copyBtn.classList.add('copied');
        copyBtn.innerHTML = '<i class="fas fa-check"></i><span>복사됨!</span>';
        setTimeout(() => {
            copyBtn.classList.remove('copied');
            copyBtn.innerHTML = '<i class="fas fa-copy"></i><span>결과 복사하기</span>';
        }, 2000);
    });

    return container;
}

/**
 * Create single card interpretation element
 * @param {Object} card - Card object with isReversed flag
 * @param {string} positionName - Position description
 * @returns {HTMLElement}
 */
function createCardInterpretation(card, positionName) {
    const div = document.createElement('div');
    div.className = `reading-card ${card.isReversed ? 'reversed' : ''}`;

    const meaning = card.isReversed ? card.keywords.rev : card.keywords.up;

    div.innerHTML = `
        <h4 class="text-sm uppercase tracking-wider text-slate-400 mb-1">${positionName}</h4>
        <h3 class="text-xl serif font-bold text-amber-200 mb-2">
            ${card.name} 
            <span class="text-sm font-sans font-normal opacity-70">(${card.isReversed ? '역방향' : '정방향'})</span>
        </h3>
        <p class="text-slate-300 leading-relaxed">${meaning}</p>
    `;

    return div;
}

/**
 * Create advice section
 * @param {string} spreadType - Type of spread
 * @returns {HTMLElement}
 */
function createAdvice(spreadType) {
    const div = document.createElement('div');
    div.className = 'reading-advice';

    let specificAdvice = '';
    switch (spreadType) {
        case 'celtic':
            specificAdvice = '켈트 십자가는 복잡한 인생의 실타래를 보여줍니다. 1번(현재)과 10번(결과) 사이의 여정에서 당신의 의지가 가장 중요합니다.';
            break;
        case 'love':
            specificAdvice = '사랑은 두 사람의 에너지가 춤추는 것입니다. 상대방의 마음만큼이나 당신 자신의 마음을 깊이 들여다보세요.';
            break;
        case 'choice':
            specificAdvice = '두 선택지 모두 당신이 걸어갈 수 있는 길입니다. 카드는 각 길의 에너지를 보여줄 뿐, 어느 쪽이 더 나은지는 오직 당신만이 알 수 있습니다.';
            break;
        case 'mbs':
            specificAdvice = '마음, 몸, 영혼은 서로 연결되어 있습니다. 어느 한 부분의 불균형은 다른 곳에 영향을 미칩니다.';
            break;
        default:
            specificAdvice = '카드가 보여주는 메시지는 현재 당신을 둘러싼 에너지의 흐름입니다.';
    }

    div.innerHTML = `
        <h3 class="text-lg font-bold text-purple-300 mb-2">
            <i class="fas fa-moon mr-2"></i>타로 리더의 조언
        </h3>
        <p class="text-slate-200 italic">
            "${specificAdvice} 카드가 보여주는 미래는 정해진 운명이 아니라, 지금 이 순간 당신이 선택할 수 있는 수많은 길 중 하나일 뿐임을 기억하세요."
        </p>
    `;

    return div;
}

/**
 * Copy reading result for AI interpretation
 * @param {Object[]} selectedCards - Array of selected cards
 * @param {string} spreadType - Type of spread
 * @param {string} userQuestion - User's custom question
 */
async function copyForAI(selectedCards, spreadType, userQuestion = '') {
    const spread = SPREADS[spreadType];

    let text = `🔮 타로 리딩 결과를 해석해주세요\n\n`;

    // Add user's question if provided
    if (userQuestion) {
        text += `❓ 질문: ${userQuestion}\n\n`;
    }

    text += `📋 스프레드: ${spread.name}\n\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    selectedCards.forEach((card, idx) => {
        const position = spread.positions[idx];
        const direction = card.isReversed ? '역방향 (Reversed)' : '정방향 (Upright)';
        const meaning = card.isReversed ? card.keywords.rev : card.keywords.up;

        text += `【${position}】\n`;
        text += `🃏 카드: ${card.name}\n`;
        text += `↕️ 방향: ${direction}\n`;
        text += `💫 키워드: ${meaning}\n\n`;
    });

    text += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    if (userQuestion) {
        text += `위 타로 리딩 결과를 바탕으로 "${userQuestion}"에 대해 답변해주세요.\n\n`;
    }

    text += `요청사항:\n`;
    text += `1. 각 카드가 해당 위치에서 가지는 의미를 상세히 설명해주세요.\n`;
    text += `2. 카드들 사이의 연결과 전체적인 메시지를 분석해주세요.\n`;
    text += `3. 현실적이고 실천 가능한 조언을 제공해주세요.\n`;

    try {
        await navigator.clipboard.writeText(text);
    } catch (err) {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }
}

/**
 * Set reset button callback
 * @param {HTMLElement} container - Reading display container
 * @param {Function} onReset - Reset callback function
 */
export function setResetHandler(container, onReset) {
    const resetBtn = container.querySelector('#reset-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', onReset);
    }
}
