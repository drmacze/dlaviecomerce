import { useLayoutEffect, type RefObject } from "react";

export function useAutoTextarea(
  ref: RefObject<HTMLTextAreaElement | null>,
  value: string,
  maxHeight = 180,
) {
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    node.style.height = "0px";
    node.style.height = `${Math.min(node.scrollHeight, maxHeight)}px`;
    node.style.overflowY = node.scrollHeight > maxHeight ? "auto" : "hidden";
  }, [ref, value, maxHeight]);
}
