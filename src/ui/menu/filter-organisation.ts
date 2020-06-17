import { getSankeyQueryHash, getStreamQueryHash } from "../urlhash";
import { fetchDataStore, processDayFile, processStreamFile, openDataFile } from "../data";
import { TSankeyConfig, TStreamConfig } from "../../typings/ED";

/**
 * Updates the STP user control
 * @param config 
 */
export function initSankeyOrganisationList(config: TSankeyConfig) {
	const org = document.getElementById("Organisation") as HTMLSelectElement;
	org.innerHTML = "";
	for (let key in config.filters.organisations) {
		const option = document.createElement("option");
		option.textContent = config.filters.organisations[key];
		if (option.textContent === "SEL") {
			org.insertAdjacentElement("afterbegin", option);
		} else {
			org.appendChild(option);
		}
	}
	getSankeyQueryHash(config);

	if (config.querystring.organisation) {
		org.value = config.querystring.organisation;
	}

	org.addEventListener("change", async () => {
		window.dispatchEvent(new CustomEvent("org-selected", { detail: org.value }));
		config.db.file = org.options[org.selectedIndex].value + ".zip";
		await fetchDataStore(config)
			.then(() => {
				config.db.file = config.db.file.replace(/\.zip$/, "m.json");
				return openDataFile(config);
			})
			.then(file => processDayFile(file, config));
	});

	if (org) {
		org.dispatchEvent(new Event("change"));
	}
}

/**
 * Updates the STP user control
 * @param config 
 */
export function initStreamOrganisationList(config: TStreamConfig) {
	const org = document.getElementById("Organisation") as HTMLSelectElement;
	org.innerHTML = "";
	for (let key in config.filters.organisations) {
		const option = document.createElement("option");
		option.textContent = config.filters.organisations[key];
		if (option.textContent === "SEL") {
			org.insertAdjacentElement("afterbegin", option);
		} else {
			org.appendChild(option);
		}
	}
	getStreamQueryHash(config);

	if (config.querystring.organisation) {
		org.value = config.querystring.organisation;
	}

	org.addEventListener("change", async () => {
		window.dispatchEvent(new CustomEvent("org-selected", { detail: org.value }));
		config.db.file = org.options[org.selectedIndex].value + ".zip";
		await fetchDataStore(config)
			.then(() => {
				let c = config.filters.coding[0].value;
				if (config.querystring.coding) {
					c = config.querystring.coding;
				}
				let u = config.filters.uplift[0].value;
				if (config.querystring.uplift) {
					u = config.querystring.uplift;
				}
				config.db.file = config.db.file.replace(/\.zip$/, `-${c}-${u}.json`);
				return openDataFile(config);
			})
			.then(file => processStreamFile(file, config));
	});

	if (org) {
		org.dispatchEvent(new Event("change"));
	}
}