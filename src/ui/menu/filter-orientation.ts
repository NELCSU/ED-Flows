import type { TConfig } from "../../typings/ED";

/**
 * @param config 
 */
export function initSankeyNodeOrientation(config: TConfig) {
	const ltr = document.getElementById("OrientLTR") as HTMLInputElement;
	const ttb = document.getElementById("OrientTTB") as HTMLInputElement;
	config.filters.orientation.ltr = ltr.checked;
	config.filters.orientation.ttb = ttb.checked;
	
	ltr.addEventListener("click", handleClick);
	ttb.addEventListener("click", handleClick);

	function handleClick() {
		config.filters.orientation.ltr = ltr.checked;
		config.filters.orientation.ttb = ttb.checked;
		window.dispatchEvent(new CustomEvent("filter-action"));
	}
}