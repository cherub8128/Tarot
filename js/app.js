/**
 * Digital Entropy Tarot - Main Application
 * Orchestrates all modules and handles initialization
 * 
 * @module app
 */

import { createDeck, SPREADS } from './data/tarot-deck.js';
import { EntropyCollector } from './utils/entropy-engine.js';
import { shuffleDeck, generateReversals } from './utils/seeded-random.js';
import { ParticleSystem } from './components/particle-system.js';
import { createCardElement, flipCard, flipAllCards } from './components/tarot-card.js';
import { createSpreadSelector } from './components/spread-selector.js';
import { createReadingDisplay, setResetHandler } from './components/reading-display.js';
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

        // DOM References
        this.elements = {
            canvas: null,
            mainContainer: null,
            selectionStep: null,
            ritualStep: null,
            revealStep: null,
            readingStep: null,
            cardsArea: null,
            entropyBar: null,
            entropyText: null,
            revealBtn: null
        };
    }

    /**
     * Initialize the application
     */
    async init() {
        // Get DOM elements
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

        // Setup spread selector
        this._setupSpreadSelector();

        // Setup reveal button
        this._setupRevealButton();

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
            entropyText: document.getElementById('entropy-text'),
            revealBtn: document.getElementById('reveal-btn')
        };
    }

    _initEntropyCollector() {
        this.entropyCollector = new EntropyCollector({
            targetBits: 256,
            onProgress: (progress) => {
                this._updateEntropyUI(progress);
                appState.updateEntropyProgress(progress);
            },
            onSample: ({ source, data }) => {
                // Visual feedback on sample
                if (source === 'mouse' || source === 'touch') {
                    this.particleSystem.spawn(data.x, data.y, 3);
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
        if (this.elements.entropyText) {
            this.elements.entropyText.textContent = `Entropy: ${Math.floor(progress)}%`;
        }
    }

    _onEntropyComplete(seed) {
        const spread = SPREADS[appState.getValue('currentSpread')];
        const cardCount = spread.cardCount;

        // Shuffle deck with entropy seed
        const shuffled = shuffleDeck(this.deck, seed);

        // Generate reversals
        const reversals = generateReversals(cardCount, seed);

        // Select cards
        const selectedCards = shuffled.slice(0, cardCount).map((card, idx) => ({
            ...card,
            isReversed: reversals[idx]
        }));

        // Burst effect
        this.particleSystem.burst(window.innerWidth / 2, window.innerHeight / 2, 30);

        // Update state
        setTimeout(() => {
            appState.completeEntropy(seed, selectedCards);
        }, 500);
    }

    _setupSpreadSelector() {
        const selector = createSpreadSelector((spreadType) => {
            appState.selectSpread(spreadType);
            this.entropyCollector.start();
        });

        // Replace placeholder with actual selector
        const placeholder = this.elements.selectionStep;
        if (placeholder && placeholder.parentNode) {
            placeholder.innerHTML = '';
            placeholder.appendChild(selector.firstElementChild);
        }
    }

    _setupRevealButton() {
        if (this.elements.revealBtn) {
            this.elements.revealBtn.addEventListener('click', () => {
                this._revealAllCards();
            });
        }
    }

    _subscribeToStateChanges() {
        // Handle step changes
        appState.subscribe('currentStep', (step) => {
            if (step === 'reveal') {
                this._renderCards();
            } else if (step === 'reading') {
                this._renderReading();
            }
        });
    }

    _renderCards() {
        const cards = appState.getValue('selectedCards');
        const spreadType = appState.getValue('currentSpread');
        const spread = SPREADS[spreadType];

        // Clear cards area
        this.elements.cardsArea.innerHTML = '';
        this.cardContainers = [];

        // Determine card size based on spread
        let sizeClass = 'w-32 h-52 md:w-48 md:h-72';
        if (spread.cardCount >= 10) {
            sizeClass = 'w-24 h-40 md:w-32 md:h-52';
        }

        // Create card elements
        cards.forEach((card, idx) => {
            const cardEl = createCardElement(card, idx, card.isReversed, sizeClass);

            // Add click handler
            cardEl.addEventListener('click', () => {
                this._flipSingleCard(cardEl, idx);
            });

            this.elements.cardsArea.appendChild(cardEl);
            this.cardContainers.push(cardEl);
        });

        // Show reveal button
        if (this.elements.revealBtn) {
            this.elements.revealBtn.classList.remove('hidden');
        }
    }

    _flipSingleCard(cardEl, index) {
        const cards = appState.getValue('selectedCards');
        const wasFlipped = flipCard(cardEl, cards[index].isReversed);

        if (wasFlipped) {
            appState.revealCard();
        }
    }

    _revealAllCards() {
        const cards = appState.getValue('selectedCards');
        const reversals = cards.map(c => c.isReversed);

        flipAllCards(this.cardContainers, reversals);

        // Hide reveal button
        if (this.elements.revealBtn) {
            this.elements.revealBtn.classList.add('hidden');
        }

        // Update revealed count
        cards.forEach(() => appState.revealCard());
    }

    _renderReading() {
        const cards = appState.getValue('selectedCards');
        const spreadType = appState.getValue('currentSpread');

        const readingDisplay = createReadingDisplay(cards, spreadType);

        // Setup reset handler
        setResetHandler(readingDisplay, () => {
            this._reset();
        });

        // Clear and add reading display
        this.elements.readingStep.innerHTML = '';
        this.elements.readingStep.appendChild(readingDisplay);

        // Scroll to reading
        this.elements.readingStep.scrollIntoView({ behavior: 'smooth' });
    }

    _reset() {
        // Stop entropy collector
        this.entropyCollector.stop();

        // Clear particles
        this.particleSystem.clear();

        // Reset state
        appState.reset();

        // Reset UI
        this._updateEntropyUI(0);
        this.elements.cardsArea.innerHTML = '';
        this.cardContainers = [];

        // Re-init deck
        this.deck = createDeck();
        appState.setDeck(this.deck);

        // Transition to selection
        stepController.transitionTo('selection');
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new TarotApp();
    app.init();
});

// Export for potential external use
export default TarotApp;
