/**
 * Renders title bar components
 */
export function initTitleBar() {
  const org = document.getElementById("lblOrganisationStatus") as HTMLDivElement;
  const day = document.getElementById("lblDayStatus") as HTMLDivElement;
  const call = document.getElementById("lblCallStatus") as HTMLDivElement;
  
  window.addEventListener("org-selected", (e: Event) => org.textContent = (e as CustomEvent).detail + " |");
  window.addEventListener("day-selected", (e: Event) => day.textContent = (e as CustomEvent).detail + " |");
  window.addEventListener("call-selected", (e: Event) => call.textContent = (e as CustomEvent).detail);
}