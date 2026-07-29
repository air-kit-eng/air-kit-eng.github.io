(function () {
  const container = document.querySelector('[data-reasoning-engine]');
  if (!container) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- Pull live design tokens. No hardcoded color, ever. ----
  const rootStyle = getComputedStyle(document.documentElement);
  const token = (name, fallback) => {
    const v = rootStyle.getPropertyValue(name).trim();
    return v || fallback;
  };

  const colors = {
    ink: token('--ink', '#0b0f19'),
    indigo: token('--brand-indigo', '#5b4cff'),
    cyan: token('--brand-cyan', '#2d8cff'),
    teal: token('--brand-teal', '#00c2a8'),
    foreground: token('--foreground', '#ffffff'),
    muted: token('--muted-foreground', 'rgba(230,232,239,0.72)'),
    hairline: token('--hairline', 'rgba(255,255,255,0.1)')
  };

  const fontDisplay =
    rootStyle.getPropertyValue('--font-display').trim() ||
    '"Space Grotesk", ui-sans-serif, system-ui, sans-serif';

  // ---- Canvas setup ----
  const canvas = document.createElement('canvas');
  canvas.setAttribute('role', 'img');
  canvas.setAttribute(
    'aria-label',
    'Animated sequence showing AIR-Kit\u2019s reasoning process: observation, evidence, correlation, hypothesis, experiment, and recommendation.'
  );
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let width = 0;
  let height = 0;

  function resize() {
    const rect = container.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  const resizeObserver = new ResizeObserver(() => {
    resize();
    if (prefersReducedMotion) drawStaticFrame();
  });
  resizeObserver.observe(container);
  resize();

  // ---- Easing ----
  const easeInOutCubic = (t) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  // ---- Particle field ----
  // Normalized coordinate space (0..1 x, 0..1 y), mapped to canvas at draw time.
  const PARTICLE_COUNT = 90;

  function seededRandom(seed) {
    let s = seed;
    return function () {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
  }
  const rand = seededRandom(1337);

  const particles = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      // scattered "observation" position
      scatterX: rand(),
      scatterY: rand(),
      // current interpolated position, set each frame
      x: 0,
      y: 0,
      baseRadius: 0.9 + rand() * 1.1,
      colorIdx: Math.floor(rand() * 3),
      // per-particle timing jitter so motion doesn't feel synchronized/robotic
      jitter: rand() * 0.4
    });
  }
  const palette = [colors.indigo, colors.cyan, colors.teal];

  // ---- Cluster definitions (normalized space) ----
  // Stage 3: correlation clusters. Stage 4: one hypothesis node.
  const clusters = [
    { x: 0.28, y: 0.34, r: 0.1 },
    { x: 0.62, y: 0.24, r: 0.09 },
    { x: 0.74, y: 0.62, r: 0.1 },
    { x: 0.34, y: 0.7, r: 0.09 }
  ];
  const hypothesisPoint = { x: 0.5, y: 0.46 };
  const recommendationPoint = { x: 0.5, y: 0.5 };

  function assignClusterTargets() {
    particles.forEach((p, i) => {
      const c = clusters[i % clusters.length];
      const angle = rand() * Math.PI * 2;
      const dist = rand() * c.r;
      p.clusterX = c.x + Math.cos(angle) * dist;
      p.clusterY = c.y + Math.sin(angle) * dist;

      const hAngle = rand() * Math.PI * 2;
      const hDist = 0.02 + rand() * 0.05;
      p.hypoX = hypothesisPoint.x + Math.cos(hAngle) * hDist;
      p.hypoY = hypothesisPoint.y + Math.sin(hAngle) * hDist;
    });
  }
  assignClusterTargets();

  // ---- Stage definitions ----
  // Each stage: label, duration (ms), and a positional function per particle.
  const STAGE_MS = 2600;
  const HOLD_MS = 1500;
  const stages = [
    'Observation',
    'Evidence',
    'Correlation',
    'Hypothesis',
    'Experiment',
    'Recommendation'
  ];
  const TOTAL_MS = STAGE_MS * stages.length + HOLD_MS;

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  // Returns {x, y, opacity} for a particle at a given stage index + local progress (0..1)
  function particlePosition(p, stageIndex, localT) {
    const eased = easeInOutCubic(Math.min(1, Math.max(0, localT)));

    switch (stageIndex) {
      case 0: {
        // Observation: a single point resolves at center, rest of field barely visible
        const isSeed = p === particles[0];
        if (isSeed) {
          return { x: 0.5, y: 0.5, opacity: 1, scale: 1.4 };
        }
        return { x: p.scatterX, y: p.scatterY, opacity: 0.08 * eased, scale: 0.6 };
      }
      case 1: {
        // Evidence: full scattered field fades in
        return { x: p.scatterX, y: p.scatterY, opacity: lerp(0.08, 0.55, eased), scale: 0.8 };
      }
      case 2: {
        // Correlation: scattered -> clustered
        return {
          x: lerp(p.scatterX, p.clusterX, eased),
          y: lerp(p.scatterY, p.clusterY, eased),
          opacity: lerp(0.55, 0.85, eased),
          scale: 0.85
        };
      }
      case 3: {
        // Hypothesis: clusters collapse toward single glowing node; one wins
        return {
          x: lerp(p.clusterX, p.hypoX, eased),
          y: lerp(p.clusterY, p.hypoY, eased),
          opacity: lerp(0.85, 0.5, eased),
          scale: lerp(0.85, 0.55, eased)
        };
      }
      case 4: {
        // Experiment: gentle orbit / testing motion around the hypothesis point
        const angle = (p.jitter + localT) * Math.PI * 2;
        const orbitR = 0.03 + p.jitter * 0.02;
        return {
          x: p.hypoX + Math.cos(angle) * orbitR * eased,
          y: p.hypoY + Math.sin(angle) * orbitR * eased,
          opacity: lerp(0.5, 0.35, eased),
          scale: 0.5
        };
      }
      case 5:
      default: {
        // Recommendation: everything but a small core fades away
        return {
          x: lerp(p.hypoX, recommendationPoint.x, eased),
          y: lerp(p.hypoY, recommendationPoint.y, eased),
          opacity: lerp(0.35, 0, eased),
          scale: 0.4
        };
      }
    }
  }

  function drawParticle(p, pos) {
    if (pos.opacity <= 0.01) return;
    const px = pos.x * width;
    const py = pos.y * height;
    const r = p.baseRadius * pos.scale * (width < 480 ? 0.75 : 1);

    ctx.beginPath();
    ctx.fillStyle = palette[p.colorIdx];
    ctx.globalAlpha = pos.opacity;
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawConnections(stageIndex, localT, positions) {
    // Thin indigo lines only during Correlation / Hypothesis stages
    if (stageIndex !== 2 && stageIndex !== 3) return;
    const eased = easeInOutCubic(localT);
    const alpha = stageIndex === 2 ? 0.12 * eased : 0.12 * (1 - eased);
    if (alpha <= 0.01) return;

    ctx.strokeStyle = colors.indigo;
    ctx.lineWidth = 0.6;

    clusters.forEach((c) => {
      const cx = c.x * width;
      const cy = c.y * height;
      particles.forEach((p, i) => {
        if (i % clusters.length !== clusters.indexOf(c)) return;
        const pos = positions[i];
        if (pos.opacity < 0.1) return;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(pos.x * width, pos.y * height);
        ctx.stroke();
      });
    });
  }

  function drawGlowRing(stageIndex, localT) {
    if (stageIndex !== 3 && stageIndex !== 4) return;
    const eased = easeInOutCubic(Math.min(1, localT * 1.4));
    const cx = hypothesisPoint.x * width;
    const cy = hypothesisPoint.y * height;
    const baseR = Math.min(width, height) * 0.05;

    ctx.save();
    ctx.globalAlpha = 0.5 * eased;
    ctx.strokeStyle = colors.cyan;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, baseR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function drawRecommendationCore(stageIndex, localT) {
    if (stageIndex !== 5) return;
    const eased = easeInOutCubic(localT);
    const cx = recommendationPoint.x * width;
    const cy = recommendationPoint.y * height;
    const r = Math.min(width, height) * 0.018 * (1 + eased * 0.6);

    ctx.save();
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = colors.teal;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawLabel(stageIndex, localT) {
    const text = stages[stageIndex];
    // Label fades in during the back half of the stage, once geometry has resolved
    const fadeStart = 0.45;
    const fadeT = Math.max(0, (localT - fadeStart) / (1 - fadeStart));
    const alpha = easeInOutCubic(Math.min(1, fadeT));
    if (alpha <= 0.01) return;

    const size = Math.max(18, Math.min(34, width * 0.032));
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = colors.foreground;
    ctx.font = `600 ${size}px ${fontDisplay}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.letterSpacing = '0.02em';

    const labelY =
      stageIndex === 5
        ? recommendationPoint.y * height + Math.min(width, height) * 0.09
        : height * 0.5 + Math.min(width, height) * 0.22;

    ctx.fillText(text.toUpperCase(), width / 2, labelY);

    // stage index marker, small, above the label
    const markerSize = size * 0.36;
    ctx.font = `500 ${markerSize}px ${fontDisplay}`;
    ctx.globalAlpha = alpha * 0.55;
    ctx.fillStyle = colors.muted;
    ctx.fillText(
      `${String(stageIndex + 1).padStart(2, '0')} / ${String(stages.length).padStart(2, '0')}`,
      width / 2,
      labelY - size * 0.9
    );
    ctx.restore();
  }

  // ---- Main loop ----
  let startTime = null;
  let rafId = null;
  let isVisible = false;

  function frame(now) {
    if (!isVisible) return;
    if (startTime === null) startTime = now;

    const elapsed = (now - startTime) % TOTAL_MS;

    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = 1;

    let stageIndex, localT;
    if (elapsed >= STAGE_MS * stages.length) {
      // Hold on Recommendation
      stageIndex = stages.length - 1;
      localT = 1;
    } else {
      stageIndex = Math.floor(elapsed / STAGE_MS);
      localT = (elapsed % STAGE_MS) / STAGE_MS;
    }

    const positions = particles.map((p) => particlePosition(p, stageIndex, localT));

    drawConnections(stageIndex, localT, positions);
    particles.forEach((p, i) => drawParticle(p, positions[i]));
    drawGlowRing(stageIndex, localT);
    drawRecommendationCore(stageIndex, localT);
    ctx.globalAlpha = 1;
    drawLabel(stageIndex, localT);

    rafId = requestAnimationFrame(frame);
  }

  function drawStaticFrame() {
    // Reduced-motion fallback: static composed view, no animation loop
    ctx.clearRect(0, 0, width, height);
    const positions = particles.map((p) => particlePosition(p, 2, 1));
    particles.forEach((p, i) => drawParticle(p, positions[i]));
    drawLabel(5, 1);
  }

  function start() {
    if (isVisible) return;
    isVisible = true;
    startTime = null;
    rafId = requestAnimationFrame(frame);
  }

  function stop() {
    isVisible = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  }

  if (prefersReducedMotion) {
    resize();
    if (width > 0 && height > 0) {
      drawStaticFrame();
    } else {
      // Layout hadn't settled yet (e.g. aspect-ratio/webfont timing). Retry
      // on the next few frames until we get a real, non-zero size.
      let attempts = 0;
      const tryDraw = () => {
        attempts++;
        resize();
        if (width > 0 && height > 0) {
          drawStaticFrame();
        } else if (attempts < 30) {
          requestAnimationFrame(tryDraw);
        }
      };
      requestAnimationFrame(tryDraw);
    }
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            start();
          } else {
            stop();
          }
        });
      },
      { threshold: 0.3 }
    );
    observer.observe(container);
  }

  window.addEventListener('resize', resize);
})();
