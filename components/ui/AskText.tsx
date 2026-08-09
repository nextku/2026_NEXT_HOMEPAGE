import React, { useEffect, useRef, useState } from "react";

import { useScrollLock } from "lib/useScrollLock";
import * as S from "styles/ui/dialog";

/**
 * 한 줄을 받는 상자.
 *
 * window.prompt 를 대신한다. 그것은 사파리에서 아예 안 뜨는 설정이 있고,
 * 뜨더라도 브라우저 주소가 함께 나와 사이트가 묻는 것으로 읽히지 않는다.
 *
 * 비우고 확인하면 빈 문자열을 준다. 링크 지우기가 그 길을 쓴다 - 지우려고
 * 따로 버튼을 만드는 것보다 "비우면 없어진다" 가 손에 익다.
 */

type Props = {
  open: boolean;
  title: string;
  label: string;
  placeholder?: string;
  initial?: string;
  hint?: string;
  confirmLabel?: string;
  onSubmit: (value: string) => void;
  onCancel: () => void;
};

export default function AskText({
  open,
  title,
  label,
  placeholder,
  initial = "",
  hint,
  confirmLabel = "확인",
  onSubmit,
  onCancel,
}: Props) {
  const [value, setValue] = useState(initial);
  const inputRef = useRef<HTMLInputElement>(null);
  useScrollLock(open);

  // 열 때마다 현재 값에서 시작한다. 남아 있던 값이 보이면 헷갈린다.
  useEffect(() => {
    if (open) setValue(initial);
  }, [open, initial]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    inputRef.current?.select();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <S.Backdrop role="presentation" onClick={onCancel}>
      <S.Card
        role="dialog"
        aria-modal="true"
        aria-labelledby="ask-title"
        onClick={(e) => e.stopPropagation()}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(value.trim());
          }}
        >
          <h2 id="ask-title">{title}</h2>
          {hint && <p>{hint}</p>}
          <S.Field>
            <span>{label}</span>
            <S.Input
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
            />
          </S.Field>
          <S.Actions>
            <S.Cancel type="button" onClick={onCancel}>
              취소
            </S.Cancel>
            <S.Go type="submit">{confirmLabel}</S.Go>
          </S.Actions>
        </form>
      </S.Card>
    </S.Backdrop>
  );
}
