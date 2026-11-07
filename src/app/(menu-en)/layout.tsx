import type { ReactNode } from "react";
import { Shell, pageMetadata, viewport } from "@/components/Shell";

export const metadata = pageMetadata("en", "menu");
export { viewport };

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <Shell lang="en" route="menu">
      {children}
    </Shell>
  );
}
