import { useState } from 'react';
import { Copy, Download, Share2, Check } from 'lucide-react';

type QuickActionsProps = {
  text: string;
  fileName?: string;
  onShare?: () => void;
};

export function QuickActions({ text, fileName = 'content.txt', onShare }: QuickActionsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available
    }
  };

  const handleDownload = () => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={handleCopy}
        title="Copy"
        className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
      >
        {copied ? <Check className="w-4 h-4 text-red-600" /> : <Copy className="w-4 h-4" />}
      </button>
      <button
        onClick={handleDownload}
        title="Download"
        className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
      >
        <Download className="w-4 h-4" />
      </button>
      {onShare && (
        <button
          onClick={onShare}
          title="Share"
          className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <Share2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
