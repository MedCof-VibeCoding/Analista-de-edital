"use client";

import { useEffect, useMemo, useRef } from "react";

interface HtmlPreviewProps {
  html: string;
}

const BASE_STYLES = `
  body { font-family: ui-sans-serif, system-ui, sans-serif; padding: 24px; color: #0a0a0a; background: #fff; line-height: 1.6; }
  h1, h2, h3 { color: #111; margin-top: 1.6em; }
  h1 { font-size: 1.875rem; }
  h2 { font-size: 1.4rem; border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
  table { border-collapse: collapse; width: 100%; margin: 1em 0; font-size: 0.92rem; }
  th, td { border: 1px solid #d4d4d8; padding: 8px 12px; text-align: left; vertical-align: top; }
  th { background: #f4f4f5; font-weight: 600; }
  blockquote { border-left: 4px solid #6366f1; background: #f5f3ff; margin: 1em 0; padding: 0.6em 1em; color: #3730a3; }
  code { background: #f4f4f5; padding: 2px 4px; border-radius: 4px; font-size: 0.9em; }
  ul, ol { padding-left: 1.4em; }
  a { color: #4f46e5; text-decoration: underline; }
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
      className="h-[60vh] w-full rounded-lg border border-gray-300 bg-white dark:border-gray-700"
    />
  );
}
