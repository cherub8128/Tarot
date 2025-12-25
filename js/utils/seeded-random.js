/**
 * Seeded Pseudo-Random Number Generator
 * Uses Mulberry32 algorithm with entropy-based seeding
 * 
 * @module utils/seeded-random
 */

/**
 * Mulberry32 PRNG
 * Fast, high-quality 32-bit PRNG
 */
export class SeededRandom {
    /**
     * Create a seeded random generator
     * @param {number} seed - 32-bit seed value
     */
    constructor(seed) {
        this.seed = seed >>> 0; // Ensure unsigned 32-bit
        this.state = this.seed;
    }

    /**
     * Generate next random number (0 to 1)
     * @returns {number} Random float between 0 and 1
     */
    next() {
        let t = this.state += 0x6D2B79F5;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }

    /**
     * Generate random integer in range [min, max]
     * @param {number} min - Minimum value (inclusive)
     * @param {number} max - Maximum value (inclusive)
     * @returns {number} Random integer
     */
    nextInt(min, max) {
        return Math.floor(this.next() * (max - min + 1)) + min;
    }

    /**
     * Generate random boolean with optional probability
     * @param {number} probability - Probability of true (0 to 1)
     * @returns {boolean}
     */
    nextBool(probability = 0.5) {
        return this.next() < probability;
    }

    /**
     * Shuffle array in place using Fisher-Yates algorithm
     * @param {Array} array - Array to shuffle
     * @returns {Array} Shuffled array (same reference)
     */
    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = this.nextInt(0, i);
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    /**
     * Pick random element from array
     * @param {Array} array - Array to pick from
     * @returns {*} Random element
     */
    pick(array) {
        return array[this.nextInt(0, array.length - 1)];
    }

    /**
     * Reset generator to initial seed
     */
    reset() {
        this.state = this.seed;
    }

    /**
     * Create a new generator with a derived seed
     * @returns {SeededRandom} New generator
     */
    fork() {
        const newSeed = Math.floor(this.next() * 0xFFFFFFFF);
        return new SeededRandom(newSeed);
    }
}

/**
 * Create shuffled deck using entropy seed
 * @param {Array} deck - Original deck array
 * @param {number} seed - Entropy seed
 * @returns {Array} New shuffled deck array
 */
export function shuffleDeck(deck, seed) {
    const rng = new SeededRandom(seed);
    const shuffled = [...deck];
    return rng.shuffle(shuffled);
}

/**
 * Determine card reversals based on seed
 * @param {number} count - Number of cards
 * @param {number} seed - Entropy seed
 * @param {number} probability - Reversal probability (0 to 1)
 * @returns {Array<boolean>} Array of reversal flags
 */
export function generateReversals(count, seed, probability = 0.5) {
    const rng = new SeededRandom(seed + 12345); // Offset seed for variety
    return Array.from({ length: count }, () => rng.nextBool(probability));
}
