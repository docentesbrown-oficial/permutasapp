"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const PID_EXAMPLE =
  "Ej: MG / PR / PLG / MTM / BLG";

export function PidFieldFix() {
  const pathname = usePathname();

  useEffect(() => {
    function updatePidFields() {
      const inputs =
        document.querySelectorAll<HTMLInputElement>(
          [
            'input[id="pid"]',
            'input[placeholder="Ej.: 123456"]',
            'input[placeholder="Ej: 123456"]',
          ].join(",")
        );

      inputs.forEach((input) => {
        if (
          input.placeholder !== PID_EXAMPLE
        ) {
          input.placeholder =
            PID_EXAMPLE;
        }

        if (
          input.inputMode !== "text"
        ) {
          input.inputMode = "text";
        }

        if (
          input.getAttribute(
            "autocapitalize"
          ) !== "characters"
        ) {
          input.setAttribute(
            "autocapitalize",
            "characters"
          );
        }

        if (
          input.getAttribute(
            "spellcheck"
          ) !== "false"
        ) {
          input.setAttribute(
            "spellcheck",
            "false"
          );
        }

        if (
          input.hasAttribute("pattern")
        ) {
          input.removeAttribute(
            "pattern"
          );
        }
      });
    }

    updatePidFields();

    const observer =
      new MutationObserver(() => {
        updatePidFields();
      });

    observer.observe(
      document.body,
      {
        childList: true,
        subtree: true,
      }
    );

    return () => {
      observer.disconnect();
    };
  }, [pathname]);

  return null;
}
