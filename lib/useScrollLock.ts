import { useEffect } from "react";

/**
 * 모달이 열려 있는 동안 뒤 페이지가 움직이지 않게 잠근다.
 *
 * 잠그지 않으면 모달 위에서 훑어도 뒤가 스크롤된다. 모달 본문에는
 * overflow-y: auto 가 있지만 그것은 본문에서 시작한 손짓만 받는다. 헤더나
 * 버튼 줄, 옆의 배경에서 시작하면 스크롤할 것이 없으므로 그 손짓은 뒤 페이지로
 * 넘어간다. 그래서 "가끔 되고 가끔 안 되는" 것처럼 보였다 - 손가락을 어디에
 * 두고 시작했는지에 달려 있었다.
 *
 * overflow: hidden 만으로는 iOS 사파리에서 막히지 않는다. 몸통을 그 자리에
 * 고정하고 스크롤 위치만큼 위로 끌어올려, 화면은 그대로인 채 스크롤이 사라진
 * 상태를 만든다. 닫을 때 원래 자리로 돌려놓는다 - 이 복원을 빠뜨리면 모달을
 * 닫았을 때 페이지가 맨 위로 튄다.
 */
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;

    const { body } = document;
    const y = window.scrollY;

    const prev = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
    };

    body.style.position = "fixed";
    body.style.top = `-${y}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";

    return () => {
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.left = prev.left;
      body.style.right = prev.right;
      body.style.width = prev.width;
      body.style.overflow = prev.overflow;
      /*
         복원 직후에 되돌린다. 몸통이 고정에서 풀리는 순간 브라우저가 스크롤을
         0 으로 보기 때문에, 여기서 되돌리지 않으면 맨 위로 튄다.
      */
      window.scrollTo(0, y);
    };
  }, [locked]);
}
