import { initBreakdown } from "./breakdown";
import { initDataQualityChart } from "./data-quality";
import { initSankeyChart } from "./sankey-chart";
import { initStreamChart } from "./stream-chart";
import type { TSankeyConfig, TStreamConfig } from "../../typings/ED";

/**
 * @param config 
 */
export function initSankeyCharts(config: TSankeyConfig) {
  initBreakdown(config);
  initDataQualityChart(config);
  initSankeyChart(config);
}

/**
 * @param config 
 */
export function initStreamCharts(config: TStreamConfig) {
  initStreamChart(config);
}