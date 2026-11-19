// Variables CSS
const raiz = () => getComputedStyle(document.documentElement);

/** Valor de una variable */
export const colorCss = (nombre) => raiz().getPropertyValue(nombre).trim();

/** Color en RGB */
export function rgbCss(nombre) {
  const hex = colorCss(nombre).replace('#', '');
  return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
}

/** Rem a píxeles */
export const remEnPx = (rem) => rem * parseFloat(raiz().fontSize);
