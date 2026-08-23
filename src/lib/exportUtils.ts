import * as htmlToImage from 'html-to-image';

export function downloadCSV(columns: string[], rows: (string | number)[][], filename: string) {
  const csvContent = [
    columns.map(c => `"${String(c).replace(/"/g, '""')}"`).join(';'),
    ...rows.map(row => row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(';'))
  ].join('\r\n');

  // Add UTF-8 BOM so Excel/Google Sheets opens Indonesian text correctly
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.setAttribute('download', filename);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function terbilang(n: number): string {
  if (isNaN(n) || n === null || n === undefined) return 'Nol Rupiah';
  if (n < 0) return 'Minus ' + terbilang(Math.abs(n));
  if (n === 0) return 'Nol Rupiah';
  
  const angka = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];
  
  function convert(num: number): string {
    if (num < 12) return angka[num];
    if (num < 20) return convert(num - 10) + ' Belas';
    if (num < 100) return convert(Math.floor(num / 10)) + ' Puluh' + (num % 10 > 0 ? ' ' + convert(num % 10) : '');
    if (num < 200) return 'Seratus' + (num - 100 > 0 ? ' ' + convert(num - 100) : '');
    if (num < 1000) return convert(Math.floor(num / 100)) + ' Ratus' + (num % 100 > 0 ? ' ' + convert(num % 100) : '');
    if (num < 2000) return 'Seribu' + (num - 1000 > 0 ? ' ' + convert(num - 1000) : '');
    if (num < 1000000) return convert(Math.floor(num / 1000)) + ' Ribu' + (num % 1000 > 0 ? ' ' + convert(num % 1000) : '');
    if (num < 1000000000) return convert(Math.floor(num / 1000000)) + ' Juta' + (num % 1000000 > 0 ? ' ' + convert(num % 1000000) : '');
    if (num < 1000000000000) return convert(Math.floor(num / 1000000000)) + ' Miliar' + (num % 1000000000 > 0 ? ' ' + convert(num % 1000000) : '');
    return num.toString();
  }
  
  return convert(Math.floor(n)).trim() + ' Rupiah';
}

/**
 * Capture an HTML element to PNG Blob with native browser rasterization (supports Tailwind v4 and oklch colors)
 */
export async function captureElementToBlob(element: HTMLElement): Promise<Blob | null> {
  try {
    const blob = await htmlToImage.toBlob(element, {
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      cacheBust: true,
      filter: (node: Node) => {
        // Exclude elements with print:hidden or hidden during export if any
        if (node instanceof HTMLElement && node.classList.contains('print:hidden')) {
          return true;
        }
        return true;
      }
    });
    return blob;
  } catch (error) {
    console.error('Failed to capture element as image:', error);
    return null;
  }
}

/**
 * Download an HTML element directly as PNG image
 */
export async function downloadElementAsImage(element: HTMLElement, filename: string): Promise<boolean> {
  try {
    const dataUrl = await htmlToImage.toPng(element, {
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      cacheBust: true
    });
    
    if (!dataUrl) return false;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.setAttribute('download', filename.endsWith('.png') ? filename : `${filename}.png`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return true;
  } catch (err) {
    console.error('Error downloading element image:', err);
    return false;
  }
}

/**
 * Copy HTML element image to clipboard for easy paste into WhatsApp Web
 */
export async function copyElementImageToClipboard(element: HTMLElement): Promise<boolean> {
  try {
    const blob = await captureElementToBlob(element);
    if (!blob) return false;
    if (navigator.clipboard && typeof window.ClipboardItem !== 'undefined') {
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blob
        })
      ]);
      return true;
    }
    return false;
  } catch (err) {
    console.warn('Clipboard write image not supported or permitted:', err);
    return false;
  }
}
