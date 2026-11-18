import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
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

function checkEquationRows(html, location) {
  const math = /\\\[([\s\S]*?)\\\]|\$\$([\s\S]*?)\$\$|\\\(([\s\S]*?)\\\)|\\begin\{((?:align(?:at)?|equation|gather|multline)\*?)\}[\s\S]*?\\end\{\4\}/g;
  const rowBreak = /\\\\\*?(?:\s*\[[^\]]*\])?|\\(?:cr|newline)\b/;
  const environment = /\\begin\{(?:align(?:ed)?(?:at)?|gather(?:ed)?|equation|split|multline)\*?\}(?:\[[tbc]\]|\{\d+\})?/g;
  const padding = /^(?:\s|&|\{\}|\\(?:qquad\b|quad\b|displaystyle\b|[,;:!]))+/;
  const relation = /^(?:[=<>≈≃≅≡≠≤≥∝]|\\(?:approx|simeq|sim|cong|equiv|asymp|doteq|neq?|leq?|geq?|propto|lesssim|gtrsim)\b)/;
  for (const [whole, display, dollarDisplay, inline] of html.matchAll(math)) {
    const tex = (display ?? dollarDisplay ?? inline ?? whole).replace(/&(?:amp|#38|#x26);/gi, '&')
      .replace(/&lt;/gi, '<').replace(/&gt;/gi, '>').replace(environment, '');
    const rows = tex.split(rowBreak);
    // A single inline relation may name a symbol in prose (for example, “≈”).
    if (inline !== undefined && rows.length === 1) continue;
    for (const row of rows) {
      if (relation.test(row.replace(padding, ''))) {
        errors.push(location + ': equation row needs a left-hand side: ' + row.trim().slice(0, 80));
      }
    }
  }
}

function checkSolutionEquations(path) {
  const { parts } = JSON.parse(readFileSync(path, 'utf8'));
  for (const part of parts) {
    const fields = [...part.steps.map(step => [step.id, step.body]), ['answer', part.answer]];
    for (const [field, body] of fields) {
      const location = path.slice(root.length) + ' ' + part.id + '/' + field;
      const languages = typeof body === 'string' ? [['', body]] : Object.entries(body ?? {});
      for (const [lang, html] of languages) checkEquationRows(html, location + (lang && ' (' + lang + ')'));
    }
  }
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
  } else if (path.endsWith('.json') && basename(dirname(path)) === 'solutions') {
    checkSolutionEquations(path);
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
  const sectionIds = new Set();
  for (const section of note.sections || []) {
    assert.match(section.id, /^[a-z][a-z0-9-]*$/);
    assert.ok(!sectionIds.has(section.id), `Duplicate section in ${note.id}`); sectionIds.add(section.id);
    assert.ok(section.title && Array.isArray(section.paragraphs), `Incomplete section in ${note.id}`);
    assert.ok(section.paragraphs.every(text => typeof text === 'string'));
    assert.ok((section.items || []).every(text => typeof text === 'string'));
    for (const link of section.links || []) {
      assert.ok(link.label); assert.equal(new URL(link.url).protocol, 'https:');
    }
  }
  if (note.fullPlan) assert.ok(note.templateId && notesHtml.includes(`id="${note.templateId}"`), `Missing full-plan template for ${note.id}`);
}
for (const match of notesHtml.matchAll(/data-note-copy="([^"]+)"/g)) assert.ok(noteIds.has(match[1]), `Unknown inline note ${match[1]}`);
console.log('Site checks passed: local assets, PDF links, results pages and JavaScript syntax.');
console.log(`Notes wall checks passed: ${authorIds.size} author(s), ${noteIds.size} notes and valid topic/template references.`);
