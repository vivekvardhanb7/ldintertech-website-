import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export function detectSoftwareGl(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

export function createStudioRenderer(isSoftwareGl: boolean): THREE.WebGLRenderer {
  const renderer = new THREE.WebGLRenderer({
    antialias: !isSoftwareGl,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = !isSoftwareGl;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  return renderer;
}

export function attachStudioEnvironment(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene
): THREE.Texture {
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  const envTex = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTex;
  pmremGenerator.dispose();
  return envTex;
}

export function afterDraw(
  renderer: THREE.WebGLRenderer,
  registerTimer: (id: number) => void,
  cb: () => void
): void {
  const gl = renderer.getContext() as WebGL2RenderingContext;
  if (!gl || typeof gl.fenceSync !== 'function') {
    const id = window.setTimeout(cb, 80);
    registerTimer(id);
    return;
  }
  const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
  gl.flush();
  const poll = () => {
    const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
    if (state === gl.UNSIGNALED) {
      const id = window.setTimeout(poll, 5);
      registerTimer(id);
    } else {
      if (sync) gl.deleteSync(sync);
      const id = window.setTimeout(cb, 80);
      registerTimer(id);
    }
  };
  const id = window.setTimeout(poll, 5);
  registerTimer(id);
}

/**
 * Generates a tileable grayscale brushed-metal roughness/bump texture via Canvas2D.
 */
export function createBrushedMetalTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 256, 256);
    for (let y = 0; y < 256; y++) {
      const shade = 112 + Math.floor((Math.sin(y * 0.7) * 0.5 + Math.random() * 0.5) * 32);
      ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
      ctx.fillRect(0, y, 256, 1);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 3);
  return tex;
}

/**
 * Generates a soft radial contact shadow disc texture so the vending machine sits grounded.
 */
export function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(128, 128, 18, 128, 128, 124);
    grad.addColorStop(0, 'rgba(0,0,0,0.72)');
    grad.addColorStop(0.55, 'rgba(0,0,0,0.32)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Generates a category-authentic interactive touchscreen UI texture for each 3D machine architecture.
 */
export function createCategoryScreenTexture(
  category: 'medical' | 'pizza' | 'snacks' | 'return',
  maxAnisotropy: number
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 896;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    if (category === 'pizza') {
      // Warm culinary pizza menu UI inspired by commercial pizza vending kiosks
      ctx.fillStyle = '#151211';
      ctx.fillRect(0, 0, 512, 896);

      ctx.fillStyle = '#D94336';
      ctx.fillRect(0, 0, 512, 92);
      ctx.fillStyle = '#FCFCFC';
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText('24/7 HOT PIZZA MENU', 28, 56);

      const pizzaNames = [
        'MARGHERITA',
        'PEPPERONI',
        'QUATTRO',
        'TRUFFLE VEG',
        'DIAVOLA',
        'BBQ BAKE',
      ];
      const toppingColors = ['#E5533D', '#D94336', '#F3D27A', '#78C864', '#C93A2B', '#E08E45'];

      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 2; c++) {
          const idx = r * 2 + c;
          const x = 26 + c * 234;
          const y = 122 + r * 204;

          ctx.fillStyle = '#241F1D';
          ctx.beginPath();
          ctx.roundRect(x, y, 222, 186, 14);
          ctx.fill();

          // Baked pizza circle illustration
          ctx.fillStyle = '#C98A42';
          ctx.beginPath();
          ctx.arc(x + 111, y + 74, 54, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#F2C96B';
          ctx.beginPath();
          ctx.arc(x + 111, y + 74, 44, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = toppingColors[idx];
          for (let d = 0; d < 6; d++) {
            const ang = (d / 6) * Math.PI * 2;
            ctx.beginPath();
            ctx.arc(
              x + 111 + Math.cos(ang) * 24,
              y + 74 + Math.sin(ang) * 24,
              7,
              0,
              Math.PI * 2
            );
            ctx.fill();
          }

          ctx.fillStyle = '#FCFCFC';
          ctx.font = 'bold 18px sans-serif';
          ctx.fillText(pizzaNames[idx], x + 18, y + 152);
          ctx.fillStyle = '#E6CF80';
          ctx.font = 'bold 16px monospace';
          ctx.fillText('HOT · 3 MIN', x + 18, y + 174);
        }
      }

      ctx.fillStyle = '#E6CF80';
      ctx.beginPath();
      ctx.roundRect(26, 756, 460, 96, 16);
      ctx.fill();
      ctx.fillStyle = '#151211';
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText('SELECT PIZZA · TAP TO PAY', 70, 814);
    } else if (category === 'medical') {
      // Crisp clinical healthcare essentials screen
      ctx.fillStyle = '#EFF4F9';
      ctx.fillRect(0, 0, 512, 896);

      ctx.fillStyle = '#112236';
      ctx.fillRect(0, 0, 512, 96);

      // Medical cross emblem
      ctx.fillStyle = '#9ECFFA';
      ctx.fillRect(34, 30, 12, 36);
      ctx.fillRect(22, 42, 36, 12);

      ctx.fillStyle = '#FCFCFC';
      ctx.font = 'bold 23px sans-serif';
      ctx.fillText('HEALTHCARE ESSENTIALS', 72, 56);

      const items = [
        'FIRST AID KIT',
        'STERILE GAUZE',
        'ADHESIVE BANDS',
        'ANTISEPTIC',
        'HYGIENE PACK',
        'RELIEF BALM',
      ];
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 2; c++) {
          const idx = r * 2 + c;
          const x = 26 + c * 234;
          const y = 128 + r * 198;
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.roundRect(x, y, 222, 178, 12);
          ctx.fill();

          ctx.fillStyle = idx % 2 === 0 ? '#D94336' : '#2563EB';
          ctx.beginPath();
          ctx.roundRect(x + 46, y + 24, 130, 84, 10);
          ctx.fill();

          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(x + 104, y + 44, 14, 44);
          ctx.fillRect(x + 89, y + 59, 44, 14);

          ctx.fillStyle = '#112236';
          ctx.font = 'bold 17px sans-serif';
          ctx.fillText(items[idx], x + 22, y + 144);
        }
      }

      ctx.fillStyle = '#1D4ED8';
      ctx.beginPath();
      ctx.roundRect(26, 756, 460, 96, 16);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText('CHOOSE ITEM · TAP NFC', 102, 814);
    } else if (category === 'return') {
      // Smart Return & Reuse automat screen
      ctx.fillStyle = '#101816';
      ctx.fillRect(0, 0, 512, 896);

      ctx.fillStyle = '#182824';
      ctx.fillRect(0, 0, 512, 96);
      ctx.fillStyle = '#7CE3B4';
      ctx.fillRect(28, 32, 10, 32);
      ctx.fillStyle = '#FCFCFC';
      ctx.font = 'bold 25px sans-serif';
      ctx.fillText('SMART RETURN OS', 52, 56);

      ctx.fillStyle = '#7CE3B4';
      ctx.font = 'bold 20px monospace';
      ctx.fillText('SELECT RETURN STREAM', 28, 142);

      // Two large intake mode cards matching Return-machine UI
      const cards = [
        { title: 'REUSABLE BOWLS & CUPS', sub: 'Insert into center sensor bay', color: '#1F3A32' },
        { title: 'BOTTLES & CANS', sub: 'Insert into circular drum chute', color: '#1C2A2E' },
      ];
      cards.forEach((card, i) => {
        const y = 180 + i * 244;
        ctx.fillStyle = card.color;
        ctx.beginPath();
        ctx.roundRect(28, y, 456, 214, 16);
        ctx.fill();

        ctx.strokeStyle = '#7CE3B4';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(108, y + 107, 46, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#FCFCFC';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText(card.title, 178, y + 96);
        ctx.fillStyle = '#A7D7C5';
        ctx.font = '18px sans-serif';
        ctx.fillText(card.sub, 178, y + 134);
      });

      ctx.fillStyle = '#7CE3B4';
      ctx.beginPath();
      ctx.roundRect(28, 756, 456, 96, 16);
      ctx.fill();
      ctx.fillStyle = '#101816';
      ctx.font = 'bold 25px sans-serif';
      ctx.fillText('SCAN QR · COLLECT DEPOSIT', 68, 814);
    } else {
      // Smart Snack / Gourmet Vending screen
      ctx.fillStyle = '#131317';
      ctx.fillRect(0, 0, 512, 896);

      ctx.fillStyle = '#1E1D26';
      ctx.fillRect(0, 0, 512, 92);
      ctx.fillStyle = '#A374FF';
      ctx.fillRect(28, 30, 10, 32);
      ctx.fillStyle = '#FCFCFC';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText('GOURMET & SNACKS', 52, 54);

      const snacks = [
        'GRAIN BOWL',
        'COLD JUICE',
        'ARTISAN WRAP',
        'NUT MIX',
        'PROTEIN BAR',
        'SPARKLING TEA',
      ];
      const colors = ['#A374FF', '#E6CF80', '#7CE3B4', '#9ECFFA', '#F08C55', '#A374FF'];
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 2; c++) {
          const idx = r * 2 + c;
          const x = 26 + c * 234;
          const y = 128 + r * 198;
          ctx.fillStyle = '#1E1E26';
          ctx.beginPath();
          ctx.roundRect(x, y, 222, 178, 12);
          ctx.fill();

          ctx.fillStyle = colors[idx];
          ctx.beginPath();
          ctx.roundRect(x + 24, y + 22, 174, 84, 8);
          ctx.fill();

          ctx.fillStyle = '#FCFCFC';
          ctx.font = 'bold 18px sans-serif';
          ctx.fillText(snacks[idx], x + 24, y + 144);
        }
      }

      ctx.fillStyle = '#A374FF';
      ctx.beginPath();
      ctx.roundRect(26, 756, 460, 96, 16);
      ctx.fill();
      ctx.fillStyle = '#10100F';
      ctx.font = 'bold 25px sans-serif';
      ctx.fillText('TAP NFC OR SELECT ITEM', 78, 814);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

/**
 * Generates clean crisp signage plaque CanvasTextures (e.g. "HOT & FRESH", "PIZZA OUT", "RETRIEVE").
 */
export function createPlaqueTexture(
  title: string,
  subtitle: string,
  bgHex: string,
  fgHex: string,
  maxAnisotropy: number
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 160;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = bgHex;
    ctx.fillRect(0, 0, 512, 160);
    ctx.fillStyle = fgHex;
    ctx.textAlign = 'center';
    ctx.font = 'bold 52px sans-serif';
    ctx.fillText(title, 256, subtitle ? 84 : 98);
    if (subtitle) {
      ctx.font = 'bold 26px monospace';
      ctx.fillStyle = '#D0D0CC';
      ctx.fillText(subtitle, 256, 130);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

export function createTouchscreenTexture(
  accentHex: string,
  title: string,
  maxAnisotropy: number
): THREE.CanvasTexture {
  void accentHex;
  void title;
  return createCategoryScreenTexture('snacks', maxAnisotropy);
}

