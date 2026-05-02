import { useEffect, useRef, useState, ReactNode } from "react";

/**
 * Wraps a fixed-width (794px A4) preview so it scales down to fit the
 * available container width on mobile. The inner DOM keeps its true 794px
 * width — important so html2canvas / jsPDF capture renders at full A4.
 */
interface Props {
  children: ReactNode;
  contentWidth?: number;
  className?: string;
}

const A4PreviewWrapper = ({ children, contentWidth = 794, className = "" }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [contentHeight, setContentHeight] = useState<number>(0);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      const w = containerRef.current?.clientWidth || contentWidth;
      const next = Math.min(1, w / contentWidth);
      setScale(next);
      const h = innerRef.current?.scrollHeight || 0;
      setContentHeight(h * next);
    };
    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    if (innerRef.current) ro.observe(innerRef.current);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [contentWidth]);

  return (
    <div ref={containerRef} className={`w-full overflow-hidden ${className}`}>
      <div style={{ height: contentHeight || undefined }}>
        <div
          ref={innerRef}
          style={{
            width: contentWidth,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default A4PreviewWrapper;
