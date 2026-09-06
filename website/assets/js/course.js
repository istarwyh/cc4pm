document.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-course-copy]');
  if (!button) return;
  button.textContent = '正在复制…';
  let timer;
  try {
    await Promise.race([
      navigator.clipboard.writeText(button.dataset.courseCopy),
      new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('Clipboard unavailable')), 1500); }),
    ]);
    button.textContent = '已复制，在教学会话中粘贴';
  } catch {
    button.textContent = '请选择下方文字复制';
    const text = button.parentElement.querySelector('textarea') || document.createElement('textarea');
    text.value = button.dataset.courseCopy;
    text.setAttribute('aria-label', '本课学习提示');
    button.after(text);
    text.select();
  } finally {
    clearTimeout(timer);
  }
});

document.addEventListener('change', (event) => {
  if (!event.target.matches('[data-main-only]')) return;
  document.querySelectorAll('[data-supplementary="true"]').forEach((row) => {
    row.hidden = event.target.checked;
  });
});
