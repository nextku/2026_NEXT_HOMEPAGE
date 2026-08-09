import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";

import type { SlashItem } from "./SlashCommand";
import * as S from "styles/community/style";

/**
 * '/' 목록.
 *
 * 화살표로 옮기고 엔터로 고른다. 마우스를 잡게 만들면 '/' 를 친 이유가
 * 없어진다 - 손이 글쇠에 있는 채로 끝나야 한다.
 */

export type SlashMenuHandle = {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
};

type Props = {
  items: SlashItem[];
  command: (item: SlashItem) => void;
};

const SlashMenu = forwardRef<SlashMenuHandle, Props>(function SlashMenu(
  { items, command },
  ref,
) {
  const [picked, setPicked] = useState(0);

  // 걸러진 목록이 바뀌면 첫 항목으로 돌아간다. 안 그러면 없는 줄을 가리킨다.
  useEffect(() => setPicked(0), [items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (items.length === 0) return false;

      if (event.key === "ArrowUp") {
        setPicked((i) => (i + items.length - 1) % items.length);
        return true;
      }
      if (event.key === "ArrowDown") {
        setPicked((i) => (i + 1) % items.length);
        return true;
      }
      if (event.key === "Enter") {
        command(items[picked]);
        return true;
      }
      return false;
    },
  }));

  if (items.length === 0) {
    return (
      <S.SlashCard>
        <S.SlashEmpty>찾는 것이 없습니다</S.SlashEmpty>
      </S.SlashCard>
    );
  }

  return (
    <S.SlashCard>
      {items.map((item, i) => (
        <S.SlashRow
          key={item.title}
          type="button"
          $on={i === picked}
          onMouseEnter={() => setPicked(i)}
          onClick={() => command(item)}
        >
          <span>{item.title}</span>
          <small>{item.hint}</small>
        </S.SlashRow>
      ))}
    </S.SlashCard>
  );
});

export default SlashMenu;
