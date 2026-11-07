import type { ReactNode } from "react";
import { Shell, pageMetadata, viewport } from "@/components/Shell";

export const metadata = pageMetadata("el");
export { viewport };

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <Shell lang="el">
      {children}
    </Shell>
  );
}
