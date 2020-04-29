import { initUIThemes } from "./filter-theme";
import { initCallList } from "./filter-call";
import { initDensitySlider } from "./filter-density";
import { initOpacitySlider } from "./filter-opacity";
import { initSankeyLegend } from "./filter-legend";
import { initSankeyNodeMovement } from "./filter-move-nodes";
import { initSankeyNodeOrientation } from "./filter-orientation";
import { openDataFile } from "../data";
import { initDayList } from "./filter-day";
import { setQueryHash } from "../urlhash";
import type { TConfig } from "../../typings/ED";

/**
 * @param config 
 */
export function initMenu(config: TConfig) {
  const menu = document.querySelector(".menu") as HTMLDivElement;
  const menuButton = document.querySelector(".menu-button") as HTMLDivElement;

  if (menu && menuButton) {
    menuButton.addEventListener("click", e => {
      e.stopImmediatePropagation();
      menu.classList.toggle("ready");
      window.dispatchEvent(new CustomEvent("hide-breakdown"));
    });
    menu.addEventListener("click", e => e.stopImmediatePropagation());
  }

  initDayList(config);
  initCallList(config);
  initDensitySlider(config);
  initOpacitySlider(config);
  initSankeyLegend(config);
  initSankeyNodeMovement(config);
  initSankeyNodeOrientation(config);
  initUIThemes(config);

  window.addEventListener("hide-menu", () => menu.classList.add("ready"));
  window.addEventListener("filter-action", () => {
    window.dispatchEvent(new CustomEvent("data-quality"));
    setQueryHash(config);
    config.db.file = config.querystring.organisation + config.querystring.day + config.querystring.call + ".json";
    openDataFile(config)
      .then((content) => {
        config.db.sankey = JSON.parse(content);
        window.dispatchEvent(new CustomEvent("sankey-chart"));
      });
  });
}