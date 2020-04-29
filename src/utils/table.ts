/**
 * Returns a comma separated values list
 * @param table - Table element to inspect
 */
export function toCSV(table: HTMLTableElement): string {
  const rows: NodeListOf<HTMLTableRowElement> = table.querySelectorAll("tr");
  return [].slice.call(rows)
      .map((row: HTMLTableRowElement) => {
        const cells: NodeListOf<HTMLTableCellElement> = row.querySelectorAll("th,td");
        return [].slice.call(cells)
            .map((cell: HTMLTableCellElement) => `"${cell.textContent?.replace(/"/g, `""`)}"`)
            .join(",");
      })
      .join("\n");
}