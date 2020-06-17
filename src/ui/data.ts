import { updateCallList } from "../ui/menu/filter-call";
import { updateDayList } from "./menu/filter-day";
import { setSankeyQueryHash, setStreamQueryHash } from "../ui/urlhash";
import type { TSankeyConfig, TStreamConfig, TJSZip } from "../typings/ED";
import { left, right } from "@buckneri/string";

/**
 * @param config 
 */
export async function fetchDataStore(config: TSankeyConfig | TStreamConfig): Promise<ArrayBuffer> {
	const p: Function = (file: string) => {
		return new Promise((resolve, reject) => {
			// @ts-ignore
			JSZipUtils.getBinaryContent(file, (err: Error, rawdata: ArrayBuffer) => {
				if (err) {
					reject(err);
				}
				resolve(rawdata);
			});
		});
	};
	
	return p(config.db.path + config.db.file)
		.then(async (raw: ArrayBuffer) => {
			// @ts-ignore
			return await JSZip.loadAsync(raw);
		})
		.then((zipfile: TJSZip) => {
			config.db.zip = zipfile;
			return zipfile;
		});
}

/**
 * @param config
 */
export async function openDataFile(config: TSankeyConfig | TStreamConfig): Promise<string> {
	return config.db.zip.file(config.db.file).async("string");
}

/**
 * @param data 
 * @param config 
 */
export function processDayFile(data: string, config: TSankeyConfig) {
  config.db.dq = JSON.parse(data);
  config.filters.days = [];
  for (let key in config.db.dq.interpolated) {
    config.filters.days.push(key);
	}
	config.filters.days.sort((a: string, b: string) => {
		const pa = right(a, 2) + left(a, 2);
		const pb = right(b, 2) + left(b, 2);
		return pa > pb ? 1 : -1;
	});
	updateDayList(config);
	updateCallList(config);
	setSankeyQueryHash(config);
	window.dispatchEvent(new CustomEvent("filter-action"));
}

/**
 * @param data 
 * @param config 
 */
export function processStreamFile(data: string, config: TStreamConfig) {
  config.db.stream = JSON.parse(data);

	setStreamQueryHash(config);
	window.dispatchEvent(new CustomEvent("filter-action"));
}