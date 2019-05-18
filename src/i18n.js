const LANG_LOCALSTORAGE_KEY = '_lang';

export function __(literalSections, ...substs) {
  const litEng = literalSections.raw.join('xxx');
  const lang = localStorage[LANG_LOCALSTORAGE_KEY];
  let lit;

  // Use english version if not found in selected language
  if(!(window.lang && lang in window.lang && litEng in window.lang[lang]))
    lit = literalSections.raw;
  else lit = window.lang[lang][litEng].split('xxx');

  return lit.map((piece, i) =>
    piece + (substs.length > i ? substs[i] : '')).join('');
}
