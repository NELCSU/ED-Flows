import { getMonthYear } from "../../utils/format";
import { setSankeyQueryHash } from "../urlhash";
import type { TSankeyConfig } from "../../typings/ED";

const day = document.getElementById("Day") as HTMLInputElement;
const label = document.getElementById("lblDay") as HTMLLabelElement;

/**
 * @param config 
 */
export function initDayList(config: TSankeyConfig) {
  day.addEventListener("change", e => {
    const raw = config.filters.days[parseInt(day.value)];
    const fdate = getMonthYear(raw);
    window.dispatchEvent(new CustomEvent("day-selected", { detail: fdate }));
    label.textContent = `Day: ${fdate}`;
    window.dispatchEvent(new CustomEvent("filter-action"));
  });
}

/**
 * @param config 
 */
export function updateDayList(config: TSankeyConfig) {
  setSankeyQueryHash(config);
  day.max = config.filters.days.length - 1 + "";
  const i = config.filters.days.findIndex((e: string) => e === config.querystring.day);
  day.value = (i > -1 ? i : 0) + "";
  const raw = config.filters.days[parseInt(day.value)];
  const fdate = getMonthYear(raw);
  label.textContent = `Day: ${fdate}`;
  window.dispatchEvent(new CustomEvent("day-selected", { detail: fdate }));
}