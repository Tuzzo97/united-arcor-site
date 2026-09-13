import { readdir, mkdir, cp, writeFile, access, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

// Preserve the existing agency website. Add the independently hosted preview
// only under /beefbar, using a fixed, integrity-checked export of its source.
const root = process.cwd();
const output = join(root, 'dist');
const preview = join(output, 'beefbar');
const excluded = new Set(['dist', '.git', '.vercel', 'node_modules', 'vercel.json', 'build-beefbar-preview.mjs']);
await mkdir(output, { recursive: true });
for (const entry of await readdir(root, { withFileTypes: true })) {
  if (excluded.has(entry.name) || entry.name.startsWith('.env')) continue;
  await cp(join(root, entry.name), join(output, entry.name), { recursive: true });
}
await mkdir(preview, { recursive: true });
const url = 'https://d2ol7oe51mr4n9.cloudfront.net/user_2zKGECzSqnt9A4EBklmaKsYbhY0/73421c22-2f8d-4dd4-a0ea-ebf9848a9129.gz';
const expected = '3908ad64e8cc264cab4764efae5d5d9cfcc764c9dd6e138f9b4ba6e16e738f1c';
const response = await fetch(url, { signal: AbortSignal.timeout(90000) });
if (!response.ok) throw new Error(`Preview archive download failed: ${response.status}`);
const bytes = Buffer.from(await response.arrayBuffer());
if (createHash('sha256').update(bytes).digest('hex') !== expected) throw new Error('Preview archive integrity check failed');
const archive = join(tmpdir(), `beefbar-preview-${process.pid}.tar.gz`);
await writeFile(archive, bytes);
const members = execFileSync('tar', ['-tzf', archive], { encoding: 'utf8' }).trim().split('\n');
if (members.some(name => name.startsWith('/') || name.split('/').includes('..'))) throw new Error('Invalid archive paths');
execFileSync('tar', ['-xzf', archive, '-C', preview]);
await rm(archive);
await access(join(preview, 'index.html'));
await access(join(preview, 'experience.js'));
await access(join(preview, 'assets/world/monaco.mp4'));
console.log('Existing website preserved. Beefbar interactive preview prepared at /beefbar/.');
