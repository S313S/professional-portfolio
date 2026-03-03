import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { motion } from 'motion/react';

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform sampler2D uTexture2;
uniform vec2 uMouse;
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uImageResolution;
uniform float uHover;

varying vec2 vUv;

// Simplex noise function
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
  vec2 safeResolution = max(uResolution, vec2(1.0));
  vec2 safeImageResolution = max(uImageResolution, vec2(1.0));
  vec2 uv = vUv;
  
  // Calculate aspect ratio for correct circle shape
  float aspect = safeResolution.x / safeResolution.y;
  vec2 mouseUV = uMouse;
  
  // Distance from mouse
  vec2 distVec = uv - mouseUV;
  distVec.x *= aspect;
  float dist = length(distVec);
  
  // Create a smooth circle mask
  float radius = 0.25; // Size of the reveal circle
  float edgeSoftness = 0.1;
  float mask = 1.0 - smoothstep(radius - edgeSoftness, radius, dist);
  
  // Add some noise to the mask edges for liquid feel
  float noise = snoise(uv * 10.0 + uTime * 0.5);
  mask += noise * 0.02 * mask; // Only distort near the mask
  mask = clamp(mask, 0.0, 1.0);
  
  // Displacement effect based on mask
  float displacementStrength = 0.05;
  vec2 displacement = vec2(
    snoise(uv * 5.0 + uTime * 0.2),
    snoise(uv * 5.0 + uTime * 0.3 + 10.0)
  ) * displacementStrength * mask;
  
  // Calculate UVs for background-size: cover (robust against invalid dimensions)
  float screenAspect = safeResolution.x / safeResolution.y;
  float imageAspect = safeImageResolution.x / safeImageResolution.y;
  vec2 uvCover = vUv;
  if (screenAspect > imageAspect) {
    float scaleY = imageAspect / screenAspect;
    uvCover.y = vUv.y * scaleY + (1.0 - scaleY) * 0.5;
  } else {
    float scaleX = screenAspect / imageAspect;
    uvCover.x = vUv.x * scaleX + (1.0 - scaleX) * 0.5;
  }
  
  // Sample textures
  vec4 tex2 = texture2D(uTexture2, uvCover + displacement); // Color image with displacement
  
  // Reveal color image on top of the base layer using alpha mask
  gl_FragColor = vec4(tex2.rgb, mask);
}
`;

const buildTexturePathCandidates = (relativePath: string) => {
  const normalized = relativePath.replace(/^\/+/, '');
  const base = import.meta.env.BASE_URL || '/';
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;
  const aliasPath = normalized.replace(/^images\//, 'public-images/');
  const paths = [
    `${normalizedBase}${normalized}`,
    `${normalizedBase}${aliasPath}`,
    `/${normalized}`,
    `/${aliasPath}`
  ];

  return Array.from(new Set(paths));
};

const loadTextureWithFallback = async (
  loader: THREE.TextureLoader,
  paths: string[],
  onLoad?: (texture: THREE.Texture) => void
) => {
  let lastError: unknown = null;

  for (const path of paths) {
    try {
      const texture = await loader.loadAsync(path);
      onLoad?.(texture);
      return texture;
    } catch (error) {
      lastError = error;
      console.warn(`[ExperienceHero] Texture load failed: ${path}`, error);
    }
  }

  throw new Error(
    `[ExperienceHero] Failed to load texture from paths: ${paths.join(', ')} | ${String(lastError)}`
  );
};

const getTextureDimensions = (texture: THREE.Texture): { width: number; height: number } => {
  const image = texture.image as
    | {
        naturalWidth?: number;
        naturalHeight?: number;
        videoWidth?: number;
        videoHeight?: number;
        width?: number;
        height?: number;
      }
    | undefined;

  const width = image?.naturalWidth || image?.videoWidth || image?.width || 1;
  const height = image?.naturalHeight || image?.videoHeight || image?.height || 1;

  return { width, height };
};

export default function ExperienceHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const requestRef = useRef<number | null>(null);
  const baseImagePath = `${(import.meta.env.BASE_URL || '/').replace(/\/?$/, '/')}images/before.png`;

  useEffect(() => {
    if (!containerRef.current) return;

    // Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Orthographic camera for 2D effect
    const camera = new THREE.OrthographicCamera(
      width / -2, width / 2, height / 2, height / -2, 0.1, 1000
    );
    camera.position.z = 1;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const geometry = new THREE.PlaneGeometry(width, height);
    let mesh: THREE.Mesh | null = null;
    let colorTexture: THREE.Texture | null = null;
    let isDisposed = false;

    const textureLoader = new THREE.TextureLoader();
    const afterTexturePaths = buildTexturePathCandidates('images/after.png');

    const configureTexture = (texture: THREE.Texture) => {
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = false;
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.needsUpdate = true;
    };

    const setupMaterial = async () => {
      try {
        colorTexture = await loadTextureWithFallback(textureLoader, afterTexturePaths);

        if (isDisposed || !colorTexture) return;

        configureTexture(colorTexture);

        const { width: imageWidth, height: imageHeight } = getTextureDimensions(colorTexture);

        const material = new THREE.ShaderMaterial({
          vertexShader,
          fragmentShader,
          transparent: true,
          uniforms: {
            uTime: { value: 0 },
            uTexture2: { value: colorTexture },
            uMouse: { value: new THREE.Vector2(0.5, 0.5) },
            uResolution: { value: new THREE.Vector2(width, height) },
            uImageResolution: { value: new THREE.Vector2(imageWidth, imageHeight) },
            uHover: { value: 0 }
          }
        });
        materialRef.current = material;

        mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
      } catch (error) {
        console.error('[ExperienceHero] Unable to initialize textures for displacement effect.', error);
      }
    };

    void setupMaterial();

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current || !materialRef.current || !mesh) return;
      
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      
      rendererRef.current.setSize(w, h);
      
      // Update camera
      cameraRef.current.left = w / -2;
      cameraRef.current.right = w / 2;
      cameraRef.current.top = h / 2;
      cameraRef.current.bottom = h / -2;
      cameraRef.current.updateProjectionMatrix();
      
      // Update uniforms
      materialRef.current.uniforms.uResolution.value.set(w, h);
      
      // Update geometry size (create new one to match aspect ratio if needed, or just scale mesh)
      mesh.scale.set(1, 1, 1); // Reset scale
      // Actually for a full screen plane in ortho view, we need to match the size
      mesh.geometry.dispose();
      mesh.geometry = new THREE.PlaneGeometry(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Mouse Move Handler
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current || !materialRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1.0 - (e.clientY - rect.top) / rect.height; // Flip Y for UVs
      
      // Smooth lerp could be added here for better feel
      materialRef.current.uniforms.uMouse.value.set(x, y);
      materialRef.current.uniforms.uHover.value = 1;
    };
    
    // Use window for mouse move to catch it even if slightly outside, 
    // but container is safer for local coordinates
    containerRef.current.addEventListener('mousemove', handleMouseMove);
    containerRef.current.addEventListener('mouseleave', () => {
        if(materialRef.current) materialRef.current.uniforms.uHover.value = 0;
    });

    // Animation Loop
    const animate = (time: number) => {
      requestRef.current = requestAnimationFrame(animate);
      
      if (materialRef.current) {
        materialRef.current.uniforms.uTime.value = time * 0.001;
      }
      
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    
    requestRef.current = requestAnimationFrame(animate);

    return () => {
      isDisposed = true;
      window.removeEventListener('resize', handleResize);
      if (containerRef.current) {
        containerRef.current.removeEventListener('mousemove', handleMouseMove);
        if (rendererRef.current && rendererRef.current.domElement) {
            containerRef.current.removeChild(rendererRef.current.domElement);
        }
      }
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      colorTexture?.dispose();
      if (mesh) {
        mesh.geometry.dispose();
      } else {
        geometry.dispose();
      }
      materialRef.current?.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <section className="relative w-full h-screen overflow-hidden">
      <div
        className="absolute inset-0 z-0 bg-center bg-cover bg-no-repeat"
        style={{ backgroundImage: `url("${baseImagePath}")` }}
      />
      <div ref={containerRef} className="absolute inset-0 w-full h-full z-0" />
      
      {/* Overlay Content */}
      <div className="absolute inset-0 z-10 flex flex-col justify-center items-center pointer-events-none">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center text-white mix-blend-difference"
        >
          <h2 className="text-6xl md:text-8xl font-bold tracking-tighter mb-4">EXPERIENCE</h2>
          <p className="text-xl md:text-2xl font-light tracking-widest opacity-80">EXPLORE THE JOURNEY</p>
        </motion.div>
      </div>
      
      <div className="absolute bottom-10 left-0 right-0 text-center z-10 pointer-events-none">
        <a href="#experience" className="pointer-events-auto inline-block">
          <p className="text-white/50 text-sm animate-bounce">Scroll to explore</p>
        </a>
      </div>
    </section>
  );
}
