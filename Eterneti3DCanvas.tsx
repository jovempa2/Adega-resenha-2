import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface Eterneti3DCanvasProps {
  className?: string;
}

export const Eterneti3DCanvas: React.FC<Eterneti3DCanvasProps> = ({ className = '' }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [webGlSupported, setWebGlSupported] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. WebGL Support & Software GL detection
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2') || document.createElement('canvas').getContext('webgl');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Scene & Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x09090b, 0.05);

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 560;

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(0, 0.2, 5.2);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebGlSupported(false);
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 2. Procedural Label Texture Generation (ETERNETI GIN)
    const labelCanvas = document.createElement('canvas');
    labelCanvas.width = 1024;
    labelCanvas.height = 1024;
    const ctx = labelCanvas.getContext('2d')!;

    // Background gradient with matte dark texture
    const grad = ctx.createLinearGradient(0, 0, 1024, 1024);
    grad.addColorStop(0, '#0c0a13');
    grad.addColorStop(0.5, '#13111c');
    grad.addColorStop(1, '#08070d');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 1024);

    // Subtle metallic border frame
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 14;
    ctx.strokeRect(40, 40, 944, 944);

    ctx.strokeStyle = '#e11d48';
    ctx.lineWidth = 4;
    ctx.strokeRect(60, 60, 904, 904);

    // Top Brand Tagline
    ctx.fillStyle = '#a855f7';
    ctx.font = '600 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.letterSpacing = '8px';
    ctx.fillText('ADEGA RESENHA · EDIÇÃO ESPECIAL', 512, 160);

    // Botanical geometric icon
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(512, 260, 48, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#ec4899';
    ctx.beginPath();
    ctx.arc(512, 260, 14, 0, Math.PI * 2);
    ctx.fill();

    // Central Brand Wordmark: ETERNITY
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 114px sans-serif';
    ctx.letterSpacing = '12px';
    ctx.fillText('ETERNITY', 512, 440);

    // Product Category
    ctx.fillStyle = '#fda4af';
    ctx.font = '700 36px sans-serif';
    ctx.letterSpacing = '14px';
    ctx.fillText('LONDON DRY GIN', 512, 530);

    // Divider line
    ctx.strokeStyle = '#9333ea';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(280, 580);
    ctx.lineTo(744, 580);
    ctx.stroke();

    // Specifications
    ctx.fillStyle = '#d4d4d8';
    ctx.font = '500 28px sans-serif';
    ctx.letterSpacing = '4px';
    ctx.fillText('DESTILADO BRASILEIRO PREMIUM', 512, 640);

    ctx.fillStyle = '#a1a1aa';
    ctx.font = '400 24px sans-serif';
    ctx.fillText('BOTÂNICOS SELECIONADOS · ZIMBRO & CÍTRICOS', 512, 700);

    // Volume & Proof
    ctx.fillStyle = '#e4e4e7';
    ctx.font = '700 32px monospace';
    ctx.fillText('1000 ML  ·  38.5% VOL.', 512, 820);

    // Stamp badge
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 3;
    ctx.strokeRect(360, 860, 304, 54);
    ctx.fillStyle = '#c084fc';
    ctx.font = '600 22px sans-serif';
    ctx.letterSpacing = '3px';
    ctx.fillText('COPAO ORIGINAL', 512, 896);

    const labelTexture = new THREE.CanvasTexture(labelCanvas);
    labelTexture.colorSpace = THREE.SRGBColorSpace;
    labelTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

    // 3. Assemble 3D Composite Bottle Group (THREE.Group with 7 parts)
    const bottleGroup = new THREE.Group();

    // Glass Material
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.08,
      roughness: 0.12,
      transmission: isSoftwareGl ? 0 : 0.88,
      transparent: true,
      opacity: isSoftwareGl ? 0.45 : 0.95,
      ior: 1.52,
      thickness: 1.4,
      attenuationColor: new THREE.Color(0xa855f7),
      attenuationDistance: 2.8,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
    });

    // Liquid Material (Gin liquid level)
    const liquidMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xfdf4ff,
      metalness: 0.05,
      roughness: 0.1,
      transmission: isSoftwareGl ? 0 : 0.75,
      transparent: true,
      opacity: 0.6,
      ior: 1.33,
    });

    // Cap & Neck Band Materials
    const capMaterial = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      metalness: 0.92,
      roughness: 0.22,
    });

    const neckBandMaterial = new THREE.MeshStandardMaterial({
      color: 0x581c87, // Deep royal purple
      metalness: 0.4,
      roughness: 0.4,
    });

    // Part 1: Main Glass Body (Cylinder with beveled look)
    const bodyGeo = new THREE.CylinderGeometry(0.72, 0.72, 1.85, 48);
    const bodyMesh = new THREE.Mesh(bodyGeo, glassMaterial);
    bodyMesh.position.y = 0;
    bodyMesh.castShadow = true;
    bottleGroup.add(bodyMesh);

    // Part 2: Liquid Inside Body
    const liquidGeo = new THREE.CylinderGeometry(0.68, 0.68, 1.6, 32);
    const liquidMesh = new THREE.Mesh(liquidGeo, liquidMaterial);
    liquidMesh.position.y = -0.1;
    bottleGroup.add(liquidMesh);

    // Part 3: Curved Bottle Shoulder (Lathe / Cone)
    const shoulderGeo = new THREE.CylinderGeometry(0.24, 0.72, 0.55, 48);
    const shoulderMesh = new THREE.Mesh(shoulderGeo, glassMaterial);
    shoulderMesh.position.y = 1.85 / 2 + 0.55 / 2;
    bottleGroup.add(shoulderMesh);

    // Part 4: Slender Neck
    const neckGeo = new THREE.CylinderGeometry(0.22, 0.24, 0.85, 36);
    const neckMesh = new THREE.Mesh(neckGeo, glassMaterial);
    neckMesh.position.y = 1.85 / 2 + 0.55 + 0.85 / 2;
    bottleGroup.add(neckMesh);

    // Part 5: Glass Lip Ring
    const lipGeo = new THREE.TorusGeometry(0.23, 0.04, 16, 36);
    const lipMesh = new THREE.Mesh(lipGeo, glassMaterial);
    lipMesh.rotation.x = Math.PI / 2;
    lipMesh.position.y = 1.85 / 2 + 0.55 + 0.85;
    bottleGroup.add(lipMesh);

    // Part 6: Metallic Cap
    const capGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.42, 36);
    const capMesh = new THREE.Mesh(capGeo, capMaterial);
    capMesh.position.y = 1.85 / 2 + 0.55 + 0.85 + 0.2;
    bottleGroup.add(capMesh);

    // Part 7: Neck Tamper-Evident Band
    const bandGeo = new THREE.CylinderGeometry(0.255, 0.255, 0.35, 36);
    const bandMesh = new THREE.Mesh(bandGeo, neckBandMaterial);
    bandMesh.position.y = 1.85 / 2 + 0.55 + 0.45;
    bottleGroup.add(bandMesh);

    // Part 8: Front Label Decal (Curved cylindrical plate mapped with ETERNETI label)
    const labelGeo = new THREE.CylinderGeometry(
      0.725,
      0.725,
      1.35,
      36,
      1,
      true,
      -Math.PI * 0.38,
      Math.PI * 0.76
    );
    const labelMaterial = new THREE.MeshBasicMaterial({
      map: labelTexture,
      transparent: true,
      side: THREE.DoubleSide,
    });
    labelMaterial.polygonOffset = true;
    labelMaterial.polygonOffsetFactor = -1;
    labelMaterial.polygonOffsetUnits = -1;

    const labelMesh = new THREE.Mesh(labelGeo, labelMaterial);
    labelMesh.position.y = 0.05;
    // Rotate so label faces front (+Z)
    labelMesh.rotation.y = Math.PI;
    bottleGroup.add(labelMesh);

    // Part 9: Contact Ground Shadow
    const shadowGeo = new THREE.PlaneGeometry(2.4, 2.4);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const shadowCtx = shadowCanvas.getContext('2d')!;
    const sGrad = shadowCtx.createRadialGradient(128, 128, 10, 128, 128, 120);
    sGrad.addColorStop(0, 'rgba(0, 0, 0, 0.85)');
    sGrad.addColorStop(0.4, 'rgba(30, 10, 45, 0.5)');
    sGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    shadowCtx.fillStyle = sGrad;
    shadowCtx.fillRect(0, 0, 256, 256);
    const shadowTexture = new THREE.CanvasTexture(shadowCanvas);

    const shadowMaterial = new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMaterial);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -1.85 / 2 - 0.05;
    bottleGroup.add(shadowMesh);

    // Pivot bottle nicely in scene
    bottleGroup.position.set(0, -0.2, 0);
    scene.add(bottleGroup);

    // 4. Subtle Floating Dust / Star Particles (Atmospheric Nightlife Glow)
    const particleCount = isSoftwareGl ? 30 : 90;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSpeeds = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 5;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 4;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 3;
      particleSpeeds[i] = 0.2 + Math.random() * 0.5;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xc084fc,
      size: 0.045,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // 5. Sophisticated Nightlife Lighting Rig
    // Warm Key Light
    const keyLight = new THREE.DirectionalLight(0xffedd5, 2.2);
    keyLight.position.set(2.5, 3.5, 3.5);
    scene.add(keyLight);

    // Violet / Purple Rim Light (Behind left)
    const violetRimLight = new THREE.DirectionalLight(0x9333ea, 3.8);
    violetRimLight.position.set(-3, 2, -2.5);
    scene.add(violetRimLight);

    // Rose / Crimson Rim Light (Behind right)
    const roseRimLight = new THREE.DirectionalLight(0xe11d48, 2.6);
    roseRimLight.position.set(3, -1, -2);
    scene.add(roseRimLight);

    // Bottom Ambient Fill (Cool deep violet)
    const hemiLight = new THREE.HemisphereLight(0x18181b, 0x3b0764, 1.2);
    scene.add(hemiLight);

    // Front soft spot on label
    const frontSpot = new THREE.PointLight(0xffffff, 1.8, 6);
    frontSpot.position.set(0, 0.5, 2.8);
    scene.add(frontSpot);

    // 6. Interaction & Cinematic Animation Loop
    let introProgress = 0;
    let targetRotationY = 0;
    let targetRotationX = 0;
    let currentRotationY = 0;
    let currentRotationX = 0;
    let scrollProgress = 0;
    let isVisible = true;
    let animationFrameId: number;
    let clock = new THREE.Clock();

    // Mouse Tracking on Window
    const handleMouseMove = (e: MouseEvent) => {
      const xNorm = (e.clientX / window.innerWidth) * 2 - 1;
      const yNorm = -(e.clientY / window.innerHeight) * 2 + 1;
      targetRotationY = xNorm * 0.42;
      targetRotationX = yNorm * 0.22;
    };

    // Scroll Tracking
    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      // Progressive rotation that ties naturally to page scroll
      scrollProgress = scrollY * 0.0035;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    // IntersectionObserver to suspend RAF loop when off-screen
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
        });
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      if (newW > 0 && newH > 0) {
        camera.aspect = newW / newH;
        camera.updateProjectionMatrix();
        renderer.setSize(newW, newH);
      }
    };
    window.addEventListener('resize', handleResize);

    // Animation Tick
    const animate = () => {
      if (!isVisible) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }

      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Cinematic entrance interpolation
      if (introProgress < 1) {
        introProgress += delta * 0.85;
        if (introProgress > 1) {
          introProgress = 1;
          setIsLoaded(true);
        }
      }

      // Smooth mouse tilt lerp
      currentRotationY = THREE.MathUtils.damp(currentRotationY, targetRotationY, 4, delta);
      currentRotationX = THREE.MathUtils.damp(currentRotationX, targetRotationX, 4, delta);

      // Intro scale & vertical entrance settle
      const introEase = 1 - Math.pow(1 - introProgress, 3); // Ease out cubic
      const currentScale = 0.72 + introEase * 0.28;
      bottleGroup.scale.set(currentScale, currentScale, currentScale);

      // Combined Rotation: Idle Floating + Mouse Tilt + Scroll Rotation
      const idleSpin = prefersReducedMotion ? 0 : Math.sin(elapsedTime * 0.8) * 0.12;
      const idleFloatY = prefersReducedMotion ? 0 : Math.sin(elapsedTime * 1.6) * 0.07;

      bottleGroup.rotation.y = currentRotationY + scrollProgress * 1.8 + idleSpin;
      bottleGroup.rotation.x = currentRotationX + Math.sin(elapsedTime * 1.2) * 0.03;
      bottleGroup.rotation.z = -currentRotationY * 0.35 + Math.sin(elapsedTime * 1.1) * 0.02;

      // Vertical translation with intro offset and float
      const introYOffset = (1 - introEase) * -1.2;
      bottleGroup.position.y = -0.15 + introYOffset + idleFloatY - scrollProgress * 0.45;

      // Animate floating dust particles
      const positions = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] += particleSpeeds[i] * delta * 0.15;
        if (positions[i * 3 + 1] > 2.5) {
          positions[i * 3 + 1] = -2.5;
        }
      }
      particleGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      observer.disconnect();

      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      // Dispose three.js resources
      bodyGeo.dispose();
      liquidGeo.dispose();
      shoulderGeo.dispose();
      neckGeo.dispose();
      lipGeo.dispose();
      capGeo.dispose();
      bandGeo.dispose();
      labelGeo.dispose();
      shadowGeo.dispose();
      particleGeo.dispose();

      glassMaterial.dispose();
      liquidMaterial.dispose();
      capMaterial.dispose();
      neckBandMaterial.dispose();
      labelMaterial.dispose();
      shadowMaterial.dispose();
      particleMat.dispose();

      labelTexture.dispose();
      shadowTexture.dispose();

      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className={`relative w-full h-[460px] sm:h-[540px] lg:h-[620px] flex items-center justify-center pointer-events-none select-none ${className}`}
    >
      {/* Fallback if WebGL is unavailable */}
      {!webGlSupported && (
        <div className="flex flex-col items-center justify-center p-6 text-center text-zinc-400">
          <div className="w-36 h-72 rounded-full border border-purple-500/40 bg-gradient-to-b from-purple-900/30 to-zinc-950 flex items-center justify-center text-xs font-bold text-white tracking-widest uppercase shadow-2xl">
            ETERNITY GIN
          </div>
          <span className="text-xs text-zinc-500 mt-3">Visualização clássica ativada</span>
        </div>
      )}
    </div>
  );
};
