/**
 * Tarot Card Component
 * Handles card rendering and flip animations
 * 
 * @module components/tarot-card
 */

import { getCardIcon, toRoman } from '../data/tarot-deck.js';

/**
 * Create tarot card HTML element
 * @param {Object} card - Card data object
 * @param {number} index - Card position index
 * @param {boolean} isReversed - Whether card is reversed
 * @param {string} sizeClass - CSS size classes
 * @returns {HTMLElement} Card container element
 */
export function createCardElement(card, index, isReversed, sizeClass = 'w-32 h-52 md:w-48 md:h-72') {
    const container = document.createElement('div');
    container.className = `card-container ${sizeClass} cursor-pointer`;
    container.dataset.index = index;
    container.dataset.reversed = isReversed;

    const suitClass = card.type === 'major' ? 'major-arcana' : card.suit.toLowerCase();
    const topLabel = card.type === 'major' ? toRoman(card.number) : card.suit;

    container.innerHTML = `
        <div class="card-inner" id="card-${index}">
            <div class="card-face card-back">
                <div class="w-16 h-16 border-2 border-amber-500/30 rounded-full flex items-center justify-center spin-slow">
                    <i class="fas fa-moon text-2xl text-amber-500/50"></i>
                </div>
            </div>
            <div class="card-face card-front ${suitClass}">
                <img src="${card.image}" alt="${card.name}" class="w-full h-full object-cover" loading="lazy">
                <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                    <h3 class="font-serif font-bold text-xs md:text-sm text-white text-center leading-tight">
                        ${card.name}
                    </h3>
                    <div class="text-center mt-1">
                        <span class="text-[8px] md:text-[10px] font-semibold px-2 py-0.5 rounded-full ${isReversed ? 'bg-rose-600 text-white' : 'bg-amber-500 text-black'}">
                            ${isReversed ? '역방향' : '정방향'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    `;

    return container;
}

/**
 * Flip a card with animation
 * @param {HTMLElement} cardContainer - Card container element
 * @param {boolean} isReversed - Whether to apply reversed rotation
 * @returns {Promise} Resolves when flip animation completes
 */
export function flipCard(cardContainer, isReversed) {
    return new Promise((resolve) => {
        if (cardContainer.classList.contains('flipped')) {
            resolve(false);
            return;
        }

        cardContainer.classList.add('flipped');

        // Apply reversal rotation after flip starts
        if (isReversed) {
            setTimeout(() => {
                const front = cardContainer.querySelector('.card-front');
                if (front) {
                    front.classList.add('reversed');
                }
            }, 200);
        }

        // Resolve after animation completes
        setTimeout(() => resolve(true), 800);
    });
}

/**
 * Flip all cards sequentially
 * @param {HTMLElement[]} cardContainers - Array of card containers
 * @param {boolean[]} reversals - Array of reversal flags
 * @param {number} delay - Delay between each flip (ms)
 * @returns {Promise} Resolves when all cards are flipped
 */
export async function flipAllCards(cardContainers, reversals, delay = 300) {
    const promises = [];

    for (let i = 0; i < cardContainers.length; i++) {
        promises.push(
            new Promise(resolve => {
                setTimeout(() => {
                    flipCard(cardContainers[i], reversals[i]).then(resolve);
                }, i * delay);
            })
        );
    }

    await Promise.all(promises);
}

/**
 * Create card deck visual (for unflipped state)
 * @param {number} count - Number of cards to display
 * @returns {HTMLElement[]} Array of card elements
 */
export function createCardDeck(count) {
    const cards = [];

    for (let i = 0; i < count; i++) {
        const card = document.createElement('div');
        card.className = 'w-32 h-52 md:w-48 md:h-72 card-container';
        card.innerHTML = `
            <div class="card-inner">
                <div class="card-face card-back">
                    <div class="w-16 h-16 border-2 border-amber-500/30 rounded-full flex items-center justify-center">
                        <i class="fas fa-moon text-2xl text-amber-500/50"></i>
                    </div>
                </div>
            </div>
        `;
        cards.push(card);
    }

    return cards;
}
