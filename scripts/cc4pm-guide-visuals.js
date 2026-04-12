#!/usr/bin/env node
/**
 * cc4pm Guide Visuals - High-Signal CLI UI for Product Makers
 *
 * Provides beautiful, themed output for the /cc4pm-guide command
 * including ASCII art, boxes, and progress tracking.
 */

// ANSI color codes - no external dependencies
const chalk = {
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  magenta: (s) => `\x1b[35m${s}\x1b[0m`,
  blue: (s) => `\x1b[34m${s}\x1b[0m`,
  gray: (s) => `\x1b[90m${s}\x1b[0m`,
  white: (s) => `\x1b[37m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  bgBlue: (s) => `\x1b[44m${s}\x1b[0m`,
  italic: (s) => `\x1b[3m${s}\x1b[23m`,
};

const BOX = {
  topLeft: '╭',
  topRight: '╮',
  bottomLeft: '╰',
  bottomRight: '╯',
  horizontal: '─',
  vertical: '│',
};

function stripAnsi(str) {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\x1b\[[0-9;]*m/g, '');
}

function centerText(text, width) {
  const plainText = stripAnsi(text);
  const padding = Math.max(0, Math.floor((width - plainText.length) / 2));
  return ' '.repeat(padding) + text;
}

class cc4pmGuideUI {
  constructor(width = 75) {
    this.width = width;
  }

  banner() {
    const art = `
   ${chalk.cyan('██████╗ ██████╗██╗  ██╗██████╗ ███╗   ███╗')}
   ${chalk.cyan('██╔════╝██╔════╝██║  ██║██╔══██╗████╗ ████║')}
   ${chalk.cyan('██║     ██║     ███████║██████╔╝██╔████╔██║')}
   ${chalk.cyan('██║     ██║     ╚════██║██╔═══╝ ██║╚██╔╝██║')}
   ${chalk.cyan('╚██████╗╚██████╗     ██║██║     ██║ ╚═╝ ██║')}
    ${chalk.cyan('╚═════╝ ╚═════╝     ╚═╝╚═╝     ╚═╝     ╚═╝')}
    `;
    console.log(art);
    console.log(centerText(chalk.bold(chalk.white('CLAUDE CODE FOR PRODUCT MAKERS')), this.width));
    console.log(centerText(chalk.dim('AI-Driven Product Lifecycle OS'), this.width));
    console.log('\n');
  }

  courseCard(stageNum, stageTitle, lessons) {
    const title = `${chalk.bold(chalk.yellow(`STAGE ${stageNum}:`))} ${chalk.bold(stageTitle)}`;
    const line = chalk.blue(BOX.horizontal.repeat(this.width));
    
    console.log(line);
    console.log(`${chalk.blue(BOX.vertical)}  ${title}`);
    console.log(line);
    
    lessons.forEach(lesson => {
      const status = lesson.completed ? chalk.green('✓') : chalk.gray('○');
      const num = chalk.dim(lesson.id.toString().padStart(2, ' '));
      console.log(`${chalk.blue(BOX.vertical)}  ${status}  ${num}. ${lesson.title}`);
    });
    
    console.log(line + '\n');
  }

  progressHeader(completed, total) {
    const percent = Math.round((completed / total) * 100);
    const filled = Math.round((this.width - 20) * (completed / total));
    const empty = (this.width - 20) - filled;
    
    const bar = chalk.green('█'.repeat(filled)) + chalk.gray('░'.repeat(empty));
    
    console.log(`\n ${chalk.bold('Overall Progress:')} ${bar} ${chalk.bold(percent)}%`);
    console.log(` ${chalk.dim(`${completed}/${total} Lessons Completed`)}\n`);
  }

  achievement(name, description, emoji = '🏆') {
    const content = `
   ${chalk.yellow(emoji)} ${chalk.bold(chalk.yellow('ACHIEVEMENT UNLOCKED:'))} ${chalk.bold(name)}
      ${chalk.italic(chalk.gray(description))}
    `;
    
    console.log(chalk.magenta(BOX.topLeft + BOX.horizontal.repeat(this.width - 2) + BOX.topRight));
    console.log(content.split('\n').map(l => l.trim() ? `${chalk.magenta(BOX.vertical)} ${l}` : '').filter(l => l).join('\n'));
    console.log(chalk.magenta(BOX.bottomLeft + BOX.horizontal.repeat(this.width - 2) + BOX.bottomRight));
    console.log('\n');
  }

  graduation() {
    console.log('\n' + centerText(chalk.bold(chalk.magenta('🌟 CONGRATULATIONS! 🌟')), this.width));
    const medal = `
                ${chalk.yellow('_______________')}
               ${chalk.yellow('|@@@@|     |@@@@|')}
               ${chalk.yellow('|@@@@|     |@@@@|')}
               ${chalk.yellow('\\@@@@|     |@@@@/')}
                ${chalk.yellow('\\@@@|     |@@@/')}
                 ${chalk.yellow('`@@|     |@@\'')}
                  ${chalk.yellow('\\@|     |@/')}
                   ${chalk.yellow('@|     |@')}
                    ${chalk.yellow('-------')}
                  ${chalk.yellow('/         \\')}
                 ${chalk.yellow('|   ${chalk.bold('cc4pm')}   |')}
                 ${chalk.yellow('|  ${chalk.bold('GRAD')}   |')}
                  ${chalk.yellow('\\         /')}
                   ${chalk.yellow('-------')}
    `;
    console.log(medal);
    console.log(centerText(chalk.bold('You have mastered the cc4pm Product Lifecycle OS'), this.width));
    console.log(centerText(chalk.dim('A new generation of Product Maker is born.'), this.width));
    console.log('\n');
  }
}

module.exports = cc4pmGuideUI;

// Main execution logic for CLI arguments
if (require.main === module) {
  const ui = new cc4pmGuideUI();
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--banner')) {
    ui.banner();
  }

  if (args.includes('--progress')) {
    const idx = args.indexOf('--progress');
    const completed = parseInt(args[idx + 1] || 0);
    const total = parseInt(args[idx + 2] || 26);
    ui.progressHeader(completed, total);
  }

  if (args.includes('--achievement')) {
    const idx = args.indexOf('--achievement');
    const name = args[idx + 1] || 'Achievement';
    const desc = args[idx + 2] || 'Description';
    const emoji = args[idx + 3] || '🏆';
    ui.achievement(name, desc, emoji);
  }

  if (args.includes('--graduation')) {
    ui.graduation();
  }
  
  if (args.includes('--stage')) {
    const idx = args.indexOf('--stage');
    const stageNum = args[idx + 1] || '1';
    const stageTitle = args[idx + 2] || 'Section';
    // Simplified demo lessons for the course card when called via CLI
    ui.courseCard(stageNum, stageTitle, [
      { id: '*', title: 'Course Content Loaded...', completed: false }
    ]);
  }
}
