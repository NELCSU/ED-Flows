
import type { TConfig } from "../../typings/ED";
/**
 * @param config 
 */
export function initOpacitySlider(config: TConfig) {
	const opacity = document.getElementById("Opacity") as HTMLInputElement;
	opacity.addEventListener("change", (e: Event) => {
		config.filters.opacity.low = +(e.target as HTMLInputElement).value;
		window.dispatchEvent(new CustomEvent("filter-action"));
	});
}