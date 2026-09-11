import React from 'react';

interface BarcodeSvgProps {
  value: string;
  className?: string;
  height?: number;
}

export function getBarcodeBars(str: string) {
  const cleanStr = str || '8990001';
  // Optimized for maximum camera scannability: distinct thick bars with clear quiet zones
  const bars: { width: number; isBlack: boolean }[] = [
    { width: 6, isBlack: false }, // Quiet zone left
    { width: 3, isBlack: true },
    { width: 2, isBlack: false },
    { width: 3, isBlack: true }
  ];

  for (let i = 0; i < cleanStr.length; i++) {
    const code = cleanStr.charCodeAt(i);
    const b1 = (code % 2 === 0) ? 3 : 2;
    const s1 = 2;
    const b2 = (code % 3 === 0) ? 2 : 3;
    const s2 = 2;

    bars.push({ width: b1, isBlack: true });
    bars.push({ width: s1, isBlack: false });
    bars.push({ width: b2, isBlack: true });
    bars.push({ width: s2, isBlack: false });
  }

  bars.push({ width: 3, isBlack: true });
  bars.push({ width: 2, isBlack: false });
  bars.push({ width: 3, isBlack: true });
  bars.push({ width: 6, isBlack: false }); // Quiet zone right

  return bars;
}

export function generateBarcodeHtml(value: string, height = 50): string {
  const bars = getBarcodeBars(value);
  const totalWidth = bars.reduce((acc, bar) => acc + bar.width, 0);

  let currentX = 0;
  const rects = bars.map(bar => {
    const x = currentX;
    currentX += bar.width;
    if (!bar.isBlack) return '';
    return `<rect x="${x}" y="0" width="${bar.width}" height="${height - 10}" fill="#000000" />`;
  }).join('');

  return `
    <svg viewBox="0 0 ${totalWidth} ${height}" preserveAspectRatio="none" style="width: 100%; height: ${height}px; display: block; background: #ffffff;">
      ${rects}
    </svg>
    <div style="font-size: 11px; font-family: monospace; font-weight: bold; letter-spacing: 3px; text-align: center; color: #000; margin-top: 3px;">*${value}*</div>
  `;
}

export const BarcodeSvg: React.FC<BarcodeSvgProps> = ({
  value,
  className = "w-full h-20",
  height = 70
}) => {
  const bars = getBarcodeBars(value);
  const totalWidth = bars.reduce((acc, bar) => acc + bar.width, 0);

  let currentX = 0;
  const renderedBars = bars.map((bar, idx) => {
    const x = currentX;
    currentX += bar.width;
    if (!bar.isBlack) return null;
    return (
      <rect
        key={idx}
        x={x}
        y={0}
        width={bar.width}
        height={height - 14}
        fill="#000000"
      />
    );
  });

  return (
    <div className={`flex flex-col items-center justify-center bg-white px-4 py-2.5 rounded-xl border-2 border-slate-300 shadow-md ${className}`}>
      <svg
        viewBox={`0 0 ${totalWidth} ${height}`}
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        {renderedBars}
      </svg>
      <div className="text-xs font-mono font-black tracking-widest text-slate-900 mt-1">
        *{value}*
      </div>
    </div>
  );
};
