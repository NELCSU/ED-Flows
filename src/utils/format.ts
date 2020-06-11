/**
 * returns short date format based on data key "daymonth" e.g. "0102" being 1st Feb
 * @param day 
 */
export function getScreenDate(day: string): string {
	const today = new Date(new Date().getFullYear(), parseInt(day.substr(2, 2)) - 1, parseInt(day.substr(0, 2)));
	return today.toLocaleDateString("en-GB", { month: "short", day: "numeric" });
}

/**
 * returns short date format based on data key "daymonth" e.g. "0102" being 1st Feb
 * @param s 
 */
export function getMonthYear(s: string): string {
	const today = new Date(parseInt(s.substr(0, 4)), parseInt(s.substr(4, 2)) - 1, 1);
	return today.toLocaleDateString("en-GB", { year: "numeric", month: "short" });
}
