import { useState, useEffect } from 'react';
import { Loader2, Share2, Settings, Send, Twitter, Instagram, Linkedin, Facebook, Film, User, Mail, Link } from 'lucide-react';
import { CopyButton } from '@/components/CopyButton';
import { QuickActions } from '@/components/QuickActions';
import { generateSharePosts } from '@/lib/generator';
import { supabase, type UserSettings, type SocialLinks, type Generation } from '@/lib/supabase';

type ManagementPanelProps = {
  generations: Generation[];
};

type SubTab = 'share' | 'settings';

const platformIcons: Record<string, typeof Twitter> = {
  'X (Twitter)': Twitter,
  Instagram: Instagram,
  LinkedIn: Linkedin,
  Facebook: Facebook,
  TikTok: Film,
};

const platformColors: Record<string, string> = {
  'X (Twitter)': 'hover:border-neutral-400',
  Instagram: 'hover:border-pink-500/50',
  LinkedIn: 'hover:border-blue-500/50',
  Facebook: 'hover:border-blue-400/50',
  TikTok: 'hover:border-neutral-400',
};

function getGenContent(gen: Generation): string {
  if (gen.result.text) return gen.result.text.content;
  if (gen.result.code) return gen.result.code.code;
  if (gen.result.image) return gen.prompt;
  return '';
}

export function ManagementPanel({ generations }: ManagementPanelProps) {
  const [subTab, setSubTab] = useState<SubTab>('share');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center">
          <Settings className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-neutral-900">Management</h3>
          <p className="text-xs text-neutral-500">Share content to platforms and manage your profile</p>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2 border-b border-neutral-200">
        <button
          onClick={() => setSubTab('share')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all border-b-2 ${
            subTab === 'share' ? 'text-red-600 border-red-600' : 'text-neutral-400 border-transparent hover:text-neutral-600'
          }`}
        >
          <Share2 className="w-4 h-4" />
          Share Content
        </button>
        <button
          onClick={() => setSubTab('settings')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all border-b-2 ${
            subTab === 'settings' ? 'text-red-600 border-red-600' : 'text-neutral-400 border-transparent hover:text-neutral-600'
          }`}
        >
          <User className="w-4 h-4" />
          Settings
        </button>
      </div>

      {subTab === 'share' && <ShareTab generations={generations} />}
      {subTab === 'settings' && <SettingsTab />}
    </div>
  );
}

// ─── SHARE TAB ───────────────────────────────────────────────────

function ShareTab({ generations }: { generations: Generation[] }) {
  const [selectedGen, setSelectedGen] = useState<Generation | null>(null);
  const [sharePosts, setSharePosts] = useState<ReturnType<typeof generateSharePosts> | null>(null);

  const textGens = generations.filter((g) => g.tool === 'text' || g.tool === 'image' || g.tool === 'code');

  const handleSelect = (gen: Generation) => {
    setSelectedGen(gen);
    let content = '';
    if (gen.tool === 'text' && gen.result.text) {
      content = gen.result.text.content;
    } else if (gen.tool === 'code' && gen.result.code) {
      content = gen.result.code.code;
    } else if (gen.tool === 'image' && gen.result.image) {
      content = `Generated image: ${gen.prompt}`;
    }
    const posts = generateSharePosts(gen.tool, gen.prompt, content);
    setSharePosts(posts);
  };

  return (
    <div className="space-y-5">
      {/* Select content to share */}
      <div>
        <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">Select content to share</p>
        {textGens.length === 0 ? (
          <div className="text-center py-8 bg-neutral-50 border border-neutral-200 rounded-xl">
            <Share2 className="w-6 h-6 text-neutral-300 mx-auto mb-2" />
            <p className="text-sm text-neutral-400">Generate text, images, or code first — then share them here.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {textGens.map((gen) => (
              <div
                key={gen.id}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all border ${
                  selectedGen?.id === gen.id
                    ? 'bg-red-50 border-red-200'
                    : 'bg-white border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <button
                  onClick={() => handleSelect(gen)}
                  className="flex items-center gap-3 flex-1 min-w-0 text-left"
                >
                  <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${
                    gen.tool === 'text' ? 'bg-red-100 text-red-600' : gen.tool === 'image' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                  }`}>
                    {gen.tool}
                  </span>
                  <p className="text-sm text-neutral-600 truncate flex-1">{gen.prompt}</p>
                </button>
                <QuickActions
                  text={getGenContent(gen)}
                  fileName={`${gen.tool}-output.txt`}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Share posts */}
      {sharePosts && (
        <div className="space-y-4">
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Platform-adapted posts</p>
          {sharePosts.posts.map((post, i) => {
            const Icon = platformIcons[post.platform] ?? Link;
            const fullText = `${post.text}\n\n${post.hashtags.join(' ')}`;
            return (
              <div key={i} className={`bg-neutral-50 border border-neutral-200 rounded-xl p-5 transition-colors ${platformColors[post.platform]}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-red-600" />
                    <h4 className="text-sm font-bold text-neutral-900">{post.platform}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <CopyButton text={fullText} label="Copy" />
                    <QuickActions
                      text={fullText}
                      fileName={`${post.platform}-post.txt`}
                    />
                  </div>
                </div>
                <pre className="text-sm text-neutral-700 whitespace-pre-wrap font-sans leading-relaxed bg-white rounded-lg p-3 border border-neutral-200 mb-3">
                  {post.text}
                </pre>
                <div className="flex flex-wrap gap-1.5">
                  {post.hashtags.map((h, j) => (
                    <span key={j} className="text-xs text-red-600 bg-red-50 rounded-full px-2.5 py-1 border border-red-200">{h}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── SETTINGS TAB ────────────────────────────────────────────────

function SettingsTab() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const { data } = await supabase.from('user_settings').select('*').eq('id', 1).single();
    setSettings(data as UserSettings | null);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    setSaved(false);
    await supabase.from('user_settings').update({
      name: settings.name,
      email: settings.email,
      bio: settings.bio,
      avatar_url: settings.avatar_url,
      social_links: settings.social_links,
      updated_at: new Date().toISOString(),
    }).eq('id', 1);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const updateSocialLink = (key: keyof SocialLinks, value: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      social_links: { ...settings.social_links, [key]: value },
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-red-600 animate-spin" />
      </div>
    );
  }

  if (!settings) {
    return <div className="text-center py-8 text-sm text-neutral-400">Failed to load settings.</div>;
  }

  const socialFields: { key: keyof SocialLinks; label: string; icon: typeof Twitter }[] = [
    { key: 'twitter', label: 'X (Twitter)', icon: Twitter },
    { key: 'instagram', label: 'Instagram', icon: Instagram },
    { key: 'linkedin', label: 'LinkedIn', icon: Linkedin },
    { key: 'facebook', label: 'Facebook', icon: Facebook },
    { key: 'tiktok', label: 'TikTok', icon: Film },
  ];

  return (
    <div className="space-y-5">
      {/* Profile section */}
      <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-5 space-y-4">
        <h4 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
          <User className="w-4 h-4 text-red-600" />
          Profile Information
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1.5">Name</label>
            <input
              type="text"
              value={settings.name}
              onChange={(e) => setSettings({ ...settings, name: e.target.value })}
              placeholder="Your name"
              className="w-full px-3 py-2.5 text-sm text-neutral-900 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-all placeholder:text-neutral-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1.5">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full pl-9 pr-3 py-2.5 text-sm text-neutral-900 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-all placeholder:text-neutral-400"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1.5">Bio</label>
          <textarea
            value={settings.bio}
            onChange={(e) => setSettings({ ...settings, bio: e.target.value })}
            placeholder="Tell people about yourself..."
            rows={3}
            className="w-full px-3 py-2.5 text-sm text-neutral-900 bg-white border border-neutral-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-all placeholder:text-neutral-400"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1.5">Avatar URL</label>
          <input
            type="url"
            value={settings.avatar_url}
            onChange={(e) => setSettings({ ...settings, avatar_url: e.target.value })}
            placeholder="https://..."
            className="w-full px-3 py-2.5 text-sm text-neutral-900 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-all placeholder:text-neutral-400"
          />
        </div>
      </div>

      {/* Social links */}
      <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-5 space-y-4">
        <h4 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
          <Link className="w-4 h-4 text-red-600" />
          Social Media Links
        </h4>
        <div className="space-y-3">
          {socialFields.map((field) => {
            const Icon = field.icon;
            return (
              <div key={field.key}>
                <label className="flex items-center gap-2 text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1.5">
                  <Icon className="w-3.5 h-3.5" />
                  {field.label}
                </label>
                <input
                  type="url"
                  value={settings.social_links?.[field.key] || ''}
                  onChange={(e) => updateSocialLink(field.key, e.target.value)}
                  placeholder={`https://${field.label.toLowerCase().replace(/[^a-z]/g, '')}.com/...`}
                  className="w-full px-3 py-2.5 text-sm text-neutral-900 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-all placeholder:text-neutral-400"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Save button */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-500 hover:-translate-y-0.5 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Send className="w-4 h-4" /> Save Settings</>}
        </button>
        {saved && <span className="text-sm text-green-600">Settings saved!</span>}
      </div>
    </div>
  );
}
