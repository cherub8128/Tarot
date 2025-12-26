/**
 * Digital Entropy Tarot - Main Application
 * Card reveal flow fixed, view toggle, and history feature
 * 
 * @module app
 */

import { createDeck, SPREADS } from './data/tarot-deck.js';
import { FORTUNE_TYPES } from './data/fortune-types.js';
import { getSpreadLayout } from './data/spread-layouts.js';
import { EntropyCollector } from './utils/entropy-engine.js';
import { shuffleDeck, generateReversals } from './utils/seeded-random.js';
import { ParticleSystem } from './components/particle-system.js';
import { createCardElement, flipCard, flipAllCards } from './components/tarot-card.js';
import { createFortuneSelector } from './components/fortune-selector.js';
import { createReadingDisplay, setResetHandler } from './components/reading-display.js';
import { saveReading, getReadingHistory, deleteReading } from './utils/reading-history.js';
import { appState } from './core/app-state.js';
import { stepController } from './core/step-controller.js';

/**
 * Main Application Class
 */
class TarotApp {
    constructor() {
        this.deck = [];
        this.particleSystem = null;
        this.entropyCollector = null;
        this.cardContainers = [];
        this.flippedCount = 0;
        this.allFlipped = false;
        this.currentView = 'cards'; // 'cards' or 'reading'

        // Settings
        this.settings = {
            allowReversed: true,
            selectedFortune: 'general',
            selectedSpread: null,
            openQuestion: '',
            cardCount: 3
        };

        // DOM References
        this.elements = {};
    }

    /**
     * Initialize the application
     */
    async init() {
        this._initDOMReferences();

        // Initialize deck
        this.deck = createDeck();
        appState.setDeck(this.deck);

        // Initialize particle system
        this.particleSystem = new ParticleSystem(this.elements.canvas);
        this.particleSystem.start();

        // Initialize entropy collector
        this._initEntropyCollector();

        // Initialize step controller
        stepController.init({
            selection: this.elements.selectionStep,
            ritual: this.elements.ritualStep,
            reveal: this.elements.revealStep,
            reading: this.elements.readingStep
        });

        // Setup fortune selector
        this._setupFortuneSelector();

        // Setup reveal button
        this._setupRevealButton();

        // Add navigation buttons (home, history)
        this._addNavigationButtons();

        // Subscribe to state changes
        this._subscribeToStateChanges();

        console.log('🔮 Digital Entropy Tarot initialized');
    }

    _initDOMReferences() {
        this.elements = {
            canvas: document.getElementById('entropy-canvas'),
            mainContainer: document.getElementById('main-container'),
            selectionStep: document.getElementById('step-selection'),
            ritualStep: document.getElementById('step-ritual'),
            revealStep: document.getElementById('step-reveal'),
            readingStep: document.getElementById('step-reading'),
            cardsArea: document.getElementById('cards-area'),
            entropyBar: document.getElementById('entropy-bar'),
            entropyPercent: document.getElementById('entropy-percent'),
            entropySamples: document.getElementById('entropy-samples'),
            revealBtn: document.getElementById('reveal-btn')
        };
    }

    _initEntropyCollector() {
        this.entropyCollector = new EntropyCollector({
            targetBits: 512,
            onProgress: (progress) => {
                this._updateEntropyUI(progress);
                appState.updateEntropyProgress(progress);
            },
            onSample: ({ source, data, bits }) => {
                if (source === 'mouse' || source === 'touch') {
                    this.particleSystem.magicTrail(data.x, data.y, 1 + bits / 10);
                }
                const stats = this.entropyCollector.getPool().getStats();
                if (this.elements.entropySamples) {
                    this.elements.entropySamples.textContent = stats.sampleCount;
                }
            },
            onComplete: (seed) => {
                this._onEntropyComplete(seed);
            }
        });
    }

    _updateEntropyUI(progress) {
        if (this.elements.entropyBar) {
            this.elements.entropyBar.style.width = `${progress}%`;
        }
        if (this.elements.entropyPercent) {
            this.elements.entropyPercent.textContent = `${Math.floor(progress)}%`;
        }
    }

    _onEntropyComplete(seed) {
        let cardCount;
        if (this.settings.selectedSpread) {
            cardCount = SPREADS[this.settings.selectedSpread].cardCount;
        } else {
            cardCount = this.settings.cardCount;
        }

        const shuffled = shuffleDeck(this.deck, seed);
        const reversals = this.settings.allowReversed
            ? generateReversals(cardCount, seed)
            : Array(cardCount).fill(false);

        const selectedCards = shuffled.slice(0, cardCount).map((card, idx) => ({
            ...card,
            isReversed: reversals[idx]
        }));

        this.particleSystem.spiralBurst(window.innerWidth / 2, window.innerHeight / 2, 50);

        setTimeout(() => {
            appState.completeEntropy(seed, selectedCards);
        }, 600);
    }

    _setupFortuneSelector() {
        const selector = createFortuneSelector({
            onFortuneSelect: (fortuneId) => {
                this.settings.selectedFortune = fortuneId;
            },
            onModeSelect: (mode) => { },
            onSpreadSelect: (spreadType) => {
                this.settings.selectedSpread = spreadType;
                this._startReading();
            },
            onOpenQuestion: (question, cardCount) => {
                this.settings.openQuestion = question;
                this.settings.cardCount = cardCount;
                this.settings.selectedSpread = `open${cardCount}`;
                appState.set({ userQuestion: question });
                this._startReading();
            }
        });

        this._addReversalToggle(selector);

        this.elements.selectionStep.innerHTML = '';
        this.elements.selectionStep.appendChild(selector);
    }

    _addReversalToggle(container) {
        const toggleHtml = document.createElement('div');
        toggleHtml.className = 'flex items-center justify-center gap-3 mt-4 text-sm';
        toggleHtml.innerHTML = `
            <span class="text-slate-400">역방향 카드</span>
            <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" id="reversal-toggle" class="sr-only peer" checked>
                <div class="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
            <span id="reversal-status" class="text-slate-400">사용</span>
        `;

        const firstPanel = container.querySelector('.glass-panel');
        if (firstPanel) {
            firstPanel.appendChild(toggleHtml);

            const toggle = toggleHtml.querySelector('#reversal-toggle');
            const status = toggleHtml.querySelector('#reversal-status');
            toggle.addEventListener('change', () => {
                this.settings.allowReversed = toggle.checked;
                status.textContent = toggle.checked ? '사용' : '미사용';
            });
        }
    }

    _addNavigationButtons() {
        // Remove existing if any
        document.querySelectorAll('.nav-btn-fixed').forEach(el => el.remove());

        // Home button
        const homeBtn = document.createElement('button');
        homeBtn.className = 'nav-btn-fixed fixed top-4 left-4 z-50 bg-slate-800/90 hover:bg-purple-700 text-slate-300 hover:text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all border border-slate-600 hover:border-purple-500 backdrop-blur-sm';
        homeBtn.innerHTML = '<i class="fas fa-home"></i><span class="hidden md:inline">홈</span>';
        homeBtn.addEventListener('click', () => this._reset());
        document.body.appendChild(homeBtn);

        // History button
        const history = getReadingHistory();
        const historyBtn = document.createElement('button');
        historyBtn.className = 'nav-btn-fixed fixed top-4 right-4 z-50 bg-slate-800/90 hover:bg-purple-700 text-slate-300 hover:text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all border border-slate-600 hover:border-purple-500 backdrop-blur-sm';
        historyBtn.innerHTML = `<i class="fas fa-history"></i><span class="hidden md:inline">지난 리딩${history.length > 0 ? ` (${history.length})` : ''}</span>`;
        historyBtn.addEventListener('click', () => this._showHistoryModal());
        document.body.appendChild(historyBtn);
    }

    _showHistoryModal() {
        const history = getReadingHistory();

        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4';
        modal.innerHTML = `
            <div class="absolute inset-0 bg-black/70" id="modal-backdrop"></div>
            <div class="relative bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-slate-600 shadow-2xl">
                <div class="p-6 border-b border-slate-600 flex justify-between items-center">
                    <h2 class="text-xl font-bold text-amber-100">
                        <i class="fas fa-history mr-2"></i>지난 리딩 기록
                    </h2>
                    <button id="close-modal" class="text-slate-400 hover:text-white text-2xl">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="p-6 overflow-y-auto max-h-[60vh]">
                    ${history.length === 0 ? `
                        <p class="text-slate-400 text-center py-8">저장된 리딩이 없습니다.</p>
                    ` : `
                        <div class="space-y-3">
                            ${history.map(r => `
                                <div class="bg-slate-700/50 rounded-lg p-4 flex justify-between items-center hover:bg-slate-700 transition-colors">
                                    <div>
                                        <div class="text-amber-200 font-bold">${FORTUNE_TYPES[r.fortuneType]?.name || '일반 운세'}</div>
                                        <div class="text-sm text-slate-400">${r.date}</div>
                                        <div class="text-xs text-slate-500 mt-1">
                                            ${SPREADS[r.spreadType]?.name || r.spreadType} · ${r.cards?.length || 0}장
                                        </div>
                                    </div>
                                    <div class="flex gap-2">
                                        <button class="view-reading px-3 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm" data-id="${r.id}">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                        <button class="delete-reading px-3 py-2 bg-red-600/50 hover:bg-red-500 rounded-lg text-sm" data-id="${r.id}">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `}
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Event handlers
        modal.querySelector('#modal-backdrop').addEventListener('click', () => modal.remove());
        modal.querySelector('#close-modal').addEventListener('click', () => modal.remove());

        modal.querySelectorAll('.view-reading').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                const reading = history.find(r => r.id === id);
                if (reading) {
                    modal.remove();
                    this._loadHistoryReading(reading);
                }
            });
        });

        modal.querySelectorAll('.delete-reading').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                deleteReading(id);
                modal.remove();
                this._showHistoryModal();
            });
        });
    }

    _loadHistoryReading(reading) {
        this.settings.selectedFortune = reading.fortuneType;
        this.settings.selectedSpread = reading.spreadType;

        // Set cards and go directly to reading
        appState.set({
            selectedCards: reading.cards,
            currentStep: 'reading'
        });

        this._renderReading();
        stepController.transitionTo('reading');
    }

    _startReading() {
        appState.selectSpread(this.settings.selectedSpread);
        stepController.transitionTo('ritual');
        this.entropyCollector.start();
    }

    _setupRevealButton() {
        if (this.elements.revealBtn) {
            this.elements.revealBtn.addEventListener('click', () => {
                this._revealAllCards();
            });
        }
    }

    _subscribeToStateChanges() {
        appState.subscribe('currentStep', (step) => {
            if (step === 'reveal') {
                this._renderCards();
                this.flippedCount = 0;
                this.allFlipped = false;
            }
        });
    }

    _renderCards() {
        const cards = appState.getValue('selectedCards');
        const spreadType = this.settings.selectedSpread || 'threeCard';
        const layout = getSpreadLayout(spreadType);

        this.elements.cardsArea.innerHTML = '';
        this.elements.cardsArea.className = `spread-layout layout-${layout.type}`;
        this.cardContainers = [];
        this.flippedCount = 0;
        this.allFlipped = false;

        let sizeClass = 'w-28 h-44 md:w-36 md:h-56';
        if (cards.length >= 10) {
            sizeClass = 'w-20 h-32 md:w-24 md:h-40';
        } else if (cards.length >= 5) {
            sizeClass = 'w-24 h-40 md:w-32 md:h-48';
        }

        cards.forEach((card, idx) => {
            const position = layout.positions[idx] || {};
            const slot = document.createElement('div');
            slot.className = 'card-slot';

            const cardEl = createCardElement(card, idx, card.isReversed, sizeClass);
            cardEl.addEventListener('click', () => {
                this._flipSingleCard(cardEl, idx);
            });

            slot.appendChild(cardEl);

            if (position.label) {
                const label = document.createElement('div');
                label.className = 'card-slot-label';
                label.textContent = position.label;
                slot.appendChild(label);
            }

            this.elements.cardsArea.appendChild(slot);
            this.cardContainers.push(cardEl);
        });

        // Update reveal button text
        if (this.elements.revealBtn) {
            this.elements.revealBtn.classList.remove('hidden');
            this.elements.revealBtn.innerHTML = '<i class="fas fa-eye mr-2"></i>모두 뒤집기';
        }
    }

    _flipSingleCard(cardEl, index) {
        if (cardEl.classList.contains('flipped')) return;

        const cards = appState.getValue('selectedCards');
        flipCard(cardEl, cards[index].isReversed).then(wasFlipped => {
            if (wasFlipped) {
                this.flippedCount++;
                appState.revealCard();

                const rect = cardEl.getBoundingClientRect();
                this.particleSystem.burst(
                    rect.left + rect.width / 2,
                    rect.top + rect.height / 2,
                    15
                );

                this._checkAllFlipped();
            }
        });
    }

    async _revealAllCards() {
        const cards = appState.getValue('selectedCards');
        const reversals = cards.map(c => c.isReversed);

        // Disable button during animation
        if (this.elements.revealBtn) {
            this.elements.revealBtn.disabled = true;
            this.elements.revealBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>운명을 확인하는 중...';
        }

        // Flip all cards and wait for completion
        await flipAllCards(this.cardContainers, reversals, 300);

        this.flippedCount = cards.length;
        cards.forEach(() => appState.revealCard());

        // Force update state
        this.allFlipped = true;

        // Update button for reading view
        this._updateRevealButtonForReading();
    }

    _checkAllFlipped() {
        const cards = appState.getValue('selectedCards');

        if (this.flippedCount >= cards.length && !this.allFlipped) {
            this.allFlipped = true;
            this._updateRevealButtonForReading();
        }
    }

    _updateRevealButtonForReading() {
        if (this.elements.revealBtn) {
            this.elements.revealBtn.disabled = false;
            this.elements.revealBtn.innerHTML = '<i class="fas fa-book-open mr-2"></i>해석 보기';
            this.elements.revealBtn.classList.remove('hidden');

            // Use onclick for simpler event management (replaces previous handler)
            this.elements.revealBtn.onclick = () => {
                this._saveAndShowReading();
            };
        }
    }

    _saveAndShowReading() {
        const cards = appState.getValue('selectedCards');
        const userQuestion = appState.getValue('userQuestion') || this.settings.openQuestion;

        // Save to history
        saveReading({
            fortuneType: this.settings.selectedFortune,
            spreadType: this.settings.selectedSpread,
            cards: cards,
            question: userQuestion
        });

        this._renderReading();
        stepController.transitionTo('reading');
    }

    _renderReading() {
        const cards = appState.getValue('selectedCards');
        const spreadType = this.settings.selectedSpread || 'threeCard';
        const userQuestion = appState.getValue('userQuestion') || this.settings.openQuestion;
        const fortuneType = this.settings.selectedFortune;

        const readingDisplay = createReadingDisplay(cards, spreadType, fortuneType);

        // Add question display if present
        if (userQuestion) {
            const questionDisplay = document.createElement('div');
            questionDisplay.className = 'mb-6 p-4 bg-purple-900/30 rounded-xl border border-purple-500/30';
            questionDisplay.innerHTML = `
                <div class="flex items-start gap-3">
                    <i class="fas fa-question-circle text-purple-400 mt-1"></i>
                    <div>
                        <div class="text-xs text-purple-300 uppercase tracking-wider mb-1">질문</div>
                        <div class="text-slate-200">${userQuestion}</div>
                    </div>
                </div>
            `;
            readingDisplay.insertBefore(questionDisplay, readingDisplay.firstChild);
        }

        // Add "카드 다시 보기" button before reset button
        const viewToggle = document.createElement('button');
        viewToggle.className = 'btn-secondary mr-4';
        viewToggle.innerHTML = '<i class="fas fa-cards mr-2"></i>카드 다시 보기';
        viewToggle.addEventListener('click', () => {
            this._showCardsFromReading();
        });

        const buttonContainer = readingDisplay.querySelector('.mt-12.text-center');
        if (buttonContainer) {
            buttonContainer.insertBefore(viewToggle, buttonContainer.firstChild);
        }

        // Setup reset handler
        setResetHandler(readingDisplay, () => {
            this._reset();
        });

        this.elements.readingStep.innerHTML = '';
        this.elements.readingStep.appendChild(readingDisplay);

        this.elements.readingStep.scrollIntoView({ behavior: 'smooth' });
    }

    _showCardsFromReading() {
        // Store the reading content so we can return to it
        const cards = appState.getValue('selectedCards');
        const spreadType = this.settings.selectedSpread || 'threeCard';
        const layout = getSpreadLayout(spreadType);

        // Re-render cards in already-flipped state
        this.elements.cardsArea.innerHTML = '';
        this.elements.cardsArea.className = `spread-layout layout-${layout.type}`;
        this.cardContainers = [];

        let sizeClass = 'w-28 h-44 md:w-36 md:h-56';
        if (cards.length >= 10) {
            sizeClass = 'w-20 h-32 md:w-24 md:h-40';
        } else if (cards.length >= 5) {
            sizeClass = 'w-24 h-40 md:w-32 md:h-48';
        }

        cards.forEach((card, idx) => {
            const position = layout.positions[idx] || {};
            const slot = document.createElement('div');
            slot.className = 'card-slot';

            const cardEl = createCardElement(card, idx, card.isReversed, sizeClass);
            // Pre-flip the card
            cardEl.classList.add('flipped');
            if (card.isReversed) {
                const front = cardEl.querySelector('.card-front');
                if (front) front.classList.add('reversed');
            }

            slot.appendChild(cardEl);

            if (position.label) {
                const label = document.createElement('div');
                label.className = 'card-slot-label';
                label.textContent = position.label;
                slot.appendChild(label);
            }

            this.elements.cardsArea.appendChild(slot);
            this.cardContainers.push(cardEl);
        });

        // Update button to go back to reading
        if (this.elements.revealBtn) {
            this.elements.revealBtn.classList.remove('hidden');
            this.elements.revealBtn.disabled = false;
            this.elements.revealBtn.innerHTML = '<i class="fas fa-book-open mr-2"></i>해석 보기';
            this.elements.revealBtn.onclick = () => {
                this._renderReading();
                stepController.transitionTo('reading');
            };
        }

        stepController.transitionTo('reveal');
    }

    _reset() {
        this.entropyCollector.stop();
        this.particleSystem.clear();

        this.settings = {
            allowReversed: true,
            selectedFortune: 'general',
            selectedSpread: null,
            openQuestion: '',
            cardCount: 3
        };

        this.flippedCount = 0;
        this.allFlipped = false;

        appState.reset();

        this._updateEntropyUI(0);
        if (this.elements.entropySamples) {
            this.elements.entropySamples.textContent = '0';
        }
        this.elements.cardsArea.innerHTML = '';
        this.cardContainers = [];

        this.deck = createDeck();
        appState.setDeck(this.deck);

        this._setupFortuneSelector();
        stepController.transitionTo('selection');
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new TarotApp();
    app.init();
});

export default TarotApp;
