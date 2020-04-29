/***
 * Replace hyphens by spaces
 * @param s
 */
export function addSpaces(s: string): string {
  return s.replace(/-/g, " ");
}

/***
 * Replace spaces by hyphens
 * @param s
 */
export function stripSpaces(s: string): string {
  return s.replace(/\s/g, "-"); 
}