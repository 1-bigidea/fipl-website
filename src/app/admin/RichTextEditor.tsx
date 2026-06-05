'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
} from 'lucide-react'

interface Props {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: number
}

function Divider() {
  return <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-0.5 shrink-0" />
}

function ToolBtn({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void
  active: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault()
        onClick()
      }}
      title={title}
      className={`p-1.5 rounded transition-colors ${
        active
          ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-white'
      }`}
    >
      {children}
    </button>
  )
}

export default function RichTextEditor({ value, onChange, placeholder, minHeight = 280 }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({
        placeholder: placeholder ?? 'Start writing here…',
      }),
    ],
    content: value || '',
    onUpdate({ editor }) {
      const html = editor.getHTML()
      onChange(html === '<p></p>' ? '' : html)
    },
    editorProps: {
      attributes: { class: 'rich-editor-content' },
    },
    immediatelyRender: false,
  })

  if (!editor) return null

  const a = (name: string, attrs?: Record<string, unknown>) => editor.isActive(name, attrs)

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden focus-within:border-[#DB1B0C] focus-within:ring-2 focus-within:ring-[#DB1B0C]/10 transition-shadow">
      <div className="flex items-center flex-wrap gap-0.5 px-2 py-1.5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60">
        <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} active={a('bold')} title="Bold (Ctrl+B)">
          <Bold className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={a('italic')} title="Italic (Ctrl+I)">
          <Italic className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={a('underline')} title="Underline (Ctrl+U)">
          <UnderlineIcon className="w-3.5 h-3.5" />
        </ToolBtn>

        <Divider />

        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={a('heading', { level: 2 })} title="Heading 2">
          <Heading2 className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={a('heading', { level: 3 })} title="Heading 3">
          <Heading3 className="w-3.5 h-3.5" />
        </ToolBtn>

        <Divider />

        <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={a('bulletList')} title="Bullet list">
          <List className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={a('orderedList')} title="Numbered list">
          <ListOrdered className="w-3.5 h-3.5" />
        </ToolBtn>

        <Divider />

        <ToolBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={a('blockquote')} title="Blockquote">
          <Quote className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} active={false} title="Divider line">
          <Minus className="w-3.5 h-3.5" />
        </ToolBtn>
      </div>

      <div className="bg-white dark:bg-gray-800" style={{ minHeight }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
