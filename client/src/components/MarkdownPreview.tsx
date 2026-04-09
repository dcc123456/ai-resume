import ReactMarkdown from 'react-markdown';

interface MarkdownPreviewProps {
  content: string;
  editable?: boolean;
  onChange?: (value: string) => void;
}

export default function MarkdownPreview({ content, editable = false, onChange }: MarkdownPreviewProps) {
  if (editable && onChange) {
    return <textarea value={content} onChange={(e) => onChange(e.target.value)} className="w-full min-h-[500px] p-4 font-mono text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />;
  }
  return <div className="prose prose-sm max-w-none border rounded-lg p-6 bg-white"><ReactMarkdown>{content}</ReactMarkdown></div>;
}
