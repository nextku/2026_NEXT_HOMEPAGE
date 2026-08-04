# reference 1
You are given a task to integrate an existing React component in the codebase

The codebase should support:
- shadcn project structure
- Tailwind CSS
- Typescript

If it doesn't, provide instructions on how to setup project via shadcn CLI, install Tailwind or Typescript.

Determine the default path for components and styles.
If default path for components is not /components/ui, provide instructions on why it's important to create this folder
Copy-paste this component to /components/ui folder:
```tsx
interactive-text-particle.tsx
import React, { useEffect, useRef, useState } from 'react';

interface Pointer {
  x?: number;
  y?: number;
}

interface Particle {
  ox: number;
  oy: number;
  cx: number;
  cy: number;
  or: number;
  cr: number;
  pv: number;
  ov: number;
  f: number;
  rgb: number[];
}

interface TextBox {
  str: string;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
}

export interface ParticleTextEffectProps {
  text?: string;
  colors?: string[];
  className?: string;
  animationForce?: number;
  particleDensity?: number;
}

const ParticleTextEffect: React.FC<ParticleTextEffectProps> = ({
  text = 'HOVER!',
  colors = [
    'ffad70', 'f7d297', 'edb9a1', 'e697ac', 'b38dca',
    '9c76db', '705cb5', '43428e', '2c2142'
  ],
  className = '',
  animationForce = 80,
  particleDensity = 4,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const pointerRef = useRef<Pointer>({});
  const hasPointerRef = useRef<boolean>(false);
  const interactionRadiusRef = useRef<number>(100);

  const [canvasSize, setCanvasSize] = useState<{ width: number; height: number }>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const [textBox] = useState<TextBox>({ str: text });

  const rand = (max = 1, min = 0, dec = 0): number => {
    return +(min + Math.random() * (max - min)).toFixed(dec);
  };

  class ParticleClass implements Particle {
    ox: number;
    oy: number;
    cx: number;
    cy: number;
    or: number;
    cr: number;
    pv: number;
    ov: number;
    f: number;
    rgb: number[];

    constructor(x: number, y: number, rgb: number[] = [rand(128), rand(128), rand(128)]) {
      this.ox = x;
      this.oy = y;
      this.cx = x;
      this.cy = y;
      this.or = rand(5, 1);
      this.cr = this.or;
      this.pv = 0;
      this.ov = 0;
      this.f = rand(animationForce + 15, animationForce - 15);
      this.rgb = rgb.map(c => Math.max(0, c + rand(13, -13)));
    }

    draw() {
      const ctx = ctxRef.current;
      if (!ctx) return;
      ctx.fillStyle = `rgb(${this.rgb.join(',')})`;
      ctx.beginPath();
      ctx.arc(this.cx, this.cy, this.cr, 0, 2 * Math.PI);
      ctx.fill();
    }

    move(interactionRadius: number, hasPointer: boolean) {
      let moved = false;

      if (hasPointer && pointerRef.current.x !== undefined && pointerRef.current.y !== undefined) {
        const dx = this.cx - pointerRef.current.x;
        const dy = this.cy - pointerRef.current.y;
        const dist = Math.hypot(dx, dy);
        if (dist < interactionRadius && dist > 0) {
          const force = Math.min(this.f, (interactionRadius - dist) / dist * 2);
          this.cx += (dx / dist) * force;
          this.cy += (dy / dist) * force;
          moved = true;
        }
      }

      const odx = this.ox - this.cx;
      const ody = this.oy - this.cy;
      const od = Math.hypot(odx, ody);

      if (od > 1) {
        const restore = Math.min(od * 0.1, 3);
        this.cx += (odx / od) * restore;
        this.cy += (ody / od) * restore;
        moved = true;
      }

      this.draw();
      return moved;
    }
  }

  const dottify = () => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas || !textBox.x || !textBox.y || !textBox.w || !textBox.h) return;

    const data = ctx.getImageData(textBox.x, textBox.y, textBox.w, textBox.h).data;
    const pixels = data.reduce((arr: any[], _, i, d) => {
      if (i % 4 === 0) {
        arr.push({
          x: (i / 4) % textBox.w!,
          y: Math.floor((i / 4) / textBox.w!),
          rgb: d.slice(i, i + 4),
        });
      }
      return arr;
    }, []).filter(p => p.rgb[3] && !(p.x % particleDensity) && !(p.y % particleDensity));

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    pixels.forEach((p, i) => {
      particlesRef.current[i] = new ParticleClass(
        textBox.x! + p.x,
        textBox.y! + p.y,
        p.rgb.slice(0, 3)
      );
      particlesRef.current[i].draw();
    });

    particlesRef.current.splice(pixels.length, particlesRef.current.length);
  };

  const write = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    textBox.str = text;
    textBox.h = Math.floor(canvas.width / textBox.str.length);

    interactionRadiusRef.current = Math.max(50, textBox.h * 1.5);

    ctx.font = `900 ${textBox.h}px Verdana, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    textBox.w = Math.round(ctx.measureText(textBox.str).width);
    textBox.x = 0.5 * (canvas.width - textBox.w);
    textBox.y = 0.5 * (canvas.height - textBox.h);

    const gradient = ctx.createLinearGradient(textBox.x, textBox.y, textBox.x + textBox.w, textBox.y + textBox.h);
    const N = colors.length - 1;
    colors.forEach((c, i) => gradient.addColorStop(i / N, `#${c}`));
    ctx.fillStyle = gradient;

    ctx.fillText(textBox.str, 0.5 * canvas.width, 0.5 * canvas.height);
    dottify();
  };

  const animate = () => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particlesRef.current.forEach(p => p.move(interactionRadiusRef.current, hasPointerRef.current));
    animationIdRef.current = requestAnimationFrame(animate);
  };

  const initialize = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    write();
  };

  useEffect(() => {
    const handleResize = () => {
      setCanvasSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    initialize();
  }, [text, colors, animationForce, particleDensity, canvasSize]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctxRef.current = ctx;
    initialize();

    return () => {
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
    };
  }, []);

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    pointerRef.current.x = (e.clientX - rect.left) * scaleX;
    pointerRef.current.y = (e.clientY - rect.top) * scaleY;
    hasPointerRef.current = true;

    if (!animationIdRef.current) animate();
  };

  const handlePointerLeave = () => {
    hasPointerRef.current = false;
    pointerRef.current.x = undefined;
    pointerRef.current.y = undefined;

    if (!animationIdRef.current) animate();
  };

  const handlePointerEnter = () => {
    hasPointerRef.current = true;
  };

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full ${className} cursor-none`}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerEnter={handlePointerEnter}
    />
  );
};

export { ParticleTextEffect };

demo.tsx
import { ParticleTextEffect } from "@/components/ui/interactive-text-particle";

const DemoOne = () => {
  return <ParticleTextEffect
        text="HOVER"
        className="absolute top-0 left-0"
        colors={['ff6b6b', 'feca57', '48dbfb', '1dd1a1']}
      />;
};

export { DemoOne };

```

Implementation Guidelines
 1. Analyze the component structure and identify all required dependencies
 2. Review the component's argumens and state
 3. Identify any required context providers or hooks and install them
 4. Questions to Ask
 - What data/props will be passed to this component?
 - Are there any specific state management requirements?
 - Are there any required assets (images, icons, etc.)?
 - What is the expected responsive behavior?
 - What is the best place to use this component in the app?

Steps to integrate
 0. Copy paste all the code above in the correct directories
 1. Install external dependencies
 2. Fill image assets with Unsplash stock images you know exist
 3. Use lucide-react icons for svgs or logos if component requires them

=============
# reference 2
You are given a task to integrate an existing React component in the codebase

The codebase should support:
- shadcn project structure
- Tailwind CSS
- Typescript

If it doesn't, provide instructions on how to setup project via shadcn CLI, install Tailwind or Typescript.

Determine the default path for components and styles.
If default path for components is not /components/ui, provide instructions on why it's important to create this folder
Copy-paste this component to /components/ui folder:
```tsx
globe.tsx
"use client"

import createGlobe, { COBEOptions } from "cobe"
import { useCallback, useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"

const GLOBE_CONFIG: COBEOptions = {
  width: 800,
  height: 800,
  onRender: () => {},
  devicePixelRatio: 2,
  phi: 0,
  theta: 0.3,
  dark: 0,
  diffuse: 0.4,
  mapSamples: 16000,
  mapBrightness: 1.2,
  baseColor: [1, 1, 1],
  markerColor: [251 / 255, 100 / 255, 21 / 255],
  glowColor: [1, 1, 1],
  markers: [
    { location: [14.5995, 120.9842], size: 0.03 },
    { location: [19.076, 72.8777], size: 0.1 },
    { location: [23.8103, 90.4125], size: 0.05 },
    { location: [30.0444, 31.2357], size: 0.07 },
    { location: [39.9042, 116.4074], size: 0.08 },
    { location: [-23.5505, -46.6333], size: 0.1 },
    { location: [19.4326, -99.1332], size: 0.1 },
    { location: [40.7128, -74.006], size: 0.1 },
    { location: [34.6937, 135.5022], size: 0.05 },
    { location: [41.0082, 28.9784], size: 0.06 },
  ],
}

export function Globe({
  className,
  config = GLOBE_CONFIG,
}: {
  className?: string
  config?: COBEOptions
}) {
  let phi = 0
  let width = 0
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointerInteracting = useRef(null)
  const pointerInteractionMovement = useRef(0)
  const [r, setR] = useState(0)

  const updatePointerInteraction = (value: any) => {
    pointerInteracting.current = value
    if (canvasRef.current) {
      canvasRef.current.style.cursor = value ? "grabbing" : "grab"
    }
  }

  const updateMovement = (clientX: any) => {
    if (pointerInteracting.current !== null) {
      const delta = clientX - pointerInteracting.current
      pointerInteractionMovement.current = delta
      setR(delta / 200)
    }
  }

  const onRender = useCallback(
    (state: Record<string, any>) => {
      if (!pointerInteracting.current) phi += 0.005
      state.phi = phi + r
      state.width = width * 2
      state.height = width * 2
    },
    [r],
  )

  const onResize = () => {
    if (canvasRef.current) {
      width = canvasRef.current.offsetWidth
    }
  }

  useEffect(() => {
    window.addEventListener("resize", onResize)
    onResize()

    const globe = createGlobe(canvasRef.current!, {
      ...config,
      width: width * 2,
      height: width * 2,
      onRender,
    })

    setTimeout(() => (canvasRef.current!.style.opacity = "1"))
    return () => globe.destroy()
  }, [])

  return (
    <div
      className={cn(
        "absolute inset-0 mx-auto aspect-[1/1] w-full max-w-[600px]",
        className,
      )}
    >
      <canvas
        className={cn(
          "size-full opacity-0 transition-opacity duration-500 [contain:layout_paint_size]",
        )}
        ref={canvasRef}
        onPointerDown={(e) =>
          updatePointerInteraction(
            e.clientX - pointerInteractionMovement.current,
          )
        }
        onPointerUp={() => updatePointerInteraction(null)}
        onPointerOut={() => updatePointerInteraction(null)}
        onMouseMove={(e) => updateMovement(e.clientX)}
        onTouchMove={(e) =>
          e.touches[0] && updateMovement(e.touches[0].clientX)
        }
      />
    </div>
  )
}


demo.tsx
import { Globe } from "@/components/ui/globe"

export function GlobeDemo() {
  return (
    <div className="relative flex size-full max-w-lg items-center justify-center overflow-hidden rounded-lg border bg-background px-40 pb-40 pt-8 md:pb-60 md:shadow-xl">
      <span className="pointer-events-none whitespace-pre-wrap bg-gradient-to-b from-black to-gray-300/80 bg-clip-text text-center text-8xl font-semibold leading-none text-transparent dark:from-white dark:to-slate-900/10">
        Globe
      </span>
      <Globe className="top-28" />
      <div className="pointer-events-none absolute inset-0 h-full bg-[radial-gradient(circle_at_50%_200%,rgba(0,0,0,0.2),rgba(255,255,255,0))]" />
    </div>
  )
}

```

Install NPM dependencies:
```bash
cobe
```

Implementation Guidelines
 1. Analyze the component structure and identify all required dependencies
 2. Review the component's argumens and state
 3. Identify any required context providers or hooks and install them
 4. Questions to Ask
 - What data/props will be passed to this component?
 - Are there any specific state management requirements?
 - Are there any required assets (images, icons, etc.)?
 - What is the expected responsive behavior?
 - What is the best place to use this component in the app?

Steps to integrate
 0. Copy paste all the code above in the correct directories
 1. Install external dependencies
 2. Fill image assets with Unsplash stock images you know exist
 3. Use lucide-react icons for svgs or logos if component requires them

=============
# reference 3
You are given a task to integrate an existing React component in the codebase

The codebase should support:
- shadcn project structure
- Tailwind CSS
- Typescript

If it doesn't, provide instructions on how to setup project via shadcn CLI, install Tailwind or Typescript.

Determine the default path for components and styles.
If default path for components is not /components/ui, provide instructions on why it's important to create this folder
Copy-paste this component to /components/ui folder:
```tsx
interactive-icon-cloud.tsx
"use client"

import { useEffect, useMemo, useState } from "react"
import { useTheme } from "next-themes"
import {
  Cloud,
  fetchSimpleIcons,
  ICloud,
  renderSimpleIcon,
  SimpleIcon,
} from "react-icon-cloud"

export const cloudProps: Omit<ICloud, "children"> = {
  containerProps: {
    style: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
      paddingTop: 40,
    },
  },
  options: {
    reverse: true,
    depth: 1,
    wheelZoom: false,
    imageScale: 2,
    activeCursor: "default",
    tooltip: "native",
    initial: [0.1, -0.1],
    clickToFront: 500,
    tooltipDelay: 0,
    outlineColour: "#0000",
    maxSpeed: 0.04,
    minSpeed: 0.02,
    // dragControl: false,
  },
}

export const renderCustomIcon = (icon: SimpleIcon, theme: string) => {
  const bgHex = theme === "light" ? "#f3f2ef" : "#080510"
  const fallbackHex = theme === "light" ? "#6e6e73" : "#ffffff"
  const minContrastRatio = theme === "dark" ? 2 : 1.2

  return renderSimpleIcon({
    icon,
    bgHex,
    fallbackHex,
    minContrastRatio,
    size: 42,
    aProps: {
      href: undefined,
      target: undefined,
      rel: undefined,
      onClick: (e: any) => e.preventDefault(),
    },
  })
}

export type DynamicCloudProps = {
  iconSlugs: string[]
}

type IconData = Awaited<ReturnType<typeof fetchSimpleIcons>>

export function IconCloud({ iconSlugs }: DynamicCloudProps) {
  const [data, setData] = useState<IconData | null>(null)
  const { theme } = useTheme()

  useEffect(() => {
    fetchSimpleIcons({ slugs: iconSlugs }).then(setData)
  }, [iconSlugs])

  const renderedIcons = useMemo(() => {
    if (!data) return null

    return Object.values(data.simpleIcons).map((icon) =>
      renderCustomIcon(icon, theme || "light"),
    )
  }, [data, theme])

  return (
    // @ts-ignore
    <Cloud {...cloudProps}>
      <>{renderedIcons}</>
    </Cloud>
  )
}


demo.tsx
import { IconCloud } from "@/components/ui/interactive-icon-cloud"

const slugs = [
  "typescript",
  "javascript",
  "dart",
  "java",
  "react",
  "flutter",
  "android",
  "html5",
  "css3",
  "nodedotjs",
  "express",
  "nextdotjs",
  "prisma",
  "amazonaws",
  "postgresql",
  "firebase",
  "nginx",
  "vercel",
  "testinglibrary",
  "jest",
  "cypress",
  "docker",
  "git",
  "jira",
  "github",
  "gitlab",
  "visualstudiocode",
  "androidstudio",
  "sonarqube",
  "figma",
]

export function IconCloudDemo() {
  return (
    <div className="relative flex size-full max-w-lg items-center justify-center overflow-hidden rounded-lg border bg-background px-20 pb-20 pt-8 ">
      <IconCloud iconSlugs={slugs} />
    </div>
  )
}

```

Install NPM dependencies:
```bash
next-themes, react-icon-cloud
```

Implementation Guidelines
 1. Analyze the component structure and identify all required dependencies
 2. Review the component's argumens and state
 3. Identify any required context providers or hooks and install them
 4. Questions to Ask
 - What data/props will be passed to this component?
 - Are there any specific state management requirements?
 - Are there any required assets (images, icons, etc.)?
 - What is the expected responsive behavior?
 - What is the best place to use this component in the app?

Steps to integrate
 0. Copy paste all the code above in the correct directories
 1. Install external dependencies
 2. Fill image assets with Unsplash stock images you know exist
 3. Use lucide-react icons for svgs or logos if component requires them

=============
# reference 4
You are given a task to integrate an existing React component in the codebase

The codebase should support:
- shadcn project structure
- Tailwind CSS
- Typescript

If it doesn't, provide instructions on how to setup project via shadcn CLI, install Tailwind or Typescript.

Determine the default path for components and styles.
If default path for components is not /components/ui, provide instructions on why it's important to create this folder
Copy-paste this component to /components/ui folder:
```tsx
particle-text-effect.tsx
"use client"

import { useEffect, useRef } from "react"

interface Vector2D {
  x: number
  y: number
}

class Particle {
  pos: Vector2D = { x: 0, y: 0 }
  vel: Vector2D = { x: 0, y: 0 }
  acc: Vector2D = { x: 0, y: 0 }
  target: Vector2D = { x: 0, y: 0 }

  closeEnoughTarget = 100
  maxSpeed = 1.0
  maxForce = 0.1
  particleSize = 10
  isKilled = false

  startColor = { r: 0, g: 0, b: 0 }
  targetColor = { r: 0, g: 0, b: 0 }
  colorWeight = 0
  colorBlendRate = 0.01

  move() {
    // Check if particle is close enough to its target to slow down
    let proximityMult = 1
    const distance = Math.sqrt(Math.pow(this.pos.x - this.target.x, 2) + Math.pow(this.pos.y - this.target.y, 2))

    if (distance < this.closeEnoughTarget) {
      proximityMult = distance / this.closeEnoughTarget
    }

    // Add force towards target
    const towardsTarget = {
      x: this.target.x - this.pos.x,
      y: this.target.y - this.pos.y,
    }

    const magnitude = Math.sqrt(towardsTarget.x * towardsTarget.x + towardsTarget.y * towardsTarget.y)
    if (magnitude > 0) {
      towardsTarget.x = (towardsTarget.x / magnitude) * this.maxSpeed * proximityMult
      towardsTarget.y = (towardsTarget.y / magnitude) * this.maxSpeed * proximityMult
    }

    const steer = {
      x: towardsTarget.x - this.vel.x,
      y: towardsTarget.y - this.vel.y,
    }

    const steerMagnitude = Math.sqrt(steer.x * steer.x + steer.y * steer.y)
    if (steerMagnitude > 0) {
      steer.x = (steer.x / steerMagnitude) * this.maxForce
      steer.y = (steer.y / steerMagnitude) * this.maxForce
    }

    this.acc.x += steer.x
    this.acc.y += steer.y

    // Move particle
    this.vel.x += this.acc.x
    this.vel.y += this.acc.y
    this.pos.x += this.vel.x
    this.pos.y += this.vel.y
    this.acc.x = 0
    this.acc.y = 0
  }

  draw(ctx: CanvasRenderingContext2D, drawAsPoints: boolean) {
    // Blend towards target color
    if (this.colorWeight < 1.0) {
      this.colorWeight = Math.min(this.colorWeight + this.colorBlendRate, 1.0)
    }

    // Calculate current color
    const currentColor = {
      r: Math.round(this.startColor.r + (this.targetColor.r - this.startColor.r) * this.colorWeight),
      g: Math.round(this.startColor.g + (this.targetColor.g - this.startColor.g) * this.colorWeight),
      b: Math.round(this.startColor.b + (this.targetColor.b - this.startColor.b) * this.colorWeight),
    }

    if (drawAsPoints) {
      ctx.fillStyle = `rgb(${currentColor.r}, ${currentColor.g}, ${currentColor.b})`
      ctx.fillRect(this.pos.x, this.pos.y, 2, 2)
    } else {
      ctx.fillStyle = `rgb(${currentColor.r}, ${currentColor.g}, ${currentColor.b})`
      ctx.beginPath()
      ctx.arc(this.pos.x, this.pos.y, this.particleSize / 2, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  kill(width: number, height: number) {
    if (!this.isKilled) {
      // Set target outside the scene
      const randomPos = this.generateRandomPos(width / 2, height / 2, (width + height) / 2)
      this.target.x = randomPos.x
      this.target.y = randomPos.y

      // Begin blending color to black
      this.startColor = {
        r: this.startColor.r + (this.targetColor.r - this.startColor.r) * this.colorWeight,
        g: this.startColor.g + (this.targetColor.g - this.startColor.g) * this.colorWeight,
        b: this.startColor.b + (this.targetColor.b - this.startColor.b) * this.colorWeight,
      }
      this.targetColor = { r: 0, g: 0, b: 0 }
      this.colorWeight = 0

      this.isKilled = true
    }
  }

  private generateRandomPos(x: number, y: number, mag: number): Vector2D {
    const randomX = Math.random() * 1000
    const randomY = Math.random() * 500

    const direction = {
      x: randomX - x,
      y: randomY - y,
    }

    const magnitude = Math.sqrt(direction.x * direction.x + direction.y * direction.y)
    if (magnitude > 0) {
      direction.x = (direction.x / magnitude) * mag
      direction.y = (direction.y / magnitude) * mag
    }

    return {
      x: x + direction.x,
      y: y + direction.y,
    }
  }
}

interface ParticleTextEffectProps {
  words?: string[]
}

const DEFAULT_WORDS = ["HELLO", "21st.dev", "ParticleTextEffect", "BY", "KAINXU"]

export function ParticleTextEffect({ words = DEFAULT_WORDS }: ParticleTextEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const particlesRef = useRef<Particle[]>([])
  const frameCountRef = useRef(0)
  const wordIndexRef = useRef(0)
  const mouseRef = useRef({ x: 0, y: 0, isPressed: false, isRightClick: false })

  const pixelSteps = 6
  const drawAsPoints = true

  const generateRandomPos = (x: number, y: number, mag: number): Vector2D => {
    const randomX = Math.random() * 1000
    const randomY = Math.random() * 500

    const direction = {
      x: randomX - x,
      y: randomY - y,
    }

    const magnitude = Math.sqrt(direction.x * direction.x + direction.y * direction.y)
    if (magnitude > 0) {
      direction.x = (direction.x / magnitude) * mag
      direction.y = (direction.y / magnitude) * mag
    }

    return {
      x: x + direction.x,
      y: y + direction.y,
    }
  }

  const nextWord = (word: string, canvas: HTMLCanvasElement) => {
    // const ctx = canvas.getContext("2d")!

    // Create off-screen canvas for text rendering
    const offscreenCanvas = document.createElement("canvas")
    offscreenCanvas.width = canvas.width
    offscreenCanvas.height = canvas.height
    const offscreenCtx = offscreenCanvas.getContext("2d")!

    // Draw text
    offscreenCtx.fillStyle = "white"
    offscreenCtx.font = "bold 100px Arial"
    offscreenCtx.textAlign = "center"
    offscreenCtx.textBaseline = "middle"
    offscreenCtx.fillText(word, canvas.width / 2, canvas.height / 2)

    const imageData = offscreenCtx.getImageData(0, 0, canvas.width, canvas.height)
    const pixels = imageData.data

    // Generate new color
    const newColor = {
      r: Math.random() * 255,
      g: Math.random() * 255,
      b: Math.random() * 255,
    }

    const particles = particlesRef.current
    let particleIndex = 0

    // Collect coordinates
    const coordsIndexes: number[] = []
    for (let i = 0; i < pixels.length; i += pixelSteps * 4) {
      coordsIndexes.push(i)
    }

    // Shuffle coordinates for fluid motion
    for (let i = coordsIndexes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[coordsIndexes[i], coordsIndexes[j]] = [coordsIndexes[j], coordsIndexes[i]]
    }

    for (const coordIndex of coordsIndexes) {
      const pixelIndex = coordIndex
      const alpha = pixels[pixelIndex + 3]

      if (alpha > 0) {
        const x = (pixelIndex / 4) % canvas.width
        const y = Math.floor(pixelIndex / 4 / canvas.width)

        let particle: Particle

        if (particleIndex < particles.length) {
          particle = particles[particleIndex]
          particle.isKilled = false
          particleIndex++
        } else {
          particle = new Particle()

          const randomPos = generateRandomPos(canvas.width / 2, canvas.height / 2, (canvas.width + canvas.height) / 2)
          particle.pos.x = randomPos.x
          particle.pos.y = randomPos.y

          particle.maxSpeed = Math.random() * 6 + 4
          particle.maxForce = particle.maxSpeed * 0.05
          particle.particleSize = Math.random() * 6 + 6
          particle.colorBlendRate = Math.random() * 0.0275 + 0.0025

          particles.push(particle)
        }

        // Set color transition
        particle.startColor = {
          r: particle.startColor.r + (particle.targetColor.r - particle.startColor.r) * particle.colorWeight,
          g: particle.startColor.g + (particle.targetColor.g - particle.startColor.g) * particle.colorWeight,
          b: particle.startColor.b + (particle.targetColor.b - particle.startColor.b) * particle.colorWeight,
        }
        particle.targetColor = newColor
        particle.colorWeight = 0

        particle.target.x = x
        particle.target.y = y
      }
    }

    // Kill remaining particles
    for (let i = particleIndex; i < particles.length; i++) {
      particles[i].kill(canvas.width, canvas.height)
    }
  }

  const animate = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")!
    const particles = particlesRef.current

    // Background with motion blur
    ctx.fillStyle = "rgba(0, 0, 0, 0.1)"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Update and draw particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const particle = particles[i]
      particle.move()
      particle.draw(ctx, drawAsPoints)

      // Remove dead particles that are out of bounds
      if (particle.isKilled) {
        if (
          particle.pos.x < 0 ||
          particle.pos.x > canvas.width ||
          particle.pos.y < 0 ||
          particle.pos.y > canvas.height
        ) {
          particles.splice(i, 1)
        }
      }
    }

    // Handle mouse interaction
    if (mouseRef.current.isPressed && mouseRef.current.isRightClick) {
      particles.forEach((particle) => {
        const distance = Math.sqrt(
          Math.pow(particle.pos.x - mouseRef.current.x, 2) + Math.pow(particle.pos.y - mouseRef.current.y, 2),
        )
        if (distance < 50) {
          particle.kill(canvas.width, canvas.height)
        }
      })
    }

    // Auto-advance words
    frameCountRef.current++
    if (frameCountRef.current % 240 === 0) {
      wordIndexRef.current = (wordIndexRef.current + 1) % words.length
      nextWord(words[wordIndexRef.current], canvas)
    }

    animationRef.current = requestAnimationFrame(animate)
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width = 1000
    canvas.height = 500

    // Initialize with first word
    nextWord(words[0], canvas)

    // Start animation
    animate()

    // Mouse event handlers
    const handleMouseDown = (e: MouseEvent) => {
      mouseRef.current.isPressed = true
      mouseRef.current.isRightClick = e.button === 2
      const rect = canvas.getBoundingClientRect()
      mouseRef.current.x = e.clientX - rect.left
      mouseRef.current.y = e.clientY - rect.top
    }

    const handleMouseUp = () => {
      mouseRef.current.isPressed = false
      mouseRef.current.isRightClick = false
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current.x = e.clientX - rect.left
      mouseRef.current.y = e.clientY - rect.top
    }

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
    }

    canvas.addEventListener("mousedown", handleMouseDown)
    canvas.addEventListener("mouseup", handleMouseUp)
    canvas.addEventListener("mousemove", handleMouseMove)
    canvas.addEventListener("contextmenu", handleContextMenu)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      canvas.removeEventListener("mousedown", handleMouseDown)
      canvas.removeEventListener("mouseup", handleMouseUp)
      canvas.removeEventListener("mousemove", handleMouseMove)
      canvas.removeEventListener("contextmenu", handleContextMenu)
    }
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-4">
      <canvas
        ref={canvasRef}
        className="border border-gray-800 rounded-lg shadow-2xl"
        style={{ maxWidth: "100%", height: "auto" }}
      />
      <div className="mt-4 text-white text-sm text-center max-w-md">
        <p className="mb-2">Particle Text Effect</p>
        <p className="text-gray-400 text-xs">
          Right-click and hold while moving mouse to destroy particles • Words change automatically every 4 seconds
        </p>
      </div>
    </div>
  )
}


demo.tsx
import { ParticleTextEffect } from "@/components/ui/particle-text-effect";

export default function DemoOne() {
  return <ParticleTextEffect />;
}

```

Implementation Guidelines
 1. Analyze the component structure and identify all required dependencies
 2. Review the component's argumens and state
 3. Identify any required context providers or hooks and install them
 4. Questions to Ask
 - What data/props will be passed to this component?
 - Are there any specific state management requirements?
 - Are there any required assets (images, icons, etc.)?
 - What is the expected responsive behavior?
 - What is the best place to use this component in the app?

Steps to integrate
 0. Copy paste all the code above in the correct directories
 1. Install external dependencies
 2. Fill image assets with Unsplash stock images you know exist
 3. Use lucide-react icons for svgs or logos if component requires them


=========
# reference 5
You are given a task to integrate an existing React component in the codebase

The codebase should support:
- shadcn project structure
- Tailwind CSS
- Typescript

If it doesn't, provide instructions on how to setup project via shadcn CLI, install Tailwind or Typescript.

Determine the default path for components and styles.
If default path for components is not /components/ui, provide instructions on why it's important to create this folder
Copy-paste this component to /components/ui folder:
```tsx
in-view.tsx
'use client';
import { ReactNode, useRef } from 'react';
import {
  motion,
  useInView,
  Variant,
  Transition,
  UseInViewOptions,
} from 'framer-motion';

interface InViewProps {
  children: ReactNode;
  variants?: {
    hidden: Variant;
    visible: Variant;
  };
  transition?: Transition;
  viewOptions?: UseInViewOptions;
}

const defaultVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export function InView({
  children,
  variants = defaultVariants,
  transition,
  viewOptions,
}: InViewProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, viewOptions);

  return (
    <motion.div
      ref={ref}
      initial='hidden'
      animate={isInView ? 'visible' : 'hidden'}
      variants={variants}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}


demo.tsx
"use client";
import { InView } from "@/components/ui/in-view";
import { motion } from "framer-motion";

function InViewImagesGrid() {
  return (
    <div className="h-[80vh] w-full overflow-y-auto overflow-x-hidden">
      <div className="mb-[50vh] mt-[50vh] py-12 text-center text-sm">Scroll down</div>
      <div className="flex h-[1200px] items-end justify-center pb-12">
        <InView
          viewOptions={{ once: true, margin: "0px 0px -250px 0px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.09 },
            },
          }}
        >
          <div className="columns-2 gap-4 px-8 sm:columns-3">
            {[
              'https://images.beta.cosmos.so/e5ebb6f8-8202-40ec-bc70-976f81153501?format=jpeg',
              'https://images.beta.cosmos.so/1b6f1bee-1b4c-4035-9e93-c93ef4d445e1?format=jpeg',
              'https://images.beta.cosmos.so/9968a6cf-d7f6-4ec9-a56d-ac4eef3f8689?format=jpeg',
              'https://images.beta.cosmos.so/4b88a39c-c657-4911-b843-b473237e83b5?format=jpeg',
              'https://images.beta.cosmos.so/86af92c0-064d-4801-b7ed-232535b03328?format=jpeg',
              'https://images.beta.cosmos.so/399e2a4a-e118-4aaf-9c7e-155ed18f6556?format=jpeg',
              'https://images.beta.cosmos.so/6ff16bc9-dc94-4549-a057-673a603ce203?format=jpeg',
              'https://images.beta.cosmos.so/d67c3185-4480-4408-8f9d-1cbf541e5d91?format=jpeg',
              'https://images.beta.cosmos.so/a7b19274-3370-4080-b734-e8ac268d8c8e.?format=jpeg',
              'https://images.beta.cosmos.so/551daf0d-77e8-472c-9324-468fed15a0ba?format=jpeg',
            ].map((imgSrc, index) => {
              return (
                <motion.div
                  variants={{
                    hidden: { opacity: 0, scale: 0.8, filter: "blur(10px)" },
                    visible: { opacity: 1, scale: 1, filter: "blur(0px)" },
                  }}
                  key={index}
                  className="mb-4"
                >
                  <img
                    src={imgSrc}
                    alt={`Image placeholder from cosmos.so, index:${index}`}
                    className="size-full rounded-lg object-contain"
                  />
                </motion.div>
              );
            })}
          </div>
        </InView>
      </div>
    </div>
  );
}

export default {
  InViewImagesGrid
};

```

Install NPM dependencies:
```bash
framer-motion
```

Implementation Guidelines
 1. Analyze the component structure and identify all required dependencies
 2. Review the component's argumens and state
 3. Identify any required context providers or hooks and install them
 4. Questions to Ask
 - What data/props will be passed to this component?
 - Are there any specific state management requirements?
 - Are there any required assets (images, icons, etc.)?
 - What is the expected responsive behavior?
 - What is the best place to use this component in the app?

Steps to integrate
 0. Copy paste all the code above in the correct directories
 1. Install external dependencies
 2. Fill image assets with Unsplash stock images you know exist
 3. Use lucide-react icons for svgs or logos if component requires them


========
# reference 6
You are given a task to integrate an existing React component in the codebase

The codebase should support:
- shadcn project structure
- Tailwind CSS
- Typescript

If it doesn't, provide instructions on how to setup project via shadcn CLI, install Tailwind or Typescript.

Determine the default path for components and styles.
If default path for components is not /components/ui, provide instructions on why it's important to create this folder
Copy-paste this component to /components/ui folder:
```tsx
number-flow.tsx
https://number-flow.barvian.me/

demo.tsx
'use client';

import { useState } from 'react';
import NumberFlow, { type Value } from "@number-flow/react";

const values: Value[] = [398.43, -3243.5, 1435237];

function NumberFlowDemo() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleClick = () => {
    setCurrentIndex((prev) => (prev + 1) % values.length);
  };

  return (
    <div
      onClick={handleClick}
      className="min-h-screen w-full min-w-[100vw]  flex flex-col items-center justify-center cursor-pointer text-[40px]"
    >
      <div className="pointer-events-none">
        <NumberFlow value={values[currentIndex]} trend={false} />
      </div>
      <p className="absolute bottom-6 text-sm text-gray-500 pointer-events-none">
        Click anywhere to change values
      </p>
    </div>
  );
}

export default { NumberFlowDemo };
```

Implementation Guidelines
 1. Analyze the component structure and identify all required dependencies
 2. Review the component's argumens and state
 3. Identify any required context providers or hooks and install them
 4. Questions to Ask
 - What data/props will be passed to this component?
 - Are there any specific state management requirements?
 - Are there any required assets (images, icons, etc.)?
 - What is the expected responsive behavior?
 - What is the best place to use this component in the app?

Steps to integrate
 0. Copy paste all the code above in the correct directories
 1. Install external dependencies
 2. Fill image assets with Unsplash stock images you know exist
 3. Use lucide-react icons for svgs or logos if component requires them

========
# reference 7
You are given a task to integrate an existing React component in the codebase

The codebase should support:
- shadcn project structure
- Tailwind CSS
- Typescript

If it doesn't, provide instructions on how to setup project via shadcn CLI, install Tailwind or Typescript.

Determine the default path for components and styles.
If default path for components is not /components/ui, provide instructions on why it's important to create this folder
Copy-paste this component to /components/ui folder:
```tsx
shiny-borders-button.tsx
import React from 'react';

const RealismButton = ({text}) => {
  return (
    <button className="group relative p-[2px] rounded-[16px] text-[1.4rem] border-none cursor-pointer bg-[radial-gradient(circle_80px_at_80%_-10%,_#ffffff,_#181b1b)] transition-all">
      {/* Glow behind button */}
      <div className="absolute top-0 right-0 w-[65%] h-[60%] rounded-[120px] shadow-[0_0_20px_#ffffff38] group-hover:shadow-[0_0_40px_#ffffff60] transition-all duration-300 ease-out -z-10" />

      {/* Bottom-left green blob */}
      <div className="absolute bottom-0 left-0 w-[50px] h-[50%] rounded-[17px] transition-all duration-300 ease-out
        bg-[radial-gradient(circle_60px_at_0%_100%,_#3fff75,_#00ff8050,_transparent)]
        shadow-[-2px_9px_40px_#00ff2d40]
        group-hover:w-[90px] group-hover:shadow-[-4px_1px_45px_#00ff2d60]" />

      {/* Inner content */}
      <div className="relative px-[25px] py-[14px] group-hover:scale-110 rounded-[14px] text-white bg-[radial-gradient(circle_80px_at_80%_-50%,_#777777,_#0f1111)] z-10 transition-all duration-300">
        {text}

        {/* Inner glow layer */}
        <div className="absolute inset-0 rounded-[14px] bg-[radial-gradient(circle_60px_at_0%_100%,_#00e1ff1a,_#0000ff11,_transparent)] z-[-1]" />
      </div>
    </button>
  );
};

export default RealismButton;



demo.tsx
import RealismButton from "@/components/ui/shiny-borders-button";

export default function DemoOne() {
  return <div className="flex items-center justify-center min-h-screen dark:bg-black bg-white w-full">
      <RealismButton text={"See Projects"} />
    </div>
}

```

Implementation Guidelines
 1. Analyze the component structure and identify all required dependencies
 2. Review the component's argumens and state
 3. Identify any required context providers or hooks and install them
 4. Questions to Ask
 - What data/props will be passed to this component?
 - Are there any specific state management requirements?
 - Are there any required assets (images, icons, etc.)?
 - What is the expected responsive behavior?
 - What is the best place to use this component in the app?

Steps to integrate
 0. Copy paste all the code above in the correct directories
 1. Install external dependencies
 2. Fill image assets with Unsplash stock images you know exist
 3. Use lucide-react icons for svgs or logos if component requires them

