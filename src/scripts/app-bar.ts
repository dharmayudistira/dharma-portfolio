import { Moon, Sun, Volume2, VolumeX } from "lucide";
import type { MorphIconElement } from "morphicons/element";
import {
  installSoundUnlock,
  playInteractionSound,
  readSoundPreference,
  setSoundEnabled,
  setSoundVolume,
} from "./ui-sfx";
import { createSearchIndex, searchIndex } from "./search-matching";

const themeStorageKey = "dharma:theme";
installSoundUnlock();

const setTheme = (theme: "dark" | "light", persist: boolean) => {
  const root = document.documentElement;
  const buttons = document.querySelectorAll<HTMLButtonElement>("[data-theme-toggle]");
  const icons = document.querySelectorAll<MorphIconElement>("[data-theme-icon]");
  const labels = document.querySelectorAll<HTMLElement>("[data-theme-label]");
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');

  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  buttons.forEach((button) => {
    button.setAttribute(
      "aria-label",
      theme === "dark" ? "Switch to light theme" : "Switch to dark theme",
    );
  });
  labels.forEach((label) => {
    label.textContent = theme === "dark" ? "Light mode" : "Dark mode";
  });
  meta?.setAttribute("content", theme === "dark" ? "#07090a" : "#f3f0e9");

  icons.forEach((icon) => icon.morphTo(theme === "dark" ? Sun : Moon, "bouncy"));

  if (persist) {
    localStorage.setItem(themeStorageKey, theme);
  }
};

const setupAppBar = async () => {
  await customElements.whenDefined("morph-icon");

  const themeButtons = document.querySelectorAll<HTMLButtonElement>("[data-theme-toggle]");
  const menuButton = document.querySelector<HTMLButtonElement>("[data-menu-toggle]");
  const menu = document.querySelector<HTMLDialogElement>("#mobile-navigation");
  const themeIcons = document.querySelectorAll<MorphIconElement>("[data-theme-icon]");
  const searchButtons = document.querySelectorAll<HTMLButtonElement>("[data-search-toggle]");
  const searchDialog = document.querySelector<HTMLDialogElement>("#site-search");
  const searchInput = document.querySelector<HTMLInputElement>("[data-search-input]");
  const searchResults = Array.from(
    document.querySelectorAll<HTMLElement>("[data-search-result]"),
  ).map((element) => ({
    element,
    title: element.dataset.searchTitle ?? "",
    metadata: element.dataset.searchMetadata ?? "",
    description: element.dataset.searchDescription ?? "",
  }));
  const searchEntries = createSearchIndex(searchResults);
  const searchEmpty = document.querySelector<HTMLElement>("[data-search-empty]");
  const soundButton = document.querySelector<HTMLButtonElement>("[data-sound-toggle]");
  const soundIcons = document.querySelectorAll<MorphIconElement>("[data-sound-icon]");
  const soundLabel = document.querySelector<HTMLElement>("[data-sound-label]");
  const soundVolume = document.querySelector<HTMLInputElement>("[data-sound-volume]");
  const soundVolumeOutput = document.querySelector<HTMLOutputElement>("[data-sound-volume-output]");
  const mobileBreakpoint = window.matchMedia("(max-width: 768px)");
  const initialTheme = document.documentElement.dataset.theme === "light" ? "light" : "dark";

  setTheme(initialTheme, false);
  themeIcons.forEach((icon) => icon.set(initialTheme === "dark" ? Sun : Moon));

  const updateSoundControls = (animateIcon = false) => {
    const preference = readSoundPreference();
    soundButton?.setAttribute("aria-pressed", String(preference.enabled));
    if (soundLabel) soundLabel.textContent = preference.enabled ? "On" : "Off";
    soundIcons.forEach((icon) => {
      const nextIcon = preference.enabled ? Volume2 : VolumeX;
      if (animateIcon) icon.morphTo(nextIcon, "bouncy");
      else icon.set(nextIcon);
    });
    if (soundVolume) {
      soundVolume.value = String(Math.round(preference.volume * 100));
      soundVolume.style.setProperty("--sound-volume", `${soundVolume.value}%`);
    }
    if (soundVolumeOutput) soundVolumeOutput.value = `${Math.round(preference.volume * 100)}%`;
  };
  updateSoundControls();

  soundButton?.addEventListener("click", () => {
    const enabled = !readSoundPreference().enabled;
    void setSoundEnabled(enabled).then((ready) => {
      if (ready) playInteractionSound("toggle-on");
    });
    updateSoundControls(true);
  });

  soundVolume?.addEventListener("input", () => {
    setSoundVolume(Number(soundVolume.value) / 100);
    soundVolume.style.setProperty("--sound-volume", `${soundVolume.value}%`);
    if (soundVolumeOutput) soundVolumeOutput.value = `${soundVolume.value}%`;
    playInteractionSound("volume-change", { retrigger: "restart", cooldownMs: 75 });
  });

  const toggleTheme = async (button: HTMLButtonElement) => {
    const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";

    if (!document.startViewTransition) {
      setTheme(nextTheme, true);
      playInteractionSound(nextTheme === "light" ? "toggle-on" : "toggle-off");
      return;
    }

    const transition = document.startViewTransition(() => {
      setTheme(nextTheme, true);
      playInteractionSound(nextTheme === "light" ? "toggle-on" : "toggle-off");
    });

    try {
      await transition.ready;
    } catch {
      return;
    }

    const { top, left, width, height } = button.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const maxRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );

    document.documentElement.animate(
      {
        clipPath: [
          `circle(0 at ${x}px ${y}px)`,
          `circle(${maxRadius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration: 500,
        easing: "ease-in-out",
        pseudoElement: "::view-transition-new(root)",
      },
    );
  };

  themeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      void toggleTheme(button);
    });
  });

  menuButton?.addEventListener("click", () => {
    if (!menu || menu.open) return;
    menu.showModal();
    menuButton.setAttribute("aria-expanded", "true");
  });

  menu?.addEventListener("close", () => {
    menuButton?.setAttribute("aria-expanded", "false");
  });

  mobileBreakpoint.addEventListener("change", ({ matches }) => {
    if (!matches && menu?.open) menu.close();
  });

  menu?.addEventListener("click", (event) => {
    if (event.target !== menu) return;

    const bounds = menu.getBoundingClientRect();
    const inside =
      event.clientX >= bounds.left &&
      event.clientX <= bounds.right &&
      event.clientY >= bounds.top &&
      event.clientY <= bounds.bottom;
    if (!inside) menu.close();
  });

  const filterSearchResults = () => {
    const matches = new Set(searchIndex(searchEntries, searchInput?.value ?? ""));
    let visibleCount = 0;

    searchResults.forEach((result) => {
      const visible = matches.has(result);
      result.element.hidden = !visible;
      if (visible) visibleCount += 1;
    });

    if (searchEmpty) searchEmpty.hidden = visibleCount > 0;
  };

  const openSearch = () => {
    if (!searchDialog) return;
    if (menu?.open) menu.close();
    if (!searchDialog.open) searchDialog.showModal();
    searchInput?.focus();
  };

  searchButtons.forEach((button) => button.addEventListener("click", openSearch));
  searchInput?.addEventListener("input", filterSearchResults);
  searchDialog?.addEventListener("close", () => {
    if (searchInput) searchInput.value = "";
    filterSearchResults();
  });
  searchDialog?.addEventListener("click", (event) => {
    if (event.target === searchDialog) searchDialog.close();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key.toLowerCase() !== "k" || (!event.metaKey && !event.ctrlKey)) return;
    event.preventDefault();
    openSearch();
  });
};

setupAppBar();
