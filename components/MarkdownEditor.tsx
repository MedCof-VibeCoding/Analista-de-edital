"use client";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function MarkdownEditor({ value, onChange, disabled }: MarkdownEditorProps) {
  return (
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
      spellCheck={false}
      className="h-[60vh] w-full resize-y rounded-lg border border-gray-300 bg-white p-4 font-mono text-sm leading-relaxed shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-950"
    />
  );
}
