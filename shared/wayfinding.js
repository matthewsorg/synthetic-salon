'use strict';
// The directory is native HTML, and all destinations work without this enhancement.
(() => {
  const directory = document.querySelector('.salon-directory');
  if (!directory) return;
  const summary = directory.querySelector('summary');
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && directory.open) { directory.open = false; summary.focus(); }
  });
  document.addEventListener('click', event => {
    if (directory.open && !directory.contains(event.target)) directory.open = false;
  });
})();
