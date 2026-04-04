"use client";

import { useEffect } from "react";

interface Props {
  visible: boolean;
  menuDate?: string; // formátované české datum
}

/**
 * Posílá postMessage rodičovské stránce:
 * - menu-visibility: zda se má sekce zobrazit
 * - menu-date: formátovaný datum menu
 * - menu-resize: výška obsahu iframe (pro auto-sizing)
 */
export function MenuFrameSync({ visible, menuDate }: Props) {
  // Viditelnost + datum
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.parent === window) return;

    window.parent.postMessage({ type: "menu-visibility", visible }, "*");

    if (menuDate) {
      window.parent.postMessage({ type: "menu-date", date: menuDate }, "*");
    }
  }, [visible, menuDate]);

  // Auto-resize: sleduje výšku obsahu a posílá rodičovi
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.parent === window) return;

    function sendHeight() {
      // Měříme skutečný obsah body, ne celý dokument (ten může mít extra výšku)
      const height = document.body.offsetHeight;
      window.parent.postMessage({ type: "menu-resize", height }, "*");
    }

    // Pošli hned
    sendHeight();

    // Sleduj změny velikosti (načtení obrázku apod.)
    const observer = new ResizeObserver(() => sendHeight());
    observer.observe(document.body);

    // Záloha: obrázky se můžou načíst později
    window.addEventListener("load", sendHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener("load", sendHeight);
    };
  }, []);

  return null;
}
