import { updateSplash } from "./ui/splash";
import { initStreamMenu } from "./ui/menu";
import { initStreamCharts } from "./ui/charts";
import { initStreamTitleBar } from "./ui/titlebar";
import { initStreamOrganisationList } from "./ui/menu/filter-organisation";
import { initEnvironment } from "./ui/environment";
import { json } from "d3-request";

export function start() {
  const datapath = window.location.hostname === "localhost"
    ? "./json/stream/" 
    : "https://raw.githubusercontent.com/NELCSU/ED-Flows/master/docs/json/stream/";

  json(datapath + "config.json", function(d) {
    const config = d;
    config.db.path = datapath;
    initEnvironment(config);
    initStreamTitleBar();
    initStreamMenu(config);
    initStreamCharts(config);
    initStreamOrganisationList(config);
    updateSplash();

    document.body.addEventListener("click", function(e) {
      e.stopImmediatePropagation();
      window.dispatchEvent(new CustomEvent("hide-menu"));
      window.dispatchEvent(new CustomEvent("clear-chart"));
    });
  });
}