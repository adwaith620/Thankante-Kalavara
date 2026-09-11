// Seeded PRNG
function mulberry32(a: number) {
  return function() {
    var t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

export const generateDeterministicFlag = (country: string, ctx: CanvasRenderingContext2D, width: number, height: number, colors: string[]) => {
  let seed = 0;
  for (let i = 0; i < country.length; i++) {
    seed += country.charCodeAt(i) * Math.pow(10, i % 3);
  }
  const random = mulberry32(seed);

  // 1: horizontal tri-band, 2: vertical tri-band, 3: solid, 4: bi-band
  const type = Math.floor(random() * 4);
  
  if (type === 0) {
    ctx.fillStyle = colors[Math.floor(random() * colors.length)];
    ctx.fillRect(0, 0, width, height/3);
    ctx.fillStyle = colors[Math.floor(random() * colors.length)];
    ctx.fillRect(0, height/3, width, height/3);
    ctx.fillStyle = colors[Math.floor(random() * colors.length)];
    ctx.fillRect(0, (height/3)*2, width, height/3);
  } else if (type === 1) {
    ctx.fillStyle = colors[Math.floor(random() * colors.length)];
    ctx.fillRect(0, 0, width/3, height);
    ctx.fillStyle = colors[Math.floor(random() * colors.length)];
    ctx.fillRect(width/3, 0, width/3, height);
    ctx.fillStyle = colors[Math.floor(random() * colors.length)];
    ctx.fillRect((width/3)*2, 0, width/3, height);
  } else if (type === 2) {
    ctx.fillStyle = colors[Math.floor(random() * colors.length)];
    ctx.fillRect(0, 0, width, height);
  } else {
    ctx.fillStyle = colors[Math.floor(random() * colors.length)];
    ctx.fillRect(0, 0, width/2, height);
    ctx.fillStyle = colors[Math.floor(random() * colors.length)];
    ctx.fillRect(width/2, 0, width/2, height);
  }
  
  // Maybe add a shape
  if (random() > 0.5) {
    ctx.fillStyle = colors[Math.floor(random() * colors.length)];
    ctx.beginPath();
    ctx.arc(width/2, height/2, height/3, 0, Math.PI*2);
    ctx.fill();
  }
};

export const compareCanvases = (userCtx: CanvasRenderingContext2D, targetCtx: CanvasRenderingContext2D, width: number, height: number) => {
  const userImageData = userCtx.getImageData(0, 0, width, height).data;
  const targetImageData = targetCtx.getImageData(0, 0, width, height).data;
  
  let matchPixels = 0;
  
  for (let i = 0; i < userImageData.length; i += 4) {
    const ur = userImageData[i];
    const ug = userImageData[i+1];
    const ub = userImageData[i+2];
    
    const tr = targetImageData[i];
    const tg = targetImageData[i+1];
    const tb = targetImageData[i+2];
    
    // If the user's pixel is completely white, we assume it's unpainted background.
    // If they explicitly painted white, it will just not count towards the "matched" score.
    if (ur === 255 && ug === 255 && ub === 255) {
      continue;
    }
    
    // Color distance
    const dist = Math.sqrt(Math.pow(ur-tr, 2) + Math.pow(ug-tg, 2) + Math.pow(ub-tb, 2));
    if (dist < 80) { // Very generous tolerance since they only have basic colors
      matchPixels++;
    }
  }
  
  // To reach 100%, they need to successfully paint all the pixels.
  // But wait! If the target flag has white parts, they can't match them (since white is ignored).
  // So we calculate the max possible score as the number of non-white pixels in the target flag.
  let targetNonWhitePixels = 0;
  for (let i = 0; i < targetImageData.length; i += 4) {
    const tr = targetImageData[i];
    const tg = targetImageData[i+1];
    const tb = targetImageData[i+2];
    // We count pixels that are not perfectly white
    if (!(tr === 255 && tg === 255 && tb === 255)) {
      targetNonWhitePixels++;
    }
  }
  
  if (targetNonWhitePixels === 0) return 100; // Edge case: entirely white flag
  
  const score = (matchPixels / targetNonWhitePixels) * 100;
  return Math.min(100, score);
};
