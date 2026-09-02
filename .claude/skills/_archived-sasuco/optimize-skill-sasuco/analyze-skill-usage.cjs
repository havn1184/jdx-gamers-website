/**
 * analyze-skill-usage.cjs
 * Phân tích tần suất sử dụng skill dựa trên git log (+ file changes)
 * Dùng: node .claude/skills/optimize-skill-sasuco/analyze-skill-usage.cjs
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ── 1. Phân tích commit messages ──────────────────────────
console.log('━━━ Đang phân tích commit messages (2026) ━━━\n');

const commitsRaw = execSync('git log --since="2026-01-01" --format="%s"', {
  encoding: 'utf8',
  maxBuffer: 50 * 1024 * 1024,
});
const commits = commitsRaw.split('\n').filter(Boolean);

// Mapping từ khóa -> skill
const skillMap = {
  dialog: 'tao-ui-dialog',
  page: 'tao-ui-master-page',
  filter: 'filter-phan-trang',
  pagination: 'filter-phan-trang',
  search: 'filter-phan-trang',
  debounce: 'filter-phan-trang',
  validate: 'validate-input',
  validation: 'validate-input',
  input: 'validate-input',
  error: 'validate-input',
  toast: 'validate-input',
  api: 'tao-apiservice',
  service: 'tao-apiservice',
  endpoint: 'tao-apiservice',
  types: 'tich-hop-api-ui',
  hook: 'tich-hop-api-ui',
  hooks: 'tich-hop-api-ui',
  'hook.': 'tich-hop-api-ui',
  feature: 'tich-hop-api-ui',
  menu: 'tao-layout-navmenu-topmenu',
  nav: 'tao-layout-navmenu-topmenu',
  topmenu: 'tao-layout-navmenu-topmenu',
  layout: 'tao-layout-navmenu-topmenu',
  route: 'tao-layout-navmenu-topmenu',
  export: 'export-menu-page-permission',
  permission: 'export-menu-page-permission',
  role: 'export-menu-page-permission',
  date: 'date-input',
  datepicker: 'date-input',
  cdn: 'cdn-upload',
  upload: 'cdn-upload',
  token: 'refresh-token',
  jwt: 'refresh-token',
  'refresh-token': 'refresh-token',
  button: 'tao-ui-giao-dien',
  combobox: 'tao-ui-giao-dien',
  component: 'tao-ui-giao-dien',
  style: 'tao-ui-giao-dien',
  format: 'tao-ui-giao-dien',
  currency: 'tao-ui-giao-dien',
  number: 'tao-ui-giao-dien',
  table: 'tao-ui-master-page',
  master: 'tao-ui-master-page',
  list: 'tao-ui-master-page',
  form: 'tao-ui-dialog',
  create: 'tao-ui-dialog',
  edit: 'tao-ui-dialog',
  view: 'tao-ui-dialog',
  clone: 'tao-ui-master-page',
  'sub-page': 'tao-ui-sub-page',
  breadcrumb: 'tao-ui-sub-page',
  section: 'tao-ui-sub-page',
  'full-screen': 'tao-ui-sub-page',
  build: 'build-docker',
  docker: 'build-docker',
  commit: 'commit-local-push-server',
  push: 'commit-local-push-server',
  merge: 'merge-code-from-devs',
  conflict: 'merge-code-from-devs',
  review: 'checklist-sau-code',
  bug: 'checklist-sau-code',
  checklist: 'checklist-sau-code',
  refactor: 'checklist-sau-code',
  naming: 'dat-ten',
  name: 'dat-ten',
  structure: 'cau-truc-du-an',
  folder: 'cau-truc-du-an',
  'auto-code': 'auto-code-generation',
  'code gen': 'auto-code-generation',
  hdsd: 'cach-tich-hop-nut-hdsd',
  userguide: 'cach-tich-hop-nut-hdsd',
  'quick-create': 'them-nhanh-fk',
  fk: 'them-nhanh-fk',
  inbox: 'inbox-check',
  question: 'question-check',
  doc: 'doc-check',
  tai: 'doc-check',
  fix: 'checklist-sau-code',
  feat: 'tich-hop-api-ui',
  chore: 'checklist-sau-code',
};

const skillCounts = {};

for (const c of commits) {
  const lower = c.toLowerCase();
  const matched = new Set();
  for (const [kw, skill] of Object.entries(skillMap)) {
    if (lower.includes(kw)) matched.add(skill);
  }
  for (const s of matched) {
    skillCounts[s] = (skillCounts[s] || 0) + 1;
  }
}

console.log('=== TOP 20 SKILLS (theo commit message keyword) ===');
const sorted = Object.entries(skillCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 20);
const maxC = sorted[0]?.[1] || 1;
for (const [s, c] of sorted) {
  const bar = '█'.repeat(Math.round((c / maxC) * 35));
  console.log(s.padEnd(38), String(c).padStart(4), bar);
}

// ── 2. Feature/Module frequency ──────────────────────────
console.log('\n=== TOP 15 MODULES (theo commit scope) ===');
const scopeRegex = /^(feat|fix|chore|docs|refactor|merge)\(([^)]+)\)/;
const scopeCounts = {};
for (const c of commits) {
  const m = c.match(scopeRegex);
  if (m) {
    const scope = m[2].toLowerCase();
    scopeCounts[scope] = (scopeCounts[scope] || 0) + 1;
  }
}
const sortedScopes = Object.entries(scopeCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 15);
const maxS = sortedScopes[0]?.[1] || 1;
for (const [s, c] of sortedScopes) {
  const bar = '█'.repeat(Math.round((c / maxS) * 35));
  console.log(s.padEnd(30), String(c).padStart(4), bar);
}

// ── 3. Files changed frequency ──────────────────────────
console.log('\n=== TOP 15 DIRECTORIES (theo số lần sửa file) ===');
const filesChangedRaw = execSync(
  'git log --since="2026-01-01" --name-only --format=""',
  { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 }
);
const files = filesChangedRaw.split('\n').filter(Boolean);
const dirCounts = {};
for (const f of files) {
  const parts = f.split('/');
  let dir = 'root';
  if (parts[0] === 'src') {
    if (parts[1] === 'modules') {
      dir = 'modules/' + (parts[2] || '?') + '/' + (parts[3] || '?');
    } else if (parts[1] === 'shared') {
      dir = 'shared/' + (parts[2] || '?');
    } else {
      dir = 'src/' + (parts[1] || '?');
    }
  } else if (parts[0] === '.github') {
    dir = '.github/' + (parts[1] || '?');
  } else if (parts[0] === 'build') {
    dir = 'build';
  } else if (parts[0] === 'scripts') {
    dir = 'scripts';
  } else if (parts[0] === 'Docker' || parts[0] === 'docker') {
    dir = 'Docker';
  } else {
    dir = parts[0];
  }
  dirCounts[dir] = (dirCounts[dir] || 0) + 1;
}
const sortedDirs = Object.entries(dirCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 15);
const maxD = sortedDirs[0]?.[1] || 1;
for (const [d, c] of sortedDirs) {
  const bar = '█'.repeat(Math.round((c / maxD) * 35));
  console.log(d.padEnd(45), String(c).padStart(5), bar);
}

// ── 4. Phân tích kích thước file SKILL.md ──────────────────
console.log('\n=== KÍCH THƯỚC FILE SKILL.MD ===');
const skillsDir = path.join(__dirname, '..');
const skillDirs = fs.readdirSync(skillsDir, { withFileTypes: true })
  .filter(d => d.isDirectory() && d.name !== 'templates-for-skills')
  .map(d => d.name);

const sizeMap = {};
for (const dirName of skillDirs) {
  const skillPath = path.join(skillsDir, dirName, 'SKILL.md');
  if (fs.existsSync(skillPath)) {
    const stat = fs.statSync(skillPath);
    sizeMap[dirName] = stat.size / 1024;
  }
}

// ── 5. Ma trận ưu tiên: Usage × Size ─────────────────────
console.log('\n╔══════════════════════════════════════════════════════════════════════╗');
console.log('║       MA TRẬN ƯU TIÊN TỐI ƯU TOKEN (Usage × Size = Priority)       ║');
console.log('╠══════════════════════════════════════════════════════════════════════╣');
console.log('║ Skill                          Dùng   Size   Score  Ưu tiên        ║');
console.log('╠══════════════════════════════════════════════════════════════════════╣');

const allSkillNames = new Set([...Object.keys(skillCounts), ...Object.keys(sizeMap)]);
const items = [];
for (const name of allSkillNames) {
  const usage = skillCounts[name] || 0;
  const sizeKB = sizeMap[name] || 0;
  const score = usage * sizeKB;
  items.push({ name, usage, sizeKB, score });
}
items.sort((a, b) => b.score - a.score);

for (const it of items) {
  let label;
  if (it.score > 400) label = '\u{1F534} RẤT CAO';
  else if (it.score > 150) label = '\u{1F7E1} CAO';
  else if (it.score > 50) label = '\u{1F7E2} TB';
  else if (it.usage === 0) label = '\u26AB CHƯA DÙNG';
  else label = '\u26AA THẤP';

  console.log(
    '║ ' +
    it.name.padEnd(31) + ' ' +
    String(it.usage).padStart(4) + '  ' +
    String(it.sizeKB.toFixed(1)).padStart(5) + 'KB ' +
    String(Math.round(it.score)).padStart(6) + '  ' +
    label.padEnd(14) + ' ║'
  );
}
console.log('╚══════════════════════════════════════════════════════════════════════╝');

// ── 6. Tổng kết ──────────────────────────────────────────
const usedSkills = items.filter(i => i.usage > 0);
const unusedSkills = items.filter(i => i.usage === 0);
const totalScore = items.reduce((s, i) => s + i.score, 0);
const totalSizeKB = Object.values(sizeMap).reduce((s, v) => s + v, 0);

console.log('\n📊 THỐNG KÊ NHANH:');
console.log('  Tổng skill: ' + items.length);
console.log('  Skill đang dùng (có commit liên quan): ' + usedSkills.length);
console.log('  Skill chưa có commit liên quan: ' + unusedSkills.length);
console.log('  Tổng dung lượng SKILL.md: ' + totalSizeKB.toFixed(1) + ' KB');
console.log('  Tổng Priority Score: ' + Math.round(totalScore));

if (usedSkills.length > 0) {
  console.log('\n🔥 TOP 5 SKILLS GÂY TỐN TOKEN NHẤT:');
  const top5 = items.slice(0, 5);
  for (let i = 0; i < top5.length; i++) {
    const it = top5[i];
    console.log(
      '  ' + (i + 1) + '. ' + it.name +
      ' — dùng ' + it.usage + ' lần, file ' + it.sizeKB.toFixed(1) +
      'KB → score ' + Math.round(it.score)
    );
  }
}

if (unusedSkills.length > 0) {
  console.log('\n⚫ SKILLS CHƯA CÓ COMMIT LIÊN QUAN (xem xét xóa/gộp):');
  for (const it of unusedSkills) {
    console.log('  - ' + it.name + ' (' + it.sizeKB.toFixed(1) + ' KB)');
  }
}

console.log('\n💡 Gợi ý tối ưu:');
console.log('  1. Top 3 skills 🔴 → tối ưu trước (rút gọn SKILL.md)');
console.log('  2. Skills 🟡 có file > 8KB → rút gọn nếu có thể');
console.log('  3. Skills ⚫ nếu không phải foundation → cân nhắc xóa');
console.log('  4. Gộp các skill nhỏ cùng chủ đề → giảm số lượng file load');
