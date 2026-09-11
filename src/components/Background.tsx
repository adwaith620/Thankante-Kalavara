import { useEffect, useRef } from 'react';

export const Background = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$+-*/=%""\'#&_(),.;:?!\\|{}<>[]^~';
    let fontSize = 14;
    let columns = 0;
    let drops: number[] = [];
    
    const pacmans: any[] = [];
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      columns = Math.floor(canvas.width / fontSize);
      drops = [];
      for (let x = 0; x < columns; x++) {
        drops[x] = 1;
      }
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize pacmans
    for (let i = 0; i < 3; i++) {
      pacmans.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        radius: 20,
        mouthOpen: 0,
        mouthDir: 1,
      });
    }

    const draw = () => {
      // Semi-transparent black to create trailing effect for matrix
      ctx.fillStyle = 'rgba(5, 5, 5, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw matrix rain
      ctx.fillStyle = '#0f0'; // green text
      ctx.font = fontSize + 'px monospace';
      
      for (let i = 0; i < drops.length; i++) {
        // Only update this column 60% of the time to reduce overall speed
        if (Math.random() < 0.6) {
          const text = characters.charAt(Math.floor(Math.random() * characters.length));
          ctx.fillText(text, i * fontSize, drops[i] * fontSize);
          
          if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
          }
          drops[i]++;
        }
      }
      
      // Draw Pac-Mans
      pacmans.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        
        if (p.x > canvas.width + p.radius) p.x = -p.radius;
        if (p.x < -p.radius) p.x = canvas.width + p.radius;
        if (p.y > canvas.height + p.radius) p.y = -p.radius;
        if (p.y < -p.radius) p.y = canvas.height + p.radius;
        
        // Randomly change direction occasionally
        if (Math.random() < 0.01) {
          p.vx = (Math.random() - 0.5) * 4;
          p.vy = (Math.random() - 0.5) * 4;
        }
        
        p.mouthOpen += 0.05 * p.mouthDir;
        if (p.mouthOpen >= 0.2 || p.mouthOpen <= 0) {
          p.mouthDir *= -1;
        }
        
        let angle = Math.atan2(p.vy, p.vx);
        
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(angle);
        
        ctx.beginPath();
        ctx.arc(0, 0, p.radius, p.mouthOpen * Math.PI, (2 - p.mouthOpen) * Math.PI);
        ctx.lineTo(0, 0);
        ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
        ctx.fill();
        ctx.closePath();
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[-1] opacity-60"
      style={{ background: '#050505' }}
    />
  );
};
