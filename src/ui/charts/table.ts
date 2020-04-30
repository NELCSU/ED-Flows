import type { TBreakdown } from "../../typings/ED";

export function drawDataTable(node: Element, data: TBreakdown[]) {
  let html = `<div class="table-scroll"><table>`;
  html += `<thead><tr><th scope="col">Category</th><th scope="col">Value</th></tr></thead><tbody>`;
  data.forEach((d: TBreakdown) => {
    html += `<tr><td><span class="mark" style="color:${d.color};">█</span> ${d.label ? d.label : "No description"}</td><td>${d.value}</td></tr>`;
  });
  html += "</tbody></table></div>";
  node.innerHTML = html;
}