import { gsap, q, qa, ScrollTrigger, type Effect } from "../motion";

/**
 * DISH SEQUENCE — the Navarino version of the Kyknos pita explosion.
 *
 * Same mechanics as kyknos-site/src/components/cinematic/HeroSequence.tsx:
 * one canvas (never N stacked images: one layer, no layer bomb), a tall
 * runway with a sticky stage, frame one painted first and alone, the rest
 * loaded in order behind it, and the scrubber always drawing the nearest
 * frame it actually holds. Here the progress comes from a ScrollTrigger scrub
 * rather than a raw scroll listener, so it stays in step with Lenis.
 *
 * Frames are optional. The component looks for <data-frames>frames.json:
 *   { "count": 120, "pad": 4, "formats": ["avif","webp"], "aspect": 1.7778,
 *     "mobile": { "count": 120, "aspect": 0.5625 } }      // mobile/ is optional
 * written next to frame-0001.avif … by the frame-extraction tool. Until it
 * exists, the still photo (food/027) stays up and the labels still animate.
 *
 * Labels: each <li data-at="0.3"> has a dot at (--x,--y) and a label at
 * (--lx,--ly), all in % of the media box; its hairline draws in over a short
 * window starting at `at`, then the label fades up.
 */
export const dishSequence: Effect = (ctx) => {
  const offs = qa("[data-fx='dish-sequence']").map((sec) => {
    const media = q(".dish__media", sec)!;
    const canvas = q<HTMLCanvasElement>(".dish__canvas", sec)!;
    const still = q(".dish__still", sec);
    const base = sec.dataset.frames ? sec.dataset.frames.replace(/\/?$/, "/") : null;
    const narrow = window.matchMedia("(max-width: 767px)").matches;

    let frames: (HTMLImageElement | null)[] = [];
    let count = 0;
    let current = -1;
    let stopped = false;
    let progress = 0;
    let mode: "still" | "frames" = "still";
    /** Which label set is live: the still photo, the 16:9 or the 9:16 video. */
    let labelSet: "still" | "frames" | "frames-mobile" = "still";

    // ---- labels -------------------------------------------------------
    const setLabels = (which: typeof labelSet) => {
      labelSet = which;
      qa<HTMLElement>(".dish__labels", sec).forEach((ul) => (ul.hidden = ul.dataset.set !== which));
    };
    setLabels("still");

    const labelTweens = () => {
      const ul = q(`.dish__labels[data-set='${labelSet}']`, sec);
      if (!ul) return null;
      const items = qa<HTMLElement>("li", ul);
      const tl = gsap.timeline({ paused: true });
      items.forEach((li) => {
        const at = parseFloat(li.dataset.at ?? "0.3");
        // The wrapper carries the CSS angle; GSAP only scales the ink inside,
        // so it never folds the `rotate` property into its own matrix.
        const rule = q(".dish__rule-ink", li);
        const dot = q(".dish__dot", li);
        const tag = q(".dish__tag", li);
        tl.fromTo(dot, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.04, ease: "power2.out" }, at)
          .fromTo(rule, { scaleX: 0 }, { scaleX: 1, duration: 0.08, ease: "power1.inOut" }, at + 0.02)
          .fromTo(tag, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.06, ease: "power2.out" }, at + 0.08);
      });
      tl.to({}, { duration: Math.max(0, 1 - tl.duration()) }); // timeline spans 0..1
      return tl;
    };
    let labels = labelTweens();

    // ---- canvas -------------------------------------------------------
    const c2d = canvas.getContext("2d", { alpha: false });
    const paint = (img: HTMLImageElement) => {
      if (!c2d) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = media.clientWidth;
      const h = media.clientHeight;
      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
      }
      // The media box already has the frame's aspect ratio, so cover == contain.
      const s = Math.max(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight);
      const dw = img.naturalWidth * s;
      const dh = img.naturalHeight * s;
      c2d.drawImage(img, (canvas.width - dw) / 2, (canvas.height - dh) / 2, dw, dh);
    };
    const nearest = (want: number) => {
      for (let d = 0; d < count; d++) {
        if (frames[want - d]) return frames[want - d];
        if (frames[want + d]) return frames[want + d];
      }
      return null;
    };
    const draw = () => {
      if (mode !== "frames" || !count) return;
      const want = Math.min(count - 1, Math.round(progress * (count - 1)));
      if (want === current) return;
      const img = nearest(want);
      if (img) {
        paint(img);
        current = want;
      }
    };

    // ---- scroll -------------------------------------------------------
    const st = ctx.reduce
      ? null
      : ScrollTrigger.create({
          trigger: sec,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.5,
          onUpdate(self) {
            progress = self.progress;
            labels?.progress(progress);
            draw();
          },
        });
    if (ctx.reduce) labels?.progress(1);

    // ---- frames (optional) -------------------------------------------
    type Manifest = { count: number; pad?: number; formats?: string[]; aspect?: number; mobile?: { count: number; aspect?: number } };
    const canDecode = (src: string) =>
      new Promise<boolean>((r) => {
        const i = new Image();
        i.onload = () => r(i.naturalWidth > 0);
        i.onerror = () => r(false);
        i.src = src;
      });

    (async () => {
      if (!base) return; // no frames at build time: the still photo stays
      let m: Manifest;
      try {
        const res = await fetch(`${base}frames.json`, { cache: "no-cache" });
        if (!res.ok) return; // no video yet: the still stays
        m = await res.json();
      } catch {
        return;
      }
      const useMobile = narrow && m.mobile?.count;
      const dir = useMobile ? `${base}mobile/` : base;
      count = useMobile ? m.mobile!.count : m.count;
      const aspect = (useMobile ? m.mobile!.aspect : m.aspect) ?? (useMobile ? 9 / 16 : 16 / 9);
      const pad = m.pad ?? 4;
      const url = (i: number, ext: string) => `${dir}frame-${String(i + 1).padStart(pad, "0")}.${ext}`;
      const formats = m.formats ?? ["avif", "webp"];
      let ext = formats[formats.length - 1];
      for (const f of formats) if (await canDecode(url(0, f))) { ext = f; break; }
      if (stopped) return;

      frames = new Array(count).fill(null);
      const load = (i: number) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.decoding = "async";
          img.onload = () => {
            frames[i] = img;
            resolve();
          };
          img.onerror = () => resolve();
          img.src = url(i, ext);
        });

      await load(0);
      if (stopped || !frames[0]) return;
      mode = "frames";
      sec.classList.add("has-frames");
      media.style.setProperty("--dish-aspect", String(aspect));
      setLabels(useMobile ? "frames-mobile" : "frames");
      labels?.kill();
      labels = labelTweens();
      labels?.progress(ctx.reduce ? 1 : progress);
      if (still) gsap.to(still, { opacity: 0, duration: 0.6, onComplete: () => still.setAttribute("hidden", "") });
      ScrollTrigger.refresh();
      paint(frames[0]);
      current = 0;
      if (ctx.reduce) {
        // Reduced motion: hold the composed "all floating" frame, still.
        const mid = Math.round((count - 1) * 0.75);
        await load(mid);
        if (frames[mid]) paint(frames[mid]!);
        return;
      }
      for (let i = 1; i < count; i++) {
        if (stopped) return;
        await load(i);
        if (i % 12 === 0) draw();
      }
      current = -1;
      draw();
    })();

    const onResize = () => {
      const img = frames[Math.max(0, current)] ?? frames[0];
      if (mode === "frames" && img) paint(img);
    };
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      stopped = true;
      st?.kill();
      labels?.kill();
      window.removeEventListener("resize", onResize);
    };
  });
  return () => offs.forEach((o) => o());
};
