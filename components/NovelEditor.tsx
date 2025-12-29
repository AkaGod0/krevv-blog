// components/NovelEditor.tsx
"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import Heading from "@tiptap/extension-heading";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";

import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  ListOrderedIcon,
  ListIcon,
  Link2Icon,
  ImageIcon,
  CodeIcon,
  QuoteIcon,
  TableIcon,
  Plus,
  Minus,
  Trash2,
  Heading1,
  Heading2,
  Heading3,
} from "lucide-react";

import { useState, useEffect, useRef } from "react";
import type { Editor } from "@tiptap/react";

interface NovelEditorProps {
  content: string;
  onChange: (html: string) => void;
  onCreate?: ({ editor }: { editor: Editor }) => void;
}

const NovelEditor = ({ content, onChange, onCreate }: NovelEditorProps) => {
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [showTableMenu, setShowTableMenu] = useState(false);
  const [showFloatingMenu, setShowFloatingMenu] = useState(false);
  const [floatingMenuPosition, setFloatingMenuPosition] = useState({ top: 0, left: 0 });
  const floatingMenuRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
      }),

      Heading.configure({
        levels: [1, 2, 3],
      }),

      BulletList,
      OrderedList,
      ListItem,

      Typography,

      Placeholder.configure({
        placeholder: "Start writing your article...",
      }),

      Image.configure({
        HTMLAttributes: {
          class:
            "rounded-lg my-8 max-w-full h-auto border border-gray-200 shadow-sm cursor-pointer",
        },
        allowBase64: true,
        inline: false,
      }),

      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          class: "text-blue-600 underline hover:text-blue-800",
          target: "_blank",
        },
      }),

      Underline,

      // ✅ Table Extensions
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "border-collapse table-auto w-full my-6",
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: "border border-gray-300",
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: "border border-gray-300 bg-gray-100 font-bold p-2 text-left",
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: "border border-gray-300 p-2",
        },
      }),
    ],

    immediatelyRender: false,
    content,

    editorProps: {
      attributes: {
        class:
          "prose prose-lg max-w-none p-8 min-h-96 focus:outline-none bg-white text-black prose-headings:font-bold prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl prose-a:text-blue-600 prose-img:rounded-xl prose-img:shadow-md prose-img:my-10 prose-table:border-collapse prose-table:w-full prose-td:border prose-td:border-gray-300 prose-td:p-2 prose-th:border prose-th:border-gray-300 prose-th:bg-gray-100 prose-th:p-2 prose-th:font-bold",
      },
      editable: () => true,
    },

    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    onCreate: ({ editor }) => onCreate?.({ editor }),
    
    // ✅ Show floating menu when text is selected
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;
      const hasSelection = from !== to;

      if (hasSelection) {
        // Get selection coordinates
        const { view } = editor;
        const { from: fromPos } = view.state.selection;
        const start = view.coordsAtPos(fromPos);
        
        // Position the floating menu above the selection
        const menuWidth = 400; // Approximate width of floating menu
        const left = start.left - menuWidth / 2;
        const top = start.top - 60; // Position above selection

        setFloatingMenuPosition({ top, left });
        setShowFloatingMenu(true);
      } else {
        setShowFloatingMenu(false);
      }
    },
  });

  // ✅ Close floating menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (floatingMenuRef.current && !floatingMenuRef.current.contains(event.target as Node)) {
        if (!editor?.state.selection.empty) return; // Keep open if text is still selected
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [editor]);

  const addImage = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true;

    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files) return;

      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          editor?.chain().focus().setImage({ src: ev.target?.result as string }).run();
        };
        reader.readAsDataURL(file);
      });
    };

    input.click();
  };

  const openLinkModal = () => {
    setLinkUrl(editor?.getAttributes("link").href || "");
    setLinkModalOpen(true);
  };

  const applyLink = () => {
    if (!editor) return;
    if (!linkUrl) editor.chain().focus().unsetLink().run();
    else editor.chain().focus().setLink({ href: linkUrl }).run();
    setLinkModalOpen(false);
    setLinkUrl("");
  };

  // ✅ Table functions
  const insertTable = () => {
    editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    setShowTableMenu(false);
  };

  if (!editor)
    return <div className="p-10 text-center text-gray-500">Loading editor...</div>;

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Bold */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2.5 rounded-lg transition-all ${
              editor.isActive("bold")
                ? "bg-indigo-600 text-white"
                : "hover:bg-gray-200 text-gray-700"
            }`}
          >
            <BoldIcon className="w-5 h-5" />
          </button>

          {/* Italic */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2.5 rounded-lg transition-all ${
              editor.isActive("italic")
                ? "bg-indigo-600 text-white"
                : "hover:bg-gray-200 text-gray-700"
            }`}
          >
            <ItalicIcon className="w-5 h-5" />
          </button>

          {/* Underline */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2.5 rounded-lg transition-all ${
              editor.isActive("underline")
                ? "bg-indigo-600 text-white"
                : "hover:bg-gray-200 text-gray-700"
            }`}
          >
            <UnderlineIcon className="w-5 h-5" />
          </button>

          <div className="w-px h-8 bg-gray-300 mx-2" />

          {/* Headings */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
              editor.isActive("heading", { level: 1 })
                ? "bg-indigo-600 text-white"
                : "hover:bg-gray-200 text-gray-700"
            }`}
          >
            H1
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
              editor.isActive("heading", { level: 2 })
                ? "bg-indigo-600 text-white"
                : "hover:bg-gray-200 text-gray-700"
            }`}
          >
            H2
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
              editor.isActive("heading", { level: 3 })
                ? "bg-indigo-600 text-white"
                : "hover:bg-gray-200 text-gray-700"
            }`}
          >
            H3
          </button>

          <div className="w-px h-8 bg-gray-300 mx-2" />

          {/* Ordered List */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2.5 rounded-lg transition-all ${
              editor.isActive("orderedList")
                ? "bg-indigo-600 text-white"
                : "hover:bg-gray-200 text-gray-700"
            }`}
          >
            <ListOrderedIcon className="w-5 h-5" />
          </button>

          {/* Bullet List */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2.5 rounded-lg transition-all ${
              editor.isActive("bulletList")
                ? "bg-indigo-600 text-white"
                : "hover:bg-gray-200 text-gray-700"
            }`}
          >
            <ListIcon className="w-5 h-5" />
          </button>

          <div className="w-px h-8 bg-gray-300 mx-2" />

          {/* Quote */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-2.5 rounded-lg transition-all ${
              editor.isActive("blockquote")
                ? "bg-indigo-600 text-white"
                : "hover:bg-gray-200 text-gray-700"
            }`}
          >
            <QuoteIcon className="w-5 h-5" />
          </button>

          {/* Code Block */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`p-2.5 rounded-lg transition-all ${
              editor.isActive("codeBlock")
                ? "bg-indigo-600 text-white"
                : "hover:bg-gray-200 text-gray-700"
            }`}
          >
            <CodeIcon className="w-5 h-5" />
          </button>

          {/* ✅ Table Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowTableMenu(!showTableMenu)}
              className={`p-2.5 rounded-lg transition-all ${
                editor.isActive("table")
                  ? "bg-indigo-600 text-white"
                  : "hover:bg-gray-200 text-gray-700"
              }`}
            >
              <TableIcon className="w-5 h-5" />
            </button>

            {/* ✅ Table Dropdown Menu */}
            {showTableMenu && (
              <div className="absolute top-full mt-2 left-0 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-10 w-48">
                {!editor.isActive("table") ? (
                  <button
                    type="button"
                    onClick={insertTable}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded flex items-center gap-2 text-sm text-gray-700"
                  >
                    <TableIcon className="w-4 h-4" />
                    Insert Table (3x3)
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        editor.chain().focus().addColumnBefore().run();
                        setShowTableMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded flex items-center gap-2 text-sm text-gray-700"
                    >
                      <Plus className="w-4 h-4" />
                      Add Column Before
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        editor.chain().focus().addColumnAfter().run();
                        setShowTableMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded flex items-center gap-2 text-sm text-gray-700"
                    >
                      <Plus className="w-4 h-4" />
                      Add Column After
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        editor.chain().focus().deleteColumn().run();
                        setShowTableMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded flex items-center gap-2 text-sm text-red-600"
                    >
                      <Minus className="w-4 h-4" />
                      Delete Column
                    </button>
                    <div className="border-t border-gray-200 my-1" />
                    <button
                      type="button"
                      onClick={() => {
                        editor.chain().focus().addRowBefore().run();
                        setShowTableMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded flex items-center gap-2 text-sm text-gray-700"
                    >
                      <Plus className="w-4 h-4" />
                      Add Row Before
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        editor.chain().focus().addRowAfter().run();
                        setShowTableMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded flex items-center gap-2 text-sm text-gray-700"
                    >
                      <Plus className="w-4 h-4" />
                      Add Row After
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        editor.chain().focus().deleteRow().run();
                        setShowTableMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded flex items-center gap-2 text-sm text-red-600"
                    >
                      <Minus className="w-4 h-4" />
                      Delete Row
                    </button>
                    <div className="border-t border-gray-200 my-1" />
                    <button
                      type="button"
                      onClick={() => {
                        editor.chain().focus().deleteTable().run();
                        setShowTableMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-red-50 rounded flex items-center gap-2 text-sm text-red-600 font-semibold"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Table
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Right side actions */}
          <div className="ml-auto flex gap-2">
            <button
              type="button"
              onClick={openLinkModal}
              className={`p-2.5 rounded-lg transition-all ${
                editor.isActive("link")
                  ? "bg-purple-600 text-white"
                  : "hover:bg-gray-200 text-gray-700"
              }`}
            >
              <Link2Icon className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={addImage}
              className="p-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md"
            >
              <ImageIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* ✅ FLOATING TOOLBAR - Appears when text is selected */}
      {showFloatingMenu && (
        <div
          ref={floatingMenuRef}
          style={{
            position: 'fixed',
            top: `${floatingMenuPosition.top}px`,
            left: `${floatingMenuPosition.left}px`,
            zIndex: 1000,
          }}
          className="flex items-center gap-1 bg-gray-900 p-2 rounded-lg shadow-2xl border border-gray-700 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {/* Bold */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded transition-colors ${
              editor.isActive("bold")
                ? "bg-indigo-600 text-white"
                : "text-gray-300 hover:bg-gray-800"
            }`}
            title="Bold"
          >
            <BoldIcon className="w-4 h-4" />
          </button>

          {/* Italic */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded transition-colors ${
              editor.isActive("italic")
                ? "bg-indigo-600 text-white"
                : "text-gray-300 hover:bg-gray-800"
            }`}
            title="Italic"
          >
            <ItalicIcon className="w-4 h-4" />
          </button>

          {/* Underline */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2 rounded transition-colors ${
              editor.isActive("underline")
                ? "bg-indigo-600 text-white"
                : "text-gray-300 hover:bg-gray-800"
            }`}
            title="Underline"
          >
            <UnderlineIcon className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-gray-700 mx-1" />

          {/* H1 */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-2 rounded transition-colors ${
              editor.isActive("heading", { level: 1 })
                ? "bg-indigo-600 text-white"
                : "text-gray-300 hover:bg-gray-800"
            }`}
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </button>

          {/* H2 */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-2 rounded transition-colors ${
              editor.isActive("heading", { level: 2 })
                ? "bg-indigo-600 text-white"
                : "text-gray-300 hover:bg-gray-800"
            }`}
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>

          {/* H3 */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-2 rounded transition-colors ${
              editor.isActive("heading", { level: 3 })
                ? "bg-indigo-600 text-white"
                : "text-gray-300 hover:bg-gray-800"
            }`}
            title="Heading 3"
          >
            <Heading3 className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-gray-700 mx-1" />

          {/* Link */}
          <button
            type="button"
            onClick={openLinkModal}
            className={`p-2 rounded transition-colors ${
              editor.isActive("link")
                ? "bg-purple-600 text-white"
                : "text-gray-300 hover:bg-gray-800"
            }`}
            title="Add Link"
          >
            <Link2Icon className="w-4 h-4" />
          </button>

          {/* Quote */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-2 rounded transition-colors ${
              editor.isActive("blockquote")
                ? "bg-indigo-600 text-white"
                : "text-gray-300 hover:bg-gray-800"
            }`}
            title="Quote"
          >
            <QuoteIcon className="w-4 h-4" />
          </button>

          {/* Code */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`p-2 rounded transition-colors ${
              editor.isActive("code")
                ? "bg-indigo-600 text-white"
                : "text-gray-300 hover:bg-gray-800"
            }`}
            title="Code"
          >
            <CodeIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Link Modal */}
      {linkModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Insert Link</h2>
            <input
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800"
              placeholder="Enter URL"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-gray-800"
                onClick={() => setLinkModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                onClick={applyLink}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editor */}
      <EditorContent editor={editor} className="min-h-96 bg-white" />

      {/* Styles */}
      <style jsx global>{`
        .ProseMirror img {
          position: relative;
          transition: outline 0.2s;
        }
        .ProseMirror img:hover {
          outline: 4px solid rgba(99, 102, 241, 0.5);
        }
        
        /* ✅ Table Styles */
        .ProseMirror table {
          border-collapse: collapse;
          margin: 1.5rem 0;
          width: 100%;
        }
        .ProseMirror th {
          background-color: #f3f4f6;
          font-weight: bold;
          text-align: left;
        }
        .ProseMirror td,
        .ProseMirror th {
          border: 1px solid #d1d5db;
          padding: 0.5rem;
          min-width: 100px;
        }
        .ProseMirror .selectedCell {
          background-color: #dbeafe;
        }

        /* Animations */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInFromTop {
          from { transform: translateY(-8px); }
          to { transform: translateY(0); }
        }
        .animate-in {
          animation: fadeIn 200ms ease-out, slideInFromTop 200ms ease-out;
        }
      `}</style>
    </div>
  );
};

export default NovelEditor;