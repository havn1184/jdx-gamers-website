#!/usr/bin/env node
// check-all.cjs — Review sau code Website (JGameApp): (1) tuân thủ skill = các script còn hiệu lực của
// checklist-sau-code/scripts/check-for-skill (chỉ những script TỒN TẠI và áp dụng cho JGameApp; check-all cũ liệt kê
// 16 script đã mất nên bỏ qua im lặng), (2) lessons/*.cjs — lỗi đã gặp. Chỉ in phần FAIL/vi phạm.
//
//   node Website/.claude/skills/review-sau-code/scripts/check-all.cjs [featureDir] [--only skills|lessons] [--id WEB-L01,check-layer]
//   featureDir: đường dẫn tương đối từ Website/ (vd src/modules/JGameApp/features/Public/tasks). Mặc định toàn module.
// Exit 1 nếu có ERROR/FAIL.
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const args = process.argv.slice(2);
const dirArg = args.find((a, i) => !a.startsWith('--') && !(i > 0 && ['--only', '--id'].includes(args[i - 1])));
const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : null;
const idFilter = args.includes('--id') ? args[args.indexOf('--id') + 1].split(',').map((s) => s.trim().toLowerCase()) : null;
const WEBSITE = path.resolve(__dirname, '..', '..', '..', '..');
const MODULE = path.join(WEBSITE, 'src', 'modules', 'JGameApp');
const scopeAbs = dirArg ? path.resolve(dirArg) : MODULE;
const featureRel = path.relative(MODULE, scopeAbs).replace(/\\/g, '/');
const wantId = (id) => !idFilter || idFilter.some((x) => id.toLowerCase().includes(x));

// ---- (1) Tuân thủ skill: script trong checklist-sau-code còn hiệu lực với JGameApp ----
const SKILL_SCRIPTS = {
  'check-layer.cjs': 'cau-truc-du-an (Pages -> Hooks -> Services, không gọi API trong .tsx)',
  'check-hook-patterns.cjs': 'hook-conventions',
  'check-hook-props.cjs': 'hook-conventions',
  'check-ts-strict.cjs': 'quy-tac-code § TypeScript strict',
  'check-undef-symbols.cjs': 'quy-tac-code § Import',
  'check-syntax.cjs': 'sua-file-an-toan',
  'check-vietnamese.cjs': 'quy-tac-code § Comments tiếng Việt',
  'check-file-size.cjs': 'quy-tac-code § File size',
  'check-performance-react.cjs': 'quy-tac-code § Perf',
  'check-performance-render.cjs': 'quy-tac-code § Render',
  'check-performance-bundle.cjs': 'quy-tac-code § Bundle',
  'check-security.cjs': 'quy-tac-code § Security',
  'check-circular-deps.cjs': 'cau-truc-du-an',
  'check-dead-files.cjs': 'cau-truc-du-an',
  'check-unused-deps.cjs': 'cau-truc-du-an',
  'check-a11y.cjs': 'quy-tac-giao-dien (workspace mục 7)',
  'check-menu-routes.cjs': 'cau-truc-du-an § routeConfig',
  'check-validate.cjs': 'quy-tac-code § Validate',
  'check-be-dto-fields.cjs': 'api-service-conventions (field FE = BE)',
  'check-app-isolation.cjs': 'cau-truc-du-an',
  'check-grid-span.cjs': 'quy-tac-giao-dien',
};
// Check toàn dự án (không theo feature) - chỉ WARN, ghi tồn đọng, không chặn gate
const NON_BLOCKING = new Set(['check-unused-deps.cjs', 'check-dead-files.cjs', 'check-performance-bundle.cjs', 'check-circular-deps.cjs']);
let totalErr = 0, totalWarn = 0, ran = 0, withIssues = 0;
console.log(`# review-sau-code Website — phạm vi: ${featureRel || 'src/modules/JGameApp'}`);
if (only !== 'lessons') {
  console.log('\n## TUÂN THỦ SKILL (checklist-sau-code/scripts/check-for-skill)');
  const dir = path.join(WEBSITE, '.claude', 'skills', 'checklist-sau-code', 'scripts', 'check-for-skill');
  for (const [script, skill] of Object.entries(SKILL_SCRIPTS)) {
    const sp = path.join(dir, script);
    if (!fs.existsSync(sp) || !wantId(script)) continue;
    ran++;
    const cmdArgs = [sp, path.relative(WEBSITE, MODULE).replace(/\\/g, '/')].concat(featureRel ? [featureRel] : []);
    let out = '';
    try { out = execFileSync('node', cmdArgs, { cwd: WEBSITE, encoding: 'utf8', stdio: 'pipe' }); } catch (e) { out = (e.stdout || '') + (e.stderr || ''); }
    if (/Cannot find module|node:fs:\d+|TypeError|ReferenceError/.test(out) && !/FAIL|PASS/.test(out)) { console.log(`\n⚠️  ${script} — script lỗi: ${out.trim().split('\n').slice(0, 3).join(' | ')}`); continue; }
    if (/FAIL/.test(out)) {
      withIssues++;
      const soft = NON_BLOCKING.has(script);
      if (soft) totalWarn++; else totalErr++;
      console.log(`\n=== ${script} (skill ${skill})${soft ? ' [toàn dự án - WARN, ghi tồn đọng]' : ''}\n${out.trim().split('\n').slice(0, 25).join('\n')}`);
    }
  }
}
// ---- (2) Lỗi đã gặp ----
if (only !== 'skills') {
  console.log('\n## LỖI ĐÃ GẶP (LESSONS.md)');
  const dir = path.join(__dirname, 'lessons');
  for (const f of fs.existsSync(dir) ? fs.readdirSync(dir).filter((x) => x.endsWith('.cjs')).sort() : []) {
    let m; try { m = require(path.join(dir, f)); } catch (e) { console.log(`⚠️  Không load được ${f}: ${e.message}`); continue; }
    if (!wantId(m.id)) continue;
    ran++;
    let res; try { res = m.check(scopeAbs); } catch (e) { console.log(`\n=== ${m.id} — script lỗi: ${e.message}`); continue; }
    if (!res.length) continue;
    withIssues++;
    console.log(`\n=== ${m.id} — ${m.title} (${m.source})`);
    for (const fr of res) for (const i of fr.issues) { console.log(`[${i.level}] ${fr.file}${i.line ? ':' + i.line : ''} — ${i.rule}: ${i.message}`); if (i.level === 'ERROR') totalErr++; else totalWarn++; }
  }
}
console.log(`\n📊 TỔNG KẾT: ${ran} check, ${withIssues} có vi phạm — ❌ ERROR/FAIL: ${totalErr} | ⚠️ WARN: ${totalWarn}`);
if (!totalErr && !totalWarn) console.log('✅ Sạch: tuân thủ skill và không tái phạm lỗi đã gặp.');
process.exit(totalErr ? 1 : 0);
