"use client";
import { useEffect } from "react";

export default function BackgroundProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const pC = document.getElementById("particles-canvas") as HTMLCanvasElement | null;
    const wC = document.getElementById("waves-canvas") as HTMLCanvasElement | null;

    if (!pC || !wC) return;

    const pCtx = pC.getContext("2d")!;
    const wCtx = wC.getContext("2d")!;

    function fit() {
      const dpr = window.devicePixelRatio || 1;
      pC.width = Math.floor(window.innerWidth * dpr);
      pC.height = Math.floor(window.innerHeight * dpr);
      wC.width = Math.floor(window.innerWidth * dpr);
      wC.height = Math.floor(window.innerHeight * dpr);
      pC.style.width = "100%";
      pC.style.height = "100%";
      wC.style.width = "100%";
      wC.style.height = "100%";
      pCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      wCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    fit();
    window.addEventListener("resize", fit);

    // create lightweight particles
    const particles: any[] = [];
    function initParticles() {
      particles.length = 0;
      const count = Math.max(30, Math.floor((window.innerWidth * window.innerHeight) / 14000));
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          r: Math.random() * 2 + 0.6,
          vx: (Math.random() - 0.5) * 0.6,
          vy: (Math.random() - 0.5) * 0.6,
          hue: 230 + Math.random() * 60,
        });
      }
    }
    initParticles();

    let tick = 0;
    function draw() {
      tick += 0.006;
      // waves - soft liquid layers
      wCtx.clearRect(0, 0, wC.width, wC.height);
      const g = wCtx.createLinearGradient(0, 0, wC.width, wC.height);
      g.addColorStop(0, "rgba(124,92,255,0.06)");
      g.addColorStop(0.5, "rgba(12,20,30,0.02)");
      g.addColorStop(1, "rgba(0,255,209,0.02)");
      wCtx.fillStyle = g;
      for (let i = 0; i < 3; i++) {
        wCtx.beginPath();
        const base = wC.height * (0.5 + i * 0.08);
        wCtx.moveTo(0, base);
        for (let x = 0; x <= wC.width; x += 40) {
          const y = base + Math.sin((x / 200) + tick * (0.9 + i * 0.4)) * (40 + i * 12);
          wCtx.lineTo(x, y);
        }
        wCtx.lineTo(wC.width, wC.height);
        wCtx.lineTo(0, wC.height);
        wCtx.closePath();
        wCtx.globalAlpha = 0.11 - i * 0.02;
        wCtx.fill();
      }

      // particles
      pCtx.clearRect(0, 0, pC.width, pC.height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10) p.x = window.innerWidth + 10;
        if (p.x > window.innerWidth + 10) p.x = -10;
        if (p.y < -10) p.y = window.innerHeight + 10;
        if (p.y > window.innerHeight + 10) p.y = -10;

        const rg = pCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 10);
        rg.addColorStop(0, "rgba(124,92,255,0.18)");
        rg.addColorStop(0.5, "rgba(6,200,180,0.08)");
        rg.addColorStop(1, "rgba(3,6,10,0)");
        pCtx.fillStyle = rg;
        pCtx.beginPath();
        pCtx.arc(p.x, p.y, p.r * 6, 0, Math.PI * 2);
        pCtx.fill();
      }

      requestAnimationFrame(draw);
    }
    draw();

    // parallax
    function onMove(e: MouseEvent) {
      const cx = (e.clientX / window.innerWidth - 0.5) * 1.2;
      const cy = (e.clientY / window.innerHeight - 0.5) * 1.2;
      pC.style.transform = "translate(" + cx * 8 + "px," + cy * 8 + "px)";
      wC.style.transform = "translate(" + cx * 6 + "px," + cy * 6 + "px)";
    }
    window.addEventListener("mousemove", onMove);

    // re-init particles on resize
    let resizeTimer:any;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => initParticles(), 200);
    });

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", fit);
    };
  }, []);

  return (
    <>
      <div className="bg-canvas-wrap" aria-hidden>
        <canvas id="particles-canvas" className="bg-layer" />
        <canvas id="waves-canvas" className="bg-layer" />
      </div>
      {children}
    </>
  );
}
