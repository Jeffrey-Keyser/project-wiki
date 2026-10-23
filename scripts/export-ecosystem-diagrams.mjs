import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const html = await fs.readFile(path.join(dist, 'ecosystem/overview/index.html'), 'utf8');
const diagrams = [...html.matchAll(/<svg\b(?=[^>]*\bid="mermaid-[^"]+")[\s\S]*?<\/svg>/g)];
const names = ['ecosystem-topology', 'ecosystem-events', 'ecosystem-delivery'];
if (diagrams.length !== names.length) {
  throw new Error(`Expected ${names.length} ecosystem diagrams, found ${diagrams.length}`);
}
await fs.mkdir(path.join(dist, 'diagrams'), { recursive: true });
for (const [i, name] of names.entries()) {
  await fs.writeFile(path.join(dist, 'diagrams', `${name}.svg`), diagrams[i][0] + '\n');
}
console.log(`Exported ${diagrams.length} ecosystem diagrams as standalone SVGs.`);
