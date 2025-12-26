/**
 * Reading Display Component
 * Renders tarot reading interpretation with fortune-specific meanings
 * 
 * @module components/reading-display
 */

import { SPREADS } from '../data/tarot-deck.js';
import { loadInterpretation, getCardInterpretation, getAllPositionLabels } from '../data/interpretation-loader.js';

// Store for current fortune type
let currentFortuneType = 'general';

/**
 * Set the current fortune type for interpretations
 * @param {string} fortuneType - Fortune type
 */
export function setFortuneType(fortuneType) {
    currentFortuneType = fortuneType;
}

/**
 * Create reading display
 * @param {Object[]} selectedCards - Array of selected card objects with isReversed flag
 * @param {string} spreadType - Type of spread used
 * @param {string} fortuneType - Fortune type for interpretations
 * @returns {HTMLElement} Reading display container
 */
export function createReadingDisplay(selectedCards, spreadType, fortuneType = 'general') {
    currentFortuneType = fortuneType;

    const container = document.createElement('div');
    container.className = 'w-full max-w-4xl space-y-6 fade-in pb-12';

    const spread = SPREADS[spreadType];

    container.innerHTML = `
        <div class="glass-panel p-6 md:p-10">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-slate-600 pb-4">
                <div>
                    <h2 class="text-3xl serif text-amber-100">리딩 결과</h2>
                    <span class="text-sm text-purple-300" id="fortune-type-label"></span>
                </div>
            </div>
            
            <div id="reading-cards" class="space-y-8">
                <!-- Card interpretations will be inserted here -->
                <div class="text-center text-slate-400">
                    <i class="fas fa-spinner fa-spin mr-2"></i>해석을 불러오는 중...
                </div>
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

    // Load interpretations async and render
    renderInterpretations(container, selectedCards, spreadType, fortuneType);

    // Setup copy button with question input
    const copyBtn = container.querySelector('#copy-for-ai');
    const questionInput = container.querySelector('#user-question');

    copyBtn.addEventListener('click', () => {
        const userQuestion = questionInput.value.trim();
        copyForAI(selectedCards, spreadType, userQuestion, fortuneType);
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
 * Render interpretations asynchronously
 */
async function renderInterpretations(container, selectedCards, spreadType, fortuneType) {
    try {
        const interpretation = await loadInterpretation(fortuneType);
        const spread = SPREADS[spreadType];

        // Update fortune type label
        const label = container.querySelector('#fortune-type-label');
        if (label && interpretation.meta) {
            label.textContent = interpretation.meta.name;
        }

        // Get fortune-specific position labels
        const positionLabels = interpretation.positions?.[spreadType] || {};

        // Render card interpretations
        const cardsContainer = container.querySelector('#reading-cards');
        cardsContainer.innerHTML = '';

        for (let idx = 0; idx < selectedCards.length; idx++) {
            const card = selectedCards[idx];
            const defaultPosition = spread.positions[idx] || `#${idx + 1}`;
            const positionName = positionLabels[defaultPosition] || defaultPosition;

            // Get fortune-specific card meaning
            const meaning = await getCardMeaning(card, interpretation);

            const interpretationEl = createCardInterpretation(card, positionName, meaning);
            cardsContainer.appendChild(interpretationEl);
        }

        // Render advice
        const adviceContainer = container.querySelector('#reading-advice');
        adviceContainer.innerHTML = '';
        adviceContainer.appendChild(createAdvice(spreadType, fortuneType));

    } catch (error) {
        console.error('Failed to render interpretations:', error);
        const cardsContainer = container.querySelector('#reading-cards');
        cardsContainer.innerHTML = `
            <div class="text-center text-red-400">
                <i class="fas fa-exclamation-triangle mr-2"></i>해석을 불러오는 데 실패했습니다.
            </div>
        `;
    }
}

/**
 * Get card meaning from interpretation data
 */
async function getCardMeaning(card, interpretation) {
    const direction = card.isReversed ? 'reversed' : 'upright';

    if (card.type === 'major') {
        const cardData = interpretation.cards?.major?.[card.name];
        if (cardData) {
            return cardData[direction];
        }
    } else {
        // Minor arcana - use suit-based general interpretation
        const suitData = interpretation.cards?.minor?.[card.suit]?.general;
        if (suitData) {
            return suitData[direction];
        }
    }

    // Fallback to card keywords
    return card.isReversed ? card.keywords.rev : card.keywords.up;
}

/**
 * Create single card interpretation element
 * @param {Object} card - Card object with isReversed flag
 * @param {string} positionName - Position description
 * @param {string} meaning - Card meaning
 * @returns {HTMLElement}
 */
function createCardInterpretation(card, positionName, meaning) {
    const div = document.createElement('div');
    div.className = `reading-card ${card.isReversed ? 'reversed' : ''}`;

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
 * @param {string} fortuneType - Fortune type
 * @returns {HTMLElement}
 */
function createAdvice(spreadType, fortuneType) {
    const div = document.createElement('div');
    // Only show advice if we have meaningful content, otherwise make it hidden or minimal
    // For now, we'll keep it but make it very concise and magical

    div.className = 'reading-advice fade-in';

    // Fortune-specific wisdom
    const wisdomMap = {
        love: '사랑의 해답은 이미 당신의 마음 속에 있습니다.',
        study: '배움의 길에서 가장 중요한 것은 끊임없는 호기심입니다.',
        success: '성공은 목적지가 아니라 여정 그 자체입니다.',
        money: '진정한 풍요는 물질과 마음의 균형에서 옵니다.',
        general: '우연은 운명이 당신에게 말을 거는 방식입니다.'
    };

    const wisdom = wisdomMap[fortuneType] || wisdomMap.general;

    div.innerHTML = `
        <h3 class="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-amber-200 mb-3">
            <i class="fas fa-moon mr-2 text-purple-400"></i>운명의 조언
        </h3>
        <p class="text-slate-200 font-serif text-lg leading-relaxed italic border-l-2 border-purple-500/30 pl-4">
            "${wisdom}"
        </p>
        <p class="text-sm text-slate-400 mt-3 text-right">
            - Digital Entropy Tarot
        </p>
    `;

    return div;
}

/**
 * Copy reading result for AI interpretation
 */
async function copyForAI(selectedCards, spreadType, userQuestion = '', fortuneType = 'general') {
    const spread = SPREADS[spreadType];
    let interpretation;

    try {
        interpretation = await loadInterpretation(fortuneType);
    } catch (e) {
        interpretation = { meta: { name: '일반 운세' }, positions: {} };
    }

    let text = `🔮 타로 리딩 결과를 해석해주세요\n\n`;

    // Add user's question if provided
    if (userQuestion) {
        text += `❓ 질문: ${userQuestion}\n\n`;
    }

    text += `📋 운세 타입: ${interpretation.meta?.name || fortuneType}\n`;
    text += `📋 스프레드: ${spread.name}\n\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    const positionLabels = interpretation.positions?.[spreadType] || {};

    for (let idx = 0; idx < selectedCards.length; idx++) {
        const card = selectedCards[idx];
        const defaultPosition = spread.positions[idx];
        const position = positionLabels[defaultPosition] || defaultPosition;
        const direction = card.isReversed ? '역방향 (Reversed)' : '정방향 (Upright)';
        const meaning = await getCardMeaning(card, interpretation);

        text += `【${position}】\n`;
        text += `🃏 카드: ${card.name}\n`;
        text += `↕️ 방향: ${direction}\n`;
        text += `💫 해석: ${meaning}\n\n`;
    }

    text += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    if (userQuestion) {
        text += `위 타로 리딩 결과를 바탕으로 "${userQuestion}"에 대해 답변해주세요.\n\n`;
    }

    text += `요청사항:\n`;
    text += `1. 각 카드가 ${interpretation.meta?.name || '운세'} 관점에서 가지는 의미를 설명해주세요.\n`;
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
