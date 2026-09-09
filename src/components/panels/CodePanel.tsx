import { useState, useEffect } from 'react';
import { Loader2, Sparkles, Code2 } from 'lucide-react';
import { CopyButton } from '@/components/CopyButton';
import { CharCounter } from '@/components/CharCounter';
import { generateCode, getLanguages } from '@/lib/generator';
import type { CodeResult, GenerationOptions } from '@/lib/supabase';

const LANGUAGES = getLanguages();

type ReuseData = { prompt: string; options: Record<string, string | undefined> } | null;

type CodePanelProps = {
  reuseData?: ReuseData;
  onSave: (prompt: string, options: GenerationOptions, result: CodeResult) => void;
};

export function CodePanel({ reuseData, onSave }: CodePanelProps) {
  const [prompt, setPrompt] = useState(reuseData?.prompt || '');
  const [language, setLanguage] = useState(reuseData?.options?.language || 'JavaScript');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CodeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (reuseData) {
      setPrompt(reuseData.prompt);
      setLanguage(reuseData.options?.language || 'JavaScript');
    }
  }, [reuseData]);

  const handleGenerate = () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt.');
      return;
    }
    setLoading(true);
    setError(null);
    const options: GenerationOptions = { language };
    setTimeout(() => {
      const res = generateCode(prompt.trim(), options);
      setResult(res);
      setLoading(false);
      onSave(prompt.trim(), options, res);
    }, 700);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center">
          <Code2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-neutral-900">Code Generator</h3>
          <p className="text-xs text-neutral-500">Generate code in any programming language from your prompt</p>
        </div>
      </div>

      {/* Input */}
      <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-5 space-y-4">
        <div>
          <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1.5">
            What should the code do?
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A function that sorts an array of objects by a given key"
            rows={3}
            className="w-full px-4 py-3 text-sm text-neutral-900 bg-white border border-neutral-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all placeholder:text-neutral-400"
          />
          <CharCounter text={prompt} limits={[{ platform: 'Prompt', limit: 500 }]} />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1.5">Programming Language</label>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                  language === lang
                    ? 'bg-red-600 border-red-600 text-white'
                    : 'bg-white border-neutral-200 text-neutral-500 hover:border-neutral-300'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>
        {error && <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-sm text-red-600">{error}</div>}
        <button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-500 hover:-translate-y-0.5 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> Generate Code</>}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-red-600 bg-red-100 px-2 py-1 rounded">{result.language}</span>
              <p className="text-sm text-neutral-500">{result.description}</p>
            </div>
            <CopyButton text={result.code} label="Copy code" />
          </div>
          <pre className="text-xs bg-neutral-900 rounded-xl p-4 overflow-x-auto leading-relaxed border border-neutral-700">
            <code className="font-mono text-neutral-300">{result.code}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
