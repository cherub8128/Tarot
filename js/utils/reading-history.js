/**
 * Reading History Module
 * Manages localStorage for saving and retrieving past readings
 * 
 * @module utils/reading-history
 */

const STORAGE_KEY = 'tarot_reading_history';
const MAX_HISTORY = 50;

/**
 * Get all saved readings
 * @returns {Array} Array of reading objects
 */
export function getReadingHistory() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Failed to load reading history:', error);
        return [];
    }
}

/**
 * Save a new reading to history
 * @param {Object} reading - Reading object to save
 * @returns {string} Reading ID
 */
export function saveReading(reading) {
    const history = getReadingHistory();

    const readingWithId = {
        id: generateId(),
        timestamp: Date.now(),
        date: new Date().toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }),
        ...reading
    };

    // Add to beginning of array
    history.unshift(readingWithId);

    // Limit history size
    if (history.length > MAX_HISTORY) {
        history.pop();
    }

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
        console.error('Failed to save reading:', error);
    }

    return readingWithId.id;
}

/**
 * Get a specific reading by ID
 * @param {string} id - Reading ID
 * @returns {Object|null} Reading object or null
 */
export function getReadingById(id) {
    const history = getReadingHistory();
    return history.find(r => r.id === id) || null;
}

/**
 * Delete a reading by ID
 * @param {string} id - Reading ID
 */
export function deleteReading(id) {
    const history = getReadingHistory();
    const filtered = history.filter(r => r.id !== id);

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
        console.error('Failed to delete reading:', error);
    }
}

/**
 * Clear all reading history
 */
export function clearHistory() {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        console.error('Failed to clear history:', error);
    }
}

/**
 * Generate unique ID
 * @returns {string} Unique ID
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Get reading count
 * @returns {number} Number of saved readings
 */
export function getReadingCount() {
    return getReadingHistory().length;
}
