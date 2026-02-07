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

const WINTER_LOGO_SRC =
  "/img/mission-icons/actionboard_icon_work_20250713_ol_TeamMirai-logo.svg";
const WINTER_BGM_SRC = "/audio/maintenance_winter.mp3";
const INTRO_DURATION_MS = 3000;
const CREDITS_DELAY_AFTER_OVERLAY_MS = 3000;
const BGM_MAX_VOLUME = 0.5;
const FADE_STEP_MS = 50;
const FADE_DURATION_MS = 1500;

type Particle = {
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

function createSnowflakes(count: number): Particle[] {
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

function createPetals(count: number): Particle[] {
  return Array.from({ length: count }, (_, index) => ({
    id: index,
    left: Math.random() * 100,
    size: Math.random() * 10 + 8,
    duration: Math.random() * 12 + 14,
    delay: Math.random() * 10,
    drift: Math.random() * 160 - 80,
    opacity: Math.random() * 0.4 + 0.25,
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

function normalizeLogoColor(r: number, g: number, b: number) {
  const brightness = (r + g + b) / 3;
  const strongest = Math.max(r, g, b);
  const weakest = Math.min(r, g, b);
  const saturation = strongest - weakest;

  if (brightness < 95) {
    return { r: 219, g: 218, b: 187 };
  }
  if (g - Math.max(r, b) > 8) {
    return { r: 112, g: 229, b: 212 };
  }
  if (brightness < 190 || saturation > 26) {
    return { r: 187, g: 242, b: 230 };
  }
  return { r: 170, g: 235, b: 222 };
}

function shouldUseLogoPixel(r: number, g: number, b: number, alpha: number) {
  if (alpha < 80) {
    return false;
  }

  const strongest = Math.max(r, g, b);
  const weakest = Math.min(r, g, b);
  const saturation = strongest - weakest;
  const brightness = (r + g + b) / 3;

  // SVG内の白背景は除外し、文字・枠線・ミント線のみ点群化する。
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
  const step = 1;

  for (let y = 0; y < sampleCanvas.height; y += step) {
    for (let x = 0; x < sampleCanvas.width; x += step) {
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

function DroneLogoStage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    let rafId = 0;
    let mounted = true;
    let width = 0;
    let height = 0;
    let stars: StarParticle[] = [];
    let logoPoints: DronePoint[] = [];
    let loadedImage: HTMLImageElement | null = null;
    let logoStartAt = 0;
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

      if (loadedImage) {
        logoPoints = createLogoPoints(loadedImage, width, height);
      }

      if (prefersReducedMotion) {
        draw(performance.now());
      }
    };

    const draw = (time: number) => {
      context.clearRect(0, 0, width, height);

      for (const star of stars) {
        const pulse =
          0.32 + 0.68 * Math.sin(time * star.twinkleSpeed + star.phase) * 0.5;
        const alpha = 0.2 + Math.max(0, pulse) * 0.7;
        const radius = star.size + Math.max(0, pulse) * 0.65;

        const gradient = context.createRadialGradient(
          star.x,
          star.y,
          0,
          star.x,
          star.y,
          radius * 2.2,
        );
        gradient.addColorStop(0, `rgba(197, 241, 232, ${alpha})`);
        gradient.addColorStop(1, "rgba(197, 241, 232, 0)");
        context.fillStyle = gradient;
        context.beginPath();
        context.arc(star.x, star.y, radius * 2.2, 0, Math.PI * 2);
        context.fill();
      }

      const centerX = width / 2;
      const centerY = height / 2 - 8;
      const gatherDurationMs = 2200;
      const gatherProgressRaw = prefersReducedMotion
        ? 1
        : Math.min(1, Math.max(0, (time - logoStartAt) / gatherDurationMs));
      const gatherProgress =
        gatherProgressRaw < 0.5
          ? 2 * gatherProgressRaw * gatherProgressRaw
          : 1 - (-2 * gatherProgressRaw + 2) ** 2 / 2;

      for (const point of logoPoints) {
        const pulse =
          0.5 + 0.5 * Math.sin(time * point.twinkleSpeed + point.phase);
        const sparkleBase = Math.max(
          0,
          Math.sin(time * 0.006 + point.blinkPhase),
        );
        const flash = sparkleBase ** 12;

        const x = centerX + point.x + point.startOffsetX * (1 - gatherProgress);
        const y = centerY + point.y + point.startOffsetY * (1 - gatherProgress);
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
    };

    const animate = (time: number) => {
      draw(time);
      rafId = window.requestAnimationFrame(animate);
    };

    const image = new Image();
    image.decoding = "async";
    image.onload = () => {
      if (!mounted) {
        return;
      }
      loadedImage = image;
      logoPoints = createLogoPoints(image, width, height);
      logoStartAt = performance.now();

      if (prefersReducedMotion) {
        draw(performance.now());
        return;
      }

      rafId = window.requestAnimationFrame(animate);
    };
    image.src = WINTER_LOGO_SRC;

    resize();
    window.addEventListener("resize", resize);

    return () => {
      mounted = false;
      window.removeEventListener("resize", resize);
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, []);

  return <canvas ref={canvasRef} className="drone-canvas" />;
}

function WinterLogo({
  sizePx,
  enableGlow = false,
}: {
  sizePx: number;
  enableGlow?: boolean;
}) {
  return (
    // biome-ignore lint/performance/noImgElement: 軽量表示のためimgタグを使用
    <img
      src={WINTER_LOGO_SRC}
      alt="チームみらいロゴ"
      style={{
        width: `${sizePx}px`,
        height: "auto",
        filter: enableGlow
          ? "drop-shadow(0 0 10px rgba(183, 241, 227, 0.8)) drop-shadow(0 0 24px rgba(148, 228, 209, 0.5))"
          : "none",
      }}
    />
  );
}

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
    if (!wrapper) {
      return;
    }

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
          <WinterLogo sizePx={136} />
          <div
            style={{
              fontSize: "1.8rem",
              fontWeight: "bold",
              textShadow: "2px 2px 4px rgba(0,0,0,.8)",
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
                textShadow: "1px 1px 2px rgba(0,0,0,.8)",
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

function BgmToggle() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const fadeRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearFade = useCallback(() => {
    if (fadeRef.current) {
      clearInterval(fadeRef.current);
      fadeRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearFade();
    };
  }, [clearFade]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    if (isPlaying) {
      clearFade();
      const steps = Math.ceil(FADE_DURATION_MS / FADE_STEP_MS);
      const decrement = audio.volume / steps;
      fadeRef.current = setInterval(() => {
        if (audio.volume - decrement <= 0) {
          audio.volume = 0;
          audio.pause();
          clearFade();
        } else {
          audio.volume = Math.max(0, audio.volume - decrement);
        }
      }, FADE_STEP_MS);
      setIsPlaying(false);
    } else {
      clearFade();
      audio.volume = 0;
      audio
        .play()
        .then(() => {
          const steps = Math.ceil(FADE_DURATION_MS / FADE_STEP_MS);
          const increment = BGM_MAX_VOLUME / steps;
          fadeRef.current = setInterval(() => {
            if (audio.volume + increment >= BGM_MAX_VOLUME) {
              audio.volume = BGM_MAX_VOLUME;
              clearFade();
            } else {
              audio.volume = Math.min(BGM_MAX_VOLUME, audio.volume + increment);
            }
          }, FADE_STEP_MS);
          setIsPlaying(true);
        })
        .catch(() => {
          setIsPlaying(false);
        });
    }
  };

  return (
    <>
      {/* biome-ignore lint/a11y/useMediaCaption: BGM音楽ファイルのためキャプション不要 */}
      <audio ref={audioRef} src={WINTER_BGM_SRC} loop preload="none" />
      <button
        type="button"
        onClick={togglePlay}
        aria-label={isPlaying ? "BGMを停止" : "BGMを再生"}
        className="bgm-toggle"
      >
        {isPlaying ? (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          </svg>
        ) : (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        )}
      </button>
    </>
  );
}

export default function MaintenanceWinterEffect() {
  const snowflakes = useMemo(() => createSnowflakes(120), []);
  const petals = useMemo(() => createPetals(16), []);
  const [contributors, setContributors] = useState<ContributorData[]>([]);
  const [showNightOverlay, setShowNightOverlay] = useState(false);
  const [showCredits, setShowCredits] = useState(false);

  const SCROLL_SPEED = 80;

  useEffect(() => {
    let creditsTimer: ReturnType<typeof setTimeout> | null = null;
    const introTimer = setTimeout(() => {
      setShowNightOverlay(true);
      creditsTimer = setTimeout(() => {
        setShowCredits(true);
      }, CREDITS_DELAY_AFTER_OVERLAY_MS);
    }, INTRO_DURATION_MS);

    return () => {
      clearTimeout(introTimer);
      if (creditsTimer) {
        clearTimeout(creditsTimer);
      }
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

  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden z-10"
      >
        <div className="absolute inset-0 winter-glow" />
        {showNightOverlay && <div className="absolute inset-0 night-overlay" />}
        {showNightOverlay && showCredits && (
          <div className="night-logo-stage">
            <DroneLogoStage />
          </div>
        )}

        {snowflakes.map((flake) => (
          <span
            key={`snow-${flake.id}`}
            className="snowflake"
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

        {!showNightOverlay &&
          petals.map((petal) => (
            <span
              key={`petal-${petal.id}`}
              className="petal"
              style={
                {
                  left: `${petal.left}%`,
                  width: `${petal.size}px`,
                  height: `${petal.size}px`,
                  opacity: petal.opacity,
                  animationDuration: `${petal.duration}s`,
                  animationDelay: `${petal.delay}s`,
                  "--drift": `${petal.drift}px`,
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

        <style jsx>{`
        .winter-glow {
          background:
            radial-gradient(circle at 18% 25%, rgba(255, 255, 255, 0.3), transparent 35%),
            radial-gradient(circle at 85% 20%, rgba(100, 216, 198, 0.28), transparent 30%),
            radial-gradient(circle at 50% 78%, rgba(188, 236, 211, 0.25), transparent 38%);
          z-index: 11;
        }

        .night-overlay {
          background:
            radial-gradient(circle at 50% 8%, rgba(40, 40, 40, 0.26), rgba(0, 0, 0, 0.92)),
            #000;
          opacity: 0;
          animation: nightFadeIn 1.2s ease forwards;
          z-index: 12;
        }

        .night-logo-stage {
          position: absolute;
          inset: 0;
          z-index: 13;
        }

        .drone-canvas {
          display: block;
          width: 100%;
          height: 100%;
          pointer-events: none;
          opacity: 0;
          animation: logoReveal 900ms ease forwards;
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
        }

        .petal {
          position: absolute;
          top: -12%;
          border-radius: 9999px 70% 9999px 80%;
          background: linear-gradient(135deg, #64d8c6 0%, #bcecd3 100%);
          box-shadow: 0 0 10px rgba(100, 216, 198, 0.45);
          transform: rotate(20deg);
          animation-name: petalDrift;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          z-index: 14;
        }

        @keyframes nightFadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }

        @keyframes logoReveal {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
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

        @keyframes petalDrift {
          0% {
            transform: translate3d(0, -15vh, 0) rotate(0deg);
          }
          100% {
            transform: translate3d(var(--drift), 115vh, 0) rotate(240deg);
          }
        }

        .bgm-toggle {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 50;
          pointer-events: auto;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 9999px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(8px);
          color: rgba(255, 255, 255, 0.8);
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
        }

        .bgm-toggle:hover {
          background: rgba(0, 0, 0, 0.6);
          color: #fff;
        }

        @media (prefers-reduced-motion: reduce) {
          .snowflake,
          .petal {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
          }
        }
      `}</style>
      </div>
      <BgmToggle />
    </>
  );
}
