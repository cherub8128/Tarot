/**
 * Application State Manager
 * Centralized state management with event-based updates
 * 
 * @module core/app-state
 */

/**
 * Application state store with event emitter pattern
 */
class AppState {
    constructor() {
        this._state = {
            currentSpread: null,
            deck: [],
            selectedCards: [],
            entropyProgress: 0,
            entropySeed: null,
            currentStep: 'selection', // selection | ritual | reveal | reading
            isCollectingEntropy: false,
            revealedCount: 0
        };

        this._listeners = new Map();
    }

    /**
     * Get current state (immutable copy)
     * @returns {Object}
     */
    get() {
        return { ...this._state };
    }

    /**
     * Get specific state value
     * @param {string} key - State key
     * @returns {*}
     */
    getValue(key) {
        return this._state[key];
    }

    /**
     * Update state and notify listeners
     * @param {Object} updates - State updates
     */
    set(updates) {
        const prevState = { ...this._state };
        this._state = { ...this._state, ...updates };

        // Notify listeners of changed keys
        Object.keys(updates).forEach(key => {
            if (this._listeners.has(key)) {
                this._listeners.get(key).forEach(callback => {
                    callback(this._state[key], prevState[key]);
                });
            }
        });

        // Notify global listeners
        if (this._listeners.has('*')) {
            this._listeners.get('*').forEach(callback => {
                callback(this._state, prevState);
            });
        }
    }

    /**
     * Subscribe to state changes
     * @param {string} key - State key to watch ('*' for all changes)
     * @param {Function} callback - Callback function (newValue, oldValue)
     * @returns {Function} Unsubscribe function
     */
    subscribe(key, callback) {
        if (!this._listeners.has(key)) {
            this._listeners.set(key, new Set());
        }
        this._listeners.get(key).add(callback);

        return () => {
            this._listeners.get(key).delete(callback);
        };
    }

    /**
     * Reset state to initial values
     */
    reset() {
        this.set({
            currentSpread: null,
            selectedCards: [],
            entropyProgress: 0,
            entropySeed: null,
            currentStep: 'selection',
            isCollectingEntropy: false,
            revealedCount: 0
        });
    }

    /**
     * Set the deck
     * @param {Array} deck - Card deck array
     */
    setDeck(deck) {
        this.set({ deck });
    }

    /**
     * Select spread type
     * @param {string} spreadType - Spread type key
     */
    selectSpread(spreadType) {
        this.set({
            currentSpread: spreadType,
            currentStep: 'ritual',
            isCollectingEntropy: true
        });
    }

    /**
     * Update entropy progress
     * @param {number} progress - Progress percentage (0-100)
     */
    updateEntropyProgress(progress) {
        this.set({ entropyProgress: progress });
    }

    /**
     * Complete entropy collection
     * @param {number} seed - Generated seed
     * @param {Array} cards - Selected cards
     */
    completeEntropy(seed, cards) {
        this.set({
            entropySeed: seed,
            selectedCards: cards,
            currentStep: 'reveal',
            isCollectingEntropy: false,
            entropyProgress: 100
        });
    }

    /**
     * Increment revealed card count
     * @returns {number} New revealed count
     */
    revealCard() {
        const newCount = this._state.revealedCount + 1;
        this.set({ revealedCount: newCount });

        if (newCount === this._state.selectedCards.length) {
            setTimeout(() => {
                this.set({ currentStep: 'reading' });
            }, 800);
        }

        return newCount;
    }

    /**
     * Check if all cards are revealed
     * @returns {boolean}
     */
    allCardsRevealed() {
        return this._state.revealedCount >= this._state.selectedCards.length;
    }
}

// Singleton instance
export const appState = new AppState();
