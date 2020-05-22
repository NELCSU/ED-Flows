import type { TBreakdown, TConfig } from "../../typings/ED";
import { Sankey, TLink } from "../../../node_modules/@buckneri/sankey";
import { rollup, sum } from "d3-array";
import { scaleSequential } from "d3-scale";
import { select } from "d3-selection";
import { interpolateViridis } from "d3-scale-chromatic";
import { formatNumber } from "../../utils/format";

const color = scaleSequential(interpolateViridis).domain([0, 1]);
const chart = document.getElementById("chart") as HTMLDivElement;
const desc = (a: TBreakdown, b: TBreakdown) => a.value > b.value ? -1 : a.value < b.value ? 1 : 0;

/**
 * @param config 
 */
export function initSankeyChart(config: TConfig) {
  window.addEventListener("sankey-chart", () => loadSankeyChart(config));

  window.addEventListener("clear-chart", () => { config.sankey.clearSelection(); });

  window.addEventListener("node-selected", (el: any) => {
    const g = select(el.detail);
    const d = g.datum() as any;
    const sg = select(chart).select("svg");

    let sumSource: TBreakdown[] = [], sumTarget: TBreakdown[] = [];
    let text;
  
    if (d.grouping) {
      text = `<div>Breakdown for ${d.name}</div>`;
  
      config.breakdown.message = text;
      d.grouping.map((e: TBreakdown) => {
        sumSource.push({
          color: e.color,
          label: e.label,
          value: e.value
        });
      });
    } else {
      const ns: any[] = [], nt: any[] = [];
      sg.selectAll(".link")
        .each(function (link: TLink) {
          if (link.nodeOut === d) {
            ns.push({
              color: "steelblue",
              label: link.nodeIn.name, 
              value: link.value
            });
          } else if (link.nodeIn === d) {
            nt.push({
              color: "steelblue",
              label: link.nodeOut.name,
              value: link.value
            });
          }
        } as any);
  
      let srcMax = 0;
      rollup(
        ns.sort((a, b) => a.value - b.value),
        v => sum(v, d => d.value),
        d => d.label
      ).forEach((v, k) => {
        sumSource.push({ color: "", label: k, value: v }); 
        srcMax = Math.max(srcMax, v);
      });
  
      let tgtMax = 0;
      rollup(
        nt.sort((a, b) => a.value - b.value),
        v => sum(v, d => d.value),
        d => d.label
      ).forEach((v, k) => {
        sumTarget.push({ color: "", label: k, value: v }); 
        tgtMax = Math.max(tgtMax, v);
      });
  
      const src = sumSource.map((ns: any) => {
          ns.color = color(ns.value / srcMax);
          return ns.value; 
        })
        .reduce((ac: number, v: number) => ac + v, 0);
  
      const tgt = sumTarget.map((ns: any) => {
          ns.color = color(ns.value / tgtMax);
          return ns.value;
        })
        .reduce((ac: any, v: number) => ac + v, 0);
  
      text = `<div>${d.name}</div><div>Incoming: ${formatNumber(src)} calls</div>`;
      text += `<div>Outgoing: ${formatNumber(tgt)} calls</div>`;
      text += `Out/In: ${(src === 0 || tgt === 0) ? "---" : formatNumber(tgt / src)}`;
    }
  
    config.breakdown.message = text;
    config.breakdown.chart = [];
    config.breakdown.display = [];
  
    if (sumSource.length > 0) {
      config.breakdown.chart.push(sumSource.sort(desc));
      config.breakdown.display.push(["column", "Incoming flows"]);
    }
    if (sumTarget.length > 0) {
      config.breakdown.chart.push(sumTarget.sort(desc));
      config.breakdown.display.push(["column", "Outgoing flows"]);
    }

    window.dispatchEvent(new CustomEvent("show-breakdown"));
  });

  window.addEventListener("link-selected", (el: any) => {
    const g = select(el.detail);
    const d = g.datum() as any;
    const sg = select(chart).select("svg");

    let text = `<div>${d.nodeIn.name} → ${d.nodeOut.name} calls</div>`;
    text += `<div>Outgoing: ${formatNumber(d.value)} calls</div>`;
  
    config.breakdown.message = text;
    config.breakdown.chart = [];
    config.breakdown.display = [];
  
    if (d.supply && d.supply.length > 0) {
      config.breakdown.chart.push(d.supply);
      config.breakdown.display.push(["column", "Hourly breakdown"]);
    }
    if (d.supplyDx && d.supplyDx.length > 0) {
      d.supplyDx.sort(desc);
      config.breakdown.chart.push(d.supplyDx);
      config.breakdown.display.push(["table", "Dx codes"]);
    }
    if (d.supplySG && d.supplySG.length > 0) {
      d.supplySG.forEach((d:any) => {
        if (d.label === undefined) {
          d.label = `Group code: ${d.Symptom_Group_Code}<br>`;
          d.label += `${d.Symptom_Group_Description}<br>`;
          d.label += `Discriminator: ${d.Symptom_Discriminator_Code}<br>`;
          d.label += `${d.Symptom_Descriminator_Description}`;
        }
      });
      d.supplySG.sort(desc);
      config.breakdown.chart.push(d.supplySG);
      config.breakdown.display.push(["table", "Symptom groups"]);
    }
    if (d.supplyRead && d.supplyRead.length > 0) {
      config.breakdown.chart.push(d.supplyRead);
      config.breakdown.display.push(["table", "Read codes"]);
    }

    window.dispatchEvent(new CustomEvent("show-breakdown"));
  });
}

export function loadSankeyChart(config: TConfig) {
  chart.innerHTML = "";

  config.db.sankey.nodes.forEach((node: any) => {
    if (node.grouping && !node.grouping[0].color) {
      const max = Math.max(...node.grouping.map((l: any) => l.value), 0);
      node.grouping.forEach((l: any) => l.color = color(l.value / max));
    }
  });

  config.db.sankey.links.forEach((link: any) => {
    if (link.supply && !link.supply[0].color) {
      const max = Math.max(...link.supply.map((l: any) => l.value), 0);
      link.supply.forEach((l: any) => l.color = color(l.value / max));
    }
    if (link.supplyDx && !link.supplyDx[0].color) {
      const max = Math.max(...link.supplyDx.map((l: any) => l.value), 0);
      link.supplyDx.forEach((l: any) => l.color = color(l.value / max));
    }
    if (link.supplyService && !link.supplyService[0].color) {
      const max = Math.max(...link.supplyService.map((l: any) => l.value), 0);
      link.supplyService.forEach((l: any) => l.color = color(l.value / max));
    }
    if (link.supplyBook && !link.supplyBook[0].color) {
      const max = Math.max(...link.supplyBook.map((l: any) => l.value), 0);
      link.supplyBook.forEach((l: any) => l.color = color(l.value / max));
    }
  });

  config.sankey = new Sankey({
    container: chart,
    links: config.db.sankey.links,
    margin: { bottom: 0, left: 20, right: 20, top: 10 },
    nodeMoveX: config.filters.move.x,
    nodeMoveY: config.filters.move.y,
    nodes: config.db.sankey.nodes,
    nodeSize: 30,
    orient: config.filters.orientation.ltr ? "horizontal" : "vertical",
    padding: config.filters.density
  });

  config.sankey.draw();

  setTimeout(() => window.dispatchEvent(new CustomEvent("show-legend")), 1500);
}
