import { useState, useEffect, useCallback } from 'react';
import { Loader2, Sparkles, Image, Download, RefreshCw, AlertCircle } from 'lucide-react';
import { generateImage, getArtStyles } from '@/lib/generator';
import type { ImageResult, GenerationOptions } from '@/lib/supabase';

const ART_STYLES = getArtStyles();
const MAX_RETRIES = 3;
const RETRY_DELAYS = [2000, 4000, 8000];

type ReuseData = { prompt: string; options: Record<string, string | undefined> } | null;

type ImagePanelProps = {
  reuseData?: ReuseData;
  onSave: (prompt: string, options: GenerationOptions, result: ImageResult) => void;
};

type ImageState = {
  status: 'loading' | 'loaded' | 'error';
  retryCount: number;
  url: string;
  attemptId: number;
};

export function ImagePanel({ reuseData, onSave }: ImagePanelProps) {
  const [prompt, setPrompt] = useState(reuseData?.prompt || '');
  const [artStyle, setArtStyle] = useState(reuseData?.options?.artStyle || 'Photorealistic');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImageResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imageStates, setImageStates] = useState<Record<number, ImageState>>({});

  useEffect(() => {
    if (reuseData) {
      setPrompt(reuseData.prompt);
      setArtStyle(reuseData.options?.artStyle || 'Photorealistic');
    }
  }, [reuseData]);

  const handleGenerate = () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt.');
      return;
    }
    setLoading(true);
    setError(null);
    const options: GenerationOptions = { artStyle };
    setTimeout(() => {
      const res = generateImage(prompt.trim(), options);
      setResult(res);
      const states: Record<number, ImageState> = {};
      res.images.forEach((img, i) => {
        states[i] = { status: 'loading', retryCount: 0, url: img.url, attemptId: 0 };
      });
      setImageStates(states);
      setLoading(false);
      onSave(prompt.trim(), options, res);
    }, 700);
  };

  const handleImageLoad = useCallback((index: number) => {
    setImageStates((prev) => {
      if (!prev[index] || prev[index].status === 'loaded') return prev;
      return { ...prev, [index]: { ...prev[index], status: 'loaded' } };
    });
  }, []);

  const handleImageError = useCallback((index: number) => {
    setImageStates((prev) => {
      const current = prev[index];
      if (!current || current.status === 'loaded') return prev;

      if (current.retryCount < MAX_RETRIES) {
        const newCount = current.retryCount + 1;
        const delay = RETRY_DELAYS[newCount - 1] || 8000;
        const cacheBust = `${current.url.split('&retry=')[0]}&retry=${newCount}_${Date.now()}`;

        setTimeout(() => {
          setImageStates((p) => {
            if (!p[index] || p[index].status === 'loaded') return p;
            return {
              ...p,
              [index]: { status: 'loading', retryCount: newCount, url: cacheBust, attemptId: p[index].attemptId + 1 },
            };
          });
        }, delay);

        return { ...prev, [index]: { ...current, status: 'loading' } };
      }

      return { ...prev, [index]: { ...current, status: 'error' } };
    });
  }, []);

  const handleManualRetry = (index: number) => {
    setImageStates((prev) => {
      const current = prev[index];
      if (!current) return prev;
      const cacheBust = `${current.url.split('&retry=')[0]}&retry=manual_${Date.now()}`;
      return {
        ...prev,
        [index]: { status: 'loading', retryCount: 0, url: cacheBust, attemptId: current.attemptId + 1 },
      };
    });
  };

  const handleDownload = async (url: string, index: number) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `generated-image-${index + 1}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
    } catch {
      // download failed
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center">
          <Image className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-neutral-900">Image Generator</h3>
          <p className="text-xs text-neutral-500">Generate AI images in different art styles from your prompt</p>
        </div>
      </div>

      {/* Input */}
      <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-5 space-y-4">
        <div>
          <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1.5">
            Describe the image you want
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A lone astronaut standing on a cliff overlooking a vast alien ocean"
            rows={3}
            className="w-full px-4 py-3 text-sm text-neutral-900 bg-white border border-neutral-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all placeholder:text-neutral-400"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1.5">Art Style</label>
          <div className="flex flex-wrap gap-2">
            {ART_STYLES.map((style) => (
              <button
                key={style}
                onClick={() => setArtStyle(style)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                  artStyle === style
                    ? 'bg-red-600 border-red-600 text-white'
                    : 'bg-white border-neutral-200 text-neutral-500 hover:border-neutral-300'
                }`}
              >
                {style}
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
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> Generate Images</>}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {result.images.map((img, i) => {
            const state = imageStates[i];
            const isLoading = !state || state.status === 'loading';
            const isLoaded = state?.status === 'loaded';
            const isError = state?.status === 'error';
            return (
              <div key={i} className="bg-neutral-50 border border-neutral-200 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-red-100 text-red-600 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                    <p className="text-sm font-semibold text-neutral-900">{img.concept}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-neutral-400 bg-neutral-200 px-2 py-1 rounded">{img.aspectRatio}</span>
                    {isLoaded && state && (
                      <button
                        onClick={() => handleDownload(state.url, i)}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-red-600 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </button>
                    )}
                  </div>
                </div>
                <div className="relative rounded-lg overflow-hidden border border-neutral-200 bg-neutral-100 min-h-[200px] flex items-center justify-center">
                  {isLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-10">
                      <Loader2 className="w-7 h-7 text-red-600 animate-spin" />
                      <span className="text-xs text-neutral-400">
                        {state?.retryCount && state.retryCount > 0 ? `Retrying... (attempt ${state.retryCount + 1})` : 'Loading image...'}
                      </span>
                    </div>
                  )}
                  {isError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10">
                      <AlertCircle className="w-8 h-8 text-red-400" />
                      <p className="text-sm text-neutral-500">This image failed to load.</p>
                      <button
                        onClick={() => handleManualRetry(i)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-500 transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Retry
                      </button>
                    </div>
                  )}
                  {!isError && state && (
                    <img
                      key={state.attemptId}
                      src={state.url}
                      alt={img.concept}
                      onLoad={() => handleImageLoad(i)}
                      onError={() => handleImageError(i)}
                      className={`w-full h-auto transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
