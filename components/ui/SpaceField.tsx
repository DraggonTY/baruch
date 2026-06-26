"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

type Star = {
  angle: number;
  distance: number;
  z: number;
  opacity: number;
  speed: number;
};

type ShootingStar = {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  opacity: number;
  life: number;
};

export function SpaceField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let centerX = 0;
    let centerY = 0;
    let maxDistance = 0;
    let isVisible = true;
    let isPageVisible = document.visibilityState === "visible";

    const stars: Star[] = [];
    const shootingStars: ShootingStar[] = [];
    let nextShootingStar = 0;

    const starCount = prefersReducedMotion ? 120 : 320;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = parent.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      centerX = width / 2;
      centerY = height / 2;
      maxDistance = Math.hypot(width, height) * 0.65;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const spawnStar = (distance?: number): Star => ({
      angle: Math.random() * Math.PI * 2,
      distance: distance ?? Math.random() * maxDistance * 0.15,
      z: 0.15 + Math.random() * 0.85,
      opacity: 0.25 + Math.random() * 0.75,
      speed: 0.6 + Math.random() * 1.4,
    });

    const initStars = () => {
      stars.length = 0;
      for (let i = 0; i < starCount; i++) {
        stars.push(spawnStar(Math.random() * maxDistance));
      }
    };

    const resetStar = (star: Star) => {
      star.angle = Math.random() * Math.PI * 2;
      star.distance = Math.random() * maxDistance * 0.08;
      star.z = 0.15 + Math.random() * 0.85;
      star.opacity = 0.25 + Math.random() * 0.75;
      star.speed = 0.6 + Math.random() * 1.4;
    };

    const spawnShootingStar = () => {
      const fromTop = Math.random() > 0.5;
      shootingStars.push({
        x: Math.random() * width,
        y: fromTop ? -20 : height + 20,
        length: 60 + Math.random() * 100,
        speed: 6 + Math.random() * 10,
        angle: fromTop ? Math.PI / 4 + Math.random() * 0.4 : -Math.PI * 0.75 + Math.random() * 0.4,
        opacity: 0.7 + Math.random() * 0.3,
        life: 1,
      });
    };

    const onResize = () => {
      resize();
      initStars();
    };

    resize();
    initStars();
    window.addEventListener("resize", onResize);

    const shouldAnimate = () => isVisible && isPageVisible && width > 0 && height > 0;
    const queueFrame = () => {
      if (frameRef.current || !shouldAnimate()) return;
      frameRef.current = requestAnimationFrame(render);
    };
    const stopFrame = () => {
      if (!frameRef.current) return;
      cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
    };

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry?.isIntersecting ?? true;
        if (shouldAnimate()) {
          queueFrame();
        } else {
          stopFrame();
        }
      },
      { rootMargin: "240px 0px" },
    );
    visibilityObserver.observe(canvas);

    const onVisibilityChange = () => {
      isPageVisible = document.visibilityState === "visible";
      if (shouldAnimate()) {
        queueFrame();
      } else {
        stopFrame();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    const render = (now: number) => {
      frameRef.current = 0;
      if (!shouldAnimate()) return;

      ctx.clearRect(0, 0, width, height);

      for (const star of stars) {
        if (!prefersReducedMotion) {
          star.distance += star.speed * (0.35 + star.z * 1.1);
          if (star.distance > maxDistance) {
            resetStar(star);
          }
        }

        const progress = star.distance / maxDistance;
        const x = centerX + Math.cos(star.angle) * star.distance;
        const y = centerY + Math.sin(star.angle) * star.distance;
        const size = 0.4 + progress * star.z * 2.8;
        const alpha = star.opacity * (0.35 + progress * 0.65);

        if (!prefersReducedMotion && progress > 0.05) {
          const trailLen = 4 + progress * star.z * 18;
          const tailX = centerX + Math.cos(star.angle) * (star.distance - trailLen);
          const tailY = centerY + Math.sin(star.angle) * (star.distance - trailLen);

          const streak = ctx.createLinearGradient(tailX, tailY, x, y);
          streak.addColorStop(0, `rgba(220, 230, 255, 0)`);
          streak.addColorStop(1, `rgba(230, 240, 255, ${alpha * 0.85})`);

          ctx.beginPath();
          ctx.moveTo(tailX, tailY);
          ctx.lineTo(x, y);
          ctx.strokeStyle = streak;
          ctx.lineWidth = Math.max(0.5, size * 0.6);
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(240, 245, 255, ${alpha})`;
        ctx.fill();
      }

      if (!prefersReducedMotion && now > nextShootingStar) {
        spawnShootingStar();
        nextShootingStar = now + 4500 + Math.random() * 5500;
      }

      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const ss = shootingStars[i];
        ss.x += Math.cos(ss.angle) * ss.speed;
        ss.y += Math.sin(ss.angle) * ss.speed;
        ss.life -= 0.018;

        if (ss.life <= 0) {
          shootingStars.splice(i, 1);
          continue;
        }

        const tailX = ss.x - Math.cos(ss.angle) * ss.length;
        const tailY = ss.y - Math.sin(ss.angle) * ss.length;

        const gradient = ctx.createLinearGradient(tailX, tailY, ss.x, ss.y);
        gradient.addColorStop(0, "rgba(255,255,255,0)");
        gradient.addColorStop(0.6, `rgba(200,220,255,${ss.opacity * ss.life * 0.5})`);
        gradient.addColorStop(1, `rgba(255,255,255,${ss.opacity * ss.life})`);

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(ss.x, ss.y);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      if (prefersReducedMotion) return;
      queueFrame();
    };

    queueFrame();

    return () => {
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      visibilityObserver.disconnect();
      stopFrame();
    };
  }, [prefersReducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
}
