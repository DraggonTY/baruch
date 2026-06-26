function rgba(c: [number, number, number], a: number) {
  return `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${a})`;
}

export type SunPalette = {
  sun: [number, number, number];
  sunCore: [number, number, number];
  ray: [number, number, number];
  sky: [number, number, number];
  moon: [number, number, number];
  shadow: [number, number, number];
};

export type SunScene = {
  width: number;
  height: number;
  sunX: number;
  sunY: number;
  sunR: number;
  moonX: number;
  moonY: number;
  moonR: number;
  dragging: boolean;
  dragOffsetX: number;
  dragOffsetY: number;
};

export function createSunScene(width: number, height: number): SunScene {
  return {
    width,
    height,
    sunX: width * 0.5,
    sunY: height * 0.28,
    sunR: Math.min(72, width * 0.08),
    moonX: width * 0.68,
    moonY: height * 0.32,
    moonR: Math.min(44, width * 0.05),
    dragging: false,
    dragOffsetX: 0,
    dragOffsetY: 0,
  };
}

export function resizeSunScene(scene: SunScene, width: number, height: number): SunScene {
  const next = createSunScene(width, height);
  next.moonX = (scene.moonX / scene.width) * width;
  next.moonY = (scene.moonY / scene.height) * height;
  return next;
}

export function hitMoon(scene: SunScene, px: number, py: number) {
  return Math.hypot(px - scene.moonX, py - scene.moonY) < scene.moonR + 14;
}

export function startMoonDrag(scene: SunScene, px: number, py: number) {
  if (!hitMoon(scene, px, py)) return false;
  scene.dragging = true;
  scene.dragOffsetX = px - scene.moonX;
  scene.dragOffsetY = py - scene.moonY;
  return true;
}

export function moveMoon(scene: SunScene, px: number, py: number) {
  if (!scene.dragging) return;
  scene.moonX = px - scene.dragOffsetX;
  scene.moonY = py - scene.dragOffsetY;
  scene.moonX = Math.max(scene.moonR, Math.min(scene.width - scene.moonR, scene.moonX));
  scene.moonY = Math.max(scene.moonR, Math.min(scene.height - scene.moonR, scene.moonY));
}

export function endMoonDrag(scene: SunScene) {
  scene.dragging = false;
}

function eclipseBlock(scene: SunScene) {
  const dx = scene.moonX - scene.sunX;
  const dy = scene.moonY - scene.sunY;
  const dist = Math.hypot(dx, dy);
  const overlap = scene.sunR + scene.moonR - dist;
  if (overlap <= 0) return 0;
  return Math.min(1, overlap / (scene.moonR * 1.35));
}

function sunToMoonDirection(scene: SunScene) {
  const dx = scene.moonX - scene.sunX;
  const dy = scene.moonY - scene.sunY;
  const dist = Math.hypot(dx, dy);
  if (dist < 2) {
    return { ux: 0, uy: 1, dist: 0 };
  }
  return { ux: dx / dist, uy: dy / dist, dist };
}

function drawMoonCastShadow(
  ctx: CanvasRenderingContext2D,
  scene: SunScene,
  palette: SunPalette,
  block: number,
) {
  const { width, height, moonX, moonY, moonR, sunR } = scene;
  const { ux, uy, dist } = sunToMoonDirection(scene);
  const perpX = -uy;
  const perpY = ux;

  const shadowLen = Math.hypot(width, height) * 1.05;
  const endX = moonX + ux * shadowLen;
  const endY = moonY + uy * shadowLen;

  const align = Math.max(0.35, 1 - dist / (Math.hypot(width, height) * 0.55));
  const umbraNear = moonR * 0.85;
  const umbraFar = moonR * (1.6 + align * 0.8) + shadowLen * 0.1;
  const penNear = moonR * 1.55;
  const penFar = moonR * (3.2 + align * 1.4) + shadowLen * 0.22;

  const umbraAlpha = 0.14 + align * 0.12 + block * 0.42;
  const penAlpha = 0.07 + align * 0.06 + block * 0.18;

  ctx.save();

  const penGrad = ctx.createLinearGradient(moonX, moonY, endX, endY);
  penGrad.addColorStop(0, rgba(palette.shadow, penAlpha * 1.1));
  penGrad.addColorStop(0.25, rgba(palette.shadow, penAlpha * 0.75));
  penGrad.addColorStop(0.65, rgba(palette.shadow, penAlpha * 0.3));
  penGrad.addColorStop(1, "rgba(0,0,0,0)");

  ctx.fillStyle = penGrad;
  ctx.beginPath();
  ctx.moveTo(moonX + perpX * penNear, moonY + perpY * penNear);
  ctx.lineTo(moonX - perpX * penNear, moonY - perpY * penNear);
  ctx.lineTo(endX - perpX * penFar, endY - perpY * penFar);
  ctx.lineTo(endX + perpX * penFar, endY + perpY * penFar);
  ctx.closePath();
  ctx.fill();

  const umbraGrad = ctx.createLinearGradient(moonX, moonY, endX, endY);
  umbraGrad.addColorStop(0, rgba(palette.shadow, umbraAlpha));
  umbraGrad.addColorStop(0.2, rgba(palette.shadow, umbraAlpha * 0.82));
  umbraGrad.addColorStop(0.55, rgba(palette.shadow, umbraAlpha * 0.35));
  umbraGrad.addColorStop(1, "rgba(0,0,0,0)");

  ctx.fillStyle = umbraGrad;
  ctx.beginPath();
  ctx.moveTo(moonX + perpX * umbraNear, moonY + perpY * umbraNear);
  ctx.lineTo(moonX - perpX * umbraNear, moonY - perpY * umbraNear);
  ctx.lineTo(endX - perpX * umbraFar, endY - perpY * umbraFar);
  ctx.lineTo(endX + perpX * umbraFar, endY + perpY * umbraFar);
  ctx.closePath();
  ctx.fill();

  const contact = ctx.createRadialGradient(
    moonX + ux * moonR * 0.35,
    moonY + uy * moonR * 0.35,
    moonR * 0.2,
    moonX + ux * moonR * 0.5,
    moonY + uy * moonR * 0.5,
    moonR * 2.4,
  );
  contact.addColorStop(0, rgba(palette.shadow, 0.32 + block * 0.25));
  contact.addColorStop(0.45, rgba(palette.shadow, 0.12 + block * 0.12));
  contact.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = contact;
  ctx.beginPath();
  ctx.arc(moonX + ux * moonR * 0.4, moonY + uy * moonR * 0.4, moonR * 2.2, 0, Math.PI * 2);
  ctx.fill();

  if (block > 0.02) {
    const eclipseUmbra = ctx.createRadialGradient(moonX, moonY, moonR * 0.5, moonX, moonY, sunR * 3.2);
    eclipseUmbra.addColorStop(0, rgba(palette.shadow, 0.45 * block));
    eclipseUmbra.addColorStop(0.35, rgba(palette.shadow, 0.22 * block));
    eclipseUmbra.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = eclipseUmbra;
    ctx.fillRect(0, 0, width, height);
  }

  ctx.restore();
}

export function renderSunScene(
  ctx: CanvasRenderingContext2D,
  scene: SunScene,
  now: number,
  palette: SunPalette,
) {
  const { width, height, sunX, sunY, sunR, moonX, moonY, moonR } = scene;
  const block = eclipseBlock(scene);
  const light = 1 - block * 0.88;

  ctx.clearRect(0, 0, width, height);

  const sky = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, width * 0.75);
  sky.addColorStop(0, rgba(palette.sunCore, 0.35 * light));
  sky.addColorStop(0.22, rgba(palette.sun, 0.22 * light));
  sky.addColorStop(0.55, rgba(palette.sky, 0.08 * light));
  sky.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.globalCompositeOperation = "screen";
  const rays = 14;
  for (let i = 0; i < rays; i++) {
    const angle = (i / rays) * Math.PI * 2 + now * 0.00015;
    const len = sunR * (3.2 + (i % 2) * 0.8);
    const grad = ctx.createLinearGradient(
      sunX,
      sunY,
      sunX + Math.cos(angle) * len,
      sunY + Math.sin(angle) * len,
    );
    grad.addColorStop(0, rgba(palette.ray, 0.45 * light));
    grad.addColorStop(1, rgba(palette.sun, 0));
    ctx.strokeStyle = grad;
    ctx.lineWidth = 2 + (i % 3);
    ctx.beginPath();
    ctx.moveTo(sunX, sunY);
    ctx.lineTo(sunX + Math.cos(angle) * len, sunY + Math.sin(angle) * len);
    ctx.stroke();
  }
  ctx.restore();

  const corona = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR * 2.8);
  corona.addColorStop(0, rgba(palette.sunCore, 0.95 * light));
  corona.addColorStop(0.35, rgba(palette.sun, 0.55 * light));
  corona.addColorStop(1, rgba(palette.sun, 0));
  ctx.fillStyle = corona;
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunR * 2.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = rgba(palette.sunCore, 0.98 * light);
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
  ctx.fill();

  drawMoonCastShadow(ctx, scene, palette, block);

  if (block > 0.05) {
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    const ring = ctx.createRadialGradient(sunX, sunY, sunR, sunX, sunY, sunR * 3.5);
    ring.addColorStop(0, "rgba(255,255,255,0)");
    ring.addColorStop(0.55, `rgba(255, 240, 200, ${0.35 * block})`);
    ring.addColorStop(1, "rgba(255,200,100,0)");
    ctx.fillStyle = ring;
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunR * 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  const moonBody = ctx.createRadialGradient(
    moonX - moonR * 0.3,
    moonY - moonR * 0.3,
    0,
    moonX,
    moonY,
    moonR,
  );
  moonBody.addColorStop(0, rgba(palette.moon, 0.95));
  moonBody.addColorStop(0.7, rgba(palette.moon, 0.85));
  moonBody.addColorStop(1, rgba(palette.shadow, 0.5));
  ctx.fillStyle = moonBody;
  ctx.beginPath();
  ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
  ctx.fill();

  const { ux, uy } = sunToMoonDirection(scene);
  const litGrad = ctx.createLinearGradient(
    moonX - ux * moonR,
    moonY - uy * moonR,
    moonX + ux * moonR,
    moonY + uy * moonR,
  );
  litGrad.addColorStop(0, rgba(palette.shadow, 0.55));
  litGrad.addColorStop(0.45, rgba(palette.shadow, 0.08));
  litGrad.addColorStop(1, rgba(palette.moon, 0.15));
  ctx.fillStyle = litGrad;
  ctx.beginPath();
  ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = rgba(palette.shadow, 0.18);
  ctx.beginPath();
  ctx.arc(moonX - moonR * 0.25, moonY + moonR * 0.1, moonR * 0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(moonX + moonR * 0.15, moonY - moonR * 0.2, moonR * 0.14, 0, Math.PI * 2);
  ctx.fill();

  if (scene.dragging) {
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonR + 6, 0, Math.PI * 2);
    ctx.stroke();
  }
}
