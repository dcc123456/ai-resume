import { useState, useRef } from 'react';
import { Upload, FileText, X } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSizeMB?: number;
  label?: string;
}

export default function FileUpload({ onFileSelect, accept = '.pdf,.docx', maxSizeMB = 5, label = '上传文件' }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndSetFile = (f: File | undefined) => {
    setError('');
    if (!f) return;
    const ext = f.name.split('.').pop().toLowerCase();
    if (!accept.includes(ext)) { setError(`不支持的格式，请上传 ${accept}`); return; }
    if (f.size > maxSizeMB * 1024 * 1024) { setError(`文件不能超过 ${maxSizeMB}MB`); return; }
    setFile(f);
    onFileSelect(f);
  };

  return (
    <div>
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => { e.preventDefault(); setDragActive(false); validateAndSetFile(e.dataTransfer.files[0]); }}
        onClick={() => inputRef.current?.click()}
      >
        <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={(e) => validateAndSetFile(e.target.files?.[0])} />
        {file ? (
          <div className="flex items-center justify-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" /><span className="text-sm">{file.name}</span>
            <button onClick={(e) => { e.stopPropagation(); setFile(null); setError(''); }} className="text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
          </div>
        ) : (
          <><Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" /><p className="text-sm text-gray-500">点击或拖拽上传 {label}</p><p className="text-xs text-gray-400 mt-1">支持 {accept}，最大 {maxSizeMB}MB</p></>
        )}
      </div>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}
