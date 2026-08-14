"use client";

import { useRef } from "react";

export function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function command(cmd: string) {
    document.execCommand(cmd, false);
    onChange(ref.current?.innerHTML || "");
  }

  return (
    <div className="border border-line bg-white">
      <div className="flex flex-wrap gap-1 border-b border-line bg-cream px-2 py-1 text-sm">
        {[
          ["bold", "B"],
          ["italic", "I"],
          ["underline", "U"],
          ["insertUnorderedList", "List"],
          ["formatBlock", "H2"],
        ].map(([cmd, label]) => (
          <button
            key={cmd}
            type="button"
            className="px-2 py-1 hover:bg-white"
            onMouseDown={(e) => {
              e.preventDefault();
              if (cmd === "formatBlock") {
                document.execCommand("formatBlock", false, "h2");
                onChange(ref.current?.innerHTML || "");
              } else {
                command(cmd);
              }
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <div
        ref={ref}
        className="prose-site min-h-40 px-3 py-2 outline-none"
        contentEditable
        suppressContentEditableWarning
        dangerouslySetInnerHTML={{ __html: value || "<p></p>" }}
        onInput={() => onChange(ref.current?.innerHTML || "")}
      />
    </div>
  );
}
