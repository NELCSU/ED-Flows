import type { TBreakdown } from "../../typings/ED";

export function drawDataTable(node: Element, data: TBreakdown[]): void {
  let html = `<div class="table-scroll"><table>`;
  html += `<thead><tr><th scope="col"></th>`;
  html += `<th scope="col" class="column-sort" title="Click to sort on this column">Category</th>`;
  html += `<th scope="col" class="column-sort" title="Click to sort on this column">Value</th>`;
  html += `</tr></thead>`;
  html += `<tbody>`;
  data.forEach((d: TBreakdown) => {
    html += `<tr>`;
    html += `<td class="mark" style="background-color:${d.color};"></td>`;
    html += `<td>${d.label ? d.label : "No description"}</td><td>${d.value}</td>`;
    html += `</tr>`;
  });
  html += `</tbody></table></div>`;
  node.innerHTML = html;

  addSorting(node);
}

function addSorting(node: Element): void {
  const isDate: Function = (d: string) => { try { return !isNaN((new Date(d)).getTime()); } catch {} return false; };

  const table = node.querySelector("table") as HTMLTableElement;
  const columns = [].slice.call(table.querySelectorAll("th"));

  columns.forEach((col: HTMLTableHeaderCellElement, i: number) => {
    if (col.classList.contains("column-sort")) {
      col.addEventListener("click", (e: MouseEvent) => {
        const el: HTMLTableHeaderCellElement = e.target as HTMLTableHeaderCellElement;
        let cl = el.classList.contains("asc") ? "desc" : "asc";
        columns.forEach((c: HTMLTableHeaderCellElement) => c.classList.remove("asc", "desc"));
        el.classList.add(cl);
        const cellIndex = el.cellIndex;
        const rows = [].slice.call(table.tBodies[0].rows) as HTMLTableRowElement[];
        rows.sort((a: HTMLTableRowElement, b: HTMLTableRowElement) => {
          let index;
          let cellA = a.cells[cellIndex] as HTMLTableCellElement;
          let cellB = b.cells[cellIndex] as HTMLTableCellElement;
          let testA, testB;
          if (!isNaN(cellA.textContent || "" as any) && !isNaN(cellB.textContent || "" as any)) {
            testA = +(cellA.textContent || 0);
            testB = +(cellB.textContent || 0);
          } else if (isDate(cellA.textContent || "" as any) && isDate(cellB.textContent || "" as any)) {
            testA = new Date(cellA.textContent as any);
            testB = new Date(cellB.textContent as any);
          } else {
            testA = cellA.textContent || "";
            testB = cellB.textContent || "";
          }
          if (cl === "asc") {
            index = testA > testB ? 1 : -1;
          } else {
            index = testA < testB ? 1 : -1;
          }
          return index;
        });
        rows.forEach((row: HTMLTableRowElement) => {
          row.parentNode?.removeChild(row);
          table.tBodies[0].appendChild(row);
        });
      });
    }
  });
}