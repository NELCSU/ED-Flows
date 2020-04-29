import type { TPoint } from "../typings/ED";

/**
 * Returns the relative cursor position
 * @param e - pass in mouse event
 */
export function relativeMouseXY(e: MouseEvent): TPoint {
  const target = e.target as Element;
  const rect = target.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
}