import type { TConfig } from "../../typings/ED";

/**
 * @param config 
 */
export function initSankeyNodeMovement(config: TConfig) {
	const x = document.getElementById("MoveX") as HTMLInputElement;
	const y = document.getElementById("MoveY") as HTMLInputElement;
	config.filters.move.x = true;
	config.filters.move.y = true;
	x.addEventListener("input", () => config.filters.move.x = x.checked);
	y.addEventListener("input", () => config.filters.move.y = y.checked);
}