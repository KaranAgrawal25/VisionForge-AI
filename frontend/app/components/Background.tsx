"use client";

import { useEffect } from "react";

export default function Background() {
  useEffect(() => {
    const pC = document.getElementById("particles-canvas") as HTMLCanvasElement;
    const wC = document.getElementById("waves-canvas") as HTMLCanvasElement;

    if (!pC || !wC) return;

    function resize() {
      pC.width = window.innerWidth * 2;
      pC.height = window.innerHeight * 2;
      wC.width = window.innerWidth * 2;
      wC.height = window.innerHeight * 2;
    }

    resize();
    window.addEventListener("resize", resize);

    // PARALLAX MOVEMENT
    window.addEventListener("mousemove", (e) => {
      const cx = e.clientX / window.innerWidth - 0.5;
      const cy = e.clientY / window.innerHeight - 0.5;

      pC.style.transform = "translate(" + cx * 8 + "px, " + cy * 8 + "px)";
      wC.style.transform = "translate(" + cx * 6 + "px, " + cy * 6 + "px)";
    });

    return () => {
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="bg-canvas-wrap" aria-hidden>
      <canvas
        id="particles-canvas"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      />
      <canvas
        id="waves-canvas"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      />
    </div>
  );
}
