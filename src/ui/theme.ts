const themeLabels = ["light", "dark"];

/**
 * Gets the selected value from user's theme choice
 */
function getThemeId(): number {
  let choice = 0;
  const el = document.getElementById("theme_choice") as HTMLSelectElement;
  const v = el?.options[el.selectedIndex].value;
  if (v) {
    choice = parseInt(v);
  }
  return choice;
}

/**
 * Sets theme-based stylesheet
 * @param i 
 */
function changeStyle(i: number) {
  const styles = document.createElement("link") as HTMLLinkElement;
  styles.id = "theme_stylesheet";
  styles.type = "text/css";
  styles.rel = "stylesheet";
  styles.href = "./css/themes/" + themeLabels[i] + ".css";
  const old = document.getElementById("theme_stylesheet") as HTMLLinkElement;
  if (old) {
    document.head.removeChild(old);
  }
  document.head.appendChild(styles);
}

/**
 * Creates user control
 */
export function initUIThemes() {
  const select = document.getElementById("theme_choice") as HTMLSelectElement;
  if (select) {
    select.title = "Select a color scheme for this page";
    themeLabels.forEach(function(label, n) {
      const opt = document.createElement("option") as HTMLOptionElement;
      opt.value = "" + n;
      opt.text = label;
      select.appendChild(opt);
    });
    select.addEventListener("click", e => e.stopImmediatePropagation());
    select.addEventListener("input", () => {
      const i = getThemeId();
      changeStyle(i);
    });
    changeStyle(0);
  }
}