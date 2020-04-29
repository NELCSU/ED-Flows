import { formatNumber } from "../../utils/format";
import type { TBreakdown, TConfig, TMargin, TNode, TLink } from "../../typings/ED";
import { rgb } from "d3-color";
import { event, select, selectAll } from "d3-selection";
import { rollup, sum } from "d3-array";
import { drag } from "d3-drag";
import { svg } from "../../utils/d3-utils";
import { sankey } from "./sankey-model";
import { scaleSequential } from "d3-scale";
import { interpolateViridis } from "d3-scale-chromatic";

const color = scaleSequential(interpolateViridis).domain([0, 1]);

/**
 * @param config 
 */
export function initSankeyChart(config: TConfig) {
  const chart = document.getElementById("chart") as HTMLDivElement;
  const w: number = chart.clientWidth;
  const h: number = chart.clientHeight;
  const m: TMargin = { bottom: 20, left: 20, right: 20, top: 30 };

  let selected: any;

  function clear() {
    if (selected) {
      selected.classed("selected", false);      
      selected = undefined;
    }
  }

  config.sankey = sankey()
    .nodePadding(config.filters.density)
    // @ts-ignore
    .margin(m)
    .nodeOrientation(config.filters.orientation.ltr ? "horizontal" : "vertical")
    .nodeWidth(30)
    .extent([[1, 1], [w - m.left - m.right, h - m.top - m.bottom]]);

  select(chart).call(
    svg()
      .height(chart.clientHeight)
      .width(chart.clientWidth)
      .margin(m)
  );
  window.addEventListener("sankey-chart-rebuild", () => {
    config.sankey = sankey()
      .nodePadding(config.filters.density)
      // @ts-ignore
      .margin(m)
      .nodeOrientation(config.filters.orientation.ltr ? "horizontal" : "vertical")
      .nodeWidth(30)
      .extent([[1, 1], [w - m.left - m.right, h - m.top - m.bottom]]);

    window.dispatchEvent(new CustomEvent("filter-action"));
  });
  window.addEventListener("sankey-chart", () => loadSankeyChart(config));
  window.addEventListener("clear-chart", () => { clear(); });
  window.addEventListener("select-chart", (e: any) => {
    clear();
    selected = e.detail;
    if (selected.classed("node")) {
      const dt = selected.datum();
      selectAll("g.link")
        .each((d: any, i: number, n: any) => {
          if (d.source === dt || d.target === dt) {
            select(n[i]).select("path").classed("selected", true);
          }
        });
      selected = selectAll(".selected");
    } else {
      selected.classed("selected", true);
    }
  });
}

export function loadSankeyChart(config: TConfig) {
  const sg = select("#chart > svg");
  const chart = document.getElementById("chart") as HTMLDivElement;
  const w: number = chart.clientWidth;
  const h: number = chart.clientHeight;
  
  const canvas = sg.select("g.canvas");
  canvas.selectAll("g").remove();

  let graph = config.sankey(config.db.sankey);

  graph.nodes.forEach((node: TNode) => {
    if (node.grouping && !node.grouping[0].color) {
      const max = Math.max(...node.grouping.map(l => l.value), 0);
      node.grouping.forEach(l => l.color = color(l.value / max));
    }
  });

  graph.links.forEach((link: TLink) => {
    if (link.supply && !link.supply[0].color) {
      const max = Math.max(...link.supply.map(l => l.value), 0);
      link.supply.forEach(l => l.color = color(l.value / max));
    }
    if (link.supplyDx && !link.supplyDx[0].color) {
      const max = Math.max(...link.supplyDx.map(l => l.value), 0);
      link.supplyDx.forEach(l => l.color = color(l.value / max));
    }
    if (link.supplyService && !link.supplyService[0].color) {
      const max = Math.max(...link.supplyService.map(l => l.value), 0);
      link.supplyService.forEach(l => l.color = color(l.value / max));
    }
    if (link.supplyBook && !link.supplyBook[0].color) {
      const max = Math.max(...link.supplyBook.map(l => l.value), 0);
      link.supplyBook.forEach(l => l.color = color(l.value / max));
    }
  });

  const linkCollection = canvas.append("g")
    .selectAll("g")
    .data(graph.links)
    .enter()
    .append("g")
      .attr("class", "link");

  linkCollection
    .append("path")
      .classed("link", true)
      .attr("d", config.sankey.linkShape())
      .attr("stroke", (d: any) => d.fill ? d.fill : d.source.fill)
      .attr("stroke-opacity", config.filters.opacity.low)
      .attr("stroke-width", (d: any) => Math.max(1, d.width))
      .attr("fill", "none")
      .on("click", linkclick as any)
      .append("title")
        .text((d: any) => `${d.source.name} -> ${d.target.name}`);

  const dragger: any =  drag()
    .clickDistance(1)
    .on("start", dragstart)
    .on("drag", dragmove as any)
    .on("end", dragend);

  const nodeCollection = canvas.append("g")
    .selectAll(".node")
    .data(graph.nodes)
    .enter()
    .append("g")
      .attr("class", "node")
      .attr('transform', (d: any) => `translate(${d.x0},${d.y0})`)
      .call(dragger as any);

  nodeCollection.on("click", nodeclick as any);

  nodeCollection.append("rect")
    .classed("node", true)
    .attr("x", 0)
    .attr("y", 0)
    .attr("height", (d: any) => d.y1 - d.y0)
    .attr("width", (d: any) => d.x1 - d.x0)
    .style("fill", (d: any) => d.fill)
    .style("stroke", (d: any) => rgb(d.fill).darker(2) as any)
    .append("title")
      .text((d: any) => `${d.name} (${formatNumber(d.value)})`);

  const outerLabel = nodeCollection.append("text")
    .attr("class", "node-label-outer")
    .attr("dy", "0.35em");

  if (config.filters.orientation.ltr) {
    outerLabel
      .attr("x", (d: any) => d.x0 < (w / 2) ? (d.x1 - d.x0) + 6 : -6)
      .attr("y", (d: any) => (d.y1 - d.y0) / 2)
      .attr("text-anchor", (d: any) => d.x0 > w / 2 ? "end" : "start")
      .style("opacity", (d: any) => (d.y1 - d.y0) > 30 ? null : 0)
      .text((d: any) => d.name);
  } else {
    outerLabel
      .attr("x", (d: any) => (d.x1 - d.x0) / 2)
      .attr("y", (d: any) => (d.y1 - d.y0) + 10)
      .attr("text-anchor", "middle")
      .text((d: any) => (d.x1 - d.x0) > 70 ? d.name : "");
  }

  const innerLabel = nodeCollection.append("text")
    .attr("class", "node-label")
    .attr("dy", "0.35em");

  if (config.filters.orientation.ltr) {
    innerLabel
      .attr("x", (d: any) => -(d.y1 - d.y0) / 2)
      .attr("y", (d: any) => (d.x1 - d.x0) / 2)
      .attr("transform", "rotate(270)")
      .text((d: any) => (d.y1 - d.y0) > 50 ? formatNumber(d.value) : "");
  } else {
    innerLabel
      .attr("x", (d: any) => (d.x1 - d.x0) / 2)
      .attr("y", (d: any) => (d.y1 - d.y0) / 2)
      .text((d: any) => (d.x1 - d.x0) > 50 ? formatNumber(d.value) : "");
  }

  window.dispatchEvent(new CustomEvent("show-legend"));

  const asc = (a: TBreakdown, b: TBreakdown) => a.value > b.value ? -1 : a.value < b.value ? 1 : 0;
  const desc = (a: TBreakdown, b: TBreakdown) => a.value > b.value ? -1 : a.value < b.value ? 1 : 0;

  function linkclick (this: Element, d: TLink) {
    event.stopPropagation();
    window.dispatchEvent(new CustomEvent("clear-chart"));
    window.dispatchEvent(new CustomEvent("select-chart", { detail: select(this) }));

    let text = `<div>${d.source.name} → ${d.target.name} calls</div>`;
    text += `<div>Outgoing: ${formatNumber(d.value)} calls</div>`;

    config.breakdown.message = text;
    config.breakdown.chart = [];
    if (d.supply && d.supply.length > 0) {
      config.breakdown.chart.push(d.supply);
    }
    if (d.supplyDx && d.supplyDx.length > 0) {
      d.supplyDx.sort(desc);
      config.breakdown.chart.push(d.supplyDx);
    }
    if (d.supplyService && d.supplyService.length > 0) {
      d.supplyService.sort(desc);
      config.breakdown.chart.push(d.supplyService);
    }
    if (d.supplyBook && d.supplyBook.length > 0) {
      config.breakdown.chart.push(d.supplyBook);
    }

    window.dispatchEvent(new CustomEvent("show-breakdown"));
  }

  function nodeclick (this: SVGGElement, d: TNode) {
    event.stopPropagation();
    const g = select(this);
    window.dispatchEvent(new CustomEvent("clear-chart"));
    window.dispatchEvent(new CustomEvent("select-chart", { detail: g }));

    g.select(".node-label-outer").style("opacity", null);
      
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
          if (link.target === d) {
            ns.push({
              color: "steelblue",
              label: link.source.name, 
              value: link.value
            });
          } else if (link.source === d) {
            nt.push({
              color: "steelblue",
              label: link.target.name,
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
    if (sumSource.length > 0) {
      config.breakdown.chart.push(sumSource.sort(desc));
    }
    if (sumTarget.length > 0) {
      config.breakdown.chart.push(sumTarget.sort(desc));
    }

    window.dispatchEvent(new CustomEvent("show-breakdown"));
  }

  function dragstart(d: any) {
    if (!d.__x) {
      d.__x = event.x;
    }
    if (!d.__y) {
      d.__y = event.y;
    }
    if (!d.__x0) {
      d.__x0 = d.x0;
    }
    if (!d.__y0) {
      d.__y0 = d.y0;
    }
    if (!d.__x1) {
      d.__x1 = d.x1;
    }
    if (!d.__y1) {
      d.__y1 = d.y1;
    }
  }
  
  function dragmove(this: SVGGElement, d: any) {
    select(this)
      .attr("transform", function (d: any) {
        const dx = event.x - d.__x;
        const dy = event.y - d.__y;

        if (config.filters.move.x) {
          d.x0 = d.__x0 + dx;
          d.x1 = d.__x1 + dx;
          if (d.x0 < 0) {
            d.x0 = 0;
            d.x1 = config.sankey.nodeWidth();
          }
          if (d.x1 > w) {
            d.x0 = w - config.sankey.nodeWidth();
            d.x1 = w;
          }
        }

        if (config.filters.move.y) {
          d.y0 = d.__y0 + dy;
          d.y1 = d.__y1 + dy;
          if (d.y0 < 0) {
            d.y0 = 0;
            d.y1 = d.__y1 - d.__y0;
          }
          if (d.y1 > h) {
            d.y0 = h - (d.__y1 - d.__y0);
            d.y1 = h;
          }
        }

        return `translate(${d.x0}, ${d.y0})`;
      });

    config.sankey.update(graph);
    selectAll("path.link")
      .attr("d", config.sankey.linkShape())
      .attr("stroke-width", (d: any) => Math.max(1, d.width));
  }
  
  function dragend(d: any) {
    delete d.__x;
    delete d.__y;
    delete d.__x0;
    delete d.__x1;
    delete d.__y0;
    delete d.__y1;
  }
}
