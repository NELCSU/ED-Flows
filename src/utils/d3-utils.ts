export type TMargin = {
  bottom: number,
  left: number,
  right: number,
  top: number
};

export type TSVGGenerator = { 
  height: Function,
  margin: Function,
  width: Function
};

/**
 * @param selection - passed by D3 call() API
 * @example
 * const svg = container.call(
 *  svg()
 *    .height(50)
 *    .width(50)
 *    .margin({bottom: 5, left: 10, right: 5, top: 20})
 * );
 * @returns - object containing SVG D3 selection object
 */
export function svg(): TSVGGenerator {
  let _h = 200, _w = 200, _m = { bottom: 10, left: 10, right: 10, top: 10 };

  function _svg(selection: any) {
    const svg = selection.append("svg")
      .attr("x", 0)
      .attr("y", 0)
      .attr("height", "100%")
      .attr("width", "100%")
      .attr("viewBox", `0 0 ${_w} ${_h}`)
      .attr("xmlns", "http://www.w3.org/2000/svg")
      .attr("xmlns:xlink", "http://www.w3.org/1999/xlink");
    
    svg.append("defs");

    svg.append("g")
      .attr("class", "canvas")
      .attr("transform", `translate(${_m.left},${_m.top})`);

    return svg;
  }

  _svg.height = (n?: number) => {
    if (n === undefined) {
      return _h;
    } else {
      _h = n;
      return _svg;
    }
  };

  _svg.margin = (m? : TMargin) => {
    if (m === undefined) {
      return _m;
     } else {
      _m = m;
      return _svg;
     }
  };

  _svg.width = (n?: number) => {
    if (n === undefined) {
      return _w;
    } else {
      _w = n;
      return _svg;
    }
  };

  return _svg;
}