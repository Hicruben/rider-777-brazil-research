// Reference script: generate multiple images via MCP HTTP JSON-RPC
// Usage examples:
//   node scripts/generate-multi.js --prompt "A banana astronaut" --count 3 --ar 16:9 \
//       --out ./my-images --url https://your-project.pages.dev --token YOUR_TOKEN

import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';

function parseArgs(argv) {
  const args = { prompt: '', count: 1, ar: '1:1', out: null, url: null, token: null };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    const next = argv[i + 1];
    if ((a === '--prompt' || a === '-p') && next) { args.prompt = next; i++; continue; }
    if ((a === '--count' || a === '-n') && next) { args.count = parseInt(next, 10) || 1; i++; continue; }
    if ((a === '--ar' || a === '--aspect' || a === '-r') && next) { args.ar = next; i++; continue; }
    if ((a === '--out' || a === '-o') && next) { args.out = next; i++; continue; }
    if ((a === '--url' || a === '-u') && next) { args.url = next; i++; continue; }
    if ((a === '--token' || a === '-t') && next) { args.token = next; i++; continue; }
  }
  return args;
}

function slugify(str) {
  return (str || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60);
}

async function main() {
  const {
    prompt,
    count,
    ar,
    out,
    url,
    token,
  } = parseArgs(process.argv);

  const MCP_SERVER_URL = url || process.env.MCP_SERVER_URL || 'https://banana.aalive.icu';
  const AUTH_TOKEN = process.env.MCP_AUTH_TOKEN || '9TFhF67a6iNDQ5mGKhkmq6ydiKqOYC/3j0timQyJBfc=';
  const OUTPUT_DIR = out || process.env.LOCAL_IMAGE_OUTPUT_DIR || path.resolve(process.cwd(), 'generated-images');

  if (!prompt) {
    console.error('Missing --prompt. Example: --prompt "A banana astronaut, 3D render"');
    process.exit(1);
  }
  if (!/^(1:1|16:9|9:16|4:3|3:4)$/.test(ar)) {
    console.error('Invalid --ar. Use one of: 1:1, 16:9, 9:16, 4:3, 3:4');
    process.exit(1);
  }
  if (count < 1 || count > 8) {
    console.error('Invalid --count. Allowed range: 1-8');
    process.exit(1);
  }

  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const body = {
    jsonrpc: '2.0',
    id: Date.now(),
    method: 'tools/call',
    params: {
      name: 'generate_image',
      arguments: {
        prompt,
        aspectRatio: ar,
        numberOfImages: count,
      },
    },
  };

  const resp = await fetch(`${MCP_SERVER_URL}/api/mcp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(AUTH_TOKEN ? { Authorization: `Bearer ${AUTH_TOKEN}` } : {}),
    },
    body: JSON.stringify(body),
  });

  const text = await resp.text();
  if (!resp.ok) {
    throw new Error(`Request failed: ${resp.status} ${text}`);
  }

  const json = JSON.parse(text);
  if (json.error) throw new Error(json.error.message || 'MCP error');

  const content = (json.result && Array.isArray(json.result.content)) ? json.result.content : [];
  const images = content.filter((c) => c && c.type === 'image' && c.data);
  if (images.length === 0) {
    throw new Error('No images returned from MCP');
  }

  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const base = slugify(prompt) || 'image';
  let saved = 0;

  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const ext = (img.mimeType && String(img.mimeType).split('/')[1])?.split(';')[0] || 'png';
    const filename = `${base}_${ts}_${i + 1}.${ext}`;
    const filepath = path.join(OUTPUT_DIR, filename);
    await fs.writeFile(filepath, Buffer.from(img.data, 'base64'));
    console.log(`Saved: ${filepath}`);
    saved++;
  }

  console.log(`Done. Saved ${saved} file(s) to ${OUTPUT_DIR}`);
}

main().catch((err) => {
  console.error('Failed:', err.message);
  process.exit(1);
});

