import type { TStreamConfig } from "../../typings/ED";
import { Streamchart, TStream } from "@buckneri/streamchart";
import { scaleSequential } from "d3-scale";
import { select } from "d3-selection";
import { interpolateViridis } from "d3-scale-chromatic";

const color = scaleSequential(interpolateViridis).domain([0, 1]);
const chart = document.getElementById("chart") as HTMLDivElement;
const fp: Intl.NumberFormat = new Intl.NumberFormat("en-GB", { style: "decimal"});

/**
 * @param config 
 */
export function initStreamChart(config: TStreamConfig) {
  window.addEventListener("stream-chart", () => loadStreamChart(config));

  window.addEventListener("clear-chart", () => { config.stream.clearSelection(); });

  window.addEventListener("stream-selected", (el: any) => {
    const g = select(el.detail);
    const d = g.datum() as any;
    console.log(d);
  });
}

export function loadStreamChart(config: TStreamConfig) {
  chart.innerHTML = "";

  config.stream = new Streamchart({
    container: chart,
    data: config.db.stream,
    margin: { bottom: 20, left: 20, right: 20, top: 20 },
  });

  config.stream.draw();
}
