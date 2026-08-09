import React, { useEffect, useRef } from "react";

import { useScrollLock } from "lib/useScrollLock";
import * as S from "styles/ui/dialog";

/**
 * 확인 상자.
 *
 * window.confirm 을 쓰지 않는다. 그것은 브라우저가 그리는 것이라 주소가 그대로
 * 드러나고("www.next-ku.com 내용:"), 글꼴도 색도 사이트와 아무 상관이 없다.
 * 지우기처럼 되돌릴 수 없는 일을 묻는 자리인데 생김새가 남의 것이면 신뢰가
 * 깎인다.
 *
 * 되돌릴 수 없는 일에는 tone="danger" 를 준다. 색으로 한 번 더 말해두면 손이
 * 먼저 움직이는 것을 늦출 수 있다.
 */

type Props = {
  open: boolean;
  title: string;
  detail?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "normal";
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function Confirm({
  open,
  title,
  detail,
  confirmLabel = "확인",
  cancelLabel = "취소",
  tone = "normal",
  busy = false,
  onConfirm,
  onCancel,
}: Props) {
  const confirmRef = useRef<HTMLButtonElement>(null);
  useScrollLock(open);

  useEffect(() => {
    if (!open) return;
    // 열리면 확인에 포커스를 둔다. 엔터로 끝낼 수 있어야 한다.
    confirmRef.current?.focus();

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
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="confirm-title">{title}</h2>
        {detail && <p>{detail}</p>}
        <S.Actions>
          <S.Cancel type="button" onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </S.Cancel>
          <S.Go
            ref={confirmRef}
            type="button"
            $danger={tone === "danger"}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? "처리 중" : confirmLabel}
          </S.Go>
        </S.Actions>
      </S.Card>
    </S.Backdrop>
  );
}
