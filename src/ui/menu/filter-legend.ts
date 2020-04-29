
import type { TConfig, TNode, TPoint } from "../../typings/ED";
import { event, select } from "d3-selection";
import { drag } from "d3-drag";
import { transition } from "d3-transition";
import { Delaunay } from "d3-delaunay";
import { polygonLength, polygonCentroid } from "d3-polygon";

/**
 * @param config 
 */
export function initSankeyLegend(config: TConfig) {
	const legShowHide = document.getElementById("LegendShowHide") as HTMLInputElement;

	function hide() {
		const svg = document.querySelector("#chart > svg") as SVGSVGElement;
		const canvas = select(svg).select("g.canvas");
		const legend = canvas.select("g.chart-legend");

		legend
			.transition().duration(500)
			.style("opacity", 0)
			.transition().delay(500)
			.remove();

		legShowHide.checked = false;
	}

	function resize() {
		const svg = select("#chart > svg");
		const canvas = svg.selectAll("g.canvas");
		const legend = canvas.selectAll("g.chart-legend");
		const rect = legend.selectAll("rect");

		if (legend.classed("ready")) {
			legend.classed("ready", false);
			legend
				.selectAll(".contents")
				.transition().duration(200).delay(400)
				.style("opacity", null);
			rect
				.transition().duration(500)
				.attr("height", (d: any) => d.height + "px");
		} else {
			legend.classed("ready", true);
			legend
				.selectAll(".contents")
				.transition().duration(300)
				.style("opacity", 0);
			rect
				.transition().duration(500)
				.attr("height", (d: any) => d.minheight + "px");
		}
	}

	/**
	 * @link https://observablehq.com/@d3/voronoi-labels
	 */
	function show() {
		const svg = document.querySelector("#chart > svg") as SVGSVGElement;
		const canvas = select(svg).select("g.canvas");
		const box: DOMRect = svg.getBoundingClientRect();
		const h = box.height;
		const w = box.width;
		const rh: number = config.legend.map(leg => leg.labels.length * 26).reduce((ac, le) => ac + le, 0);
		const rw: number = 150;
		const m = config.sankey.margin();
		const nw = config.sankey.nodeWidth() / 2;

		// determine the least node dense area of chart
		let xy: number[][] = [];
		const nodes = canvas.selectAll("g.node").data();
		nodes.forEach((d: any) => {
			xy.push([d.x1 - nw, d.y1 - (d.y0 / 2)] as any);
		});
		const delaunay = Delaunay.from(xy);
		const voronoi = delaunay.voronoi([-1, -1, w - m.left - m.right + 1, h - m.top - m.bottom + 1]);
		const cells: any[] = xy.map((d, i) => [d, voronoi.cellPolygon(i)]);
		let bx: any, area = 0;
		cells.forEach((cell: any) => {
			try {
				const a = polygonLength(cell[1]);
				if (a > area) {
					area = a;
					bx = cell[1];
				}
			} catch {}
		});
		let [x, y] = polygonCentroid(bx);
		x = x > w / 2 ? w - rw - m.right : 0 + m.left;
		y = y > h / 2 ? h - rh - m.bottom : 0 + m.top;
		//

		const legend = canvas.append("g")
			.datum({ x: x, y: y })
			.style("opacity", 0)
			.classed("chart-legend", true);

		/*// DEBUG
		canvas.append("path").attr("fill", "none").attr("stroke", "#900").attr("d", voronoi.render());
		canvas.append("path").attr("d", delaunay.renderPoints(undefined, 2));*/

		const t = transition().duration(500);

		legend.transition(t as any).style("opacity", 1);

		function dragged(d: TPoint) {
			d.x += event.dx;
			d.y += event.dy;
			legend.attr("transform", (d: any) => `translate(${[d.x, d.y]})`);
		}
		// @ts-ignore
		legend.call(drag().on("drag", dragged));

		legend.selectAll("rect")
			.data([{ height: rh, minheight: 20 }])
			.enter()
			.append("rect")
				.attr("width", rw + "px")
				.attr("height", (d: any) => d.height + "px")
				.attr("x", 0)
				.attr("y", 0)
				.classed("chart-legend", true);

		legend.append("text")
			.attr("x", rw / 2)
			.attr("y", 15)
			.attr("text-anchor", "middle")
			.text("legend");

		const resizelink = legend.append("text")
			.attr("class", "legend-action")
			.attr("x", rw - 30)
			.attr("y", 15)
			.text("⤢")
			.on("click", resize);

		resizelink.append("title")
			.text("Grow/shrink legend");

		const close = legend.append("text")
			.attr("class", "legend-action")
			.attr("x", rw - 15)
			.attr("y", 15)
			.text("×")
			.on("click", closeHandler);

		close.append("title")
			.text("Close legend");

		let lasty = 10;
		config.legend.forEach((leg: any, n: number) => {
			lasty += 30;
			// subtitle
			legend.append("text")
				.attr("class", "contents")
				.attr("x", 7)
				.attr("y", lasty)
				.attr("text-anchor", "start")
				.text((d: any) => leg.title);

			leg.colors.forEach((item: string, m: number) => {
				lasty += 17;
				const g = legend.append("g")
					.attr("class", "contents")
					.style("transform", `translate(10px, ${lasty}px)`);
	
				g.append("circle")
					.style("fill", item)
					.attr("r", 7)
					.attr("cx", 14)
					.attr("cy", 0);
	
				g.append("text")
					.classed("chart-legend", true)
					.attr("x", 29)
					.attr("y", 5)
					.text(leg.labels[m]);
			});
		});

		function closeHandler() {
			hide();
		}

		legend.attr("transform", (d: TPoint) => `translate(${[x, y]})`);
	}

	legShowHide.addEventListener("input", () => legShowHide.checked ? show() : hide());
	window.addEventListener("show-legend", () => { if (!legShowHide.checked) { return; } show(); });
}