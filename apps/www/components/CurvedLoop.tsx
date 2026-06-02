"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

type CurvedLoopProps = {
  marqueeText: string;
  speed?: number;
  curveAmount?: number;
  direction?: "left" | "right";
  interactive?: boolean;
  className?: string;
};

export function CurvedLoop({
  marqueeText,
  speed = 2,
  curveAmount = 360,
  direction = "left",
  interactive = false,
  className = "",
}: CurvedLoopProps) {
  const id = useId().replace(/:/g, "");
  const svgRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef({ active: false, x: 0, offset: 0 });
  const [dragOffset, setDragOffset] = useState(0);
  const repeatedText = useMemo(
    () => Array.from({ length: 8 }, () => marqueeText).join(" "),
    [marqueeText],
  );
  const signedSpeed = direction === "right" ? Math.abs(speed) : -Math.abs(speed);
  const pathId = `dlv-curved-loop-${id}`;
  const path = `M -80 92 C 220 ${92 - curveAmount * 0.22}, 520 ${92 + curveAmount * 0.22}, 860 92 S 1480 ${92 - curveAmount * 0.2}, 1820 92`;

  useEffect(() => {
    if (!interactive) return;
    const svg = svgRef.current;
    if (!svg) return;

    const onPointerMove = (event: PointerEvent) => {
      if (!dragRef.current.active) return;
      const delta = event.clientX - dragRef.current.x;
      setDragOffset(dragRef.current.offset + delta * 0.16);
    };
    const onPointerUp = () => {
      dragRef.current.active = false;
      dragRef.current.offset = dragOffset;
      svg.releasePointerCapture?.(Number(svg.dataset.pointerId || 0));
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [dragOffset, interactive]);

  return (
    <div className={`dlv-curved-loop ${className}`} aria-label={marqueeText}>
      <svg
        ref={svgRef}
        viewBox="0 0 1740 190"
        role="img"
        onPointerDown={(event) => {
          if (!interactive) return;
          dragRef.current = {
            active: true,
            x: event.clientX,
            offset: dragOffset,
          };
          event.currentTarget.dataset.pointerId = String(event.pointerId);
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
      >
        <defs>
          <path id={pathId} d={path} />
        </defs>
        <text className="dlv-curved-loop-text">
          <textPath href={`#${pathId}`} startOffset={`${dragOffset}%`}>
            {repeatedText}
            <animate
              attributeName="startOffset"
              from={`${dragOffset}%`}
              to={`${dragOffset + signedSpeed * 100}%`}
              dur="38s"
              repeatCount="indefinite"
            />
          </textPath>
        </text>
      </svg>
    </div>
  );
}
