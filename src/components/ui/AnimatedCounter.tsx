"use client";

import { useEffect, useState } from "react";

export function AnimatedCounter({ value }: { value: number; duration?: number}) {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    setShown(value);
  }, [value]);

  return <span className="font-mono tabular-nums">{shown}</span>;
}
