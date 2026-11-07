import { gsap, q, ScrollTrigger, type Effect } from "../motion";

/**
 * PARTICLE WAVE — the hero sea. The skill's three-hero.js shader, ported to
 * ogl (no Three.js; ogl is the WebGL library already used in Sip of Art).
 *
 * An emerald point field over night ink, a warm moon point on the horizon,
 * and a moonlight path: points under the moon take its gold, the way the
 * moon lies on the water in night/131. The pointer (or a finger) sends a
 * ripple through it. Lower point count on phones, DPR capped, paused when
 * off-screen or the tab is hidden. No WebGL or reduced motion → the CSS
 * fallback in the hero stays (night/128 framed in the arch over a still sea).
 */
export const particleSea: Effect = (ctx) => {
  const host = q("[data-fx='particle-wave']");
  if (!host || ctx.reduce) return;
  const probe = document.createElement("canvas");
  if (!(probe.getContext("webgl2") || probe.getContext("webgl"))) return;

  let stopped = false;
  let teardown: (() => void) | null = null;

  import("./ogl").then(({ Renderer, Camera, Geometry, Program, Mesh, Transform }) => {
    if (stopped) return;
    const small = window.matchMedia("(max-width: 767px)").matches;
    const renderer = new Renderer({
      dpr: Math.min(window.devicePixelRatio || 1, small ? 1.5 : 1.75),
      alpha: true,
      antialias: false,
      premultipliedAlpha: false,
      powerPreference: "high-performance",
    });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    const canvas = gl.canvas as HTMLCanvasElement;
    canvas.className = "hero__sea-canvas";
    canvas.setAttribute("aria-hidden", "true");
    host.appendChild(canvas);

    const camera = new Camera(gl, { fov: 50, near: 0.1, far: 100 });
    camera.position.set(0, 3.2, 9);
    camera.lookAt([0, 0, 0]);
    const scene = new Transform();

    const cols = small ? 110 : 190;
    const rows = small ? 70 : 100;
    const gap = small ? 0.2 : 0.19;
    const pos = new Float32Array(cols * rows * 3);
    let i = 0;
    for (let x = 0; x < cols; x++)
      for (let z = 0; z < rows; z++) {
        pos[i++] = (x - cols / 2) * gap;
        pos[i++] = 0;
        // Most of the field lies BEHIND the origin, so the sea runs out to
        // the horizon instead of ending in the lower third of the screen.
        pos[i++] = (z - rows * 0.78) * gap + 3;
      }

    const css = getComputedStyle(document.documentElement);
    const rgb = (v: string) => {
      const h = css.getPropertyValue(v).trim().replace("#", "");
      return [0, 2, 4].map((k) => parseInt(h.slice(k, k + 2), 16) / 255);
    };
    /** The moon's x in world units; its path on the water uses the same x. */
    const moonX = small ? -2.2 : 1.6;

    const seaProgram = new Program(gl, {
      vertex: /* glsl */ `
        attribute vec3 position;
        uniform mat4 modelViewMatrix; uniform mat4 projectionMatrix;
        uniform float uTime; uniform vec2 uMouse; uniform float uSize; uniform float uScroll;
        uniform float uRipple; uniform float uMoonX; uniform float uSwell;
        varying float vFade; varying float vCrest; varying float vMoon;
        void main() {
          vec3 p = position;
          float w = sin(p.x * 0.55 + uTime * 0.9) * 0.32
                  + cos(p.z * 0.7 + uTime * 0.6) * 0.28
                  + sin((p.x + p.z) * 0.35 + uTime * 0.4) * 0.16;
          w *= uSwell;
          float d = distance(p.xz, uMouse);
          w += sin(d * 2.2 - uTime * 3.0) * 0.28 * smoothstep(3.5, 0.0, d) * uRipple;
          p.y += w - uScroll * 1.6;
          vCrest = smoothstep(-0.35, 0.55, w);
          // The moon path is a vertical line on screen: in world space its x
          // grows with distance from the camera (z = 9), and so does its width.
          float dist = 9.0 - p.z;
          vMoon = smoothstep(0.05 * dist + 0.12, 0.0, abs(p.x - uMoonX * dist / 25.0));
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = uSize * (6.0 / -mv.z);
          vFade = smoothstep(30.0, 5.0, -mv.z);
        }`,
      fragment: /* glsl */ `
        precision mediump float;
        uniform vec3 uGlow; uniform vec3 uDeep; uniform vec3 uMoon; uniform float uAlpha;
        varying float vFade; varying float vCrest; varying float vMoon;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          if (d > 0.5) discard;
          vec3 col = mix(uDeep, uGlow, vCrest * 0.85 + 0.15);
          col = mix(col, uMoon, vMoon * (0.45 + 0.4 * vCrest));
          float a = (1.0 - d * 2.0) * vFade * (0.6 + 0.4 * vCrest) * uAlpha * (1.0 + vMoon * 0.6);
          gl_FragColor = vec4(col, a);
        }`,
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: [99, 99] },
        uSize: { value: (small ? 4.2 : 4.6) * renderer.dpr },
        uScroll: { value: 0 },
        uRipple: { value: 1 },
        uMoonX: { value: moonX },
        uSwell: { value: 0 },
        uAlpha: { value: 0 },
        uGlow: { value: rgb("--sea-glow") },
        uDeep: { value: rgb("--emerald") },
        uMoon: { value: rgb("--moon") },
      },
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
    const sea = new Mesh(gl, {
      mode: gl.POINTS,
      geometry: new Geometry(gl, { position: { size: 3, data: pos } }),
      program: seaProgram,
    });
    sea.setParent(scene);

    // The moon: one soft point with a halo, far out on the horizon.
    const maxPoint = (gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE) as Float32Array)[1] || 64;
    const moonProgram = new Program(gl, {
      vertex: /* glsl */ `
        attribute vec3 position;
        uniform mat4 modelViewMatrix; uniform mat4 projectionMatrix; uniform float uSize;
        void main() {
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = uSize;
        }`,
      fragment: /* glsl */ `
        precision mediump float;
        uniform vec3 uMoon; uniform vec3 uHalo; uniform float uAlpha;
        void main() {
          float d = length(gl_PointCoord - 0.5) * 2.0;
          float disc = smoothstep(0.17, 0.15, d);
          float halo = pow(max(0.0, 1.0 - d), 3.2) * 0.75;
          vec3 col = mix(uHalo, uMoon, smoothstep(0.05, 0.2, d));
          gl_FragColor = vec4(col, (disc + halo) * uAlpha);
        }`,
      uniforms: {
        uSize: { value: Math.min(maxPoint, (small ? 120 : 170) * renderer.dpr) },
        uMoon: { value: rgb("--moon") },
        uHalo: { value: rgb("--moon-halo") },
        uAlpha: { value: 0 },
      },
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
    const moon = new Mesh(gl, {
      mode: gl.POINTS,
      geometry: new Geometry(gl, { position: { size: 3, data: new Float32Array([moonX, 0.15, -16]) } }),
      program: moonProgram,
    });
    moon.setParent(scene);

    const resize = () => {
      const w = host.clientWidth;
      const h = host.clientHeight;
      renderer.setSize(w, h);
      camera.perspective({ aspect: w / h });
    };
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    resize();

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(host);

    // Pointer → a point on the sea plane (y = 0), by ray-plane intersection.
    const target = { x: 99, z: 99 };
    const cur = { x: 99, z: 99 };
    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      if (e.clientY < r.top || e.clientY > r.bottom) return;
      const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
      const ny = -(((e.clientY - r.top) / r.height) * 2 - 1);
      const t = Math.tan((50 * Math.PI) / 360);
      // Camera at (0,3.2,9) looking at the origin: forward f = (0, fy, fz),
      // up = (0, -fz, fy), right = (1, 0, 0). Ray = f + nx·t·aspect·right + ny·t·up.
      const fz = -9 / Math.hypot(3.2, 9);
      const fy = -3.2 / Math.hypot(3.2, 9);
      const dir = [nx * t * (r.width / r.height), fy + ny * t * -fz, fz + ny * t * fy];
      if (dir[1] >= 0) return;
      const k = -3.2 / dir[1];
      target.x = dir[0] * k;
      target.z = 9 + dir[2] * k;
      if (cur.x === 99) Object.assign(cur, target);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onMove, { passive: true });

    const st = ScrollTrigger.create({
      trigger: host,
      start: "top top",
      end: "bottom top",
      scrub: true,
      onUpdate: (s) => (seaProgram.uniforms.uScroll.value = s.progress),
    });

    // Entrance: the sea swells up and the moon rises out of the dark as the
    // preloader sails lift.
    ctx.intro.then(() => {
      gsap.to(seaProgram.uniforms.uAlpha, { value: 1, duration: 2.2, ease: "power2.out" });
      gsap.to(seaProgram.uniforms.uSwell, { value: 1, duration: 2.8, ease: "power2.out" });
      gsap.to(moonProgram.uniforms.uAlpha, { value: 1, duration: 2.4, delay: 0.5, ease: "power2.out" });
    });

    const tick = (time: number) => {
      if (!visible || document.hidden) return;
      cur.x += (target.x - cur.x) * 0.06;
      cur.z += (target.z - cur.z) * 0.06;
      seaProgram.uniforms.uTime.value = time;
      seaProgram.uniforms.uMouse.value = [cur.x, cur.z];
      renderer.render({ scene, camera });
    };
    gsap.ticker.add(tick);
    host.classList.add("has-webgl");

    teardown = () => {
      gsap.ticker.remove(tick);
      st.kill();
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onMove);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
      host.classList.remove("has-webgl");
    };
  });

  return () => {
    stopped = true;
    teardown?.();
  };
};
