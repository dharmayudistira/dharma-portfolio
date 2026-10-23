import { LoaderCircle, Search } from "lucide";
import type { MorphIconElement } from "morphicons/element";
import { createSearchIndex, searchIndex } from "./search-matching";

const setupIndexSearch = (toolbar: HTMLElement) => {
  const form = toolbar.querySelector<HTMLFormElement>("form");
  const input = toolbar.querySelector<HTMLInputElement>("[data-index-search-input]");
  const icon = toolbar.querySelector<MorphIconElement>("[data-index-search-icon]");
  const status = toolbar.querySelector<HTMLElement>("[data-index-search-status]");
  const itemKind = toolbar.dataset.searchCollection === "blog" ? "blog" : "project";
  const list = document.querySelector<HTMLElement>(`[data-${itemKind}-list]`);
  const empty = document.querySelector<HTMLElement>(`[data-${itemKind}-empty]`);
  if (!form || !input || !status || !list || !empty) return;

  const items = Array.from(list.querySelectorAll<HTMLElement>(`[data-${itemKind}-item]`)).map((element) => ({
    element,
    title: element.dataset.searchTitle ?? "",
    metadata: element.dataset.searchMetadata ?? "",
    description: element.dataset.searchDescription ?? "",
  }));
  const index = createSearchIndex(items);
  let debounceTimer: number | undefined;
  let composing = false;

  const setBusy = (busy: boolean) => {
    toolbar.setAttribute("aria-busy", String(busy));
    if (typeof icon?.set === "function") icon.set(busy ? LoaderCircle : Search);
  };

  const updateResults = () => {
    window.clearTimeout(debounceTimer);
    debounceTimer = undefined;
    const results = searchIndex(index, input.value);
    const visible = new Set(results);
    items.forEach((item) => { item.element.hidden = !visible.has(item); });
    // Move the existing results so visual order and keyboard order agree.
    results.forEach(({ element }) => list.append(element));
    list.hidden = results.length === 0;
    empty.hidden = results.length > 0;
    const noun = itemKind === "blog" ? "post" : "project";
    status.textContent = `${results.length} ${noun}${results.length === 1 ? "" : "s"} found`;
    setBusy(false);
  };

  const scheduleSearch = () => {
    window.clearTimeout(debounceTimer);
    if (input.value.length === 0) {
      updateResults();
      return;
    }
    setBusy(true);
    debounceTimer = window.setTimeout(updateResults, 150);
  };

  const clearSearch = () => {
    input.value = "";
    input.focus();
    updateResults();
  };

  input.addEventListener("compositionstart", () => {
    composing = true;
    window.clearTimeout(debounceTimer);
    setBusy(false);
  });
  input.addEventListener("compositionend", () => {
    composing = false;
    scheduleSearch();
  });
  input.addEventListener("input", () => {
    if (!composing) scheduleSearch();
  });
  input.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || composing) return;
    event.preventDefault();
    clearSearch();
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!composing) updateResults();
  });
  window.addEventListener("pageshow", updateResults);
  updateResults();
};

document.querySelectorAll<HTMLElement>("[data-index-search-toolbar]").forEach(setupIndexSearch);
