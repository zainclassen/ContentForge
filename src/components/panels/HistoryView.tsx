import { useState } from 'react';
import { Trash2, Clock, FileText, Image, Code2, Search, ChevronRight } from 'lucide-react';
import { CopyButton } from '@/components/CopyButton';
import { QuickActions } from '@/components/QuickActions';
import type { Generation } from '@/lib/supabase';

type HistoryViewProps = {
  generations: Generation[];
  onDelete: (id: string) => void;
  onReuse: (gen: Generation) => void;
  onShare?: (gen: Generation) => void;
};

const toolIcons: Record<string, typeof FileText> = {
  text: FileText,
  image: Image,
  code: Code2,
};

const toolBadgeColors: Record<string, string> = {
  text: 'bg-red-100 text-red-600',
  image: 'bg-blue-100 text-blue-600',
  code: 'bg-green-100 text-green-600',
};

function getGenContent(gen: Generation): string {
  if (gen.result.text) return gen.result.text.content;
  if (gen.result.code) return gen.result.code.code;
  if (gen.result.image) return gen.prompt;
  return '';
}

export function HistoryView({ generations, onDelete, onReuse, onShare }: HistoryViewProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = generations.filter((g) => {
    const matchesSearch = g.prompt.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || g.tool === filter;
    return matchesSearch && matchesFilter;
  });

  const filterTabs = ['all', 'text', 'image', 'code'];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center">
          <Clock className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-neutral-900">History</h3>
          <p className="text-xs text-neutral-500">Browse and reuse your past prompts and generated content</p>
        </div>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search prompts..."
            className="w-full pl-9 pr-3 py-2.5 text-sm text-neutral-900 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-all placeholder:text-neutral-400"
          />
        </div>
        <div className="flex gap-2">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-2.5 text-xs font-medium rounded-xl border transition-all capitalize ${
                filter === tab
                  ? 'bg-red-600 border-red-600 text-white'
                  : 'bg-white border-neutral-200 text-neutral-500 hover:border-neutral-300'
              }`}
            >
              {tab === 'all' ? 'All' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-neutral-50 border border-neutral-200 rounded-xl">
          <Clock className="w-8 h-8 text-neutral-300 mx-auto mb-3" />
          <p className="text-sm text-neutral-400">
            {generations.length === 0 ? 'No generations yet. Use any tool to get started!' : 'No results match your search.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((gen) => {
            const Icon = toolIcons[gen.tool] ?? FileText;
            const isExpanded = expanded === gen.id;
            const content = getGenContent(gen);
            return (
              <div
                key={gen.id}
                className="bg-neutral-50 border border-neutral-200 rounded-xl overflow-hidden transition-all hover:border-neutral-300"
              >
                {/* Header row */}
                <div
                  onClick={() => setExpanded(isExpanded ? null : gen.id)}
                  className="flex items-start gap-3 p-4 cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-lg bg-neutral-200 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-red-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${toolBadgeColors[gen.tool]}`}>
                        {gen.tool}
                      </span>
                      <span className="text-xs text-neutral-400">
                        {new Date(gen.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-800 font-medium line-clamp-2">{gen.prompt}</p>
                    {/* Options tags */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {gen.options.contentType && <span className="text-xs text-neutral-500 bg-neutral-200 px-2 py-0.5 rounded">{gen.options.contentType}</span>}
                      {gen.options.artStyle && <span className="text-xs text-neutral-500 bg-neutral-200 px-2 py-0.5 rounded">{gen.options.artStyle}</span>}
                      {gen.options.language && <span className="text-xs text-neutral-500 bg-neutral-200 px-2 py-0.5 rounded">{gen.options.language}</span>}
                      {gen.options.tone && <span className="text-xs text-neutral-500 bg-neutral-200 px-2 py-0.5 rounded">{gen.options.tone}</span>}
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-neutral-400 flex-shrink-0 mt-1 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="border-t border-neutral-200 p-4 space-y-3">
                    {/* Quick actions bar */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-neutral-400 uppercase tracking-wide">Content</span>
                      <QuickActions
                        text={content}
                        fileName={`${gen.tool}-output.txt`}
                        onShare={onShare ? () => onShare(gen) : undefined}
                      />
                    </div>

                    {/* Text result */}
                    {gen.result.text && (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">{gen.result.text.title}</p>
                          <CopyButton text={gen.result.text.content} label="Copy" />
                        </div>
                        <pre className="text-sm text-neutral-700 whitespace-pre-wrap font-sans leading-relaxed bg-white rounded-lg p-3 border border-neutral-200 max-h-64 overflow-y-auto">
                          {gen.result.text.content}
                        </pre>
                      </div>
                    )}

                    {/* Image result */}
                    {gen.result.image && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {gen.result.image.images.map((img, i) => (
                          <div key={i} className="rounded-lg overflow-hidden border border-neutral-200">
                            <img src={img.url} alt={img.concept} className="w-full h-auto" />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Code result */}
                    {gen.result.code && (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-mono text-red-600 bg-red-100 px-2 py-1 rounded">{gen.result.code.language}</span>
                          <CopyButton text={gen.result.code.code} label="Copy code" />
                        </div>
                        <pre className="text-xs bg-neutral-900 rounded-xl p-3 overflow-x-auto leading-relaxed border border-neutral-700 max-h-64 overflow-y-auto">
                          <code className="font-mono text-neutral-300">{gen.result.code.code}</code>
                        </pre>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => onReuse(gen)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-500 transition-all"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Reuse Prompt
                      </button>
                      <button
                        onClick={() => onDelete(gen.id)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-200 text-neutral-500 text-xs font-semibold rounded-lg hover:text-red-600 hover:bg-neutral-300 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
