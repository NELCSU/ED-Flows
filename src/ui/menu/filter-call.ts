import { left, right } from "../../utils/string";
import { getQueryHash } from "../urlhash";
import type { TConfig, TFilterCall } from "../../typings/ED";

/**
 * Creates call options. All options are available initially.
 * @param config 
 */
export function initCallList(config: TConfig) {
	getQueryHash(config);
	const parent = document.querySelector(".call-options") as HTMLDivElement;
	if (parent) {
		parent.innerHTML = "";
		let group = "", grpdiv, label;
		let control: HTMLDivElement;
		config.filters.calls.forEach((call: TFilterCall) => {
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
			if (config.querystring.call === option.value) {
				option.checked = true;
			}
			option.addEventListener("click", () => {
				window.dispatchEvent(new CustomEvent("call-selected", { detail: option.title }));
				window.dispatchEvent(new CustomEvent("filter-action"));
			});
			control.appendChild(option);
		});
	}
}

/**
 * Scans for first valid file and select corresponding call menu choice
 * @param config
 */
export function updateCallList(config: TConfig) {
	const files = Object.keys(config.db.zip.files);
	let ctrl: HTMLInputElement | null;
	config.filters.calls.forEach((call: TFilterCall) => {
		ctrl = document.getElementById(call.id) as HTMLInputElement;
		if (ctrl) {
			ctrl.disabled = true;
			ctrl.checked = false;
		}
	});
	let selected = false;
	for (let i = 0; i < files.length; i++) {
		let key = right(files[i], 7);
		key = left(key, 2);
		let found = config.filters.calls.findIndex((e: TFilterCall) => e.value === key);
		if (found > -1) {
			ctrl = document.getElementById(config.filters.calls[found].id) as HTMLInputElement;
			if (ctrl) {
				ctrl.disabled = false;
				if (!selected) {
					selected = true;
					ctrl.checked = true;
					window.dispatchEvent(new CustomEvent("call-selected", { detail: ctrl.title }));
				}
			}
		}
	}
}