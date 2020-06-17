import type { TSankeyConfig, TStreamConfig } from "../typings/ED";

/**
 * @param config 
 */
export function initEnvironment(config: TSankeyConfig | TStreamConfig) {
  config.environment = window.location.hostname === "localhost" ? "DEVELOPMENT" : "PRODUCTION";

  if (config.environment === "DEVELOPMENT") {
    const dev = document.createElement("div");
    dev.classList.add("dev-mode");
    dev.textContent = config.environment;
    document.body.appendChild(dev);
	}
}