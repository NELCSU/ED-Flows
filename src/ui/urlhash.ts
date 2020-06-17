import { addSpaces, stripSpaces } from "../utils/string";
import type { TSankeyConfig, TStreamConfig } from "../typings/ED";

/**
 * Returns TURLHash object with values from current URL hash value
 */
export function getSankeyQueryHash(config: TSankeyConfig) {
	const re = /\w+\$[\w\-]+/gmi;
	let m;
	while ((m = re.exec(window.location.hash)) !== null) {
		let p = m[0].split("$");
		switch(p[0]) {
			case "call": config.querystring.call = p[1]; break;
			case "day": config.querystring.day = p[1]; break;
			case "stp": config.querystring.organisation = addSpaces(p[1]); break;
		}
	}
}

/**
 * Returns TURLHash object with values from current URL hash value
 */
export function getStreamQueryHash(config: TStreamConfig) {
	const re = /\w+\$[\w\-]+/gmi;
	let m;
	while ((m = re.exec(window.location.hash)) !== null) {
		let p = m[0].split("$");
		switch(p[0]) {
			case "uplift": config.querystring.uplift = p[1]; break;
			case "coding": config.querystring.coding = p[1]; break;
			case "stp": config.querystring.organisation = addSpaces(p[1]); break;
		}
	}
}

/**
 * Sets the URL hash value based on UI element values
 * @param config
 */
export function setSankeyQueryHash(config: TSankeyConfig) {
	const call = document.querySelector("input[name='r1']:checked") as HTMLInputElement;
	const day = document.getElementById("Day") as HTMLInputElement;
	const org = document.getElementById("Organisation") as HTMLSelectElement;
	let myhash = "";
	if (call && call.value) {
		myhash = "call$" + call.value + "+";
	}
	if (day && config.filters.days) {
		myhash += "day$" + config.filters.days[parseInt(day.value)] + "+";
	}
	if (org && org.value) {
		myhash += "stp$" + stripSpaces(org.options[org.selectedIndex].value);
	}
	window.location.hash = myhash;
	getSankeyQueryHash(config);
}

/**
 * Sets the URL hash value based on UI element values
 * @param config
 */
export function setStreamQueryHash(config: TStreamConfig) {
	const uplift = document.querySelector("input[name='r1']:checked") as HTMLInputElement;
	const coding = document.querySelector("input[name='r2']:checked") as HTMLInputElement;
	const org = document.getElementById("Organisation") as HTMLSelectElement;
	let myhash = "";
	if (uplift && uplift.value) {
		myhash = "uplift$" + uplift.value + "+";
	}
	if (coding && coding.value) {
		myhash += "coding$" + coding.value + "+";
	}
	if (org && org.value) {
		myhash += "stp$" + stripSpaces(org.options[org.selectedIndex].value);
	}
	window.location.hash = myhash;
	getStreamQueryHash(config);
}