import { getQueryHash } from "../urlhash";
import { fetchDataStore, processDayFile, openDataFile } from "../data";
import { TConfig } from "../../typings/ED";

/**
 * Updates the STP user control
 * @param config 
 */
export function initOrganisationList(config: TConfig) {
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
	getQueryHash(config);
	
	org.value = "SEL";

	/*if (config.querystring.organisation) {
		org.value = config.querystring.organisation;
	}*/

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