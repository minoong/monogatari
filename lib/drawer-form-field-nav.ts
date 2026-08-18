const DRAWER_FIELD_SELECTOR = [
  'input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"]):not([disabled])',
  "textarea:not([disabled])",
  'select:not([disabled])',
].join(",");

const DRAWER_AUXILIARY_SELECTOR = [
  "button:not([type=\"submit\"])",
  '[role="button"]:not(input):not(textarea):not(select)',
].join(",");

function isVisibleField(element: HTMLElement) {
  if (element.getAttribute("aria-hidden") === "true") return false;
  if (element.closest("[hidden],[aria-hidden='true']")) return false;
  const style = window.getComputedStyle(element);
  if (style.display === "none" || style.visibility === "hidden") return false;
  return element.getClientRects().length > 0;
}

function getDrawerFieldNavRoot(element: HTMLElement) {
  return element.closest("form") ?? element.closest("[data-slot=drawer-popup]") ?? element;
}

export function syncDrawerFormFieldNav(root: HTMLElement) {
  const scope = getDrawerFieldNavRoot(root);
  const fields = Array.from(scope.querySelectorAll<HTMLElement>(DRAWER_FIELD_SELECTOR))
    .filter((field) => !field.closest("[data-drawer-field-nav-exclude]") && isVisibleField(field));

  fields.forEach((field, index) => {
    field.dataset.drawerFieldNav = "true";
    field.tabIndex = index + 1;
  });

  scope.querySelectorAll<HTMLElement>(DRAWER_AUXILIARY_SELECTOR).forEach((control) => {
    if (fields.includes(control)) return;
    if (control.closest("[data-drawer-field-nav-exclude]")) return;
    control.dataset.drawerFieldNav = "aux";
    control.tabIndex = -1;
  });
}

export function restoreDrawerFormFieldNav(root: HTMLElement) {
  const scope = getDrawerFieldNavRoot(root);
  scope.querySelectorAll<HTMLElement>("[data-drawer-field-nav]").forEach((element) => {
    element.removeAttribute("tabindex");
    element.removeAttribute("data-drawer-field-nav");
  });
}

export function isDrawerTextField(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  if (target.matches(DRAWER_FIELD_SELECTOR)) return true;
  return Boolean(target.closest(DRAWER_FIELD_SELECTOR));
}
