// Lightweight canvas confetti burst — web only
// Call triggerConfetti() after task completion

export function triggerConfetti() {
  if (typeof document === 'undefined') return; // safe for native

  const canvas = document.createElement('canvas');
  canvas.style.cssText = `
    position: fixed; top: 0; left: 0;
    width: 100vw; height: 100vh;
    pointer-events: none; z-index: 99999;
  `;
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);

  const ctx  = canvas.getContext('2d');
  const particles = [];
  const colors = ['#BB86FC','#03DAC6','#FF5252','#FFB142','#4A9EFF','#FF4081','#4CAF50','#FFD700'];

  for (let i = 0; i < 130; i++) {
    particles.push({
      x:  Math.random() * canvas.width,
      y:  Math.random() * canvas.height * 0.4,
      w:  6 + Math.random() * 8,
      h:  3 + Math.random() * 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      angle: Math.random() * Math.PI * 2,
      spin:  (Math.random() - 0.5) * 0.2,
      vx:   (Math.random() - 0.5) * 4,
      vy:   1 + Math.random() * 3,
      alpha: 1,
    });
  }

  let frame;
  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    particles.forEach(p => {
      p.x     += p.vx;
      p.y     += p.vy;
      p.angle += p.spin;
      p.vy    += 0.06; // gravity
      p.alpha -= 0.008;
      if (p.alpha > 0) {
        alive = true;
        ctx.save();
        ctx.globalAlpha = Math.max(p.alpha, 0);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
    });
    if (alive) { frame = requestAnimationFrame(animate); }
    else { canvas.remove(); }
  };

  frame = requestAnimationFrame(animate);

  // Safety cleanup after 4 seconds
  setTimeout(() => {
    cancelAnimationFrame(frame);
    canvas.remove();
  }, 4000);
}
