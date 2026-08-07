import { useCallback, useEffect, useState } from "react";

/**
 * 다시 시도까지 남은 시간.
 *
 * 메일 발송과 코드 확인처럼 반복하면 곤란한 동작에 쓴다. 버튼을 계속 누를 수
 * 있게 두면 남의 주소로 메일 폭탄을 보내거나 코드를 무차별로 대입할 수 있다.
 *
 * 다만 이것은 **방어선이 아니다.** 브라우저에서 도는 값은 개발자도구를 열면
 * 지울 수 있다. 실제 차단은 Supabase 의 Rate limits 와 SMTP 의 최소 발송
 * 간격이 한다. 여기서 하는 일은 두 가지다 — 실수로 연타하는 것을 막고,
 * 서버가 거절했을 때 "왜 안 되는지" 를 미리 알려준다.
 *
 * 남은 시간은 localStorage 에 만료 시각으로 둔다. 남은 초를 저장하면
 * 새로고침 한 번으로 초기화되고, 탭을 여러 개 열면 서로 어긋난다.
 */

const PREFIX = "nextku_cool_";

function readLeft(key: string) {
  try {
    const until = Number(localStorage.getItem(PREFIX + key) ?? 0);
    if (!until) return 0;
    return Math.max(0, Math.ceil((until - Date.now()) / 1000));
  } catch {
    return 0;
  }
}

export function useCooldown(key: string, seconds: number) {
  const [left, setLeft] = useState(0);

  // 첫 렌더에서 읽으면 서버와 결과가 달라 hydration 이 어긋난다. 마운트 뒤에 읽는다.
  useEffect(() => {
    setLeft(readLeft(key));
  }, [key]);

  useEffect(() => {
    if (left <= 0) return;
    const t = setInterval(() => setLeft(readLeft(key)), 1000);
    return () => clearInterval(t);
  }, [left, key]);

  const start = useCallback(() => {
    try {
      localStorage.setItem(PREFIX + key, String(Date.now() + seconds * 1000));
    } catch {
      // 저장소를 못 쓰는 환경(시크릿 모드 등)에서는 그냥 넘어간다.
    }
    setLeft(seconds);
  }, [key, seconds]);

  return { left, start, ready: left <= 0 };
}

/**
 * 틀린 횟수를 세다가 일정 횟수를 넘기면 잠근다.
 *
 * 여섯 자리 코드는 백만 가지다. 한 번에 하나씩 넣는 사람에게는 충분하지만,
 * 자동으로 돌리면 얘기가 다르다. 몇 번 틀리면 쉬게 한다.
 */
export function useAttemptLimit(key: string, max: number, lockSeconds: number) {
  const cool = useCooldown(key, lockSeconds);
  const [tries, setTries] = useState(0);

  const fail = useCallback(() => {
    const next = tries + 1;
    setTries(next);
    if (next >= max) {
      cool.start();
      setTries(0);
    }
    return next;
  }, [tries, max, cool]);

  const reset = useCallback(() => setTries(0), []);

  return { locked: !cool.ready, left: cool.left, fail, reset, tries };
}

/** "45초 후" 처럼 읽히게. 분 단위로 늘어나면 분으로 말한다. */
export function formatLeft(sec: number) {
  if (sec >= 60) {
    const m = Math.ceil(sec / 60);
    return `${m}분`;
  }
  return `${sec}초`;
}
