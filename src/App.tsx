import { useState, useEffect, useCallback } from 'react';
import {
  History, X, Wand2, FileText, Image, Code2, Settings,
} from 'lucide-react';
import { supabase, type Generation, type ViewKey, type ToolKey, type GenerationResult } from '@/lib/supabase';
import { TextPanel } from '@/components/panels/TextPanel';
import { ImagePanel } from '@/components/panels/ImagePanel';
import { CodePanel } from '@/components/panels/CodePanel';
import { ManagementPanel } from '@/components/panels/ManagementPanel';
import { HistoryView } from '@/components/panels/HistoryView';

const navItems: { key: ViewKey; label: string; icon: typeof FileText; description: string }[] = [
  { key: 'text', label: 'Text Generator', icon: FileText, description: 'Blogs, poems, captions & more' },
  { key: 'image', label: 'Image Generator', icon: Image, description: 'Generate AI images in any style' },
  { key: 'code', label: 'Code Generator', icon: Code2, description: 'Code in any language' },
  { key: 'management', label: 'Management', icon: Settings, description: 'Share content & settings' },
  { key: 'history', label: 'History', icon: History, description: 'View past prompts' },
];

function App() {
  const [activeView, setActiveView] = useState<ViewKey>('text');
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [reusePrompt, setReusePrompt] = useState<{ tool: ToolKey; prompt: string; options: Record<string, string | undefined> } | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    loadGenerations();
  }, []);

  const loadGenerations = async () => {
    const { data, error } = await supabase
      .from('generations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setError('Failed to load history.');
      return;
    }
    setGenerations(data as Generation[]);
  };

  const saveGeneration = async (
    tool: ToolKey,
    prompt: string,
    options: Record<string, string | undefined>,
    result: GenerationResult,
  ) => {
    const { data, error: insertError } = await supabase
      .from('generations')
      .insert({ tool, prompt, options, result })
      .select()
      .single();

    if (insertError || !data) {
      setError('Failed to save generation to history.');
      return;
    }
    setGenerations([data as Generation, ...generations]);
  };

  const handleDeleteGeneration = useCallback(async (id: string) => {
    const { error: deleteError } = await supabase.from('generations').delete().eq('id', id);
    if (deleteError) {
      setError('Failed to delete generation.');
      return;
    }
    setGenerations(generations.filter((g) => g.id !== id));
  }, [generations]);

  const handleReuse = (gen: Generation) => {
    setReusePrompt({
      tool: gen.tool,
      prompt: gen.prompt,
      options: gen.options as Record<string, string | undefined>,
    });
    setActiveView(gen.tool as ViewKey);
  };

  const handleShare = (_gen: Generation) => {
    setActiveView('management');
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-800">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center shadow-md shadow-red-600/30">
                <Wand2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-neutral-900 leading-tight">ContentForge</h1>
                <p className="text-xs text-neutral-500 leading-tight">AI Content Generator</p>
              </div>
            </div>
            <button
              onClick={() => setHistoryOpen(true)}
              className="lg:hidden inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-100 text-neutral-500 text-sm font-medium hover:bg-neutral-200 transition-colors border border-neutral-200"
            >
              <History className="w-4 h-4" />
              History
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
          {/* Left sidebar — navigation */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3 px-1">Tools</p>
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeView === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => setActiveView(item.key)}
                      className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${
                        isActive
                          ? 'bg-red-50 border border-red-200'
                          : 'border border-transparent hover:bg-neutral-100'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isActive ? 'bg-red-600' : 'bg-neutral-200'
                      }`}>
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-neutral-500'}`} />
                      </div>
                      <div className="min-w-0">
                        <p className={`text-sm font-medium ${isActive ? 'text-red-600' : 'text-neutral-700'}`}>
                          {item.label}
                        </p>
                        <p className="text-xs text-neutral-400">{item.description}</p>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Main content */}
          <main className="min-w-0 pb-20 lg:pb-0">
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}
            <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
              {activeView === 'text' && (
                <TextPanel
                  reuseData={reusePrompt && reusePrompt.tool === 'text' ? reusePrompt : null}
                  onSave={(p, o, r) => saveGeneration('text', p, o as Record<string, string | undefined>, { text: r })}
                />
              )}
              {activeView === 'image' && (
                <ImagePanel
                  reuseData={reusePrompt && reusePrompt.tool === 'image' ? reusePrompt : null}
                  onSave={(p, o, r) => saveGeneration('image', p, o as Record<string, string | undefined>, { image: r })}
                />
              )}
              {activeView === 'code' && (
                <CodePanel
                  reuseData={reusePrompt && reusePrompt.tool === 'code' ? reusePrompt : null}
                  onSave={(p, o, r) => saveGeneration('code', p, o as Record<string, string | undefined>, { code: r })}
                />
              )}
              {activeView === 'management' && <ManagementPanel generations={generations} />}
              {activeView === 'history' && (
                <HistoryView
                  generations={generations}
                  onDelete={handleDeleteGeneration}
                  onReuse={handleReuse}
                  onShare={handleShare}
                />
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile history drawer */}
      {historyOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setHistoryOpen(false)} />
          <div className="relative w-80 max-w-[85vw] bg-white border-r border-neutral-200 shadow-2xl overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-neutral-400" />
                <h2 className="text-sm font-semibold text-neutral-700">Navigation</h2>
              </div>
              <button onClick={() => setHistoryOpen(false)} className="text-neutral-400 hover:text-neutral-900">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => { setActiveView(item.key); setHistoryOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${
                      isActive
                        ? 'bg-red-50 border border-red-200'
                        : 'border border-transparent hover:bg-neutral-100'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isActive ? 'bg-red-600' : 'bg-neutral-200'
                    }`}>
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-neutral-500'}`} />
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${isActive ? 'text-red-600' : 'text-neutral-700'}`}>{item.label}</p>
                      <p className="text-xs text-neutral-400">{item.description}</p>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Mobile bottom nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-neutral-200 px-2 py-2">
        <div className="flex justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveView(item.key)}
                className={`flex flex-col items-center gap-1 px-2 py-1.5 rounded-lg transition-colors ${
                  isActive ? 'text-red-600' : 'text-neutral-400'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default App;
