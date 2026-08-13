import styled, { css, keyframes } from 'styled-components';
import { THEME } from 'styles/theme';
export const color = keyframes`
0%{
  filter: grayscale(1)
}
100%{
  filter: grayscale(0)
}
`;
export const fadeIn = keyframes`
0%{
  opacity: 0;
}
100%{
  opacity: 1;
}
`;
export const slideIn = keyframes`
0%{
  transform: translate(-50%, 100%);
}
100%{
  transform: translate(-50%, 70%);
}
`;
export const slideOut = keyframes`
0%{
  transform: translate(-50%, 70%);
}
100%{
  transform: translate(-50%, 150%);
}
`;
export const stanby = keyframes`
0%{
  width:50%;
  top:0;
}
50%{
  width:100%;
  top:30%;
}
100%{
  width: 50%;
  top:0;
}
`;
export const launch = keyframes`
0%{
  bottom: 0;
}
100%{
  bottom:200vh;
}
`;

export const vibrate = keyframes`
0%{
  bottom: 0;
}
100%{
  bottom:200vh;
}
`;

export const Container = styled.div`
    width: 100%;
    height: 100vh;
    overflow: hidden;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    position: relative;
    align-items: center;
    background-color: #000;
`;
export const SpaceContainer = styled.div<{ isMobile: boolean }>`
    width: 33%;
    min-height: 100vh;
    max-width: 800px;
    position: absolute;
    z-index: 2;
    left: 50%;
    top: 0;
    transform: translate(-50%, 0);
    pointer-events: none;
    ${(props) =>
        props.isMobile &&
        css`
            width: 100%;
            max-width: 430px;
        `}
`;

export const Planet = styled.div<{ launched: boolean }>`
    width: 180%;
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translate(-50%, 100%);
    animation: ${slideIn} 1s 0.15s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    pointer-events: auto;
    ${(props) =>
        props.launched &&
        css`
            transform: translate(-50%, 70%);
            animation: ${slideOut} 1.1s 0.2s cubic-bezier(0.5, 0, 0.75, 0) forwards;
        `}
    & img {
        width: 100%;
        height: 100%;
    }
`;

export const RocketContainer = styled.div<{ launched: boolean }>`
    width: 30%;
    position: absolute;
    left: 50%;
    bottom: 0;
    transform: translate(-50%, 0);
    z-index: 4;
    cursor: pointer;
    pointer-events: auto;
    &::after {
        content: '';
        display: block;
        padding-bottom: 200%;
    }
    ${(props) =>
        props.launched &&
        css`
            animation: ${launch} 2.6s 0.35s forwards;
        `}
`;
/**
 * 로켓을 눌렀을 때의 점화.
 * 바로 솟구치면 튕겨나간 것처럼 보인다. 잠깐 진동하며 힘을 모으다가
 * 밀려 올라가야 '발사'로 읽힌다.
 */
const ignite = keyframes`
  0%   { transform: translate3d(0, 0, 0) scale(1); }
  12%  { transform: translate3d(-2px, 2px, 0) scale(0.985); }
  22%  { transform: translate3d(2px, 1px, 0) scale(0.985); }
  32%  { transform: translate3d(-2px, 2px, 0) scale(0.99); }
  42%  { transform: translate3d(1px, 0, 0) scale(1); }
  100% { transform: translate3d(0, -110px, 0) scale(1.04); }
`;

const hover = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;

export const Rocket = styled.div<{ igniting?: boolean }>`
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 5;
    pointer-events: auto;

    /* 눌러야 할 대상이 가만히 있으면 누를 수 있는지 알 수 없다.
       천천히 떠 있게 두고, 커서를 올리면 확실히 반응한다. */
    animation: ${hover} 4.5s ease-in-out infinite;
    transition:
        transform 0.28s cubic-bezier(0.22, 1, 0.36, 1),
        filter 0.28s ease;

    & img {
        width: 100%;
        display: block;
    }

    @media (any-hover: hover) {
        ${RocketContainer}:hover & {
            transform: scale(1.06) translateY(-6px);
            filter: drop-shadow(0 0 28px rgba(247, 148, 30, 0.45));
        }
    }
    ${RocketContainer}:active & {
        transform: scale(0.98);
    }

    /* 점화 중에는 대기 모션과 hover 를 모두 덮어쓴다 */
    ${(props) =>
        props.igniting &&
        css`
            animation: ${ignite} 0.62s cubic-bezier(0.4, 0, 0.2, 1) forwards;
            filter: drop-shadow(0 14px 34px rgba(247, 148, 30, 0.55));
        `}

    @media (prefers-reduced-motion: reduce) {
        animation: none;
    }
`;
export const Fire = styled.div<{ launched: boolean }>`
    width: 50%;
    position: absolute;
    top: 0;
    left: 50%;
    z-index: 4;
    transform: translateX(-50%);
    animation: ${stanby} 2s;
    transition: 3s;
    ${(props) =>
        props.launched &&
        css`
            width: 100%;
            top: 30%;
        `}
`;

/**
 * 배경 가림막.
 * 이게 없으면 뒤 페이지가 그대로 보여서 모달이 '떠 있는 레이어' 로 읽히지 않는다.
 * 색만 덮고 blur 는 쓰지 않는다. 모바일에서 backdrop-filter 는 프레임을 크게 깎는다.
 */
export const Scrim = styled.div<{ $open: boolean }>`
    position: fixed;
    inset: 0;
    z-index: 1000;
    background: rgba(0, 0, 0, 0.62);
    opacity: ${(props) => (props.$open ? 1 : 0)};
    pointer-events: ${(props) => (props.$open ? 'auto' : 'none')};
    transition: opacity 0.2s ease;
`;

export const ModalContainer = styled.div<{ infoOpen: boolean }>`
    /*
     * header(고정) / body(스크롤) / footer(고정) 3존.
     * 동의 체크와 버튼이 스크롤 맨 아래에 숨어 있으면 지원자가 무엇을 해야 하는지
     * 알 수 없다. 액션은 스크롤 위치와 무관하게 항상 보여야 한다. (Carbon, M3)
     */
    width: min(92vw, 800px);
    max-height: min(84dvh, 760px);
    display: flex;
    flex-direction: column;
    background-color: #151515;
    color: white;
    position: fixed;
    /* 헤더가 z-index: 10 이라 6 으로는 로고와 햄버거가 모달을 덮어
       상단이 잘린 것처럼 보였다. 그 위로 올린다. */
    z-index: 1001;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    /*
     * 어두운 배경 위의 어두운 카드는 그림자가 묻혀 납작해 보인다.
     * 위쪽 가장자리에 아주 옅은 밝은 선을 얹으면 위에서 빛이 닿은 것처럼 읽혀
     * 카드가 떠오른다. 아래쪽은 반대로 어둡게 눌러 두께를 만든다.
     */
    border-radius: 18px;
    @supports (corner-shape: squircle) {
        corner-shape: squircle;
        border-radius: 26px;
    }
    box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.09),
        inset 0 -1px 0 rgba(0, 0, 0, 0.6),
        0 2px 6px rgba(0, 0, 0, 0.4),
        0 18px 40px rgba(0, 0, 0, 0.55),
        0 40px 90px rgba(0, 0, 0, 0.45);
    overflow: hidden;
    pointer-events: ${(props) => (props.infoOpen ? 'auto' : 'none')};

    /*
     * 모바일에서 화면 중앙에 띄우면 상단이 사이트 헤더와 겹쳐 잘린 것처럼 보인다.
     * 아래에 붙이는 시트로 바꾸면 헤더와 물리적으로 만나지 않는다.
     * 위쪽에 남는 배경 띠가 '이건 겹쳐 뜬 화면' 이라는 신호도 된다.
     */
    @media (max-width: 640px) {
        width: 100%;
        max-width: none;
        top: auto;
        bottom: 0;
        left: 0;
        transform: none;
        /* 헤더 높이 + 여유만큼은 항상 배경이 보이게 남긴다 */
        max-height: calc(100dvh - 9rem);
        border-radius: 20px 20px 0 0;
        @supports (corner-shape: squircle) {
            corner-shape: squircle;
            border-radius: 28px 28px 0 0;
        }
        box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.09),
            0 -8px 32px rgba(0, 0, 0, 0.5);
        padding-bottom: env(safe-area-inset-bottom);
    }
`;

export const ModalHeader = styled.header`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.6rem;
    padding: 2.2rem 2.8rem 1.8rem;
    flex: 0 0 auto;

    & h2 {
        margin: 0;
        font-size: 2.6rem;
        font-weight: 800;
        letter-spacing: -0.035em;
        color: #ffffff;
    }
    & h2:focus {
        outline: none;
    }

    @media (max-width: 640px) {
        padding: 1.8rem 2rem 1.4rem;
        & h2 {
            font-size: 2.1rem;
        }
    }
`;

export const ModalFooter = styled.div`
    flex: 0 0 auto;
    padding: 1.6rem 2.8rem 2.2rem;
    /* 명도 차이를 크게 두면 회색 띠가 따로 얹힌 것처럼 보인다.
       거의 같은 톤으로 두고 본문 하단 그림자가 경계를 만들게 한다. */
    background: #161616;

    @media (max-width: 640px) {
        padding: 1.2rem 2rem 1.8rem;
    }
`;
export const ModalContentWrapper = styled.div`
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: 0 2.8rem;

    /*
     * 스크롤 그림자.
     * 별도 요소를 덧대는 대신 배경 레이어 네 장을 쓴다. local 로 붙인 두 장은
     * 콘텐츠와 함께 스크롤하고 scroll 로 붙인 두 장은 고정되므로, 맨 위/맨 아래에
     * 닿는 순간 그림자가 자동으로 가려져 사라진다. (Lea Verou)
     * 색은 브랜드 컬러가 아니라 배경색으로만 처리한다.
     */
    background:
        linear-gradient(#151515 30%, rgba(21, 21, 21, 0)) center top,
        linear-gradient(rgba(21, 21, 21, 0), #151515 70%) center bottom,
        radial-gradient(farthest-side at 50% 0, rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0)) center top,
        radial-gradient(farthest-side at 50% 100%, rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0)) center bottom;
    background-repeat: no-repeat;
    background-size:
        100% 42px,
        100% 42px,
        100% 16px,
        100% 16px;
    background-attachment: local, local, scroll, scroll;

    @media (max-width: 640px) {
        padding: 0 2rem;
    }
`;

/** 읽은 만큼 차오르는 2px 선. JS 없이 스크롤 진행도에 직결된다. */
export const ScrollProgress = styled.div`
    position: sticky;
    top: 0;
    z-index: 1;
    height: 2px;
    margin: 0 -2.8rem;
    background: transparent;

    @supports (animation-timeline: scroll(self block)) {
        &::after {
            content: '';
            display: block;
            height: 100%;
            background: ${THEME.ORANGE};
            transform-origin: left center;
            animation: nextReadProgress linear both;
            animation-timeline: scroll(nearest block);
        }

        @keyframes nextReadProgress {
            from {
                transform: scaleX(0);
            }
            to {
                transform: scaleX(1);
            }
        }
    }

    @media (max-width: 640px) {
        margin: 0 -2rem;
    }
`;
/**
 * 글자 "X" 는 폰트마다 굵기가 다르고 히트 영역도 글자 크기만큼밖에 안 된다.
 * 44px 버튼 안에 SVG 로 그린다.
 */
export const CloseBtnWrapper = styled.div`
    flex: 0 0 auto;

    & button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 4.4rem;
        height: 4.4rem;
        border: 0;
        border-radius: 50%;
        background: transparent;
        color: #8d877f;
        cursor: pointer;
        transition:
            background 0.16s,
            color 0.16s;
    }
    & button svg {
        width: 1.9rem;
        height: 1.9rem;
    }
    & button:hover {
        background: #262626;
        color: #ffffff;
    }
    & button:focus-visible {
        outline: 2px solid ${THEME.ORANGE};
        outline-offset: 2px;
    }
`;
export const TitleWrapper = styled.div<{ isMobile: boolean }>`
    width: 80%;
    max-width: 800px;
    position: absolute;
    z-index: 4;
    top: 40vh;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    flex-direction: column;
    flex-wrap: wrap;
    pointer-events: none;
    opacity: 0;
    /* 이전: 4s 지연 + 2s 페이드 = 텍스트가 다 보이기까지 6초. 너무 느려 빈 화면으로 읽혔다. */
    animation: ${fadeIn} 0.5s 0.25s forwards;

    & > img {
        width: 100%;
        margin-bottom: 2.5rem;
        ${(props) =>
            !props.isMobile &&
            css`
                width: 60%;
            `}
    }

    & > div.university-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        margin-bottom: 2.5rem;
        gap: 2rem;

        & span {
            font-size: 3rem;
            font-family: 'GmarketSansMedium';
            font-weight: 700;
            white-space: nowrap;
        }

        & img {
            height: 3rem;
            width: auto;
            margin: 0;
        }
    }

    & > p {
        font-family: 'GmarketSansMedium';
        font-weight: 700;
        font-size: 2.5rem;
        width: 100%;
        text-align: center;
        margin: 0;
        margin-bottom: 3.5rem;
        position: relative;
        top: 0;
    }
`;
/**
 * 로켓을 누르라는 안내.
 *
 * 이전에는 반투명 회색 박스에 담아 1초마다 깜빡였다. 대비가 거의 없어 읽히지 않았고,
 * 점멸은 시선을 뺏을 뿐 무엇을 눌러야 하는지는 알려주지 않는다.
 * 박스를 걷고, 시선이 로켓으로 내려가도록 아래를 가리키는 표시만 남긴다.
 */
const nudge = keyframes`
  0%, 100% { transform: translateY(0); opacity: 0.55; }
  50% { transform: translateY(5px); opacity: 1; }
`;

export const RocketInfo = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.8rem;
    margin-top: 1.2rem;
    opacity: 0;
    animation: ${fadeIn} 0.5s 1s forwards;

    & p {
        margin: 0;
        font-size: 1.6rem;
        font-weight: 500;
        letter-spacing: -0.025em;
        color: rgba(255, 255, 255, 0.62);
    }
    & span {
        color: #ffffff;
        font-weight: 700;
    }

    /* 아래로 살짝 내려갔다 오는 표시. 점멸이 아니라 방향을 가리킨다. */
    & svg {
        width: 1.8rem;
        height: 1.8rem;
        color: ${THEME.ORANGE};
        animation: ${nudge} 1.8s ease-in-out infinite;
    }

    @media (prefers-reduced-motion: reduce) {
        & svg {
            animation: none;
        }
    }
`;

export const InfoModal = styled.div`
    display: flex;
    flex-direction: column;

    & b {
        color: ${THEME.ORANGE};
        font-weight: 600;
    }
`;

/**
 * 안내문이 통짜 <p> 에 <br> 로만 나뉘어 있어 소제목과 본문의 위계가 없었다.
 * 절마다 구분선을 두고 번호를 달아 스캔할 수 있게 만든다.
 */
export const InfoSection = styled.section`
    /*
     * 폭을 가로지르는 구분선과 절 사이 과한 여백은 '다 봤다'는 착각을 만드는
     * 3대 원인에 속한다 (NN/g, The Illusion of Completeness).
     * 선을 걷고 간격만으로 나눈다.
     */
    padding: 1.6rem 0 2rem;

    & h3 {
        display: block;
        font-size: 2.1rem;
        font-weight: 700;
        color: #ffffff;
        letter-spacing: -0.035em;
        margin-bottom: 1rem;
    }



    & p {
        font-size: 1.5rem;
        line-height: 1.72;
        color: #a8a29a;
        margin-bottom: 0.8rem;
    }
    & p:last-child {
        margin-bottom: 0;
    }

    & ol {
        margin: 0;
        padding-left: 2rem;
        display: grid;
        gap: 0.7rem;
    }
    & ol li {
        font-size: 1.5rem;
        line-height: 1.68;
        color: #a8a29a;
    }
    & ol li::marker {
        color: #7d776f;
    }
`;

/**
 * 원래는 <mark> 에 오렌지 배경을 통째로 깔아 형광펜처럼 보였다.
 * 실제 버튼을 가리키는 표시이므로 버튼처럼 생긴 작은 칩으로 바꾼다.
 */
/* 상자를 두르면 문장 안에서 시선이 계속 끊긴다. 색과 굵기로만 표시한다. */
export const Chip = styled.strong`
    color: #e8e3db;
    font-weight: 700;
    white-space: nowrap;
`;

export const Note = styled.p`
    /* 세로 컬러 바는 시선을 끌지만 정보를 더 주지 않는다.
       들여쓰기만으로 부속 문장임을 표시한다. */
    margin-top: 1.2rem !important;
    padding-left: 2rem;
    font-size: 1.5rem !important;
    color: #a9a39a !important;
`;

/**
 * 본문 안에서 실제 버튼을 가리키는 표시.
 * 아래 푸터의 버튼과 같은 모양·같은 아이콘으로 두면, 문장을 읽다가
 * 어떤 버튼을 말하는지 눈으로 바로 찾을 수 있다.
 */
const inlineBtnBase = css`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.3em;
    /* 본문 글자보다 확실히 작아야 문장 안의 표시로 읽힌다.
       패딩과 line-height 를 함께 조여 줄 높이를 밀어올리지 않게 한다. */
    padding: 0.1em 0.45em;
    margin: 0 0.15em;
    border-radius: 4px;
    font-size: 0.8em;
    line-height: 1.5;
    font-weight: 700;
    white-space: nowrap;
    /* baseline 정렬은 아이콘 때문에 아래로 처진다. 글줄 한가운데에 맞춘다. */
    vertical-align: middle;

    & svg {
        width: 0.9em;
        height: 0.9em;
        flex: 0 0 auto;
    }
`;

/** 주 버튼(지원하기)과 같은 오렌지 채움 */
export const NoteChip = styled.span`
    ${inlineBtnBase}
    background: ${THEME.ORANGE};
    color: #151515;
`;

/** 보조 버튼(지원서 다운로드)과 같은 회색 채움 */
export const NoteChipGhost = styled.span`
    ${inlineBtnBase}
    background: #2b2b2b;
    border: 1px solid #454545;
    color: #f2efea;
`;

/** 버튼이 왜 비활성인지 말해주지 않으면 지원자는 고장으로 받아들인다. */
export const BlockedReason = styled.p<{ $shown: boolean }>`
    margin: 1rem 0 0;
    font-size: 1.4rem;
    color: #7d766c;
    /* 사라져도 자리는 남는다. 안 그러면 체크하는 순간 모달이 위로 튄다. */
    visibility: ${(props) => (props.$shown ? 'visible' : 'hidden')};
    opacity: ${(props) => (props.$shown ? 1 : 0)};
    transition: opacity 0.18s ease;
`;
export const NextBtnWrapper = styled.div<{
    isMobile: boolean;
    accepted: boolean;
}>`
    /*
     * 이전에는 두 버튼 모두 오렌지 아웃라인이라 무엇이 목적인지 알 수 없었고,
     * width 45% + space-between 이라 가운데 빈 공간이 아무것과도 맞지 않았다.
     * 다운로드는 보조, 지원하기는 주 동작으로 무게를 나눈다.
     */
    width: 100%;
    display: flex;
    gap: 1.2rem;
    margin: 0.4rem 0 0;

    & button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.9rem;
        flex: 1 1 0;
        min-height: 5rem;
        border-radius: 6px;
        font-size: 1.6rem;
        font-weight: 600;
        letter-spacing: -0.025em;
        cursor: pointer;
        transition:
            background 0.16s,
            border-color 0.16s,
            color 0.16s;
    }

    /*
     * 보조 버튼을 회색으로 채우면 주 버튼과 나란히 놓였을 때 '회색 사각형 두 개' 가
     * 되어 흔한 인상이 된다. 채움을 걷고 테두리만 남긴다.
     * 어두운 면에서는 위쪽 안쪽 하이라이트가 있어야 눌리는 물체로 읽힌다.
     */
    & button:first-child {
        color: #efece7;
        background: transparent;
        border: 1px solid #3f3f3f;
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
    }
    & button:first-child:hover {
        background: rgba(255, 255, 255, 0.04);
        border-color: #6b6b6b;
        color: #ffffff;
    }

    /* 주: 채움 */
    & button:last-child {
        color: #151515;
        background: ${THEME.ORANGE};
        border: 1px solid ${THEME.ORANGE};
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.28);
        flex: 1.3 1 0;
    }
    & button:last-child:hover:not(:disabled) {
        background: #ffa63d;
        border-color: #ffa63d;
    }

    /* 비활성은 보이되 누를 수 없음이 분명해야 한다. 사라지면 고장으로 읽힌다. */
    & button svg {
        width: 1.8rem;
        height: 1.8rem;
        flex: 0 0 auto;
    }

    & button:last-child:disabled {
        background: transparent;
        border-color: #333333;
        color: #6b6b6b;
        box-shadow: none;
        cursor: not-allowed;
    }

    @media (max-width: 640px) {
        flex-direction: column;

        & button,
        & button:last-child {
            flex: 1 1 auto;
            width: 100%;
        }
    }
`;
/**
 * 기본 체크박스는 다크 배경 위에서 흰 사각형 덩어리로 튄다.
 * appearance 를 걷어내고 직접 그린다. 라벨 전체가 클릭 영역이라
 * 손가락으로도 누르기 쉽다.
 */
/*
   눌러야 한다는 것을 알리는 흔들림.

   지원하기가 안 눌리는 이유가 이 체크칸인데, 사람은 자기가 누른 곳을 보지 그
   아래 안내 문구를 읽지 않는다. 눌린 순간 시선을 여기로 데려온다.

   크게 흔들지 않는다. 요란하면 잘못한 것처럼 느껴진다. 한 번 눈에 걸릴 만큼만.
*/
const shake = keyframes`
    0%, 100% { transform: translateX(0); }
    20%      { transform: translateX(-5px); }
    40%      { transform: translateX(5px); }
    60%      { transform: translateX(-3px); }
    80%      { transform: translateX(2px); }
`;

export const CheckContainer = styled.div<{ $nudge?: boolean }>`
    width: 100%;
    border-radius: 10px;
    /* 흔들릴 때 테두리가 상자 밖으로 나가지 않게 자리를 미리 준다. */
    margin: 0 -1rem;
    padding: 0 1rem;
    transition:
        background 0.2s ease,
        box-shadow 0.2s ease;

    ${(props) =>
      props.$nudge &&
      css`
        background: rgba(247, 148, 30, 0.1);
        box-shadow: inset 0 0 0 1.5px ${THEME.ORANGE};
        animation: ${shake} 0.42s ease;

        & label::before {
            border-color: ${THEME.ORANGE};
        }

        @media (prefers-reduced-motion: reduce) {
            animation: none;
        }
      `}

    & input {
        position: absolute;
        opacity: 0;
        pointer-events: none;
    }

    & label {
        display: flex;
        align-items: flex-start;
        gap: 1.2rem;
        min-height: 4.4rem;
        padding: 1rem 0;
        cursor: pointer;
        font-size: 1.6rem;
        line-height: 1.5;
        color: #c8c3bb;
        user-select: none;
    }

    & label::before {
        content: "";
        flex: 0 0 auto;
        width: 2.2rem;
        height: 2.2rem;
        margin-top: 0.1rem;
        border: 1.5px solid #4a453d;
        border-radius: 5px;
        background: transparent;
        transition:
            background 0.15s,
            border-color 0.15s;
    }

    & input:checked + label {
        color: #ffffff;
    }
    & input:checked + label::before {
        background: ${THEME.ORANGE};
        border-color: ${THEME.ORANGE};
        /* 체크 표시는 배경 이미지로. 별도 요소를 쓰면 정렬이 계속 어긋난다. */
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23151515' stroke-width='3.4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M5 12.5l5 5 9-10'/%3E%3C/svg%3E");
        background-size: 78%;
        background-position: center;
        background-repeat: no-repeat;
    }
    & input:focus-visible + label::before {
        outline: 2px solid ${THEME.ORANGE};
        outline-offset: 2px;
    }
`;
