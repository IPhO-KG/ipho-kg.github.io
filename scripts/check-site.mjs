import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = fileURLToPath(new URL('../', import.meta.url));
const errors = [];
function files(dir) {
  return readdirSync(dir, { withFileTypes: true })
    .filter(entry => entry.name !== '.git')
    .flatMap(entry => entry.isDirectory() ? files(join(dir, entry.name)) : [join(dir, entry.name)]);
}
function checkReference(reference, source) {
  if (!reference || /^(?:[a-z][\w+.-]*:|\/\/|#)/i.test(reference)) return;
  const path = decodeURIComponent(reference.split(/[?#]/)[0]);
  const target = path.startsWith('/') ? join(root, path) : resolve(dirname(source), path);
  if (!existsSync(target) || (statSync(target).isDirectory() && !existsSync(join(target, 'index.html')))) {
    errors.push(`${source.slice(root.length)}: missing ${reference}`);
  }
}
function checkCss(css, source) {
  for (const match of css.matchAll(/url\(\s*(['"]?)(.*?)\1\s*\)/g)) checkReference(match[2], source);
}

for (const path of files(root)) {
  if (path.endsWith('.html')) {
    const html = readFileSync(path, 'utf8');
    const markup = html.replace(/(<script\b[^>]*>)[\s\S]*?<\/script>/gi, '$1');
    for (const match of markup.matchAll(/<(?:script|link|img|a)\b[^>]*>/gi)) {
      const attr = match[0].match(/\b(?:src|href)\s*=\s*(['"])(.*?)\1/i);
      if (attr) checkReference(attr[2], path);
    }
    for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
      if (!/\bsrc\s*=/i.test(match[1])) new vm.Script(match[2], { filename: path });
    }
    for (const match of html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) checkCss(match[1], path);
  } else if (path.endsWith('.js')) {
    new vm.Script(readFileSync(path, 'utf8'), { filename: path });
  } else if (path.endsWith('.css')) {
    checkCss(readFileSync(path, 'utf8'), path);
  }
}

const context = { window: {} };
vm.runInNewContext(readFileSync(join(root, 'assets/js/npho-data.js'), 'utf8'), context);
for (const list of Object.values(context.window.NPHO_PDF_LINKS)) {
  for (const file of list) checkReference(file.url, join(root, 'index.html'));
}
for (const year of Object.keys(context.window.NPHO_RESULTS)) {
  assert.match(readFileSync(join(root, `results/${year}/index.html`), 'utf8'), new RegExp(`data-year="${year}"`));
}
assert.deepEqual(errors, [], errors.join('\n'));
const notesContext = { window: {} };
vm.runInNewContext(readFileSync(join(root, 'assets/js/preparation-notes-data.js'), 'utf8'), notesContext);
const notesData = notesContext.window.NPHO_PREPARATION_NOTES;
const authorIds = new Set(notesData.authors.map(author => author.id));
const topicIds = new Set(notesData.topics.map(topic => topic.id));
const noteIds = new Set(notesData.notes.map(note => note.id));
assert.equal(authorIds.size, notesData.authors.length, 'Author IDs must be unique');
assert.equal(noteIds.size, notesData.notes.length, 'Note IDs must be unique');
const notesHtml = readFileSync(join(root, 'preparation/index.html'), 'utf8');
for (const note of notesData.notes) {
  assert.ok(authorIds.has(note.authorId), `Unknown author in note ${note.id}`);
  assert.ok(topicIds.has(note.topic), `Unknown topic in note ${note.id}`);
  assert.ok(note.title && note.excerpt && Array.isArray(note.body), `Incomplete note ${note.id}`);
  assert.ok(note.body.every(paragraph => typeof paragraph === 'string'), `Invalid paragraphs in note ${note.id}`);
  if (note.fullPlan) assert.ok(note.templateId && notesHtml.includes(`id="${note.templateId}"`), `Missing full-plan template for ${note.id}`);
}
console.log('Site checks passed: local assets, PDF links, results pages and JavaScript syntax.');
console.log(`Notes wall checks passed: ${authorIds.size} author(s), ${noteIds.size} notes and valid topic/template references.`);
