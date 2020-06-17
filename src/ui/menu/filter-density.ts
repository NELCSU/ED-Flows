import type { TSankeyConfig } from "../../typings/ED";

/**
 * @param config 
 */
export function initDensitySlider(config: TSankeyConfig) {
	const density = document.getElementById("Density") as HTMLInputElement;
	config.filters.density = 5;
	density.addEventListener("change", (e: Event) => {
		config.filters.density = +(e.target as HTMLInputElement).value;
		window.dispatchEvent(new CustomEvent("filter-action"));
	});
}