(function () {
  var STORAGE_KEY = "theme-preference";

  function getSystemTheme() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function getEffectiveTheme() {
    var explicit = document.documentElement.getAttribute("data-theme");
    if (explicit === "light" || explicit === "dark") return explicit;
    return getSystemTheme();
  }

  function updateToggle(toggle) {
    var theme = getEffectiveTheme();
    var next = theme === "dark" ? "light" : "dark";
    toggle.setAttribute("aria-label", "Switch to " + next + " mode");
    toggle.querySelector(".theme-toggle-label").textContent =
      next === "dark" ? "Dark mode" : "Light mode";
  }

  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
    var toggle = document.querySelector(".theme-toggle");
    if (toggle) updateToggle(toggle);
  }

  document.addEventListener("DOMContentLoaded", function () {
    var toggle = document.querySelector(".theme-toggle");
    if (!toggle) return;

    updateToggle(toggle);

    toggle.addEventListener("click", function () {
      setTheme(getEffectiveTheme() === "dark" ? "light" : "dark");
    });

    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", function () {
        if (!localStorage.getItem(STORAGE_KEY)) {
          document.documentElement.removeAttribute("data-theme");
          updateToggle(toggle);
        }
      });
  });
})();
