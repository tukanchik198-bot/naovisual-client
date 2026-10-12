(function () {
  'use strict';
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
  if (reduce || !fine) return;

  // Lower EASE = smoother / more floaty. Tune here.
  var EASE = 0.06;

  var html = document.documentElement;

  // Neutralise CSS smooth so our rAF stepping is not double-animated.
  html.style.scrollBehavior = 'auto';

  var target = window.pageYOffset;
  var current = window.pageYOffset;
  var animating = false;

  function maxScroll() {
    return Math.max(0, html.scrollHeight - window.innerHeight);
  }
  function clamp(v) {
    return Math.max(0, Math.min(v, maxScroll()));
  }

  function step() {
    current += (target - current) * EASE;
    if (Math.abs(target - current) < 0.4) {
      current = target;
      window.scrollTo(0, current);
      animating = false;
      return;
    }
    window.scrollTo(0, current);
    requestAnimationFrame(step);
  }

  function start() {
    if (animating) return;
    animating = true;
    requestAnimationFrame(step);
  }

  function onWheel(e) {
    if (e.ctrlKey) return; // allow pinch-zoom / ctrl+wheel
    e.preventDefault();
    var d = e.deltaY;
    if (e.deltaMode === 1) d *= 16;                    // lines -> px
    else if (e.deltaMode === 2) d *= window.innerHeight; // pages -> px
    target = clamp(target + d);
    start();
  }

  window.addEventListener('wheel', onWheel, { passive: false });

  // Keep in sync with native scrolling (scrollbar, keyboard, anchors).
  window.addEventListener('scroll', function () {
    if (!animating) target = current = window.pageYOffset;
  }, { passive: true });

  window.addEventListener('keydown', function () {
    animating = false;
    target = current = window.pageYOffset;
  });
})();
