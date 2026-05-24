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
      className="mc-focus-ring h-[60vh] w-full resize-y rounded-2xl border border-[var(--mc-border)] bg-black/40 p-4 font-mono text-sm leading-relaxed text-[var(--mc-text)] shadow-inner placeholder:text-[var(--mc-text-dim)] disabled:opacity-50"
    />
  );
}
