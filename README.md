# 🔮 Digital Entropy Tarot

> 당신의 움직임이 운명을 결정합니다.

**Cloudflare의 라바 램프 난수 생성 방식**에서 영감을 받아, 사용자의 마우스/터치 등 **실제 행동 데이터**를 엔트로피 원천으로 사용하는 타로 리딩 웹앱입니다.

## ✨ 주요 기능

### 🎲 향상된 엔트로피 시스템

일반적인 `Math.random()`이 아닌, 다양한 소스에서 수집한 **진정한 무작위성**:

| 엔트로피 소스 | 수집 방식 |
|:---:|:---|
| 마우스 이동 | 좌표, 속도, 가속도 |
| 터치 이벤트 | 터치 포인트 추적 |
| 키보드 입력 | 키코드 + 타이밍 |
| 스크롤 | 스크롤 델타 값 |
| 장치 모션 | 가속도계 (모바일) |
| Web Crypto API | 암호화적 난수 혼합 |

### 🃏 6가지 스프레드

- **오늘의 운세** - 하루를 위한 1장
- **과거/현재/미래** - 흐름을 읽는 3장
- **양자택일** - 선택의 기로에서
- **연애의 온도** - 나, 그 사람, 그리고 우리
- **마음/몸/영혼** - 내면의 균형 찾기
- **켈트 십자가** - 깊이 있는 10장의 통찰

### 🤖 AI 질문 복사

리딩 결과를 **ChatGPT/Gemini용 프롬프트**로 복사하여 더 자세한 해석을 받을 수 있습니다.

- 질문 입력란에 궁금한 점 작성
- "결과 복사하기" 클릭
- AI 채팅에 붙여넣기

## 🛠️ 기술 스택

- **Vanilla JavaScript** (ES6 Modules)
- **Tailwind CSS** (CDN)
- **원자 단위 설계 (Atomic Design)**
- **SOLID 원칙** 적용

## 📁 프로젝트 구조

```
Tarot/
├── index.html
├── css/
│   └── styles.css
└── js/
    ├── app.js                 # 메인 진입점
    ├── core/
    │   ├── app-state.js       # 상태 관리
    │   └── step-controller.js # UI 흐름 제어
    ├── components/
    │   ├── particle-system.js # 파티클 시각화
    │   ├── tarot-card.js      # 카드 컴포넌트
    │   ├── spread-selector.js # 스프레드 선택
    │   └── reading-display.js # 결과 + AI 복사
    ├── utils/
    │   ├── entropy-engine.js  # 엔트로피 수집
    │   └── seeded-random.js   # Mulberry32 PRNG
    └── data/
        └── tarot-deck.js      # 78장 카드 데이터
```

## 🚀 사용 방법

### 로컬 실행

```bash
npx serve .
# 브라우저에서 http://localhost:3000 접속
```

### GitHub Pages

이 저장소는 GitHub Pages에서 바로 호스팅할 수 있습니다.

## 🎨 스크린샷

![Entropy Collection](https://via.placeholder.com/600x400?text=Entropy+Collection)

## 📜 라이선스

MIT License

## 👨‍💻 제작자

**pi-dimension**

---

<p align="center">
  <i>Powered by User Entropy</i> 🌙
</p>
