"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";

export default function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const editor = useEditor({
    extensions: [StarterKit.configure({ link: { openOnClick: false } }), Image],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: { attributes: { class: "editor outline-none min-h-full" } },
  });

  const ask = (label: string) => window.prompt(label)?.trim();
  const btn = "grid size-6 place-items-center rounded text-xs text-text2 hover:bg-fill";

  if (!editor) return <div className="h-[379px] rounded-[2px] border border-line" />;
  return (
    <div className="flex h-[379px] flex-col rounded-[2px] border border-line bg-white">
      <div className="flex h-[37px] shrink-0 items-center gap-2 border-b border-line px-3">
        <button type="button" aria-label="Tebal" className={`${btn} font-bold`} onClick={() => editor.chain().focus().toggleBold().run()}>B</button>
        <button type="button" aria-label="Miring" className={`${btn} italic`} onClick={() => editor.chain().focus().toggleItalic().run()}>I</button>
        <button type="button" aria-label="Garis bawah" className={`${btn} underline`} onClick={() => editor.chain().focus().toggleUnderline().run()}>U</button>
        <span className="h-4 w-px bg-line" />
        <button type="button" aria-label="Tautan" className={btn} onClick={() => { const url = ask("URL tautan"); if (url) editor.chain().focus().setLink({ href: url }).run(); }}>🔗</button>
        <button type="button" aria-label="Gambar" className={btn} onClick={() => { const src = ask("URL gambar"); if (src) editor.chain().focus().setImage({ src }).run(); }}>🖼</button>
        <button type="button" aria-label="Kode" className={btn} onClick={() => editor.chain().focus().toggleCode().run()}>{"</>"}</button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 text-ink">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
