#!/usr/bin/env node

/**
 * sync-courseware.js
 *
 * 从 course-map.yaml 自动生成：
 * 1. 每节课的页脚导航
 * 2. SKILL.md 课程表格
 * 3. 健康报告（行数预警、topic 覆盖度）
 *
 * Usage:
 *   node scripts/sync-courseware.js          # 同步 + 报告
 *   node scripts/sync-courseware.js --dry    # 只看报告，不修改文件
 *   node scripts/sync-courseware.js --check  # CI 模式：有差异则 exit 1
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// ── paths ──────────────────────────────────────────────────────────────
const GUIDE_ROOT = path.join(__dirname, '..', 'guide');
const COURSE_MAP = path.join(GUIDE_ROOT, 'course-map.yaml');
const LESSONS_DIR = path.join(GUIDE_ROOT, 'lessons');
const SKILL_MD = path.join(__dirname, '..', '.claude', 'skills', 'cc4pm-guide', 'SKILL.md');

// ── args ───────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry');
const CHECK_MODE = args.includes('--check');

// ── load course map ────────────────────────────────────────────────────
function loadCourseMap() {
  const raw = fs.readFileSync(COURSE_MAP, 'utf8');
  return yaml.load(raw);
}

// ── flatten lessons into ordered list ──────────────────────────────────
function flattenLessons(courseMap) {
  const list = [];
  for (const stage of courseMap.stages) {
    for (const lesson of stage.lessons) {
      list.push({
        ...lesson,
        stageId: stage.id,
        stageTitle: stage.title,
        stageSubtitle: stage.subtitle || '',
        filePath: path.join(LESSONS_DIR, stage.id, lesson.file),
      });
    }
  }
  return list;
}

// ── count stage main lessons (not supplementary) ───────────────────────
function stageMainCount(stage) {
  return stage.lessons.filter((l) => !l.supplementary).length;
}

// ── generate navigation footer ─────────────────────────────────────────
function generateFooter(lesson, prev, next, stage, totalMainLessons) {
  const stageNum = stage.id.replace('stage-', '');
  const stageLocalCount = stageMainCount(stage);
  const localIdx = stage.lessons.filter((l) => !l.supplementary).indexOf(
    stage.lessons.find((l) => l.id === lesson.id && !l.supplementary)
  );

  let position;
  if (lesson.supplementary) {
    position = `Lesson ${lesson.number}/${totalMainLessons}`;
  } else {
    const stageInternalIdx = stage.lessons
      .filter((l) => !l.supplementary)
      .findIndex((l) => l.id === lesson.id);
    position = `Lesson ${lesson.number}/${totalMainLessons} (阶段内 ${stageInternalIdx + 1}/${stageLocalCount})`;
  }

  let prevPart;
  if (!prev) {
    prevPart = '上一课: 无';
  } else if (prev.stageId !== lesson.stageId) {
    prevPart = `上一课: Lesson ${prev.number} - ${prev.short_title}（阶段 ${prev.stageId.replace('stage-', '')}）`;
  } else {
    prevPart = `上一课: Lesson ${prev.number} - ${prev.short_title}`;
  }

  let nextPart;
  if (!next) {
    nextPart = '课程完结';
  } else if (next.stageId !== lesson.stageId) {
    nextPart = `下一课: Lesson ${next.number} - ${next.short_title}（阶段 ${next.stageId.replace('stage-', '')}）`;
  } else {
    nextPart = `下一课: Lesson ${next.number} - ${next.short_title}`;
  }

  return `*阶段 ${stageNum} | ${position} | ${prevPart} | ${nextPart}*`;
}

// ── patch footer in lesson file ────────────────────────────────────────
// Footer pattern: last line starting with *阶段
const FOOTER_RE = /^\*阶段\s.+\*$/m;

function patchFooter(filePath, newFooter) {
  if (!fs.existsSync(filePath)) {
    return { changed: false, error: `file not found: ${filePath}` };
  }
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  // find the footer line (search from bottom)
  let footerIdx = -1;
  for (let i = lines.length - 1; i >= 0; i--) {
    if (FOOTER_RE.test(lines[i])) {
      footerIdx = i;
      break;
    }
  }

  if (footerIdx === -1) {
    return { changed: false, error: `no footer found in ${path.basename(filePath)}` };
  }

  if (lines[footerIdx] === newFooter) {
    return { changed: false };
  }

  lines[footerIdx] = newFooter;
  if (!DRY_RUN && !CHECK_MODE) {
    fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
  }
  return { changed: true, old: lines[footerIdx], new: newFooter };
}

// ── generate SKILL.md course table ─────────────────────────────────────
function generateSkillTable(courseMap) {
  const lines = [];

  for (const stage of courseMap.stages) {
    const stageNum = stage.id.replace('stage-', '');
    const mainCount = stageMainCount(stage);
    const subtitle = stage.subtitle ? ` — ${stage.subtitle}` : '';
    lines.push('');
    lines.push(`### 阶段 ${stageNum}：${stage.title}${subtitle}（${mainCount} 节课）`);
    lines.push('');
    lines.push('| 编号 | 课名 | 核心知识点 |');
    lines.push('|------|------|-----------|');

    for (const lesson of stage.lessons) {
      const topicStr = lesson.topics.slice(0, 4).join('、');
      lines.push(`| ${lesson.number} | ${lesson.title} | ${topicStr} |`);
    }
  }

  return lines.join('\n');
}

// ── patch SKILL.md course table section ────────────────────────────────
const TABLE_START_RE = /^### 阶段 1：/m;
const TABLE_END_RE = /^## [^#]/m; // next h2 section after the tables

function patchSkillMd(newTable) {
  if (!fs.existsSync(SKILL_MD)) {
    return { changed: false, error: 'SKILL.md not found' };
  }
  const content = fs.readFileSync(SKILL_MD, 'utf8');

  // find the start of course table section
  const startMatch = content.match(TABLE_START_RE);
  if (!startMatch) {
    return { changed: false, error: 'course table section not found in SKILL.md' };
  }
  const startIdx = startMatch.index;

  // find the end — next h2 after the tables, or end of file
  const afterStart = content.slice(startIdx);
  const endMatch = afterStart.match(TABLE_END_RE);
  const endIdx = endMatch ? startIdx + endMatch.index : content.length;

  const oldSection = content.slice(startIdx, endIdx).trimEnd();
  const newSection = newTable.trimStart();

  if (oldSection === newSection) {
    return { changed: false };
  }

  if (!DRY_RUN && !CHECK_MODE) {
    const patched = content.slice(0, startIdx) + newSection + '\n\n' + content.slice(endIdx);
    fs.writeFileSync(SKILL_MD, patched, 'utf8');
  }
  return { changed: true };
}

// ── health report ──────────────────────────────────────────────────────
function healthReport(lessons, defaultMaxLines) {
  const warnings = [];

  for (const lesson of lessons) {
    if (!fs.existsSync(lesson.filePath)) {
      warnings.push(`❌ MISSING: ${lesson.stageId}/${lesson.file}`);
      continue;
    }
    const content = fs.readFileSync(lesson.filePath, 'utf8');
    const lineCount = content.split('\n').length;
    const maxLines = lesson.max_lines || defaultMaxLines;

    if (lineCount > maxLines) {
      warnings.push(
        `⚠️  OVERSIZE: L${lesson.number} ${lesson.short_title} — ${lineCount} lines (limit: ${maxLines})`
      );
    }
  }

  // topic coverage summary
  const topicMap = new Map();
  for (const lesson of lessons) {
    for (const topic of lesson.topics || []) {
      if (!topicMap.has(topic)) topicMap.set(topic, []);
      topicMap.get(topic).push(`L${lesson.number}`);
    }
  }

  const singleCoverage = [];
  for (const [topic, refs] of topicMap) {
    if (refs.length === 1) {
      singleCoverage.push(`   ${topic} → ${refs[0]}`);
    }
  }

  return { warnings, topicCount: topicMap.size, singleCoverage };
}

// ── main ───────────────────────────────────────────────────────────────
function main() {
  const courseMap = loadCourseMap();
  const lessons = flattenLessons(courseMap);
  const totalMainLessons = lessons.filter((l) => !l.supplementary).length;

  let changeCount = 0;
  const errors = [];

  // 1. Sync footers
  console.log('\n📚 Syncing lesson footers...');
  for (let i = 0; i < lessons.length; i++) {
    const lesson = lessons[i];
    const prev = i > 0 ? lessons[i - 1] : null;
    const next = i < lessons.length - 1 ? lessons[i + 1] : null;
    const stage = courseMap.stages.find((s) => s.id === lesson.stageId);

    const footer = generateFooter(lesson, prev, next, stage, totalMainLessons);
    const result = patchFooter(lesson.filePath, footer);

    if (result.error) {
      errors.push(result.error);
      console.log(`   ❌ L${lesson.number}: ${result.error}`);
    } else if (result.changed) {
      changeCount++;
      console.log(`   ✏️  L${lesson.number} ${lesson.short_title} — footer updated`);
    } else {
      console.log(`   ✅ L${lesson.number} ${lesson.short_title}`);
    }
  }

  // 2. Sync SKILL.md table
  console.log('\n📋 Syncing SKILL.md course table...');
  const table = generateSkillTable(courseMap);
  const skillResult = patchSkillMd(table);
  if (skillResult.error) {
    errors.push(skillResult.error);
    console.log(`   ❌ ${skillResult.error}`);
  } else if (skillResult.changed) {
    changeCount++;
    console.log('   ✏️  SKILL.md table updated');
  } else {
    console.log('   ✅ SKILL.md table up to date');
  }

  // 3. Health report
  console.log('\n🔍 Health report...');
  const report = healthReport(lessons, courseMap.meta.default_max_lines || 400);

  if (report.warnings.length === 0) {
    console.log('   ✅ All lessons within line limits');
  } else {
    for (const w of report.warnings) {
      console.log(`   ${w}`);
    }
  }

  console.log(`\n📊 Stats: ${lessons.length} lessons, ${report.topicCount} unique topics`);

  if (report.singleCoverage.length > 0) {
    console.log(`\n💡 Topics covered in only one lesson (${report.singleCoverage.length}):`);
    for (const line of report.singleCoverage.slice(0, 10)) {
      console.log(line);
    }
    if (report.singleCoverage.length > 10) {
      console.log(`   ... and ${report.singleCoverage.length - 10} more`);
    }
  }

  // summary
  const mode = DRY_RUN ? ' (dry run)' : CHECK_MODE ? ' (check mode)' : '';
  console.log(`\n${changeCount === 0 ? '✅ Everything in sync' : `✏️  ${changeCount} file(s) updated`}${mode}`);

  if (errors.length > 0) {
    console.log(`\n❌ ${errors.length} error(s) found`);
  }

  if (CHECK_MODE && (changeCount > 0 || errors.length > 0)) {
    process.exit(1);
  }
}

main();
