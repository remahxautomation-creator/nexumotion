/**
 * Minimal Markdown → HTML for blog bodies.
 *
 * Blog text arrives from an AI workflow, so it is treated as untrusted: every
 * character is HTML-escaped first and only a small subset is turned back into
 * markup — headings (##, ###), paragraphs, bullet and numbered lists, **bold**,
 * `code` and [links](https://…). Links must be http(s) or site-relative.
 */

const escape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function inline(text: string): string {
  return escape(text)
    .replace(/`([^`]+)`/g, '<code class="sku">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)\]\(((?:https?:\/\/|\/)[^\s)]+)\)/g, (_m, label: string, href: string) => {
      const external = href.startsWith("http") && !href.startsWith("https://nexumotion.com");
      return `<a href="${href}"${external ? ' rel="nofollow noopener" target="_blank"' : ""}>${label}</a>`;
    });
}

export function renderMarkdown(md: string): string {
  const out: string[] = [];
  let list: "ul" | "ol" | null = null;
  let para: string[] = [];

  const flushPara = () => {
    if (para.length) out.push(`<p>${inline(para.join(" "))}</p>`);
    para = [];
  };
  const closeList = () => {
    if (list) out.push(`</${list}>`);
    list = null;
  };

  for (const raw of md.replace(/\r\n/g, "\n").split("\n")) {
    const line = raw.trim();
    if (!line) {
      flushPara();
      closeList();
      continue;
    }
    const h = /^(#{2,3})\s+(.*)$/.exec(line);
    const ul = /^[-*]\s+(.*)$/.exec(line);
    const ol = /^\d+[.)]\s+(.*)$/.exec(line);
    if (h) {
      flushPara();
      closeList();
      const tag = h[1].length === 2 ? "h2" : "h3";
      out.push(`<${tag}>${inline(h[2])}</${tag}>`);
    } else if (ul || ol) {
      flushPara();
      const kind = ul ? "ul" : "ol";
      if (list !== kind) {
        closeList();
        out.push(`<${kind}>`);
        list = kind;
      }
      out.push(`<li>${inline((ul ?? ol)![1])}</li>`);
    } else {
      closeList();
      para.push(line.replace(/^#\s+/, ""));
    }
  }
  flushPara();
  closeList();
  return out.join("\n");
}
