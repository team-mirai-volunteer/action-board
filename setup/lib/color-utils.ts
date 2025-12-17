// カラーパレット生成

export interface HSL {
  h: number;
  s: number;
  l: number;
}

/**
 * HEXカラーをHSLに変換
 */
export function hexToHsl(hex: string): HSL {
  // Remove # if present
  const cleanHex = hex.replace(/^#/, "");

  // Parse hex values
  const r = Number.parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = Number.parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = Number.parseInt(cleanHex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * HSLをHEXに変換
 */
export function hslToHex(hsl: HSL): string {
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;

  let r: number;
  let g: number;
  let b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, tParam: number) => {
      let t = tParam;
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? `0${hex}` : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * プライマリカラーからカラーパレットを生成
 */
export function generateColorPalette(primaryHex: string) {
  const primary = hexToHsl(primaryHex);

  // Secondary: Primary + 明度15%アップ
  const secondary = hslToHex({
    h: primary.h,
    s: primary.s,
    l: Math.min(100, primary.l + 15),
  });

  // Accent: Primary + 色相15度シフト
  const accent = hslToHex({
    h: (primary.h + 15) % 360,
    s: primary.s,
    l: primary.l,
  });

  // Accent Light: Accent + 明度20%アップ
  const accentHsl = hexToHsl(accent);
  const accentLight = hslToHex({
    h: accentHsl.h,
    s: accentHsl.s,
    l: Math.min(100, accentHsl.l + 20),
  });

  return {
    primary: primaryHex,
    secondary,
    accent,
    accentLight,
  };
}
