import styled, { css, keyframes } from 'styled-components';
import { THEME } from 'styles/theme';
import { motion } from 'framer-motion';
import { fadeIn } from 'styles/activities/style';
export const NavBarContainer = styled.div<{
    scroll: boolean;
    pathname: string;
}>`
    padding: 34px 68px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100vw;
    /* max-width: 1920px; */
    z-index: 10;
    position: fixed;
    box-sizing: border-box;
    background-color: transparent;
    transition: 1s;
    ${(props) =>
        props.scroll &&
        props.pathname === '/home' &&
        css`
            background-color: rgba(0, 0, 0, 0.85);
        `}
    ${(props) =>
        props.scroll &&
        props.pathname !== '/home' &&
        css`
            background-color: rgba(255, 255, 255, 0.85);
        `}
`;

export const NavBarLogo = styled.img`
    cursor: pointer;
    width: 10rem;
`;

export const NavLinkWrapper = styled.div`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-end;
`;

export const StyledNav = styled.nav<{
    isWhite: boolean;
    selected: boolean;
    key: any;
}>`
    text-decoration: none;
    color: ${({ isWhite }) => (isWhite ? THEME.WHITE : THEME.BLACK)};
    font-size: 1.6rem;
    padding: 10px;
    transition: all 0.3s;
    ${(props) =>
        props.selected &&
        css`
            margin-bottom: -2px;
            border-bottom: 2px solid ${THEME.ORANGE};
            color: ${THEME.ORANGE};
        `}
    cursor: pointer;
    &:hover {
        color: ${THEME.ORANGE};
    }

    & + & {
        margin-left: 5%;
    }
`;
// 모바일
export const Container = styled.div<{ isOpen: boolean }>`
    position: fixed;
    top: 0;
    width: 100vw;
    z-index: 10000;
    .ant-menu-dark {
        background-color: black;
    }
    .ant-menu-dark.ant-menu-dark:not(.ant-menu-horizontal) .ant-menu-item-selected {
        background-color: ${THEME.ORANGE};
    }

    .ant-menu-root {
        height: calc(100vh - 6rem);
        z-index: 10000;
    }
`;

export const Header = styled.div`
    background-color: black;
    height: 6rem;
    padding: 0 1.6rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    /*
     * position 이 없으면 z-index 는 무시된다. 그래서 드로어(z-index 80)가
     * 헤더 위에 그려져 햄버거 버튼이 가려졌고 사이드바를 닫을 수 없었다.
     */
    position: relative;
    z-index: 90;
`;

export const HeaderWhiteSpace = styled.div`
    z-index: -1;
    height: 6rem;
`;

const slideOut = keyframes`
  0%{
    transform: translateX(-100%);
  }
  100%{
    transform: translateX(0);
  }
`;

const slideIn = keyframes`
  0%{
    transform: translateX(0);
  }
  100%{
    transform: translateX(-100%);
  }
`;

export const MenuContainer = styled(motion.div)<{ isOpen: boolean }>`
    width: 100%;
    height: 100%;
    background-color: #0b0b0c;
    /* 화면 고정은 부모 nav 가 맡는다. 여기서는 그 박스를 꽉 채우기만 한다. */
    position: relative;
    z-index: 1;

    /* 메뉴는 위, 정보는 아래. absolute 로 띄우면 화면 높이가 바뀔 때 어긋난다. */
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 10rem 0 max(3.2rem, env(safe-area-inset-bottom));
    box-sizing: border-box;
`;
export const MenuWrapper = styled(motion.div)`
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    position: relative;
    margin: 0 auto;
    gap: 0.4rem;
`;
export const Menu = styled.div<{ selected: boolean }>`
    /*
     * 이전에는 활성 항목을 화면 폭 전체 오렌지 블록으로 칠했다.
     * 데스크톱 내비는 오렌지 글자 + 짧은 밑줄인데 모바일만 다른 문법을 써서
     * 같은 사이트로 안 읽혔다. 데스크톱과 같은 표기로 맞춘다.
     */
    position: relative;
    display: inline-block;
    width: fit-content;
    color: rgba(255, 255, 255, 0.55);
    font-size: 2.8rem;
    font-weight: 600;
    letter-spacing: -0.03em;
    padding: 1.1rem 0;
    margin-inline: 2.8rem;
    cursor: pointer;
    transition:
        color 0.18s ease,
        transform 0.18s cubic-bezier(0.22, 1, 0.36, 1);

    /* 밑줄은 글자 폭만큼만. 활성일 때만 나타난다. */
    &::after {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0.55rem;
        height: 2px;
        background: ${THEME.ORANGE};
        transform: scaleX(0);
        transform-origin: left center;
        transition: transform 0.24s cubic-bezier(0.22, 1, 0.36, 1);
    }

    ${(props) =>
        props.selected &&
        css`
            color: ${THEME.ORANGE};
            &::after {
                transform: scaleX(1);
            }
        `}

    @media (any-hover: hover) {
        &:hover {
            color: #ffffff;
        }
    }
    &:active {
        transform: translateX(2px);
    }
`;
export const SubMenuContainer = styled.div<{ subMenu: any }>`
    width: 100%;
`;
export const SubMenu = styled.div`
    color: white;
    padding: 1.2rem 4rem;
    background-color: #151515;
`;
export const NoticeContainer = styled.section`
    /* absolute 로 띄우면 화면 높이가 바뀔 때 메뉴와 겹치거나 잘린다. 흐름 안에 둔다. */
    color: rgba(255, 255, 255, 0.5);
    padding-inline: 2.8rem;
    display: grid;
    gap: 0.5rem;

    & p {
        margin: 0;
        font-size: 1.35rem;
        line-height: 1.6;
        letter-spacing: -0.02em;
        overflow-wrap: anywhere;
    }
    & a {
        color: inherit;
    }
    @media (any-hover: hover) {
        & a:hover {
            color: #ffffff;
        }
    }
`;

/** 사이드바 하단 소셜. 사이트 푸터와 같은 아이콘·같은 크기로 맞춘다. */
export const NoticeSocials = styled.div`
    display: flex;
    align-items: center;
    gap: 0.6rem;
    margin-bottom: 1.6rem;
    margin-left: -1rem;

    & a {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 4.4rem;
        height: 4.4rem;
        border-radius: 10px;
        color: rgba(255, 255, 255, 0.62);
        transition:
            background 0.16s ease,
            color 0.16s ease;
    }
    & a svg {
        width: 2rem;
        height: 2rem;
    }
    @media (any-hover: hover) {
        & a:hover {
            background: rgba(255, 255, 255, 0.08);
            color: #ffffff;
        }
    }
    & a:focus-visible {
        outline: 2px solid ${THEME.ORANGE};
        outline-offset: 2px;
    }
`;
export const HamburgerContainer = styled.div<{
    click: boolean;
    isWhite: boolean;
}>`
    position: relative;
    width: 3rem;
    cursor: pointer;
    z-index: 3;
    &:after {
        content: '';
        display: block;
        padding-bottom: 80%;
    }
    & span {
        position: absolute;
        left: 0;
        width: 100%;
        height: 2px;
        background-color: white;
        border-radius: 4px;
        transition: all 0.4s;
        /* ${(props) =>
            props.isWhite &&
            css`
                background-color: white;
            `} */
    }
    & span:nth-of-type(1) {
        top: 0;
        ${(props) =>
            props.click &&
            css`
                webkit-transform: translateY(1.1rem) rotate(-315deg);
                transform: translateY(1.1rem) rotate(-315deg);
            `}
    }

    & span:nth-of-type(2) {
        top: 1.1rem;
        ${(props) =>
            props.click &&
            css`
                opacity: 0;
            `}
    }

    & span:nth-of-type(3) {
        bottom: 0;
        ${(props) =>
            props.click &&
            css`
                -webkit-transform: translateY(-1.1rem) rotate(315deg);
                transform: translateY(-1.1rem) rotate(315deg);
            `}
    }
`;
