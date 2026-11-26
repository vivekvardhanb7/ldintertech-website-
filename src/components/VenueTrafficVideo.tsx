import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Play, Pause, RotateCcw } from 'lucide-react';
import {
  VENDING_SOLUTIONS,
  type IndustryApplication,
  type MachineCategoryId,
  type VendingSolution,
} from '../data/vendingCatalog';
import {
  computeVenueSequenceState,
  HERO_MACHINE_PROFILES,
  VENUE_REAL_SCENES,
  VENUE_VIDEO_DURATION,
  type VenueMediaCrop,
  type VenueSequenceState,
} from '../utils/venueSimulation';

interface VenueTrafficVideoProps {
  industry: IndustryApplication;
  machine: VendingSolution;
  onSelectMachine: (id: MachineCategoryId) => void;
  onExploreMachine: (id: MachineCategoryId) => void;
  reducedMotion: boolean;
}

export const WORKFLOW_STAGES = [
  { index: 0, num: '01', label: 'Approach', time: 0.2 },
  { index: 1, num: '02', label: 'Select', time: 1.8 },
  { index: 2, num: '03', label: 'Pay', time: 3.2 },
  { index: 3, num: '04', label: 'Dispense', time: 4.2 },
  { index: 4, num: '05', label: 'Complete', time: 5.3 },
] as const;

interface BgCommuter {
  baseX: number;
  speed: number;
  dir: 1 | -1;
  depthScale: number;
  coatColor: string;
  hasBag: boolean;
}

const BG_COMMUTERS: BgCommuter[] = [
  { baseX: 0.14, speed: 0.055, dir: 1, depthScale: 0.52, coatColor: '#282C36', hasBag: true },
  { baseX: 0.42, speed: 0.046, dir: -1, depthScale: 0.44, coatColor: '#303440', hasBag: false },
  { baseX: 0.84, speed: 0.052, dir: -1, depthScale: 0.5, coatColor: '#252932', hasBag: true },
  { baseX: 0.25, speed: 0.038, dir: 1, depthScale: 0.38, coatColor: '#353945', hasBag: false },
  { baseX: 0.72, speed: 0.044, dir: 1, depthScale: 0.42, coatColor: '#2A2E38', hasBag: false },
];

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.lineTo(x + w - rad, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rad);
  ctx.lineTo(x + w, y + h - rad);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
  ctx.lineTo(x + rad, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rad);
  ctx.lineTo(x, y + rad);
  ctx.quadraticCurveTo(x, y, x + rad, y);
  ctx.closePath();
}

/**
 * Draws the real-world venue backdrop with soft opacity (28%) + cinematic depth blur
 * so the foreground customer and smart vending machine animation stand out with crisp clarity.
 */
function drawCroppedVenueBackdrop(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  crop: VenueMediaCrop,
  dstW: number,
  dstH: number,
  elapsed: number,
  reducedMotion: boolean
) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  if (!iw || !ih) return;

  const srcX = crop.sx * iw;
  const srcY = crop.sy * ih;
  const srcW = crop.sw * iw;
  const srcH = crop.sh * ih;

  // Aspect-preserving cover inside the cropped architectural zone + subtle camera drift
  const scale = Math.max(dstW / srcW, dstH / srcH) * 1.03;
  const drawW = srcW * scale;
  const drawH = srcH * scale;
  const driftX = reducedMotion ? 0 : Math.sin(elapsed * 0.32) * Math.min(8, (drawW - dstW) * 0.3);
  const drawX = (dstW - drawW) / 2 + driftX;
  const drawY = (dstH - drawH) * 0.42;

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, dstW, dstH);
  ctx.clip();

  // Dimmed background opacity (0.28) + soft architectural blur so animation is never mixed up
  ctx.globalAlpha = 0.28;
  ctx.filter = 'blur(6px) brightness(0.52) contrast(1.1) saturate(0.7)';
  ctx.drawImage(img, srcX, srcY, srcW, srcH, drawX, drawY, drawW, drawH);
  ctx.filter = 'none';
  ctx.globalAlpha = 1.0;

  // Deep dark atmospheric overlay to ensure foreground animation has 100% crisp contrast
  const scrim = ctx.createLinearGradient(0, 0, 0, dstH);
  scrim.addColorStop(0, 'rgba(11, 13, 18, 0.45)');
  scrim.addColorStop(0.6, 'rgba(11, 13, 18, 0.65)');
  scrim.addColorStop(1, 'rgba(11, 13, 18, 0.96)');
  ctx.fillStyle = scrim;
  ctx.fillRect(0, 0, dstW, dstH);

  ctx.restore();
}

function drawArticulatedPerson(
  ctx: CanvasRenderingContext2D,
  options: {
    x: number;
    footY: number;
    height: number;
    stride: number;
    handRaise: number;
    facing: 1 | -1;
    coatColor: string;
    trouserColor: string;
    skinColor: string;
    carrying?: 'none' | 'bag' | 'firstaid' | 'pizza' | 'drink' | 'tumbler';
    opacity?: number;
    isMainCustomer?: boolean;
    accentCss?: string;
  }
) {
  const {
    x,
    footY,
    height,
    stride,
    handRaise,
    facing,
    coatColor,
    trouserColor,
    skinColor,
    carrying = 'none',
    opacity = 1,
    isMainCustomer = false,
    accentCss = '#9ECFFA',
  } = options;

  ctx.save();
  ctx.globalAlpha = opacity;

  // Floor contact shadow
  const shadowGrad = ctx.createRadialGradient(x, footY + 2, 2, x, footY + 2, height * 0.24);
  shadowGrad.addColorStop(0, 'rgba(0,0,0,0.7)');
  shadowGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(x, footY + 2, height * 0.22, height * 0.045, 0, 0, Math.PI * 2);
  ctx.fill();

  const headR = height * 0.075;
  const shoulderY = footY - height * 0.77;
  const hipY = footY - height * 0.44;
  const shoulderW = height * 0.145;
  const hipW = height * 0.105;

  // Stride legs
  const legSwing = stride * height * 0.095;
  ctx.lineCap = 'round';
  ctx.lineWidth = Math.max(4, height * 0.056);

  // Back leg
  ctx.strokeStyle = trouserColor;
  ctx.beginPath();
  ctx.moveTo(x - facing * hipW * 0.3, hipY);
  ctx.lineTo(x - legSwing * facing, footY - 3);
  ctx.stroke();

  // Front leg
  ctx.beginPath();
  ctx.moveTo(x + facing * hipW * 0.25, hipY);
  ctx.lineTo(x + legSwing * facing, footY - 2);
  ctx.stroke();

  // Shoes
  ctx.fillStyle = '#15161A';
  ctx.beginPath();
  ctx.ellipse(x - legSwing * facing + facing * 3, footY - 1, height * 0.04, height * 0.016, 0, 0, Math.PI * 2);
  ctx.ellipse(x + legSwing * facing + facing * 3, footY, height * 0.04, height * 0.016, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tailored torso / coat
  ctx.fillStyle = coatColor;
  ctx.beginPath();
  ctx.moveTo(x - shoulderW * 0.55, shoulderY);
  ctx.lineTo(x + shoulderW * 0.55, shoulderY);
  ctx.lineTo(x + hipW * 0.65, hipY + height * 0.04);
  ctx.lineTo(x - hipW * 0.65, hipY + height * 0.04);
  ctx.closePath();
  ctx.fill();

  // Crisp rim highlight on main customer
  if (isMainCustomer) {
    ctx.strokeStyle = 'rgba(255,255,255,0.22)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Subtle jacket lapel highlight
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.beginPath();
  ctx.moveTo(x + facing * shoulderW * 0.18, shoulderY + 2);
  ctx.lineTo(x + facing * shoulderW * 0.48, shoulderY + 2);
  ctx.lineTo(x + facing * hipW * 0.45, hipY);
  ctx.closePath();
  ctx.fill();

  // Head & hair silhouette
  const headX = x + facing * height * 0.01;
  const headY = shoulderY - headR * 1.42;
  ctx.fillStyle = skinColor;
  ctx.beginPath();
  ctx.arc(headX, headY, headR, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#1C1D24';
  ctx.beginPath();
  ctx.arc(headX - facing * headR * 0.18, headY - headR * 0.18, headR * 1.03, Math.PI * 0.88, Math.PI * 2.08);
  ctx.fill();

  // Back arm swing
  const armBackX = x - facing * shoulderW * 0.35 - stride * facing * height * 0.07;
  const armBackY = hipY + height * 0.06;
  ctx.strokeStyle = coatColor;
  ctx.lineWidth = Math.max(3, height * 0.042);
  ctx.beginPath();
  ctx.moveTo(x - facing * shoulderW * 0.35, shoulderY + height * 0.04);
  ctx.lineTo(armBackX, armBackY);
  ctx.stroke();

  if (carrying === 'bag') {
    ctx.fillStyle = '#25262E';
    drawRoundedRect(ctx, armBackX - height * 0.05, armBackY, height * 0.1, height * 0.11, 3);
    ctx.fill();
  }

  // Front articulated arm (reaches forward during select / pay / dispense)
  const reach = handRaise;
  const elbowX = x + facing * (shoulderW * 0.42 + reach * height * 0.11);
  const elbowY = shoulderY + height * (0.14 - reach * 0.05);
  const handX = elbowX + facing * (height * 0.04 + reach * height * 0.14 - stride * facing * height * 0.05);
  const handY = shoulderY + height * (0.28 - reach * 0.24);

  ctx.strokeStyle = coatColor;
  ctx.lineWidth = Math.max(3.5, height * 0.044);
  ctx.beginPath();
  ctx.moveTo(x + facing * shoulderW * 0.35, shoulderY + height * 0.04);
  ctx.lineTo(elbowX, elbowY);
  ctx.lineTo(handX, handY);
  ctx.stroke();

  ctx.fillStyle = skinColor;
  ctx.beginPath();
  ctx.arc(handX, handY, height * 0.025, 0, Math.PI * 2);
  ctx.fill();

  // Carried/held object props with vivid saturated colors
  if (carrying === 'firstaid') {
    ctx.fillStyle = '#E53E3E';
    drawRoundedRect(ctx, handX - 8, handY - 6, 20, 14, 2.5);
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#FCFCFC';
    ctx.fillRect(handX - 1, handY - 3, 4, 8);
    ctx.fillRect(handX - 3, handY - 1, 8, 4);
  } else if (carrying === 'pizza') {
    ctx.fillStyle = '#F5A623';
    drawRoundedRect(ctx, handX - 4, handY - 4, 30, 8, 2);
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1;
    ctx.stroke();
  } else if (carrying === 'drink') {
    ctx.fillStyle = '#38BDF8';
    drawRoundedRect(ctx, handX - 4, handY - 13, 10, 16, 3);
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1;
    ctx.stroke();
  } else if (carrying === 'tumbler') {
    ctx.fillStyle = '#34D399';
    drawRoundedRect(ctx, handX - 4, handY - 12, 11, 16, 2.5);
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  ctx.restore();
}

function drawVendingHardware(
  ctx: CanvasRenderingContext2D,
  options: {
    machineId: MachineCategoryId;
    x: number;
    floorY: number;
    unitH: number;
    seq: VenueSequenceState;
    accentCss: string;
  }
) {
  const { machineId, x, floorY, unitH, seq, accentCss } = options;
  const unitW = machineId === 'return' ? unitH * 0.72 : unitH * 0.56;
  const left = x - unitW / 2;
  const top = floorY - unitH;

  ctx.save();

  // Floor radial accent glow + dark contact shadow
  const floorGlow = ctx.createRadialGradient(x, floorY + 4, 6, x, floorY + 4, unitW * 0.95);
  floorGlow.addColorStop(0, `${accentCss}45`);
  floorGlow.addColorStop(0.55, `${accentCss}16`);
  floorGlow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = floorGlow;
  ctx.beginPath();
  ctx.ellipse(x, floorY + 4, unitW * 0.95, unitH * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(0,0,0,0.85)';
  ctx.beginPath();
  ctx.ellipse(x, floorY + 2, unitW * 0.56, unitH * 0.036, 0, 0, Math.PI * 2);
  ctx.fill();

  // Side depth bevel (3D perspective)
  ctx.fillStyle = '#121318';
  ctx.beginPath();
  ctx.moveTo(left + unitW, top + 6);
  ctx.lineTo(left + unitW + unitW * 0.08, top + 14);
  ctx.lineTo(left + unitW + unitW * 0.08, floorY - 6);
  ctx.lineTo(left + unitW, floorY);
  ctx.closePath();
  ctx.fill();

  // Main industrial chassis gradient with crisp outline
  const bodyGrad = ctx.createLinearGradient(left, top, left + unitW, floorY);
  if (machineId === 'medical') {
    bodyGrad.addColorStop(0, '#272F3A');
    bodyGrad.addColorStop(1, '#181C22');
  } else {
    bodyGrad.addColorStop(0, '#23252C');
    bodyGrad.addColorStop(1, '#141519');
  }
  ctx.fillStyle = bodyGrad;
  drawRoundedRect(ctx, left, top, unitW, unitH, 8);
  ctx.fill();

  ctx.strokeStyle = 'rgba(255,255,255,0.22)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Header sign bar
  const headerH = unitH * 0.115;
  ctx.fillStyle = '#0F1116';
  drawRoundedRect(ctx, left + 5, top + 5, unitW - 10, headerH, 5);
  ctx.fill();

  ctx.fillStyle = accentCss;
  ctx.font = `700 ${Math.max(9, Math.round(unitH * 0.036))}px Inter, sans-serif`;
  ctx.textBaseline = 'middle';
  const headerTitle =
    machineId === 'medical'
      ? 'HEALTHCARE 24/7'
      : machineId === 'pizza'
        ? '24/7 HOT PIZZA'
        : machineId === 'snacks'
          ? 'SMART GOURMET'
          : 'SMART RETURN';
  ctx.fillText(headerTitle, left + 14, top + 5 + headerH / 2);

  // Side touchscreen UI + NFC reader area
  const screenW = unitW * 0.27;
  const screenH = unitH * 0.25;
  const screenX = machineId === 'return' ? left + 12 : left + unitW - screenW - 12;
  const screenY = top + headerH + unitH * 0.07;

  ctx.fillStyle = '#0A0B0F';
  drawRoundedRect(ctx, screenX - 2, screenY - 2, screenW + 4, screenH + 4, 4);
  ctx.fill();

  const screenBg = ctx.createLinearGradient(screenX, screenY, screenX, screenY + screenH);
  screenBg.addColorStop(0, '#1B2030');
  screenBg.addColorStop(1, '#11141E');
  ctx.fillStyle = screenBg;
  drawRoundedRect(ctx, screenX, screenY, screenW, screenH, 3);
  ctx.fill();

  // Screen active tiles
  const isSelecting = seq.phase === 'select';
  const isPaying = seq.phase === 'pay';
  const isDispensing = seq.phase === 'dispense';
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 2; col++) {
      const tx = screenX + 5 + col * ((screenW - 14) / 2 + 4);
      const ty = screenY + 12 + row * ((screenH - 28) / 3);
      const tw = (screenW - 14) / 2;
      const th = (screenH - 34) / 3;
      const highlighted = isSelecting && row === 1 && col === 0;
      ctx.fillStyle = highlighted ? accentCss : 'rgba(255,255,255,0.2)';
      drawRoundedRect(ctx, tx, ty, tw, th, 2);
      ctx.fill();
    }
  }

  // Screen bottom status ribbon
  ctx.fillStyle = isDispensing ? '#34D399' : isPaying ? accentCss : 'rgba(255,255,255,0.25)';
  drawRoundedRect(ctx, screenX + 5, screenY + screenH - 12, screenW - 10, 7, 2);
  ctx.fill();

  // NFC Tap-to-Pay module below screen
  const nfcX = screenX + screenW / 2;
  const nfcY = screenY + screenH + unitH * 0.075;
  ctx.fillStyle = '#111218';
  drawRoundedRect(ctx, nfcX - 11, nfcY - 11, 22, 22, 4);
  ctx.fill();
  ctx.strokeStyle = isPaying ? accentCss : 'rgba(255,255,255,0.32)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(nfcX, nfcY, 5.5, 0, Math.PI * 2);
  ctx.stroke();

  if (isPaying) {
    const pulseR = 9 + seq.nfcPulse * 22;
    ctx.strokeStyle = accentCss;
    ctx.globalAlpha = Math.max(0, 1 - seq.nfcPulse);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(nfcX, nfcY, pulseR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // Category-specific main front bays
  if (machineId === 'medical' || machineId === 'snacks') {
    const winX = left + 10;
    const winY = top + headerH + unitH * 0.04;
    const winW = unitW - screenW - 30;
    const winH = unitH * 0.61;

    const glassGrad = ctx.createLinearGradient(winX, winY, winX + winW, winY + winH);
    glassGrad.addColorStop(0, machineId === 'medical' ? '#E2EEFA' : '#DCE0EB');
    glassGrad.addColorStop(1, machineId === 'medical' ? '#C2D7EC' : '#B8BECE');
    ctx.fillStyle = glassGrad;
    drawRoundedRect(ctx, winX, winY, winW, winH, 4);
    ctx.fill();

    // Illuminated interior shelves & stock items
    for (let shelf = 0; shelf < 4; shelf++) {
      const sy = winY + (shelf + 1) * (winH / 4.4);
      ctx.fillStyle = 'rgba(22,26,34,0.48)';
      ctx.fillRect(winX + 4, sy, winW - 8, 2.5);

      for (let item = 0; item < 3; item++) {
        const ix = winX + 7 + item * ((winW - 18) / 3);
        const iw = (winW - 24) / 3;
        const ih = winH / 6.2;
        if (machineId === 'medical') {
          ctx.fillStyle = item === 0 ? '#DC4646' : item === 1 ? '#2E72D2' : '#EEF2F7';
        } else {
          ctx.fillStyle = item === 0 ? '#7E57C2' : item === 1 ? '#26A69A' : '#E6AF58';
        }
        drawRoundedRect(ctx, ix, sy - ih - 1, iw, ih, 2);
        ctx.fill();
      }
    }

    // Diagonal glass reflection
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.beginPath();
    ctx.moveTo(winX + 4, winY);
    ctx.lineTo(winX + winW * 0.34, winY);
    ctx.lineTo(winX + winW * 0.08, winY + winH);
    ctx.lineTo(winX + 4, winY + winH);
    ctx.closePath();
    ctx.fill();

    // Lower illuminated dispensing / pickup bay
    const bayX = machineId === 'medical' ? screenX - 2 : winX + 8;
    const bayW = machineId === 'medical' ? screenW + 4 : winW - 16;
    const bayY = floorY - unitH * 0.2;
    const bayH = unitH * 0.13;
    ctx.fillStyle = isDispensing ? `${accentCss}55` : '#0C0D11';
    drawRoundedRect(ctx, bayX, bayY, bayW, bayH, 4);
    ctx.fill();
    ctx.strokeStyle = isDispensing ? accentCss : 'rgba(255,255,255,0.25)';
    ctx.stroke();

    if (isDispensing && seq.actionProgress < 0.72) {
      ctx.fillStyle = machineId === 'medical' ? '#E53E3E' : '#9ECFFA';
      drawRoundedRect(ctx, bayX + bayW * 0.25, bayY + bayH * 0.3, bayW * 0.5, bayH * 0.48, 2);
      ctx.fill();
    }
  } else if (machineId === 'pizza') {
    // Stone oven viewing window + heated pizza chute
    const winX = left + 12;
    const winY = top + headerH + unitH * 0.06;
    const winW = unitW - screenW - 34;
    const winH = unitH * 0.28;

    const ovenGrad = ctx.createRadialGradient(
      winX + winW / 2,
      winY + winH * 0.65,
      4,
      winX + winW / 2,
      winY + winH * 0.65,
      winW * 0.7
    );
    ovenGrad.addColorStop(0, isDispensing || isPaying ? '#F5A623' : '#9D5B1C');
    ovenGrad.addColorStop(1, '#1A120E');
    ctx.fillStyle = ovenGrad;
    drawRoundedRect(ctx, winX, winY, winW, winH, 5);
    ctx.fill();
    ctx.strokeStyle = '#E6CF80';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Glowing pizza crust preview inside oven
    ctx.fillStyle = '#E6A145';
    ctx.beginPath();
    ctx.ellipse(winX + winW / 2, winY + winH * 0.68, winW * 0.34, winH * 0.13, 0, 0, Math.PI * 2);
    ctx.fill();

    // Heated stainless "PIZZA OUT" chute below
    const chuteY = winY + winH + unitH * 0.11;
    const chuteH = unitH * 0.12;
    ctx.fillStyle = '#121316';
    drawRoundedRect(ctx, winX, chuteY, winW, chuteH, 4);
    ctx.fill();
    ctx.strokeStyle = isDispensing ? '#E6CF80' : 'rgba(255,255,255,0.25)';
    ctx.stroke();

    if (isDispensing) {
      const slide = Math.min(1, seq.actionProgress * 1.4);
      ctx.fillStyle = '#F5A623';
      drawRoundedRect(ctx, winX - slide * 12 + 6, chuteY + chuteH * 0.42, winW * 0.8, 7, 1.5);
      ctx.fill();
    }
  } else {
    // Return Vending: optical conveyor window + glowing LED circular drum ring
    const convX = screenX + screenW + 14;
    const convY = screenY + 4;
    const convW = unitW * 0.25;
    const convH = unitH * 0.23;
    ctx.fillStyle = '#0D261D';
    drawRoundedRect(ctx, convX, convY, convW, convH, 5);
    ctx.fill();
    ctx.strokeStyle = '#7CE3B4';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Circular return intake drum with glowing LED halo
    const drumX = left + unitW - unitW * 0.18;
    const drumY = screenY + screenH * 0.48;
    const drumR = unitW * 0.11;
    ctx.fillStyle = '#090B0E';
    ctx.beginPath();
    ctx.arc(drumX, drumY, drumR, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = isDispensing || isPaying ? '#34D399' : '#7CE3B4';
    ctx.lineWidth = isDispensing ? 4 : 2.5;
    ctx.beginPath();
    ctx.arc(drumX, drumY, drumR + 2, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

export function VenueTrafficVideo({
  industry,
  machine,
  onSelectMachine,
  onExploreMachine,
  reducedMotion,
}: VenueTrafficVideoProps) {
  const venueScene = VENUE_REAL_SCENES[industry.id] || VENUE_REAL_SCENES.transit;
  const profile = HERO_MACHINE_PROFILES[machine.id];

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const bgImageRef = useRef<HTMLImageElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const timeDisplayRef = useRef<HTMLSpanElement | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [seqState, setSeqState] = useState<VenueSequenceState>(() =>
    computeVenueSequenceState(0.4, machine.id, VENUE_VIDEO_DURATION)
  );
  const [imageReady, setImageReady] = useState<boolean>(false);

  const timeRef = useRef<number>(0.4);
  const isPlayingRef = useRef<boolean>(true);
  const lastStepIndexRef = useRef<number>(0);
  const sceneRef = useRef(venueScene);
  const machineIdRef = useRef<MachineCategoryId>(machine.id);
  const accentRef = useRef<string>(profile.accentCss);
  const reducedMotionRef = useRef<boolean>(reducedMotion);

  useEffect(() => {
    sceneRef.current = venueScene;
  }, [venueScene]);

  useEffect(() => {
    machineIdRef.current = machine.id;
    accentRef.current = profile.accentCss;
    setSeqState(computeVenueSequenceState(timeRef.current, machine.id, VENUE_VIDEO_DURATION));
  }, [machine.id, profile.accentCss]);

  useEffect(() => {
    reducedMotionRef.current = reducedMotion;
  }, [reducedMotion]);

  // Preload current venue architectural backdrop image
  useEffect(() => {
    let active = true;
    const img = new Image();
    img.referrerPolicy = 'no-referrer';
    img.onload = () => {
      if (!active) return;
      bgImageRef.current = img;
      setImageReady(true);
    };
    img.onerror = () => {
      if (!active) return;
      bgImageRef.current = null;
      setImageReady(false);
    };
    img.src = venueScene.image;
    return () => {
      active = false;
    };
  }, [venueScene.image]);

  // Smoothly start from Approach (Step 01) whenever industry or machine changes
  useEffect(() => {
    timeRef.current = 0.25;
    setIsPlaying(true);
    isPlayingRef.current = true;
    lastStepIndexRef.current = 0;
    setCurrentStepIndex(0);
    setSeqState(computeVenueSequenceState(0.25, machine.id, VENUE_VIDEO_DURATION));
  }, [industry.id, machine.id]);

  // Automatic continuous video playback loop gated by viewport visibility
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let disposed = false;
    let rafId = 0;
    let inView = true;
    let lastTs = performance.now();

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const targetW = Math.round(rect.width * dpr);
      const targetH = Math.round(rect.height * dpr);
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }
    };

    const drawFrame = (tSec: number) => {
      resizeCanvas();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      if (w <= 0 || h <= 0) return;

      ctx.save();
      ctx.scale(dpr, dpr);

      const floorY = h * 0.79;
      const seq = computeVenueSequenceState(tSec, machineIdRef.current, VENUE_VIDEO_DURATION);

      if (seq.stepIndex !== lastStepIndexRef.current) {
        lastStepIndexRef.current = seq.stepIndex;
        setCurrentStepIndex(seq.stepIndex);
        setSeqState(seq);
      }
      if (progressBarRef.current) {
        progressBarRef.current.style.transform = `scaleX(${seq.progress.toFixed(4)})`;
      }
      if (timeDisplayRef.current) {
        const curSec = Math.floor(tSec);
        const curStr = curSec < 10 ? `0${curSec}` : `${curSec}`;
        timeDisplayRef.current.textContent = `00:${curStr} / 00:06`;
      }

      // 1. Deep solid architectural background
      ctx.fillStyle = '#0B0D12';
      ctx.fillRect(0, 0, w, h);

      // 2. Cropped architectural photo with 28% opacity + blur for high visual separation
      if (bgImageRef.current) {
        drawCroppedVenueBackdrop(
          ctx,
          bgImageRef.current,
          sceneRef.current.crop,
          w,
          floorY + 12,
          tSec,
          reducedMotionRef.current
        );
      }

      // Horizon atmospheric blend
      const skyVignette = ctx.createLinearGradient(0, floorY - 80, 0, floorY + 18);
      skyVignette.addColorStop(0, 'rgba(11,13,18,0)');
      skyVignette.addColorStop(1, 'rgba(11,13,18,0.95)');
      ctx.fillStyle = skyVignette;
      ctx.fillRect(0, floorY - 80, w, 100);

      // 3. Crisp architectural reflective floor
      const floorGrad = ctx.createLinearGradient(0, floorY, 0, h);
      floorGrad.addColorStop(0, '#151720');
      floorGrad.addColorStop(1, '#08080B');
      ctx.fillStyle = floorGrad;
      ctx.fillRect(0, floorY, w, h - floorY);

      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 1;
      for (let i = -4; i <= 4; i++) {
        const topX = w * 0.5 + i * w * 0.085;
        const botX = w * 0.5 + i * w * 0.2;
        ctx.beginPath();
        ctx.moveTo(topX, floorY);
        ctx.lineTo(botX, h);
        ctx.stroke();
      }

      // 4. Subtle background pedestrians (low opacity so they never distract)
      for (const p of BG_COMMUTERS) {
        const travel = reducedMotionRef.current ? 0 : tSec * p.speed * p.dir;
        const px = ((((p.baseX + travel) % 1.2) + 1.2) % 1.2) - 0.1;
        const pH = h * 0.34 * p.depthScale;
        const pY = floorY - h * (1 - p.depthScale) * 0.06;
        const stride = reducedMotionRef.current ? 0.3 : Math.sin(tSec * 9.5 + p.baseX * 12);
        drawArticulatedPerson(ctx, {
          x: px * w,
          footY: pY,
          height: pH,
          stride,
          handRaise: 0,
          facing: p.dir,
          coatColor: p.coatColor,
          trouserColor: '#20232C',
          skinColor: '#8C6C58',
          carrying: p.hasBag ? 'bag' : 'none',
          opacity: 0.28,
        });
      }

      // 5. Studio Pedestal Backlight behind machine for high-contrast pop
      const machineX = w * 0.65;
      const machineH = Math.min(h * 0.56, 300);
      const unitW = machineIdRef.current === 'return' ? machineH * 0.72 : machineH * 0.56;

      const machineBacklight = ctx.createRadialGradient(
        machineX,
        floorY - machineH * 0.45,
        15,
        machineX,
        floorY - machineH * 0.45,
        machineH * 0.95
      );
      machineBacklight.addColorStop(0, `${accentRef.current}26`);
      machineBacklight.addColorStop(0.5, `${accentRef.current}0a`);
      machineBacklight.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = machineBacklight;
      ctx.beginPath();
      ctx.ellipse(machineX, floorY - machineH * 0.45, machineH * 0.85, machineH * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();

      // 6. Draw Exact Selected LD Intertech Hardware Unit
      drawVendingHardware(ctx, {
        machineId: machineIdRef.current,
        x: machineX,
        floorY: floorY + 8,
        unitH: machineH,
        seq,
        accentCss: accentRef.current,
      });

      // 7. Foreground Customer Choreography (1 Approach -> 2 Select -> 3 Pay -> 4 Dispense -> 5 Complete)
      const custX = seq.customerXRatio * w;
      const custH = Math.min(h * 0.47, 255);
      const custFacing: 1 | -1 = seq.phase === 'exit' ? 1 : 1;

      let carriedItem: 'none' | 'bag' | 'firstaid' | 'pizza' | 'drink' | 'tumbler' = 'none';
      if (machineIdRef.current === 'return') {
        carriedItem =
          seq.phase === 'approach' || seq.phase === 'select' || seq.phase === 'pay'
            ? 'tumbler'
            : seq.phase === 'dispense' && seq.actionProgress < 0.45
              ? 'tumbler'
              : 'none';
      } else if (
        (seq.phase === 'dispense' && seq.actionProgress > 0.48) ||
        seq.phase === 'exit'
      ) {
        carriedItem =
          machineIdRef.current === 'medical'
            ? 'firstaid'
            : machineIdRef.current === 'pizza'
              ? 'pizza'
              : 'drink';
      }

      drawArticulatedPerson(ctx, {
        x: custX,
        footY: floorY + 12,
        height: custH,
        stride: seq.walkStride,
        handRaise: seq.handRaise,
        facing: custFacing,
        coatColor: '#2B3240',
        trouserColor: '#171A22',
        skinColor: '#DDAF92',
        carrying: carriedItem,
        opacity: 0.98,
        isMainCustomer: true,
        accentCss: accentRef.current,
      });

      ctx.restore();
    };

    const tick = () => {
      if (disposed) return;
      const now = performance.now();
      const dt = Math.max(0, Math.min((now - lastTs) / 1000, 0.05));
      lastTs = now;

      // Always advance continuously when isPlaying is true (never stuck on phase 4)
      if (isPlayingRef.current && inView && !document.hidden) {
        timeRef.current =
          (((timeRef.current + dt) % VENUE_VIDEO_DURATION) + VENUE_VIDEO_DURATION) %
          VENUE_VIDEO_DURATION;
        drawFrame(timeRef.current);
      }

      rafId = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) => {
        inView = entries[0]?.isIntersecting ?? true;
        if (inView) {
          lastTs = performance.now();
          drawFrame(timeRef.current);
        }
      },
      { threshold: 0.05 }
    );
    io.observe(canvas);

    drawFrame(timeRef.current);
    rafId = requestAnimationFrame(tick);

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      io.disconnect();
    };
  }, [imageReady]);

  const handleJumpToStep = (targetTime: number) => {
    timeRef.current = targetTime;
    setIsPlaying(true);
    isPlayingRef.current = true;
    const seq = computeVenueSequenceState(targetTime, machine.id, VENUE_VIDEO_DURATION);
    lastStepIndexRef.current = seq.stepIndex;
    setCurrentStepIndex(seq.stepIndex);
    setSeqState(seq);
  };

  const togglePlayPause = () => {
    setIsPlaying((prev) => {
      const next = !prev;
      isPlayingRef.current = next;
      return next;
    });
  };

  const handleRestart = () => {
    handleJumpToStep(0.2);
  };

  return (
    <div
      className="rounded-2xl overflow-hidden border border-white/10 bg-[#161615]"
      data-testid="venue-video-player"
      data-selected-industry={industry.id}
      data-selected-machine={machine.id}
      data-phase={seqState.phase}
      data-step={currentStepIndex}
    >
      {/* Clean Header Bar: Venue Context + Machine Selector Tabs */}
      <div className="px-4 sm:px-6 py-3.5 bg-[#10100F] border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-0.5 min-w-0">
          <div className="text-[11px] font-mono-tabular uppercase tracking-wider text-[#9ECFFA]">
            Live Deployment Video · {industry.name}
          </div>
          <div className="text-sm font-medium text-[#FCFCFC] truncate">
            {industry.deploymentNote} · {machine.categoryLabel}
          </div>
        </div>

        <div
          className="flex flex-wrap items-center gap-1.5"
          role="tablist"
          aria-label="Select vending machine type for venue video"
        >
          {VENDING_SOLUTIONS.map((sol) => {
            const active = sol.id === machine.id;
            return (
              <button
                key={sol.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onSelectMachine(sol.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-[#FCFCFC] text-[#10100F] border-[#FCFCFC] font-semibold'
                    : 'bg-[#161615] text-[#B8B8B4] border-white/10 hover:text-[#FCFCFC]'
                }`}
              >
                {sol.categoryLabel.replace(' Vending', '')}
              </button>
            );
          })}
        </div>
      </div>

      {/* Full-Width Automatic Continuous Deployment Video Canvas with Dimmed Backdrop */}
      <div
        className={`relative aspect-[16/9] sm:aspect-[16/8.6] lg:h-[520px] lg:aspect-auto w-full overflow-hidden bg-gradient-to-br ${machine.fallbackGradient}`}
        data-testid="venue-reel-stage"
      >
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={`Automatic deployment video showing ${machine.categoryLabel} inside ${industry.name}`}
          className="w-full h-full block"
        />

        {/* Bottom Scrim: Interactive 01 02 03 04 05 Stepper Bar, Play/Pause Controls & Narrative */}
        <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-[#080808]/98 via-[#080808]/75 to-transparent pt-20 pb-5 px-4 sm:px-6 flex flex-col gap-3">
          {/* Stepper Navigation: 01 Approach, 02 Select, 03 Pay, 04 Dispense, 05 Complete */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-b border-white/10 pb-3">
            <div
              className="flex flex-wrap items-center gap-1.5 sm:gap-2"
              role="tablist"
              aria-label="Deployment video stages 1 to 5"
            >
              {WORKFLOW_STAGES.map((st) => {
                const isActive = currentStepIndex === st.index;
                return (
                  <button
                    key={st.index}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => handleJumpToStep(st.time)}
                    className={`px-2.5 sm:px-3 py-1 rounded-md text-xs font-mono-tabular transition-all cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-white/20 text-[#FCFCFC] font-semibold border shadow-sm'
                        : 'text-[#B8B8B4] hover:text-[#FCFCFC] hover:bg-white/10 border border-transparent'
                    }`}
                    style={
                      isActive
                        ? { borderColor: profile.accentCss, color: profile.accentCss }
                        : {}
                    }
                  >
                    <span className="font-bold opacity-80">{st.num}</span>
                    <span>{st.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Playback Controls & Live Timestamp */}
            <div className="flex items-center gap-2 text-xs font-mono-tabular text-[#B8B8B4]">
              <button
                type="button"
                onClick={togglePlayPause}
                aria-label={isPlaying ? 'Pause deployment video' : 'Play deployment video'}
                className="p-1.5 rounded-md bg-white/10 hover:bg-white/20 text-[#FCFCFC] transition-colors cursor-pointer"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={handleRestart}
                aria-label="Restart deployment sequence"
                className="p-1.5 rounded-md bg-white/10 hover:bg-white/20 text-[#FCFCFC] transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <span ref={timeDisplayRef} className="text-[#8C8C88] whitespace-nowrap pl-1">
                00:00 / 00:06
              </span>
            </div>
          </div>

          {/* Active Step Narrative & Inspect Machine CTA */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1 max-w-2xl">
              <div className="text-[11px] font-mono-tabular uppercase tracking-wider text-[#9ECFFA]">
                {seqState.label}
              </div>
              <div className="font-display text-base sm:text-lg font-semibold text-[#FCFCFC]">
                {industry.name} · {machine.categoryLabel}
              </div>
              <p className="text-xs sm:text-sm text-[#D8D8D4] leading-relaxed">
                {venueScene.caption}
              </p>
            </div>

            <button
              type="button"
              onClick={() => onExploreMachine(machine.id)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-[#10100F] bg-[#A374FF] hover:bg-[#FCFCFC] rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 self-start sm:self-end"
            >
              <span>Inspect {machine.categoryLabel}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Continuous 2px Ambient Loop Hairline */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-[2px] bg-white/15"
        >
          <div
            ref={progressBarRef}
            className="h-full w-full origin-left"
            style={{ backgroundColor: profile.accentCss }}
          />
        </div>
      </div>
    </div>
  );
}
