import type { TSankeyConfig } from "../../typings/ED";

/**
* @param config 
*/
export function initSankeyNodeMovement(config: TSankeyConfig) {
 const x = document.getElementById("MoveX") as HTMLInputElement;
 const y = document.getElementById("MoveY") as HTMLInputElement;
 config.filters.move.x = true;
 config.filters.move.y = true;
 x.addEventListener("input", () => {
	 config.filters.move.x = x.checked;
	 window.dispatchEvent(new CustomEvent("soft-filter-action"));
 });
 y.addEventListener("input", () => {
	 config.filters.move.y = y.checked;
	 window.dispatchEvent(new CustomEvent("soft-filter-action"));
 });
}