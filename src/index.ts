import { updateSplash } from "./ui/splash";
import { initSankeyMenu } from "./ui/menu";
import { initSankeyCharts } from "./ui/charts";
import { initSankeyTitleBar } from "./ui/titlebar";
import { initSankeyOrganisationList } from "./ui/menu/filter-organisation";
import { initEnvironment } from "./ui/environment";
import { json } from "d3-request";

export function start() {
  const datapath = window.location.hostname === "localhost"
    ? "./json/sankey/" 
    : "https://raw.githubusercontent.com/NELCSU/ED-Flows/master/docs/json/sankey/";

  json(datapath + "config.json", function(d) {
    const config = d;
    config.db.path = datapath;
    initEnvironment(config);
    initSankeyTitleBar();
    initSankeyMenu(config);
    initSankeyCharts(config);
    initSankeyOrganisationList(config);
    updateSplash();

    document.body.addEventListener("click", function(e) {
      e.stopImmediatePropagation();
      window.dispatchEvent(new CustomEvent("hide-breakdown", { detail: config }));
      window.dispatchEvent(new CustomEvent("hide-menu"));
      window.dispatchEvent(new CustomEvent("clear-chart"));
    });
  });
}