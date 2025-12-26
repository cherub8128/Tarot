/**
 * Fortune Types Data Module
 * Defines fortune categories and their configurations
 * 
 * @module data/fortune-types
 */

/**
 * Fortune type definitions
 */
export const FORTUNE_TYPES = {
    general: {
        id: 'general',
        name: '일반 운세',
        icon: 'fa-wand-magic-sparkles',
        color: 'text-purple-400',
        description: '전반적인 운세와 조언',
        gradient: 'from-purple-500 to-indigo-600'
    },
    love: {
        id: 'love',
        name: '연애운',
        icon: 'fa-heart',
        color: 'text-rose-400',
        description: '사랑과 관계에 대한 조언',
        gradient: 'from-rose-500 to-pink-600'
    },
    study: {
        id: 'study',
        name: '학업운',
        icon: 'fa-book',
        color: 'text-cyan-400',
        description: '학업과 배움에 대한 조언',
        gradient: 'from-cyan-500 to-blue-600'
    },
    success: {
        id: 'success',
        name: '성공운',
        icon: 'fa-trophy',
        color: 'text-amber-400',
        description: '성공과 목표 달성에 대한 조언',
        gradient: 'from-amber-500 to-orange-600'
    },
    money: {
        id: 'money',
        name: '금전운',
        icon: 'fa-coins',
        color: 'text-emerald-400',
        description: '재물과 금전에 대한 조언',
        gradient: 'from-emerald-500 to-green-600'
    }
};

/**
 * Reading modes
 */
export const READING_MODES = {
    spread: {
        id: 'spread',
        name: '스프레드 선택',
        description: '정해진 스프레드로 카드를 뽑습니다',
        icon: 'fa-layer-group'
    },
    openQuestion: {
        id: 'openQuestion',
        name: '자유 질문',
        description: '질문을 입력하고 카드 수를 선택합니다',
        icon: 'fa-comment-dots'
    }
};

/**
 * Get fortune type by ID
 * @param {string} id - Fortune type ID
 * @returns {Object} Fortune type object
 */
export function getFortuneType(id) {
    return FORTUNE_TYPES[id] || FORTUNE_TYPES.general;
}

/**
 * Get all fortune types as array
 * @returns {Array} Array of fortune type objects
 */
export function getAllFortuneTypes() {
    return Object.values(FORTUNE_TYPES);
}
