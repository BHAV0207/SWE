"""Render SPEC.md to docs/SPEC.pdf with headless Chrome, to check it fits on two pages.

    python3 tools/spec_to_pdf.py

Handles only the Markdown that SPEC.md uses: headings, paragraphs, lists,
tables, fenced code, blockquotes, **bold**, *italic* and `code`.
"""

from __future__ import annotations

import html
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SOURCE = os.path.join(ROOT, "SPEC.md")
HTML_OUT = os.path.join(ROOT, "docs", "SPEC.html")
PDF_OUT = os.path.join(ROOT, "docs", "SPEC.pdf")
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

STYLE = """
@page { size: A4; margin: 13mm 14mm; }
body { font: 8.6pt/1.33 -apple-system, Helvetica, Arial, sans-serif; color: #111; }
h1 { font-size: 13pt; margin: 0 0 4px; } h2 { font-size: 10pt; margin: 8px 0 3px; }
p, ul, blockquote { margin: 3px 0; } ul { padding-left: 16px; } li { margin: 1px 0; }
code, pre { font: 7.8pt Menlo, monospace; } pre { background: #f4f4f4; padding: 4px 6px; margin: 4px 0; }
table { border-collapse: collapse; margin: 4px 0; width: 100%; }
th, td { border: 1px solid #bbb; padding: 2px 4px; text-align: left; vertical-align: top; }
th { background: #eee; } blockquote { border-left: 3px solid #c33; padding: 2px 8px; background: #fff4f4; }
"""


def inline(text: str) -> str:
    # Code first, so bold/italic can wrap around a `code` span.
    text = html.escape(text, quote=False)
    text = re.sub(r"`([^`]+)`", r"<code>\1</code>", text)
    text = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", text)
    return re.sub(r"\*(.+?)\*", r"<i>\1</i>", text)


def convert(markdown: str) -> str:
    lines = markdown.splitlines()
    out, i = [], 0
    while i < len(lines):
        line = lines[i]
        if line.startswith("```"):
            block = []
            i += 1
            while not lines[i].startswith("```"):
                block.append(lines[i])
                i += 1
            out.append("<pre>" + html.escape("\n".join(block)) + "</pre>")
        elif line.startswith("#"):
            level = len(line) - len(line.lstrip("#"))
            out.append(f"<h{level}>{inline(line[level:].strip())}</h{level}>")
        elif line.startswith("|"):
            rows = []
            while i < len(lines) and lines[i].startswith("|"):
                cells = [c.strip() for c in lines[i].strip("|").split("|")]
                if not all(re.fullmatch(r"-+", c) for c in cells):
                    rows.append(cells)
                i += 1
            i -= 1
            head = "".join(f"<th>{inline(c)}</th>" for c in rows[0])
            body = "".join("<tr>" + "".join(f"<td>{inline(c)}</td>" for c in r) + "</tr>" for r in rows[1:])
            out.append(f"<table><tr>{head}</tr>{body}</table>")
        elif line.startswith("- "):
            items = []
            while i < len(lines) and lines[i].startswith("- "):
                items.append(f"<li>{inline(lines[i][2:])}</li>")
                i += 1
            i -= 1
            out.append("<ul>" + "".join(items) + "</ul>")
        elif line.startswith("> "):
            out.append(f"<blockquote>{inline(line[2:])}</blockquote>")
        elif line.strip():
            out.append(f"<p>{inline(line)}</p>")
        i += 1
    return "\n".join(out)


def main() -> None:
    with open(SOURCE) as source:
        body = convert(source.read())
    with open(HTML_OUT, "w") as page:
        page.write(f"<!doctype html><meta charset=utf-8><title>BHP/1 spec</title><style>{STYLE}</style>{body}")
    if not os.path.exists(CHROME):
        sys.exit(f"wrote {HTML_OUT}; Chrome not found, print it to PDF by hand")
    subprocess.run([CHROME, "--headless", "--disable-gpu", "--no-pdf-header-footer",
                    f"--print-to-pdf={PDF_OUT}", HTML_OUT],
                   check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    with open(PDF_OUT, "rb") as pdf:
        pages = len(re.findall(rb"/Type\s*/Page[^s]", pdf.read()))
    print(f"wrote {PDF_OUT}: {pages} page(s)")


if __name__ == "__main__":
    main()
