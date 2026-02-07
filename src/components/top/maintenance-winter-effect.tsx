"use client";

import {
  type CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  type ContributorData,
  getContributorNames,
} from "@/lib/services/contributors";

const LOGO_SRC =
  "/img/mission-icons/actionboard_icon_work_20250713_ol_TeamMirai-logo.svg";

// --- Phase timing constants (ms) ---
const PHASE_2_START = 2000;
const PHASE_3_START = 5000;
const PHASE_4_START = 8000;
const CREDITS_START = 9000;
const SUNRISE_DURATION = 2000;
const SNOW_FADEOUT_DURATION = 2000;
const DRAGON_DURATION = 3000;
const DRAGON_DISSOLVE_DURATION = 1500;
const LOGO_GATHER_DURATION = 2200;

const SCROLL_SPEED = 80;

// --- Types ---

type SnowParticle = {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  drift: number;
  opacity: number;
  blur?: number;
};

type StarParticle = {
  x: number;
  y: number;
  size: number;
  twinkleSpeed: number;
  phase: number;
};

type PlumPetal = {
  x: number;
  y: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  velocityX: number;
  velocityY: number;
  opacity: number;
  phase: number;
  colorVariant: 0 | 1 | 2;
};

type DragonParticle = {
  x: number;
  y: number;
  size: number;
  alpha: number;
  life: number;
  velocityX: number;
  velocityY: number;
  color: { r: number; g: number; b: number };
};

type DronePoint = {
  x: number;
  y: number;
  size: number;
  twinkleSpeed: number;
  phase: number;
  blinkPhase: number;
  startOffsetX: number;
  startOffsetY: number;
  color: { r: number; g: number; b: number };
};

// --- Utility ---

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

// --- Particle factories ---

function createSnowflakes(count: number): SnowParticle[] {
  return Array.from({ length: count }, (_, index) => ({
    id: index,
    left: Math.random() * 100,
    size: Math.random() * 5 + 2,
    duration: Math.random() * 10 + 10,
    delay: Math.random() * 8,
    drift: Math.random() * 80 - 40,
    opacity: Math.random() * 0.28 + 0.16,
    blur: Math.random() * 1.4,
  }));
}

function createStarParticles(
  count: number,
  width: number,
  height: number,
): StarParticle[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    size: Math.random() * 1.5 + 0.3,
    twinkleSpeed: Math.random() * 0.0012 + 0.0005,
    phase: Math.random() * Math.PI * 2,
  }));
}

function createPlumPetals(
  count: number,
  width: number,
  height: number,
): PlumPetal[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height * 1.2 - height * 0.1,
    size: Math.random() * 8 + 4,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed:
      (Math.random() * 0.0008 + 0.0003) * (Math.random() < 0.5 ? 1 : -1),
    velocityX: (Math.random() - 0.5) * 0.012,
    velocityY: Math.random() * 0.015 + 0.008,
    opacity: Math.random() * 0.4 + 0.25,
    phase: Math.random() * Math.PI * 2,
    colorVariant: Math.floor(Math.random() * 3) as 0 | 1 | 2,
  }));
}

// --- Logo point functions ---

function normalizeLogoColor(r: number, g: number, b: number) {
  const brightness = (r + g + b) / 3;
  const strongest = Math.max(r, g, b);
  const weakest = Math.min(r, g, b);
  const saturation = strongest - weakest;

  if (brightness < 95) {
    return { r: 245, g: 215, b: 160 };
  }
  if (g - Math.max(r, b) > 8) {
    return { r: 255, g: 183, b: 77 };
  }
  if (brightness < 190 || saturation > 26) {
    return { r: 255, g: 200, b: 140 };
  }
  return { r: 250, g: 220, b: 180 };
}

function shouldUseLogoPixel(r: number, g: number, b: number, alpha: number) {
  if (alpha < 80) {
    return false;
  }

  const strongest = Math.max(r, g, b);
  const weakest = Math.min(r, g, b);
  const saturation = strongest - weakest;
  const brightness = (r + g + b) / 3;

  // SVG内の白背景は除外し、文字・枠線のみ点群化する。
  if (brightness > 238 && saturation < 18) {
    return false;
  }

  return true;
}

function createLogoPoints(
  image: HTMLImageElement,
  width: number,
  height: number,
): DronePoint[] {
  const sampleCanvas = document.createElement("canvas");
  const sampleContext = sampleCanvas.getContext("2d");

  if (!sampleContext || image.naturalWidth === 0 || image.naturalHeight === 0) {
    return [];
  }

  const maxStageWidth = Math.min(width * 0.56, 460);
  const maxStageHeight = Math.min(height * 0.5, 340);
  const imageRatio = image.naturalWidth / image.naturalHeight;

  let drawWidth = maxStageWidth;
  let drawHeight = drawWidth / imageRatio;

  if (drawHeight > maxStageHeight) {
    drawHeight = maxStageHeight;
    drawWidth = drawHeight * imageRatio;
  }

  sampleCanvas.width = Math.max(1, Math.floor(drawWidth));
  sampleCanvas.height = Math.max(1, Math.floor(drawHeight));

  sampleContext.clearRect(0, 0, sampleCanvas.width, sampleCanvas.height);
  sampleContext.drawImage(image, 0, 0, sampleCanvas.width, sampleCanvas.height);

  const imageData = sampleContext.getImageData(
    0,
    0,
    sampleCanvas.width,
    sampleCanvas.height,
  );
  const points: DronePoint[] = [];

  for (let y = 0; y < sampleCanvas.height; y++) {
    for (let x = 0; x < sampleCanvas.width; x++) {
      const index = (y * sampleCanvas.width + x) * 4;
      const alpha = imageData.data[index + 3];
      const rawR = imageData.data[index];
      const rawG = imageData.data[index + 1];
      const rawB = imageData.data[index + 2];

      if (!shouldUseLogoPixel(rawR, rawG, rawB, alpha)) {
        continue;
      }

      const color = normalizeLogoColor(rawR, rawG, rawB);

      points.push({
        x: x - sampleCanvas.width / 2,
        y: y - sampleCanvas.height / 2,
        size: Math.random() * 0.42 + 0.38,
        twinkleSpeed: Math.random() * 0.0012 + 0.001,
        phase: Math.random() * Math.PI * 2,
        blinkPhase: Math.random() * Math.PI * 2,
        startOffsetX: (Math.random() - 0.5) * 44,
        startOffsetY: (Math.random() - 0.5) * 32,
        color,
      });
    }
  }

  const maxLogoPoints = Math.min(
    2600,
    Math.max(1200, Math.floor((width * height) / 900)),
  );
  if (points.length <= maxLogoPoints) {
    return points;
  }

  const sampled: DronePoint[] = [];
  const stride = Math.ceil(points.length / maxLogoPoints);
  for (let i = 0; i < points.length; i += stride) {
    sampled.push(points[i]);
  }

  return sampled;
}

// --- Canvas drawing helpers ---

const PETAL_COLORS = ["#F5A0B8", "#E87DA0", "#FCDCE8"];

function drawPlumBlossom(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  rotation: number,
  colorIndex: number,
  alpha: number,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.globalAlpha = alpha;

  const petalCount = 5;
  const petalDistance = size * 0.2;
  const petalLength = size * 0.45;
  const petalWidth = size * 0.28;

  ctx.fillStyle = PETAL_COLORS[colorIndex];
  for (let i = 0; i < petalCount; i++) {
    const angle = (i * Math.PI * 2) / petalCount - Math.PI / 2;
    const px = Math.cos(angle) * petalDistance;
    const py = Math.sin(angle) * petalDistance;
    ctx.beginPath();
    ctx.ellipse(px, py, petalLength, petalWidth, angle, 0, Math.PI * 2);
    ctx.fill();
  }

  // 雌しべ
  ctx.fillStyle = "#FFF3B0";
  for (let i = 0; i < 3; i++) {
    const angle = (i * Math.PI * 2) / 3;
    ctx.beginPath();
    ctx.arc(
      Math.cos(angle) * size * 0.06,
      Math.sin(angle) * size * 0.06,
      size * 0.04,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  ctx.restore();
}

function drawSunriseGradient(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  progress: number,
) {
  const visibleTop = height * (1 - progress * 0.85);
  const gradientHeight = height - visibleTop;
  if (gradientHeight <= 0) return;

  const gradient = ctx.createLinearGradient(0, visibleTop, 0, height);
  gradient.addColorStop(0.0, "rgba(26, 16, 64, 0.0)");
  gradient.addColorStop(0.08, "rgba(26, 16, 64, 0.6)");
  gradient.addColorStop(0.25, "rgba(74, 32, 96, 0.8)");
  gradient.addColorStop(0.5, "rgba(192, 64, 96, 0.85)");
  gradient.addColorStop(0.75, "rgba(255, 140, 66, 0.9)");
  gradient.addColorStop(0.9, "rgba(255, 179, 71, 0.95)");
  gradient.addColorStop(1.0, "rgba(255, 228, 160, 1.0)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, visibleTop, width, gradientHeight);

  // 太陽グロー
  const sunGlowAlpha = Math.min(0.4, progress * 0.5);
  const sunGlow = ctx.createRadialGradient(
    width / 2,
    height,
    0,
    width / 2,
    height,
    height * 0.5,
  );
  sunGlow.addColorStop(0, `rgba(255, 240, 200, ${sunGlowAlpha})`);
  sunGlow.addColorStop(1, "rgba(255, 240, 200, 0)");
  ctx.fillStyle = sunGlow;
  ctx.fillRect(0, 0, width, height);
}

function getDragonHeadPosition(
  progress: number,
  width: number,
  height: number,
): { x: number; y: number } {
  const startY = height * 1.1;
  const endY = height * 0.05;
  const easedProgress = easeInOutCubic(progress);
  const y = startY + (endY - startY) * easedProgress;

  const amplitudeEnvelope = Math.sin(progress * Math.PI);
  const amplitude = width * 0.14 * amplitudeEnvelope;
  const frequency = 3;
  const x =
    width / 2 + amplitude * Math.sin(progress * Math.PI * 2 * frequency);

  return { x, y };
}

// --- BGM再生 (HTML5 Audio) ---

const BGM_SRC = "/audio/maintenance_winter.mp3";
const BGM_MAX_VOLUME = 0.25;

class JapaneseBGM {
  private audio: HTMLAudioElement;

  constructor() {
    this.audio = new Audio(BGM_SRC);
    this.audio.loop = true;
    this.audio.volume = 0;
    this.audio.preload = "auto";
  }

  start() {
    this.audio.volume = 0;
    this.audio.play().catch(() => {});
    this.fadeToVolume(BGM_MAX_VOLUME, 2000);
  }

  private fadeToVolume(target: number, durationMs: number) {
    const startVol = this.audio.volume;
    const startTime = performance.now();

    const step = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      this.audio.volume = startVol + (target - startVol) * progress;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  setMuted(muted: boolean) {
    this.fadeToVolume(muted ? 0 : BGM_MAX_VOLUME, 300);
  }

  dispose() {
    this.audio.pause();
    this.audio.src = "";
  }
}

// --- Main Canvas component ---

function MainCanvas({
  startTimeRef,
}: {
  startTimeRef: React.RefObject<number>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    let rafId = 0;
    let mounted = true;
    let width = 0;
    let height = 0;
    let stars: StarParticle[] = [];
    let petals: PlumPetal[] = [];
    let logoPoints: DronePoint[] = [];
    let loadedImage: HTMLImageElement | null = null;
    let logoStartAt = 0;
    let dragonTrail: DragonParticle[] = [];
    let prevTime = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      context.setTransform(1, 0, 0, 1, 0, 0);
      context.scale(dpr, dpr);

      const starCount = Math.max(60, Math.floor((width * height) / 18000));
      stars = createStarParticles(starCount, width, height);
      petals = createPlumPetals(35, width, height);

      if (loadedImage) {
        logoPoints = createLogoPoints(loadedImage, width, height);
      }

      if (prefersReducedMotion) {
        drawStatic();
      }
    };

    const drawStatic = () => {
      context.clearRect(0, 0, width, height);
      drawSunriseGradient(context, width, height, 1);

      for (const star of stars) {
        context.fillStyle = "rgba(220, 230, 255, 0.15)";
        context.beginPath();
        context.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        context.fill();
      }

      for (const petal of petals) {
        drawPlumBlossom(
          context,
          petal.x,
          petal.y,
          petal.size,
          petal.rotation,
          petal.colorVariant,
          petal.opacity * 0.6,
        );
      }

      const centerX = width / 2;
      const centerY = height / 2 - 8;
      for (const point of logoPoints) {
        context.fillStyle = `rgba(${point.color.r}, ${point.color.g}, ${point.color.b}, 0.7)`;
        context.beginPath();
        context.arc(
          centerX + point.x,
          centerY + point.y,
          point.size,
          0,
          Math.PI * 2,
        );
        context.fill();
      }
    };

    const draw = (time: number) => {
      const startTime = startTimeRef.current ?? time;
      const elapsed = time - startTime;
      const deltaMs = prevTime > 0 ? time - prevTime : 16;
      prevTime = time;

      context.clearRect(0, 0, width, height);

      // --- Sunrise gradient ---
      const sunriseRaw = clamp(
        (elapsed - PHASE_2_START) / SUNRISE_DURATION,
        0,
        1,
      );
      const sunriseProgress = easeInOutCubic(sunriseRaw);
      if (sunriseProgress > 0) {
        drawSunriseGradient(context, width, height, sunriseProgress);
      }

      // --- Stars ---
      const starDimFactor =
        1 - clamp((elapsed - PHASE_2_START) / 3000, 0, 0.85);
      for (const star of stars) {
        const pulse =
          0.32 + 0.68 * Math.sin(time * star.twinkleSpeed + star.phase) * 0.5;
        const alpha = (0.2 + Math.max(0, pulse) * 0.7) * starDimFactor;
        const radius = star.size + Math.max(0, pulse) * 0.65;

        if (alpha < 0.01) continue;

        const gradient = context.createRadialGradient(
          star.x,
          star.y,
          0,
          star.x,
          star.y,
          radius * 2.2,
        );
        gradient.addColorStop(0, `rgba(220, 230, 255, ${alpha})`);
        gradient.addColorStop(1, "rgba(220, 230, 255, 0)");
        context.fillStyle = gradient;
        context.beginPath();
        context.arc(star.x, star.y, radius * 2.2, 0, Math.PI * 2);
        context.fill();
      }

      // --- Plum blossom petals ---
      const petalAlpha = clamp((elapsed - (PHASE_2_START + 1000)) / 2000, 0, 1);
      if (petalAlpha > 0) {
        for (const petal of petals) {
          petal.x +=
            petal.velocityX * deltaMs +
            Math.sin(time * 0.001 + petal.phase) * 0.25;
          petal.y += petal.velocityY * deltaMs;
          petal.rotation += petal.rotationSpeed * deltaMs;

          if (petal.y > height + petal.size * 2) {
            petal.y = -petal.size * 2;
            petal.x = Math.random() * width;
          }
          if (petal.x < -petal.size * 2) petal.x = width + petal.size;
          if (petal.x > width + petal.size * 2) petal.x = -petal.size;

          drawPlumBlossom(
            context,
            petal.x,
            petal.y,
            petal.size,
            petal.rotation,
            petal.colorVariant,
            petal.opacity * petalAlpha,
          );
        }
      }

      // --- Dragon ---
      const dragonProgressRaw = clamp(
        (elapsed - PHASE_3_START) / DRAGON_DURATION,
        0,
        1,
      );
      const dragonFade =
        elapsed > PHASE_4_START
          ? 1 -
            clamp((elapsed - PHASE_4_START) / DRAGON_DISSOLVE_DURATION, 0, 1)
          : 1;

      if (dragonProgressRaw > 0 && dragonFade > 0) {
        const head = getDragonHeadPosition(dragonProgressRaw, width, height);

        // パーティクル放出
        if (dragonFade > 0.3) {
          const emitCount = 3 + Math.floor(Math.random() * 3);
          for (let i = 0; i < emitCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 0.02 + 0.005;
            const colorRoll = Math.random();
            let color: { r: number; g: number; b: number };
            if (colorRoll < 0.6) {
              color = { r: 255, g: 215, b: 0 };
            } else if (colorRoll < 0.85) {
              color = { r: 255, g: 140, b: 0 };
            } else {
              color = { r: 220, g: 20, b: 60 };
            }

            dragonTrail.push({
              x: head.x + (Math.random() - 0.5) * 6,
              y: head.y + (Math.random() - 0.5) * 6,
              size: Math.random() * 2.5 + 1.5,
              alpha: 1.0,
              life: 0,
              velocityX: Math.cos(angle) * speed,
              velocityY: Math.sin(angle) * speed - 0.01,
              color,
            });
          }
        }

        // パーティクル更新
        const decayRate = 0.0012;
        dragonTrail = dragonTrail.filter((p) => {
          p.life += deltaMs * decayRate;
          p.alpha = Math.max(0, 1 - p.life);
          p.x += p.velocityX * deltaMs;
          p.y += p.velocityY * deltaMs;
          p.size *= 0.998;
          return p.life < 1;
        });

        // パーティクル描画
        for (const p of dragonTrail) {
          const a = p.alpha * dragonFade;
          if (a < 0.01) continue;

          const glowRadius = p.size * 3;
          const glow = context.createRadialGradient(
            p.x,
            p.y,
            0,
            p.x,
            p.y,
            glowRadius,
          );
          glow.addColorStop(
            0,
            `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${a * 0.3})`,
          );
          glow.addColorStop(
            1,
            `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, 0)`,
          );
          context.fillStyle = glow;
          context.beginPath();
          context.arc(p.x, p.y, glowRadius, 0, Math.PI * 2);
          context.fill();

          context.fillStyle = `rgba(${Math.min(255, p.color.r + 30)}, ${Math.min(255, p.color.g + 30)}, ${Math.min(255, p.color.b + 20)}, ${Math.min(1, a * 0.9)})`;
          context.beginPath();
          context.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          context.fill();
        }

        // 龍頭フレームグロー
        if (dragonFade > 0.1) {
          const headGlowRadius = 25;
          const headGlow = context.createRadialGradient(
            head.x,
            head.y,
            0,
            head.x,
            head.y,
            headGlowRadius,
          );
          headGlow.addColorStop(0, `rgba(255, 240, 180, ${0.5 * dragonFade})`);
          headGlow.addColorStop(
            0.4,
            `rgba(255, 200, 80, ${0.25 * dragonFade})`,
          );
          headGlow.addColorStop(1, "rgba(255, 160, 40, 0)");
          context.fillStyle = headGlow;
          context.beginPath();
          context.arc(head.x, head.y, headGlowRadius, 0, Math.PI * 2);
          context.fill();
        }
      }

      // --- Logo drone points ---
      if (elapsed > PHASE_4_START && logoPoints.length > 0) {
        if (logoStartAt === 0) {
          logoStartAt = time;
        }
        const centerX = width / 2;
        const centerY = height / 2 - 8;
        const gatherRaw = clamp(
          (time - logoStartAt) / LOGO_GATHER_DURATION,
          0,
          1,
        );
        const gatherProgress =
          gatherRaw < 0.5
            ? 2 * gatherRaw * gatherRaw
            : 1 - (-2 * gatherRaw + 2) ** 2 / 2;

        for (const point of logoPoints) {
          const pulse =
            0.5 + 0.5 * Math.sin(time * point.twinkleSpeed + point.phase);
          const sparkleBase = Math.max(
            0,
            Math.sin(time * 0.006 + point.blinkPhase),
          );
          const flash = sparkleBase ** 12;

          const x =
            centerX + point.x + point.startOffsetX * (1 - gatherProgress);
          const y =
            centerY + point.y + point.startOffsetY * (1 - gatherProgress);
          const coreRadius = point.size * (0.9 + pulse * 0.35 + flash * 0.55);
          const glowRadius = coreRadius * (2 + flash * 0.8);
          const coreAlpha =
            (0.32 + pulse * 0.43 + flash * 0.35) * (0.2 + gatherProgress * 0.8);

          const glow = context.createRadialGradient(x, y, 0, x, y, glowRadius);
          glow.addColorStop(
            0,
            `rgba(${point.color.r}, ${point.color.g}, ${point.color.b}, ${coreAlpha * 0.23})`,
          );
          glow.addColorStop(
            1,
            `rgba(${point.color.r}, ${point.color.g}, ${point.color.b}, 0)`,
          );

          context.fillStyle = glow;
          context.beginPath();
          context.arc(x, y, glowRadius, 0, Math.PI * 2);
          context.fill();

          context.fillStyle = `rgba(${Math.min(255, point.color.r + 20)}, ${Math.min(255, point.color.g + 20)}, ${Math.min(255, point.color.b + 20)}, ${Math.min(1, coreAlpha)})`;
          context.beginPath();
          context.arc(x, y, coreRadius, 0, Math.PI * 2);
          context.fill();
        }
      }
    };

    const animate = (time: number) => {
      if (!mounted) return;
      draw(time);
      rafId = window.requestAnimationFrame(animate);
    };

    const image = new Image();
    image.decoding = "async";
    image.onload = () => {
      if (!mounted) return;
      loadedImage = image;
      logoPoints = createLogoPoints(image, width, height);

      if (prefersReducedMotion) {
        drawStatic();
      }
    };
    image.src = LOGO_SRC;

    resize();
    window.addEventListener("resize", resize);

    if (!prefersReducedMotion) {
      rafId = window.requestAnimationFrame(animate);
    }

    return () => {
      mounted = false;
      window.removeEventListener("resize", resize);
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [startTimeRef]);

  return <canvas ref={canvasRef} className="spring-canvas" />;
}

// --- Logo for EndCredits ---

function SpringLogo({
  sizePx,
  enableGlow = false,
}: {
  sizePx: number;
  enableGlow?: boolean;
}) {
  return (
    // biome-ignore lint/performance/noImgElement: 軽量表示のためimgタグを使用
    <img
      src={LOGO_SRC}
      alt="チームみらいロゴ"
      style={{
        width: `${sizePx}px`,
        height: "auto",
        filter: enableGlow
          ? "drop-shadow(0 0 10px rgba(255, 200, 100, 0.8)) drop-shadow(0 0 24px rgba(255, 170, 50, 0.5))"
          : "none",
      }}
    />
  );
}

// --- End Credits ---

const EndCredits = ({
  contributors,
  scrollSpeedPxPerSec,
  onEnd,
}: {
  contributors: ContributorData[];
  scrollSpeedPxPerSec: number;
  onEnd: () => void;
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [totalHeight, setTotalHeight] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const measure = () => {
      setTotalHeight(wrapper.scrollHeight);
      setReady(true);
    };

    measure();

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(measure)
        : null;
    resizeObserver?.observe(wrapper);
    window.addEventListener("resize", measure);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const durationMs = ready ? (totalHeight / scrollSpeedPxPerSec) * 1000 : 0;

  const rows = contributors.reduce<ContributorData[][]>(
    (acc, contributor, i) => {
      if (i % 3 === 0) acc.push([]);
      acc[acc.length - 1].push(contributor);
      return acc;
    },
    [],
  );

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        color: "#fff",
        zIndex: 20,
      }}
    >
      <div
        ref={wrapperRef}
        style={{
          width: "100%",
          paddingTop: "20vh",
          paddingBottom: "20vh",
          paddingLeft: "24px",
          paddingRight: "24px",
          animation: ready
            ? `scrollUp ${durationMs}ms linear forwards`
            : "none",
          transform: "translateY(100vh)",
        }}
        onAnimationEnd={onEnd}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: "3rem",
            gap: "3rem",
          }}
        >
          <SpringLogo sizePx={136} />
          <div
            style={{
              fontSize: "1.8rem",
              fontWeight: "bold",
              textShadow: "2px 2px 4px rgba(40, 20, 10, 0.8)",
              fontFamily: "'Noto Sans JP', sans-serif",
            }}
          >
            アクションボードチーム
          </div>
        </div>

        <div style={{ fontSize: "16px", lineHeight: "1.6" }}>
          {rows.map((row, idx) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: 固定表示のためインデックスを使用
              key={idx}
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "1rem",
                marginBottom: "2rem",
                textShadow: "1px 1px 2px rgba(40, 20, 10, 0.8)",
                fontFamily: "'Noto Sans JP', sans-serif",
              }}
            >
              {row.map((contributor, contributorIndex) => (
                <span key={`${contributor.name}-${idx}-${contributorIndex}`}>
                  {contributor.name}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes scrollUp {
          0% {
            transform: translateY(100vh);
          }
          100% {
            transform: translateY(-${totalHeight}px);
          }
        }
      `}</style>
    </div>
  );
};

// --- Main exported component ---

export default function MaintenanceWinterEffect() {
  const snowflakes = useMemo(() => createSnowflakes(80), []);
  const [contributors, setContributors] = useState<ContributorData[]>([]);
  const [snowFading, setSnowFading] = useState(false);
  const [showSnow, setShowSnow] = useState(true);
  const [showCredits, setShowCredits] = useState(false);
  const startTimeRef = useRef<number>(performance.now());

  // Audio state
  const [audioStarted, setAudioStarted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const bgmRef = useRef<JapaneseBGM | null>(null);

  useEffect(() => {
    startTimeRef.current = performance.now();

    const timers: ReturnType<typeof setTimeout>[] = [];

    timers.push(
      setTimeout(() => {
        setSnowFading(true);
      }, PHASE_2_START),
    );

    timers.push(
      setTimeout(
        () => {
          setShowSnow(false);
        },
        PHASE_2_START + SNOW_FADEOUT_DURATION + 500,
      ),
    );

    timers.push(
      setTimeout(() => {
        setShowCredits(true);
      }, CREDITS_START),
    );

    return () => {
      for (const t of timers) clearTimeout(t);
    };
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const data = await getContributorNames();
        setContributors(data);
      } catch (error) {
        console.error("Failed to fetch contributors:", error);
        setContributors([]);
      }
    })();
  }, []);

  // BGM preload on mount & cleanup
  useEffect(() => {
    const bgm = new JapaneseBGM();
    bgmRef.current = bgm;
    return () => {
      bgm.dispose();
    };
  }, []);

  // Audio handlers (fireworks.tsx pattern: full-screen tap)
  const handleClick = useCallback(() => {
    if (!audioStarted) {
      bgmRef.current?.start();
      setAudioStarted(true);
    } else {
      const newMuted = !isMuted;
      bgmRef.current?.setMuted(newMuted);
      setIsMuted(newMuted);
    }
  }, [audioStarted, isMuted]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleClick();
      }
    },
    [handleClick],
  );

  return (
    // biome-ignore lint/a11y/useButtonType: fireworks.tsx同様のインタラクティブエリア
    <button
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={
        !audioStarted ? "BGMを再生" : isMuted ? "ミュート解除" : "ミュート"
      }
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 10,
        cursor: "pointer",
        border: "none",
        background: "transparent",
        padding: 0,
      }}
    >
      <div className="spring-canvas-stage">
        <MainCanvas startTimeRef={startTimeRef} />
      </div>

      {showSnow &&
        snowflakes.map((flake) => (
          <span
            key={`snow-${flake.id}`}
            className={`snowflake ${snowFading ? "snow-fading" : ""}`}
            style={
              {
                left: `${flake.left}%`,
                width: `${flake.size}px`,
                height: `${flake.size}px`,
                filter: `blur(${flake.blur}px)`,
                animationDuration: `${flake.duration}s`,
                animationDelay: `${flake.delay}s`,
                "--drift": `${flake.drift}px`,
                "--flake-opacity": `${flake.opacity}`,
              } as CSSProperties
            }
          />
        ))}

      {showCredits && (
        <EndCredits
          contributors={contributors}
          scrollSpeedPxPerSec={SCROLL_SPEED}
          onEnd={() => {
            setShowCredits(false);
          }}
        />
      )}

      <div className="audio-indicator">
        {!audioStarted ? (
          <span className="tap-prompt">♪ タップして音楽を再生</span>
        ) : (
          <span className="mute-status">{isMuted ? "🔇" : "🔊"}</span>
        )}
      </div>

      <style jsx>{`
        .spring-canvas-stage {
          position: absolute;
          inset: 0;
          z-index: 13;
        }

        .spring-canvas {
          display: block;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .snowflake {
          position: absolute;
          top: -8%;
          border-radius: 9999px;
          background: #ffffff;
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.7);
          animation-name: snowFall;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          z-index: 14;
          transition: opacity 2s ease-out;
        }

        .snowflake.snow-fading {
          opacity: 0 !important;
        }

        @keyframes snowFall {
          0% {
            transform: translate3d(0, -10vh, 0);
            opacity: 0;
          }
          16% {
            opacity: calc(var(--flake-opacity) * 0.6);
          }
          62% {
            opacity: var(--flake-opacity);
          }
          100% {
            transform: translate3d(var(--drift), 115vh, 0);
            opacity: calc(var(--flake-opacity) * 0.38);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .snowflake {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
          }
        }

        .audio-indicator {
          position: absolute;
          bottom: 2rem;
          left: 0;
          right: 0;
          display: flex;
          justify-content: center;
          z-index: 30;
        }

        .tap-prompt {
          background: rgba(0, 0, 0, 0.35);
          border: 1px solid rgba(255, 255, 255, 0.25);
          color: rgba(255, 255, 255, 0.85);
          padding: 10px 24px;
          border-radius: 24px;
          font-size: 14px;
          font-family: "Noto Sans JP", sans-serif;
          animation: fadeInPulse 3s ease-in-out infinite;
          backdrop-filter: blur(4px);
        }

        .mute-status {
          background: rgba(0, 0, 0, 0.3);
          color: rgba(255, 255, 255, 0.7);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          font-size: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        @keyframes fadeInPulse {
          0%,
          100% {
            opacity: 0.6;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
    </button>
  );
}
