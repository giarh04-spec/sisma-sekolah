import React from 'react';

interface BarcodeSvgProps {
  value: string;
  className?: string;
  height?: number;
}

export function getBarcodeBars(str: string) {
  const cleanStr = str || '8990001';
  const bars: { width: number; isBlack: boolean }[] = [
    { width: 2, isBlack: true },
    { width: 1, isBlack: false },
    { width: 2, isBlack: true }
  ];

  for (let i = 0; i < cleanStr.length; i++) {
    const code = cleanStr.charCodeAt(i);
    const b1 = (code % 2) + 1;
    const s1 = ((code >> 1) % 2) + 1;
    const b2 = ((code >> 2) % 2) + 1;
    const s2 = 1;

    bars.push({ width: b1, isBlack: true });
    bars.push({ width: s1, isBlack: false });
    bars.push({ width: b2, isBlack: true });
    bars.push({ width: s2, isBlack: false });
  }

  bars.push({ width: 2, isBlack: true });
  bars.push({ width: 1, isBlack: false });
  bars.push({ width: 2, isBlack: true });

  return bars;
}

export function generateBarcodeHtml(value: string, height = 40): string {
  const bars = getBarcodeBars(value);
  const totalWidth = bars.reduce((acc, bar) => acc + bar.width, 0);

  let currentX = 0;
  const rects = bars.map(bar => {
    const x = currentX;
    currentX += bar.width;
    if (!bar.isBlack) return '';
    return `<rect x="${x}" y="0" width="${bar.width}" height="${height - 8}" fill="#0f172a" />`;
  }).join('');

  return `
    <svg viewBox="0 0 ${totalWidth} ${height}" preserveAspectRatio="none" style="width: 100%; height: ${height}px; display: block;">
      ${rects}
    </svg>
    <div style="font-size: 9px; font-family: monospace; font-weight: bold; letter-spacing: 2px; text-align: center; color: #0f172a; margin-top: 2px;">*${value}*</div>
  `;
}

export const BarcodeSvg: React.FC<BarcodeSvgProps> = ({
  value,
  className = "w-full h-14",
  height = 50
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
        height={height - 10}
        fill="#0f172a"
      />
    );
  });

  return (
    <div className={`flex flex-col items-center justify-center bg-white px-2 py-1.5 rounded-lg border border-slate-200 shadow-sm ${className}`}>
      <svg
        viewBox={`0 0 ${totalWidth} ${height}`}
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        {renderedBars}
      </svg>
      <div className="text-[10px] font-mono font-bold tracking-widest text-slate-800 mt-0.5">
        *{value}*
      </div>
    </div>
  );
};
