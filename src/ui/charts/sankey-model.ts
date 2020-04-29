import { max, min, sum } from "d3-array";
import { linkHorizontal, linkVertical } from "d3-shape";
import { TLink, TNode } from "../../typings/ED";

const ascendingBreadth = (a: TNode, b: TNode) => a.y0 - b.y0;
const ascendingSourceBreadth = (a: TLink, b: TLink) => ascendingBreadth(a.source, b.source) || a.index - b.index;
const ascendingTargetBreadth = (a: TLink, b: TLink) => ascendingBreadth(a.target, b.target) || a.index - b.index;
// @ts-ignore
const center = (node: TNode) => node.targetLinks.length ? node.depth : node.sourceLinks.length ? min(node.sourceLinks, targetDepth) - 1 : 0;

function computeLinkBreadths(nodes: TNode[]): void {
  for (const node of nodes) {
    let y0 = node.y0;
    let y1 = y0;
    for (const link of node.sourceLinks) {
      link.y0 = y0 + link.width / 2;
      y0 += link.width;
    }
    for (const link of node.targetLinks) {
      link.y1 = y1 + link.width / 2;
      y1 += link.width;
    }
  }
}

const constant = (x: any) => () => x;
const defaultId = (d: TNode) => d.index;
const defaultLinks = (graph: any) => graph.links;
const defaultNodes = (graph: any) => graph.nodes;
function find(nodeById: Map<any, any>, id: any): TNode {
  const node = nodeById.get(id);
  if (!node) {
    throw new Error("missing: " + id);
  }
  return node;
}
const horizontalSource = (d: TLink) => [d.source.x1, d.y0];
const horizontalTarget = (d: TLink) => [d.target.x0, d.y1];
const justify = (node: TNode, n: number) => node.sourceLinks.length ? node.depth : n - 1;
const left = (node: TNode) => node.depth;
const right = (node: TNode, n: number) => n - 1 - node.height;
// @ts-ignore
const sankeyLinkHorizontal = () => linkHorizontal().source(horizontalSource).target(horizontalTarget);
// @ts-ignore
const sankeyLinkVertical = () => linkVertical().source(verticalSource).target(verticalTarget);
const targetDepth = (d: TLink) => d.target.depth;
const value = (d: TNode) => d.value;
const sankeyHorizontal = (x: number, y: number) => [x, y];
const sankeyVertical = (x: number, y: number) => [y, x];
const verticalSource = (d: TLink) => [d.y0, d.source.y1];
const verticalTarget = (d: TLink) => [d.y1, d.target.y0];

function Sankey() {
  let x0 = 0, y0 = 0, x1 = 1, y1 = 1; // extent
  let dx = 24; // nodeWidth
  // @ts-ignore
  let dy = 8;
  let margin = { bottom: 20, left: 20, right: 30, top: 30 };
  let py: number; // nodePadding
  let id = defaultId;
  let align = justify;
  let orientation = sankeyHorizontal;
  // @ts-ignore
  let sort: Function | undefined;
  let linkSort: Function | undefined;
  let nodes = defaultNodes;
  let links = defaultLinks;
  let iterations = 6;

  function sankey() {
    // @ts-ignore
    const graph = {nodes: nodes.apply(null, arguments), links: links.apply(null, arguments)};
    orientExtents();
    computeNodeLinks(graph);
    computeNodeValues(graph);
    computeNodeDepths(graph);
    computeNodeHeights(graph);
    computeNodeBreadths(graph);
    computeLinkBreadths(graph.nodes);
    orientNodes(graph, orientation);
    return graph;
  }

  sankey.update = function(graph: any) {
    computeLinkBreadths(graph.nodes);
    return graph;
  };

  sankey.margin = function(_: any) {
    return arguments.length ? (margin = _, sankey) : margin;
  };

  sankey.nodeId = function(_: any) {
    return arguments.length ? (id = typeof _ === "function" ? _ : constant(_), sankey) : id;
  };

  sankey.nodeAlign = function(_: any) {
    return arguments.length ? (align = typeof _ === "function" ? _ : constant(_), sankey) : align;
  };

  sankey.nodeSort = function(_: any): any {
    // @ts-ignore
    return arguments.length ? (sort = _, sankey) : sort;
  };

  sankey.nodeWidth = function(_: any) {
    return arguments.length ? (dx = +_, sankey) : dx;
  };

  sankey.nodeOrientation = function(_: string) {
    return arguments.length ? (orientation = _ === "horizontal" ? sankeyHorizontal : sankeyVertical, sankey) : orientation;
  };

  sankey.nodePadding = function(_: any) {
    return arguments.length ? (dy = py = +_, sankey) : dy;
  };

  sankey.nodes = function(_: any) {
    return arguments.length ? (nodes = typeof _ === "function" ? _ : constant(_), sankey) : nodes;
  };

  sankey.links = function(_: any) {
    return arguments.length ? (links = typeof _ === "function" ? _ : constant(_), sankey) : links;
  };

  sankey.linkShape = function(): Function {
    return orientation === sankeyVertical ? sankeyLinkVertical() : sankeyLinkHorizontal();
  };

  sankey.linkSort = function(_: any) {
    // @ts-ignore
    return arguments.length ? (linkSort = _, sankey) : linkSort;
  };

  sankey.size = function(_: any) {
    return arguments.length ? (x0 = y0 = 0, x1 = +_[0], y1 = +_[1], sankey) : [x1 - x0, y1 - y0];
  };

  sankey.extent = function(_: any) {
    return arguments.length ? (x0 = +_[0][0], x1 = +_[1][0], y0 = +_[0][1], y1 = +_[1][1], sankey) : [[x0, y0], [x1, y1]];
  };

  sankey.iterations = function(_: any) {
    return arguments.length ? (iterations = +_, sankey) : iterations;
  };

  // @ts-ignore
  function computeNodeLinks({nodes, links}) {
    for (const [i, node] of nodes.entries()) {
      node.index = i;
      node.sourceLinks = [];
      node.targetLinks = [];
    }
    // @ts-ignore
    const nodeById = new Map(nodes.map((d, i) => [id(d, i, nodes), d]));
    for (const [i, link] of links.entries()) {
      link.index = i;
      let {source, target} = link;
      if (typeof source !== "object") {
        source = link.source = find(nodeById, source);
      }
      if (typeof target !== "object") {
        target = link.target = find(nodeById, target);
      }
      source.sourceLinks.push(link);
      target.targetLinks.push(link);
    }
    if (linkSort !== null) {
      for (const {sourceLinks, targetLinks} of nodes) {
        // @ts-ignore
        sourceLinks.sort(linkSort);
        // @ts-ignore
        targetLinks.sort(linkSort);
      }
    }
  }

  // @ts-ignore
  function computeNodeValues({nodes}): void {
    for (const node of nodes) {
      node.value = node.fixedValue === undefined
          ? Math.max(sum(node.sourceLinks, value), sum(node.targetLinks, value))
          : node.fixedValue;
    }
  }

  // @ts-ignore
  function computeNodeDepths({nodes}): void {
    const n = nodes.length;
    let current = new Set(nodes);
    let next = new Set;
    let x = 0;
    while (current.size) {
      for (const node of current) {
        // @ts-ignore
        node.depth = x;
        // @ts-ignore
        for (const {target} of node.sourceLinks) {
          next.add(target);
        }
      }
      if (++x > n) {
        throw new Error("circular link");
      }
      current = next;
      next = new Set;
    }
  }

  // @ts-ignore
  function computeNodeHeights({nodes}): void {
    const n = nodes.length;
    let current = new Set(nodes);
    let next = new Set;
    let x = 0;
    while (current.size) {
      for (const node of current) {
        // @ts-ignore
        node.height = x;
        // @ts-ignore
        for (const {source} of node.targetLinks) {
          next.add(source);
        }
      }
      if (++x > n) {
        throw new Error("circular link");
      }
      current = next;
      next = new Set;
    }
  }

  // @ts-ignore
  function computeNodeLayers({nodes}) {
    // @ts-ignore
    const x: number = max(nodes, d => d.depth) + 1;
    const kx = (x1 - x0 - dx) / (x - 1);
    const columns = new Array(x);
    for (const node of nodes) {
      const i = Math.max(0, Math.min(x - 1, Math.floor(align.call(null, node, x))));
      node.layer = i;
      node.x0 = x0 + i * kx;
      node.x1 = node.x0 + dx;
      if (columns[i]) {
        columns[i].push(node);
      } else {
        columns[i] = [node];
      }
    }
    if (sort) {
      for (const column of columns) {
        column.sort(sort);
      }
    }
    return columns;
  }

  // @ts-ignore
  function initializeNodeBreadths(columns): void {
    // @ts-ignore
    const ky: number = min(columns, c => (y1 - y0 - (c.length - 1) * py) / sum(c, value));
    for (const nodes of columns) {
      let y = y0;
      for (const node of nodes) {
        node.y0 = y;
        node.y1 = y + node.value * ky;
        // @ts-ignore
        y = node.y1 + py;
        for (const link of node.sourceLinks) {
          link.width = link.value * ky;
        }
      }
      // @ts-ignore
      y = (y1 - y + py) / (nodes.length + 1);
      for (let i = 0; i < nodes.length; ++i) {
        const node = nodes[i];
        node.y0 += y * (i + 1);
        node.y1 += y * (i + 1);
      }
      reorderLinks(nodes);
    }
  }

  // @ts-ignore
  function computeNodeBreadths(graph): void {
    const columns = computeNodeLayers(graph);
    py = Math.min(dy, (y1 - y0) / (max(columns, c => c.length) - 1));
    initializeNodeBreadths(columns);
    for (let i = 0; i < iterations; ++i) {
      const alpha = Math.pow(0.99, i);
      const beta = Math.max(1 - alpha, (i + 1) / iterations);
      relaxRightToLeft(columns, alpha, beta);
      relaxLeftToRight(columns, alpha, beta);
    }
  }

  function orientExtents(): void {
    [x0, y0] = orientation(x0, y0);
    [x1, y1] = orientation(x1, y1);
  }

  // @ts-ignore
  function orientNodes({nodes}, orientation: Function): void {
    for (const node of nodes) {
      [node.x0, node.y0] = orientation(node.x0, node.y0);
      [node.x1, node.y1] = orientation(node.x1, node.y1);
    }
  }

  // Reposition each node based on its incoming (target) links.
  function relaxLeftToRight(columns: any[], alpha: number, beta: number): void {
    for (let i = 1, n = columns.length; i < n; ++i) {
      const column = columns[i];
      for (const target of column) {
        let y = 0;
        let w = 0;
        for (const {source, value} of target.targetLinks) {
          let v = value * (target.layer - source.layer);
          y += targetTop(source, target) * v;
          w += v;
        }
        if (!(w > 0)) {
          continue;
        }
        let dy = (y / w - target.y0) * alpha;
        target.y0 += dy;
        target.y1 += dy;
        reorderNodeLinks(target);
      }
      // @ts-ignore
      if (sort === undefined) {
        column.sort(ascendingBreadth);
      }
      resolveCollisions(column, beta);
    }
  }

  // Reposition each node based on its outgoing (source) links.
  function relaxRightToLeft(columns: any[], alpha: number, beta: number): void {
    for (let n = columns.length, i = n - 2; i >= 0; --i) {
      const column = columns[i];
      for (const source of column) {
        let y = 0;
        let w = 0;
        for (const {target, value} of source.sourceLinks) {
          let v = value * (target.layer - source.layer);
          y += sourceTop(source, target) * v;
          w += v;
        }
        if (!(w > 0)) {
          continue;
        }
        let dy = (y / w - source.y0) * alpha;
        source.y0 += dy;
        source.y1 += dy;
        reorderNodeLinks(source);
      }
      // @ts-ignore
      if (sort === undefined) {
        column.sort(ascendingBreadth);
      }
      resolveCollisions(column, beta);
    }
  }

  function resolveCollisions(nodes: TNode[], alpha: number): void {
    const i = nodes.length >> 1;
    const subject = nodes[i];
    resolveCollisionsBottomToTop(nodes, subject.y0 - py, i - 1, alpha);
    resolveCollisionsTopToBottom(nodes, subject.y1 + py, i + 1, alpha);
    resolveCollisionsBottomToTop(nodes, y1, nodes.length - 1, alpha);
    resolveCollisionsTopToBottom(nodes, y0, 0, alpha);
  }

  function resolveCollisionsTopToBottom(nodes: TNode[], y: number, i: number, alpha: number): void {
    for (; i < nodes.length; ++i) {
      const node = nodes[i];
      const dy = (y - node.y0) * alpha;
      if (dy > 1e-6) {
        node.y0 += dy, node.y1 += dy;
      }
      y = node.y1 + py;
    }
  }

  function resolveCollisionsBottomToTop(nodes: TNode[], y: number, i: number, alpha: number): void {
    for (; i >= 0; --i) {
      const node = nodes[i];
      const dy = (node.y1 - y) * alpha;
      if (dy > 1e-6) {
        node.y0 -= dy, node.y1 -= dy;
      }
      y = node.y0 - py;
    }
  }

  // @ts-ignore
  function reorderNodeLinks({sourceLinks, targetLinks}): void {
    if (linkSort === undefined) {
      for (const {source: {sourceLinks}} of targetLinks) {
        sourceLinks.sort(ascendingTargetBreadth);
      }
      for (const {target: {targetLinks}} of sourceLinks) {
        targetLinks.sort(ascendingSourceBreadth);
      }
    }
  }

  function reorderLinks(nodes: TNode[]): void {
    if (linkSort === undefined) {
      for (const {sourceLinks, targetLinks} of nodes) {
        sourceLinks.sort(ascendingTargetBreadth);
        targetLinks.sort(ascendingSourceBreadth);
      }
    }
  }

  function targetTop(source: TNode, target: TNode): number {
    let y = source.y0 - (source.sourceLinks.length - 1) * py / 2;
    for (const {target: node, width} of source.sourceLinks) {
      if (node === target) {
        break;
      }
      y += width + py;
    }
    for (const {source: node, width} of target.targetLinks) {
      if (node === source) {
        break;
      }
      y -= width;
    }
    return y;
  }

  function sourceTop(source: TNode, target: TNode): number {
    let y = target.y0 - (target.targetLinks.length - 1) * py / 2;
    for (const {source: node, width} of target.targetLinks) {
      if (node === source) {
        break;
      }
      y += width + py;
    }
    for (const {target: node, width} of source.sourceLinks) {
      if (node === target) {
        break;
      }
      y -= width;
    }
    return y;
  }

  return sankey;
}

export {
  Sankey as sankey,
  center as sankeyCenter,
  justify as sankeyJustify,
  left as sankeyLeft,
  sankeyLinkHorizontal as sankeyLinkHorizontal,
  sankeyLinkVertical as sankeyLinkVertical,
  right as sankeyRight
};
