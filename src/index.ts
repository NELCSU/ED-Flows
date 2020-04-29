import { updateSplash } from "./ui/splash";
import { initMenu } from "./ui/menu";
import { initCharts } from "./ui/charts";
import { initTitleBar } from "./ui/titlebar";
import { initOrganisationList } from "./ui/menu/filter-organisation";
import { initEnvironment } from "./ui/environment";
import { json } from "d3-request";

export function start() {
  const datapath = window.location.hostname === "localhost"
    ? "./json/" 
    : "https://raw.githubusercontent.com/NELCSU/ED/master/docs/json/";

  json(datapath + "config.json", function(d) {
    const config = d;
    config.db.path = datapath;
    initEnvironment(config);
    initTitleBar();
    initMenu(config);
    initCharts(config);
    initOrganisationList(config);
    updateSplash();

    document.body.addEventListener("click", function(e) {
      e.stopImmediatePropagation();
      window.dispatchEvent(new CustomEvent("hide-breakdown", { detail: config }));
      window.dispatchEvent(new CustomEvent("hide-menu"));
      window.dispatchEvent(new CustomEvent("clear-chart"));
    });
  });
}