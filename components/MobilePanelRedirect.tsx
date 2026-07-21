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
    window.sessionStorage.removeItem(
      "permutas-desktop-view"
    );

    if (pathname !== "/panel") {
      return;
    }

    const desktopRequested =
      searchParams.get("vista") ===
      "escritorio";

    if (desktopRequested) {
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
