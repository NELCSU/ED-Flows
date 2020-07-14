import type { TSankeyConfig, TStreamConfig } from "../typings/ED";

/**
 * @param config 
 */
export function initEnvironment(config: TSankeyConfig | TStreamConfig) {
  config.environment = window.location.hostname === "localhost" ? "DEVELOPMENT" : "PRODUCTION";
}