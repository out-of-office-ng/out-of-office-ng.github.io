/* The shallows — Out of Office's arrival scene.
 *
 * Ported from the standalone prototype (deepseek_1.html, ~1.7k lines). The
 * scene, shader and procedural-audio code is kept as it was; only the edges
 * that touched the page changed:
 *   - renders into `container` (sized by it, ResizeObserver), not the window
 *   - no wheel zoom (it hijacked page scroll); canvas touch-action: pan-y
 *   - no demo toolbar: explore mode + auto quality, fixed ocean volume
 *   - sound follows the site mute store via setSound(); armed on first gesture
 *   - #notice / intro fade become onStatus / onInteract callbacks
 *   - three is bundled (r185) instead of unpkg r160
 *
 * One non-obvious thing to protect: the visible pass renders ONLY layer 1
 * (sky + water). Boat, fish, stones etc. reach the screen through the
 * refraction render target, composited by the depth test in the water
 * shader. Don't add objects to layer 1 to "fix" visibility.
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export function createShallows(container, { sound = true, initialMode = 'preview', onStatus = () => {}, onInteract = () => {}, onBoatEgg = () => {} } = {}) {
const viewW = () => Math.max(1, container.clientWidth);
const viewH = () => Math.max(1, container.clientHeight);

/* ==========================================================================
   Settings
   ========================================================================== */
const SETTINGS = {
  waterLevel: 1, seed: 2718, rocks: 72,
  // Base wave energy. The wave envelope multiplies this between ~0.42 (lull)
  // and ~2.15 (set), so peak turbulence is roughly 5× the calm state.
  waveStrength: .65, speed: 1,
  // Wave envelope: a slow breathing cycle. ~27 s period, with a main set
  // peaking near 0.30 of the cycle and a smaller second set at 0.68.
  waveSets: { period: 27.0, mainCenter: 0.30, mainWidth: 0.16, secondCenter: 0.68, secondWidth: 0.12, secondStrength: 0.65 },
  surf: { interval: 14, separation: 3.6, speed: 3.4, height: .48, width: 1.45, direction: [.28, .96] },
  absorption: [0.055, 0.012, 0.008],
  deepColor: [0.18, 0.36, 0.38],
  sssColor: [0.34, 0.58, 0.44],
  quality: {
    auto: { dpr: 2, pixels: 3500000, refraction: .85, segments: 128 },
    high: { dpr: 2, pixels: 7000000, refraction: 1, segments: 160 },
    low:  { dpr: 1, pixels: 800000, refraction: .6, segments: 64 },
  },
  dynamicScale: { enabled: true, min: .5, max: 1.0, targetMs: 16.6, sampleCount: 45, cooldownMs: 1800 },
};
// Two editorial views share one scene. Preview starts quieter and leaves
// the water behind the site's copy; Explore enables direct input.
let mode = initialMode === 'explore' ? 'explore' : 'preview';
const quality = 'auto';
const qualitySettings = SETTINGS.quality[quality];
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
let paused = motionPreference.matches;
let disposed = false, inView = true, contextLost = false;

/* ==========================================================================
   Renderer / scene / camera
   ========================================================================== */
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
} catch (err) {
  console.error('Renderer creation failed', err);
  onStatus({ kind: 'failed', message: 'This browser could not start the water scene.' });
  throw err;
}
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;
renderer.setPixelRatio(Math.min(window.devicePixelRatio, qualitySettings.dpr));
renderer.setSize(viewW(), viewH());
renderer.domElement.setAttribute('aria-label', 'A sunlit coastal pool with swimming fish, sea stars, shells and a pink paper boat. Tap for ripples, drag sideways to look around, or use the arrow keys.');
renderer.domElement.setAttribute('role', 'img');
renderer.domElement.tabIndex = 0;
renderer.domElement.className = 'shallows-canvas';
container.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const horizonColor = new THREE.Color(0.68, 0.82, 0.86);
renderer.setClearColor(horizonColor, 1);
scene.background = horizonColor;
scene.fog = new THREE.Fog(horizonColor, 30, 85);

const camera = new THREE.PerspectiveCamera(52, viewW() / viewH(), 0.1, 300);
camera.position.set(3.2, 9.8, 12.0);

/* Orbit controls — drag only. The standalone file ran a custom wheel zoom
   that called preventDefault() on every wheel event; on a scrolling page that
   traps the scroll wheel over a full-viewport section, so zoom is off. */
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0.4, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.enablePan = false;
controls.enableZoom = false;
controls.maxPolarAngle = THREE.MathUtils.degToRad(72);
controls.minPolarAngle = THREE.MathUtils.degToRad(8);
controls.minDistance = 2.5;
controls.maxDistance = 20;
// OrbitControls.connect() sets touch-action: none on the canvas
// (three r185, OrbitControls.js:508), which would make the page impossible to
// scroll past the scene on touch devices. pan-y hands vertical swipes back to
// the browser; horizontal drags still orbit and taps still ripple.
renderer.domElement.style.touchAction = 'pan-y';
// With zoom off, OrbitControls' wheel listener never acts, but it's registered
// { passive: false } — and a non-passive wheel listener makes the browser wait
// on the main thread before scrolling (verified here: the page scroll over the
// canvas stalled behind the render loop). Drop it. `_onMouseWheel` is r185's
// bound handler (OrbitControls.js:443/503); guarded in case three renames it.
if (typeof controls._onMouseWheel === 'function') {
  renderer.domElement.removeEventListener('wheel', controls._onMouseWheel);
}


/* ==========================================================================
   Lights
   ========================================================================== */
const sunDir = new THREE.Vector3(0.5, 0.8, 0.3).normalize();
const sun = new THREE.DirectionalLight(0xffedd3, 2.3);
sun.position.copy(sunDir).multiplyScalar(20);
scene.add(sun);
scene.add(new THREE.HemisphereLight(0xbfd9ff, 0x6b5f4f, 1.15));

/* ==========================================================================
   Shared uniforms
   ========================================================================== */
const timeU = { value: 0 };
const waterLevelU = { value: SETTINGS.waterLevel };
const waveStrengthU = { value: SETTINGS.waveStrength };
// Envelope in [0, 1]. 0 = flat calm, 1 = full set. Multiplied by the shader
// into a chop gain (~0.42–2.15×) and a swell gain (~0.75–1.35×).
const waveEnvelopeU = { value: 0 };
const surfFrontU = { value: new THREE.Vector2() };
const surfHeightU = { value: SETTINGS.surf.height };
const surfDirectionU = { value: new THREE.Vector2(...SETTINGS.surf.direction).normalize() };

// Current envelope-derived gains, kept in JS so the boat and any other CPU
// sampler stays in sync with the vertex shader exactly.
const gains = { chop: 1.0, swell: 1.0 };

function updateSurf() {
  const { interval, separation, speed } = SETTINGS.surf;
  const phase = timeU.value + 5;
  const center = t => (((t % interval) + interval) % interval) * speed - interval * speed * .5;
  surfFrontU.value.set(center(phase), center(phase - separation));
}

// Smooth envelope: two overlapping Gaussian bumps per cycle.
// Returns 0 at the deepest lull, 1 at the peak of the main set.
function computeWaveEnvelope(t) {
  const s = SETTINGS.waveSets;
  const phase = (((t % s.period) + s.period) % s.period) / s.period;
  const main = Math.exp(-Math.pow((phase - s.mainCenter) / s.mainWidth, 2));
  const second = s.secondStrength * Math.exp(-Math.pow((phase - s.secondCenter) / s.secondWidth, 2));
  return Math.min(1, Math.max(main, second));
}

function updateWaveEnvelope() {
  const env = computeWaveEnvelope(timeU.value);
  waveEnvelopeU.value = env;
  gains.chop = 0.42 + 1.73 * env;
  gains.swell = 0.75 + 0.60 * env;
}

/* ==========================================================================
   Sky dome
   ========================================================================== */
const skyMat = new THREE.ShaderMaterial({
  side: THREE.BackSide,
  depthWrite: false,
  uniforms: {
    uSunDir: { value: sunDir },
    uHorizonColor: { value: horizonColor },
  },
  vertexShader: `
    varying vec3 vDir;
    void main() {
      vDir = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 uSunDir;
    uniform vec3 uHorizonColor;
    varying vec3 vDir;
    void main() {
      vec3 d = normalize(vDir);
      float t = clamp(d.y, 0.0, 1.0);
      vec3 col = mix(uHorizonColor, vec3(0.22, 0.52, 0.76), pow(t, 0.7)) * 1.15;
      col += vec3(1.0, 0.96, 0.88) * pow(max(dot(d, uSunDir), 0.0), 380.0) * 1.2;
      col += vec3(1.0, 0.90, 0.78) * pow(max(dot(d, uSunDir), 0.0), 12.0) * 0.18;
      gl_FragColor = vec4(col, 1.0);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }
  `,
});
const sky = new THREE.Mesh(new THREE.SphereGeometry(180, 32, 16), skyMat);
sky.renderOrder = -1;
sky.layers.enable(1);
scene.add(sky);

/* ==========================================================================
   Audio
   ========================================================================== */
let oceanAudio = null, soundEnabled = !!sound, volume = .4;
let audioRevision = 0, audioSuspendTimer = 0, lastAudioUpdate = -Infinity;

function createOceanAudio() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) throw new Error('Ocean sound is not supported by this browser.');
  const context = new AudioContextClass({ latencyHint: 'playback' });
  try {
    const sampleRate = 22050;
    const cycleSeconds = SETTINGS.surf.interval;
    const frameCount = Math.round(sampleRate * cycleSeconds);
    const buffer = context.createBuffer(2, frameCount, sampleRate);
    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      let noiseSeed = 1406 + channel * 7919;
      let lowRumble = 0, bodyNoise = 0;
      const softStep = (a, b, x) => {
        const q = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1);
        return q * q * (3 - 2 * q);
      };
      const waveWash = (t, center) => {
        const approach = softStep(center - 2.25, center - .05, t);
        const fall = Math.exp(-Math.max(0, t - center) * .52);
        return approach * fall;
      };
      for (let i = 0; i < data.length; i++) {
        noiseSeed = (Math.imul(noiseSeed, 1664525) + 1013904223) >>> 0;
        const white = noiseSeed / 2147483648 - 1;
        const t = i / sampleRate;
        lowRumble += .018 * (white - lowRumble);
        bodyNoise += .14 * (white - bodyNoise);
        const foamNoise = white - bodyNoise;
        const surf = Math.min(1, waveWash(t, 2) + .88 * waveWash(t, 2 + SETTINGS.surf.separation));
        const smallLaps = .72 + .18 * Math.sin(t * 2.17 + channel * .7) + .10 * Math.sin(t * 3.91 + channel * 1.3);
        const rumble = lowRumble * (.12 + .28 * surf);
        const rollingWater = (bodyNoise - lowRumble * .22) * (.045 + .30 * surf);
        const breakingFoam = foamNoise * (.012 + .19 * surf) * smallLaps;
        const sample = rumble + rollingWater + breakingFoam;
        data[i] = Math.tanh(sample * 1.8) / 1.8;
      }
      const seamFrames = Math.round(sampleRate * .09);
      for (let i = 0; i < seamFrames; i++) {
        const mix = i / seamFrames;
        const tail = frameCount - seamFrames + i;
        data[tail] = data[tail] * (1 - mix) + data[i] * mix;
      }
    }
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const bodyFilter = context.createBiquadFilter();
    bodyFilter.type = 'lowpass'; bodyFilter.frequency.value = 220; bodyFilter.Q.value = .5;
    const bodyFormant = context.createBiquadFilter();
    bodyFormant.type = 'peaking'; bodyFormant.frequency.value = 175; bodyFormant.Q.value = .8; bodyFormant.gain.value = 2;
    const bodyGain = context.createGain();
    bodyGain.gain.value = .12;
    const washHighpass = context.createBiquadFilter();
    washHighpass.type = 'highpass'; washHighpass.frequency.value = 280; washHighpass.Q.value = .5;
    const washFilter = context.createBiquadFilter();
    washFilter.type = 'lowpass'; washFilter.frequency.value = 1100; washFilter.Q.value = .5;
    const washFormant = context.createBiquadFilter();
    washFormant.type = 'peaking'; washFormant.frequency.value = 1800; washFormant.Q.value = .75; washFormant.gain.value = 2;
    const washGain = context.createGain();
    washGain.gain.value = .025;
    const master = context.createGain();
    master.gain.value = 0;
    const limiter = context.createDynamicsCompressor();
    limiter.threshold.value = -12; limiter.knee.value = 20; limiter.ratio.value = 8;
    source.connect(bodyFilter).connect(bodyFormant).connect(bodyGain).connect(master);
    source.connect(washHighpass).connect(washFilter).connect(washFormant).connect(washGain).connect(master);
    master.connect(limiter).connect(context.destination);
    source.playbackRate.value = SETTINGS.speed;
    source.start(0, timeU.value % cycleSeconds);
    return { context, source, buffer, bodyFilter, bodyFormant, bodyGain, washHighpass, washFilter, washFormant, washGain, master, limiter };
  } catch (err) {
    try { context.close(); } catch {}
    throw err;
  }
}

function wantsAudio() { return soundEnabled && volume > 0 && running && !disposed; }


function audioFailed() {
  if (disposed) return;
  soundEnabled = false;
  onStatus({ kind: 'sound-failed', message: 'The ocean sound could not start in this browser.' });
  if (oceanAudio) {
    oceanAudio.master.gain.setValueAtTime(0, oceanAudio.context.currentTime);
    try { oceanAudio.context.suspend(); } catch {}
  }
}

function updateOceanAudio(force = false) {
  if (!oceanAudio || !wantsAudio() || oceanAudio.context.state !== 'running') return;
  const { context, bodyGain, bodyFilter, bodyFormant, washGain, washFilter, washFormant } = oceanAudio;
  const now = context.currentTime;
  if (!force && now - lastAudioUpdate < .05) return;
  lastAudioUpdate = now;
  const [dx, dz] = SETTINGS.surf.direction;
  const len = Math.hypot(dx, dz);
  const camAlong = (camera.position.x * dx + camera.position.z * dz) / len;
  const wash = distance => Math.exp(-Math.pow(distance / (distance < 0 ? 3.8 : 7.5), 2));
  // Mix the surf-front proximity with the wave envelope so the audio swells
  // with the same rhythm the visuals use.
  const env = waveEnvelopeU.value;
  const frontSurge = wash(surfFrontU.value.x - camAlong) + .78 * wash(surfFrontU.value.y - camAlong);
  const surge = Math.min(1, frontSurge * (0.55 + 0.70 * env) + env * 0.30);
  bodyGain.gain.setTargetAtTime(.10 + surge * .2, now, .18);
  bodyFilter.frequency.setTargetAtTime(180 + surge * 100, now, .2);
  bodyFormant.frequency.setTargetAtTime(135 + surge * 70, now, .2);
  bodyFormant.gain.setTargetAtTime(1.5 + surge * 1.5, now, .2);
  washGain.gain.setTargetAtTime(.02 + surge * .42, now, .12);
  washFilter.frequency.setTargetAtTime(1200 + surge * 2000, now, .2);
  washFormant.frequency.setTargetAtTime(1300 + surge * 1300, now, .2);
  washFormant.gain.setTargetAtTime(1 + surge * 2, now, .18);
}

function syncOceanAudio() {
  if (!oceanAudio || oceanAudio.context.state === 'closed') return;
  const revision = ++audioRevision;
  clearTimeout(audioSuspendTimer);
  const { context, master } = oceanAudio;
  if (wantsAudio()) {
    context.resume().then(() => {
      if (revision !== audioRevision || !wantsAudio()) return;
      updateOceanAudio(true);
      master.gain.cancelScheduledValues(context.currentTime);
      master.gain.setTargetAtTime(volume * .7 * (mode === 'explore' ? 1 : .8), context.currentTime, .09);
    }).catch(() => { if (revision === audioRevision) audioFailed(); });
  } else {
    master.gain.cancelScheduledValues(context.currentTime);
    master.gain.setTargetAtTime(0, context.currentTime, .04);
    audioSuspendTimer = setTimeout(() => {
      if (revision === audioRevision && !wantsAudio() && context.state !== 'closed') {
        try { context.suspend(); } catch {}
      }
    }, 240);
  }
}

function disposeOceanAudio() {
  ++audioRevision;
  clearTimeout(audioSuspendTimer);
  if (!oceanAudio) return;
  const { context, source } = oceanAudio;
  try { source.stop(); } catch {}
  for (const node of Object.values(oceanAudio)) if (node && node.disconnect) { try { node.disconnect(); } catch {} }
  try { context.close(); } catch {}
  oceanAudio = null;
}

/* ==========================================================================
   Geometry helpers
   ========================================================================== */
function stretchEdges(geometry) {
  const pos = geometry.attributes.position;
  const stretch = n => Math.abs(n) <= 16 ? n : Math.sign(n) * (16 + Math.pow((Math.abs(n) - 16) / 4, 2) * 130);
  for (let i = 0; i < pos.count; i++) { pos.setX(i, stretch(pos.getX(i))); pos.setZ(i, stretch(pos.getZ(i))); }
}

function preparePart(g, fallbackColor = 0xffffff) {
  let geo = g.index ? g.toNonIndexed() : g.clone();
  if (!geo.attributes.normal) geo.computeVertexNormals();
  const count = geo.attributes.position.count;
  if (!geo.attributes.color) {
    const c = new THREE.Color(fallbackColor);
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) { arr[i*3] = c.r; arr[i*3+1] = c.g; arr[i*3+2] = c.b; }
    geo.setAttribute('color', new THREE.BufferAttribute(arr, 3));
  }
  return geo;
}

function mergeParts(parts, fallbackColor = 0xffffff) {
  const prepared = parts.map(p => preparePart(p, fallbackColor));
  let total = 0;
  for (const p of prepared) total += p.attributes.position.count;
  const pos = new Float32Array(total * 3);
  const nrm = new Float32Array(total * 3);
  const col = new Float32Array(total * 3);
  let off = 0;
  for (const p of prepared) {
    pos.set(p.attributes.position.array, off * 3);
    nrm.set(p.attributes.normal.array, off * 3);
    col.set(p.attributes.color.array, off * 3);
    off += p.attributes.position.count;
    p.dispose();
  }
  const merged = new THREE.BufferGeometry();
  merged.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  merged.setAttribute('normal', new THREE.BufferAttribute(nrm, 3));
  merged.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return merged;
}

function triangles(vertices, color) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(vertices.flat(), 3));
  g.computeVertexNormals();
  return preparePart(g, color);
}

/* ==========================================================================
   Riverbed
   ========================================================================== */
function bedHeight(x, z) {
  return -.18 - .42 * Math.exp(-(x*x+z*z)/38) + 0.16 * Math.sin(x * 0.35) * Math.sin(z * 0.3)
       + 0.10 * Math.sin(x * 1.1 + 1.7) * Math.sin(z * 0.9 + 0.6);
}

const shadeCanvas = document.createElement('canvas');
shadeCanvas.width = shadeCanvas.height = 1024;
const shadeContext = shadeCanvas.getContext('2d');
shadeContext.fillStyle = '#fff';
shadeContext.fillRect(0, 0, 1024, 1024);
const bedShade = new THREE.CanvasTexture(shadeCanvas);
bedShade.flipY = false;

function makeFoamNoise() {
  const size = 128;
  const data = new Uint8Array(size * size * 4);
  const hash = (x, y, cells) => {
    let n = Math.imul((x % cells) + 37, 374761393) ^ Math.imul((y % cells) + 91, 668265263);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
  };
  function noise(x, y, cells) {
    const px = x / size * cells, py = y / size * cells;
    const ix = Math.floor(px), iy = Math.floor(py);
    let u = px - ix, v = py - iy;
    u = u * u * (3 - 2 * u); v = v * v * (3 - 2 * v);
    const a = hash(ix, iy, cells) * (1 - u) + hash(ix + 1, iy, cells) * u;
    const b = hash(ix, iy + 1, cells) * (1 - u) + hash(ix + 1, iy + 1, cells) * u;
    return a * (1 - v) + b * v;
  }
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const i = (y * size + x) * 4;
    data[i] = Math.round(noise(x, y, 16) * 255);
    data[i + 1] = Math.round(noise(x, y, 64) * 255);
    data[i + 2] = Math.round(noise(x, y, 32) * 255);
    data[i + 3] = 255;
  }
  const texture = new THREE.DataTexture(data, size, size);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  return texture;
}
const foamNoise = makeFoamNoise();

function addCaustics(mat, isBed = false) {
  mat.customProgramCacheKey = () => isBed ? 'bed-caustics-v10' : 'rock-caustics-v10';
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = timeU;
    shader.uniforms.uWaterLevel = waterLevelU;
    if (isBed) shader.uniforms.tBedShade = { value: bedShade };
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vCausticPos;')
      .replace('#include <project_vertex>', `
        vec4 causticPosition = vec4(transformed, 1.0);
        #ifdef USE_INSTANCING
          causticPosition = instanceMatrix * causticPosition;
        #endif
        vCausticPos = (modelMatrix * causticPosition).xyz;
        #include <project_vertex>`);
    let frag = shader.fragmentShader
      .replace('#include <common>',
        '#include <common>\nuniform float uTime;\nuniform float uWaterLevel;\nvarying vec3 vCausticPos;\n' + (isBed ? 'uniform sampler2D tBedShade;\n' : ''))
      .replace('#include <color_fragment>', `#include <color_fragment>
      {
        float under = 1.0 - smoothstep(uWaterLevel - 0.05, uWaterLevel + 0.05, vCausticPos.y);
        vec2 cp = vCausticPos.xz * 2.0;
        float t = uTime * .65;
        float w1 = sin(cp.x * 1.3 + sin(cp.y * 1.6 + t) + t);
        float w2 = sin(cp.y * 1.5 + sin(cp.x * 1.2 - t * .8) - t);
        float c = pow(1.0 - abs(w1 * w2), 22.0);
        float depthBelow = max(uWaterLevel - vCausticPos.y, 0.0);
        diffuseColor.rgb += c * under * exp(-depthBelow * .18) * vec3(0.34, 0.40, 0.30);
        ${isBed ? 'diffuseColor.rgb *= texture2D(tBedShade, vCausticPos.xz / 40.0 + .5).r; float sandWave=sin(vCausticPos.z*17.0+sin(vCausticPos.x*.8)*1.9); float grain=fract(sin(dot(vCausticPos.xz,vec2(127.1,311.7)))*43758.5453); diffuseColor.rgb *= .96+.04*sandWave+.02*grain;' : `
        float wetBand = 1.0 - smoothstep(uWaterLevel + .02, uWaterLevel + .28, vCausticPos.y);
        diffuseColor.rgb *= mix(1.0, .72, wetBand);
        `}
      }`);
    if (!isBed) {
      frag = frag.replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
      {
        float wetBand = 1.0 - smoothstep(uWaterLevel + .02, uWaterLevel + .28, vCausticPos.y);
        roughnessFactor *= mix(1.0, .78, wetBand);
      }`);
    }
    shader.fragmentShader = frag;
  };
}

const bedGeo = new THREE.PlaneGeometry(40, 40, 96, 96);
bedGeo.rotateX(-Math.PI / 2);
stretchEdges(bedGeo);
{
  const pos = bedGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) pos.setY(i, bedHeight(pos.getX(i), pos.getZ(i)));
  bedGeo.computeVertexNormals();
}
const bedMat = new THREE.MeshStandardMaterial({ color: 0xf2e0bc, roughness: 0.94 });
bedMat.toneMapped = false;
addCaustics(bedMat, true);
scene.add(new THREE.Mesh(bedGeo, bedMat));

/* ==========================================================================
   Stones
   ========================================================================== */
function makeRockGeometry(radius) {
  const geo = new THREE.SphereGeometry(radius, 32, 20);
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const n = .87 + .10 * Math.sin(v.x * 3.1) * Math.sin(v.z * 4.2 + v.y * 2.7) + .045 * Math.cos(v.x * 7.2 + v.z * 5.3) * Math.sin(v.y * 6.8);
    v.multiplyScalar(n);
    pos.setXYZ(i, v.x, v.y * 0.7, v.z);
  }
  geo.computeVertexNormals();
  return geo;
}

const rockColors = [0xb0a494, 0xa89d8c, 0xbfb19c, 0x959a92, 0xc7b8a0];
let seed = SETTINGS.seed;
function random() {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 4294967296;
}
const rockMat = new THREE.MeshStandardMaterial({ roughness: .78, flatShading: false });
rockMat.toneMapped = false;
addCaustics(rockMat);
const rocks = new THREE.InstancedMesh(makeRockGeometry(1), rockMat, SETTINGS.rocks + 3);
rocks.name = 'Stones';
const rockTransform = new THREE.Object3D();
const rockColor = new THREE.Color();
let rockIndex = 0;
const rockObstacles = [];
function addRock(x, z, radius) {
  const or = radius * 1.2 + .22;
  rockObstacles.push({ x, z, radius: or, radius2: or * or });
  rockTransform.position.set(x, bedHeight(x, z) + radius * .28, z);
  rockTransform.rotation.set(random() * .6, random() * Math.PI * 2, random() * .5);
  rockTransform.scale.set(radius * (.85 + random() * .3), radius, radius * (.8 + random() * .4));
  rockTransform.updateMatrix();
  rocks.setMatrixAt(rockIndex, rockTransform.matrix);
  rocks.setColorAt(rockIndex++, rockColor.setHex(rockColors[Math.floor(random() * rockColors.length)]));
  const sx = (x / 40 + .5) * 1024, sy = (z / 40 + .5) * 1024;
  const size = radius * 1.35 / 40 * 1024;
  const shade = shadeContext.createRadialGradient(sx, sy, size * .15, sx, sy, size);
  shade.addColorStop(0, 'rgba(0, 0, 0, .24)');
  shade.addColorStop(.45, 'rgba(0, 0, 0, .12)');
  shade.addColorStop(1, 'rgba(0, 0, 0, 0)');
  shadeContext.fillStyle = shade;
  shadeContext.fillRect(sx - size, sy - size, size * 2, size * 2);
}

for (let i = 0; i < SETTINGS.rocks; i++) {
  const a = random() * Math.PI * 2, r = 4.6 + random() * 7;
  addRock(Math.cos(a) * r, Math.sin(a) * r, .10 + Math.pow(random(), 2) * .75);
}
addRock(-4.8, .4, 1.55);
addRock(4.6, -2.8, 1.6);
addRock(-1.8, -5.0, 1.45);
rocks.instanceMatrix.needsUpdate = true;
rocks.instanceColor.needsUpdate = true;
rocks.computeBoundingSphere();
scene.add(rocks);
bedShade.needsUpdate = true;

/* ==========================================================================
   Fish
   ========================================================================== */
const fishParts = [];
{
  const bodyG = new THREE.SphereGeometry(1, 20, 14);
  bodyG.scale(.31, .10, .085);
  const bodyP = bodyG.attributes.position;
  const bodyColors = [];
  for (let i = 0; i < bodyP.count; i++) {
    const dorsal = THREE.MathUtils.smoothstep(bodyP.getY(i), -.06, .07);
    const c = new THREE.Color(0xeef4dc).lerp(new THREE.Color(0x6aabaf), dorsal);
    const stripe = Math.exp(-Math.pow(bodyP.getY(i) / .02, 2));
    c.lerp(new THREE.Color(0xf0d094), stripe * .55);
    bodyColors.push(c.r, c.g, c.b);
  }
  bodyG.setAttribute('color', new THREE.Float32BufferAttribute(bodyColors, 3));
  fishParts.push(bodyG);
}
fishParts.push(triangles([
  [-.23, 0, 0], [-.47, .145, .012], [-.39, 0, 0],
  [-.23, 0, 0], [-.39, 0, 0], [-.47, -.145, -.012]
], 0xa3d0c6));
fishParts.push(triangles([[.08, .065, 0], [-.13, .20, 0], [-.23, .055, 0]], 0xb0d8c4));
for (const side of [-1, 1]) {
  fishParts.push(triangles([[.11, -.02, side * .055], [-.07, -.035, side * .23], [-.12, -.055, side * .05]], 0xd6e2ba));
  const eye = new THREE.SphereGeometry(.023, 10, 8);
  eye.translate(.223, .033, side * .064);
  fishParts.push(preparePart(eye, 0x0e1f22));
  const iris = new THREE.SphereGeometry(.009, 8, 6);
  iris.translate(.229, .04, side * .080);
  fishParts.push(preparePart(iris, 0xfff0c8));
}
const fishGeo = mergeParts(fishParts);
const fishCount = 30;
const phases = new Float32Array(fishCount);
for (let i = 0; i < fishCount; i++) phases[i] = random() * Math.PI * 2;
fishGeo.setAttribute('aPhase', new THREE.InstancedBufferAttribute(phases, 1));

const fishMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .42, metalness: .05, side: THREE.DoubleSide });
fishMat.toneMapped = false;
fishMat.onBeforeCompile = shader => {
  shader.uniforms.uFishTime = timeU;
  shader.vertexShader = shader.vertexShader
    .replace('#include <common>', '#include <common>\nuniform float uFishTime;\nattribute float aPhase;')
    .replace('#include <begin_vertex>', `#include <begin_vertex>
      float tail=1.0-smoothstep(-.46,.1,position.x);
      transformed.z+=sin(uFishTime*7.5+aPhase-position.x*9.0)*.07*tail*tail;`);
};
fishMat.customProgramCacheKey = () => 'cove-fish-dimensional';
const fish = new THREE.InstancedMesh(fishGeo, fishMat, fishCount);
fish.name = 'Three schools of reef fish';
fish.frustumCulled = false;
fish.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
scene.add(fish);

const shadowCanvas = document.createElement('canvas');
shadowCanvas.width = shadowCanvas.height = 64;
const shadowContext = shadowCanvas.getContext('2d');
const shadowGradient = shadowContext.createRadialGradient(32, 32, 3, 32, 32, 32);
shadowGradient.addColorStop(0, 'rgba(11,36,30,.38)');
shadowGradient.addColorStop(.45, 'rgba(11,36,30,.20)');
shadowGradient.addColorStop(1, 'rgba(11,36,30,0)');
shadowContext.fillStyle = shadowGradient;
shadowContext.fillRect(0, 0, 64, 64);
const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, opacity: .34, depthWrite: false });
shadowMat.toneMapped = false;
const fishShadowGeo = new THREE.PlaneGeometry(1.15, .42);
fishShadowGeo.rotateX(-Math.PI / 2);
const fishShadows = new THREE.InstancedMesh(fishShadowGeo, shadowMat, fishCount);
fishShadows.frustumCulled = false;
scene.add(fishShadows);

const fishState = [];
const fishDummy = new THREE.Object3D();
for (let i = 0; i < fishCount; i++) {
  const member = Math.floor(i / 3);
  fishState.push({
    school: i % 3,
    phase: random() * .035,
    trail: Math.floor(member / 3) * .72,
    spread: (member % 3 - 1) * .48 + (random() - .5) * .10,
    scale: .85 + random() * .35,
  });
  fish.setColorAt(i, new THREE.Color(i % 9 === 0 ? 0xf4d59a : 0xffffff));
}
fish.instanceColor.needsUpdate = true;

const touchU = { value: new THREE.Vector4(0, 0, -100, 0) };
const wakeU = { value: new THREE.Vector4(0, 0, 1, 0) };

const fishNow = new THREE.Vector3(), fishNext = new THREE.Vector3();

function fishPath(state, t, out) {
  const q = t * (.10 + state.school * .018) + state.school * 2.1 + state.phase;
  const r = 2.1 + state.school * .38 + state.spread;
  out.set(
    Math.cos(q) * r + Math.sin(q) * state.trail + .15 * Math.sin(t * .21 + state.school),
    0,
    Math.sin(q) * r * .72 - Math.cos(q) * state.trail * .72 + .6
  );
  const age = t - touchU.value.z;
  const dx = out.x - touchU.value.x, dz = out.z - touchU.value.y, dist = Math.hypot(dx, dz);
  if (age >= 0 && age < 4 && dist < 3) {
    const flee = (1 - Math.exp(-age * 4)) * Math.exp(-age * .7) * (3 - dist) * .7;
    out.x += dx / Math.max(dist, .1) * flee;
    out.z += dz / Math.max(dist, .1) * flee;
  }
  for (let k = 0; k < rockObstacles.length; k++) {
    const stone = rockObstacles[k];
    const sx = out.x - stone.x, sz = out.z - stone.z;
    const d2 = sx * sx + sz * sz;
    if (d2 < stone.radius2) {
      const d = Math.sqrt(d2) || .001;
      out.x = stone.x + sx / d * stone.radius;
      out.z = stone.z + sz / d * stone.radius;
    }
  }
  // Fish ride higher during strong sets and settle a bit during lulls.
  const env = waveEnvelopeU.value;
  out.y = bedHeight(out.x, out.z) + .55 + .05 * Math.sin(q * 3 + state.phase) + env * 0.10;
  return out;
}

function fishPathDerivative(state, t, out) {
  const omega = .10 + state.school * .018;
  const q = t * omega + state.school * 2.1 + state.phase;
  const r = 2.1 + state.school * .38 + state.spread;
  out.set(
    -Math.sin(q) * omega * r + Math.cos(q) * omega * state.trail + .0315 * Math.cos(t * .21 + state.school),
    0,
    Math.cos(q) * omega * r * .72 - Math.sin(q) * omega * state.trail * .72
  );
  const age = t - touchU.value.z;
  if (age >= 0 && age < 4) {
    const pos = fishNow;
    const dx = pos.x - touchU.value.x, dz = pos.z - touchU.value.y;
    const dist = Math.hypot(dx, dz);
    if (dist < 3) {
      const steer = (1 - dist / 3) * Math.exp(-age * .7) * 1.4;
      out.x += dx / Math.max(dist, .1) * steer;
      out.z += dz / Math.max(dist, .1) * steer;
    }
  }
  return out;
}

function updateFish() {
  for (let i = 0; i < fishCount; i++) {
    const state = fishState[i];
    fishPath(state, timeU.value, fishNow);
    fishPathDerivative(state, timeU.value, fishNext);
    fishDummy.position.copy(fishNow);
    fishDummy.rotation.set(0, -Math.atan2(fishNext.z, fishNext.x), 0);
    fishDummy.scale.setScalar(state.scale);
    fishDummy.updateMatrix();
    fish.setMatrixAt(i, fishDummy.matrix);
    fishDummy.position.x -= .13;
    fishDummy.position.z -= .08;
    fishDummy.position.y -= .50;
    fishDummy.rotation.set(0, 0, 0);
    fishDummy.updateMatrix();
    fishShadows.setMatrixAt(i, fishDummy.matrix);
  }
  fish.instanceMatrix.needsUpdate = true;
  fishShadows.instanceMatrix.needsUpdate = true;
}

/* ==========================================================================
   Paper boat — bright pink
   ========================================================================== */
const boatParts = [];
{
  const bow = [0, .14, .9], stern = [0, .14, -.9], port = [-.43, .21, 0], starboard = [.43, .21, 0];
  const keel = [0, -.10, 0], frontKeel = [0, -.035, .63], rearKeel = [0, -.035, -.63];
  boatParts.push(triangles([bow, port, frontKeel, port, keel, frontKeel, port, rearKeel, keel, port, stern, rearKeel], 0xef8bb0));
  boatParts.push(triangles([bow, frontKeel, starboard, starboard, frontKeel, keel, starboard, keel, rearKeel, starboard, rearKeel, stern], 0xf9bcd0));
  boatParts.push(triangles([bow, [0, .035, 0], port, port, [0, .035, 0], stern, stern, [0, .035, 0], starboard, starboard, [0, .035, 0], bow], 0xe07ba0));
  boatParts.push(triangles([[0, .08, .59], [0, .76, -.08], [-.075, .10, -.55]], 0xffe0ec));
  boatParts.push(triangles([[0, .08, .59], [.045, .09, -.55], [0, .76, -.08]], 0xf0a8c4));
  boatParts.push(triangles([[.008, .64, -.05], [.008, .71, -.071], [.008, .58, .065]], 0xb8345e));
  boatParts.push(triangles([[0, .76, -.08], [0, .73, .18], [0, .65, -.06]], 0xd45a82));
}
const boatGeo = mergeParts(boatParts);
const boatMat = new THREE.MeshStandardMaterial({
  vertexColors: true,
  roughness: .74,
  side: THREE.DoubleSide,
  emissive: 0xf9c8d8,
  emissiveIntensity: .22,
});
boatMat.toneMapped = false;
const boat = new THREE.Mesh(boatGeo, boatMat);
boat.name = 'Pink folded paper boat';
scene.add(boat);
const boatShadowGeo = new THREE.PlaneGeometry(1.5, 2.6);
boatShadowGeo.rotateX(-Math.PI / 2);
const boatShadow = new THREE.Mesh(boatShadowGeo, shadowMat);
scene.add(boatShadow);

/* ==========================================================================
   Shells
   ========================================================================== */
function shellGeometry() {
  const verts = [], colors = [], c = new THREE.Color();
  const rings = 8, steps = 24;
  function point(r, a) {
    const angle = (a / steps - .5) * Math.PI * 1.22;
    const radius = r / rings;
    return [
      Math.sin(angle) * radius * .38,
      Math.sin(radius * Math.PI) * .105 + .014 * Math.cos(angle * 22) * radius,
      Math.cos(angle) * radius * .42,
    ];
  }
  function tri(a, b, d, shade) {
    verts.push(...a, ...b, ...d);
    c.setHex(shade);
    for (let k = 0; k < 3; k++) colors.push(c.r, c.g, c.b);
  }
  for (let r = 0; r < rings; r++) for (let a = 0; a < steps; a++) {
    const p = point(r, a), q = point(r + 1, a), v = point(r + 1, a + 1), w = point(r, a + 1);
    const tint = a % 4 < 2 ? 0xf6d0ac : 0xffeccb;
    tri(p, v, q, tint);
    tri(p, w, v, tint);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  g.computeVertexNormals();
  return g;
}
const shellMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .72, side: THREE.DoubleSide });
shellMat.toneMapped = false;
const shells = new THREE.InstancedMesh(shellGeometry(), shellMat, 24);
shells.name = 'Ribbed scallop shells';
const propDummy = new THREE.Object3D();
for (let i = 0; i < 24; i++) {
  const a = random() * 6.283, r = 4.0 + random() * 4.5, x = Math.cos(a) * r, z = Math.sin(a) * r;
  propDummy.position.set(x, bedHeight(x, z) + .025, z);
  propDummy.rotation.set(0, random() * 6.283, 0);
  propDummy.scale.setScalar(.55 + random() * .6);
  propDummy.updateMatrix();
  shells.setMatrixAt(i, propDummy.matrix);
}
scene.add(shells);

/* ==========================================================================
   Starfish
   ========================================================================== */
const starPositions = [];
const starPoint = (j, r) => {
  const a = j / 48 * Math.PI * 2, R = (.24 + .14 * Math.cos(a * 5)) * r;
  return [Math.cos(a) * R, .085 * Math.pow(1 - r, .6) + .018, Math.sin(a) * R];
};
for (let r = 0; r < 6; r++) for (let j = 0; j < 48; j++) {
  const a = starPoint(j, r / 6), b = starPoint(j, (r + 1) / 6), c = starPoint(j + 1, (r + 1) / 6), d = starPoint(j + 1, r / 6);
  starPositions.push(...a, ...c, ...b, ...a, ...d, ...c);
}
const starGeo = new THREE.BufferGeometry();
starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
starGeo.computeVertexNormals();
const starMat = new THREE.MeshStandardMaterial({ color: 0xe07a48, roughness: .94, side: THREE.DoubleSide });
starMat.toneMapped = false;
const stars = new THREE.InstancedMesh(starGeo, starMat, 6);
stars.name = 'Terracotta sea stars';
[[3.5, 3.2], [-4.1, 2.2], [5, -2], [-2.8, 5.6], [1.2, 5.1], [-5.5, -3]].forEach(([x, z], i) => {
  propDummy.position.set(x, bedHeight(x, z) + .04, z);
  propDummy.rotation.set(0, i * 1.7, 0);
  propDummy.scale.setScalar(.8 + random() * .5);
  propDummy.updateMatrix();
  stars.setMatrixAt(i, propDummy.matrix);
});
scene.add(stars);

/* ==========================================================================
   Boat motion — samples the same wave field the water uses, including the
   envelope gains so the boat rises and calms with the sets.
   ========================================================================== */
const BOAT_WAVES = [
  [ 1.0,  0.3, 0.8, .085, 1.2],
  [-0.7,  1.0, 1.3, .065, 1.6],
  [ 0.5, -1.0, 2.2, .042, 2.2],
  [-1.0, -0.4, 3.5, .022, 2.8],
].map(([a, b, f, amp, speed]) => {
  const len = Math.hypot(a, b);
  return { nx: a / len, nz: b / len, f, amp, speed };
});
const SWELL_WEIGHTS = [1, .78];
const _boatNormal = new THREE.Vector3();
const _boatForward = new THREE.Vector3();
const _boatRight = new THREE.Vector3();
const _boatBasis = new THREE.Matrix4();

function updateBoat() {
  const t = timeU.value;
  const x = .9 + Math.sin(t * .075) * 1.35, z = .35 + Math.cos(t * .075) * 1.1;
  const dir = surfDirectionU.value, dx = dir.x, dz = dir.y, ax = -dz, az = dx;
  let h = 0, gx = 0, gz = 0;
  // Chop waves — scaled by the current chop gain.
  const chopGain = gains.chop;
  for (let i = 0; i < 4; i++) {
    const w = BOAT_WAVES[i];
    const phase = (x * w.nx + z * w.nz) * w.f + t * w.speed;
    const s = Math.sin(phase), c = Math.cos(phase);
    h += w.amp * chopGain * s;
    gx += w.nx * w.f * w.amp * chopGain * c;
    gz += w.nz * w.f * w.amp * chopGain * c;
  }
  const amp = waveStrengthU.value;
  h *= amp; gx *= amp; gz *= amp;

  // Surf swells — scaled by the current swell gain.
  const swellGain = gains.swell;
  const along = x * dx + z * dz, cross = x * ax + z * az, bend = .32 * Math.sin(cross * .48);
  const frontX = surfFrontU.value.x, frontY = surfFrontU.value.y;
  const w2 = SETTINGS.surf.width * SETTINGS.surf.width;
  const slopeDirX = dx + ax * .1536 * Math.cos(cross * .48);
  const slopeDirZ = dz + az * .1536 * Math.cos(cross * .48);
  const sh = surfHeightU.value * swellGain;
  for (let i = 0; i < 2; i++) {
    const front = i === 0 ? frontX : frontY;
    const weight = SWELL_WEIGHTS[i];
    const d = along + bend - front, tail = d + 2;
    const peak = Math.exp(-d * d / w2), trough = Math.exp(-tail * tail / (3 * w2));
    h += weight * (peak - .24 * trough) * sh;
    const slope = weight * (-2 * d / w2 * peak + .16 * tail / w2 * trough) * sh;
    gx += slope * slopeDirX;
    gz += slope * slopeDirZ;
  }
  _boatNormal.set(-gx, 1, -gz).normalize();
  _boatForward.set(1.35 * Math.cos(t * .075), 0, -1.1 * Math.sin(t * .075)).normalize();
  wakeU.value.set(x, z, _boatForward.x, _boatForward.z);
  _boatForward.addScaledVector(_boatNormal, -_boatForward.dot(_boatNormal)).normalize();
  boat.position.set(x, waterLevelU.value + h + .11, z);
  _boatRight.crossVectors(_boatNormal, _boatForward);
  _boatBasis.makeBasis(_boatRight, _boatNormal, _boatForward);
  boat.quaternion.setFromRotationMatrix(_boatBasis);
  boatShadow.position.set(x - .5, bedHeight(x - .5, z - .3) + .028, z - .3);
  boatShadow.rotation.y = Math.atan2(_boatForward.x, _boatForward.z);
}

/* ==========================================================================
   Water — vertex shader with wave envelope
   ========================================================================== */
const vertexShader = `
  uniform float uTime;
  uniform float uWaveStrength;
  uniform float uWaveEnvelope;
  uniform vec2 uSurfFront;
  uniform vec2 uSurfDirection;
  uniform float uSurfHeight;
  uniform float uSurfWidth;
  varying float vCrest;
  varying float vEnvelope;
  varying vec3 vWorldPos;
  varying vec4 vClipPos;
  varying vec3 vNormalW;

  void addWave(vec2 dir, float freq, float amp, float speed, vec2 p, float t,
               inout float h, inout vec2 grad) {
    float phase = dot(p, dir) * freq + t * speed;
    h += amp * sin(phase);
    grad += dir * (freq * amp * cos(phase));
  }

  void addSwell(float distance, float weight, vec2 slopeDirection,
                inout float height, inout vec2 gradient, inout float crest) {
    float width2 = uSurfWidth * uSurfWidth;
    float peak = exp(-distance * distance / width2);
    float tailDistance = distance + 2.0;
    float trough = exp(-tailDistance * tailDistance / (width2 * 3.0));
    height += weight * (peak - .24 * trough);
    float slope = weight * (-2.0 * distance / width2 * peak
                 + .16 * tailDistance / width2 * trough);
    gradient += slopeDirection * slope;
    crest = max(crest, peak * weight);
  }

  void main() {
    vec3 pos = position;
    vec2 p = pos.xz;

    // Two gains derived from the envelope:
    //   chop  — the local wind waves. Range 0.42 to 2.15 across a set cycle,
    //           so lulls are nearly glass and sets are genuinely turbulent.
    //   swell — the incoming surf lines. Range 0.75 to 1.35; more moderate so
    //           the swells stay readable even during lulls.
    float chopGain  = 0.42 + 1.73 * uWaveEnvelope;
    float swellGain = 0.75 + 0.60 * uWaveEnvelope;

    float h = 0.0;
    vec2 grad = vec2(0.0);

    // Chop waves — amplitude scaled by chopGain.
    addWave(normalize(vec2( 1.0,  0.3)), 0.8, 0.085 * chopGain, 1.2, p, uTime, h, grad);
    addWave(normalize(vec2(-0.7,  1.0)), 1.3, 0.065 * chopGain, 1.6, p, uTime, h, grad);
    addWave(normalize(vec2( 0.5, -1.0)), 2.2, 0.042 * chopGain, 2.2, p, uTime, h, grad);
    addWave(normalize(vec2(-1.0, -0.4)), 3.5, 0.022 * chopGain, 2.8, p, uTime, h, grad);
    float amplitude = uWaveStrength * (1.0 - smoothstep(18.0, 65.0, length(p)));
    h *= amplitude;
    grad *= amplitude;

    // Capillary ripples — also boosted during sets, so a turbulent surface
    // really does look agitated. Proximity-faded as before.
    float capNear = 1.0 - smoothstep(3.0, 12.0, length(p));
    float capH = 0.0;
    vec2 capGrad = vec2(0.0);
    float capMul = 0.6 + 1.2 * uWaveEnvelope;
    addWave(normalize(vec2( 0.9,  0.7)), 11.0, 0.0030 * capMul, 5.4, p, uTime, capH, capGrad);
    addWave(normalize(vec2(-0.6,  0.9)), 16.0, 0.0020 * capMul, 6.8, p, uTime, capH, capGrad);
    addWave(normalize(vec2( 0.3, -0.95)), 23.0, 0.0012 * capMul, 8.6, p, uTime, capH, capGrad);
    h += capH * capNear;
    grad += capGrad * capNear;

    // Surf swells — height modulated by swellGain.
    vec2 across = vec2(-uSurfDirection.y, uSurfDirection.x);
    float crossPosition = dot(p, across);
    float along = dot(p, uSurfDirection);
    float bend = .32 * sin(crossPosition * .48);
    vec2 slopeDirection = uSurfDirection + across * (.1536 * cos(crossPosition * .48));
    float swell = 0.0;
    vec2 swellGrad = vec2(0.0);
    float crest = 0.0;
    float shoreFade = 1.0 - smoothstep(13.0, 23.0, abs(along));
    float swellH = uSurfHeight * swellGain;
    addSwell(along + bend - uSurfFront.x, 1.0, slopeDirection, swell, swellGrad, crest);
    addSwell(along + bend - uSurfFront.y, .78, slopeDirection, swell, swellGrad, crest);
    h += swell * swellH * shoreFade;
    grad += swellGrad * swellH * shoreFade;
    vCrest = crest * shoreFade;
    vEnvelope = uWaveEnvelope;
    pos.y += h;
    vNormalW = normalize(vec3(-grad.x, 1.0, -grad.y));
    vec4 wp = modelMatrix * vec4(pos, 1.0);
    vWorldPos = wp.xyz;
    vClipPos = projectionMatrix * viewMatrix * wp;
    gl_Position = vClipPos;
  }
`;

/* ==========================================================================
   Water — fragment shader
   ========================================================================== */
const fragmentShader = `
  uniform vec4 uTouch;
  uniform vec4 uWake;
  uniform float uTime;
  uniform float uWaveStrength;
  uniform float uWaveEnvelope;
  uniform sampler2D tRefraction;
  uniform sampler2D tDepth;
  uniform sampler2D tFoam;
  uniform float uNear;
  uniform float uFar;
  uniform vec3 uSunDir;
  uniform vec3 uAbsorption;
  uniform vec3 uDeepColor;
  uniform vec3 uSssColor;
  uniform vec3 uHorizonColor;
  uniform vec2 uTexel;
  uniform float uSurfHeight;
  varying float vCrest;
  varying float vEnvelope;
  varying vec3 vWorldPos;
  varying vec4 vClipPos;
  varying vec3 vNormalW;

  float linearizeDepth(float z) {
    return (2.0 * uNear * uFar) / (uFar + uNear - (z * 2.0 - 1.0) * (uFar - uNear));
  }

  vec3 skyColor(vec3 d) {
    float t = clamp(d.y, 0.0, 1.0);
    vec3 col = mix(uHorizonColor, vec3(0.22, 0.52, 0.76), pow(t, 0.7)) * 1.15;
    col += vec3(1.0, 0.96, 0.88) * pow(max(dot(d, uSunDir), 0.0), 380.0) * 1.2;
    col += vec3(1.0, 0.90, 0.78) * pow(max(dot(d, uSunDir), 0.0), 12.0) * 0.18;
    return col;
  }

  void main() {
    vec2 p = vWorldPos.xz;
    float t = uTime;

    vec3 foamTex = texture2D(tFoam, p * .12 + vec2(t * .009, -t * .013)).rgb;
    vec3 foamFine = texture2D(tFoam, p * .35 + vec2(-t * .015, t * .011)).rgb;
    float detailFade = 1.0 - smoothstep(6.0, 22.0, length(p));

    // Surface perturbation amplified during sets — the water is visibly
    // choppier when the envelope is high, and glassy when it is low.
    float turbMul = 0.5 + 1.5 * vEnvelope;
    vec2 ripple = vec2(
      sin(p.x * 6.0 + t * 2.0) * 0.022 + sin(p.x * 17.0 - t * 3.2) * 0.010,
      sin(p.y * 7.0 - t * 1.7) * 0.022 + sin((p.x + p.y) * 13.0 + t * 2.5) * 0.010
    ) * turbMul;
    float rippleFade = 1.0 - smoothstep(.05, .45, length(fwidth(p)));
    vec3 N = normalize(vNormalW + vec3(ripple.x, 0.0, ripple.y) * uWaveStrength * rippleFade);

    // Micro-normals also scale with turbulence.
    float microMul = 0.5 + 1.3 * vEnvelope;
    vec2 microN = (vec2(foamFine.r, foamFine.g) - 0.5) * 0.05 * detailFade * microMul;
    N = normalize(N + vec3(microN.x, 0.0, microN.y));

    vec2 touchDelta = p - uTouch.xy;
    float touchAge = uTime - uTouch.z, touchDistance = length(touchDelta);
    float ringWindow = exp(-pow((touchDistance - touchAge * 1.65) / .38, 2.0)) * exp(-touchAge * .55) * step(0.0, touchAge);
    N = normalize(N + vec3(touchDelta.x, 0.0, touchDelta.y) / max(.1, touchDistance) * sin(touchDistance * 19.0 - touchAge * 26.0) * ringWindow * .19);

    vec3 V = normalize(cameraPosition - vWorldPos);
    vec2 screenUV = vClipPos.xy / vClipPos.w * 0.5 + 0.5;

    float rawDepth = texture2D(tDepth, screenUV).x;
    float sceneZ = linearizeDepth(rawDepth);
    float waterZ = linearizeDepth(gl_FragCoord.z);
    if (sceneZ <= waterZ) {
      gl_FragColor = vec4(texture2D(tRefraction, screenUV).rgb, 1.0);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
      return;
    }
    float rayScale = length(cameraPosition - vWorldPos) / max(waterZ, .001);
    float waterDepth = rawDepth > .9999 ? 12.0 : clamp((sceneZ - waterZ) * rayScale, 0.0, 12.0);

    vec2 viewNormal = (viewMatrix * vec4(N - vec3(0.0, 1.0, 0.0), 0.0)).xy;
    float vnLen = length(viewNormal);
    vec2 vnDir = viewNormal / max(vnLen, 1e-5);
    float tiltGate = smoothstep(0.0, 0.016, vnLen);

    vec2 edge = min(screenUV, 1.0 - screenUV);
    float edgeFade = smoothstep(0.0, .07, min(edge.x, edge.y));

    float eta = 1.0 / 1.333;
    float refrFactor = 1.0 - eta;
    float offsetMag = min(0.012 + waterDepth * 0.015, 0.045) * refrFactor * edgeFade
                    * smoothstep(0.0, 0.10, waterDepth) * tiltGate;
    vec2 offset = vnDir * offsetMag;

    vec2 refrUV = clamp(screenUV + offset, uTexel, 1.0 - uTexel);
    float sampleDepth = texture2D(tDepth, refrUV).x;
    float sampleZ = linearizeDepth(sampleDepth);
    float continuity = 1.0 - smoothstep(.08, .4, abs(sampleZ - sceneZ));
    refrUV = mix(screenUV, refrUV, continuity);
    if (sampleDepth > .9999 || sampleZ <= waterZ + .03) refrUV = screenUV;

    vec2 ca = (refrUV - screenUV) * 0.05 * continuity * edgeFade * tiltGate;
    vec3 refr = vec3(
      texture2D(tRefraction, clamp(refrUV + ca, uTexel, 1.0 - uTexel)).r,
      texture2D(tRefraction, refrUV).g,
      texture2D(tRefraction, clamp(refrUV - ca, uTexel, 1.0 - uTexel)).b
    );

    vec2 refrEdge = min(refrUV, 1.0 - refrUV);
    float refrEdgeFade = smoothstep(0.0, .05, min(refrEdge.x, refrEdge.y));
    if (refrEdgeFade < 1.0) {
      vec3 raw = texture2D(tRefraction, screenUV).rgb;
      refr = mix(raw, refr, refrEdgeFade);
    }

    vec3 absorb = exp(-uAbsorption * waterDepth);
    vec3 scatterCol = vec3(0.05, 0.32, 0.36);
    float scatter = (1.0 - exp(-waterDepth * 0.35)) * max(dot(uSunDir, vec3(0.0, 1.0, 0.0)), 0.0) * 0.03;
    refr = refr * absorb + uDeepColor * (1.0 - absorb) + scatterCol * scatter;

    float deepT = 1.0 - exp(-waterDepth * 0.28);
    refr = mix(refr, refr * vec3(0.96, 0.99, 1.0), deepT * 0.10);

    float NdotV = max(dot(N, V), 0.0);
    float fres = 0.012 + 0.988 * pow(1.0 - NdotV, 5.0);
    vec3 refl = skyColor(reflect(-V, N));

    vec3 col = mix(refr, refl, fres);

    vec3 H = normalize(uSunDir + V);
    float backScatter = pow(NdotV * 0.5 + 0.5, 4.0);
    float forwardScatter = pow(max(dot(V, -uSunDir), 0.0), 3.5);
    float thinness = smoothstep(0.25, 0.95, vCrest);
    float sss = backScatter * forwardScatter * thinness;
    col += uSssColor * sss * 0.5 * (0.6 + 0.8 * vEnvelope);

    float rimGlow = smoothstep(0.55, 1.0, vCrest) * (1.0 - NdotV) * 0.4;
    col += vec3(0.55, 0.72, 0.65) * rimGlow;

    float broad = pow(max(dot(N, H), 0.0), 40.0) * 0.10;
    float sharp = pow(max(dot(N, H), 0.0), 900.0) * 1.6;
    vec3 microNN = normalize(N + vec3((foamFine.r - 0.5) * 0.6, 0.0, (foamFine.g - 0.5) * 0.6) * detailFade * turbMul);
    float sparkle = pow(max(dot(microNN, H), 0.0), 600.0) * smoothstep(0.55, 0.92, foamFine.b) * 2.5;
    col += vec3(1.0, 0.95, 0.82) * (broad * (fres * 3.0 + 0.05)
                                  + sharp * (fres * 4.5 + 0.05)
                                  + sparkle * (fres * 6.0 + 0.10) * detailFade);

    vec2 wakeDelta = p - uWake.xy;
    float behind = -dot(wakeDelta, uWake.zw);
    float sideways = abs(dot(wakeDelta, vec2(-uWake.w, uWake.z)));
    float wake = exp(-pow((sideways - behind * .31) / .055, 2.0)) * exp(-behind * 1.2) * smoothstep(.1, .5, behind);
    col += vec3(.10, .15, .14) * wake;
    col += vec3(.05, .075, .065) * ringWindow;

    // Crest foam appears earlier during sets (looser threshold as the envelope
    // rises) so whitecaps actually form on the turbulent crests.
    float foamThresh = mix(0.85, 0.62, vEnvelope);
    if (vCrest > foamThresh - 0.20) {
      float crestFoam = smoothstep(foamThresh, foamThresh + 0.24, vCrest + (foamTex.r - .5) * .18 + (foamFine.r - .5) * .10);
      float bubbles = .24 + .76 * smoothstep(.22, .7, foamTex.g);
      float foam = crestFoam * bubbles * smoothstep(0.0, .18, waterDepth);
      // Foam opacity higher during sets.
      col = mix(col, vec3(.94, .98, .93), foam * (0.28 + 0.22 * vEnvelope));
    }

    float rimOuter = 1.0 - smoothstep(0.012, 0.10, waterDepth);
    float rimInner = smoothstep(0.002, 0.018, waterDepth);
    float lap = 0.5 + 0.5 * sin(t * 1.4 + dot(p, vec2(1.7, 1.3)));
    float surge = lap + vCrest * .35;
    float shoreFoam = rimOuter * rimInner * smoothstep(0.38, 0.85, foamFine.g * 0.75 + surge * 0.30);
    col = mix(col, vec3(0.92, 0.96, 0.94), shoreFoam * 0.30);

    float mist = smoothstep(40.0, 95.0, length(vWorldPos - cameraPosition));
    vec3 skyAtHorizon = uHorizonColor * 1.15;
    col = mix(col, skyAtHorizon, mist);

    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const rt = new THREE.WebGLRenderTarget(1, 1);
rt.depthTexture = new THREE.DepthTexture(1, 1);
rt.texture.generateMipmaps = false;
if (renderer.capabilities.isWebGL2 && quality === 'high') rt.samples = 4;

const waterMat = new THREE.ShaderMaterial({
  uniforms: {
    uTime: timeU,
    uTouch: touchU,
    uWake: wakeU,
    uWaveStrength: waveStrengthU,
    uWaveEnvelope: waveEnvelopeU,
    uSurfFront: surfFrontU,
    uSurfDirection: surfDirectionU,
    uSurfHeight: surfHeightU,
    uSurfWidth: { value: SETTINGS.surf.width },
    tRefraction: { value: rt.texture },
    tDepth: { value: rt.depthTexture },
    tFoam: { value: foamNoise },
    uNear: { value: camera.near },
    uFar: { value: camera.far },
    uSunDir: { value: sunDir },
    uAbsorption: { value: new THREE.Vector3(...SETTINGS.absorption) },
    uDeepColor: { value: new THREE.Color(...SETTINGS.deepColor) },
    uSssColor: { value: new THREE.Color(...SETTINGS.sssColor) },
    uHorizonColor: { value: horizonColor },
    uTexel: { value: new THREE.Vector2(1, 1) },
  },
  vertexShader,
  fragmentShader,
});

function makeWaterGeometry(segments) {
  const geometry = new THREE.PlaneGeometry(40, 40, segments, segments);
  geometry.rotateX(-Math.PI / 2);
  stretchEdges(geometry);
  return geometry;
}
const water = new THREE.Mesh(makeWaterGeometry(qualitySettings.segments), waterMat);
water.position.y = waterLevelU.value;
water.layers.set(1);
scene.add(water);

/* ==========================================================================
   Resolution / dynamic scaling
   ========================================================================== */
const bufferSize = new THREE.Vector2();
let dynamicScaleValue = 1.0;
let frameIntervals = [];
let lastAutoAdjustTime = 0;

function baseRefractionScale() {
  const quiet = mode !== 'explore';
  return quiet && quality === 'auto' ? .65 : qualitySettings.refraction;
}

function onResize() {
  if (disposed || contextLost) return;
  camera.aspect = viewW() / viewH();
  camera.updateProjectionMatrix();
  const quiet = mode !== 'explore';
  const dprCap = quiet && quality === 'auto' ? 1.25 : qualitySettings.dpr;
  const pixelBudget = qualitySettings.pixels * (quiet && quality === 'auto' ? .8 : 1);
  renderer.setPixelRatio(Math.min(devicePixelRatio, dprCap, Math.sqrt(pixelBudget / (viewW() * viewH()))));
  renderer.setSize(viewW(), viewH());
  renderer.getDrawingBufferSize(bufferSize);
  const scale = baseRefractionScale() * dynamicScaleValue;
  const nextSamples = renderer.capabilities.isWebGL2 && quality === 'high' ? 4 : 0;
  if (rt.samples !== nextSamples) { rt.dispose(); rt.samples = nextSamples; }
  rt.setSize(Math.max(1, Math.floor(bufferSize.x * scale)), Math.max(1, Math.floor(bufferSize.y * scale)));
  waterMat.uniforms.uTexel.value.set(1 / rt.width, 1 / rt.height);
  requestRender();
}

function updateDynamicScale(frameMs) {
  const cfg = SETTINGS.dynamicScale;
  if (!cfg.enabled || quality !== 'auto') return;
  if (frameMs <= 0 || frameMs > 80) return;
  frameIntervals.push(frameMs);
  if (frameIntervals.length > cfg.sampleCount) frameIntervals.shift();
  if (frameIntervals.length < cfg.sampleCount) return;
  const now = performance.now();
  if (now - lastAutoAdjustTime < cfg.cooldownMs) return;
  let sum = 0;
  for (let i = 0; i < frameIntervals.length; i++) sum += frameIntervals[i];
  const avg = sum / frameIntervals.length;
  let next = dynamicScaleValue;
  if (avg > cfg.targetMs * 1.35 && dynamicScaleValue > cfg.min) {
    next = Math.max(cfg.min, dynamicScaleValue - 0.10);
  } else if (avg < cfg.targetMs * 0.85 && dynamicScaleValue < cfg.max) {
    next = Math.min(cfg.max, dynamicScaleValue + 0.05);
  }
  if (next !== dynamicScaleValue) {
    dynamicScaleValue = next;
    onResize();
    frameIntervals.length = 0;
    lastAutoAdjustTime = now;
  } else {
    lastAutoAdjustTime = now;
  }
}

function resetCamera() {
  const damping = controls.enableDamping;
  controls.enableDamping = false;
  controls.update();
  controls.target.set(0, .4, 0);
  camera.position.set(...(mode === 'explore' ? [3.2, 9.8, 12.0] : [3, 12.5, 13.5]));
  controls.update();
  controls.enableDamping = damping;
  requestRender();
}

function setMode(nextMode = mode) {
  mode = nextMode === 'explore' ? 'explore' : 'preview';
  controls.enabled = mode === 'explore';
  renderer.domElement.tabIndex = mode === 'explore' ? 0 : -1;
  renderer.domElement.setAttribute('aria-hidden', String(mode !== 'explore'));
  renderer.domElement.style.touchAction = mode === 'explore' ? 'pan-y' : 'auto';
  waveStrengthU.value = SETTINGS.waveStrength * (mode === 'explore' ? 1 : .55);
  surfHeightU.value = SETTINGS.surf.height * (mode === 'explore' ? 1 : .75);
  resetCamera();
  onResize();
  syncAnimation();
}

/* ==========================================================================
   Animation
   ========================================================================== */
let lastFrame = 0, renderRequest = 0, running = false;
let introDismissed = false;
// The site keeps its intro card (it carries a CTA); only the hint line fades.
function hideIntroOnce() {
  if (introDismissed) return;
  introDismissed = true;
  onInteract();
}

function renderFrame() {
  if (disposed || contextLost) return;
  if (controls.enabled) controls.update();
  updateSurf();
  updateWaveEnvelope();
  updateBoat();
  updateFish();
  updateOceanAudio();

  camera.layers.set(0);
  renderer.setRenderTarget(rt);
  renderer.render(scene, camera);
  camera.layers.set(1);
  renderer.setRenderTarget(null);
  renderer.render(scene, camera);
  camera.layers.set(0);
}

function animate(now) {
  const elapsed = lastFrame ? Math.min((now - lastFrame) / 1000, .1) : 0;
  lastFrame = now;
  timeU.value += elapsed * SETTINGS.speed;
  updateDynamicScale(elapsed * 1000);
  renderFrame();
}

function requestRender() {
  if (disposed || contextLost || running || renderRequest || document.hidden || !inView) return;
  renderRequest = requestAnimationFrame(() => {
    renderRequest = 0;
    if (!document.hidden && inView) renderFrame();
  });
}

function syncAnimation() {
  if (disposed) return;
  running = !paused && !document.hidden && inView && !contextLost;
  controls.enableDamping = !paused;
  lastFrame = 0;
  renderer.setAnimationLoop(running ? animate : null);
  if (running && renderRequest) { cancelAnimationFrame(renderRequest); renderRequest = 0; }
  syncOceanAudio();
  requestRender();
}

/* ==========================================================================
   Events
   ========================================================================== */
const listeners = new AbortController();
const tapRay = new THREE.Raycaster();
const tapPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -SETTINGS.waterLevel);
const tapPoint = new THREE.Vector3();
let pointerStart = null;
// Site easter egg (design room D4): the cube's old 10-click egg lives on the
// paper boat — the auto-reply in physical form. Taps must land on the boat
// within 3 s of each other; the tap still ripples the water as usual.
const BOAT_EGG_TAPS = 10;
let boatTaps = 0, lastBoatTap = 0;

renderer.domElement.addEventListener('pointerdown', e => {
  hideIntroOnce();
  pointerStart = { x: e.clientX, y: e.clientY };
}, { signal: listeners.signal });

renderer.domElement.addEventListener('pointerup', e => {
  if (mode !== 'explore' || !pointerStart || Math.hypot(e.clientX - pointerStart.x, e.clientY - pointerStart.y) > 7) {
    pointerStart = null;
    return;
  }
  const rect = renderer.domElement.getBoundingClientRect();
  tapRay.setFromCamera(new THREE.Vector2(
    (e.clientX - rect.left) / rect.width * 2 - 1,
    1 - (e.clientY - rect.top) / rect.height * 2
  ), camera);
  if (tapRay.intersectObject(boat, false).length) {
    const now = performance.now();
    boatTaps = now - lastBoatTap > 3000 ? 1 : boatTaps + 1;
    lastBoatTap = now;
    if (boatTaps >= BOAT_EGG_TAPS) { boatTaps = 0; onBoatEgg(); }
  }
  if (tapRay.ray.intersectPlane(tapPlane, tapPoint)) {
    touchU.value.set(tapPoint.x, tapPoint.z, timeU.value, 1);
    requestRender();
  }
  pointerStart = null;
}, { signal: listeners.signal });

function listen(target, event, callback, options = {}) {
  target.addEventListener(event, callback, { ...options, signal: listeners.signal });
}
const resizeObserver = new ResizeObserver(() => onResize());
resizeObserver.observe(container);
listen(document, 'visibilitychange', syncAnimation);
listen(motionPreference, 'change', () => { paused = motionPreference.matches; syncAnimation(); });
// Only real input fades the hint: resetCamera()'s controls.update() also
// emits 'change' at startup, which faded it before anyone touched the water.
controls.addEventListener('change', requestRender);

listen(renderer.domElement, 'keydown', event => {
  if (mode !== 'explore' || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
  event.preventDefault();
  hideIntroOnce();
  const offset = camera.position.clone().sub(controls.target);
  const spherical = new THREE.Spherical().setFromVector3(offset);
  if (event.key === 'ArrowLeft') spherical.theta -= .08;
  if (event.key === 'ArrowRight') spherical.theta += .08;
  if (event.key === 'ArrowUp') spherical.phi -= .08;
  if (event.key === 'ArrowDown') spherical.phi += .08;
  spherical.phi = THREE.MathUtils.clamp(spherical.phi, controls.minPolarAngle, controls.maxPolarAngle);
  camera.position.copy(controls.target).add(offset.setFromSpherical(spherical));
  controls.update();
  requestRender();
});

const observer = new IntersectionObserver(entries => {
  inView = entries[0].isIntersecting;
  syncAnimation();
});
observer.observe(renderer.domElement);

listen(renderer.domElement, 'webglcontextlost', event => {
  event.preventDefault();
  contextLost = true;
  syncAnimation();
  onStatus({ kind: 'context-lost', message: 'The water is taking a moment. It will return when graphics are available.' });
});
listen(renderer.domElement, 'webglcontextrestored', () => {
  contextLost = false;
  onStatus({ kind: 'ready' });
  onResize();
  syncAnimation();
});

function dispose() {
  if (disposed) return;
  disposed = true;
  disposeOceanAudio();
  renderer.setAnimationLoop(null);
  cancelAnimationFrame(renderRequest);
  observer.disconnect();
  resizeObserver.disconnect();
  listeners.abort();
  controls.removeEventListener('change', requestRender);
  controls.dispose();
  scene.traverse(object => {
    if (!object.isMesh) return;
    try { object.geometry.dispose(); } catch {}
    try { if (object.material) object.material.dispose(); } catch {}
  });
  try { rocks.dispose(); } catch {}
  try { fish.dispose(); } catch {}
  try { fishShadows.dispose(); } catch {}
  try { shells.dispose(); } catch {}
  try { stars.dispose(); } catch {}
  try { shadowTexture.dispose(); } catch {}
  try { bedShade.dispose(); } catch {}
  try { foamNoise.dispose(); } catch {}
  try { rt.dispose(); } catch {}
  try { renderer.dispose(); } catch {}
}
listen(window, 'pagehide', event => {
  if (event.persisted) { renderer.setAnimationLoop(null); running = false; syncOceanAudio(); }
  else dispose();
});
listen(window, 'pageshow', event => { if (event.persisted) syncAnimation(); });

setMode();
renderFrame();
onStatus({ kind: 'ready' });

// Browsers only let an AudioContext start after a user gesture. Sound is on
// by default site-wide (owner's call), so arm it on the first gesture.
function armAudio() {
  if (!soundEnabled || disposed) return;
  try {
    if (!oceanAudio) oceanAudio = createOceanAudio();
    syncOceanAudio();
  } catch { audioFailed(); }
}
listen(window, 'pointerdown', armAudio);
listen(window, 'keydown', armAudio);
// The scene mounts lazily, usually long after the visitor's first click.
// User activation is sticky (HTML spec, navigator.userActivation), so if the
// page has already been interacted with, audio may start right away.
if (navigator.userActivation?.hasBeenActive) armAudio();

return {
  setMode,
  setSound(enabled) {
    soundEnabled = !!enabled;
    if (soundEnabled) armAudio();
    else syncOceanAudio();
  },
  dispose,
};
}
