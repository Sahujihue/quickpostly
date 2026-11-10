/**
 * SocialHive Commercial SaaS - Safe HTML Sanitizer
 * Strips malicious scripts, event handlers, and dangerous iframe/embed elements
 * while preserving safe semantic tags for CMS blogs and custom pages.
 */

const ALLOWED_TAGS = new Set([
  'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'strong', 'b', 'em', 'i', 'u', 's', 'strike',
  'ul', 'ol', 'li',
  'blockquote', 'pre', 'code',
  'a', 'img', 'span', 'div', 'hr', 'br',
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td'
]);

const ALLOWED_ATTRIBUTES: Record<string, Set<string>> = {
  a: new Set(['href', 'title', 'target', 'rel', 'class']),
  img: new Set(['src', 'alt', 'title', 'width', 'height', 'loading', 'class']),
  p: new Set(['class', 'style']),
  div: new Set(['class', 'style']),
  span: new Set(['class', 'style']),
  h1: new Set(['class', 'id']),
  h2: new Set(['class', 'id']),
  h3: new Set(['class', 'id']),
  h4: new Set(['class', 'id']),
  h5: new Set(['class', 'id']),
  h6: new Set(['class', 'id']),
  code: new Set(['class']),
  pre: new Set(['class']),
  blockquote: new Set(['class', 'cite']),
  table: new Set(['class']),
  th: new Set(['class', 'colspan', 'rowspan', 'align']),
  td: new Set(['class', 'colspan', 'rowspan', 'align']),
};

export function sanitizeHtml(input: string): string {
  if (!input || typeof input !== 'string') return '';

  // 1. Remove dangerous blocks completely (script, iframe, object, embed, style tags)
  let clean = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '')
    .replace(/<input\b[^<]*>/gi, '')
    .replace(/<textarea\b[^<]*(?:(?!<\/textarea>)<[^<]*)*<\/textarea>/gi, '');

  // 2. Remove inline event handlers (onclick, onerror, onload, on*, etc.)
  clean = clean.replace(/\son\w+\s*=\s*(['"]).*?\1/gi, '');
  clean = clean.replace(/\son\w+\s*=\s*[^>\s]+/gi, '');

  // 3. Remove dangerous URL schemes (javascript:, data:, vbscript:)
  clean = clean.replace(/href\s*=\s*(['"])\s*(?:javascript|data|vbscript):.*?\1/gi, 'href="#"');
  clean = clean.replace(/src\s*=\s*(['"])\s*(?:javascript|data|vbscript):.*?\1/gi, 'src=""');

  // 4. Filter allowed tags & attributes
  clean = clean.replace(/<\/?([a-z0-9]+)([^>]*)>/gi, (match, tag, rawAttrs) => {
    const lowerTag = tag.toLowerCase();
    const isClosing = match.startsWith('</');

    if (!ALLOWED_TAGS.has(lowerTag)) {
      // Disallow tag - escape or drop it
      return '';
    }

    if (isClosing) {
      return `</${lowerTag}>`;
    }

    // Process attributes
    const allowedForTag = ALLOWED_ATTRIBUTES[lowerTag] || new Set();
    const attrRegex = /([a-zA-Z0-9_-]+)(?:\s*=\s*(?:'([^']*)'|"([^"]*)"|([^\s>]+)))?/g;
    let validAttrs = '';
    let attrMatch;

    while ((attrMatch = attrRegex.exec(rawAttrs)) !== null) {
      const attrName = attrMatch[1].toLowerCase();
      const attrVal = attrMatch[2] ?? attrMatch[3] ?? attrMatch[4] ?? '';

      // Skip non-allowed attributes
      if (!allowedForTag.has(attrName)) {
        continue;
      }

      // Security check for href/src
      if (attrName === 'href' || attrName === 'src') {
        const valLower = attrVal.trim().toLowerCase();
        if (
          valLower.startsWith('javascript:') ||
          valLower.startsWith('data:') ||
          valLower.startsWith('vbscript:')
        ) {
          continue;
        }
      }

      // Safe add
      validAttrs += ` ${attrName}="${attrVal.replace(/"/g, '&quot;')}"`;
    }

    // Force safe rel on links opening in blank
    if (lowerTag === 'a' && validAttrs.includes('target="_blank"')) {
      if (!validAttrs.includes('rel=')) {
        validAttrs += ' rel="noopener noreferrer"';
      }
    }

    return `<${lowerTag}${validAttrs}>`;
  });

  return clean;
}

export function stripHtml(input: string): string {
  if (!input || typeof input !== 'string') return '';
  return input.replace(/<[^>]*>?/gm, '').trim();
}
