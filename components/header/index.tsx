import React, { useEffect, useState } from "react";
import Image from "next/image";
import { URLS } from "constants/urls";
import * as S from "styles/components/header/style";
import LogoImg from "public/assets/logo.png";
import BlackLogoImg from "public/assets/blackLogo.png";
import { useMediaQuery } from "react-responsive";
import "antd/dist/reset.css";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
const Links = [
  { name: "HOME", path: URLS.HOME },
  { name: "ABOUT US", path: URLS.ABOUT_US },
  { name: "ACTIVITIES", path: URLS.ACTIVITIES },
  { name: "PEOPLE", path: URLS.PEOPLE },
  { name: "JOIN US", path: URLS.JOIN_US },
  // 로그인이 필요한 유일한 항목이라 데스크톱에서는 아이콘으로 구분한다.
  { name: "MEMBERS", path: URLS.MEMBERS, icon: true },
];
const NavBar = () => {
  const router = useRouter();
  const pathname = router.pathname;
  const [isOpen, setIsOpen] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [fullscreen, setFullscreen] = useState<number>();
  const [subMenu, setSubMenu] = useState("");
  const logoSrc =
    pathname === URLS.HOME || pathname === URLS.JOIN_US
      ? LogoImg
      : BlackLogoImg;
  const updateScroll = () => {
    setScrollPosition(window.scrollY || document.documentElement.scrollTop);
  };
  const isMobile = useMediaQuery({
    query: "(max-width:820px)",
  });

  useEffect(() => {
    setFullscreen(window.innerHeight);
    window.addEventListener("scroll", updateScroll);
  }, []);
  const sidebar = {
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40,
      },
    },
    closed: {
      x: "-100%",
      transition: {
        // delay: 0.4,
        type: "spring",
        stiffness: 600,
        damping: 40,
      },
    },
  };
  if (isMobile) {
    return (
      <>
        {fullscreen && (
          <>
            <S.Container isOpen={isOpen}>
              <S.Header>
                <Image
                  src={LogoImg}
                  alt="NEXT 로고"
                  width={80}
                  height={25}
                  priority
                  onClick={() => router.push("home")}
                  style={{ cursor: "pointer" }}
                />
                <S.HamburgerContainer
                  onClick={() => {
                    setIsOpen((prev) => !prev);
                  }}
                  click={isOpen}
                  isWhite={pathname === URLS.HOME}
                >
                  <span></span>
                  <span></span>
                  <span></span>
                </S.HamburgerContainer>
              </S.Header>
              {/*
                transform 이 걸린 조상은 position: fixed 의 기준점이 된다.
                그래서 안쪽에서 fixed + top:0 을 줘도 이 nav 위치(헤더 아래)에서 시작했다.
                화면 고정은 여기서 하고 안쪽은 이 박스를 채우기만 한다.
              */}
              <motion.nav
                animate={isOpen ? "open" : "closed"}
                variants={sidebar}
                initial={false}
                style={{ position: "fixed", inset: 0, zIndex: 80 }}
              >
                <S.MenuContainer isOpen={isOpen}>
                  <S.MenuWrapper>
                    {Links.map(({ name, path }) => (
                      <>
                        <S.Menu
                          onClick={() => {
                            if (name === "ABOUT US" || name === "ACTIVITIES") {
                              if (subMenu === path) {
                                setSubMenu("");
                              } else {
                                setSubMenu(path);
                              }
                            } else {
                              router.push(path);
                              setSubMenu("");
                              setIsOpen((prev) => !prev);
                            }
                          }}
                          selected={pathname === path ? true : false}
                          key={name}
                        >
                          {name}
                        </S.Menu>
                        {path === "/about" && (
                          <AnimatePresence>
                            {subMenu === "/about" && (
                              <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: "auto" }}
                                exit={{ height: 0, transition: { delay: 0.5 } }}
                              >
                                <S.SubMenuContainer
                                  id="/about"
                                  subMenu={subMenu}
                                >
                                  <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                  >
                                    {/* <S.SubMenu
                                                                            onClick={() => {
                                                                                router.push({
                                                                                    pathname: path,
                                                                                    query: { key: '1' },
                                                                                });
                                                                                setIsOpen((prev) => !prev);
                                                                            }}
                                                                        >
                                                                            Introductions
                                                                        </S.SubMenu> */}
                                    <S.SubMenu
                                      onClick={() => {
                                        router.push({
                                          pathname: path,
                                          query: { key: "1" },
                                        });
                                        setIsOpen((prev) => !prev);
                                      }}
                                    >
                                      Greeting
                                    </S.SubMenu>
                                    <S.SubMenu
                                      onClick={() => {
                                        router.push({
                                          pathname: path,
                                          query: { key: "2" },
                                        });
                                        setIsOpen((prev) => !prev);
                                      }}
                                    >
                                      History
                                    </S.SubMenu>
                                    <S.SubMenu
                                      onClick={() => {
                                        router.push({
                                          pathname: path,
                                          query: { key: "3" },
                                        });
                                        setIsOpen((prev) => !prev);
                                      }}
                                    >
                                      Achievement
                                    </S.SubMenu>
                                    <S.SubMenu
                                      onClick={() => {
                                        router.push({
                                          pathname: path,
                                          query: { key: "4" },
                                        });
                                        setIsOpen((prev) => !prev);
                                      }}
                                    >
                                      Partners
                                    </S.SubMenu>
                                  </motion.div>
                                </S.SubMenuContainer>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        )}
                        {path === "/activities" && (
                          <AnimatePresence>
                            {subMenu === "/activities" && (
                              <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: "auto" }}
                                exit={{ height: 0, transition: { delay: 0.5 } }}
                              >
                                <S.SubMenuContainer
                                  id="/activities"
                                  subMenu={subMenu}
                                >
                                  <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                  >
                                    <S.SubMenu
                                      onClick={() => {
                                        router.push({
                                          pathname: path,
                                          query: { key: "1" },
                                        });
                                        setIsOpen((prev) => !prev);
                                      }}
                                    >
                                      Curriculum
                                    </S.SubMenu>
                                    <S.SubMenu
                                      onClick={() => {
                                        router.push({
                                          pathname: path,
                                          query: { key: "2" },
                                        });
                                        setIsOpen((prev) => !prev);
                                      }}
                                    >
                                      Session
                                    </S.SubMenu>
                                    <S.SubMenu
                                      onClick={() => {
                                        router.push({
                                          pathname: path,
                                          query: { key: "3" },
                                        });
                                        setIsOpen((prev) => !prev);
                                      }}
                                    >
                                      Project
                                    </S.SubMenu>
                                    <S.SubMenu
                                      onClick={() => {
                                        router.push({
                                          pathname: path,
                                          query: { key: "4" },
                                        });
                                        setIsOpen((prev) => !prev);
                                      }}
                                    >
                                      Demoday
                                    </S.SubMenu>
                                  </motion.div>
                                </S.SubMenuContainer>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        )}
                      </>
                    ))}
                  </S.MenuWrapper>
                  <S.NoticeContainer>
                    <S.NoticeSocials>
                      <a
                        href="https://www.linkedin.com/company/nextxlikelion/posts/?feedView=all"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="NEXT 링크드인"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <rect x="3" y="3" width="18" height="18" rx="4" />
                          <path d="M7.5 10.5V17M7.5 7.4v.1M11.5 17v-3.6a2.4 2.4 0 014.8 0V17" />
                        </svg>
                      </a>
                      <a
                        href="https://www.instagram.com/next_koreauniv/"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="NEXT 인스타그램"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <rect x="3" y="3" width="18" height="18" rx="5" />
                          <circle cx="12" cy="12" r="3.8" />
                          <path d="M17.3 6.8v.01" />
                        </svg>
                      </a>
                    </S.NoticeSocials>
                    <p>
                      <a href="mailto:nextku.contact@gmail.com">
                        nextku.contact@gmail.com
                      </a>
                    </p>
                    <p>
                      Korea University, Anam-dong, Seongbuk-gu, Seoul, South
                      Korea
                    </p>
                    <p>Ⓒ NEXT</p>
                  </S.NoticeContainer>
                </S.MenuContainer>
              </motion.nav>
            </S.Container>

            {/* <S.HeaderWhiteSpace /> */}
          </>
        )}
      </>
    );
  }
  return (
    <>
      {fullscreen && (
        <S.NavBarContainer
          scroll={scrollPosition > 60 ? true : false}
          // scroll={scrollPosition > fullscreen * 0.2 ? true : false}
          pathname={pathname}
        >
          <Image
            src={logoSrc}
            alt="NEXT 로고"
            width={120}
            height={30}
            priority
            onClick={() => router.push("home")}
            style={{ cursor: "pointer" }}
          />
          <S.NavLinkWrapper>
            {Links.map(({ name, path, icon }) =>
              icon ? (
                <S.NavIcon
                  key={name}
                  type="button"
                  aria-label="학회원 로그인"
                  title="학회원"
                  isWhite={pathname === URLS.HOME || pathname === URLS.JOIN_US}
                  selected={pathname === path}
                  onClick={() => router.push(path)}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="8.2" r="3.6" />
                    <path d="M4.8 19.6c1.3-3.3 3.9-5 7.2-5s5.9 1.7 7.2 5" />
                  </svg>
                </S.NavIcon>
              ) : (
                <S.StyledNav
                  isWhite={pathname === URLS.HOME || pathname === URLS.JOIN_US}
                  onClick={() => {
                    router.push(path);
                  }}
                  selected={pathname === path ? true : false}
                  key={name}
                >
                  {name}
                </S.StyledNav>
              ),
            )}
          </S.NavLinkWrapper>
        </S.NavBarContainer>
      )}
    </>
  );
};

export default NavBar;
