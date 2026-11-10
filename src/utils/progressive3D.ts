// Progressive 3D Asset Streaming & Geometry LOD Architecture Utility
export type LODTier = 'LOD_HIGH' | 'LOD_MEDIUM' | 'LOD_LOW';

export interface Device3DCapabilities {
  isMobile: boolean;
  tier: LODTier;
  recommendedSegments: number;
  recommendedTextureSize: { width: number; height: number };
  maxPixelRatio: number;
  fbmOctaves: number;
}

export interface StreamingProgressEvent {
  stage: 'proxy' | 'baking_textures' | 'high_res_complete' | 'full_fidelity';
  progress: number; // 0 to 100
  activeLOD: string;
  fps: number;
  triangles: number;
  texturesLoaded: number;
}

/**
 * Detects device hardware profile to determine optimal LOD and texture bounds
 */
export function detectDeviceCapabilities(): Device3DCapabilities {
  const isMobile =
    typeof window !== 'undefined'
      ? window.innerWidth < 768 ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      : false;

  const isTablet =
    typeof window !== 'undefined' && !isMobile && window.innerWidth < 1024;

  if (isMobile) {
    return {
      isMobile: true,
      tier: 'LOD_LOW',
      recommendedSegments: 28, // 28x28 sphere = 1,568 tris (vs 8,192 tris on desktop) -> 80% reduction
      recommendedTextureSize: { width: 1024, height: 512 },
      maxPixelRatio: 1.25,
      fbmOctaves: 3
    };
  }

  if (isTablet) {
    return {
      isMobile: false,
      tier: 'LOD_MEDIUM',
      recommendedSegments: 44, // 44x44 sphere = 3,872 tris
      recommendedTextureSize: { width: 1024, height: 512 },
      maxPixelRatio: 1.5,
      fbmOctaves: 4
    };
  }

  return {
    isMobile: false,
    tier: 'LOD_HIGH',
    recommendedSegments: 64, // 64x64 sphere = 8,192 tris (Desktop Ultra)
    recommendedTextureSize: { width: 2048, height: 1024 },
    maxPixelRatio: 1.75,
    fbmOctaves: 5
  };
}

/**
 * Broadcasts progressive 3D streaming progress to HUD telemetry components
 */
export function notifyStreamingProgress(detail: StreamingProgressEvent) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('reyplace-3d-stream-progress', { detail })
    );
  }
}
