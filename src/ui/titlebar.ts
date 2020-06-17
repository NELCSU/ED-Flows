/**
 * Renders title bar components
 */
export function initSankeyTitleBar() {
  const org = document.getElementById("lblOrganisationStatus") as HTMLDivElement;
  const day = document.getElementById("lblDayStatus") as HTMLDivElement;
  const call = document.getElementById("lblCallStatus") as HTMLDivElement;
  
  window.addEventListener("org-selected", (e: Event) => org.textContent = (e as CustomEvent).detail + " |");
  window.addEventListener("day-selected", (e: Event) => day.textContent = (e as CustomEvent).detail + " |");
  window.addEventListener("call-selected", (e: Event) => call.textContent = (e as CustomEvent).detail);
}

/**
 * Renders title bar components
 */
export function initStreamTitleBar() {
  const org = document.getElementById("lblOrganisationStatus") as HTMLDivElement;
  const uplift = document.getElementById("lblUpliftStatus") as HTMLDivElement;
  const coding = document.getElementById("lblCodingStatus") as HTMLDivElement;
  
  window.addEventListener("org-selected", (e: Event) => org.textContent = (e as CustomEvent).detail + " |");
  window.addEventListener("uplift-selected", (e: Event) => uplift.textContent = (e as CustomEvent).detail + " |");
  window.addEventListener("coding-selected", (e: Event) => coding.textContent = (e as CustomEvent).detail);
}