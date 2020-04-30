export type TURLHash = {
  call: string,
  day: string,
  organisation: string
};

export type TMargin = {
  bottom: number,
  left: number,
  right: number,
  top: number
};

export type TDQChart = {
  day: string, 
  estimated: string[], 
  interpolated: string[], 
  missing: string[]
};

export type TPoint = {
  x: number,
  y: number
};

export type TBreakdown = {
  color: string,
  label: string,
  value: number
};

export type TSankey = {
  alignHorizontal: Function,
  alignVertical: Function,
  clear: Function,
  layout: Function,
  links: Function,
  margin: Function,
  nodePadding: Function,
  nodes: Function,
  nodeWidth: Function,
  relayout: Function,
  reversibleLink: Function,
  select: Function,
  size: Function
};

export type TJSZip = {
  file: Function,
  files: object[],
  comment: string,
  root: string,
  clone: Function
};

type D3Selection = {
  append: Function,
  attr: Function,
  classed: Function,
  datum: Function,
  node: Function,
  select: Function,
  selectAll: Function,
  style: Function,
  transition: Function
};

type TFilterCall = {
  group: string,
  id: string,
  name: string,
  title: string,
  value: string
};

type TImage = {
  src: string,
  title: string
};

interface IDictionary {
  [key: string]: string;
}

export type TConfig = {
  breakdown: {
    chart: TBreakdown[][],
    display: string[][],
    message: string
  },
  db: {
    dq: {
      estimated: string[],
      interpolated: IDictionary,
      missing: string[],
      text: string
    },
    file: string,
    path: string,
    sankey: {
      links: any[],
      nodes: any[]
    },
    zip: TJSZip
  },
  environment: "DEVELOPMENT" | "PRODUCTION",
  filters: {
    calls: TFilterCall[],
    days: string[],
    density: number,
    move: {
      x: boolean,
      y: boolean
    },
    opacity: {
      high: number,
      low: number
    },
    orientation: {
      ltr: boolean,
      ttb: boolean
    }
    organisations: string[]
  },
  legend: {
    color: string[],
    label: string[]
  }[],
  querystring: {
    call: string,
    day: string,
    organisation: string
  },
  sankey: any,
  status: {
    amber: TImage,
    green: TImage,
    message: string,
    red: TImage
  }
  themes: string[]
};

export type TNodeComponent = {
  index: number,
  root: TNode,
  scc: TNode[],
  x: number
};

export type TLink = {
  dy: number,
  fill: string,
  index: number,
  source: TNode,
  supply: TBreakdown[],
  supplyDx: TBreakdown[],
  supplySG: TBreakdown[],
  supplyRead: TBreakdown[],
  sy: number,
  target: TNode,
  ty: number,
  value: number,
  width: number,
  y0: number,
  y1: number
};

export type TNode = {
  color: string,
  component: number,
  depth: number,
  dx: number,
  dy: number,
  fill: string,
  fixedValue: number,
  grouping: TBreakdown[],
  height: number,
  index: number,
  initialPosition: string,
  layer: number,
  lowIndex: number,
  name: string,
  onStack: boolean,
  sourceLinks: TLink[],
  targetLinks: TLink[],
  value: number,
  x: number,
  x0: number,
  x1: number,
  y: number,
  y0: number,
  y1: number
};