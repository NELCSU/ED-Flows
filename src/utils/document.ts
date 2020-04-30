import type { TPoint } from "../typings/ED";

/**
 * Generates a file to download in the client
 * @param text - content to add to file
 * @param filename - friendly name for file
 */
export function download(text: string, filename: string) {
  const link = document.createElement("a");
  link.setAttribute("href", `data:text/csv;charset=utf-8,${encodeURIComponent(text)}`);
  link.setAttribute("download", filename);
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Returns text without HTML markup
 * @param html - HTML string to parse
 */
export function html2text(html: string): string {
  const ele = document.createElement("textarea");
  ele.innerHTML = html;
  return ele.textContent || "";
}

/**
 * Returns true if element is fully contained in the viewport
 * @param e - Element to test
 */
export function isInViewport(e: Element): boolean {
  const rect = e.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}
