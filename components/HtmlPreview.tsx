"use client";

import { useEffect, useMemo, useRef } from "react";

interface HtmlPreviewProps {
  html: string;
}

const BASE_STYLES = `
  :root { color-scheme: light; }
  body {
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    padding: 32px;
    color: #111827;
    background: #ffffff;
    line-height: 1.7;
    font-size: 15px;
  }
  h1, h2, h3 { color: #0a0d14; margin-top: 1.6em; letter-spacing: -0.01em; }
  h1 { font-size: 1.9rem; font-weight: 800; }
  h2 { font-size: 1.35rem; font-weight: 700; border-bottom: 1px solid #f1f5f9; padding-bottom: 0.35em; }
  h3 { font-size: 1.1rem; font-weight: 700; color: #e60026; }
  table { border-collapse: collapse; width: 100%; margin: 1em 0; font-size: 0.92rem; }
  th, td { border: 1px solid #e5e7eb; padding: 10px 14px; text-align: left; vertical-align: top; }
  th { background: #fff1f3; font-weight: 700; color: #8c0019; }
  blockquote {
    border-left: 4px solid #e60026;
    background: linear-gradient(90deg, rgba(230,0,38,0.06), transparent);
    margin: 1em 0;
    padding: 0.7em 1.1em;
    color: #4b5563;
    border-radius: 0 8px 8px 0;
  }
  blockquote strong { color: #8c0019; }
  code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-size: 0.9em; color: #b8001e; }
  ul, ol { padding-left: 1.4em; }
  a { color: #e60026; text-decoration: underline; text-decoration-thickness: 1.5px; text-underline-offset: 2px; }
  hr { border: none; border-top: 1px solid #f1f5f9; margin: 2em 0; }
`;

export function HtmlPreview({ html }: HtmlPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const document = useMemo(
    () =>
      `<!doctype html><html><head><meta charset="utf-8"><style>${BASE_STYLES}</style></head><body>${html}</body></html>`,
    [html],
  );

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    iframe.srcdoc = document;
  }, [document]);

  return (
    <iframe
      ref={iframeRef}
      title="Preview HTML"
      sandbox="allow-same-origin"
      className="h-[60vh] w-full rounded-2xl border border-[var(--mc-border)] bg-white"
    />
  );
}
