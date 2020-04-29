/***
 * Replace hyphens by spaces
 * @param s
 */
export function addSpaces(s: string): string {
  return s.replace(/-/g, " ");
}

/**
 * Select n characters from the left side of string s
 * @param s 
 * @param n 
 */
export function left(s: string, n: number): string {
	return s.slice(0, Math.abs(n));
}

/**
 * Select n characters from the right side of string s
 * @param s 
 * @param n 
 */
export function right(s: string, n: number): string {
	return s.slice(-1 * n);
}

/***
 * Replace spaces by hyphens
 * @param s
 */
export function stripSpaces(s: string): string {
  return s.replace(/\s/g, "-"); 
}