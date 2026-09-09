import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

type CopyButtonProps = {
  text: string;
  label: string;
};

export function CopyButton({ text, label }: CopyButtonProps) {
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

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-red-600 transition-colors"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-red-600" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Copied!' : label}
    </button>
  );
}
