import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const script = fs.readFileSync(new URL('../assets/js/course.js', import.meta.url), 'utf8');

test('learning prompt copy succeeds or exposes one selectable fallback', async () => {
  for (const allow of [true, false]) {
    const handlers = {};
    let fallback, copied;
    const button = {
      dataset: { courseCopy: '请带我学习 Lesson 17.10。' },
      parentElement: { querySelector: () => fallback },
      after: element => { fallback = element; },
    };
    const context = {
      document: {
        addEventListener: (event, callback) => { handlers[event] = callback; },
        createElement: () => ({ setAttribute() {}, select() { this.selected = true; } }),
      },
      navigator: { clipboard: { writeText: async text => { if (!allow) throw new Error('Permission denied'); copied = text; } } },
      setTimeout, clearTimeout,
    };
    vm.runInNewContext(script, context);
    const event = { target: { closest: () => button } };
    await handlers.click(event);
    if (allow) {
      assert.equal(copied, button.dataset.courseCopy);
      assert.equal(button.textContent, '已复制，在教学会话中粘贴');
      assert.equal(fallback, undefined);
    } else {
      assert.equal(fallback.value, button.dataset.courseCopy);
      assert.equal(fallback.selected, true);
      const first = fallback;
      await handlers.click(event);
      assert.equal(fallback, first);
    }
  }
});
