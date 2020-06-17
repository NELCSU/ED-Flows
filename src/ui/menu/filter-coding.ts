import { left, right } from "@buckneri/string";
import { getStreamQueryHash } from "../urlhash";
import type { TStreamConfig, TFilterOptionGroup } from "../../typings/ED";

/**
 * Creates coding options. All options are available initially.
 * @param config 
 */
export function initCodingList(config: TStreamConfig) {
	getStreamQueryHash(config);
	const parent = document.querySelector(".coding-options") as HTMLDivElement;
	let selected: HTMLInputElement | null = null;
	if (parent) {
		parent.innerHTML = "";
		let group = "", grpdiv, label;
		let control: HTMLDivElement;
		config.filters.coding.forEach((call: TFilterOptionGroup, index: number) => {
			if (group !== call.group) {
				group = call.group;
				grpdiv = document.createElement("div");
				grpdiv.classList.add("panel-row");
				parent.appendChild(grpdiv);

				label = document.createElement("label");
				label.textContent = group + ":";
				grpdiv.appendChild(label);

				control = document.createElement("div");
				grpdiv.appendChild(control);
			}
			let option = document.createElement("input") as HTMLInputElement;
			option.type = "radio";
			option.id = call.id;
			option.value = call.value;
			option.name = call.name;
			option.title = call.title;
			if (config.querystring.coding === option.value || index === 0) {
				option.checked = true;
				selected = option;
			}
			option.addEventListener("click", () => {
				window.dispatchEvent(new CustomEvent("coding-selected", { detail: option.title }));
				window.dispatchEvent(new CustomEvent("filter-action"));
			});
			control.appendChild(option);
		});
		if (selected) {
			window.dispatchEvent(new CustomEvent("coding-selected", { detail: (selected as HTMLInputElement).title }));
		}
	}
}
