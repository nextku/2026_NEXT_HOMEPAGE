import React, { useEffect, useState } from "react";

import { createClient } from "lib/supabase/client";
import * as S from "styles/member/style";

/**
 * 지금 보고 있는 사람.
 *
 * 통계의 나머지는 지나간 것을 말한다. 홍보 글을 올린 직후처럼 "지금 사람이
 * 들어오고 있나" 를 알고 싶을 때가 있는데, 그것은 어제까지의 합계로는 알 수
 * 없다.
 *
 * 운영진은 따로 센다. 이 화면을 열어둔 사람이 접속자에 섞이면 언제 봐도 최소
 * 한 명이라 수를 믿을 수 없게 된다.
 */

type Live = {
  visitors: number;
  internal: number;
  paths: { path: string; n: number }[];
};

export default function LiveNow() {
  const [live, setLive] = useState<Live | null>(null);

  useEffect(() => {
    let alive = true;

    const read = async () => {
      // 탭이 뒤에 있으면 묻지 않는다. 안 보는 화면을 갱신할 이유가 없다.
      if (document.visibilityState !== "visible") return;
      const { data } = await createClient().rpc("presence_now");
      if (alive && data) setLive(data as Live);
    };

    void read();
    const timer = window.setInterval(read, 15_000);
    document.addEventListener("visibilitychange", read);

    return () => {
      alive = false;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", read);
    };
  }, []);

  // 처음 한 번 받기 전에는 자리만 비워둔다. 0 을 먼저 보이면 오해한다.
  if (!live) return null;

  return (
    <S.LiveBar>
      <S.LiveDot $on={live.visitors > 0} aria-hidden="true" />
      <S.LiveCount>{live.visitors}</S.LiveCount>
      <S.LiveLabel>
        명이 지금 보고 있습니다
        {live.internal > 0 && ` · 학회원 ${live.internal}명은 뺐습니다`}
      </S.LiveLabel>

      {live.paths.length > 0 && (
        <S.LivePaths>
          {live.paths.slice(0, 4).map((p) => (
            <span key={p.path}>
              {p.path} <b>{p.n}</b>
            </span>
          ))}
        </S.LivePaths>
      )}
    </S.LiveBar>
  );
}
