import { useState, useEffect } from 'react';
import { Loader2, Sparkles, FileText } from 'lucide-react';
import { CopyButton } from '@/components/CopyButton';
import { CharCounter } from '@/components/CharCounter';
import { generateText } from '@/lib/generator';
import type { TextResult, GenerationOptions } from '@/lib/supabase';

const CONTENT_TYPES = ['Blog', 'Poem', 'Caption', 'Landing Page', 'Newsletter', 'Product Description', 'Email'];
const TONES = ['Professional', 'Authoritative', 'Witty', 'Casual', 'Inspirational', 'Bold'];

type ReuseData = { prompt: string; options: Record<string, string | undefined> } | null;

type TextPanelProps = {
  reuseData?: ReuseData;
  onSave: (prompt: string, options: GenerationOptions, result: TextResult) => void;
};

export function TextPanel({ reuseData, onSave }: TextPanelProps) {
  const [prompt, setPrompt] = useState(reuseData?.prompt || '');
  const [contentType, setContentType] = useState(reuseData?.options?.contentType || 'Blog');
  const [tone, setTone] = useState(reuseData?.options?.tone || 'Professional');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TextResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (reuseData) {
      setPrompt(reuseData.prompt);
      setContentType(reuseData.options?.contentType || 'Blog');
      setTone(reuseData.options?.tone || 'Professional');
    }
  }, [reuseData]);

  const handleGenerate = () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt.');
      return;
    }
    setLoading(true);
    setError(null);
    const options: GenerationOptions = { contentType, tone };
    setTimeout(() => {
      const res = generateText(prompt.trim(), options);
      setResult(res);
      setLoading(false);
      onSave(prompt.trim(), options, res);
    }, 700);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-neutral-900">Text Generator</h3>
          <p className="text-xs text-neutral-500">Blogs, poems, captions, landing pages, newsletters, and more</p>
        </div>
      </div>

      {/* Input */}
      <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-5 space-y-4">
        <div>
          <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1.5">
            What do you want to write about?
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., The benefits of morning meditation for busy parents"
            rows={3}
            className="w-full px-4 py-3 text-sm text-neutral-900 bg-white border border-neutral-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all placeholder:text-neutral-400"
          />
          <CharCounter text={prompt} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1.5">Content Type</label>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              className="w-full px-3 py-2.5 text-sm text-neutral-900 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-all cursor-pointer"
            >
              {CONTENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1.5">Tone</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full px-3 py-2.5 text-sm text-neutral-900 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-all cursor-pointer"
            >
              {TONES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
        {error && <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-sm text-red-600">{error}</div>}
        <button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-500 hover:-translate-y-0.5 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> Generate Text</>}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-neutral-900">{result.title}</h4>
            <div className="flex items-center gap-3">
              <span className="text-xs text-neutral-400">{result.wordCount} words</span>
              <CopyButton text={result.content} label="Copy" />
            </div>
          </div>
          <pre className="text-sm text-neutral-700 whitespace-pre-wrap font-sans leading-relaxed bg-white rounded-lg p-4 border border-neutral-200">
            {result.content}
          </pre>
        </div>
      )}
    </div>
  );
}
