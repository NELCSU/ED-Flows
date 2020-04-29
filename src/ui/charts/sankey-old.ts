import type { D3Selection, TLink, TMargin, TNode, TNodeComponent, TSankey } from "../../typings/ED";
import { interpolateNumber } from "d3-interpolate";
import { min, rollup, sum } from "d3-array";
import { select } from "d3-selection";

function ascXDepth(a: TNode, b: TNode): number {
  return b.x - a.x;
}

function ascXDepthSource(a: TLink, b: TLink): number {
  return a.source.x - b.source.x;
}

function ascYDepth(a: TNode, b: TNode): number {
  return a.y - b.y;
}

function ascYDepthSource(a: TLink, b: TLink): number {
  return a.source.y - b.source.y;
}

function ascTargetDepthH(a: TLink, b: TLink): number {
  return a.target.y - b.target.y;
}

function ascTargetDepthV(a: TLink, b: TLink): number {
  return a.target.x - b.target.x;
}

function center(node: TNode): number {
  return node.y + node.dy / 2;
}

function computeLinkDepths(nodes: TNode[], align: string) {
  nodes.forEach((node: TNode) => {
    node.sourceLinks.sort(align === "horizontal" ? ascTargetDepthH : ascTargetDepthV);
    node.targetLinks.sort(align === "horizontal" ? ascYDepthSource : ascXDepthSource);
  });

  nodes.forEach((node: TNode) => {
    let sy = 0, ty = 0;

    node.sourceLinks.forEach((link: TLink) => {
      link.sy = sy;
      sy += link.dy;
    });

    node.targetLinks.forEach((link: TLink) => {
      link.ty = ty;
      ty += link.dy;
    });
  });
}

// Assign the breadth (x-position) for each strongly connected component,
// followed by assigning breadth within the component.
function computeNodeBreadthsHorizontal(nodes: TNode[], components: TNodeComponent[], width: number, size: number, align: string) {
  layerComponents();

  components.forEach((component, i) =>
    bfs(component.root, (node: TNode) =>
      node.sourceLinks
        .filter((sourceLink: TLink) => sourceLink.target.component === i)
        .map((sourceLink: TLink) => sourceLink.target)
    ));

  let componentsByBreadth = Array.from(rollup(
    components.sort((a, b) => a.x - b.x),
    item => item,
    d => d.x
  ).values());

  let max = -1, nextMax = -1;

  componentsByBreadth.forEach((c: TNodeComponent[]) => {
    c.forEach((component: TNodeComponent) => {
      component.x = max + 1;
      component.scc.forEach((node: TNode) => {
        node.x = node.layer ? node.layer : component.x + node.x;
        nextMax = Math.max(nextMax, node.x);
      });
    });
    max = nextMax;
  });

  nodes.filter(n => n.sourceLinks.filter((l: TLink) => l.source.name !== l.target.name).length === 0)
        .forEach(n => n.x = max);

  scaleNodeBreadths(nodes, (size - width) / Math.max(max, 1), align);

  function layerComponents() {
    let remainingComponents = components;
    let nextComponents: TNodeComponent[];
    let visitedIndex: Set<number> = new Set();
    let x = 0;

    while (remainingComponents.length) {
      nextComponents = [];
      visitedIndex.clear();
      remainingComponents.forEach((component) => {
        component.x = x;
        component.scc.forEach((n: TNode) => {
          n.sourceLinks.forEach((l: TLink) => {
            if (!visitedIndex.has(l.target.component) && l.target.component !== component.index) {
              nextComponents.push(components[l.target.component]);
              visitedIndex.add(l.target.component);
            }
          });
        });
      });
      remainingComponents = nextComponents;
      ++x;
    }
  }

  function bfs(node: TNode, extractTargets: Function) {
    let queue = [node], currentCount = 1, nextCount = 0, x = 0;

    while (currentCount > 0) {
      let currentNode = queue.shift();
      currentCount--;

      if (currentNode) {
        if (currentNode.x === undefined) {
          currentNode.x = x;
          currentNode.dx = width;
          let targets = extractTargets(currentNode);
          queue = queue.concat(targets);
          nextCount += targets.length;
        }
      }

      if (currentCount === 0) { // level change
        x++;
        currentCount = nextCount;
        nextCount = 0;
      }
    }
  }
}

function computeNodeBreadthsVertical(nodes: TNode[], links: TLink[], pad: number, size: number, align: string, iterations: number) {
  let nodesByBreadth = Array.from(rollup(
    nodes.sort((a, b) => a.x - b.x),
    item => item,
    d => d.y
  ).values());

  let ky = (size - (nodesByBreadth[0].length - 1) * pad) / sum(nodesByBreadth[0] as any, (d: TLink) => d.value);
  nodesByBreadth.forEach((nodes) => {
    nodes.forEach((node: TNode, i: number) => {
      node.x = i;
      node.dy = node.value * ky;
    });
  });

  links.forEach((link) => link.dy = link.value * ky);

  resolveCollisionsV(nodesByBreadth, pad, size);

  for (let alpha = 1; iterations > 0; --iterations) {
    relaxLeftToRight(nodesByBreadth, alpha, align);
    resolveCollisionsV(nodesByBreadth, pad, size);
    relaxRightToLeft(nodesByBreadth, alpha *= .99, align);
    resolveCollisionsV(nodesByBreadth, pad, size);
  }
}

function computeNodeDepthsHorizontal(nodes: TNode[], links: TLink[], pad: number, size: number, align: string, iterations: number) {
  let nodesByBreadth = Array.from(rollup(
    nodes.sort((a, b) => a.x - b.x),
    item => item,
    d => d.x
  ).values());

  initializeNodeDepth(nodesByBreadth, links, pad, size);
  resolveCollisionsH(nodesByBreadth, pad, size);

  for (let alpha = 1; iterations > 0; --iterations) {
    relaxRightToLeft(nodesByBreadth, alpha *= .99, align);
    resolveCollisionsH(nodesByBreadth, pad, size);
    relaxLeftToRight(nodesByBreadth, alpha, align);
    resolveCollisionsH(nodesByBreadth, pad, size);
  }
}

function computeNodeDepthsVertical(nodes: TNode[], width: number, size: number, align: string) {
  let remainingNodes = nodes, nextNodes: TNode[], y = 0;
  while (remainingNodes.length) {
    nextNodes = [];
    remainingNodes.forEach((node: TNode) => {
      node.y = y;
      node.sourceLinks.forEach((link: TLink) => {
        if (nextNodes.indexOf(link.target) < 0) {
          nextNodes.push(link.target);
        }
      });
    });
    remainingNodes = nextNodes;
    ++y;
  }
  moveSinksDown(nodes, y);
  scaleNodeBreadths(nodes, (size - width) / (y - 1), align);
}

/**
 * @description
 * Populate the sourceLinks and targetLinks for each node.
 * Also, if the source and target are not objects, assume they are indices.
 */
function computeNodeLinks(nodes: TNode[], links: TLink[]) {
  nodes.forEach(node => {
    node.sourceLinks = [];
    node.targetLinks = [];
  });

  links.forEach((link) => {
    let source = link.source, target = link.target;
    if (typeof source === "number") {
      const key: number = (link.source as unknown) as number;
      source = link.source = nodes[key];
    }
    if (typeof target === "number") {
      const key: number = (link.target as unknown) as number;
      target = link.target = nodes[key];
    }
    source.sourceLinks.push(link);
    target.targetLinks.push(link);
  });
}

/**
 * @description
 * Take the list of nodes and create a DAG of supervertices, each consisting of a strongly connected component of the graph
 * @see http://en.wikipedia.org/wiki/Tarjan's_strongly_connected_components_algorithm
 */
function computeNodeStructure(nodes: TNode[], components: TNodeComponent[]) {
  let nodeStack: TNode[] = [], index = 0;

  nodes.forEach((node: TNode) => {
    if (!node.index) {
      connect(node);
    }
  });

  function connect(node: TNode) {
    node.index = index++;
    node.lowIndex = node.index;
    node.onStack = true;
    nodeStack.push(node);
    if (node.sourceLinks) {
      node.sourceLinks.forEach((sourceLink: TLink) => {
        let target = sourceLink.target;
        if (target.index === undefined) {
          connect(target);
          node.lowIndex = Math.min(node.lowIndex, target.lowIndex);
        } else if (target.onStack) {
          node.lowIndex = Math.min(node.lowIndex, target.index);
        }
      });

      if (node.lowIndex === node.index) {
        let component = [], currentNode: TNode | undefined;

        do {
          currentNode = nodeStack.pop();
          if (currentNode) {
            currentNode.onStack = false;
            component.push(currentNode);
          }
        } while (currentNode !== node);

        components.push({
          index: 0,
          root: node,
          scc: component,
          x: 0
        });
      }
    }
  }

  components.forEach((component, i) => {
    component.index = i;
    component.scc.forEach((node: TNode) => node.component = i);
  });
}

/**
 * Compute the value (size) of each node by summing the associated links.
 */
function computeNodeValues(nodes: TNode[]) {
  nodes.forEach((node) => {
    if (!(node.value)) {
      node.value = Math.max(
        sum(node.sourceLinks, d => d.value), sum(node.targetLinks, d => d.value)
      );
    }
  });
}

function initializeNodeDepth(nodesByBreadth: TNode[][], links: TLink[], pad: number, size: number) {
  let ky = min(nodesByBreadth, nodes => (size - (nodes.length - 1) * pad) / sum(nodes as any, (d: TLink) => d.value));

  nodesByBreadth.forEach(nodes => {
    nodes.forEach((node: TNode, i: number) => {
      if (ky !== undefined) {
        node.y = i;
        node.dy = node.value * ky;
      }
    });
  });

  links.forEach(link => {
    if (ky !== undefined) {
      link.dy = link.value * ky;
    }
  });
}

function linkForward(part: number, d: TLink) {
  let curvature = 0.5;
  let x0 = d.source.x + d.source.dx,
    x1 = d.target.x,
    xi = interpolateNumber(x0, x1),
    x2 = xi(curvature),
    x3 = xi(1 - curvature),
    y0 = d.source.y + d.sy,
    y1 = d.target.y + d.ty,
    y2 = d.source.y + d.sy + d.dy,
    y3 = d.target.y + d.ty + d.dy;

  switch (part) {
    case 0:
      return "M" + x0 + "," + y0 + "L" + x0 + "," + (y0 + d.dy);

    case 1:
      return "M" + x0 + "," + y0 +
        "C" + x2 + "," + y0 + " " + x3 + "," + y1 + " " + x1 + "," + y1 +
        "L" + x1 + "," + y3 +
        "C" + x3 + "," + y3 + " " + x2 + "," + y2 + " " + x0 + "," + y2 +
        "Z";

    case 2:
      return "M" + x1 + "," + y1 + "L" + x1 + "," + (y1 + d.dy);
  }
}

function linkBack(part: number, d: TLink) {
  let curveExtension = 30;
  let curveDepth = 15;

  function direction(d: TLink): number {
    return d.source.y + d.sy > d.target.y + d.ty ? -1 : 1;
  }

  let dt = direction(d) * curveDepth,
    x0 = d.source.x + d.source.dx,
    y0 = d.source.y + d.sy,
    x1 = d.target.x,
    y1 = d.target.y + d.ty;

  switch (part) {
    case 0:
      return "M" + toPoint(x0, y0) +
        "C" + toPoint(x0, y0) +
        toPoint(x0 + curveExtension, y0) +
        toPoint(x0 + curveExtension, y0 + dt) +
        "L" + toPoint(x0 + curveExtension, y0 + dt + d.dy) +
        "C" + toPoint(x0 + curveExtension, y0 + d.dy) +
        toPoint(x0, y0 + d.dy) +
        toPoint(x0, y0 + d.dy) +
        "Z";
    case 1:
      return "M" + toPoint(x0 + curveExtension, y0 + dt) +
        "C" + toPoint(x0 + curveExtension, y0 + 3 * dt) +
        toPoint(x1 - curveExtension, y1 - 3 * dt) +
        toPoint(x1 - curveExtension, y1 - dt) +
        "L" + toPoint(x1 - curveExtension, y1 - dt + d.dy) +
        "C" + toPoint(x1 - curveExtension, y1 - 3 * dt + d.dy) +
        toPoint(x0 + curveExtension, y0 + 3 * dt + d.dy) +
        toPoint(x0 + curveExtension, y0 + dt + d.dy) +
        "Z";

    case 2:
      return "M" + toPoint(x1 - curveExtension, y1 - dt) +
        "C" + toPoint(x1 - curveExtension, y1) +
        toPoint(x1, y1) +
        toPoint(x1, y1) +
        "L" + toPoint(x1, y1 + d.dy) +
        "C" + toPoint(x1, y1 + d.dy) +
        toPoint(x1 - curveExtension, y1 + d.dy) +
        toPoint(x1 - curveExtension, y1 + d.dy - dt) +
        "Z";
  }
}

function moveSinksDown(nodes: TNode[], y: number): void {
  nodes.forEach((node: TNode) => {
    if (!node.sourceLinks.length) {
      node.y = y - 1;
    }
  });
}

function relaxLeftToRight(nodesByBreadth: TNode[][], alpha: number, align: string) {
  nodesByBreadth.forEach(nodes => {
    nodes.forEach((node: TNode) => {
      if (node.targetLinks.length) {
        let s = sum(node.targetLinks, weightedSource) / sum(node.targetLinks, d => d.value);
        if (align === "horizontal") {
          node.y += (s - center(node)) * alpha;
        } else {
          node.x += (s - center(node)) * alpha;
        }
      }
    });
  });
}

function relaxRightToLeft(nodesByBreadth: TNode[][], alpha: number, align: string) {
  nodesByBreadth.slice().reverse()
    .forEach(nodes => {
      nodes.forEach((node: TNode) => {
        if (node.sourceLinks.length) {
          let y = sum(node.sourceLinks, weightedTarget) / sum(node.sourceLinks, d => d.value);
          if (align === "horizontal") {
            node.y += (y - center(node)) * alpha;
          } else {
            node.x += (y - center(node)) * alpha;
          }
        }
      });
    });
}

function resolveCollisionsH(nodesByBreadth: TNode[][], pad: number, size: number) {
  nodesByBreadth.forEach(nodes => {
    let node, dy, s = 0, n = nodes.length, i;

    // Push any overlapping nodes down.
    nodes.sort(ascYDepth);
    for (i = 0; i < n; ++i) {
      node = nodes[i];
      dy = s - node.y;
      if (dy > 0) {
        node.y += dy;
      }
      s = node.y + node.dy + pad;
    }

    // If the bottommost node goes outside the bounds, push it back up.
    dy = s - pad - size;
    if (dy > 0) {
      s = (<any>node).y -= dy;

      // Push any overlapping nodes back up.
      for (i = n - 2; i >= 0; --i) {
        node = nodes[i];
        dy = node.y + node.dy + pad - s;
        if (dy > 0) {
          node.y -= dy;
        }
        s = node.y;
      }
    }
  });
}

function resolveCollisionsV(nodesByBreadth: TNode[][], pad: number, size: number) {
  nodesByBreadth.forEach(nodes => {
    let node, dy, s = 0, n = nodes.length, i;

    // Push any overlapping nodes right.
    nodes.sort(ascXDepth);
    for (i = 0; i < n; ++i) {
      node = nodes[i];
      dy = s - node.x;
      if (dy > 0) {
        node.x += dy;
      }
      s = node.x + node.dy + pad;
    }

    // If the rightmost node goes outside the bounds, push it left.
    dy = s - pad - size;
    if (dy > 0) {
      s = (<any>node).x -= dy;
      // Push any overlapping nodes left.
      for (i = n - 2; i >= 0; --i) {
        node = nodes[i];
        dy = node.x + node.dy + pad - s;
        if (dy > 0) {
          node.x -= dy;
        }
        s = node.x;
      }
    }
  });
}

function scaleNodeBreadths(nodes: TNode[], kx: number, align: string) {
  nodes.forEach((node: TNode) => {
    if (align === "horizontal") {
      node.x *= kx;
    } else {
      node.y *= kx;
    }
  });
}

function toPoint(x: number, y: number): string {
  return x + "," + y + " ";
}

function weightedSource(link: TLink): number {
  return center(link.source) * link.value;
}

function weightedTarget(link: TLink): number {
  return center(link.target) * link.value;
}

export function sankeyModel() {
  let _alignment = "horizontal";
  let _margin = { bottom: 25, left: 20, right: 40, top: 20 };
  let nodeWidth = 24;
  let nodePadding = 8;
  let _selected: D3Selection | null = null;
  let size = [1, 1];
  let nodes: TNode[] = [];
  let links: TLink[] = [];
  const sankey: TSankey = {
    alignHorizontal: () => {
      _alignment = "horizontal";
      return sankey;
    },
    alignVertical: () => {
      _alignment = "vertical";
      return sankey;
    },
    clear: () => {
      _selected = null;
      return sankey;
    },
    layout: (iterations: number) => {
      const components: TNodeComponent[] = [];

      computeNodeLinks(nodes, links);
      computeNodeValues(nodes);
      computeNodeStructure(nodes, components);
      if (_alignment === "horizontal") {
        computeNodeBreadthsHorizontal(nodes, components, nodeWidth, size[0], _alignment);
        computeNodeDepthsHorizontal(nodes, links, nodePadding, size[1], _alignment, iterations);
      } else {
        computeNodeDepthsVertical(nodes, nodeWidth, size[1], _alignment);
        computeNodeBreadthsVertical(nodes, links, nodePadding, size[0], _alignment, iterations);
      }
      computeLinkDepths(nodes, _alignment);
      return sankey;
    },
    links: (n: TLink[] | undefined) => {
      if (n === undefined) {
        return links;
      }
      links = n;
      return sankey;
    },
    margin: (m: TMargin | undefined) => {
      if (m === undefined) {
        return _margin;
      }
      _margin = m;
      return sankey;
    },
    nodePadding: (n: number | undefined) => {
      if (n === undefined) {
        return nodePadding;
      }
      nodePadding = +n;
      return sankey;
    },
    nodes: (n: TNode[] | undefined) => {
      if (n === undefined) {
        return nodes;
      }
      nodes = n;
      return sankey;
    },
    nodeWidth: (n: number | undefined) => {
      if (n === undefined) {
        return nodeWidth;
      }
      nodeWidth = +n;
      return sankey;
    },
    relayout: () => {
      computeLinkDepths(nodes, _alignment);
      return sankey;
    },
    reversibleLink: () => {
      return function (part: number) {
        return (d: TLink) => (d.source.x < d.target.x) 
          ? linkForward(part, d) 
          : linkBack(part, d);
      };
    },
    select: (selector: string | undefined) => {
      if (selector !== undefined) {
        _selected = select(selector);
        if (_selected.classed("node")) {
          const d = _selected.datum();
          _selected = select(_selected.node().ownerSVGElement)
            // @ts-ignore
            .selectAll(".link").filter((l: TLink) => l.source === d || l.target === d);
        }

        return sankey;
      }
      return _selected;
    },
    size: (n: number[] | undefined) => {
      if (n === undefined) {
        return size;
      }
      size = n;
      return sankey;
    }
  };

  return sankey;
}