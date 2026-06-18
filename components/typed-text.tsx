"use client";

import * as React from "react";

/** Types out the text letter by letter with a blinking caret. */
export function TypedText({
  text,
  speed = 55,
  className,
}: {
  text: string;
  speed?: number;
  className?: string;
}) {
  const [n, setN] = React.useState(0);

  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(text.length);
      return;
    }
    setN(0);
    const id = setInterval(() => {
      setN((c) => {
        if (c >= text.length) {
          clearInterval(id);
          return c;
        }
        return c + 1;
      });
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);

  return (
    <span className={className}>
      {text.slice(0, n)}
      <span className="ml-0.5 inline-block w-[2px] animate-pulse bg-gold align-middle" style={{ height: "1em" }} />
    </span>
  );
}
