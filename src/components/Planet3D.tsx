import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { PlanetTheme } from '../types/system';

interface Planet3DProps {
  theme: PlanetTheme;
  isPaused: boolean;
  orbitAngle: number;
  activeSystemIndex: number | null;
  dataSurgeActive?: boolean;
  bloomStrength?: number;
  enableChromaticAberration?: boolean;
  onHoverPlanetChange?: (isHovered: boolean) => void;
  onRotate?: (deltaAngle: number) => void;
  onSelectBeacon?: (index: number) => void;
}

// Preallocated math objects outside render loop to enforce ZERO GC
const _vec3 = new THREE.Vector3();
const _mouseTarget = new THREE.Vector2(0, 0);
const _mouseCurrent = new THREE.Vector2(0, 0);

// Helper for 2D coherent noise approximation for procedural HD planet textures
function generatePlanetTextures(theme: PlanetTheme): {
  diffuseMap: THREE.CanvasTexture;
  cloudsMap: THREE.CanvasTexture;
  nightLightsMap: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
  specularMap: THREE.CanvasTexture;
} {
  const width = 2048;
  const height = 1024;

  // 1. Surface Albedo (Diffuse), Specular, Bump and Night Lights Canvases
  const surfCanvas = document.createElement('canvas');
  surfCanvas.width = width;
  surfCanvas.height = height;
  const surfCtx = surfCanvas.getContext('2d')!;

  const cloudsCanvas = document.createElement('canvas');
  cloudsCanvas.width = width;
  cloudsCanvas.height = height;
  const cloudsCtx = cloudsCanvas.getContext('2d')!;

  const nightCanvas = document.createElement('canvas');
  nightCanvas.width = width;
  nightCanvas.height = height;
  const nightCtx = nightCanvas.getContext('2d')!;

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = width;
  bumpCanvas.height = height;
  const bumpCtx = bumpCanvas.getContext('2d')!;

  const specCanvas = document.createElement('canvas');
  specCanvas.width = width;
  specCanvas.height = height;
  const specCtx = specCanvas.getContext('2d')!;

  // Default deep space base
  const surfImg = surfCtx.createImageData(width, height);
  const cloudsImg = cloudsCtx.createImageData(width, height);
  const nightImg = nightCtx.createImageData(width, height);
  const bumpImg = bumpCtx.createImageData(width, height);
  const specImg = specCtx.createImageData(width, height);

  const sData = surfImg.data;
  const cData = cloudsImg.data;
  const nData = nightImg.data;
  const bData = bumpImg.data;
  const spData = specImg.data;

  // Simple pseudo-random hash & value noise
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

  const fbm = (x: number, y: number, octaves = 5): number => {
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

  // Color profiles per theme
  const isIndustrial = theme === 'cyber-industrial';
  const isNebula = theme === 'nebula';
  const isCyber = theme === 'cyber';
  const isAurora = theme === 'aurora';

  for (let y = 0; y < height; y++) {
    const v = y / height;
    const lat = (v - 0.5) * Math.PI; // -PI/2 to PI/2
    const polarFactor = Math.abs(v - 0.5) * 2; // 0 at equator, 1 at poles

    for (let x = 0; x < width; x++) {
      const u = x / width;
      const lon = u * Math.PI * 2;
      const px = Math.cos(lat) * Math.cos(lon) * 2.5;
      const py = Math.sin(lat) * 2.5;
      const pz = Math.cos(lat) * Math.sin(lon) * 2.5;

      // Multi-frequency continent elevation
      const elev = fbm(px + 10, py + 10, 6);
      const detail = noise2D(px * 12 + 5, py * 12 + 5);
      const idx = (y * width + x) * 4;

      // Cloud noise with cyclonic spiral bands
      const cloudN = fbm(px * 1.8 + 20, py * 1.8 + 20, 5);
      const cloudDensity = Math.max(0, (cloudN - 0.44) / 0.56);

      // Clouds texture
      cData[idx] = 255;
      cData[idx + 1] = 255;
      cData[idx + 2] = 255;
      cData[idx + 3] = Math.min(255, Math.floor(cloudDensity * 240));

      // Polar Ice Caps
      const isIceCap = polarFactor > 0.85 + (detail - 0.5) * 0.15;

      if (isIndustrial) {
        // Cyber-industrial world: metallic plates, circuitry, hazard sectors
        const gridX = Math.floor(u * 128);
        const gridY = Math.floor(v * 64);
        const isBorder = (u * 128) % 1 < 0.08 || (v * 64) % 1 < 0.08;
        const circuit = detail > 0.72 ? 1 : 0;

        if (isBorder) {
          sData[idx] = 15;
          sData[idx + 1] = 30;
          sData[idx + 2] = 42;
        } else if (circuit) {
          sData[idx] = 0;
          sData[idx + 1] = 240;
          sData[idx + 2] = 255;
        } else {
          const shade = Math.floor(elev * 40 + 20);
          sData[idx] = shade;
          sData[idx + 1] = shade + 15;
          sData[idx + 2] = shade + 30;
        }
        sData[idx + 3] = 255;

        // Specular & Bump
        spData[idx] = circuit ? 255 : 40;
        spData[idx + 1] = spData[idx];
        spData[idx + 2] = spData[idx];
        spData[idx + 3] = 255;

        bData[idx] = isBorder ? 20 : 128;
        bData[idx + 1] = bData[idx];
        bData[idx + 2] = bData[idx];
        bData[idx + 3] = 255;

        // Night lights
        if (circuit || detail > 0.65) {
          nData[idx] = 0;
          nData[idx + 1] = 240;
          nData[idx + 2] = 255;
          nData[idx + 3] = 255;
        } else {
          nData[idx] = 0;
          nData[idx + 1] = 0;
          nData[idx + 2] = 0;
          nData[idx + 3] = 0;
        }
      } else {
        // Natural Terrestrial / Photorealistic Earth & Alien Worlds
        const isLand = elev > 0.48;

        if (isIceCap) {
          // Glacier / Polar Snow
          sData[idx] = 245;
          sData[idx + 1] = 250;
          sData[idx + 2] = 255;
          spData[idx] = 180; // High snow reflectivity
          bData[idx] = 160;
        } else if (!isLand) {
          // Ocean Water
          const depth = (0.48 - elev) / 0.48;
          if (depth < 0.12) {
            // Continental shallow shelf (Aqua / Turquoise)
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
            // Deep oceanic trench (Deep Blue / Indigo)
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
          spData[idx] = 255; // Mirror water specular
          bData[idx] = 128; // Smooth water surface
        } else {
          // Landmasses (Rainforests, Grasslands, Savannas, Mountains)
          const landHeight = (elev - 0.48) / 0.52;
          if (landHeight > 0.65) {
            // Mountain peaks & rocky ridges
            const rock = Math.floor(landHeight * 80 + 100);
            sData[idx] = rock;
            sData[idx + 1] = rock - 10;
            sData[idx + 2] = rock - 15;
            bData[idx] = Math.min(255, Math.floor(200 + detail * 55));
          } else if (landHeight > 0.35 && polarFactor < 0.4) {
            // Arid Savannas / Golden Deserts
            sData[idx] = 195;
            sData[idx + 1] = 155;
            sData[idx + 2] = 85;
            bData[idx] = 145;
          } else {
            // Lush green forests & temperate valleys
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
            bData[idx] = 140;
          }
          spData[idx] = 25; // Matte land surface
        }

        sData[idx + 3] = 255;
        spData[idx + 1] = spData[idx];
        spData[idx + 2] = spData[idx];
        spData[idx + 3] = 255;
        bData[idx + 1] = bData[idx];
        bData[idx + 2] = bData[idx];
        bData[idx + 3] = 255;

        // Golden & Amber City Lights on night side (along coasts and land valleys)
        if (isLand && !isIceCap && detail > 0.62) {
          nData[idx] = 255;
          nData[idx + 1] = 210;
          nData[idx + 2] = 110;
          nData[idx + 3] = Math.floor((detail - 0.62) * 500);
        } else {
          nData[idx] = 0;
          nData[idx + 1] = 0;
          nData[idx + 2] = 0;
          nData[idx + 3] = 0;
        }
      }
    }
  }

  surfCtx.putImageData(surfImg, 0, 0);
  cloudsCtx.putImageData(cloudsImg, 0, 0);
  nightCtx.putImageData(nightImg, 0, 0);
  bumpCtx.putImageData(bumpImg, 0, 0);
  specCtx.putImageData(specImg, 0, 0);

  const diffuseMap = new THREE.CanvasTexture(surfCanvas);
  diffuseMap.colorSpace = THREE.SRGBColorSpace;
  diffuseMap.wrapS = THREE.RepeatWrapping;

  const cloudsMap = new THREE.CanvasTexture(cloudsCanvas);
  cloudsMap.colorSpace = THREE.SRGBColorSpace;
  cloudsMap.wrapS = THREE.RepeatWrapping;

  const nightLightsMap = new THREE.CanvasTexture(nightCanvas);
  nightLightsMap.colorSpace = THREE.SRGBColorSpace;
  nightLightsMap.wrapS = THREE.RepeatWrapping;

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;

  const specularMap = new THREE.CanvasTexture(specCanvas);
  specularMap.wrapS = THREE.RepeatWrapping;

  return { diffuseMap, cloudsMap, nightLightsMap, bumpMap, specularMap };
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
  onRotate,
  onSelectBeacon
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
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

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1.4, 11.2);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      stencil: false,
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 1.75));
    renderer.setSize(container.clientWidth, container.clientHeight, false);
    container.appendChild(renderer.domElement);

    // 2. Deep Space 3D Twinkling Starfield Particle System
    const starCount = 1400;
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

      // Star spectral variety (Blue-white, white, gold, red)
      const r = Math.random();
      if (r < 0.4) {
        // Cold blue-white
        starColors[i * 3] = 0.7;
        starColors[i * 3 + 1] = 0.9;
        starColors[i * 3 + 2] = 1.0;
      } else if (r < 0.75) {
        // Diamond white
        starColors[i * 3] = 0.95;
        starColors[i * 3 + 1] = 0.95;
        starColors[i * 3 + 2] = 1.0;
      } else if (r < 0.9) {
        // Golden sun
        starColors[i * 3] = 1.0;
        starColors[i * 3 + 1] = 0.85;
        starColors[i * 3 + 2] = 0.4;
      } else {
        // Red giant
        starColors[i * 3] = 1.0;
        starColors[i * 3 + 1] = 0.45;
        starColors[i * 3 + 2] = 0.45;
      }
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 1.4,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // 3. Dynamic Photorealistic Lighting Rig
    const sunLight = new THREE.DirectionalLight(0xfff8ee, 3.2);
    sunLight.position.set(-6, 4.5, 6.5);
    scene.add(sunLight);

    const cosmicFillLight = new THREE.DirectionalLight(0x0a324a, 0.7);
    cosmicFillLight.position.set(6, -3, -5);
    scene.add(cosmicFillLight);

    const ambientLight = new THREE.AmbientLight(0x061520, 0.4);
    scene.add(ambientLight);

    // 4. Photorealistic Planetary Geometry & Textures
    const planetGroup = new THREE.Group();
    scene.add(planetGroup);

    const textures = generatePlanetTextures(themeRef.current);

    // Realistic Planetary Surface Shader Material with Night Lights & Specular reflection
    const planetUniforms = {
      uTime: { value: 0 },
      uSurge: { value: 0 },
      uChromatic: { value: 0 },
      uBloom: { value: bloomRef.current },
      uDiffuseMap: { value: textures.diffuseMap },
      uNightMap: { value: textures.nightLightsMap },
      uBumpMap: { value: textures.bumpMap },
      uSpecMap: { value: textures.specularMap },
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
      uniform sampler2D uNightMap;
      uniform sampler2D uBumpMap;
      uniform sampler2D uSpecMap;
      uniform vec3 uSunDir;

      varying vec3 vNormal;
      varying vec3 vWorldNormal;
      varying vec3 vViewPosition;
      varying vec2 vUv;

      void main() {
        vec3 normal = normalize(vNormal);
        vec3 viewDir = normalize(vViewPosition);

        // Sample HD Procedural Maps
        vec4 diffuseColor = texture2D(uDiffuseMap, vUv);
        vec4 nightColor = texture2D(uNightMap, vUv);
        float specMask = texture2D(uSpecMap, vUv).r;
        float bumpVal = texture2D(uBumpMap, vUv).r;

        // Sunlight dot calculation
        float nDotL = dot(vWorldNormal, uSunDir);
        float daylight = max(0.0, nDotL);

        // Sunset / Sunrise Terminator Warm Edge (Golden-Amber-Crimson Rim)
        float terminator = smoothstep(0.12, -0.05, nDotL) * smoothstep(-0.15, 0.05, nDotL);
        vec3 sunsetColor = vec3(1.0, 0.45, 0.15) * terminator * 1.5;

        // Specular Sun Glint on Oceans
        vec3 halfDir = normalize(uSunDir + viewDir);
        float spec = pow(max(dot(vWorldNormal, halfDir), 0.0), 45.0) * specMask * 1.4;
        vec3 specularGlint = vec3(1.0, 0.95, 0.85) * spec * smoothstep(-0.05, 0.2, nDotL);

        // Night City Lights on unlit side
        float nightFactor = smoothstep(0.08, -0.25, nDotL);
        vec3 nightLights = nightColor.rgb * nightColor.a * nightFactor * 2.4;

        // Atmospheric Fresnel Rim Scattering
        float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.2);
        vec3 atmoColor = vec3(0.0, 0.85, 1.0) * fresnel * (0.85 * uBloom);

        // Combine Lighting Passes
        vec3 dayColor = diffuseColor.rgb * (daylight * 1.1 + 0.06);
        vec3 finalColor = dayColor + nightLights + specularGlint + sunsetColor + atmoColor;

        // Data Surge response
        if (uSurge > 0.05) {
          float pulse = sin(vUv.y * 70.0 - uTime * 20.0) * 0.5 + 0.5;
          finalColor += vec3(0.0, 0.95, 1.0) * pulse * uSurge * 0.8;
        }

        // Chromatic Aberration Edge Separation
        if (uChromatic > 0.05) {
          float split = uChromatic * 0.05;
          finalColor.r *= (1.0 + split);
          finalColor.b *= (1.0 - split);
        }

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    const planetGeo = new THREE.SphereGeometry(2.34, 64, 64);
    const planetMat = new THREE.ShaderMaterial({
      uniforms: planetUniforms,
      vertexShader: planetVertexShader,
      fragmentShader: planetFragmentShader,
    });
    const planetMesh = new THREE.Mesh(planetGeo, planetMat);
    planetGroup.add(planetMesh);

    // 5. Dynamic Swirling Cloud Layer with Shadow & Transparency
    const cloudGeo = new THREE.SphereGeometry(2.385, 54, 54);
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

    // 6. Volumetric Rayleigh Atmospheric Scattering Halo
    const haloGeo = new THREE.SphereGeometry(2.52, 48, 36);
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

    // 7. Interactive Pointer & Drag Management
    let isDragging = false;
    let prevMouseX = 0;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      prevMouseX = clientX;
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      // Track mouse position for dynamic light response
      const rect = container.getBoundingClientRect();
      const nx = ((clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((clientY - rect.top) / rect.height) * 2 - 1);
      _mouseTarget.set(nx, ny);

      if (isDragging && onRotate) {
        const delta = (clientX - prevMouseX) * 0.005;
        prevMouseX = clientX;
        onRotate(delta);
      }
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onPointerDown);
    dom.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    dom.addEventListener('touchstart', onPointerDown, { passive: true });
    dom.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);

    // Planet hover detection
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

    // 8. Animation Render Loop
    let animId: number;
    let lastTime = performance.now();

    const animate = (time: number) => {
      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      // Smooth pointer parallax
      _mouseCurrent.lerp(_mouseTarget, delta * 4.0);

      // Planet rotation & parallax
      if (!isPausedRef.current) {
        planetMesh.rotation.y += delta * 0.028;
        // Clouds rotate at slightly different speed for authentic planetary parallax!
        cloudMesh.rotation.y += delta * 0.042;
        cloudMesh.rotation.x = Math.sin(time * 0.0002) * 0.04;
      }

      // Starfield subtle slow drift
      starField.rotation.y = time * 0.00008;

      // Dynamic reactive tilt from user pointer
      planetGroup.rotation.x = _mouseCurrent.y * 0.15;
      planetGroup.rotation.z = -_mouseCurrent.x * 0.12;

      // Update uniforms
      planetUniforms.uTime.value = time * 0.001;
      planetUniforms.uSurge.value = surgeRef.current ? 1.0 : 0.0;
      planetUniforms.uChromatic.value = chromaticRef.current && activeIndexRef.current !== null ? 1.0 : 0.0;
      planetUniforms.uBloom.value = bloomRef.current;

      // Dynamic light tracking
      _vec3.set(-6 - _mouseCurrent.x * 2.0, 4.5 + _mouseCurrent.y * 2.0, 6.5).normalize();
      planetUniforms.uSunDir.value.copy(_vec3);
      sunLight.position.set(_vec3.x * 9, _vec3.y * 9, _vec3.z * 9);

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    // Resize listener
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
      dom.removeEventListener('mousedown', onPointerDown);
      dom.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      dom.removeEventListener('touchstart', onPointerDown);
      dom.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);
      dom.removeEventListener('mousemove', onHoverCheck);

      // Dispose resources
      starGeo.dispose();
      starMat.dispose();
      planetGeo.dispose();
      planetMat.dispose();
      cloudGeo.dispose();
      cloudMat.dispose();
      haloGeo.dispose();
      haloMat.dispose();

      textures.diffuseMap.dispose();
      textures.cloudsMap.dispose();
      textures.nightLightsMap.dispose();
      textures.bumpMap.dispose();
      textures.specularMap.dispose();

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
