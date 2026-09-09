import type {
  TextResult, ImageResult, CodeResult, ShareResult, GenerationOptions,
} from '@/lib/supabase';

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

// ─── TEXT GENERATOR ──────────────────────────────────────────────

function getWritingTopic(prompt: string): string {
  const topic = prompt
    .trim()
    .replace(/^(please\s+)?(write|create|generate|draft|compose|make|produce)\s+(a|an|the)?\s*(blog|article|post|caption|email|newsletter|poem|landing page|product description|piece of content)?\s*(about|on|for|regarding)?\s*/i, '')
    .replace(/^(about|on|regarding)\s+/i, '')
    .replace(/[.!?]+$/, '')
    .trim();

  return topic || 'a meaningful new idea';
}

const contentTypeTemplates: Record<string, (prompt: string, tone: string) => { title: string; body: string }> = {
  Blog: (p, t) => ({
    title: `A Practical Guide to ${p}`,
    body: `# ${p}: A Complete Guide\n\n## Introduction\n\nIn today's fast-paced world, ${p.toLowerCase()} has become more relevant than ever. Whether you're just getting started or looking to deepen your understanding, this guide walks you through everything you need to know.\n\n## Why ${p} Matters\n\nThe landscape around ${p.toLowerCase()} is evolving rapidly. Those who understand it early gain a significant advantage. Here's why it deserves your attention:\n\n- It directly impacts how you connect with your audience\n- It creates opportunities for growth that didn't exist before\n- It levels the playing field for newcomers and experts alike\n\n## Key Principles\n\n### 1. Start with Strategy\n\nBefore diving into ${p.toLowerCase()}, take a step back. What are you trying to achieve? A clear strategy turns random effort into focused progress.\n\n### 2. Consistency Over Perfection\n\nDon't wait for everything to be perfect. ${p} rewards those who show up consistently. Small, regular steps compound into remarkable results.\n\n### 3. Measure and Adapt\n\nWhat gets measured gets improved. Track your progress, learn from what works, and adjust your approach.\n\n## Practical Steps\n\n1. Define your goals around ${p.toLowerCase()}\n2. Research what's already working in your space\n3. Start small — pick one thing and do it well\n4. Review your results weekly and iterate\n\n## Conclusion\n\n${p} isn't just a trend — it's a shift in how things work. By approaching it with a ${t.toLowerCase()} mindset and a willingness to learn, you'll be well-positioned to succeed. Start today, stay consistent, and the results will follow.\n\n---\n*Want more insights on ${p.toLowerCase()}? Subscribe to our newsletter for weekly updates.*`,
  }),
  Poem: (p, t) => ({
    title: `A Reflection on ${p}`,
    body: `In the quiet hour before dawn,\n${p} whispers — a promise drawn\nfrom depths we barely know we hold,\na story waiting to be told.\n\nIt moves like light through open doors,\nthrough cracks in walls and ancient floors.\n${p} does not ask for much —\njust courage enough to stay in touch\n\nwith the part of us that still believes\nin what the heart perceives.\nAnd when it comes, it comes not loud\nbut soft, like rain on velvet ground.\n\nSo let ${p.toLowerCase()} in. Let it stay.\nLet it reshape the edges of the day.\nFor what we seek is never far —\nit lives in who we already are.`,
  }),
  Caption: (p, t) => ({
    title: `A Thoughtful Caption About ${p}`,
    body: `${p} — because sometimes the simplest shift changes everything.\n\nDouble tap if this resonates. Save it for later. Share with someone who needs to see it today.\n\nWhat's your experience with ${p.toLowerCase()}? Let me know below.`,
  }),
  'Landing Page': (p, t) => ({
    title: `A Better Way to Approach ${p}`,
    body: `**Hero Headline:**\nTransform Your Approach to ${p}\n\n**Hero Subheadline:**\nThe all-in-one solution designed to make ${p.toLowerCase()} effortless. No fluff, no complexity — just results.\n\n**Problem Section:**\nStruggling with ${p.toLowerCase()}? You're not alone. Most people waste time on approaches that don't work. The problem isn't effort — it's having the right system.\n\n**Solution Section:**\nOur approach to ${p.toLowerCase()} is different. Built on proven principles, designed for real people, and ready when you are.\n\n**Feature 1:** Everything you need in one place\n**Feature 2:** Designed to save you hours every week\n**Feature 3:** Works whether you're a beginner or a pro\n\n**Social Proof:**\n"Changed how I think about ${p.toLowerCase()}." — Real user\n\n**CTA:**\nGet Started Today — It Only Takes 60 Seconds`,
  }),
  Newsletter: (p, t) => ({
    title: `The ${p} Edition`,
    body: `## This Week: ${p}\n\nHey friends,\n\nThis week, I want to talk about ${p.toLowerCase()} — something that's been on my mind a lot lately.\n\n### The Big Idea\n\nHere's the thing about ${p.toLowerCase()}: most people overcomplicate it. They think it requires a massive overhaul, when really it's about small, intentional changes.\n\n### What's Working Right Now\n\nThree things I've noticed:\n\n1. **Simplicity wins.** The people seeing the best results with ${p.toLowerCase()} aren't doing anything fancy.\n2. **Timing matters.** There's a window right now where ${p.toLowerCase()} is especially effective.\n3. **Community helps.** Finding others working on ${p.toLowerCase()} keeps you accountable.\n\n### A Question for You\n\nWhat's your biggest challenge with ${p.toLowerCase()} right now? Reply and let me know — I read every response.\n\nUntil next time,\nThe Team`,
  }),
  'Product Description': (p, t) => ({
    title: `Introducing a Better Way to ${p}`,
    body: `**${p}**\n\nMeet ${p} — designed for those who refuse to settle. Whether you're at the beginning of your journey or well on your way, ${p.toLowerCase()} meets you where you are and takes you further.\n\n**Key Features:**\n- Crafted with precision and care\n- Built to last and designed to perform\n- Effortless to use, powerful in results\n\n**Why You'll Love It:**\n${p} isn't just another product — it's a shift in how things should work. We built it because nothing else did the job right.\n\n**Perfect For:**\nAnyone who values quality, simplicity, and results that speak for themselves.\n\n**Get yours today.**`,
  }),
  Email: (p, t) => ({
    title: `A Quick Note About ${p}`, 
    body: `**Subject:** ${p} — Quick Update\n\nHi [Recipient Name],\n\nI hope this email finds you well. I wanted to reach out regarding ${p.toLowerCase()} — I think it's worth a few minutes of your time.\n\n**Why this matters:**\n${p} has come up recently, and I believe it presents a real opportunity for us. Here's the short version:\n\n- It aligns with what we're already working toward\n- The timing is ideal to move forward\n- The effort required is minimal compared to the upside\n\n**What I'm suggesting:**\nLet's schedule a brief call this week to discuss ${p.toLowerCase()} in more detail. I'll come prepared with a short outline so we can make the most of the time.\n\nIf something else is more urgent on your end, just let me know and I'll adjust.\n\nBest regards,\n[Your Name]`,
  }),
};

export function generateText(prompt: string, options: GenerationOptions): TextResult {
  const contentType = options.contentType || 'Blog';
  const tone = options.tone || 'Professional';
  const template = contentTypeTemplates[contentType] ?? contentTypeTemplates.Blog;
  const topic = getWritingTopic(prompt);
  const { title, body } = template(topic, tone);
  const wordCount = body.split(/\s+/).length;
  return { title, content: body, wordCount };
}

// ─── IMAGE GENERATOR ─────────────────────────────────────────────

const artStyles: Record<string, { name: string; modifiers: string; example: string; negative: string }> = {
  Photorealistic: {
    name: 'Photorealistic',
    modifiers: 'professional photography, hyperrealistic, ultra-detailed, 8K resolution, natural lighting, sharp focus, depth of field, high dynamic range, shot on Canon EOS R5, 50mm lens, perfect exposure, accurate anatomy, precise details, true-to-life colors',
    example: 'a highly detailed photograph',
    negative: 'blurry, distorted, deformed, low quality, pixelated, watermark, text, oversaturated, cartoon, illustration, painting, artificial',
  },
  'Digital Art': {
    name: 'Digital Art',
    modifiers: 'digital painting, concept art, highly detailed illustration, vibrant accurate colors, ArtStation trending, smooth gradients, precise linework, professional digital art, sharp rendering, intricate details',
    example: 'a detailed digital illustration',
    negative: 'blurry, low quality, pixelated, messy, rough draft, watermark, distorted proportions',
  },
  'Oil Painting': {
    name: 'Oil Painting',
    modifiers: 'oil on canvas, visible brushstrokes, rich textures, classical composition, warm accurate palette, museum quality, fine art, detailed rendering, precise color mixing, masterful technique',
    example: 'a finely detailed oil painting',
    negative: 'digital, blurry, low quality, flat colors, amateur, smudged, inaccurate proportions',
  },
  'Anime / Manga': {
    name: 'Anime / Manga',
    modifiers: 'anime style, cel shading, vibrant accurate colors, highly detailed eyes, precise line art, Japanese animation aesthetic, Studio Ghibli inspired, clean shading, professional anime production, accurate proportions',
    example: 'a high-quality anime illustration',
    negative: 'blurry, deformed, low quality, messy lines, distorted face, incorrect anatomy, watermark',
  },
  '3D Render': {
    name: '3D Render',
    modifiers: '3D render, Octane render, ray tracing, volumetric lighting, PBR materials, ultra detailed, cinematic, physically accurate lighting, precise geometry, 8K texture maps, subsurface scattering, accurate reflections',
    example: 'a photorealistic 3D render',
    negative: 'blurry, low poly, low quality, flat shading, incorrect lighting, distorted geometry, watermark',
  },
  Watercolor: {
    name: 'Watercolor',
    modifiers: 'watercolor painting, soft edges, flowing colors, paper texture, delicate washes, hand-painted aesthetic, precise color control, professional watercolor technique, accurate composition',
    example: 'a detailed watercolor painting',
    negative: 'digital, blurry, muddy colors, overworked, low quality, messy, inaccurate colors',
  },
  'Pixel Art': {
    name: 'Pixel Art',
    modifiers: 'pixel art, 16-bit style, retro game aesthetic, limited color palette, crisp precise pixels, isometric perspective, clean pixel placement, professional sprite work, accurate shading',
    example: 'a crisp pixel art scene',
    negative: 'blurry, anti-aliased, high resolution, 3D, low quality, messy pixels, watermark',
  },
  Cyberpunk: {
    name: 'Cyberpunk',
    modifiers: 'cyberpunk aesthetic, neon lights, dystopian atmosphere, futuristic cityscape, moody atmospheric lighting, Blade Runner inspired, highly detailed architecture, accurate perspective, volumetric fog, cinematic composition',
    example: 'a detailed cyberpunk scene',
    negative: 'blurry, low quality, cartoon, flat lighting, distorted perspective, watermark, simplistic',
  },
  Minimalist: {
    name: 'Minimalist',
    modifiers: 'minimalist design, clean precise lines, negative space, limited color palette, geometric shapes, Swiss design influence, perfectly balanced composition, intentional spacing, sharp edges',
    example: 'a precise minimalist composition',
    negative: 'cluttered, busy, blurry, messy, low quality, gradient mess, watermark, overcomplicated',
  },
  Surreal: {
    name: 'Surreal',
    modifiers: 'surrealism, dreamlike atmosphere, impossible geometry, Salvador Dali inspired, melting forms, ethereal lighting, highly detailed rendering, precise brushwork, imaginative but coherent composition',
    example: 'a highly detailed surreal artwork',
    negative: 'blurry, low quality, random mess, incoherent, distorted beyond recognition, watermark',
  },
};

export function getArtStyles() {
  return Object.keys(artStyles);
}

export function generateImage(prompt: string, options: GenerationOptions): ImageResult {
  const style = options.artStyle || 'Photorealistic';
  const styleData = artStyles[style] ?? artStyles.Photorealistic;
  const seed = hashStr(prompt + style);

  const aspectRatios = [
    { ratio: '16:9', width: 1280, height: 720 },
    { ratio: '1:1', width: 1024, height: 1024 },
    { ratio: '4:5', width: 820, height: 1024 },
    { ratio: '9:16', width: 576, height: 1024 },
  ];

  const compositions = [
    'perfectly centered composition, balanced framing, symmetrical layout',
    'rule of thirds composition, subject placed at intersection, dynamic balance',
    'dynamic diagonal angle, leading lines, three-point perspective',
    'wide establishing shot, environmental context, depth layering',
  ];
  const lightings = [
    'golden hour lighting, warm directional light, long soft shadows',
    'soft diffused lighting, even illumination, gentle highlights',
    'dramatic chiaroscuro lighting, strong contrast, deep shadows',
    'neon glow lighting, vibrant rim light, reflective surfaces',
    'overcast moody lighting, muted tones, atmospheric haze',
  ];
  const moods = [
    'serene mood, calm atmosphere, peaceful tone',
    'energetic mood, vibrant dynamic, lively tone',
    'mysterious mood, enigmatic atmosphere, intriguing tone',
    'uplifting mood, bright optimistic, hopeful tone',
    'contemplative mood, introspective, thoughtful tone',
  ];
  const qualityBoost = 'masterpiece, best quality, highly detailed, sharp focus, accurate, precise rendering, professional, award-winning';

  const concepts = [
    `Primary concept — the main visual interpretation`,
    `Alternative angle — a different perspective`,
    `Atmospheric mood — emotional, evocative take`,
  ];

  const encodedPrompt = encodeURIComponent;

  return {
    images: concepts.map((concept, i) => {
      const ar = aspectRatios[i % aspectRatios.length];
      const composition = pick(compositions, seed + i).split(',')[0];
      const lighting = pick(lightings, seed + i + 1).split(',')[0];
      const fullPrompt = `${prompt}, ${styleData.example}, ${styleData.modifiers}, ${composition}, ${lighting}, ${qualityBoost}`;
      const url = `https://image.pollinations.ai/prompt/${encodedPrompt(fullPrompt)}?width=${ar.width}&height=${ar.height}&seed=${seed + i}&nologo=true&model=flux`;
      return {
        concept,
        url,
        aspectRatio: ar.ratio,
      };
    }),
  };
}

// ─── CODE GENERATOR ──────────────────────────────────────────────

const codeGenerators: Record<string, (prompt: string) => { description: string; code: string }> = {
  JavaScript: (p) => ({
    description: `JavaScript implementation for: ${p}`,
    code: `// ${p}\n// Generated JavaScript solution\n\nfunction solve(input) {\n  // Parse and validate input\n  if (!input || typeof input !== 'string') {\n    throw new Error('Input must be a non-empty string');\n  }\n\n  const tokens = input.trim().split(/\\s+/);\n  const result = [];\n\n  for (const token of tokens) {\n    const processed = token.toLowerCase();\n    result.push({\n      original: token,\n      normalized: processed,\n      length: token.length,\n      isKeyword: ['function', 'const', 'let', 'var', 'if', 'else', 'return'].includes(processed),\n    });\n  }\n\n  return {\n    count: result.length,\n    tokens: result,\n    summary: \`Processed \${result.length} tokens from: "${p}"\`,\n  };\n}\n\n// Example usage\ntry {\n  const output = solve("hello world from ${p.replace(/"/g, '\\"')}");\n  console.log(output.summary);\n  console.table(output.tokens);\n} catch (err) {\n  console.error('Error:', err.message);\n}\n\nexport { solve };`,
  }),
  Python: (p) => ({
    description: `Python implementation for: ${p}`,
    code: `# ${p}\n# Generated Python solution\n\nfrom dataclasses import dataclass\nfrom typing import List\n\n\n@dataclass\nclass Token:\n    original: str\n    normalized: str\n    length: int\n    is_keyword: bool\n\n\ndef solve(text: str) -> dict:\n    """Process input text and return token analysis for: ${p}"""\n    if not text or not isinstance(text, str):\n        raise ValueError("Input must be a non-empty string")\n\n    keywords = {"def", "class", "if", "else", "for", "while", "return", "import"}\n    tokens: List[Token] = []\n\n    for word in text.strip().split():\n        normalized = word.lower()\n        tokens.append(Token(\n            original=word,\n            normalized=normalized,\n            length=len(word),\n            is_keyword=normalized in keywords,\n        ))\n\n    return {\n        "count": len(tokens),\n        "tokens": tokens,\n        "summary": f"Processed {len(tokens)} tokens from: ${p}",\n    }\n\n\nif __name__ == "__main__":\n    result = solve("hello world from ${p}")\n    print(result["summary"])\n    for t in result["tokens"]:\n        print(f"  {t.original} -> {t.normalized} (len={t.length}, kw={t.is_keyword})")\n`,
  }),
  TypeScript: (p) => ({
    description: `TypeScript implementation for: ${p}`,
    code: `// ${p}\n// Generated TypeScript solution\n\ninterface TokenInfo {\n  original: string;\n  normalized: string;\n  length: number;\n  isKeyword: boolean;\n}\n\ninterface SolveResult {\n  count: number;\n  tokens: TokenInfo[];\n  summary: string;\n}\n\nconst KEYWORDS = new Set(['function', 'const', 'let', 'var', 'if', 'else', 'return', 'interface', 'type']);\n\nfunction solve(input: string): SolveResult {\n  if (!input || typeof input !== 'string') {\n    throw new Error('Input must be a non-empty string');\n  }\n\n  const tokens: TokenInfo[] = input.trim().split(/\\s+/).map((token) => ({\n    original: token,\n    normalized: token.toLowerCase(),\n    length: token.length,\n    isKeyword: KEYWORDS.has(token.toLowerCase()),\n  }));\n\n  return {\n    count: tokens.length,\n    tokens,\n    summary: \`Processed \${tokens.length} tokens from: "${p}"\`,\n  };\n}\n\n// Example usage\nconst result = solve("hello world from ${p.replace(/"/g, '\\"')}");\nconsole.log(result.summary);\nconsole.table(result.tokens);\n\nexport { solve, type TokenInfo, type SolveResult };`,
  }),
  HTML: (p) => ({
    description: `HTML page for: ${p}`,
    code: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>${p}</title>\n  <style>\n    * { margin: 0; padding: 0; box-sizing: border-box; }\n    body {\n      font-family: system-ui, -apple-system, sans-serif;\n      background: #0a0a0a;\n      color: #e0e0e0;\n      min-height: 100vh;\n      display: flex;\n      align-items: center;\n      justify-content: center;\n    }\n    .container {\n      max-width: 600px;\n      padding: 2rem;\n      text-align: center;\n    }\n    h1 { font-size: 2rem; margin-bottom: 1rem; color: #fff; }\n    p { line-height: 1.6; color: #999; margin-bottom: 1.5rem; }\n    .btn {\n      display: inline-block;\n      padding: 12px 32px;\n      background: #dc2626;\n      color: #fff;\n      text-decoration: none;\n      border-radius: 8px;\n      font-weight: 600;\n      transition: background 0.2s;\n    }\n    .btn:hover { background: #b91c1c; }\n  </style>\n</head>\n<body>\n  <div class="container">\n    <h1>${p}</h1>\n    <p>A clean, responsive page built for "${p}". Customize this template to fit your needs.</p>\n    <a href="#" class="btn">Get Started</a>\n  </div>\n</body>\n</html>`,
  }),
  CSS: (p) => ({
    description: `CSS styles for: ${p}`,
    code: `/* ${p} — Generated CSS */\n\n:root {\n  --primary: #dc2626;\n  --primary-hover: #b91c1c;\n  --bg: #0a0a0a;\n  --surface: #1a1a1a;\n  --text: #e0e0e0;\n  --text-muted: #737373;\n  --radius: 12px;\n  --transition: 0.2s ease;\n}\n\n.card {\n  background: var(--surface);\n  border-radius: var(--radius);\n  padding: 2rem;\n  border: 1px solid #262626;\n  transition: transform var(--transition), box-shadow var(--transition);\n}\n\n.card:hover {\n  transform: translateY(-4px);\n  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);\n}\n\n/* ${p} — button component */\n.btn {\n  display: inline-flex;\n  align-items: center;\n  gap: 0.5rem;\n  padding: 0.75rem 2rem;\n  background: var(--primary);\n  color: #fff;\n  border: none;\n  border-radius: 8px;\n  font-weight: 600;\n  cursor: pointer;\n  transition: background var(--transition);\n}\n\n.btn:hover { background: var(--primary-hover); }\n\n@media (max-width: 768px) {\n  .card { padding: 1.5rem; }\n}`,
  }),
  'C++': (p) => ({
    description: `C++ implementation for: ${p}`,
    code: `// ${p}\n// Generated C++ solution\n\n#include <iostream>\n#include <string>\n#include <vector>\n#include <algorithm>\n#include <cctype>\n\nstruct TokenInfo {\n    std::string original;\n    std::string normalized;\n    int length;\n    bool isKeyword;\n};\n\nstd::vector<std::string> split(const std::string& s) {\n    std::vector<std::string> tokens;\n    std::string current;\n    for (char c : s) {\n        if (std::isspace(c)) {\n            if (!current.empty()) { tokens.push_back(current); current.clear(); }\n        } else { current += c; }\n    }\n    if (!current.empty()) tokens.push_back(current);\n    return tokens;\n}\n\nint main() {\n    std::string input = "hello world from ${p}";\n    auto words = split(input);\n\n    std::cout << "Processed " << words.size() << " tokens from: ${p}" << std::endl;\n\n    for (const auto& w : words) {\n        std::string lower = w;\n        std::transform(lower.begin(), lower.end(), lower.begin(), ::tolower);\n        std::cout << "  " << w << " -> " << lower\n                  << " (len=" << w.length() << ")" << std::endl;\n    }\n\n    return 0;\n}`,
  }),
  Java: (p) => ({
    description: `Java implementation for: ${p}`,
    code: `// ${p}\n// Generated Java solution\n\nimport java.util.*;\n\npublic class Main {\n    static class TokenInfo {\n        String original, normalized;\n        int length;\n        boolean isKeyword;\n\n        TokenInfo(String word) {\n            this.original = word;\n            this.normalized = word.toLowerCase();\n            this.length = word.length();\n            Set<String> kws = Set.of("public", "class", "static", "void", "if", "else", "return", "new");\n            this.isKeyword = kws.contains(this.normalized);\n        }\n    }\n\n    public static void main(String[] args) {\n        String input = "hello world from ${p}";\n        String[] parts = input.trim().split("\\\\s+");\n\n        System.out.println("Processed " + parts.length + " tokens from: ${p}");\n\n        for (String word : parts) {\n            TokenInfo t = new TokenInfo(word);\n            System.out.printf("  %s -> %s (len=%d, kw=%b)%n",\n                t.original, t.normalized, t.length, t.isKeyword);\n        }\n    }\n}`,
  }),
  Rust: (p) => ({
    description: `Rust implementation for: ${p}`,
    code: `// ${p}\n// Generated Rust solution\n\nuse std::collections::HashSet;\n\n#[derive(Debug)]\nstruct TokenInfo {\n    original: String,\n    normalized: String,\n    length: usize,\n    is_keyword: bool,\n}\n\nfn solve(input: &str) -> Vec<TokenInfo> {\n    let keywords: HashSet<&str> = ["fn", "let", "mut", "if", "else", "return", "struct", "impl"]\n        .into_iter().collect();\n\n    input.trim()\n        .split_whitespace()\n        .map(|word| {\n            let normalized = word.to_lowercase();\n            TokenInfo {\n                original: word.to_string(),\n                is_keyword: keywords.contains(normalized.as_str()),\n                length: word.len(),\n                normalized,\n            }\n        })\n        .collect()\n}\n\nfn main() {\n    let input = "hello world from ${p}";\n    let tokens = solve(input);\n\n    println!("Processed {} tokens from: ${p}", tokens.len());\n    for t in &tokens {\n        println!("  {} -> {} (len={}, kw={})", t.original, t.normalized, t.length, t.is_keyword);\n    }\n}`,
  }),
  Go: (p) => ({
    description: `Go implementation for: ${p}`,
    code: `// ${p}\n// Generated Go solution\n\npackage main\n\nimport (\n\t"fmt"\n\t"strings"\n)\n\ntype TokenInfo struct {\n\tOriginal   string\n\tNormalized string\n\tLength     int\n\tIsKeyword  bool\n}\n\nfunc solve(input string) []TokenInfo {\n\tkeywords := map[string]bool{\n\t\t"func": true, "var": true, "if": true, "else": true,\n\t\t"return": true, "package": true, "import": true, "type": true,\n\t}\n\n\twords := strings.Fields(input)\n\tvar tokens []TokenInfo\n\n\tfor _, word := range words {\n\t\tnormalized := strings.ToLower(word)\n\t\ttokens = append(tokens, TokenInfo{\n\t\t\tOriginal:   word,\n\t\t\tNormalized: normalized,\n\t\t\tLength:     len(word),\n\t\t\tIsKeyword:  keywords[normalized],\n\t\t})\n\t}\n\n\treturn tokens\n}\n\nfunc main() {\n\tinput := "hello world from ${p}"\n\ttokens := solve(input)\n\n\tfmt.Printf("Processed %d tokens from: ${p}\\n", len(tokens))\n\tfor _, t := range tokens {\n\t\tfmt.Printf("  %s -> %s (len=%d, kw=%v)\\n", t.Original, t.Normalized, t.Length, t.IsKeyword)\n\t}\n}`,
  }),
  SQL: (p) => ({
    description: `SQL queries for: ${p}`,
    code: `-- ${p}\n-- Generated SQL solution\n\n-- Create a table for tracking ${p}\nCREATE TABLE IF NOT EXISTS ${p.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase()} (\n    id SERIAL PRIMARY KEY,\n    title VARCHAR(255) NOT NULL,\n    description TEXT,\n    status VARCHAR(50) DEFAULT 'active',\n    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n);\n\n-- Insert sample data\nINSERT INTO ${p.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase()} (title, description)\nVALUES ('First entry for ${p}', 'Sample record generated for demonstration');\n\n-- Query all records\nSELECT id, title, description, status, created_at\nFROM ${p.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase()}\nORDER BY created_at DESC;\n\n-- Update a record\nUPDATE ${p.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase()}\nSET status = 'completed', updated_at = CURRENT_TIMESTAMP\nWHERE id = 1;\n\n-- Aggregate summary\nSELECT status, COUNT(*) as total\nFROM ${p.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase()}\nGROUP BY status\nORDER BY total DESC;`,
  }),
};

export function getLanguages() {
  return Object.keys(codeGenerators);
}

export function generateCode(prompt: string, options: GenerationOptions): CodeResult {
  const language = options.language || 'JavaScript';
  const gen = codeGenerators[language] ?? codeGenerators.JavaScript;
  const { description, code } = gen(prompt);
  return { language, description, code };
}

// ─── SHARE POST GENERATOR ─────────────────────────────────────────

const cleanTag = (s: string) => s.replace(/[^a-zA-Z0-9]/g, '');

export function generateSharePosts(
  contentType: 'text' | 'image' | 'code',
  prompt: string,
  content: string,
): ShareResult {
  const topic = prompt.length > 60 ? prompt.slice(0, 57) + '...' : prompt;
  const topicTag = cleanTag(prompt.split(/\s+/).slice(0, 3).join('')).toLowerCase();

  const posts: SharePost[] = [];

  // Twitter / X — short punchy post
  posts.push({
    platform: 'X (Twitter)',
    text: content.length > 260 ? content.slice(0, 257) + '...' : content,
    hashtags: [`#${topicTag}`, '#content', '#ai'],
  });

  // Instagram — caption with line breaks
  posts.push({
    platform: 'Instagram',
    text: `${content}\n\n—\nDouble tap if this resonates. Save for later.\n\n`,
    hashtags: [`#${topicTag}`, '#contentcreator', '#instagood', '#contentstrategy', '#digitalcontent'],
  });

  // LinkedIn — professional framing
  const linkedinText = `Sharing something I created:\n\n${content.length > 500 ? content.slice(0, 497) + '...' : content}\n\nWhat are your thoughts on this?`;
  posts.push({
    platform: 'LinkedIn',
    text: linkedinText,
    hashtags: [`#${topicTag}`, '#contentcreation', '#professional', '#innovation'],
  });

  // Facebook — conversational
  posts.push({
    platform: 'Facebook',
    text: `Just created something new:\n\n${content.length > 400 ? content.slice(0, 397) + '...' : content}\n\nWhat do you think? Let me know in the comments!`,
    hashtags: [`#${topicTag}`, '#content'],
  });

  // TikTok — short hook
  posts.push({
    platform: 'TikTok',
    text: `${topic}\n\n${content.length > 150 ? content.slice(0, 147) + '...' : content}`,
    hashtags: [`#${topicTag}`, '#fyp', '#content', '#ai', '#foryou'],
  });

  return { posts };
}
