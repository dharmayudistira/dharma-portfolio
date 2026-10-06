import { ChevronDown, ChevronUp, LoaderCircle, Search } from "lucide";
import type { MorphIconElement } from "morphicons/element";

export interface ProjectSearchState {
  query: string;
  projectType: string[];
  platform: string[];
  stack: string[];
}

export interface BlogSearchState {
  query: string;
  category: string[];
  tags: string[];
}

interface FilterDropdown {
  element: HTMLDetailsElement;
  summary: HTMLElement;
  chevron: MorphIconElement;
  placeholder: HTMLElement;
  chips: HTMLElement;
  clear: HTMLButtonElement;
  filters: HTMLInputElement[];
  label: string;
}

declare global {
  interface HTMLElementEventMap {
    "project-search:change": CustomEvent<ProjectSearchState>;
    "project-search:loading": CustomEvent<boolean>;
    "blog-search:change": CustomEvent<BlogSearchState>;
    "blog-search:loading": CustomEvent<boolean>;
  }
}

const setupIndexSearch = async () => {
  await customElements.whenDefined("morph-icon");

  const toolbar = document.querySelector<HTMLElement>("[data-index-search-toolbar]");
  const form = toolbar?.querySelector<HTMLFormElement>("form");
  const input = toolbar?.querySelector<HTMLInputElement>("[data-index-search-input]");
  const icon = toolbar?.querySelector<MorphIconElement>("[data-index-search-icon]");
  const status = toolbar?.querySelector<HTMLElement>("[data-index-search-status]");
  const popup = toolbar?.querySelector<HTMLDetailsElement>("[data-index-filter-popup]");
  const summary = popup?.querySelector<HTMLElement>(":scope > summary");
  const menu = popup?.querySelector<HTMLElement>(".index-search__menu");
  const groupList = menu?.querySelector<HTMLElement>(".index-search__groups");
  const chevron = summary?.querySelector<MorphIconElement>("[data-index-filter-chevron]");
  const badge = summary?.querySelector<HTMLElement>("[data-index-filter-badge]");
  const dropdownElements = toolbar?.querySelectorAll<HTMLDetailsElement>("[data-index-search-dropdown]");
  const count = toolbar?.querySelector<HTMLOutputElement>("[data-index-filter-count]");
  const clear = toolbar?.querySelector<HTMLButtonElement>("[data-index-filter-clear]");
  const filters = toolbar?.querySelectorAll<HTMLInputElement>("[data-index-filter]");

  if (!toolbar || !form || !input || !icon || !status || !popup || !summary || !menu || !groupList || !chevron || !badge || !dropdownElements?.length || !count || !clear || !filters) return;

  const dropdowns: FilterDropdown[] = [];
  for (const element of dropdownElements) {
    const summary = element.querySelector<HTMLElement>("summary");
    const chevron = element.querySelector<MorphIconElement>("[data-index-group-chevron]");
    const placeholder = element.querySelector<HTMLElement>("[data-index-filter-placeholder]");
    const chips = element.querySelector<HTMLElement>("[data-index-filter-chips]");
    const clear = element.parentElement?.querySelector<HTMLButtonElement>("[data-index-group-clear]");
    const label = element.dataset.filterLabel;
    if (!summary || !chevron || !placeholder || !chips || !clear || !label) return;
    dropdowns.push({ element, summary, chevron, placeholder, chips, clear, filters: Array.from(element.querySelectorAll<HTMLInputElement>("[data-index-filter]")), label });
  }

  const isBlog = toolbar.dataset.searchCollection === "blog";
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
    summary.setAttribute("aria-label", selectedCount === 0 ? "Select filters" : `Select filters, ${selectedCount} active ${selectedCount === 1 ? "filter" : "filters"}`);
    count.value = String(selectedCount);
    clear.disabled = selectedCount === 0;
    dropdowns.forEach(({ element, summary, placeholder, chips, clear, filters, label }) => {
      const selectedLabels = filters.filter((filter) => filter.checked).map((filter) => filter.labels?.[0]?.textContent?.trim() ?? filter.value);
      const groupCount = selectedLabels.length;
      element.dataset.filterCount = String(groupCount);
      placeholder.hidden = groupCount !== 0;
      chips.hidden = groupCount === 0;
      clear.hidden = groupCount === 0;
      summary.setAttribute("aria-label", groupCount === 0 ? `Select ${label}` : `Select ${label}, ${groupCount} selected: ${selectedLabels.join(", ")}`);
      const visibleChips = selectedLabels.slice(0, 2).map((label) => {
        const chip = document.createElement("span");
        chip.className = "index-search__chip";
        chip.textContent = label;
        chip.title = label;
        return chip;
      });
      if (groupCount > 2) {
        const more = document.createElement("span");
        more.className = "index-search__chip index-search__chip--more";
        more.textContent = `+${groupCount - 2}`;
        more.title = selectedLabels.slice(2).join(", ");
        visibleChips.push(more);
      }
      chips.replaceChildren(...visibleChips);
    });
    updateMenu();
    if (isBlog) {
      toolbar.dispatchEvent(new CustomEvent<BlogSearchState>("blog-search:change", {
        bubbles: true,
        detail: {
          query: input.value.trim(),
          category: selected.filter((filter) => filter.name === "category").map((filter) => filter.value),
          tags: selected.filter((filter) => filter.name === "tags").map((filter) => filter.value),
        },
      }));
      return;
    }
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

  const updateMenu = () => {
    if (!popup.open) return;
    const styles = getComputedStyle(toolbar);
    const gutter = parseFloat(styles.getPropertyValue("--page-gutter"));
    const headerHeight = parseFloat(styles.getPropertyValue("--header-height"));
    const bounds = popup.getBoundingClientRect();
    const below = window.innerHeight - bounds.bottom - 8 - gutter;
    const above = bounds.top - headerHeight - 8 - gutter;
    const contentHeight = menu.scrollHeight + groupList.scrollHeight - groupList.clientHeight;
    const placeAbove = below < Math.min(640, contentHeight) && above > below;
    const left = Math.max(gutter, Math.min(bounds.left, window.innerWidth - gutter - menu.offsetWidth));
    menu.dataset.placement = placeAbove ? "above" : "below";
    menu.style.setProperty("--index-search-menu-height", `${Math.max(0, placeAbove ? above : below)}px`);
    menu.style.setProperty("--index-search-menu-offset", `${left - bounds.left}px`);
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
    dropdowns[0]?.summary.focus();
  });
  dropdowns.forEach(({ element, summary, chevron, clear, filters }) => {
    element.addEventListener("toggle", () => {
      if (element.open) dropdowns.forEach((other) => { if (other.element !== element) other.element.open = false; });
      updateMenu();
      chevron.morphTo(element.open ? ChevronUp : ChevronDown, "smooth");
    });
    clear.addEventListener("click", () => {
      filters.forEach((filter) => { filter.checked = false; });
      emitChange();
      summary.focus();
    });
  });
  popup.addEventListener("toggle", () => {
    if (!popup.open) dropdowns.forEach(({ element }) => { element.open = false; });
    updateMenu();
    chevron.morphTo(popup.open ? ChevronUp : ChevronDown, "smooth");
  });
  popup.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !popup.open) return;
    event.preventDefault();
    event.stopPropagation();
    const expanded = dropdowns.find(({ element }) => element.open);
    if (expanded) {
      expanded.element.open = false;
      expanded.summary.focus();
    } else {
      popup.open = false;
      summary.focus();
    }
  });
  window.addEventListener("resize", updateMenu);
  document.addEventListener("scroll", updateMenu, { passive: true, capture: true });

  toolbar.addEventListener("project-search:loading", ({ detail }) => {
    loading = detail;
    updateLoading();
  });

  toolbar.addEventListener("blog-search:loading", ({ detail }) => {
    loading = detail;
    updateLoading();
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Node)) return;
    if (!popup.contains(target)) popup.open = false;
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

  const blogResults = document.querySelector<HTMLElement>("[data-blog-results]");
  const blogList = blogResults?.querySelector<HTMLElement>("[data-blog-list]");
  const blogEmpty = blogResults?.querySelector<HTMLElement>("[data-blog-empty]");

  if (blogResults && blogList && blogEmpty) {
    const posts = Array.from(blogResults.querySelectorAll<HTMLElement>("[data-blog-item]")).map((item) => ({
      item,
      search: (item.dataset.blogSearch ?? "").toLowerCase().replace(/\s+/g, " "),
      category: item.dataset.blogCategory,
      tags: (item.dataset.blogTags ?? "").split(" "),
    }));

    toolbar.addEventListener("blog-search:change", ({ detail }) => {
      const terms = detail.query.toLowerCase().split(/\s+/).filter(Boolean);
      let resultCount = 0;
      posts.forEach((post) => {
        const matches = terms.every((term) => post.search.includes(term))
          && (detail.category.length === 0 || detail.category.some((value) => value === post.category))
          && (detail.tags.length === 0 || detail.tags.some((value) => post.tags.includes(value)));
        post.item.hidden = !matches;
        if (matches) resultCount++;
      });
      blogList.hidden = resultCount === 0;
      blogEmpty.hidden = resultCount !== 0;
      resultStatus = resultCount === 0 ? "No blogs found." : `${resultCount} ${resultCount === 1 ? "blog" : "blogs"} found.`;
      updateLoading();
    });
  }

  window.addEventListener("pageshow", emitChange);
  emitChange();
};

void setupIndexSearch();
