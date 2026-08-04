import React from "react";
import * as S from "styles/components/loading/style";

export default function Loading() {
  return (
    <S.LoadingContainer role="status" aria-live="polite">
      <S.LoadingWrapper>
        <img src="/assets/new_logo(wh).svg" alt="" />
      </S.LoadingWrapper>
      <S.Track aria-hidden="true" />
      {/* 화면에는 안 보이지만 스크린리더에는 상태가 읽혀야 한다 */}
      <S.Text>불러오는 중</S.Text>
    </S.LoadingContainer>
  );
}
