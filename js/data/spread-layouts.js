/**
 * Spread Layout Configurations
 * Defines visual positioning for different tarot spreads
 * Spreads are layout patterns only - fortune type determines context
 * 
 * @module data/spread-layouts
 */

/**
 * Layout position configurations
 * Positions are defined as grid placement hints
 */
export const SPREAD_LAYOUTS = {
    single: {
        type: 'simple',
        positions: [
            { row: 1, col: 1, label: '메시지' }
        ]
    },

    twoChoice: {
        type: 'horizontal',
        positions: [
            { row: 1, col: 1, label: '선택 A' },
            { row: 1, col: 2, label: '선택 B' }
        ]
    },

    threeCard: {
        type: 'horizontal',
        positions: [
            { row: 1, col: 1, label: '과거' },
            { row: 1, col: 2, label: '현재' },
            { row: 1, col: 3, label: '미래' }
        ]
    },

    diamond: {
        type: 'diamond',
        positions: [
            { row: 1, col: 2, label: '나' },
            { row: 2, col: 1, label: '상대/환경' },
            { row: 2, col: 3, label: '상황' },
            { row: 3, col: 2, label: '조언' }
        ]
    },

    cross: {
        type: 'cross',
        positions: [
            { row: 2, col: 2, label: '핵심' },
            { row: 1, col: 2, label: '위' },
            { row: 3, col: 2, label: '아래' },
            { row: 2, col: 1, label: '과거' },
            { row: 2, col: 3, label: '미래' }
        ]
    },

    celtic: {
        type: 'celtic-cross',
        positions: [
            { row: 2, col: 2, label: '현재', zIndex: 1 },
            { row: 2, col: 2, label: '도전', rotate: 90, zIndex: 2, offsetX: 10 },
            { row: 3, col: 2, label: '과거' },
            { row: 1, col: 2, label: '미래' },
            { row: 2, col: 1, label: '의식' },
            { row: 2, col: 3, label: '무의식' },
            { row: 4, col: 4, label: '태도' },
            { row: 3, col: 4, label: '환경' },
            { row: 2, col: 4, label: '희망/두려움' },
            { row: 1, col: 4, label: '결과' }
        ]
    },

    // 자유질문 모드용 - 카드 수에 따라 동적으로 레이아웃 생성
    openQuestion: {
        type: 'horizontal',
        positions: [] // 자유질문에서는 포지션 라벨 사용 안함
    }
};

/**
 * Get CSS grid template for layout type
 * @param {string} type - Layout type
 * @param {number} cardCount - Number of cards
 * @returns {Object} Grid configuration
 */
export function getGridConfig(type, cardCount) {
    switch (type) {
        case 'simple':
            return { cols: 1, rows: 1, gap: '1rem' };
        case 'horizontal':
            return { cols: cardCount, rows: 1, gap: '1rem' };
        case 'vertical':
            return { cols: 1, rows: cardCount, gap: '1rem' };
        case 'diamond':
            return { cols: 3, rows: 3, gap: '0.5rem' };
        case 'cross':
            return { cols: 3, rows: 3, gap: '0.5rem' };
        case 'celtic-cross':
            return { cols: 4, rows: 4, gap: '0.5rem' };
        default:
            return { cols: 3, rows: Math.ceil(cardCount / 3), gap: '1rem' };
    }
}

/**
 * Get layout for spread type
 * @param {string} spreadType - Spread type key
 * @returns {Object} Layout configuration
 */
export function getSpreadLayout(spreadType) {
    return SPREAD_LAYOUTS[spreadType] || SPREAD_LAYOUTS.threeCard;
}
