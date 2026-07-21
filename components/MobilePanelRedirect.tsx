"use client";

import { useEffect } from "react";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

export function MobilePanelRedirect() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname !== "/panel") {
      return;
    }

    const desktopRequested =
      searchParams.get("vista") ===
      "escritorio";

    if (desktopRequested) {
      window.sessionStorage.setItem(
        "permutas-desktop-view",
        "true"
      );

      return;
    }

    const desktopViewSaved =
      window.sessionStorage.getItem(
        "permutas-desktop-view"
      ) === "true";

    if (desktopViewSaved) {
      return;
    }

    const isMobile =
      window.matchMedia(
        "(max-width: 767px)"
      ).matches;

    if (isMobile) {
      router.replace(
        "/panel/movil"
      );
    }
  }, [
    pathname,
    router,
    searchParams,
  ]);

  return null;
}
