<script>
  import { onMount, onDestroy } from 'svelte';
  import * as THREE from 'three';
  import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

  // 0..1 scroll progress: 0 = fully scrambled, 1 = solved. Leave unset
  // (null) for the autonomous scramble/rest/solve/rest demo loop instead.
  export let progress = null;

  // When true, independent of `progress`/scroll: every so often, at a
  // random interval, the cube gives itself a quick scramble then solves
  // it back on its own — a little ambient "it's alive" flourish. Meant
  // for a cube that just sits there otherwise (e.g. the docked companion),
  // not the scroll-pinned hero cube, whose scrambled/solved state is
  // supposed to map directly to scroll position.
  export let randomSolve = false;

  // The 10-click easter egg opens the site's one auto-reply generator
  // (OooGeneratorModal, owned by App) instead of a cube-local modal.
  export let onOpenOooGen = () => {};

  let canvas;
  let container;

  let clickCount = 0;
  let isSleeping = false;
  let lastActivityTime = performance.now();

  // One-time "psst, try clicking me" nudge — the 10-click easter egg has
  // zero in-UI discoverability otherwise. Shown once per session, a few
  // seconds after the cube docks in its floating position, and only if the
  // egg hasn't already been found.
  let showNudge = false;
  let nudgeScheduled = false;
  let nudgeTimer;
  const NUDGE_KEY = 'ooo-cube-nudge-shown';

  function dismissNudge() {
    showNudge = false;
    clearTimeout(nudgeTimer);
  }

  function maybeScheduleNudge() {
    if (nudgeScheduled) return;
    nudgeScheduled = true;
    if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(NUDGE_KEY)) return;
    nudgeTimer = setTimeout(() => {
      if (clickCount === 0) {
        showNudge = true;
        if (typeof sessionStorage !== 'undefined') sessionStorage.setItem(NUDGE_KEY, '1');
        nudgeTimer = setTimeout(dismissNudge, 5000);
      }
    }, 4000);
  }

  function handleCubeClick() {
    dismissNudge();
    clickCount = (clickCount + 1) % 11;
    if (clickCount === 10) {
      onOpenOooGen();
    }
  }

  function wakeUp() {
    lastActivityTime = performance.now();
    isSleeping = false;
  }

  let liveProgress = progress;
  $: {
    liveProgress = progress;
    if (liveProgress !== null) {
      lastActivityTime = performance.now();
      isSleeping = false;
    }
    if (liveProgress !== null && liveProgress >= 0.995) maybeScheduleNudge();
  }

  const UNIT = 0.72; // spacing between cubie centers
  const CUBIE = 0.68; // cubie edge length (small, near-seamless gap like the source)

  // The six standard Rubik's-cube colors, one solid hue per face — reads
  // as an actual Rubik's cube instead of a brand-palette abstraction.
  // Every tile on a face converges on the same color when solved, a real
  // Rubik's-cube tell instead of a busy pattern.
  const FACE_COLORS = {
    px: '#0051ba', // blue
    nx: '#009b48', // green (opposite blue)
    py: '#ffd500', // yellow
    ny: '#ffffff', // white (opposite yellow)
    pz: '#ff5800', // orange
    nz: '#c41e3a', // red (opposite orange)
  };
  // Mainland/chaos colors (concept.txt) — tiles blend toward these, in a
  // per-tile checkerboard, the more scrambled the cube is; the blend fades
  // to 0 at fully solved, so "life is messy" reads as literal color noise
  // that resolves into the six clean colors as the cube (and the page)
  // calms down.
  const CHAOS_YELLOW = '#ffc72c';
  const CHAOS_RED = '#e5383b';
  // White seams/plastic body — the site is permanently in its paper world.
  const seamColor = '#ffffff';

  function hexToRgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  // blend two hex colors by t, then scale toward black by `shade` — the
  // shade factor gives tiles a faint (4-6%) light/dark alternation even at
  // chaosT=0, so a solved face still reads as a tactile sticker grid up
  // close without the old scheme's illegible two-tone contrast from afar.
  function mixColor(hexA, hexB, t, shade = 1) {
    const a = hexToRgb(hexA), b = hexToRgb(hexB);
    const r = Math.round((a[0] + (b[0] - a[0]) * t) * shade);
    const g = Math.round((a[1] + (b[1] - a[1]) * t) * shade);
    const bl = Math.round((a[2] + (b[2] - a[2]) * t) * shade);
    return `rgb(${r},${g},${bl})`;
  }

  const AXES = ['x', 'y', 'z'];

  // which two grid axes tile a given face, and which brand glyph rides on it
  const FACE_AXES = {
    px: { u: 'z', v: 'y', decal: 'heart' },
    nx: { u: 'z', v: 'y', decal: 'heart' },
    py: { u: 'x', v: 'z', decal: 'ring' },
    ny: { u: 'x', v: 'z', decal: 'ring' },
    pz: { u: 'x', v: 'y', decal: 'bowtie' },
    nz: { u: 'x', v: 'y', decal: 'bowtie' },
  };

  const ATLAS = 660; // conceptual size of a whole 3x3 face, in texture pixels
  const TILE = ATLAS / 3; // one sticker's texture size

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // big brand-glyph decals, drawn in whole-face ("atlas") coordinates so
  // they read as one continuous shape spanning multiple stickers
  function drawHeart(ctx, atlas, color) {
    const cx = atlas / 2, cy = atlas / 2, s = atlas * 0.16;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(cx, cy + s * 2.3);
    ctx.bezierCurveTo(cx - s * 3.2, cy + s * 0.4, cx - s * 1.8, cy - s * 2, cx, cy - s * 0.6);
    ctx.bezierCurveTo(cx + s * 1.8, cy - s * 2, cx + s * 3.2, cy + s * 0.4, cx, cy + s * 2.3);
    ctx.closePath();
    ctx.fill();
  }

  function drawRing(ctx, atlas, color) {
    const cx = atlas / 2, cy = atlas / 2, r = atlas * 0.3;
    ctx.strokeStyle = color;
    ctx.lineWidth = atlas * 0.075;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  function drawBowtie(ctx, atlas, color) {
    const cx = atlas / 2, cy = atlas / 2, w = atlas * 0.34, h = atlas * 0.26;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx - w, cy - h);
    ctx.lineTo(cx - w, cy + h);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + w, cy - h);
    ctx.lineTo(cx + w, cy + h);
    ctx.closePath();
    ctx.fill();
  }

  const DECALS = { heart: drawHeart, ring: drawRing, bowtie: drawBowtie };

  // one sticker texture for tile (i, j) of a 3x3 face. Drawing happens in
  // atlas-space (0..ATLAS) with the canvas translated so it's naturally
  // clipped to this tile's TILE x TILE window — that's what makes the
  // decal shape continue seamlessly from tile to tile. Returns a repaint()
  // closure (not just a texture) so the same canvas can be redrawn in
  // place as chaosT changes, instead of allocating new textures per frame.
  function makeTileTexture(i, j, decalKey, faceColor, chaosT0) {
    const el = document.createElement('canvas');
    el.width = el.height = TILE;
    const ctx = el.getContext('2d');
    ctx.translate(-i * TILE, -j * TILE);

    const x = i * TILE, y = j * TILE;
    const inset = TILE * 0.05;
    const r = TILE * 0.15;
    const chaosBase = (i + j) % 2 === 0 ? CHAOS_YELLOW : CHAOS_RED;
    const shade = (i + j) % 2 === 0 ? 1 : 0.94;

    let texture;
    function paint(chaosT) {
      ctx.clearRect(x, y, TILE, TILE);
      ctx.fillStyle = seamColor;
      ctx.fillRect(x, y, TILE, TILE);

      ctx.fillStyle = mixColor(faceColor, chaosBase, chaosT, shade);
      roundRect(ctx, x + inset, y + inset, TILE - inset * 2, TILE - inset * 2, r);
      ctx.fill();

      ctx.strokeStyle = 'rgba(255,255,255,0.55)';
      ctx.lineWidth = TILE * 0.02;
      roundRect(ctx, x + inset, y + inset, TILE - inset * 2, TILE - inset * 2, r);
      ctx.stroke();

      DECALS[decalKey](ctx, ATLAS, 'rgba(255,255,255,0.42)');
      if (texture) texture.needsUpdate = true;
    }

    paint(chaosT0);
    texture = new THREE.CanvasTexture(el);
    texture.colorSpace = THREE.SRGBColorSpace;
    return { texture, repaint: paint };
  }

  let plasticTextureRef = null;
  let plasticCtxRef = null;
  function makePlasticTexture() {
    const size = 64;
    const el = document.createElement('canvas');
    el.width = el.height = size;
    const ctx = el.getContext('2d');
    ctx.fillStyle = seamColor;
    ctx.fillRect(0, 0, size, size);
    const texture = new THREE.CanvasTexture(el);
    texture.colorSpace = THREE.SRGBColorSpace;
    plasticCtxRef = ctx;
    plasticTextureRef = texture;
    return texture;
  }

  function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  // exact 90-degree rotations of integer grid coordinates, no float drift
  function rotateGrid(v, axis, dir) {
    const { x, y, z } = v;
    if (axis === 'x') return dir > 0 ? { x, y: -z, z: y } : { x, y: z, z: -y };
    if (axis === 'y') return dir > 0 ? { x: z, y, z: -x } : { x: -z, y, z: x };
    return dir > 0 ? { x: -y, y: x, z } : { x: y, y: -x, z };
  }

  onMount(() => {
    // needed up-front (before cubies are built) so sticker textures start
    // at the right chaosT: scroll-driven mode snaps straight to fully
    // scrambled on the very first frame (see below), autonomous mode
    // starts solved.
    const scrollMode = liveProgress !== null;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 4.8);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    const cubeGroup = new THREE.Group();
    scene.add(cubeGroup);

    const plasticTexture = makePlasticTexture();
    const plasticMaterial = new THREE.MeshPhysicalMaterial({
      map: plasticTexture,
      transparent: true,
      opacity: 1,
      roughness: 0.18,
      clearcoat: 0.7,
      clearcoatRoughness: 0.15,
      metalness: 0,
    });
    const geometry = new RoundedBoxGeometry(CUBIE, CUBIE, CUBIE, 3, CUBIE * 0.12);

    const disposableTextures = [plasticTexture];
    const disposableMaterials = [plasticMaterial];
    const stickerRepaints = [];
    const initialChaosT = scrollMode ? 1 : 0;

    const axisVectors = {
      x: new THREE.Vector3(1, 0, 0),
      y: new THREE.Vector3(0, 1, 0),
      z: new THREE.Vector3(0, 0, 1),
    };

    // approximate motion blur: each trail step re-evaluates the same twist
    // motion function at an earlier timestamp, no history buffer needed.
    // Kept light — just enough to read as a fast turn, not a smear — so
    // the solved-color reveal stays crisp instead of getting muddied.
    const TRAIL_STEPS = [
      { lagMs: 45, opacity: 0.14 },
      { lagMs: 90, opacity: 0.05 },
    ];

    // exterior sticker material for cubie (gx,gy,gz)'s face pointing `dir`
    function stickerMaterial(dir, gx, gy, gz) {
      const axes = FACE_AXES[dir];
      const coord = { x: gx, y: gy, z: gz };
      const i = coord[axes.u] + 1;
      const j = coord[axes.v] + 1;
      const { texture, repaint } = makeTileTexture(i, j, axes.decal, FACE_COLORS[dir], initialChaosT);
      disposableTextures.push(texture);
      stickerRepaints.push(repaint);
      const material = new THREE.MeshPhysicalMaterial({
        map: texture,
        transparent: true,
        opacity: 0.86,
        roughness: 0.22,
        clearcoat: 0.6,
        clearcoatRoughness: 0.2,
        metalness: 0,
      });
      disposableMaterials.push(material);
      return material;
    }

    const cubies = [];
    for (let gx = -1; gx <= 1; gx++) {
      for (let gy = -1; gy <= 1; gy++) {
        for (let gz = -1; gz <= 1; gz++) {
          const materials = [
            gx === 1 ? stickerMaterial('px', gx, gy, gz) : plasticMaterial,
            gx === -1 ? stickerMaterial('nx', gx, gy, gz) : plasticMaterial,
            gy === 1 ? stickerMaterial('py', gx, gy, gz) : plasticMaterial,
            gy === -1 ? stickerMaterial('ny', gx, gy, gz) : plasticMaterial,
            gz === 1 ? stickerMaterial('pz', gx, gy, gz) : plasticMaterial,
            gz === -1 ? stickerMaterial('nz', gx, gy, gz) : plasticMaterial,
          ];
          const mesh = new THREE.Mesh(geometry, materials);
          mesh.position.set(gx * UNIT, gy * UNIT, gz * UNIT);
          cubeGroup.add(mesh);

          // trailing "ghost" copies for motion blur during fast twists —
          // each is a transparent clone of this cubie's own materials
          // (shares the same textures), positioned a few ms in the past
          const trail = TRAIL_STEPS.map(() => {
            const ghostMats = materials.map((m) => {
              const gm = m.clone();
              gm.transparent = true;
              gm.depthWrite = false;
              gm.opacity = 0;
              disposableMaterials.push(gm);
              return gm;
            });
            const ghostMesh = new THREE.Mesh(geometry, ghostMats);
            ghostMesh.visible = false;
            cubeGroup.add(ghostMesh);
            return { mesh: ghostMesh, materials: ghostMats };
          });

          cubies.push({ mesh, x: gx, y: gy, z: gz, trail });
        }
      }
    }

    // soft key + dim fill, matching the source's gradient-lit glossy look
    // (the light->dark shading is mostly baked into the sticker textures
    // above; these lights mainly add the specular "candy plastic" pop)
    scene.add(new THREE.AmbientLight(0xffffff, 1.4));
    const key = new THREE.PointLight(0xffffff, 60, 0, 2);
    key.position.set(2.6, 3, 4.4);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xffffff, 1.2);
    fill.position.set(-3, -2, -2);
    scene.add(fill);

    // --- whole-cube tumble: auto-spin, drag-to-spin, pointer parallax ---
    // The scroll-driven solve twists below are user-controlled (tied to
    // scroll position), so they're left alone; only the autonomous idle
    // spin/breathing — which runs continuously with no user action — is
    // gated behind the OS-level motion preference, since it's driven by
    // rAF rather than CSS and isn't covered by the app.css reduced-motion
    // block.
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let pointerX = 0;
    let pointerY = 0;
    let dragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let lastX = 0;
    let lastY = 0;
    let velX = prefersReducedMotion ? 0 : 0.004;
    let velY = prefersReducedMotion ? 0 : 0.007;

    // --- Sleep mode for inactivity ---
    let sleepTimer;
    function resetSleep() {
      isSleeping = false;
      clearTimeout(sleepTimer);
      sleepTimer = setTimeout(() => {
        isSleeping = true;
      }, 5000);
    }
    window.addEventListener('pointermove', resetSleep);
    window.addEventListener('scroll', resetSleep);
    window.addEventListener('keydown', resetSleep);
    resetSleep();

    function onPointerMove(e) {
      wakeUp();
      const rect = container.getBoundingClientRect();
      pointerX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointerY = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      if (dragging) {
        velY = (e.clientX - lastX) * 0.005;
        velX = (e.clientY - lastY) * 0.005;
        lastX = e.clientX;
        lastY = e.clientY;
      }
    }
    function onPointerDown(e) {
      wakeUp();
      dragging = true;
      container.setPointerCapture?.(e.pointerId);
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      lastX = e.clientX;
      lastY = e.clientY;
    }
    function onPointerUp(e) {
      dragging = false;
      container.releasePointerCapture?.(e.pointerId);
      if (e && Math.hypot(e.clientX - dragStartX, e.clientY - dragStartY) < 6) {
        handleCubeClick();
      }
    }

    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerdown', onPointerDown);
    container.addEventListener('pointerup', onPointerUp);

    function resize() {
      if (!container) return;
      const { clientWidth: w, clientHeight: h } = container;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    // --- layer twists: real Rubik's-cube face turns ---

    let twist = null;
    let nextTwistAt = scrollMode ? performance.now() : performance.now() + 500;
    const TWIST_MS = 420;
    const PAUSE_MS = 320;
    const REST_MS = 1400; // pause once fully scrambled / fully solved (autonomous mode only)
    const SCRAMBLE_COUNT = 14;
    const RANDOM_SHOW_MOVES = 8; // shorter flourish than a full autonomous-mode cycle

    // autonomous-mode-only state: scramble for SCRAMBLE_COUNT twists, then
    // replay them inverted to solve, on a timer, forever. Also reused by
    // randomSolve's scramble-then-solve show (see queueNextTwist) — the two
    // never run at once, since randomSolve only fires on cubes that are
    // otherwise sitting still (progress fixed, or autonomous mode itself).
    let phase = 'scramble';
    let history = [];

    // randomSolve-only state: true for the duration of one scramble+solve
    // flourish, independent of scrollMode/progress.
    let randomShowActive = false;
    let randomSolveTimer;

    // 0 = solved (fully calm brand colors), 1 = fully scrambled (fully
    // chaos-tinted) — shared by both modes, since appliedCount/history.length
    // already carry the same 0..SCRAMBLE_COUNT meaning in each.
    function currentChaosT() {
      if (randomShowActive) return history.length / RANDOM_SHOW_MOVES;
      return (scrollMode ? appliedCount : history.length) / SCRAMBLE_COUNT;
    }
    function repaintStickers() {
      const t = currentChaosT();
      if (plasticCtxRef && plasticTextureRef) {
        plasticCtxRef.fillStyle = seamColor;
        plasticCtxRef.fillRect(0, 0, 64, 64);
        plasticTextureRef.needsUpdate = true;
      }
      for (const repaint of stickerRepaints) repaint(t);
    }

    // scroll-mode-only state: a fixed scramble sequence generated once, then
    // driven by how many of its moves are currently "applied" — 0 applied
    // = solved, SCRAMBLE_COUNT applied = fully scrambled (progress 0)
    const scrambleMoves = [];
    let appliedCount = 0;
    if (scrollMode) {
      for (let i = 0; i < SCRAMBLE_COUNT; i++) {
        scrambleMoves.push({
          axis: AXES[(Math.random() * 3) | 0],
          layer: ((Math.random() * 3) | 0) - 1,
          dir: Math.random() < 0.5 ? 1 : -1,
        });
      }
    }

    function applyMoveInstant(axis, layer, dir) {
      const axisVec = axisVectors[axis];
      const q = new THREE.Quaternion().setFromAxisAngle(axisVec, dir * (Math.PI / 2));
      for (const c of cubies) {
        if (c[axis] !== layer) continue;
        c.mesh.position.applyAxisAngle(axisVec, dir * (Math.PI / 2));
        c.mesh.quaternion.premultiply(q);
        const rotated = rotateGrid({ x: c.x, y: c.y, z: c.z }, axis, dir);
        c.x = rotated.x;
        c.y = rotated.y;
        c.z = rotated.z;
        c.mesh.position.set(c.x * UNIT, c.y * UNIT, c.z * UNIT);
        c.mesh.quaternion.normalize();
      }
    }

    if (scrollMode) {
      // snap straight to the fully-scrambled starting state, no animation —
      // the very first frame should already look chaotic at progress 0
      for (const move of scrambleMoves) applyMoveInstant(move.axis, move.layer, move.dir);
      appliedCount = SCRAMBLE_COUNT;
    }

    function beginTwist(now, axis, layer, dir, appliedDelta = 0) {
      const affected = cubies.filter((c) => c[axis] === layer);
      twist = {
        axis,
        dir,
        affected,
        appliedDelta,
        startTime: now,
        initial: affected.map((c) => ({
          pos: c.mesh.position.clone(),
          quat: c.mesh.quaternion.clone(),
        })),
      };
    }

    function queueNextTwist(now) {
      if (randomShowActive) {
        if (phase === 'scramble') {
          if (history.length >= RANDOM_SHOW_MOVES) {
            phase = 'solve';
            nextTwistAt = now + REST_MS;
            return;
          }
          const axis = AXES[(Math.random() * 3) | 0];
          const layer = ((Math.random() * 3) | 0) - 1;
          const dir = Math.random() < 0.5 ? 1 : -1;
          history.push({ axis, layer, dir });
          beginTwist(now, axis, layer, dir);
        } else {
          if (history.length === 0) {
            randomShowActive = false;
            phase = 'scramble';
            scheduleRandomSolve();
            return;
          }
          const move = history.pop();
          beginTwist(now, move.axis, move.layer, -move.dir);
        }
        return;
      }
      if (scrollMode) {
        const target = Math.max(0, Math.min(SCRAMBLE_COUNT, Math.round((1 - liveProgress) * SCRAMBLE_COUNT)));
        if (target === appliedCount) return;
        if (target < appliedCount) {
          // scrolled further down: undo the most recently applied move
          const move = scrambleMoves[appliedCount - 1];
          beginTwist(now, move.axis, move.layer, -move.dir, -1);
        } else {
          // scrolled back up: re-apply the next move in the sequence
          const move = scrambleMoves[appliedCount];
          beginTwist(now, move.axis, move.layer, move.dir, 1);
        }
        return;
      }
      if (phase === 'scramble') {
        if (history.length >= SCRAMBLE_COUNT) {
          phase = 'solve';
          nextTwistAt = now + REST_MS;
          return;
        }
        const axis = AXES[(Math.random() * 3) | 0];
        const layer = ((Math.random() * 3) | 0) - 1;
        const dir = Math.random() < 0.5 ? 1 : -1;
        history.push({ axis, layer, dir });
        beginTwist(now, axis, layer, dir);
      } else {
        if (history.length === 0) {
          phase = 'scramble';
          nextTwistAt = now + REST_MS;
          return;
        }
        const move = history.pop();
        beginTwist(now, move.axis, move.layer, -move.dir);
      }
    }

    function updateTwist(now) {
      if (!twist) {
        if (now >= nextTwistAt) queueNextTwist(now);
        return;
      }
      const t = Math.min(1, (now - twist.startTime) / TWIST_MS);
      const eased = easeInOutQuad(t);
      const theta = twist.dir * (Math.PI / 2) * eased;
      const axisVec = axisVectors[twist.axis];
      const q = new THREE.Quaternion().setFromAxisAngle(axisVec, theta);
      // fastest mid-twist (eased' peaks at t=0.5) is where the blur should
      // be most visible; fade trails out near the start/end of the move
      const speed = Math.sin(Math.min(t, 1) * Math.PI);
      for (let i = 0; i < twist.affected.length; i++) {
        const c = twist.affected[i];
        const init = twist.initial[i];
        c.mesh.position.copy(init.pos).applyAxisAngle(axisVec, theta);
        c.mesh.quaternion.copy(q).multiply(init.quat);

        for (let k = 0; k < TRAIL_STEPS.length; k++) {
          const step = TRAIL_STEPS[k];
          const tLag = Math.max(0, Math.min(1, (now - step.lagMs - twist.startTime) / TWIST_MS));
          const thetaLag = twist.dir * (Math.PI / 2) * easeInOutQuad(tLag);
          const qLag = new THREE.Quaternion().setFromAxisAngle(axisVec, thetaLag);
          const ghost = c.trail[k];
          ghost.mesh.visible = true;
          ghost.mesh.position.copy(init.pos).applyAxisAngle(axisVec, thetaLag);
          ghost.mesh.quaternion.copy(qLag).multiply(init.quat);
          const opacity = step.opacity * speed;
          ghost.materials.forEach((m) => { m.opacity = opacity; });
        }
      }
      if (t >= 1) {
        for (const c of twist.affected) {
          const rotated = rotateGrid({ x: c.x, y: c.y, z: c.z }, twist.axis, twist.dir);
          c.x = rotated.x;
          c.y = rotated.y;
          c.z = rotated.z;
          c.mesh.position.set(c.x * UNIT, c.y * UNIT, c.z * UNIT);
          c.mesh.quaternion.normalize();
          c.trail.forEach((ghost) => { ghost.mesh.visible = false; });
        }
        if (randomShowActive) {
          twist = null;
          nextTwistAt = now + PAUSE_MS;
        } else if (scrollMode) {
          appliedCount += twist.appliedDelta;
          twist = null;
          nextTwistAt = now; // no rest pause — chain straight into the next catch-up move
        } else {
          twist = null;
          nextTwistAt = now + PAUSE_MS;
        }
        repaintStickers();
      }
    }

    // randomSolve: fire a scramble-then-solve show at a random interval
    // (15-45s), skipping the wait entirely if the cube is mid-interaction
    // (dragging or already twisting) and just trying again shortly after.
    function scheduleRandomSolve() {
      if (!randomSolve) return;
      clearTimeout(randomSolveTimer);
      const delay = 15000 + Math.random() * 30000;
      randomSolveTimer = setTimeout(() => {
        if (dragging || twist || randomShowActive) {
          randomSolveTimer = setTimeout(() => scheduleRandomSolve(), 2000);
          return;
        }
        randomShowActive = true;
        phase = 'scramble';
        history = [];
        nextTwistAt = performance.now();
      }, delay);
    }

    let frameId;
    function animate() {
      frameId = requestAnimationFrame(animate);
      const now = performance.now();
      updateTwist(now);

      if (!dragging && now - lastActivityTime > 20000) {
        isSleeping = true;
      }

      if (prefersReducedMotion) {
        cubeGroup.scale.set(1, 1, 1);
      } else if (!dragging) {
        if (isSleeping) {
          velX += (0.001 - velX) * 0.02;
          velY += (0.0018 - velY) * 0.02;
          const breath = 1 + Math.sin(now * 0.002) * 0.04;
          cubeGroup.scale.set(breath, breath, breath);
        } else {
          // Concept 3 (concept.txt): "Stress Level ... cube spins rapidly
          // ... as user scrolls ... cube slows." Idle tumble speed eases
          // toward a target scaled by chaosT (0 = solved/calm, 1 =
          // scrambled/stressed) instead of a fixed constant, so the cube
          // itself visibly calms as the site's own stress meter drains —
          // not just its sticker colors (repaintStickers already does that).
          const stressT = scrollMode ? currentChaosT() : 1;
          const targetVelX = 0.004 * (0.4 + 0.6 * stressT);
          const targetVelY = 0.007 * (0.4 + 0.6 * stressT);
          velX += (targetVelX - velX) * 0.02;
          velY += (targetVelY - velY) * 0.02;
          cubeGroup.scale.set(1, 1, 1);
        }
      } else {
        cubeGroup.scale.set(1, 1, 1);
      }
      if (!prefersReducedMotion || dragging) {
        cubeGroup.rotation.x += velX;
        cubeGroup.rotation.y += velY;
      }

      camera.position.x += (pointerX * 0.6 - camera.position.x) * 0.04;
      camera.position.y += (-pointerY * 0.6 - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);

      // Dim lights when sleeping
      const targetFill = isSleeping ? 0.3 : 1.2;
      const targetKey = isSleeping ? 15 : 60;
      fill.intensity += (targetFill - fill.intensity) * 0.05;
      key.intensity += (targetKey - key.intensity) * 0.05;

      renderer.render(scene, camera);
    }

    let isVisible = true;
    const observer = new IntersectionObserver((entries) => {
      isVisible = entries[0].isIntersecting;
      if (isVisible && !document.hidden && !frameId) {
        lastActivityTime = performance.now(); // avoid waking up in sleep
        animate();
      } else if (!isVisible && frameId) {
        cancelAnimationFrame(frameId);
        frameId = null;
      }
    });
    observer.observe(container);

    function handleVisibility() {
      if (document.hidden || !isVisible) {
        if (frameId) {
          cancelAnimationFrame(frameId);
          frameId = null;
        }
      } else if (!frameId) {
        lastActivityTime = performance.now();
        animate();
      }
    }
    document.addEventListener('visibilitychange', handleVisibility);

    scheduleRandomSolve();

    onDestroy(() => {
      if (frameId) cancelAnimationFrame(frameId);
      document.removeEventListener('visibilitychange', handleVisibility);
      observer.disconnect();
      clearTimeout(sleepTimer);
      clearTimeout(nudgeTimer);
      clearTimeout(randomSolveTimer);
      ro.disconnect();
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerdown', onPointerDown);
      container.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointermove', resetSleep);
      window.removeEventListener('scroll', resetSleep);
      window.removeEventListener('keydown', resetSleep);
      geometry.dispose();
      disposableMaterials.forEach((m) => m.dispose());
      disposableTextures.forEach((t) => t.dispose());
      renderer.dispose();
    });
  });
</script>

<div class="cube-stage" class:allow-scroll={progress !== null} bind:this={container}>
  <canvas bind:this={canvas}></canvas>

  {#if isSleeping}
    <div class="sleep-badge" aria-hidden="true">
      <span class="zzz">zZz</span>
      <span class="sleep-text">Cube sleeping · Click or drag to wake</span>
    </div>
  {/if}

  {#if showNudge}
    <div class="nudge-tooltip" role="status">psst — try clicking me 👀</div>
  {/if}

</div>

<style>
  .cube-stage {
    position: relative;
    width: 100%;
    height: 100%;
    touch-action: none;
    cursor: grab;
  }
  /* in scroll-driven mode, don't block vertical page scroll on touch —
     drag-to-spin still works via pointer events, just not touch panning */
  .cube-stage.allow-scroll {
    touch-action: pan-y;
  }
  .cube-stage:active {
    cursor: grabbing;
  }
  canvas {
    display: block;
    width: 100%;
    height: 100%;
  }

  .sleep-badge {
    position: absolute;
    bottom: 0.75rem;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(24, 24, 24, 0.82);
    backdrop-filter: blur(8px);
    padding: 0.35rem 0.8rem;
    border-radius: 999px;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    pointer-events: none;
    animation: fadeIn 0.4s ease;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    /* Fixed-size flex row + border-radius:999px only reads as a pill when
       its content stays on one line — on narrow cube-slot widths the two
       spans used to wrap internally, ballooning the pill into a tall blob
       that covered most of the cube. width:max-content lets the pill size
       to its (now single-line) content and overflow the cube's bounds
       instead of growing to fill them. */
    width: max-content;
    max-width: none;
    white-space: nowrap;
  }
  .zzz {
    font-weight: 700;
    font-size: 0.75rem;
    color: var(--pink-deep, #fc9ce0);
  }
  .sleep-text {
    font-size: clamp(0.56rem, 2vw, 0.68rem);
    color: #f6f4f1;
    letter-spacing: 0.04em;
  }

  .nudge-tooltip {
    position: absolute;
    bottom: calc(100% + 0.6rem);
    left: 50%;
    transform: translateX(-50%);
    background: var(--ink, #181818);
    color: #f6f4f1;
    font-size: 0.72rem;
    font-weight: 500;
    white-space: nowrap;
    padding: 0.45rem 0.85rem;
    border-radius: 999px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
    pointer-events: none;
    animation: nudgeFloat 0.4s var(--ease-out-expo);
  }
  .nudge-tooltip::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 5px solid transparent;
    border-top-color: var(--ink, #181818);
  }
  @keyframes nudgeFloat {
    from { opacity: 0; transform: translateX(-50%) translateY(6px); }
    to { opacity: 1; transform: translateX(-50%) translateY(0); }
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: scale(0.96); }
    to { opacity: 1; transform: scale(1); }
  }
</style>
