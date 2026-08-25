/**
 * High-performance Mass-Spring & Tension Ray Fabric Physics Math
 * Generates dynamic 2D cloth vertex mesh deformations, pinch creases,
 * tension rays, and fold shadow calculations for scroll-driven animations.
 */

export class ClothMesh {
  constructor(cols = 28, rows = 28) {
    this.cols = cols;
    this.rows = rows;
    this.vertices = [];
    this.triangles = [];
    this.initMesh();
  }

  initMesh() {
    this.vertices = [];
    for (let r = 0; r <= this.rows; r++) {
      for (let c = 0; c <= this.cols; c++) {
        const u = c / this.cols;
        const v = r / this.rows;
        this.vertices.push({
          u,
          v,
          x: u,
          y: v,
          baseX: u,
          baseY: v,
          vx: 0,
          vy: 0,
          shade: 1.0,
        });
      }
    }

    this.triangles = [];
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const i0 = r * (this.cols + 1) + c;
        const i1 = i0 + 1;
        const i2 = (r + 1) * (this.cols + 1) + c;
        const i3 = i2 + 1;

        // Two triangles per quad
        this.triangles.push([i0, i1, i2]);
        this.triangles.push([i1, i3, i2]);
      }
    }
  }

  /**
   * Updates vertex positions based on scroll progress (0.0 to 1.0)
   * @param {number} progress - Scroll progress
   * @param {Object} gripPoint - Normalized coordinates {x, y} where hand grabs cloth
   */
  update(progress, gripPoint = { x: 0.62, y: 0.52 }) {
    // Phase breakdown:
    // 0.00 - 0.35: Idle resting
    // 0.35 - 0.50: Initial touch & finger compression
    // 0.50 - 0.85: Dynamic upward pull & tension ray deformation
    // 0.85 - 1.00: Release & lift off
    
    const touchProgress = Math.max(0, Math.min(1, (progress - 0.35) / 0.15));
    const pullProgress = Math.max(0, Math.min(1, (progress - 0.48) / 0.37));
    const releaseProgress = Math.max(0, Math.min(1, (progress - 0.85) / 0.15));

    const pullY = pullProgress * -1.25; // Pulls upward
    const pullX = pullProgress * 0.12;  // Slight natural diagonal tilt to right

    for (let i = 0; i < this.vertices.length; i++) {
      const v = this.vertices[i];
      const dx = v.baseX - gripPoint.x;
      const dy = v.baseY - gripPoint.y;
      const dist = Math.hypot(dx, dy);

      // 1. Initial touch compression & micro-crease
      let pinchX = 0;
      let pinchY = 0;
      if (touchProgress > 0 && dist < 0.35) {
        const pinchIntensity = Math.sin(touchProgress * Math.PI) * (1 - dist / 0.35);
        pinchX = -dx * pinchIntensity * 0.14;
        pinchY = -dy * pinchIntensity * 0.14;
      }

      // 2. Upward pull deformation with catenary drape lag
      let liftX = 0;
      let liftY = 0;
      let waveShade = 1.0;

      if (pullProgress > 0) {
        // Influence field: vertices near grip move directly with hand,
        // while lower/distant vertices lag behind creating realistic fabric drape
        const influence = Math.exp(-dist * 1.8);
        const verticalLag = Math.pow(Math.max(0, v.baseY - gripPoint.y), 1.4) * 0.4;

        liftX = (pullX * (influence + 0.35 * (1 - v.baseY))) + pinchX;
        liftY = (pullY * (influence * 0.85 + (1 - influence) * 0.55) - verticalLag * pullProgress);

        // 3. Realistic tension wrinkles & fold lines
        const angleFromGrip = Math.atan2(dy, dx);
        const wrinkleFreq = 22.0;
        const wrinkleWave = Math.sin(dist * wrinkleFreq - pullProgress * 8.0) * Math.cos(angleFromGrip * 3.0);
        const wrinkleIntensity = pullProgress * Math.exp(-dist * 2.2) * 0.025;

        liftX += wrinkleWave * wrinkleIntensity;
        liftY += wrinkleWave * wrinkleIntensity * 1.5;

        // 4. Dynamic fold shading (deeper shadows in valleys, specular on ridges)
        waveShade = 1.0 + wrinkleWave * 0.22 * pullProgress;
      }

      // 5. Release settle
      if (releaseProgress > 0) {
        const settle = Math.sin(releaseProgress * Math.PI * 2) * Math.exp(-releaseProgress * 3.5) * 0.05;
        liftY += settle;
      }

      v.x = v.baseX + liftX;
      v.y = v.baseY + liftY;
      v.shade = Math.max(0.65, Math.min(1.35, waveShade));
    }
  }
}
