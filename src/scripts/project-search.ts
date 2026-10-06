import { ChevronDown, ChevronUp, LoaderCircle, Search } from "lucide";
import type { MorphIconElement } from "morphicons/element";

export interface ProjectSearchState {
  query: string;
  projectType: string[];
  platform: string[];
  stack: string[];
}

declare global {
  interface HTMLElementEventMap {
    "project-search:change": CustomEvent<ProjectSearchState>;
    "project-search:loading": CustomEvent<boolean>;
  }
}

const setupProjectSearch = async () => {
  await customElements.whenDefined("morph-icon");

  const toolbar = document.querySelector<HTMLElement>("[data-project-search-toolbar]");
  const form = toolbar?.querySelector<HTMLFormElement>("form");
  const input = toolbar?.querySelector<HTMLInputElement>("[data-project-search-input]");
  const icon = toolbar?.querySelector<MorphIconElement>("[data-project-search-icon]");
  const status = toolbar?.querySelector<HTMLElement>("[data-project-search-status]");
  const dropdown = toolbar?.querySelector<HTMLDetailsElement>("[data-project-search-dropdown]");
  const menu = toolbar?.querySelector<HTMLElement>(".project-search__menu");
  const summary = dropdown?.querySelector<HTMLElement>("summary");
  const chevron = toolbar?.querySelector<MorphIconElement>("[data-project-filter-chevron]");
  const badge = toolbar?.querySelector<HTMLElement>("[data-project-filter-badge]");
  const count = toolbar?.querySelector<HTMLOutputElement>("[data-project-filter-count]");
  const clear = toolbar?.querySelector<HTMLButtonElement>("[data-project-filter-clear]");
  const filters = toolbar?.querySelectorAll<HTMLInputElement>("[data-project-filter]");

  if (!toolbar || !form || !input || !icon || !status || !dropdown || !menu || !summary || !chevron || !badge || !count || !clear || !filters) return;

  let debounceTimer: number | undefined;
  let loading = false;
  let resultStatus = "";

  const updateLoading = () => {
    const busy = loading || debounceTimer !== undefined;
    if (toolbar.getAttribute("aria-busy") !== String(busy)) {
      toolbar.setAttribute("aria-busy", String(busy));
      icon.set(busy ? LoaderCircle : Search);
    }
    status.textContent = busy ? "Updating search..." : resultStatus;
  };

  const emitChange = () => {
    window.clearTimeout(debounceTimer);
    debounceTimer = undefined;
    updateLoading();
    const selected = Array.from(filters).filter((filter) => filter.checked);
    const selectedCount = selected.length;
    toolbar.dataset.filterCount = String(selectedCount);
    badge.hidden = selectedCount === 0;
    badge.textContent = String(selectedCount);
    count.value = String(selectedCount);
    clear.disabled = selectedCount === 0;
    summary.setAttribute("aria-label", selectedCount === 0 ? "Select Tag" : `Select Tag, ${selectedCount} active ${selectedCount === 1 ? "filter" : "filters"}`);
    toolbar.dispatchEvent(new CustomEvent<ProjectSearchState>("project-search:change", {
      bubbles: true,
      detail: {
        query: input.value.trim(),
        projectType: selected.filter((filter) => filter.name === "projectType").map((filter) => filter.value),
        platform: selected.filter((filter) => filter.name === "platform").map((filter) => filter.value),
        stack: selected.filter((filter) => filter.name === "stack").map((filter) => filter.value),
      },
    }));
  };

  const updateMenuHeight = () => {
    if (!dropdown.open) return;
    const bounds = dropdown.getBoundingClientRect();
    const styles = getComputedStyle(toolbar);
    const gutter = parseFloat(styles.getPropertyValue("--page-gutter"));
    const headerHeight = parseFloat(styles.getPropertyValue("--header-height"));
    const below = window.innerHeight - bounds.bottom - 12 - gutter;
    const above = bounds.top - headerHeight - 12 - gutter;
    const placeAbove = below < 240 && above > below;
    menu.dataset.placement = placeAbove ? "above" : "below";
    menu.style.setProperty("--project-search-menu-height", `${Math.max(160, placeAbove ? above : below)}px`);
  };

  input.addEventListener("input", (event) => {
    window.clearTimeout(debounceTimer);
    debounceTimer = undefined;
    if (!event.isComposing) debounceTimer = window.setTimeout(emitChange, 300);
    updateLoading();
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    emitChange();
  });
  filters.forEach((filter) => filter.addEventListener("change", emitChange));
  clear.addEventListener("click", () => {
    filters.forEach((filter) => { filter.checked = false; });
    emitChange();
  });
  dropdown.addEventListener("toggle", () => {
    updateMenuHeight();
    chevron.morphTo(dropdown.open ? ChevronUp : ChevronDown, "smooth");
  });
  window.addEventListener("resize", updateMenuHeight);
  document.addEventListener("scroll", updateMenuHeight, { passive: true });

  toolbar.addEventListener("project-search:loading", ({ detail }) => {
    loading = detail;
    updateLoading();
  });

  document.addEventListener("click", (event) => {
    if (event.target instanceof Node && !dropdown.contains(event.target)) dropdown.open = false;
  });
  dropdown.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !dropdown.open) return;
    event.preventDefault();
    dropdown.open = false;
    summary.focus();
  });

  const grid = document.querySelector<HTMLElement>("[data-project-grid]");
  const list = grid?.querySelector<HTMLElement>("[data-project-list]");
  const empty = grid?.querySelector<HTMLElement>("[data-project-empty]");

  if (grid && list && empty) {
    const projects = Array.from(grid.querySelectorAll<HTMLElement>("[data-project-item]")).map((item) => ({
      item,
      search: (item.dataset.projectSearch ?? "").toLowerCase().replace(/\s+/g, " "),
      projectType: item.dataset.projectType,
      platform: (item.dataset.projectPlatform ?? "").split(" · "),
      stack: (item.dataset.projectStack ?? "").split(" "),
    }));

    toolbar.addEventListener("project-search:change", ({ detail }) => {
      const terms = detail.query.toLowerCase().split(/\s+/).filter(Boolean);
      let resultCount = 0;
      projects.forEach((project) => {
        const matches = terms.every((term) => project.search.includes(term))
          && (detail.projectType.length === 0 || detail.projectType.some((value) => value === project.projectType))
          && (detail.platform.length === 0 || detail.platform.some((value) => project.platform.includes(value)))
          && (detail.stack.length === 0 || detail.stack.some((value) => project.stack.includes(value)));
        project.item.hidden = !matches;
        if (matches) resultCount++;
      });
      list.hidden = resultCount === 0;
      empty.hidden = resultCount !== 0;
      resultStatus = resultCount === 0 ? "No projects found." : `${resultCount} ${resultCount === 1 ? "project" : "projects"} found.`;
      updateLoading();
    });
  }

  window.addEventListener("pageshow", emitChange);
  emitChange();
};

void setupProjectSearch();
