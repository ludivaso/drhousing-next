import { FirecrawlClient } from '@mendable/firecrawl-js';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const API_KEY = process.env.FIRECRAWL_API_KEY;
if (!API_KEY) {
  console.error('FIRECRAWL_API_KEY not set');
  process.exit(1);
}

const client = new FirecrawlClient({ apiKey: API_KEY });

console.log('Starting crawl of https://drhousing.net/admin ...\n');

const crawlResult = await client.crawl('https://drhousing.net/admin', {
  limit: 100,
  scrapeOptions: {
    formats: ['markdown', 'screenshot'],
    waitFor: 2000,
  },
  includePaths: ['/admin.*'],
});

const outDir = join(__dirname, '../.crawl-results');
mkdirSync(outDir, { recursive: true });

writeFileSync(join(outDir, 'raw.json'), JSON.stringify(crawlResult, null, 2));

const pages = crawlResult.data ?? crawlResult.pages ?? crawlResult ?? [];

const summary = (Array.isArray(pages) ? pages : []).map((page) => ({
  url: page.metadata?.url ?? page.url ?? '',
  title: page.metadata?.title ?? '',
  description: page.metadata?.description ?? '',
  markdownLength: page.markdown?.length ?? 0,
  hasScreenshot: !!page.screenshot,
}));

writeFileSync(join(outDir, 'summary.json'), JSON.stringify(summary, null, 2));

for (const page of Array.isArray(pages) ? pages : []) {
  const url = page.metadata?.url ?? page.url ?? 'unknown';
  const slug = url.replace(/https?:\/\/[^/]+/, '').replace(/\//g, '_').replace(/^_/, '') || 'root';
  const filename = slug.replace(/[^a-zA-Z0-9_-]/g, '_') + '.md';

  const content = [
    `# ${page.metadata?.title ?? url}`,
    `**URL:** ${url}`,
    `**Description:** ${page.metadata?.description ?? '—'}`,
    '',
    page.markdown ?? '_No markdown content_',
  ].join('\n');

  writeFileSync(join(outDir, filename), content);

  if (page.screenshot) {
    const imgFile = filename.replace('.md', '.png');
    const imgData = page.screenshot.replace(/^data:image\/png;base64,/, '');
    writeFileSync(join(outDir, imgFile), Buffer.from(imgData, 'base64'));
    console.log(`  [screenshot] ${imgFile}`);
  }
}

console.log(`\nCrawl complete. ${Array.isArray(pages) ? pages.length : '?'} pages scraped.`);
console.log('Results saved to .crawl-results/');
console.log('\nPages found:');
summary.forEach((p) => console.log(`  ${p.url} — "${p.title}"`));
