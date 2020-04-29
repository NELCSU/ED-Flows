/**
 * Moves the cursor to the leading edge of text field
 * @param e - Input element to focus on
 */
export function cursorFocus(e: HTMLInputElement) {
  e.focus();
  const length = e.value.length;
  e.setSelectionRange(length, length);
}