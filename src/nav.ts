/**
 * Mobile menu (≤900px): a slide-in panel opened by the hamburger in the header.
 * Shared by the React home page (called after hydration) and the static guide/legal pages.
 * Accessibility: modal dialog semantics, focus moves in and is trapped, Esc / backdrop / link closes,
 * focus returns to the hamburger, closed panel is inert, page scroll is locked while open.
 */
export function initNav() {
  const toggle = document.querySelector<HTMLButtonElement>(".nav-toggle");
  const menu = document.getElementById("site-menu");
  const backdrop = document.querySelector<HTMLElement>(".menu-backdrop");
  if (!toggle || !menu || !backdrop || toggle.dataset.ready) return;
  toggle.dataset.ready = "1";
  const closeBtn = menu.querySelector<HTMLButtonElement>(".menu-close");
  const focusables = () => Array.from(menu.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"));
  let open = false;

  const set = (next: boolean, returnFocus = true) => {
    open = next;
    menu.classList.toggle("is-open", next);
    backdrop.classList.toggle("is-open", next);
    menu.toggleAttribute("inert", !next);
    menu.setAttribute("aria-hidden", String(!next));
    toggle.setAttribute("aria-expanded", String(next));
    document.documentElement.classList.toggle("menu-open", next);
    if (next) closeBtn?.focus();
    else if (returnFocus) toggle.focus();
  };

  toggle.addEventListener("click", () => set(true));
  closeBtn?.addEventListener("click", () => set(false));
  backdrop.addEventListener("click", () => set(false));
  // Following a link closes the menu; focus then follows the link (in-page anchor or new page).
  menu.addEventListener("click", (e) => {
    if ((e.target as Element).closest("a")) set(false, false);
  });
  document.addEventListener("keydown", (e) => {
    if (!open) return;
    if (e.key === "Escape") {
      e.preventDefault();
      set(false);
    } else if (e.key === "Tab") {
      const items = focusables();
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
  // Rotating or resizing to desktop width closes it (desktop shows the inline links).
  window.matchMedia("(min-width: 901px)").addEventListener("change", (m) => {
    if (m.matches && open) set(false, false);
  });
}
