/**
 * Tarot Deck Data Module
 * Contains all 78 tarot cards with keywords for interpretation
 * 
 * @module data/tarot-deck
 */

// Major Arcana names (22 cards)
const MAJOR_ARCANA = [
    "The Fool", "The Magician", "The High Priestess", "The Empress", "The Emperor",
    "The Hierophant", "The Lovers", "The Chariot", "Strength", "The Hermit",
    "Wheel of Fortune", "Justice", "The Hanged Man", "Death", "Temperance",
    "The Devil", "The Tower", "The Star", "The Moon", "The Sun", "Judgement", "The World"
];

// Minor Arcana suits
const SUITS = ['Wands', 'Cups', 'Swords', 'Pentacles'];

// Ranks for minor arcana
const RANKS = ['Ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Page', 'Knight', 'Queen', 'King'];

/**
 * Image path mapping for cards
 */
const IMAGE_PATHS = {
    // Major Arcana
    major: [
        'RWS_Tarot_00_Fool.jpg',
        'RWS_Tarot_01_Magician.jpg',
        'RWS_Tarot_02_High_Priestess.jpg',
        'RWS_Tarot_03_Empress.jpg',
        'RWS_Tarot_04_Emperor.jpg',
        'RWS_Tarot_05_Hierophant.jpg',
        'RWS_Tarot_06_Lovers.jpg',
        'RWS_Tarot_07_Chariot.jpg',
        'RWS_Tarot_08_Strength.jpg',
        'RWS_Tarot_09_Hermit.jpg',
        'RWS_Tarot_10_Wheel_of_Fortune.jpg',
        'RWS_Tarot_11_Justice.jpg',
        'RWS_Tarot_12_Hanged_Man.jpg',
        'RWS_Tarot_13_Death.jpg',
        'RWS_Tarot_14_Temperance.jpg',
        'RWS_Tarot_15_Devil.jpg',
        'RWS_Tarot_16_Tower.jpg',
        'RWS_Tarot_17_Star.jpg',
        'RWS_Tarot_18_Moon.jpg',
        'RWS_Tarot_19_Sun.jpg',
        'RWS_Tarot_20_Judgement.jpg',
        'RWS_Tarot_21_World.jpg'
    ],
    // Minor Arcana - Wands (Note: Wands09 uses different naming)
    Wands: [
        'Wands01.jpg', 'Wands02.jpg', 'Wands03.jpg', 'Wands04.jpg', 'Wands05.jpg',
        'Wands06.jpg', 'Wands07.jpg', 'Wands08.jpg', 'Tarot_Nine_of_Wands.jpg', 'Wands10.jpg',
        'Wands11.jpg', 'Wands12.jpg', 'Wands13.jpg', 'Wands14.jpg'
    ],
    Cups: [
        'Cups01.jpg', 'Cups02.jpg', 'Cups03.jpg', 'Cups04.jpg', 'Cups05.jpg',
        'Cups06.jpg', 'Cups07.jpg', 'Cups08.jpg', 'Cups09.jpg', 'Cups10.jpg',
        'Cups11.jpg', 'Cups12.jpg', 'Cups13.jpg', 'Cups14.jpg'
    ],
    Swords: [
        'Swords01.jpg', 'Swords02.jpg', 'Swords03.jpg', 'Swords04.jpg', 'Swords05.jpg',
        'Swords06.jpg', 'Swords07.jpg', 'Swords08.jpg', 'Swords09.jpg', 'Swords10.jpg',
        'Swords11.jpg', 'Swords12.jpg', 'Swords13.jpg', 'Swords14.jpg'
    ],
    Pentacles: [
        'Pents01.jpg', 'Pents02.jpg', 'Pents03.jpg', 'Pents04.jpg', 'Pents05.jpg',
        'Pents06.jpg', 'Pents07.jpg', 'Pents08.jpg', 'Pents09.jpg', 'Pents10.jpg',
        'Pents11.jpg', 'Pents12.jpg', 'Pents13.jpg', 'Pents14.jpg'
    ]
};

/**
 * Card interpretation keywords
 * @type {Object.<string, {up: string, rev: string}>}
 */
const KEYWORDS = {
    // Major Arcana
    "The Fool": { up: "새로운 시작, 순수, 모험, 무한한 가능성", rev: "무모함, 위험 감수, 어리석음, 경솔함" },
    "The Magician": { up: "창조력, 기술, 의지력, 자원 활용", rev: "속임수, 재능 낭비, 소통 부족, 조작" },
    "The High Priestess": { up: "직관, 신비, 내면의 지혜, 잠재의식", rev: "비밀 드러남, 내면 무시, 차가움, 표면적 지식" },
    "The Empress": { up: "풍요, 모성, 자연, 예술적 창조", rev: "의존, 창조력 고갈, 사치, 과잉보호" },
    "The Emperor": { up: "권위, 구조, 아버지, 리더십, 안정", rev: "폭정, 경직됨, 규율 부족, 지배욕" },
    "The Hierophant": { up: "전통, 영적 지도, 배움, 도덕적 가치", rev: "반항, 낡은 관습, 개인적 믿음, 비정통" },
    "The Lovers": { up: "사랑, 조화, 가치관의 선택, 결합", rev: "불화, 잘못된 선택, 균형 깨짐, 유혹" },
    "The Chariot": { up: "성공, 결단력, 통제, 승리, 전진", rev: "통제 상실, 방향 상실, 패배감, 공격성" },
    "Strength": { up: "용기, 인내, 내면의 힘, 자기 통제", rev: "자기 의심, 나약함, 불안, 자신감 부족" },
    "The Hermit": { up: "성찰, 고독, 내면 탐구, 지혜 추구", rev: "고립, 외로움, 현실 도피, 편집증" },
    "Wheel of Fortune": { up: "운명, 변화, 행운, 주기, 전환점", rev: "불운, 저항, 통제 불가능, 하강 국면" },
    "Justice": { up: "정의, 공정, 진실, 인과응보, 균형", rev: "불공정, 편견, 책임 회피, 부정직" },
    "The Hanged Man": { up: "희생, 새로운 관점, 일시 정지, 해방", rev: "무의미한 희생, 정체, 저항, 이기심" },
    "Death": { up: "끝, 변화, 새로운 시작, 변형, 해방", rev: "변화 거부, 정체, 두려움, 집착" },
    "Temperance": { up: "균형, 절제, 인내, 조화, 치유", rev: "불균형, 과도함, 성급함, 갈등" },
    "The Devil": { up: "속박, 중독, 물질주의, 그림자 자아", rev: "해방, 사슬 끊기, 각성, 자유" },
    "The Tower": { up: "갑작스런 변화, 붕괴, 계시, 자유", rev: "변화에 대한 두려움, 재난 회피, 지연된 붕괴" },
    "The Star": { up: "희망, 영감, 평온, 치유, 재생", rev: "절망, 믿음 상실, 낙담, 단절" },
    "The Moon": { up: "환상, 불안, 잠재의식, 직감", rev: "혼란 해소, 공포 극복, 진실 발견, 명료" },
    "The Sun": { up: "성공, 기쁨, 긍정, 활력, 명확함", rev: "일시적 우울, 성공 지연, 허영, 과신" },
    "Judgement": { up: "부활, 심판, 각성, 소명, 결정", rev: "자기 비판, 후회, 무시, 부정" },
    "The World": { up: "완성, 성취, 여행, 통합, 완전함", rev: "미완성, 지연, 부족함, 마무리 실패" },

    // Suit keywords (for minor arcana generation)
    "Wands": { up: "열정, 행동, 창조, 영감, 의지", rev: "지연, 무기력, 갈등, 성급함" },
    "Cups": { up: "감정, 관계, 사랑, 직관, 치유", rev: "감정 과잉, 실망, 단절, 억압" },
    "Swords": { up: "지성, 사고, 진실, 명확함, 결단", rev: "혼란, 잔인함, 스트레스, 갈등" },
    "Pentacles": { up: "물질, 현실, 금전, 건강, 성장", rev: "손실, 탐욕, 불안정, 게으름" }
};

/**
 * Spread definitions with position meanings
 * Spreads are layout patterns only - fortune type determines interpretation context
 */
export const SPREADS = {
    single: {
        name: "원 카드",
        description: "간단명료한 한 장",
        cardCount: 1,
        positions: ["메시지"]
    },
    twoChoice: {
        name: "양자택일",
        description: "두 가지 선택지 비교",
        cardCount: 2,
        positions: ["선택 A", "선택 B"]
    },
    threeCard: {
        name: "쓰리 카드",
        description: "과거-현재-미래의 흐름",
        cardCount: 3,
        positions: ["과거", "현재", "미래"]
    },
    diamond: {
        name: "다이아몬드",
        description: "네 방향의 관점",
        cardCount: 4,
        positions: ["나", "상대/환경", "상황", "조언"]
    },
    cross: {
        name: "크로스",
        description: "다섯 가지 측면",
        cardCount: 5,
        positions: ["핵심", "위", "아래", "과거", "미래"]
    },
    celtic: {
        name: "켈틱 크로스",
        description: "심층 분석 10장",
        cardCount: 10,
        positions: [
            "현재 상황",
            "도전/방해",
            "과거의 원인",
            "가까운 미래",
            "의식적 목표",
            "무의식적 영향",
            "당신의 태도",
            "외부 환경",
            "희망과 두려움",
            "최종 결과"
        ]
    }
};

/**
 * Generate the full 78-card deck
 * @returns {Array<Object>} Array of card objects
 */
export function createDeck() {
    const deck = [];

    // Add Major Arcana (22 cards)
    MAJOR_ARCANA.forEach((name, index) => {
        deck.push({
            id: `major_${index}`,
            name,
            type: 'major',
            suit: null,
            number: index,
            keywords: KEYWORDS[name],
            image: `images/${IMAGE_PATHS.major[index]}`
        });
    });

    // Add Minor Arcana (56 cards)
    SUITS.forEach(suit => {
        RANKS.forEach((rank, index) => {
            const suitKeywords = KEYWORDS[suit];
            deck.push({
                id: `${suit.toLowerCase()}_${index + 1}`,
                name: `${rank} of ${suit}`,
                type: 'minor',
                suit,
                number: index + 1,
                keywords: {
                    up: `${suitKeywords.up}과 연결된 ${rank}의 에너지`,
                    rev: `${suitKeywords.rev}과 관련된 ${rank}의 측면`
                },
                image: `images/${IMAGE_PATHS[suit][index]}`
            });
        });
    });

    return deck;
}

/**
 * Get card icon based on suit/type
 * @param {Object} card - Card object
 * @returns {string} HTML icon string
 */
export function getCardIcon(card) {
    if (card.type === 'major') {
        return '<i class="fas fa-star text-purple-600"></i>';
    }

    const icons = {
        Wands: '<i class="fas fa-fire text-red-700"></i>',
        Cups: '<i class="fas fa-wine-glass text-blue-700"></i>',
        Swords: '<i class="fas fa-wind text-yellow-700"></i>',
        Pentacles: '<i class="fas fa-coins text-green-700"></i>'
    };

    return icons[card.suit] || '';
}

/**
 * Convert number to Roman numerals
 * @param {number} num - Number to convert
 * @returns {string} Roman numeral string
 */
export function toRoman(num) {
    const roman = { M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1 };
    let str = '';
    for (const [key, value] of Object.entries(roman)) {
        const count = Math.floor(num / value);
        num -= count * value;
        str += key.repeat(count);
    }
    return str;
}
