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
