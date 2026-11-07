import { ease, gsap, q, qa, type Effect } from "../motion";

/**
 * Gallery lightbox on a native <dialog>: focus is trapped and returned by the
 * browser, Esc closes it, arrows and swipes move between photos, and a live
 * region announces "photo n of N". Smooth scroll is paused while it is open.
 */
export const gallery: Effect = (ctx) => {
  const dlg = q<HTMLDialogElement>("[data-fx='lightbox']");
  const items = qa<HTMLButtonElement>("[data-lightbox-index]");
  if (!dlg || !items.length) return;

  const pic = q("picture", dlg)!;
  const srcAvif = q<HTMLSourceElement>("source[type='image/avif']", pic)!;
  const srcWebp = q<HTMLSourceElement>("source[type='image/webp']", pic)!;
  const img = q<HTMLImageElement>("img", pic)!;
  const cap = q(".lb__caption", dlg)!;
  const count = q(".lb__count", dlg)!;
  const tpl = count.dataset.template ?? "{n} / {total}";
  let index = 0;
  let opener: HTMLElement | null = null;

  const show = (i: number, dir = 0) => {
    index = (i + items.length) % items.length;
    const b = items[index];
    const swap = () => {
      srcAvif.srcset = b.dataset.avif!;
      srcWebp.srcset = b.dataset.webp!;
      img.src = b.dataset.src!;
      img.width = Number(b.dataset.w);
      img.height = Number(b.dataset.h);
      img.alt = b.dataset.alt!;
      cap.textContent = b.dataset.alt!;
      count.textContent = tpl.replace("{n}", String(index + 1)).replace("{total}", String(items.length));
    };
    if (ctx.reduce || dir === 0) {
      swap();
      if (!ctx.reduce) gsap.fromTo(pic, { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.5, ease: ease.out });
      return;
    }
    gsap.to(pic, {
      opacity: 0,
      x: -24 * dir,
      duration: 0.18,
      ease: "power2.out",
      onComplete: () => {
        swap();
        gsap.fromTo(pic, { opacity: 0, x: 24 * dir }, { opacity: 1, x: 0, duration: 0.45, ease: ease.out });
      },
    });
  };

  const open = (e: Event) => {
    opener = e.currentTarget as HTMLElement;
    show(parseInt(opener.dataset.lightboxIndex!, 10));
    dlg.showModal();
    ctx.stopScroll();
  };
  const onClose = () => {
    ctx.startScroll();
    opener?.focus({ preventScroll: true });
  };
  const prev = () => show(index - 1, -1);
  const next = () => show(index + 1, 1);
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
  };
  // Click on the backdrop (the dialog itself, outside its content) closes.
  const onBackdrop = (e: MouseEvent) => e.target === dlg && dlg.close();

  let sx = 0;
  let sy = 0;
  const ts = (e: TouchEvent) => {
    sx = e.touches[0].clientX;
    sy = e.touches[0].clientY;
  };
  const te = (e: TouchEvent) => {
    const dx = e.changedTouches[0].clientX - sx;
    const dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.4) (dx < 0 ? next : prev)();
  };

  items.forEach((b) => b.addEventListener("click", open));
  q("[data-lb='prev']", dlg)?.addEventListener("click", prev);
  q("[data-lb='next']", dlg)?.addEventListener("click", next);
  q("[data-lb='close']", dlg)?.addEventListener("click", () => dlg.close());
  dlg.addEventListener("close", onClose);
  dlg.addEventListener("keydown", onKey);
  dlg.addEventListener("click", onBackdrop);
  dlg.addEventListener("touchstart", ts, { passive: true });
  dlg.addEventListener("touchend", te, { passive: true });

  return () => {
    items.forEach((b) => b.removeEventListener("click", open));
    dlg.removeEventListener("close", onClose);
    dlg.removeEventListener("keydown", onKey);
    dlg.removeEventListener("click", onBackdrop);
    dlg.removeEventListener("touchstart", ts);
    dlg.removeEventListener("touchend", te);
  };
};
