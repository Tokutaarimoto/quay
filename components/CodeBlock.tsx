"use client";

import { CopyButton } from "./CopyButton";

interface CodeBlockProps {
  code: string;
  label?: string;
  language?: "json" | "bash";
}

function highlightJson(code: string) {
  return code
    .replace(
      /("(?:[^"\\]|\\.)*")\s*:/g,
      '<span class="key">$1</span>:'
    )
    .replace(/:\s*("(?:[^"\\]|\\.)*")/g, ': <span class="string">$1</span>')
    .replace(/([[\]{}])/g, '<span class="punctuation">$1</span>')
    .replace(/:\s*(\d+)/g, ': <span class="number">$1</span>');
}

export function CodeBlock({ code, label, language = "json" }: CodeBlockProps) {
  const highlightedCode = language === "json" ? highlightJson(code) : code;

  return (
    <div>
      {label && (
        <div className="text-[12px] font-medium uppercase tracking-widest text-text-secondary mb-2">
          {label}
        </div>
      )}
      <div className="relative group">
        <pre className="code-block pr-10">
          <code dangerouslySetInnerHTML={{ __html: highlightedCode }} />
        </pre>
        <div className="absolute top-2 right-2">
          <CopyButton text={code} />
        </div>
      </div>
    </div>
  );
}
