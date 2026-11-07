import type { CSSProperties } from "react";
import { alt as altFor, largest, photo, srcset } from "@/lib/photos";
import type { Lang } from "@/lib/i18n";

type Props = {
  id: string;
  lang: Lang;
  /** The rendered width, for the browser to choose from the srcset. */
  sizes: string;
  className?: string;
  imgClassName?: string;
  /** Hero / above-the-fold: high priority, eager. */
  priority?: boolean;
  /** Images inside pinned sections load eagerly so pin measurements hold. */
  eager?: boolean;
  /** Decorative (alt=""), e.g. a duplicate of an image described nearby. */
  decorative?: boolean;
  /** object-position, e.g. "50% 30%". */
  focus?: string;
  style?: CSSProperties;
};

/**
 * A <picture> with AVIF + WebP srcsets from scripts/images.mjs. Width and
 * height are the photo's real size, so the browser reserves the space (no
 * layout shift); the dominant colour paints underneath while it loads.
 */
export function Photo({ id, lang, sizes, className, imgClassName, priority, eager, decorative, focus, style }: Props) {
  const m = photo(id);
  return (
    <picture className={className} style={{ ["--ph" as string]: m.color, ...style }}>
      <source type="image/avif" srcSet={srcset(id, "avif")} sizes={sizes} />
      <source type="image/webp" srcSet={srcset(id, "webp")} sizes={sizes} />
      <img
        src={largest(id, "webp", 960)}
        width={m.w}
        height={m.h}
        alt={decorative ? "" : altFor(id, lang)}
        loading={priority || eager ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        fetchPriority={priority ? "high" : undefined}
        className={imgClassName}
        style={focus ? { objectPosition: focus } : undefined}
      />
    </picture>
  );
}
