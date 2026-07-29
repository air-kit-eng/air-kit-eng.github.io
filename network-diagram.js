(function () {
  const container = document.querySelector('[data-network-diagram]');
  if (!container) return;

  const nodes = [
    { id: 1, x: 20, y: 20, color: '#5B4CFF', label: 'AWS CT' },
    { id: 2, x: 80, y: 16, color: '#2D8CFF', label: 'OKTA' },
    { id: 3, x: 50, y: 40, color: '#5B4CFF', label: 'CORRELATION' },
    { id: 4, x: 15, y: 66, color: '#00C2A8', label: 'EDR' },
    { id: 5, x: 75, y: 70, color: '#5B4CFF', label: 'GRAPH' },
    { id: 6, x: 45, y: 86, color: '#2D8CFF', label: 'HYPOTHESIS' }
  ];

  const edges = [
    { from: 1, to: 3 },
    { from: 2, to: 3 },
    { from: 3, to: 4 },
    { from: 3, to: 5 },
    { from: 4, to: 6 },
    { from: 5, to: 6 },
    { from: 1, to: 4 }
  ];

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 100 100');
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  container.appendChild(svg);

  const grid = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  grid.setAttribute('x', '0');
  grid.setAttribute('y', '0');
  grid.setAttribute('width', '100');
  grid.setAttribute('height', '100');
  grid.setAttribute('fill', 'transparent');
  svg.appendChild(grid);

  const lineGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const particleGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const nodeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  svg.appendChild(lineGroup);
  svg.appendChild(particleGroup);
  svg.appendChild(nodeGroup);

  edges.forEach((edge, i) => {
    const from = nodes.find((n) => n.id === edge.from);
    const to = nodes.find((n) => n.id === edge.to);
    if (!from || !to) return;

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', from.x);
    line.setAttribute('y1', from.y);
    line.setAttribute('x2', to.x);
    line.setAttribute('y2', to.y);
    line.setAttribute('stroke', 'rgba(255,255,255,0.24)');
    line.setAttribute('stroke-width', '0.3');
    line.setAttribute('stroke-linecap', 'round');
    lineGroup.appendChild(line);

    const particle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    particle.setAttribute('r', '0.6');
    particle.setAttribute('fill', '#00C2A8');
    particleGroup.appendChild(particle);

    const start = performance.now() + i * 200;
    function animateParticle(now) {
      const t = ((now - start) % 4000) / 4000;
      const eased = t < 0.5 ? t * t * 2 : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const x = from.x + (to.x - from.x) * eased;
      const y = from.y + (to.y - from.y) * eased;
      particle.setAttribute('cx', x);
      particle.setAttribute('cy', y);
      requestAnimationFrame(animateParticle);
    }

    requestAnimationFrame(animateParticle);
  });

  nodes.forEach((node, i) => {
    const core = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    core.setAttribute('cx', node.x);
    core.setAttribute('cy', node.y);
    core.setAttribute('r', '2');
    core.setAttribute('fill', node.color);
    nodeGroup.appendChild(core);

    const ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    ring.setAttribute('cx', node.x);
    ring.setAttribute('cy', node.y);
    ring.setAttribute('r', '4');
    ring.setAttribute('fill', 'none');
    ring.setAttribute('stroke', node.color);
    ring.setAttribute('stroke-width', '0.3');
    nodeGroup.appendChild(ring);

    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', node.x);
    label.setAttribute('y', node.y - 4);
    label.setAttribute('fill', 'rgba(230,232,239,0.72)');
    label.setAttribute('font-size', '2.5');
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('font-family', 'Inter, sans-serif');
    label.setAttribute('class', 'uppercase');
    label.textContent = node.label;
    nodeGroup.appendChild(label);

    const delay = i * 160;
    setTimeout(() => {
      core.setAttribute('opacity', '1');
      ring.setAttribute('opacity', '0.9');
    }, delay);
  });
})();
