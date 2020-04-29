import { format } from "d3-format";

/**
 * returns short date format based on data key "daymonth" e.g. "0102" being 1st Feb
 * @param day 
 */
export function getScreenDate(day: string): string {
	const today = new Date(new Date().getFullYear(), parseInt(day.substr(2, 2)) - 1, parseInt(day.substr(0, 2)));
	return today.toLocaleDateString("en-GB", { month: "short", day: "numeric" });
}


const format2 = format(",.2f"), format1 = format(",.1f"), format0 = format(",.0f");

/**
 * Formats a number
 * @param v 
 */
export function formatNumber(v: number): string {
	return v < 1 ? format2(v) : v < 10 ? format1(v) : format0(v);
}