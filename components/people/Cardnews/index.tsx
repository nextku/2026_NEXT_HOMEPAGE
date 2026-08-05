import * as S from 'styles/components/cardnews/style';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { useMediaQuery } from 'react-responsive';
import { useRouter } from 'next/router';
import AOS from 'aos';
import 'aos/dist/aos.css';

import { ALUMNI_NEWS_INFORMATION } from 'constants/alumni-news';
import { ALUMNI_NEWS_INFORMATION_TYPE } from 'types/people/alumni-news-information';

const Cardnews = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const isDesktop = useMediaQuery({ minDeviceWidth: 820 });
    const isMobile = useMediaQuery({ maxWidth: 820 });
    const NEXT_INSTAGRAM_URL = 'https://www.instagram.com/p/CoSJYaohFig/';

    useEffect(() => {
        AOS.init();
        if (isMobile !== undefined && isDesktop !== undefined) {
            setLoading(false);
        }
    }, []);

    const openPopup = (URL: string) => {
        if (isDesktop) {
            const popupWidth = 600;
            const popupHeight = 800;
            const popupLeft = window.innerWidth / 2 - popupWidth / 2;
            const popupTop = window.innerHeight / 2 - popupHeight / 2;

            window.open(
                URL,
                'InstagramPopup',
                `width=${popupWidth}, height=${popupHeight}, left=${popupLeft}, top=${popupTop}`
            );
        } else if (isMobile) {
            window.location.href = URL; // 모바일일 경우 직접 링크로 이동
        }
    };
    return (
        <>
            {!loading && (
                <S.Container2 className="mount" isMobile={isMobile}>
                    {ALUMNI_NEWS_INFORMATION &&
                        ALUMNI_NEWS_INFORMATION.map((item: ALUMNI_NEWS_INFORMATION_TYPE, index) => (
                            <S.CardDiv
                                key={index}
                                role="link"
                                tabIndex={0}
                                aria-label={`${item.gen}기 ${item.name} 인터뷰 인스타그램에서 보기`}
                                onClick={() => openPopup(item.url)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        openPopup(item.url);
                                    }
                                }}
                            >
                                <S.ThumbnailImgDiv>
                                    {item.thumbnailImgSrc ? (
                                        <Image
                                            src={item.thumbnailImgSrc}
                                            alt=""
                                            fill
                                            sizes="(max-width: 700px) 100vw, 380px"
                                            style={{ objectFit: 'cover' }}
                                        />
                                    ) : null}
                                    {/* 이 카드가 인스타그램으로 나간다는 표시 */}
                                    <S.InstaHint aria-hidden="true">
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.9"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <rect x="3" y="3" width="18" height="18" rx="5" />
                                            <circle cx="12" cy="12" r="3.8" />
                                            <path d="M17.3 6.8v.01" />
                                        </svg>
                                        인터뷰 보기
                                    </S.InstaHint>
                                </S.ThumbnailImgDiv>

                                <S.CardMeta>
                                    {`${item.gen}기`}
                                    <span aria-hidden="true">·</span>
                                    <b>{item.name}</b>
                                </S.CardMeta>
                                <S.CommentDiv>{item.comment}</S.CommentDiv>
                            </S.CardDiv>
                        ))}
                </S.Container2>
            )}
        </>
    );
};

export default Cardnews;
