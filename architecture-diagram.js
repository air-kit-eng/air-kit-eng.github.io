(function () {
  const container = document.querySelector('[data-architecture-diagram]');
  if (!container) return;

  const nodes = [
    { id: 'src1', x: 10, y: 20, label: 'Alert Sources', color: '#E6E8EF' },
    { id: 'src2', x: 10, y: 50, label: 'SIEM Logs', color: '#E6E8EF' },
    { id: 'src3', x: 10, y: 80, label: 'EDR Telemetry', color: '#E6E8EF' },
    { id: 'ingest', x: 30, y: 50, label: 'Telemetry Ingestion', color: '#2D8CFF', main: true },
    { id: 'engine', x: 50, y: 50, label: 'AI Investigation Engine', color: '#5B4CFF', main: true, size: 6 },
    { id: 'graph', x: 70, y: 30, label: 'Evidence Graph', color: '#00C2A8', main: true },
    { id: 'hypo', x: 70, y: 70, label: 'Hypothesis Generator', color: '#2D8CFF', main: true },
    { id: 'action', x: 90, y: 50, label: 'Action Recommendations', color: '#5B4CFF', main: true }
  ];

  const edges = [
    { from: 'src1', to: 'ingest' },
    { from: 'src2', to: 'ingest' },
    { from: 'src3', to: 'ingest' },
    { from: 'ingest', to: 'engine' },
    { from: 'engine', to: 'graph' },
    { from: 'engine', to: 'hypo' },
    { from: 'graph', to: 'action' },
    { from: 'hypo', to: 'action' }
  ];

  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', '0 0 100 100');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  container.appendChild(svg);

  const defs = document.createElementNS(svgNS, 'defs');
  const pattern = document.createElementNS(svgNS, 'pattern');
  pattern.setAttribute('id', 'architecture-grid');
  pattern.setAttribute('width', '2');
  pattern.setAttribute('height', '2');
  pattern.setAttribute('patternUnits', 'userSpaceOnUse');

  const path = document.createElementNS(svgNS, 'path');
  path.setAttribute('d', 'M 2 0 L 0 0 0 2');
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', 'rgba(255,255,255,0.03)');
  path.setAttribute('stroke-width', '0.1');
  pattern.appendChild(path);
  defs.appendChild(pattern);
  svg.appendChild(defs);

  const grid = document.createElementNS(svgNS, 'rect');
  grid.setAttribute('width', '100');
  grid.setAttribute('height', '100');
  grid.setAttribute('fill', 'url(#architecture-grid)');
  svg.appendChild(grid);

  const edgeGroup = document.createElementNS(svgNS, 'g');
  const nodeGroup = document.createElementNS(svgNS, 'g');
  svg.appendChild(edgeGroup);
  svg.appendChild(nodeGroup);

  const easeOut = (value) => 1 - Math.pow(1 - value, 3);

  edges.forEach((edge, index) => {
    const from = nodes.find((node) => node.id === edge.from);
    const to = nodes.find((node) => node.id === edge.to);
    if (!from || !to) return;

    const pathD = `M ${from.x} ${from.y} C ${(from.x + to.x) / 2} ${from.y}, ${(from.x + to.x) / 2} ${to.y}, ${to.x} ${to.y}`;

    const line = document.createElementNS(svgNS, 'path');
    line.setAttribute('d', pathD);
    line.setAttribute('fill', 'none');
    line.setAttribute('stroke', 'rgba(255,255,255,0.2)');
    line.setAttribute('stroke-width', '0.2');
    line.setAttribute('stroke-linecap', 'round');
    line.setAttribute('stroke-dasharray', '1000');
    line.setAttribute('stroke-dashoffset', '1000');
    edgeGroup.appendChild(line);

    const particle = document.createElementNS(svgNS, 'circle');
    particle.setAttribute('r', '0.55');
    particle.setAttribute('fill', from.color === '#E6E8EF' ? '#2D8CFF' : from.color);
    particle.setAttribute('opacity', '0');
    edgeGroup.appendChild(particle);

    const lineLength = 1000;
    const startTime = performance.now() + index * 140;

    function drawLine(now) {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / 1400);
      const eased = easeOut(progress);
      line.setAttribute('stroke-dashoffset', String(lineLength * (1 - eased)));
      if (progress < 1) {
        requestAnimationFrame(drawLine);
      }
    }

    function moveParticle(now) {
      const elapsed = (now - startTime) % 3000;
      const progress = elapsed / 3000;
      const len = line.getTotalLength();
      const point = line.getPointAtLength(len * progress);
      particle.setAttribute('cx', point.x);
      particle.setAttribute('cy', point.y);
      particle.setAttribute('opacity', '1');
      requestAnimationFrame(moveParticle);
    }

    requestAnimationFrame(drawLine);
    requestAnimationFrame(moveParticle);
  });

  nodes.forEach((node, index) => {
    const size = node.size || 4;
    const group = document.createElementNS(svgNS, 'g');
    group.setAttribute('opacity', '0');
    group.setAttribute('transform', `translate(${node.x} ${node.y}) scale(0.8)`);
    nodeGroup.appendChild(group);

    if (node.main) {
      const polygon = document.createElementNS(svgNS, 'polygon');
      polygon.setAttribute(
        'points',
        `${0},${-size} ${size * 0.866},${-size / 2} ${size * 0.866},${size / 2} ${0},${size} ${-size * 0.866},${size / 2} ${-size * 0.866},${-size / 2}`
      );
      polygon.setAttribute('fill', 'rgba(11, 15, 25, 1)');
      polygon.setAttribute('stroke', node.color);
      polygon.setAttribute('stroke-width', '0.5');
      group.appendChild(polygon);
    } else {
      const circle = document.createElementNS(svgNS, 'circle');
      circle.setAttribute('cx', '0');
      circle.setAttribute('cy', '0');
      circle.setAttribute('r', '2');
      circle.setAttribute('fill', 'rgba(11, 15, 25, 1)');
      circle.setAttribute('stroke', node.color);
      circle.setAttribute('stroke-width', '0.4');
      group.appendChild(circle);
    }

    const label = document.createElementNS(svgNS, 'text');
    label.setAttribute('x', '0');
    label.setAttribute('y', size + 3.8);
    label.setAttribute('fill', 'rgba(230,232,239,0.72)');
    label.setAttribute('font-size', '2');
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('font-family', 'Inter, sans-serif');
    label.textContent = node.label;
    group.appendChild(label);

    const startTime = performance.now() + index * 120;
    function animateNode(now) {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / 450);
      const eased = easeOut(progress);
      group.setAttribute('opacity', String(eased));
      group.setAttribute('transform', `translate(${node.x} ${node.y}) scale(${0.8 + 0.2 * eased})`);
      if (progress < 1) {
        requestAnimationFrame(animateNode);
      }
    }

    requestAnimationFrame(animateNode);
  });
})();
