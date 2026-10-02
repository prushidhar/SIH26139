"use client";

import React, { useState } from "react";
import katex from "katex";
import { Check, Copy } from "lucide-react";

interface ChatMarkdownRendererProps {
  content: string;
  isBot?: boolean;
}

/**
 * Safely renders LaTeX via KaTeX into an HTML string.
 */
function renderKatexHtml(tex: string, displayMode: boolean): string {
  try {
    return katex.renderToString(tex.trim(), {
      displayMode,
      throwOnError: false,
      output: "htmlAndMathml",
      strict: false,
    });
  } catch {
    return tex;
  }
}

/**
 * Display Math Equation Block with copy LaTeX button
 */
function DisplayMath({ formula, isBot = true }: { formula: string; isBot?: boolean }) {
  const [copied, setCopied] = useState(false);
  const html = renderKatexHtml(formula, true);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(formula);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`group relative my-2 px-3 py-2.5 rounded-xl overflow-x-auto text-center shadow-2xs transition-all ${
        isBot
          ? "bg-cream-deep/60 border border-hairline/80 text-ink"
          : "bg-white/10 border border-white/20 text-white"
      }`}
    >
      <div
        className="inline-block min-w-full text-center"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <button
        type="button"
        onClick={handleCopy}
        title="Copy LaTeX"
        className={`absolute top-1.5 right-1.5 p-1 rounded-md text-[10px] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center gap-1 ${
          isBot
            ? "bg-cream/90 hover:bg-cream-deep text-ink-soft hover:text-ink border border-hairline/60"
            : "bg-black/40 hover:bg-black/60 text-parchment border border-white/10"
        }`}
      >
        {copied ? (
          <>
            <Check size={11} className="text-emerald-500" />
            <span className="text-[9px] font-sans">Copied</span>
          </>
        ) : (
          <>
            <Copy size={11} />
            <span className="text-[9px] font-mono">LaTeX</span>
          </>
        )}
      </button>
    </div>
  );
}

/**
 * Fenced Code Block with syntax styling and copy action
 */
function CodeBlock({
  lang,
  code,
  isBot = true,
}: {
  lang: string;
  code: string;
  isBot?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`my-2 rounded-xl overflow-hidden text-xs border ${
        isBot
          ? "bg-stone-900 text-stone-100 border-stone-800"
          : "bg-black/50 text-stone-100 border-white/20"
      }`}
    >
      <div className="flex items-center justify-between px-3 py-1.5 bg-stone-950/70 border-b border-stone-800 text-[10px] font-mono text-stone-400">
        <span className="uppercase font-semibold tracking-wider">{lang || "code"}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-stone-200 transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check size={11} className="text-emerald-400" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy size={11} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3 overflow-x-auto font-mono text-[11px] leading-relaxed select-text">
        <code>{code}</code>
      </pre>
    </div>
  );
}

/**
 * Parses and renders inline markdown tokens:
 * - $math$ and \(math\)
 * - **bold** and *italic*
 * - `inline code`
 * - [links](url)
 * - unclosed tokens during streaming
 */
function parseInline(text: string, isBot: boolean): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  // Regex to match inline tokens in priority order
  const INLINE_REGEX =
    /(?:(\$\$(?:[^\$]+?)\$\$)|(\\\((?:[\s\S]+?)\\\))|(\$([^\$\n\s](?:[^\$\n]*?[^\$\n\s])?)\$)|(`[^`]+`)|(\*\*\*[^*]+\*\*\*)|(\*\*[^*]+\*\*)|(\*[^*]+\*)|(\[([^\]]+)\]\(([^)]+)\))|(\*\*[^*]+$)|(`[^`]+$))/g;

  let lastIdx = 0;
  let match: RegExpExecArray | null;

  while ((match = INLINE_REGEX.exec(text)) !== null) {
    if (match.index > lastIdx) {
      nodes.push(text.substring(lastIdx, match.index));
    }

    const raw = match[0];

    // 1. Display math inside inline text ($$...$$)
    if (raw.startsWith("$$") && raw.endsWith("$$")) {
      const formula = raw.slice(2, -2);
      nodes.push(
        <DisplayMath key={`dm-${match.index}`} formula={formula} isBot={isBot} />
      );
    }
    // 2. Inline LaTeX \( ... \)
    else if (raw.startsWith("\\(") && raw.endsWith("\\)")) {
      const formula = raw.slice(2, -2);
      const html = renderKatexHtml(formula, false);
      nodes.push(
        <span
          key={`m-${match.index}`}
          className={`inline-block px-0.5 align-baseline ${
            isBot ? "text-ink" : "text-white"
          }`}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    }
    // 3. Inline LaTeX $ ... $
    else if (raw.startsWith("$") && raw.endsWith("$") && raw.length >= 2) {
      const formula = raw.slice(1, -1);
      const html = renderKatexHtml(formula, false);
      nodes.push(
        <span
          key={`m-${match.index}`}
          className={`inline-block px-0.5 align-baseline ${
            isBot ? "text-ink" : "text-white"
          }`}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    }
    // 4. Inline code `...`
    else if (raw.startsWith("`") && raw.endsWith("`") && raw.length >= 2) {
      const code = raw.slice(1, -1);
      nodes.push(
        <code
          key={`c-${match.index}`}
          className={`font-mono text-[11px] px-1 py-0.5 rounded font-medium ${
            isBot
              ? "bg-cream-deep/90 text-ink border border-hairline/70"
              : "bg-white/20 text-white border border-white/20"
          }`}
        >
          {code}
        </code>
      );
    }
    // 5. Bold & Italic ***...***
    else if (raw.startsWith("***") && raw.endsWith("***") && raw.length >= 6) {
      const content = raw.slice(3, -3);
      nodes.push(
        <strong
          key={`bi-${match.index}`}
          className={`font-bold italic ${isBot ? "text-ink" : "text-white"}`}
        >
          {parseInline(content, isBot)}
        </strong>
      );
    }
    // 6. Bold **...**
    else if (raw.startsWith("**") && raw.endsWith("**") && raw.length >= 4) {
      const content = raw.slice(2, -2);
      nodes.push(
        <strong
          key={`b-${match.index}`}
          className={`font-semibold ${isBot ? "text-ink drop-shadow-2xs" : "text-white"}`}
        >
          {parseInline(content, isBot)}
        </strong>
      );
    }
    // 7. Italic *...*
    else if (raw.startsWith("*") && raw.endsWith("*") && raw.length >= 2) {
      const content = raw.slice(1, -1);
      nodes.push(
        <em key={`i-${match.index}`} className="italic">
          {parseInline(content, isBot)}
        </em>
      );
    }
    // 8. Link [title](url)
    else if (raw.startsWith("[") && raw.includes("](")) {
      const linkMatch = raw.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        const linkText = linkMatch[1];
        const linkUrl = linkMatch[2];
        const isExternal = linkUrl.startsWith("http");
        nodes.push(
          <a
            key={`l-${match.index}`}
            href={linkUrl}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
            className={`underline underline-offset-2 font-medium hover:opacity-80 transition-opacity ${
              isBot ? "text-quantum" : "text-parchment"
            }`}
          >
            {linkText}
          </a>
        );
      }
    }
    // 9. Streaming unclosed bold **...
    else if (raw.startsWith("**")) {
      const content = raw.slice(2);
      nodes.push(
        <strong
          key={`sb-${match.index}`}
          className={`font-semibold ${isBot ? "text-ink" : "text-white"}`}
        >
          {content}
        </strong>
      );
    }
    // 10. Streaming unclosed code `...
    else if (raw.startsWith("`")) {
      const content = raw.slice(1);
      nodes.push(
        <code
          key={`sc-${match.index}`}
          className={`font-mono text-[11px] px-1 py-0.5 rounded font-medium ${
            isBot ? "bg-cream-deep/90 text-ink" : "bg-white/20 text-white"
          }`}
        >
          {content}
        </code>
      );
    }

    lastIdx = INLINE_REGEX.lastIndex;
  }

  if (lastIdx < text.length) {
    nodes.push(text.substring(lastIdx));
  }

  return nodes;
}

/**
 * Parses markdown table lines into clean HTML table
 */
function MarkdownTable({ lines, isBot = true }: { lines: string[]; isBot?: boolean }) {
  if (lines.length === 0) return null;

  // Filter out empty lines
  const cleanLines = lines.map((l) => l.trim()).filter(Boolean);
  if (cleanLines.length === 0) return null;

  const parseRow = (line: string): string[] => {
    const trimmed = line.replace(/^\|/, "").replace(/\|$/, "");
    return trimmed.split("|").map((cell) => cell.trim());
  };

  const hasDivider = cleanLines.length > 1 && /^[\s|:-]+$/.test(cleanLines[1]);
  const headers = parseRow(cleanLines[0]);
  const bodyRows = hasDivider
    ? cleanLines.slice(2).map(parseRow)
    : cleanLines.slice(1).map(parseRow);

  return (
    <div
      className={`my-2 overflow-x-auto rounded-xl border text-[11px] ${
        isBot
          ? "bg-cream/40 border-hairline/80 text-ink"
          : "bg-white/5 border-white/20 text-white"
      }`}
    >
      <table className="w-full text-left border-collapse">
        {headers.length > 0 && (
          <thead>
            <tr
              className={`border-b ${
                isBot ? "bg-cream-deep/50 border-hairline" : "bg-white/10 border-white/20"
              }`}
            >
              {headers.map((h, i) => (
                <th key={i} className="px-2.5 py-1.5 font-semibold">
                  {parseInline(h, isBot)}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody className="divide-y divide-hairline/50">
          {bodyRows.map((row, rIdx) => (
            <tr
              key={rIdx}
              className={
                isBot
                  ? "hover:bg-cream-deep/30 transition-colors"
                  : "hover:bg-white/5 transition-colors"
              }
            >
              {row.map((cell, cIdx) => (
                <td key={cIdx} className="px-2.5 py-1.5">
                  {parseInline(cell, isBot)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ChatMarkdownRenderer({
  content,
  isBot = true,
}: ChatMarkdownRendererProps) {
  if (!content) return null;

  // Split content into block tokens
  const lines = content.split(/\r?\n/);
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // 1. Fenced Code Block (```lang ... ```)
    if (trimmed.startsWith("```")) {
      const match = trimmed.match(/^```([a-zA-Z0-9_-]*)/);
      const lang = match ? match[1] : "";
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++; // consume closing ```
      elements.push(
        <CodeBlock
          key={`cb-${i}`}
          lang={lang}
          code={codeLines.join("\n")}
          isBot={isBot}
        />
      );
      continue;
    }

    // 2. Display Math Block ($$...$$ or \[...\])
    if (trimmed.startsWith("$$")) {
      // Single line display math: $$formula$$
      if (trimmed.length > 2 && trimmed.endsWith("$$") && trimmed.slice(2, -2).trim().length > 0) {
        const formula = trimmed.slice(2, -2).trim();
        elements.push(
          <DisplayMath key={`math-${i}`} formula={formula} isBot={isBot} />
        );
        i++;
        continue;
      }
      // Multiline display math
      const mathLines: string[] = [];
      const rest = trimmed.slice(2).trim();
      if (rest) mathLines.push(rest);
      i++;
      while (i < lines.length && !lines[i].trim().includes("$$")) {
        mathLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) {
        const lastLine = lines[i].trim().replace(/\$\$/, "").trim();
        if (lastLine) mathLines.push(lastLine);
        i++;
      }
      elements.push(
        <DisplayMath
          key={`math-m-${i}`}
          formula={mathLines.join("\n")}
          isBot={isBot}
        />
      );
      continue;
    }

    if (trimmed.startsWith("\\[")) {
      if (trimmed.endsWith("\\]") && trimmed.length > 2) {
        const formula = trimmed.slice(2, -2).trim();
        elements.push(
          <DisplayMath key={`math-br-${i}`} formula={formula} isBot={isBot} />
        );
        i++;
        continue;
      }
      const mathLines: string[] = [];
      const rest = trimmed.slice(2).trim();
      if (rest) mathLines.push(rest);
      i++;
      while (i < lines.length && !lines[i].trim().includes("\\]")) {
        mathLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) {
        const lastLine = lines[i].trim().replace(/\\\]/, "").trim();
        if (lastLine) mathLines.push(lastLine);
        i++;
      }
      elements.push(
        <DisplayMath
          key={`math-brm-${i}`}
          formula={mathLines.join("\n")}
          isBot={isBot}
        />
      );
      continue;
    }

    // 3. Tables (| col1 | col2 |)
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      const tableLines: string[] = [line];
      i++;
      while (
        i < lines.length &&
        lines[i].trim().startsWith("|") &&
        lines[i].trim().endsWith("|")
      ) {
        tableLines.push(lines[i]);
        i++;
      }
      elements.push(
        <MarkdownTable key={`tbl-${i}`} lines={tableLines} isBot={isBot} />
      );
      continue;
    }

    // 4. Horizontal Rules (---, ***, ___)
    if (trimmed === "---" || trimmed === "***" || trimmed === "___") {
      elements.push(
        <hr
          key={`hr-${i}`}
          className={`my-2 border-t ${
            isBot ? "border-hairline/80" : "border-white/20"
          }`}
        />
      );
      i++;
      continue;
    }

    // 5. Headings (#, ##, ###, ####)
    if (trimmed.startsWith("#")) {
      const headingMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        const headingText = headingMatch[2];
        const headingContent = parseInline(headingText, isBot);

        if (level === 1) {
          elements.push(
            <h3
              key={`h1-${i}`}
              className={`font-serif font-bold text-sm tracking-tight mt-2.5 mb-1 ${
                isBot ? "text-ink" : "text-white"
              }`}
            >
              {headingContent}
            </h3>
          );
        } else if (level === 2) {
          elements.push(
            <h4
              key={`h2-${i}`}
              className={`font-serif font-bold text-[13px] mt-2 mb-0.5 ${
                isBot ? "text-ink" : "text-white"
              }`}
            >
              {headingContent}
            </h4>
          );
        } else if (level === 3) {
          elements.push(
            <h5
              key={`h3-${i}`}
              className={`font-serif font-semibold text-xs mt-1.5 mb-0.5 ${
                isBot ? "text-ink" : "text-white"
              }`}
            >
              {headingContent}
            </h5>
          );
        } else {
          elements.push(
            <h6
              key={`h4-${i}`}
              className={`font-mono text-[11px] font-semibold uppercase tracking-wider mt-1 mb-0.5 ${
                isBot ? "text-quantum" : "text-parchment"
              }`}
            >
              {headingContent}
            </h6>
          );
        }
        i++;
        continue;
      }
    }

    // 6. Blockquote (> ...)
    if (trimmed.startsWith(">")) {
      const quoteLines: string[] = [trimmed.replace(/^>\s*/, "")];
      i++;
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quoteLines.push(lines[i].trim().replace(/^>\s*/, ""));
        i++;
      }
      elements.push(
        <blockquote
          key={`bq-${i}`}
          className={`my-1.5 pl-2.5 py-1 border-l-2 rounded-r-lg italic text-[11.5px] ${
            isBot
              ? "border-quantum/60 bg-cream/40 text-ink-soft"
              : "border-parchment/60 bg-white/5 text-parchment/90"
          }`}
        >
          {parseInline(quoteLines.join(" "), isBot)}
        </blockquote>
      );
      continue;
    }

    // 7. Unordered Bullet List (- item, * item, • item)
    if (/^[-*•]\s+/.test(trimmed)) {
      const listItems: string[] = [trimmed.replace(/^[-*•]\s+/, "")];
      i++;
      while (i < lines.length && /^[-*•]\s+/.test(lines[i].trim())) {
        listItems.push(lines[i].trim().replace(/^[-*•]\s+/, ""));
        i++;
      }
      elements.push(
        <div key={`ul-${i}`} className="space-y-1 my-1 pl-0.5">
          {listItems.map((item, idx) => (
            <div key={idx} className="flex items-start gap-1.5">
              <span
                className={`text-[10px] mt-0.5 font-bold shrink-0 ${
                  isBot ? "text-quantum" : "text-parchment"
                }`}
              >
                •
              </span>
              <span className="flex-1 text-[12px] leading-relaxed">
                {parseInline(item, isBot)}
              </span>
            </div>
          ))}
        </div>
      );
      continue;
    }

    // 8. Ordered Numbered List (1. item, 2. item)
    if (/^\d+\.\s+/.test(trimmed)) {
      const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
      const listItems: { num: string; text: string }[] = [
        { num: numMatch ? numMatch[1] : "1", text: numMatch ? numMatch[2] : trimmed },
      ];
      i++;
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        const m = lines[i].trim().match(/^(\d+)\.\s+(.*)$/);
        listItems.push({
          num: m ? m[1] : String(listItems.length + 1),
          text: m ? m[2] : lines[i].trim(),
        });
        i++;
      }
      elements.push(
        <div key={`ol-${i}`} className="space-y-1 my-1 pl-0.5">
          {listItems.map((item, idx) => (
            <div key={idx} className="flex items-start gap-1.5">
              <span
                className={`text-[10px] font-mono font-semibold px-1 rounded shrink-0 mt-0.5 ${
                  isBot
                    ? "bg-quantum/10 text-quantum"
                    : "bg-white/20 text-white"
                }`}
              >
                {item.num}.
              </span>
              <span className="flex-1 text-[12px] leading-relaxed">
                {parseInline(item.text, isBot)}
              </span>
            </div>
          ))}
        </div>
      );
      continue;
    }

    // 9. Blank empty line
    if (!trimmed) {
      elements.push(<div key={`sp-${i}`} className="h-1" />);
      i++;
      continue;
    }

    // 10. Standard Paragraph Line
    elements.push(
      <p key={`p-${i}`} className="my-0.5 text-[12px] leading-relaxed">
        {parseInline(line, isBot)}
      </p>
    );
    i++;
  }

  return <div className="space-y-0.5 leading-relaxed">{elements}</div>;
}
