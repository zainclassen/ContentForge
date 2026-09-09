import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type ToolKey = 'text' | 'image' | 'code';
export type ViewKey = 'text' | 'image' | 'code' | 'management' | 'history';

export type GenerationOptions = {
  contentType?: string;
  artStyle?: string;
  language?: string;
  objective?: string;
  audience?: string;
  tone?: string;
};

export type TextResult = {
  title: string;
  content: string;
  wordCount: number;
};

export type ImageResult = {
  images: { concept: string; url: string; aspectRatio: string }[];
};

export type CodeResult = {
  language: string;
  description: string;
  code: string;
};

export type SharePost = {
  platform: string;
  text: string;
  hashtags: string[];
};

export type ShareResult = {
  posts: SharePost[];
};

export type GenerationResult = {
  text?: TextResult;
  image?: ImageResult;
  code?: CodeResult;
  share?: ShareResult;
};

export type SocialLinks = {
  tiktok?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  facebook?: string;
  youtube?: string;
};

export type UserSettings = {
  id: number;
  name: string;
  email: string;
  bio: string;
  avatar_url: string;
  social_links: SocialLinks;
  updated_at: string;
};

export type Generation = {
  id: string;
  tool: ToolKey;
  prompt: string;
  options: GenerationOptions;
  result: GenerationResult;
  created_at: string;
};
