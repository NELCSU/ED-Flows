import { initUIThemes } from "./filter-theme";
import { initCallList } from "./filter-call";
import { initCodingList } from "./filter-coding";
import { initUpliftList } from "./filter-uplift";
import { initDensitySlider } from "./filter-density";
import { initSankeyLegend } from "./filter-legend";
import { initSankeyNodeMovement } from "./filter-move-nodes";
import { initSankeyNodeOrientation } from "./filter-orientation";
import { openDataFile } from "../data";
import { initDayList } from "./filter-day";
import { setSankeyQueryHash, setStreamQueryHash } from "../urlhash";
import type { TSankeyConfig, TStreamConfig } from "../../typings/ED";

/**
 * @param config 
 */
export function initSankeyMenu(config: TSankeyConfig) {
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
  initSankeyLegend(config);
  initSankeyNodeMovement(config);
  initSankeyNodeOrientation(config);
  initUIThemes(config);

  window.addEventListener("hide-menu", () => menu.classList.add("ready"));

  window.addEventListener("filter-action", () => {
    window.dispatchEvent(new CustomEvent("data-quality"));
    setSankeyQueryHash(config);
    config.db.file = "Legend" + config.querystring.organisation + config.querystring.day + config.querystring.call + ".json";

    openDataFile(config)
      .then((content) => {
        config.legend = [JSON.parse(content)];
        config.db.file = config.querystring.organisation + config.querystring.day + config.querystring.call + ".json";

        openDataFile(config)
          .then((content) => {
            config.db.sankey = JSON.parse(content);
            window.dispatchEvent(new CustomEvent("sankey-chart"));
          });
      });
  });

  window.addEventListener("soft-filter-action", () => {
    config.sankey.nodeMoveX = config.filters.move.x;
    config.sankey.nodeMoveY = config.filters.move.y;
  });
}

/**
 * @param config 
 */
export function initStreamMenu(config: TStreamConfig) {
  const menu = document.querySelector(".menu") as HTMLDivElement;
  const menuButton = document.querySelector(".menu-button") as HTMLDivElement;

  if (menu && menuButton) {
    menuButton.addEventListener("click", e => {
      e.stopImmediatePropagation();
      menu.classList.toggle("ready");
    });
    menu.addEventListener("click", e => e.stopImmediatePropagation());
  }

  initUpliftList(config);
  initCodingList(config);
  initUIThemes(config);

  window.addEventListener("hide-menu", () => menu.classList.add("ready"));

  window.addEventListener("filter-action", () => {
    setStreamQueryHash(config);
    config.db.file = config.querystring.organisation + "-" + config.querystring.coding + "-" + config.querystring.uplift + ".json";

    openDataFile(config)
      .then((content) => {
        config.db.stream = JSON.parse(content);
        window.dispatchEvent(new CustomEvent("stream-chart"));
      });
  });
}