/**
 * Interpretation Loader Module
 * Dynamically loads fortune-specific interpretations
 * 
 * @module data/interpretation-loader
 */

// Cache for loaded interpretations
const interpretationCache = {};

/**
 * Load interpretation data for a fortune type
 * @param {string} fortuneType - Fortune type (general, love, study, success, money)
 * @returns {Promise<Object>} Interpretation data
 */
export async function loadInterpretation(fortuneType) {
    // Return cached if available
    if (interpretationCache[fortuneType]) {
        return interpretationCache[fortuneType];
    }

    try {
        const response = await fetch(`js/data/interpretations/${fortuneType}.json`);
        if (!response.ok) {
            throw new Error(`Failed to load ${fortuneType} interpretations`);
        }
        const data = await response.json();
        interpretationCache[fortuneType] = data;
        return data;
    } catch (error) {
        console.warn(`Could not load ${fortuneType} interpretations, falling back to general`);
        // Fallback to general if specific type fails
        if (fortuneType !== 'general') {
            return loadInterpretation('general');
        }
        throw error;
    }
}

/**
 * Get position label based on fortune type and spread
 * @param {string} fortuneType - Fortune type
 * @param {string} spreadType - Spread type
 * @param {string} defaultPosition - Default position name
 * @returns {Promise<string>} Fortune-specific position label
 */
export async function getPositionLabel(fortuneType, spreadType, defaultPosition) {
    const interpretation = await loadInterpretation(fortuneType);
    const positions = interpretation.positions?.[spreadType];
    return positions?.[defaultPosition] || defaultPosition;
}

/**
 * Get card interpretation based on fortune type
 * @param {Object} card - Card object
 * @param {boolean} isReversed - Whether card is reversed
 * @param {string} fortuneType - Fortune type
 * @returns {Promise<string>} Card interpretation
 */
export async function getCardInterpretation(card, isReversed, fortuneType) {
    const interpretation = await loadInterpretation(fortuneType);
    const direction = isReversed ? 'reversed' : 'upright';

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
    return isReversed ? card.keywords.rev : card.keywords.up;
}

/**
 * Get all position labels for a spread
 * @param {string} fortuneType - Fortune type
 * @param {string} spreadType - Spread type  
 * @param {Array<string>} defaultPositions - Array of default position names
 * @returns {Promise<Array<string>>} Fortune-specific position labels
 */
export async function getAllPositionLabels(fortuneType, spreadType, defaultPositions) {
    const interpretation = await loadInterpretation(fortuneType);
    const positions = interpretation.positions?.[spreadType] || {};

    return defaultPositions.map(pos => positions[pos] || pos);
}

/**
 * Preload all interpretations for faster access
 */
export async function preloadAllInterpretations() {
    const types = ['general', 'love', 'study', 'success', 'money'];
    await Promise.all(types.map(type => loadInterpretation(type)));
}
