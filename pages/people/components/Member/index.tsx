import * as S from 'styles/components/member/style'; //styled component로 만든 style을 모두 S에 담음
import Image from 'next/image'; //Next.js 이미지 최적화 컴포넌트를 사용하여 이미지 불러옴
import React, { useState, useEffect } from 'react';
import { useMediaQuery } from 'react-responsive'; //반응형 디자인을 위해 미디어 쿼리를 React 컴포넌트에서 사용할 수 있게 해 줌
import { useRouter } from 'next/router'; //Next.js의 라우팅 기능을 사용하여 페이지 간 이동 처리
import { PEOPLE_INFORMATION } from 'constants/people';
import { PEOPLE_INFORMATION_TYPE } from 'types/people/people-information'; //멤버 정보 타입 정리 : 정보 여부에 따라 렌더링 달라짐
import AOS from 'aos'; //스크롤할 때 애니메이션 적용을 위한 라이브러리
import 'aos/dist/aos.css'; //aos 애니메이션 스타일

interface MemberProps {
    peopleInformation: PEOPLE_INFORMATION_TYPE[];
}

/*
 * 직책이 있으면 운영진이다. 직책은 기수마다 달라서
 * (10~11기는 학술부·기획부, 12기는 창업팀·개발팀, 13~14기는 팀장 체제)
 * 직책명을 목록으로 박아두면 다음 기수에서 깨진다. 값의 유무로만 판별한다.
 */
function isLeadership(position?: string) {
    return Boolean(position && position.trim());
}

/**
 * 운영진 안에서의 표시 순서.
 * 대표 → 부대표 → 임원진 → 팀장 → 나머지 팀·부서.
 * 목록에 없는 새 직책은 뒤로 보내되 서로의 원래 순서는 유지한다.
 */
const LEAD_ORDER = ['대표', '부대표', '임원진'];

function leadRank(position?: string) {
    const p = position ?? '';
    const i = LEAD_ORDER.indexOf(p);
    if (i !== -1) return i;
    if (p.endsWith('팀장')) return LEAD_ORDER.length;
    return LEAD_ORDER.length + 1;
}
export default function Member({ peopleInformation }: MemberProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    //useMediaQuery()로 반응형 뷰 처리
    const isDesktop = useMediaQuery({ minDeviceWidth: 820 });
    const isMobile = useMediaQuery({ maxWidth: 820 });

    useEffect(() => {
        AOS.init(); //페이지 로드 시 애니메이션 효과 활성화
        //미디어 쿼리가 정의되면, 로딩 상태 해제
        if (isMobile != undefined && isDesktop != undefined) {
            setLoading(false);
        }
    }, []);

    return (
        <>
            {!loading && ( //loading이 false일 때만 멤버 정보 렌더링
                <>
                    {(() => {
                        const leaders = peopleInformation
                            .filter((m) => isLeadership(m.managementTeam))
                            .sort((a, b) => leadRank(a.managementTeam) - leadRank(b.managementTeam));
                        const members = peopleInformation.filter((m) => !isLeadership(m.managementTeam));

                        /*
                         * 한 기수의 부원은 그 기수 활동을 마친 뒤 다음 기수의 운영진이 된다.
                         * 그래서 14기 탭에 있는 '대표' 배지는 14기가 아니라 15기 대표를 뜻한다.
                         * 그냥 '운영진' 이라고 쓰면 이 탭의 기수를 운영한 사람으로 읽히므로
                         * 운영하는 기수를 제목에 명시한다. 탭은 소속 기수, 제목은 운영 기수다.
                         */
                        const gen = peopleInformation[0]?.gen;
                        const leadTitle = gen ? `${gen + 1}기 운영진` : '운영진';

                        const renderCard = (item: PEOPLE_INFORMATION_TYPE, index: number) => (
                            <S.MemberWrapper key={`${item.name}-${index}`}>
                                <S.MemberImgBox>
                                    {item.imgSrc ? (
                                        <Image
                                            src={item.imgSrc}
                                            alt={item.name}
                                            fill
                                            sizes="(max-width: 700px) 45vw, 220px"
                                            style={{
                                                objectFit: 'cover',
                                                objectPosition: item.imgPosition ?? 'top center',
                                            }}
                                        />
                                    ) : (
                                        <div
                                            style={{
                                                backgroundColor: '#333333',
                                                width: '100%',
                                                height: '100%',
                                                position: 'absolute',
                                                inset: 0,
                                            }}
                                        />
                                    )}
                                </S.MemberImgBox>
                                <S.MemberTextBox>
                                    <S.MemberName>
                                        {item.name}{' '}
                                        {item.managementTeam && (
                                            <S.ManagementTeamBadge>{item.managementTeam}</S.ManagementTeamBadge>
                                        )}
                                    </S.MemberName>
                                    <S.MemberInfo>
                                        {item.department}
                                        {item.masterDegree && `(${item.masterDegree})`}
                                        {item.secondMajor && `(${item.secondMajor})`}
                                        {item.classOf ? ` ${item.classOf}학번` : ''}
                                    </S.MemberInfo>
                                </S.MemberTextBox>
                            </S.MemberWrapper>
                        );

                        return (
                            <S.Section className="mount">
                                {leaders.length > 0 && (
                                    <>
                                        <S.GroupHead>
                                            <h3>{leadTitle}</h3>
                                            <span>{leaders.length}명</span>
                                        </S.GroupHead>
                                        <S.Container>{leaders.map(renderCard)}</S.Container>
                                    </>
                                )}
                                {members.length > 0 && (
                                    <>
                                        <S.GroupHead>
                                            <h3>학회원</h3>
                                            <span>{members.length}명</span>
                                        </S.GroupHead>
                                        <S.Container>{members.map(renderCard)}</S.Container>
                                    </>
                                )}
                            </S.Section>
                        );
                    })()}
                </>
            )}
        </>
    );
}
