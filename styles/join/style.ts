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
    animation: ${slideIn} 2s 2s forwards;
    pointer-events: auto;
    ${(props) =>
        props.launched &&
        css`
            transform: translate(-50%, 70%);
            animation: ${slideOut} 2s 2s forwards;
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
            animation: ${launch} 4s 2s forwards;
        `}
`;
const hover = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;

export const Rocket = styled.div`
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
    animation: ${stanby} 4s;
    transition: 3s;
    ${(props) =>
        props.launched &&
        css`
            width: 100%;
            top: 30%;
        `}
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
    z-index: 6;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border-radius: 16px;
    box-shadow: 0 24px 70px rgba(0, 0, 0, 0.6);
    overflow: hidden;
    pointer-events: ${(props) => (props.infoOpen ? 'auto' : 'none')};

    @media (max-width: 640px) {
        width: calc(100% - 2rem);
        max-height: 88dvh;
        border-radius: 14px;
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
    border-top: 1px solid #262626;
    background: #171717;

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
    animation: ${fadeIn} 2s 4s forwards;

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
    animation: ${fadeIn} 0.6s 2.4s forwards;

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
        display: flex;
        align-items: baseline;
        gap: 0.8rem;
        font-size: 2.1rem;
        font-weight: 700;
        color: #ffffff;
        letter-spacing: -0.035em;
        margin-bottom: 1rem;
    }

    /* 번호를 상자에 넣으면 테두리만 늘고 정보는 그대로다. 숫자만 연하게 둔다. */
    & h3 em {
        font-style: normal;
        font-size: 1.5rem;
        font-weight: 600;
        color: #6f6a63;
        font-variant-numeric: tabular-nums;
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
    margin-top: 1.2rem !important;
    padding-left: 1.2rem;
    border-left: 2px solid ${THEME.ORANGE};
    font-size: 1.5rem !important;
    color: #a9a39a !important;
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

    /* 보조: 조용하되 분명히 읽혀야 한다.
       갈색기가 도는 중립색(#262119)은 탁해 보인다. 순수한 회색 계열로 올린다. */
    & button:first-child {
        color: #f2efea;
        background: #2b2b2b;
        border: 1px solid #454545;
    }
    & button:first-child:hover {
        background: #363636;
        border-color: #6b6b6b;
        color: #ffffff;
    }

    /* 주: 채움 */
    & button:last-child {
        color: #151515;
        background: ${THEME.ORANGE};
        border: 1px solid ${THEME.ORANGE};
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
        background: #242424;
        border-color: #3a3a3a;
        color: #6e6e6e;
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
export const CheckContainer = styled.div`
    width: 100%;

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
