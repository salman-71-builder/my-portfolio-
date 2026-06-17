"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

// Heavy three.js bundle — loaded only on the client, only when the intro runs.
const IntroOverlay = dynamic(() => import("@/components/three/intro-overlay"), {
  ssr: false,
  loading: () => <div className="fixed inset-0 z-[200] bg-[#0a0604]" />,
});

const SESSION_KEY = "ic-intro-shown-v1";

export function SiteIntro() {
  const reduce = useReducedMotion();
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    if (reduce) return; // respect reduced-motion: no intro
    if (sessionStorage.getItem(SESSION_KEY)) return; // once per session
    setShow(true);
  }, [reduce]);

  // Lock scroll while the intro is on screen.
  React.useEffect(() => {
    if (!show) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [show]);

  const finish = React.useCallback(() => {
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* ignore */
    }
    setShow(false);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="intro"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(8px)" }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[200]"
        >
          <IntroOverlay onComplete={finish} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
