"use client";
import { useEffect } from "react";

const KEYWORDS = ["Configure your application", "keyless", "claim your keys"];

function hideBanner() {
  document.querySelectorAll("body > div").forEach((el) => {
    if (el instanceof HTMLElement) {
      const text = el.innerText || "";
      if (KEYWORDS.some((kw) => text.includes(kw))) {
        el.style.setProperty("display", "none", "important");
      }
    }
  });
}

export function ClerkBannerRemover() {
  useEffect(() => {
    hideBanner();

    const timers = [
      setTimeout(hideBanner, 500),
      setTimeout(hideBanner, 1500),
      setTimeout(hideBanner, 3000),
    ];

    const observer = new MutationObserver(() => hideBanner());
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      timers.forEach(clearTimeout);
      observer.disconnect();
    };
  }, []);

  return null;
}
