import el from "@content/el.json";
import en from "@content/en.json";

export type Lang = "el" | "en";
export type Dict = typeof el;

const dicts: Record<Lang, Dict> = { el, en: en as unknown as Dict };

export const getDict = (lang: Lang): Dict => dicts[lang];
export const other = (lang: Lang): Lang => (lang === "el" ? "en" : "el");

/** Site-relative path for a route in a language. Greek is the root. */
export function href(lang: Lang, route: "" | "menu" = ""): string {
  const base = lang === "el" ? "/" : "/en/";
  return route ? `${base}${route}/` : base;
}

/** "{opens}" style interpolation for the few strings that need it. */
export function fill(s: string, vars: Record<string, string | number>): string {
  return s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
}

export const htmlLang: Record<Lang, string> = { el: "el", en: "en" };
export const ogLocale: Record<Lang, string> = { el: "el_GR", en: "en_GB" };
