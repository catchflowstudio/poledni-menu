"use client";

import { useEffect } from "react";

interface Props {
  visible: boolean;
}

/**
 * Posílá postMessage rodičovské stránce (pokud jsme v iframe)
 * o tom, jestli se má sekce menu zobrazit nebo skrýt.
 */
export function MenuVisibility({ visible }: Props) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.parent === window) return; // nejsme v iframe

    window.parent.postMessage(
      { type: "menu-visibility", visible },
      "*"
    );
  }, [visible]);

  return null;
}
