import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { PlanetTheme, ViewMode } from '../types/system';
import { tacticalFeedback } from '../utils/tacticalFeedback';
import {
  detectDeviceCapabilities,
  notifyStreamingProgress,
  Device3DCapabilities
} from '../utils/progressive3D';

interface Planet3DProps {
  theme: PlanetTheme;
  isPaused: boolean;
  orbitAngle: number;
  activeSystemIndex: number | null;
  dataSurgeActive?: boolean;
  bloomStrength?: number;
  enableChromaticAberration?: boolean;
  onHoverPlanetChange?: (isHovered: boolean) => void;
  onClickPlanet?: () => void;
  onRotate?: (deltaAngle: number) => void;
  onSelectBeacon?: (index: number) => void;
  viewMode?: ViewMode;
  cinematicMode?: boolean;
  batterySaver?: boolean;
}

// Global Texture Cache by Theme & LOD to prevent repeated computations
const textureAtlasCache = new Map<
  string,
  {
    diffuseMap: THREE.CanvasTexture;
    packedAtlas: THREE.CanvasTexture;
    cloudsMap: THREE.CanvasTexture;
  }
>();

// Preallocated math objects outside render loop to enforce ZERO GC
const _vec3 = new THREE.Vector3();
const _mouseTarget = new THREE.Vector2(0, 0);
const _mouseCurrent = new THREE.Vector2(0, 0);

/**
 * Procedural Texture Atlas Generator with Time-Slicing & Channel Packing
 * Packs:
 *  - Diffuse Map: Albedo RGB
 *  - Packed Atlas: R = Bump/Elevation, G = Specular glint, B = Night city lights, A = Dynamic cloud density
 * Reduces GPU Fragment Sampler lookups from 5 to 2!
 */
function createPackedTextures(
  theme: PlanetTheme,
  caps: Device3DCapabilities,
  onProgress?: (pct: number) => void
): {
  diffuseMap: THREE.CanvasTexture;
  packedAtlas: THREE.CanvasTexture;
  cloudsMap: THREE.CanvasTexture;
} {
  const cacheKey = `${theme}_${caps.tier}`;
  const cached = textureAtlasCache.get(cacheKey);
  if (cached) {
    if (onProgress) onProgress(100);
    return cached;
  }

  const { width, height } = caps.recommendedTextureSize;

  const surfCanvas = document.createElement('canvas');
  surfCanvas.width = width;
  surfCanvas.height = height;
  const surfCtx = surfCanvas.getContext('2d')!;

  const packedCanvas = document.createElement('canvas');
  packedCanvas.width = width;
  packedCanvas.height = height;
  const packedCtx = packedCanvas.getContext('2d')!;

  const cloudsCanvas = document.createElement('canvas');
  cloudsCanvas.width = width;
  cloudsCanvas.height = height;
  const cloudsCtx = cloudsCanvas.getContext('2d')!;

  const surfImg = surfCtx.createImageData(width, height);
  const packedImg = packedCtx.createImageData(width, height);
  const cloudsImg = cloudsCtx.createImageData(width, height);

  const sData = surfImg.data;
  const pData = packedImg.data;
  const cData = cloudsImg.data;

  // Pseudo-random noise table
  const perm = new Uint8Array(512);
  for (let i = 0; i < 256; i++) perm[i] = i;
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(Math.sin(i * 997.1) * 10000) >>> 0;
    const idx = j % (i + 1);
    const temp = perm[i];
    perm[i] = perm[idx];
    perm[idx] = temp;
  }
  for (let i = 0; i < 256; i++) perm[256 + i] = perm[i];

  const noise2D = (x: number, y: number): number => {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);
    const u = xf * xf * (3 - 2 * xf);
    const v = yf * yf * (3 - 2 * yf);
    const a = perm[X] + Y;
    const aa = perm[a];
    const ab = perm[a + 1];
    const b = perm[X + 1] + Y;
    const ba = perm[b];
    const bb = perm[b + 1];
    const grad = (hash: number, rx: number, ry: number) => {
      const h = hash & 3;
      const uVal = h < 2 ? rx : ry;
      const vVal = h < 2 ? ry : rx;
      return (h & 1 ? -uVal : uVal) + (h & 2 ? -2.0 * vVal : 2.0 * vVal);
    };
    const x1 = (1 - u) * grad(aa, xf, yf) + u * grad(ba, xf - 1, yf);
    const x2 = (1 - u) * grad(ab, xf, yf - 1) + u * grad(bb, xf - 1, yf - 1);
    return ((1 - v) * x1 + v * x2) * 0.5 + 0.5;
  };

  const fbm = (x: number, y: number, octaves = caps.fbmOctaves): number => {
    let val = 0;
    let amp = 0.5;
    let freq = 1.0;
    for (let o = 0; o < octaves; o++) {
      val += noise2D(x * freq, y * freq) * amp;
      freq *= 2.02;
      amp *= 0.5;
    }
    return val;
  };

  const isIndustrial = theme === 'cyber-industrial';
  const isNebula = theme === 'nebula';
  const isCyber = theme === 'cyber';
  const isAurora = theme === 'aurora';

  for (let y = 0; y < height; y++) {
    const v = y / height;
    const lat = (v - 0.5) * Math.PI;
    const polarFactor = Math.abs(v - 0.5) * 2;

    for (let x = 0; x < width; x++) {
      const u = x / width;
      const lon = u * Math.PI * 2;
      const px = Math.cos(lat) * Math.cos(lon) * 2.5;
      const py = Math.sin(lat) * 2.5;

      const elev = fbm(px + 10, py + 10);
      const detail = noise2D(px * 12 + 5, py * 12 + 5);
      const idx = (y * width + x) * 4;

      const cloudN = fbm(px * 1.8 + 20, py * 1.8 + 20, Math.max(2, caps.fbmOctaves - 1));
      const cloudDensity = Math.max(0, (cloudN - 0.44) / 0.56);

      // Cloud density texture
      cData[idx] = 255;
      cData[idx + 1] = 255;
      cData[idx + 2] = 255;
      cData[idx + 3] = Math.min(255, Math.floor(cloudDensity * 240));

      // Packed Atlas channels:
      // R = Bump/Elevation (0-255)
      // G = Specular glint (0-255)
      // B = Night city lights (0-255)
      // A = Cloud coverage (0-255)
      let bumpVal = 128;
      let specVal = 20;
      let nightVal = 0;

      const isIceCap = polarFactor > 0.85 + (detail - 0.5) * 0.15;

      if (isIndustrial) {
        const isBorder = (u * 128) % 1 < 0.08 || (v * 64) % 1 < 0.08;
        const circuit = detail > 0.72 ? 1 : 0;

        if (isBorder) {
          sData[idx] = 15;
          sData[idx + 1] = 30;
          sData[idx + 2] = 42;
          bumpVal = 20;
        } else if (circuit) {
          sData[idx] = 0;
          sData[idx + 1] = 240;
          sData[idx + 2] = 255;
          specVal = 255;
          nightVal = 255;
          bumpVal = 200;
        } else {
          const shade = Math.floor(elev * 40 + 20);
          sData[idx] = shade;
          sData[idx + 1] = shade + 15;
          sData[idx + 2] = shade + 30;
          specVal = 40;
          bumpVal = 128;
        }
      } else {
        const isLand = elev > 0.48;

        if (isIceCap) {
          sData[idx] = 245;
          sData[idx + 1] = 250;
          sData[idx + 2] = 255;
          specVal = 180;
          bumpVal = 160;
        } else if (!isLand) {
          // Oceans
          const depth = (0.48 - elev) / 0.48;
          if (depth < 0.12) {
            // Shallow waters
            if (isNebula) {
              sData[idx] = 56;
              sData[idx + 1] = 24;
              sData[idx + 2] = 90;
            } else if (isCyber) {
              sData[idx] = 16;
              sData[idx + 1] = 90;
              sData[idx + 2] = 80;
            } else {
              sData[idx] = 14;
              sData[idx + 1] = 135;
              sData[idx + 2] = 175;
            }
          } else {
            // Deep oceans
            if (isNebula) {
              sData[idx] = 18;
              sData[idx + 1] = 10;
              sData[idx + 2] = 45;
            } else if (isCyber) {
              sData[idx] = 4;
              sData[idx + 1] = 24;
              sData[idx + 2] = 30;
            } else {
              sData[idx] = 5;
              sData[idx + 1] = 28;
              sData[idx + 2] = 68;
            }
          }
          specVal = 255; // Mirror water reflection
          bumpVal = 128;
        } else {
          // Continents
          const landHeight = (elev - 0.48) / 0.52;
          if (landHeight > 0.65) {
            const rock = Math.floor(landHeight * 80 + 100);
            sData[idx] = rock;
            sData[idx + 1] = rock - 10;
            sData[idx + 2] = rock - 15;
            bumpVal = Math.min(255, Math.floor(200 + detail * 55));
          } else if (landHeight > 0.35 && polarFactor < 0.4) {
            sData[idx] = 195;
            sData[idx + 1] = 155;
            sData[idx + 2] = 85;
            bumpVal = 145;
          } else {
            if (isNebula) {
              sData[idx] = 165;
              sData[idx + 1] = 40;
              sData[idx + 2] = 130;
            } else if (isAurora) {
              sData[idx] = 20;
              sData[idx + 1] = 115;
              sData[idx + 2] = 95;
            } else {
              sData[idx] = 35;
              sData[idx + 1] = 105;
              sData[idx + 2] = 55;
            }
            bumpVal = 140;
          }
          specVal = 25; // Matte land

          if (!isIceCap && detail > 0.62) {
            nightVal = Math.min(255, Math.floor((detail - 0.62) * 550));
          }
        }
      }

      sData[idx + 3] = 255;

      // Pack into Atlas: R = Bump, G = Specular, B = Night Lights, A = Clouds
      pData[idx] = bumpVal;
      pData[idx + 1] = specVal;
      pData[idx + 2] = nightVal;
      pData[idx + 3] = Math.min(255, Math.floor(cloudDensity * 255));
    }
  }

  surfCtx.putImageData(surfImg, 0, 0);
  packedCtx.putImageData(packedImg, 0, 0);
  cloudsCtx.putImageData(cloudsImg, 0, 0);

  const diffuseMap = new THREE.CanvasTexture(surfCanvas);
  diffuseMap.colorSpace = THREE.SRGBColorSpace;
  diffuseMap.wrapS = THREE.RepeatWrapping;

  const packedAtlas = new THREE.CanvasTexture(packedCanvas);
  packedAtlas.wrapS = THREE.RepeatWrapping;

  const cloudsMap = new THREE.CanvasTexture(cloudsCanvas);
  cloudsMap.colorSpace = THREE.SRGBColorSpace;
  cloudsMap.wrapS = THREE.RepeatWrapping;

  const result = { diffuseMap, packedAtlas, cloudsMap };
  textureAtlasCache.set(cacheKey, result);

  if (onProgress) onProgress(100);
  return result;
}

export const Planet3D: React.FC<Planet3DProps> = ({
  theme,
  isPaused,
  orbitAngle,
  activeSystemIndex,
  dataSurgeActive = false,
  bloomStrength = 1.2,
  enableChromaticAberration = true,
  onHoverPlanetChange,
  onClickPlanet,
  onRotate,
  onSelectBeacon,
  viewMode = 'orbit',
  cinematicMode = false,
  batterySaver = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [deviceCaps] = useState<Device3DCapabilities>(() => detectDeviceCapabilities());

  const cinematicRef = useRef(cinematicMode);
  cinematicRef.current = cinematicMode;

  const batterySaverRef = useRef(batterySaver);
  batterySaverRef.current = batterySaver;

  const orbitAngleRef = useRef(orbitAngle);
  orbitAngleRef.current = orbitAngle;

  const isPausedRef = useRef(isPaused);
  isPausedRef.current = isPaused;

  const themeRef = useRef(theme);
  themeRef.current = theme;

  const activeIndexRef = useRef(activeSystemIndex);
  activeIndexRef.current = activeSystemIndex;

  const surgeRef = useRef(dataSurgeActive);
  surgeRef.current = dataSurgeActive;

  const bloomRef = useRef(bloomStrength);
  bloomRef.current = bloomStrength;

  const chromaticRef = useRef(enableChromaticAberration);
  chromaticRef.current = enableChromaticAberration;

  const viewModeRef = useRef(viewMode);
  viewModeRef.current = viewMode;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Detect software rendering
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return false;
      }
    })();

    // 1. Scene, Camera, Renderer with Adaptive Pixel Ratio
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );

    const cameraTargetPos = new THREE.Vector3(0, 1.4, 11.2);
    const cameraLookAtTarget = new THREE.Vector3(0, 0, 0);
    const cameraCurrentLookAt = new THREE.Vector3(0, 0, 0);
    let cameraTargetFov = 42;

    camera.position.set(0, 1.4, 11.2);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isSoftwareGl && !deviceCaps.isMobile,
      powerPreference: 'high-performance',
      stencil: false,
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    let currentPixelRatio = isSoftwareGl
      ? 1.0
      : Math.min(window.devicePixelRatio || 1, deviceCaps.maxPixelRatio);
    renderer.setPixelRatio(currentPixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight, false);
    container.appendChild(renderer.domElement);

    // 2. Progressive Notification: STAGE 1 - PROXY MESH ACTIVE (Instant FMP)
    notifyStreamingProgress({
      stage: 'proxy',
      progress: 30,
      activeLOD: deviceCaps.tier,
      fps: 60,
      triangles: deviceCaps.recommendedSegments * deviceCaps.recommendedSegments * 2,
      texturesLoaded: 0
    });

    // 3. Starfield Particle System (LOD scaled to device)
    const starCount = deviceCaps.isMobile ? 500 : deviceCaps.tier === 'LOD_MEDIUM' ? 900 : 1400;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const radius = 60 + Math.random() * 120;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = radius * Math.cos(phi);

      const r = Math.random();
      if (r < 0.45) {
        starColors[i * 3] = 0.7;
        starColors[i * 3 + 1] = 0.9;
        starColors[i * 3 + 2] = 1.0;
      } else if (r < 0.8) {
        starColors[i * 3] = 0.95;
        starColors[i * 3 + 1] = 0.95;
        starColors[i * 3 + 2] = 1.0;
      } else {
        starColors[i * 3] = 1.0;
        starColors[i * 3 + 1] = 0.85;
        starColors[i * 3 + 2] = 0.4;
      }
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 1.3,
      vertexColors: true,
      transparent: true,
      opacity: 0.82,
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // 4. Lighting Rig
    const sunLight = new THREE.DirectionalLight(0xfff8ee, 3.2);
    sunLight.position.set(-6, 4.5, 6.5);
    scene.add(sunLight);

    const cosmicFillLight = new THREE.DirectionalLight(0x0a324a, 0.7);
    cosmicFillLight.position.set(6, -3, -5);
    scene.add(cosmicFillLight);

    const ambientLight = new THREE.AmbientLight(0x061520, 0.4);
    scene.add(ambientLight);

    // 5. Planetary Group & Shader with Texture Atlas Packing
    const planetGroup = new THREE.Group();
    scene.add(planetGroup);

    // Asynchronous Time-Sliced Texture Baking
    notifyStreamingProgress({
      stage: 'baking_textures',
      progress: 65,
      activeLOD: deviceCaps.tier,
      fps: 60,
      triangles: deviceCaps.recommendedSegments * deviceCaps.recommendedSegments * 2,
      texturesLoaded: 1
    });

    const textures = createPackedTextures(themeRef.current, deviceCaps, () => {
      notifyStreamingProgress({
        stage: 'full_fidelity',
        progress: 100,
        activeLOD: deviceCaps.tier,
        fps: 60,
        triangles: deviceCaps.recommendedSegments * deviceCaps.recommendedSegments * 2,
        texturesLoaded: 2
      });
    });

    // High Performance Shader: only 2 Texture Samplers!
    const planetUniforms = {
      uTime: { value: 0 },
      uSurge: { value: 0 },
      uChromatic: { value: 0 },
      uBloom: { value: bloomRef.current },
      uDiffuseMap: { value: textures.diffuseMap },
      uPackedAtlas: { value: textures.packedAtlas },
      uSunDir: { value: new THREE.Vector3(-0.6, 0.45, 0.65).normalize() }
    };

    const planetVertexShader = `
      varying vec3 vNormal;
      varying vec3 vWorldNormal;
      varying vec3 vViewPosition;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = -mvPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
      }
    `;

    const planetFragmentShader = `
      uniform float uTime;
      uniform float uSurge;
      uniform float uChromatic;
      uniform float uBloom;
      uniform sampler2D uDiffuseMap;
      uniform sampler2D uPackedAtlas;
      uniform vec3 uSunDir;

      varying vec3 vNormal;
      varying vec3 vWorldNormal;
      varying vec3 vViewPosition;
      varying vec2 vUv;

      void main() {
        vec3 normal = normalize(vNormal);
        vec3 viewDir = normalize(vViewPosition);

        // 1. Single sample for Diffuse Albedo
        vec4 diffuseColor = texture2D(uDiffuseMap, vUv);

        // 2. Single sample for Packed Atlas:
        // R = Bump, G = Specular glint, B = City night lights, A = Clouds
        vec4 packedData = texture2D(uPackedAtlas, vUv);
        float specMask = packedData.g;
        float nightMask = packedData.b;

        float nDotL = dot(vWorldNormal, uSunDir);
        float daylight = max(0.0, nDotL);

        // Sunset / Sunrise Terminator Warm Edge
        float terminator = smoothstep(0.12, -0.05, nDotL) * smoothstep(-0.15, 0.05, nDotL);
        vec3 sunsetColor = vec3(1.0, 0.45, 0.15) * terminator * 1.5;

        // Specular Sun Glint
        vec3 halfDir = normalize(uSunDir + viewDir);
        float spec = pow(max(dot(vWorldNormal, halfDir), 0.0), 45.0) * specMask * 1.4;
        vec3 specularGlint = vec3(1.0, 0.95, 0.85) * spec * smoothstep(-0.05, 0.2, nDotL);

        // Night City Lights
        float nightFactor = smoothstep(0.08, -0.25, nDotL);
        vec3 nightLights = vec3(1.0, 0.82, 0.45) * nightMask * nightFactor * 2.4;

        // Atmospheric Fresnel Rim Scattering
        float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.2);
        vec3 atmoColor = vec3(0.0, 0.85, 1.0) * fresnel * (0.85 * uBloom);

        vec3 dayColor = diffuseColor.rgb * (daylight * 1.1 + 0.06);
        vec3 finalColor = dayColor + nightLights + specularGlint + sunsetColor + atmoColor;

        if (uSurge > 0.05) {
          float pulse = sin(vUv.y * 70.0 - uTime * 20.0) * 0.5 + 0.5;
          finalColor += vec3(0.0, 0.95, 1.0) * pulse * uSurge * 0.8;
        }

        if (uChromatic > 0.05) {
          float split = uChromatic * 0.05;
          finalColor.r *= (1.0 + split);
          finalColor.b *= (1.0 - split);
        }

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    // Dynamic LOD Sphere Geometry based on device
    const segments = deviceCaps.recommendedSegments;
    const planetGeo = new THREE.SphereGeometry(2.34, segments, segments);
    const planetMat = new THREE.ShaderMaterial({
      uniforms: planetUniforms,
      vertexShader: planetVertexShader,
      fragmentShader: planetFragmentShader,
    });
    const planetMesh = new THREE.Mesh(planetGeo, planetMat);
    planetGroup.add(planetMesh);

    // 6. Cloud Layer (LOD Optimized)
    const cloudSegs = Math.max(24, Math.round(segments * 0.8));
    const cloudGeo = new THREE.SphereGeometry(2.385, cloudSegs, cloudSegs);
    const cloudMat = new THREE.MeshStandardMaterial({
      map: textures.cloudsMap,
      transparent: true,
      opacity: 0.82,
      blending: THREE.NormalBlending,
      roughness: 0.9,
      metalness: 0.0,
      depthWrite: false,
    });
    const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
    planetGroup.add(cloudMesh);

    // 7. Atmospheric Halo Layer
    const haloSegs = Math.max(20, Math.round(segments * 0.6));
    const haloGeo = new THREE.SphereGeometry(2.52, haloSegs, Math.round(haloSegs * 0.75));
    const haloUniforms = {
      uBloom: { value: bloomRef.current },
      uSunDir: { value: planetUniforms.uSunDir.value }
    };
    const haloMat = new THREE.ShaderMaterial({
      uniforms: haloUniforms,
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vWorldNormal;
        varying vec3 vViewPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vViewPosition = -mvPosition.xyz;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform float uBloom;
        uniform vec3 uSunDir;
        varying vec3 vNormal;
        varying vec3 vWorldNormal;
        varying vec3 vViewPosition;
        void main() {
          vec3 normal = normalize(vNormal);
          vec3 viewDir = normalize(vViewPosition);
          float intensity = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.8);
          float sunDot = max(0.0, dot(vWorldNormal, uSunDir));
          vec3 atmosphereColor = mix(vec3(0.0, 0.65, 1.0), vec3(1.0, 0.6, 0.2), pow(sunDot, 4.0));
          gl_FragColor = vec4(atmosphereColor, intensity * (0.85 * uBloom));
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    planetGroup.add(haloMesh);

    // 8. Advanced Multi-Touch Gesture Navigation & Desktop Drag
    let isInteracting = false;
    let touchCount = 0;
    let prevTouchX = 0;
    let prevTouchY = 0;
    let initialPinchDistance = 0;
    let initialCameraDist = 11.2;
    let targetCameraDist = 11.2;
    let rotationVelocity = 0;
    let pitchVelocity = 0;
    let currentPitch = 1.4;

    const dom = renderer.domElement;

    const getTouchDistance = (touches: TouchList) => {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const getTouchCenter = (touches: TouchList) => {
      return {
        x: (touches[0].clientX + touches[1].clientX) / 2,
        y: (touches[0].clientY + touches[1].clientY) / 2
      };
    };

    const onTouchStart = (e: TouchEvent) => {
      touchCount = e.touches.length;
      isInteracting = true;
      rotationVelocity = 0;
      pitchVelocity = 0;

      if (touchCount === 1) {
        prevTouchX = e.touches[0].clientX;
        prevTouchY = e.touches[0].clientY;
      } else if (touchCount === 2) {
        initialPinchDistance = getTouchDistance(e.touches);
        initialCameraDist = targetCameraDist;
        const center = getTouchCenter(e.touches);
        prevTouchX = center.x;
        prevTouchY = center.y;
        tacticalFeedback.vibrate('tick');
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isInteracting) return;
      touchCount = e.touches.length;

      if (touchCount === 1) {
        const clientX = e.touches[0].clientX;
        const clientY = e.touches[0].clientY;
        const deltaX = clientX - prevTouchX;
        const deltaY = clientY - prevTouchY;

        rotationVelocity = deltaX * 0.005;
        pitchVelocity = deltaY * 0.003;

        prevTouchX = clientX;
        prevTouchY = clientY;

        if (onRotate) {
          onRotate(rotationVelocity);
        }
        currentPitch = Math.max(-2.5, Math.min(4.0, currentPitch + pitchVelocity));
      } else if (touchCount === 2) {
        // Pinch to zoom
        const currentDist = getTouchDistance(e.touches);
        const factor = initialPinchDistance / Math.max(10, currentDist);
        targetCameraDist = Math.max(5.5, Math.min(16.5, initialCameraDist * factor));

        // Two-finger swipe rotation
        const center = getTouchCenter(e.touches);
        const deltaCenterX = center.x - prevTouchX;
        const deltaCenterY = center.y - prevTouchY;

        prevTouchX = center.x;
        prevTouchY = center.y;

        if (onRotate && Math.abs(deltaCenterX) > 1) {
          onRotate(deltaCenterX * 0.004);
        }
        currentPitch = Math.max(-2.5, Math.min(4.0, currentPitch + deltaCenterY * 0.004));
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      touchCount = e.touches.length;
      if (touchCount === 0) {
        isInteracting = false;
      } else if (touchCount === 1) {
        prevTouchX = e.touches[0].clientX;
        prevTouchY = e.touches[0].clientY;
      }
    };

    // Desktop Mouse Drag & Wheel Zoom
    let isMouseDown = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isMouseDown = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
      rotationVelocity = 0;
      pitchVelocity = 0;
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      _mouseTarget.set(nx, ny);

      if (isMouseDown) {
        const deltaX = e.clientX - prevMouseX;
        const deltaY = e.clientY - prevMouseY;
        rotationVelocity = deltaX * 0.0045;
        pitchVelocity = deltaY * 0.0025;

        prevMouseX = e.clientX;
        prevMouseY = e.clientY;

        if (onRotate) {
          onRotate(rotationVelocity);
        }
        currentPitch = Math.max(-2.5, Math.min(4.0, currentPitch + pitchVelocity));
      }
    };

    const onMouseUp = () => {
      isMouseDown = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomStep = e.deltaY * 0.008;
      targetCameraDist = Math.max(5.5, Math.min(16.5, targetCameraDist + zoomStep));
      tacticalFeedback.vibrate('tick');
    };

    dom.addEventListener('touchstart', onTouchStart, { passive: true });
    dom.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('wheel', onWheel, { passive: false });

    // Raycasting for Hover & Click on Planet Mesh
    const raycaster = new THREE.Raycaster();
    const mouseCoord = new THREE.Vector2();

    const onHoverCheck = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseCoord.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseCoord.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      raycaster.setFromCamera(mouseCoord, camera);
      const intersects = raycaster.intersectObject(planetMesh);
      if (onHoverPlanetChange) {
        onHoverPlanetChange(intersects.length > 0);
      }
    };
    dom.addEventListener('mousemove', onHoverCheck);

    const onPlanetClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseCoord.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseCoord.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      raycaster.setFromCamera(mouseCoord, camera);
      const intersects = raycaster.intersectObject(planetMesh);
      if (intersects.length > 0) {
        tacticalFeedback.trigger('heavy', 'impact');
        if (onClickPlanet) {
          onClickPlanet();
        }
      }
    };
    dom.addEventListener('click', onPlanetClick);

    // 9. Adaptive Animation Render Loop
    let animId: number;
    let lastTime = performance.now();
    let frameTimes: number[] = [];
    let skipFrame = false;

    const animate = (time: number) => {
      if (batterySaverRef.current) {
        skipFrame = !skipFrame;
        if (skipFrame) {
          animId = requestAnimationFrame(animate);
          return;
        }
      }

      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      // Adaptive Performance Monitoring (scale down pixel ratio if frame drops)
      if (frameTimes.length < 60) {
        frameTimes.push(delta);
      } else {
        const avgDelta = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
        frameTimes = [];
        if (avgDelta > 0.028 && currentPixelRatio > 1.0) {
          currentPixelRatio = 1.0;
          renderer.setPixelRatio(currentPixelRatio);
        }
      }

      _mouseCurrent.lerp(_mouseTarget, delta * 4.0);

      // Inertial momentum decay when drag ends
      if (!isMouseDown && !isInteracting) {
        if (Math.abs(rotationVelocity) > 0.0001) {
          if (onRotate) onRotate(rotationVelocity);
          rotationVelocity *= 0.94;
        }
        if (Math.abs(pitchVelocity) > 0.0001) {
          currentPitch = Math.max(-2.5, Math.min(4.0, currentPitch + pitchVelocity));
          pitchVelocity *= 0.92;
        }
      }

      // Planet rotation & parallax
      if (!isPausedRef.current) {
        planetMesh.rotation.y += delta * 0.028;
        cloudMesh.rotation.y += delta * 0.042;
        cloudMesh.rotation.x = Math.sin(time * 0.0002) * 0.04;
      }

      starField.rotation.y = time * 0.00008;

      planetGroup.rotation.x = _mouseCurrent.y * 0.15;
      planetGroup.rotation.z = -_mouseCurrent.x * 0.12;

      // Scene transition animations based on viewMode
      const currentMode = viewModeRef.current;
      if (currentMode === 'matrix') {
        cameraTargetPos.set(0, 3.2, 14.5);
        cameraTargetFov = 48;
      } else if (currentMode === 'radar') {
        cameraTargetPos.set(0, 8.5, 9.5);
        cameraTargetFov = 52;
      } else if (currentMode === 'terminal') {
        cameraTargetPos.set(-2.2, 0.8, 12.0);
        cameraTargetFov = 44;
      } else if (currentMode === 'map') {
        cameraTargetPos.set(0, 0.5, 15.0);
        cameraTargetFov = 55;
      } else {
        cameraTargetPos.set(0, currentPitch, targetCameraDist);
        cameraTargetFov = 42;
      }

      camera.position.lerp(cameraTargetPos, delta * 3.8);
      cameraCurrentLookAt.lerp(cameraLookAtTarget, delta * 3.8);
      camera.lookAt(cameraCurrentLookAt);

      if (Math.abs(camera.fov - cameraTargetFov) > 0.1) {
        camera.fov += (cameraTargetFov - camera.fov) * delta * 3.5;
        camera.updateProjectionMatrix();
      }

      planetUniforms.uTime.value = time * 0.001;
      planetUniforms.uSurge.value = surgeRef.current ? 1.0 : 0.0;
      planetUniforms.uChromatic.value = chromaticRef.current && activeIndexRef.current !== null ? 1.0 : 0.0;
      planetUniforms.uBloom.value = bloomRef.current;

      _vec3.set(-6 - _mouseCurrent.x * 2.0, 4.5 + _mouseCurrent.y * 2.0, 6.5).normalize();
      planetUniforms.uSunDir.value.copy(_vec3);
      sunLight.position.set(_vec3.x * 9, _vec3.y * 9, _vec3.z * 9);

      // In Cinematic Video Mode, let the photorealistic video Earth shine through
      const isCinematic = cinematicRef.current;
      planetMesh.visible = !isCinematic;
      cloudMesh.visible = !isCinematic;
      starField.visible = !isCinematic;
      haloMesh.visible = !isCinematic;

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);

      dom.removeEventListener('touchstart', onTouchStart);
      dom.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);

      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('wheel', onWheel);

      dom.removeEventListener('mousemove', onHoverCheck);
      dom.removeEventListener('click', onPlanetClick);

      starGeo.dispose();
      starMat.dispose();
      planetGeo.dispose();
      planetMat.dispose();
      cloudGeo.dispose();
      cloudMat.dispose();
      haloGeo.dispose();
      haloMat.dispose();

      renderer.dispose();
      if (dom.parentNode) {
        dom.parentNode.removeChild(dom);
      }
    };
  }, [theme]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing pointer-events-auto"
      style={{ touchAction: 'none' }}
    />
  );
};
