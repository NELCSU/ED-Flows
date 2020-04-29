import type { TConfig } from "../../typings/ED";

/**
 * Creates user control
 * @param config
 */
export function initUIThemes(config: TConfig) {
  const select = document.getElementById("Colors") as HTMLSelectElement;
  if (select) {
    select.title = "Select a color scheme for this page";
    config.themes.forEach(function (theme: string, n: number) {
      const opt = document.createElement("option") as HTMLOptionElement;
      opt.value = "" + n;
      opt.text = theme;
      select.appendChild(opt);
    });
    select.addEventListener("input", () => {
      const i = getThemeId();
      changeStyle(i);
    });
    changeStyle(0);
  }

  /**
   * Sets theme-based stylesheet
   * @param i 
   */
  function changeStyle(i: number) {
    const styles = document.createElement("link") as HTMLLinkElement;
    styles.id = "theme-stylesheet";
    styles.type = "text/css";
    styles.rel = "stylesheet";
    styles.href = "./css/themes/" + config.themes[i] + ".css";
    const old = document.getElementById("theme-stylesheet") as HTMLLinkElement;
    if (old) {
      document.head.removeChild(old);
    }
    document.head.appendChild(styles);
  }

  /**
   * Gets the selected value from user"s theme choice
   */
  function getThemeId(): number {
    let choice = 0;
    const v = select?.options[select.selectedIndex].value;
    if (v) {
      choice = parseInt(v);
    }
    return choice;
  }
}