import { useMemo } from "react";

interface BarcodeProps {
  value: string;
  width?: number;
  height?: number;
}

// Simple Code128-style barcode renderer using canvas-free SVG bars
const Barcode = ({ value, width = 200, height = 50 }: BarcodeProps) => {
  const bars = useMemo(() => {
    // Generate a deterministic pattern from the string
    const result: boolean[] = [];
    // Quiet zone
    for (let i = 0; i < 10; i++) result.push(false);
    // Start pattern
    result.push(true, true, false, true, true, false, false, true);

    for (let c = 0; c < value.length; c++) {
      const code = value.charCodeAt(c);
      for (let b = 7; b >= 0; b--) {
        result.push(!!((code >> b) & 1));
      }
      // separator
      result.push(false);
    }

    // Stop pattern
    result.push(true, true, false, false, true, true, false, true, true);
    // Quiet zone
    for (let i = 0; i < 10; i++) result.push(false);

    return result;
  }, [value]);

  const barWidth = width / bars.length;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {bars.map((on, i) =>
        on ? (
          <rect
            key={i}
            x={i * barWidth}
            y={0}
            width={barWidth}
            height={height}
            fill="black"
          />
        ) : null
      )}
    </svg>
  );
};

export default Barcode;
