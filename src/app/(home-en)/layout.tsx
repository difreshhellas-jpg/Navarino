import type { ReactNode } from "react";
import { Shell, pageMetadata, viewport } from "@/components/Shell";

export const metadata = pageMetadata("en");
export { viewport };

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <Shell lang="en">
      {children}
    </Shell>
  );
}
