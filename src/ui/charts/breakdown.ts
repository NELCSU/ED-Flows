import { drawColumnChart } from "../charts/column";
import type { TConfig, TBreakdown } from "../../typings/ED";

/**
 * @param config 
 */
export function initBreakdown(config: TConfig) {
	const container = document.querySelector(".breakdown");
	const action = container?.querySelector(".breakdown-action") as HTMLDivElement;
	const message = container?.querySelector(".breakdown-message") as HTMLDivElement;
	const chart = container?.querySelector(".breakdown-chart") as HTMLDivElement;
	const close = document.querySelector(".breakdown-close") as HTMLDivElement;

	let current = 0;
	
	function clear(): void {
		if (message) {
			message.innerHTML = "";
		}
		if (chart) {
			chart.innerHTML = "";
			chart.style.display = "";
		}
	}
  
	function hide (): void {
		container?.classList.add("ready");
		setTimeout(() => clear(), 500);
	}

	function switchChartHandler(): void {
		current = (++current === config.breakdown.chart.length) ? 0 : current;
		displayBreakdown(config);
	}

	function displayBreakdown(config: TConfig): void {
		if (current >= config.breakdown.chart.length) {
			current = 0;
		}

		message.innerHTML = config.breakdown.message;
		if (config.breakdown.chart.length > 1) {
			message.innerHTML += `<div>Displaying chart ${current + 1} of ${config.breakdown.chart.length}</div>`;
			message.innerHTML += `<div class="switch-chart">Switch to the next</div>`;
			const action = document.querySelector(".switch-chart") as HTMLDivElement;
			action.addEventListener("click", switchChartHandler);
		}

		chart.innerHTML = "";
		if (config.breakdown.chart.length === 0) {
			chart.style.display = "none";
		} else {
			chart.style.display = "";
		}

		action.style.display = (config.breakdown.chart.length === 0) ? "none" : "";

		if (chart && config.breakdown.chart.length > 0) {
			if (config.breakdown.chart[0].length === 1) {
				const d: TBreakdown = config.breakdown.chart[current][0];
				chart.innerHTML = `<div><h2>${d.label}</h2><h2>${d.value} call(s) 100%</h2></div>`;
			} else {
				chart.innerHTML = " ";
				drawColumnChart(chart, config.breakdown.chart[current]);
			}
		}

		container?.classList.remove("ready");
		window.dispatchEvent(new CustomEvent("hide-menu"));
	}

	function displayStatus(config: TConfig): void {
		clear();
		
		if (message) {
			message.innerHTML = config.status.message;
		}

		action.style.display = "none";
		chart.style.display = "none";

		container?.classList.remove("ready");
		window.dispatchEvent(new CustomEvent("hide-menu"));
	}

	close.addEventListener("click", (e) => { e.stopImmediatePropagation(); hide(); });
	container?.addEventListener("click", e => e.stopImmediatePropagation());
	window.addEventListener("hide-breakdown", () => hide());
	window.addEventListener("show-status", () => displayStatus(config));
  window.addEventListener("show-breakdown", () => displayBreakdown(config));
}