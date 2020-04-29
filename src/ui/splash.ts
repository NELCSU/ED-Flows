/**
 * Advises on optimal screen size and removes splash screen after 500ms delay
 */
export function updateSplash() {
  if (window.innerWidth < 800 || window.innerHeight < 600) {
    alert("The recommended minimum resolution is 800 x 600.\n Yours is " + window.innerWidth + " x " + window.innerHeight + ".");
  }

  setTimeout(() => {
    const loading = document.querySelector(".loading");
    if (loading) {
      document.body.removeChild(loading);
    }
    const content = document.getElementById("content") as HTMLDivElement;
    content.style.visibility = "visible";
    content.style.opacity = "1";
  }, 500);
}