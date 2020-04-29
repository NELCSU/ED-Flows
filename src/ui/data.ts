import { updateCallList } from "../ui/menu/filter-call";
import { updateDayList } from "./menu/filter-day";
import { setQueryHash } from "../ui/urlhash";
import type { TConfig, TJSZip } from "../typings/ED";

/**
 * @param config 
 */
export async function fetchDataStore(config: TConfig): Promise<ArrayBuffer> {
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
export async function openDataFile(config: TConfig): Promise<string> {
	return config.db.zip.file(config.db.file).async("string");
}

/**
 * @param data 
 * @param config 
 */
export function processDayFile(data: string, config: TConfig) {
  config.db.dq = JSON.parse(data);
  config.filters.days = [];
  for (let key in config.db.dq.interpolated) {
    config.filters.days.push(key);
	}
	config.filters.days.sort((a: string, b: string) => parseInt("1" + a) - parseInt("1" + b));
	updateDayList(config);
	updateCallList(config);
	setQueryHash(config);
	window.dispatchEvent(new CustomEvent("filter-action"));
}