// json-utils.ts

export function formatAndHighlightJson(input: string | object): string {
  try {
    const jsonObj = typeof input === 'string' ? JSON.parse(input) : input;
    const formatted = JSON.stringify(jsonObj, null, 2);
    return syntaxHighlight(formatted);
  } catch {
    return escapeHtml(typeof input === 'string' ? input : JSON.stringify(input));
  }
}

function syntaxHighlight(json: string): string {
  if (!json) return '';
  return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(?:\s*:)?|\b(true|false|null)\b|\b[\d.eE+-]+\b)/g, match => {
    let cls = 'number';
    if (/^"/.test(match)) {
      cls = /:$/.test(match) ? 'key' : 'string';
    } else if (/true|false/.test(match)) {
      cls = 'boolean';
    } else if (/null/.test(match)) {
      cls = 'null';
    }
    return `<span class="json-${cls}">${escapeHtml(match)}</span>`;
  });
}

function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[m]!));
}

export function safeStringify(obj: any, space: number = 2): string {
  const seen = new WeakSet();
  return JSON.stringify(obj, (key, value) => {
    if (value === null) return null;        // giữ nguyên null
    if (typeof value === "object") {
      if (seen.has(value)) {
        return "[Circular]";                // tránh vòng lặp
      }
      seen.add(value);
    }
    return value;
  }, space);
}

export function setLocal(key: string, value: any) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getLocal<T>(key: string, defaultValue: T): T {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : defaultValue;
}
