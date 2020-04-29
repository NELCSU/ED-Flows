import { getScreenDate } from "../../utils/format";
import type { TConfig } from "../../typings/ED";

/**
 * Initialises Data Quality chart
 * @param config
 */
export function initDataQualityChart(config: TConfig) {
  const container = document.getElementById("lblDQStatus") as HTMLDivElement;
  const status = container.querySelector("img") as HTMLImageElement;

  container.addEventListener("click", (e) => {
    e.stopImmediatePropagation();
    window.dispatchEvent(new CustomEvent("hide-menu"));
    window.dispatchEvent(new CustomEvent("show-status"));
  });

  window.addEventListener("data-quality", () => {
    const i = config.db.dq.interpolated[config.querystring.day];
    const es = config.db.dq.estimated;
    const ms = config.db.dq.missing;
    let state = i.length + es.length + ms.length;
    status.src = state < 10 ? config.status.green.src : state < 15 ? config.status.amber.src : config.status.red.src;
    container.title = state < 10 ? config.status.green.title : state < 15 ? config.status.amber.title : config.status.red.title;
    let qt = `<div class="data-quality">Data availability for <b>${getScreenDate(config.querystring.day)}</b>: `;
    if (state === 0) {
      qt += `Complete.<br>All data is available in the database.`;
    } else if (state < 5) {
      qt += `Very High`;
    } else if (state < 10) {
      qt += `High`;
    } else if (state < 15) {
      qt += `Medium`;
    } else if (state < 20) {
      qt += `Fair`;
    } else {
      qt += `Low`;
    }

    if (ms.length > 0) {
      qt += `<br><br>Missing data: `;
      qt += JSON.stringify(ms)
        .replace(/\"/g, "")
        .replace(/\,/g, ", ")
        .replace(/\[/g, "")
        .replace(/\]/g, "") + ".";
    }

    if (es.length > 0) {
      qt += `<br>Estimated data: `;
      qt += JSON.stringify(es)
        .replace(/\"/g, "")
        .replace(/\,/g, ", ")
        .replace(/\[/g, "")
        .replace(/\]/g, "") + ".";
    }

    if (i.length > 0) {
      qt += `<br>Interpolated data: `;
      qt += JSON.stringify(i)
        .replace(/\"/g, "")
        .replace(/\,/g, ", ")
        .replace(/\[/g, "")
        .replace(/\]/g, "") + ".";
    }
    qt += `</div>`;
    config.status.message = qt;
  });
}