// ============ BOUQUET CANVAS DRAWING ENGINE ============
const bqCvs = document.getElementById('bouquetCanvas');
const bqCtx = bqCvs.getContext('2d');

function initBouquetCanvas() {
    const wrapper = bqCvs.parentElement;
    const dpr = window.devicePixelRatio || 1;
    bqCvs.width = wrapper.clientWidth * dpr;
    bqCvs.height = wrapper.clientHeight * dpr;
    bqCtx.scale(dpr, dpr);
    drawBouquet(wrapper.clientWidth, wrapper.clientHeight);
}

// --- Draw a single realistic rose ---
function drawRose(ctx, cx, cy, radius, angle, shadowDir) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    const layers = 5;
    const petalsPerLayer = [3, 5, 7, 8, 10];
    const layerRadii = [radius * 0.18, radius * 0.35, radius * 0.55, radius * 0.78, radius];

    // Outer glow/shadow
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.25)';
    ctx.shadowBlur = radius * 0.4;
    ctx.shadowOffsetX = shadowDir * 3;
    ctx.shadowOffsetY = 5;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(240,238,230,0.01)';
    ctx.fill();
    ctx.restore();

    // Draw from outermost to innermost
    for (let l = layers - 1; l >= 0; l--) {
        const count = petalsPerLayer[l];
        const r = layerRadii[l];
        const baseAngle = (l % 2 === 0) ? 0 : Math.PI / count;

        for (let p = 0; p < count; p++) {
            const a = baseAngle + (p / count) * Math.PI * 2;
            const px = Math.cos(a) * r * 0.3;
            const py = Math.sin(a) * r * 0.3;
            const petalW = r * 0.55;
            const petalH = r * 0.85;

            ctx.save();
            ctx.translate(px, py);
            ctx.rotate(a + Math.PI / 2);

            // Petal gradient: white center, slightly darker edges
            const grad = ctx.createRadialGradient(0, -petalH * 0.1, 0, 0, -petalH * 0.1, petalH);
            const brightness = 245 - l * 6;
            const edgeBright = 215 - l * 8;
            grad.addColorStop(0, `rgb(${brightness},${brightness},${brightness - 5})`);
            grad.addColorStop(0.6, `rgb(${brightness - 3},${brightness - 4},${brightness - 12})`);
            grad.addColorStop(1, `rgb(${edgeBright},${edgeBright - 5},${edgeBright - 15})`);

            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.bezierCurveTo(-petalW * 0.8, -petalH * 0.3, -petalW * 0.6, -petalH * 0.9, 0, -petalH);
            ctx.bezierCurveTo(petalW * 0.6, -petalH * 0.9, petalW * 0.8, -petalH * 0.3, 0, 0);
            ctx.closePath();

            // Subtle shadow between petals
            ctx.shadowColor = 'rgba(0,0,0,0.08)';
            ctx.shadowBlur = 3;
            ctx.shadowOffsetY = 1;

            ctx.fillStyle = grad;
            ctx.fill();

            // Thin highlight stroke on each petal edge
            ctx.strokeStyle = `rgba(255,255,255,${0.15 - l * 0.02})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();

            ctx.restore();
        }
    }

    // Center bud spiral
    const cGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, radius * 0.15);
    cGrad.addColorStop(0, '#fffef0');
    cGrad.addColorStop(0.5, '#f8f4e0');
    cGrad.addColorStop(1, '#e8e2c8');
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.12, 0, Math.PI * 2);
    ctx.fillStyle = cGrad;
    ctx.fill();

    // Tiny spiral lines at center
    ctx.strokeStyle = 'rgba(200,190,160,0.4)';
    ctx.lineWidth = 0.7;
    for (let i = 0; i < 3; i++) {
        const sa = i * 2.1;
        ctx.beginPath();
        ctx.arc(0, 0, radius * (0.04 + i * 0.03), sa, sa + 1.8);
        ctx.stroke();
    }

    ctx.restore();
}

// --- Draw a leaf ---
function drawLeaf(ctx, x, y, size, angle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    const grad = ctx.createLinearGradient(0, -size, 0, size);
    grad.addColorStop(0, '#1a5c18');
    grad.addColorStop(0.5, '#236b20');
    grad.addColorStop(1, '#143f12');

    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.bezierCurveTo(size * 0.5, -size * 0.6, size * 0.5, size * 0.3, 0, size);
    ctx.bezierCurveTo(-size * 0.5, size * 0.3, -size * 0.5, -size * 0.6, 0, -size);
    ctx.closePath();

    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    ctx.shadowBlur = 4;
    ctx.fillStyle = grad;
    ctx.fill();

    // Center vein
    ctx.strokeStyle = 'rgba(10,50,8,0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.9);
    ctx.lineTo(0, size * 0.85);
    ctx.stroke();

    // Side veins
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = 'rgba(10,50,8,0.3)';
    for (let i = 0; i < 4; i++) {
        const vy = -size * 0.6 + i * size * 0.35;
        ctx.beginPath();
        ctx.moveTo(0, vy);
        ctx.lineTo(size * 0.28, vy + size * 0.12);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, vy);
        ctx.lineTo(-size * 0.28, vy + size * 0.12);
        ctx.stroke();
    }
    ctx.restore();
}

// --- Draw wrapping paper ---
function drawWrapping(ctx, w, h) {
    const wrapTop = h * 0.52;
    const wrapBot = h * 0.95;
    const centerX = w / 2;
    const spreadTop = w * 0.48;
    const spreadBot = w * 0.14;

    // Main wrapping shape
    const grad = ctx.createLinearGradient(centerX - spreadTop, wrapTop, centerX + spreadTop, wrapBot);
    grad.addColorStop(0, '#6e0012');
    grad.addColorStop(0.3, '#8c0018');
    grad.addColorStop(0.5, '#a50020');
    grad.addColorStop(0.7, '#8c0018');
    grad.addColorStop(1, '#5a000e');

    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 8;

    ctx.beginPath();
    ctx.moveTo(centerX - spreadTop, wrapTop);
    ctx.lineTo(centerX - spreadBot, wrapBot);
    ctx.quadraticCurveTo(centerX, wrapBot + 12, centerX + spreadBot, wrapBot);
    ctx.lineTo(centerX + spreadTop, wrapTop);
    ctx.quadraticCurveTo(centerX, wrapTop - 15, centerX - spreadTop, wrapTop);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Velvet texture lines
    ctx.strokeStyle = 'rgba(120,0,20,0.3)';
    ctx.lineWidth = 0.8;
    for (let i = 0; i < 12; i++) {
        const t = i / 11;
        const x1 = centerX - spreadTop + t * spreadTop * 2;
        const x2 = centerX - spreadBot + t * spreadBot * 2;
        ctx.beginPath();
        ctx.moveTo(x1, wrapTop);
        ctx.lineTo(x2, wrapBot);
        ctx.stroke();
    }

    // Fold highlights
    ctx.strokeStyle = 'rgba(200,50,70,0.15)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX - spreadTop * 0.4, wrapTop + 5);
    ctx.lineTo(centerX - spreadBot * 0.4, wrapBot - 5);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(centerX + spreadTop * 0.4, wrapTop + 5);
    ctx.lineTo(centerX + spreadBot * 0.4, wrapBot - 5);
    ctx.stroke();

    ctx.restore();

    // Upper flared paper edges
    ctx.save();
    const foldGrad = ctx.createLinearGradient(0, wrapTop - 30, 0, wrapTop + 10);
    foldGrad.addColorStop(0, '#9a001a');
    foldGrad.addColorStop(1, '#7a0014');

    // Left fold
    ctx.beginPath();
    ctx.moveTo(centerX - spreadTop, wrapTop);
    ctx.quadraticCurveTo(centerX - spreadTop - 25, wrapTop - 40, centerX - spreadTop + 20, wrapTop - 50);
    ctx.quadraticCurveTo(centerX - spreadTop + 15, wrapTop - 10, centerX - spreadTop, wrapTop);
    ctx.fillStyle = foldGrad;
    ctx.fill();

    // Right fold
    ctx.beginPath();
    ctx.moveTo(centerX + spreadTop, wrapTop);
    ctx.quadraticCurveTo(centerX + spreadTop + 25, wrapTop - 40, centerX + spreadTop - 20, wrapTop - 50);
    ctx.quadraticCurveTo(centerX + spreadTop - 15, wrapTop - 10, centerX + spreadTop, wrapTop);
    ctx.fill();
    ctx.restore();
}

// --- Draw gold ribbon/bow ---
function drawRibbon(ctx, w, h) {
    const cx = w / 2;
    const cy = h * 0.54;

    // Ribbon tails
    ctx.save();
    ctx.strokeStyle = '#b8962c';
    ctx.lineWidth = 3;
    const tailGrad = ctx.createLinearGradient(cx - 30, cy, cx + 30, cy + 60);
    tailGrad.addColorStop(0, '#e8c840');
    tailGrad.addColorStop(0.5, '#d4af37');
    tailGrad.addColorStop(1, '#a88520');

    // Left tail
    ctx.beginPath();
    ctx.moveTo(cx - 5, cy + 8);
    ctx.quadraticCurveTo(cx - 30, cy + 35, cx - 18, cy + 60);
    ctx.quadraticCurveTo(cx - 25, cy + 35, cx - 12, cy + 8);
    ctx.fillStyle = tailGrad;
    ctx.fill();

    // Right tail
    ctx.beginPath();
    ctx.moveTo(cx + 5, cy + 8);
    ctx.quadraticCurveTo(cx + 30, cy + 35, cx + 18, cy + 60);
    ctx.quadraticCurveTo(cx + 25, cy + 35, cx + 12, cy + 8);
    ctx.fill();

    // Bow loops
    const bowGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 28);
    bowGrad.addColorStop(0, '#f5df7a');
    bowGrad.addColorStop(0.5, '#d4af37');
    bowGrad.addColorStop(1, '#a07a18');

    // Left loop
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.bezierCurveTo(cx - 35, cy - 18, cx - 38, cy + 18, cx, cy + 3);
    ctx.fillStyle = bowGrad;
    ctx.fill();

    // Right loop
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.bezierCurveTo(cx + 35, cy - 18, cx + 38, cy + 18, cx, cy + 3);
    ctx.fill();

    // Center knot
    ctx.beginPath();
    ctx.ellipse(cx, cy + 2, 7, 9, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#d4af37';
    ctx.fill();
    ctx.strokeStyle = '#a07a18';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
}

// --- Draw stems ---
function drawStems(ctx, w, h) {
    const cx = w / 2;
    const topY = h * 0.25;
    const botY = h * 0.7;

    const stemPositions = [
        { tx: cx - 50, bx: cx - 8 },
        { tx: cx - 25, bx: cx - 3 },
        { tx: cx, bx: cx },
        { tx: cx + 25, bx: cx + 3 },
        { tx: cx + 50, bx: cx + 8 },
        { tx: cx - 65, bx: cx - 10 },
        { tx: cx + 65, bx: cx + 10 },
    ];

    ctx.save();
    stemPositions.forEach(s => {
        const grad = ctx.createLinearGradient(s.tx, topY, s.bx, botY);
        grad.addColorStop(0, '#2a6b24');
        grad.addColorStop(0.5, '#1e5218');
        grad.addColorStop(1, '#133a0f');

        ctx.beginPath();
        ctx.moveTo(s.tx - 1.5, topY + 40);
        ctx.quadraticCurveTo((s.tx + s.bx) / 2, (topY + botY) / 2, s.bx - 1.5, botY);
        ctx.lineTo(s.bx + 1.5, botY);
        ctx.quadraticCurveTo((s.tx + s.bx) / 2 + 3, (topY + botY) / 2, s.tx + 1.5, topY + 40);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();
    });
    ctx.restore();
}

// --- Full bouquet composition ---
function drawBouquet(w, h) {
    bqCtx.clearRect(0, 0, w, h);

    // Draw stems behind everything
    drawStems(bqCtx, w, h);

    // Draw wrapping paper
    drawWrapping(bqCtx, w, h);

    // Draw ribbon
    drawRibbon(bqCtx, w, h);

    // Leaves around roses
    const leaves = [
        { x: w * 0.2,  y: h * 0.38, s: 28, a: -0.6 },
        { x: w * 0.8,  y: h * 0.36, s: 30, a: 0.5 },
        { x: w * 0.15, y: h * 0.28, s: 22, a: -0.9 },
        { x: w * 0.85, y: h * 0.30, s: 24, a: 0.8 },
        { x: w * 0.3,  y: h * 0.46, s: 20, a: -0.3 },
        { x: w * 0.72, y: h * 0.44, s: 22, a: 0.4 },
        { x: w * 0.25, y: h * 0.18, s: 18, a: -1.1 },
        { x: w * 0.78, y: h * 0.20, s: 19, a: 1.0 },
        { x: w * 0.42, y: h * 0.48, s: 16, a: -0.1 },
        { x: w * 0.58, y: h * 0.47, s: 17, a: 0.2 },
    ];
    leaves.forEach(l => drawLeaf(bqCtx, l.x, l.y, l.s, l.a));

    // Draw roses in a natural bouquet arrangement
    const roses = [
        // Back row
        { x: w * 0.26, y: h * 0.25, r: 34, a: -0.15, sd: -1 },
        { x: w * 0.50, y: h * 0.14, r: 38, a: 0.05,  sd: 0 },
        { x: w * 0.74, y: h * 0.24, r: 35, a: 0.12,  sd: 1 },
        // Middle row
        { x: w * 0.34, y: h * 0.34, r: 40, a: -0.08, sd: -1 },
        { x: w * 0.66, y: h * 0.33, r: 39, a: 0.1,   sd: 1 },
        // Front row
        { x: w * 0.22, y: h * 0.40, r: 32, a: -0.2,  sd: -1 },
        { x: w * 0.50, y: h * 0.40, r: 44, a: 0,     sd: 0 },
        { x: w * 0.78, y: h * 0.39, r: 33, a: 0.18,  sd: 1 },
        // Top accents
        { x: w * 0.38, y: h * 0.18, r: 28, a: -0.1,  sd: -1 },
        { x: w * 0.62, y: h * 0.17, r: 29, a: 0.08,  sd: 1 },
    ];
    roses.forEach(r => drawRose(bqCtx, r.x, r.y, r.r, r.a, r.sd));

    // Small baby's breath dots scattered around
    bqCtx.save();
    for (let i = 0; i < 40; i++) {
        const bx = w * 0.15 + Math.random() * w * 0.7;
        const by = h * 0.12 + Math.random() * h * 0.38;
        const br = Math.random() * 2.5 + 1;
        bqCtx.beginPath();
        bqCtx.arc(bx, by, br, 0, Math.PI * 2);
        bqCtx.fillStyle = `rgba(255,255,255,${Math.random() * 0.4 + 0.3})`;
        bqCtx.fill();
    }
    bqCtx.restore();
}

// Initialize bouquet drawing
window.addEventListener('load', initBouquetCanvas);
window.addEventListener('resize', initBouquetCanvas);


// ============ BACKGROUND FLOATING PETALS ============
const bgCvs = document.getElementById('bgCanvas');
const bgCtx = bgCvs.getContext('2d');
let petals = [];
let sparkles = [];

function resizeBg() {
    bgCvs.width = window.innerWidth;
    bgCvs.height = window.innerHeight;
}
window.addEventListener('resize', resizeBg);
resizeBg();

class FallingPetal {
    constructor(x, y, rising) {
        this.x = x ?? Math.random() * bgCvs.width;
        this.y = y ?? -15;
        this.s = Math.random() * 10 + 7;
        this.vx = rising ? (Math.random() - 0.5) * 6 : Math.random() * 1.2 - 0.4;
        this.vy = rising ? -(Math.random() * 7 + 3) : Math.random() * 1.4 + 1;
        this.op = Math.random() * 0.4 + 0.55;
        this.rot = Math.random() * 360;
        this.spin = Math.random() * 2 - 1;
        this.cc = Math.random() * 100;
        this.rising = rising;
    }
    update() {
        this.x += this.vx + Math.sin(this.cc) * 0.4;
        this.y += this.vy;
        this.cc += 0.015;
        this.rot += this.spin;
        if (this.rising) { this.vy *= 0.985; this.op -= 0.003; }
    }
    draw(c) {
        c.save();
        c.translate(this.x, this.y);
        c.rotate(this.rot * Math.PI / 180);
        c.globalAlpha = Math.max(0, this.op);
        const g = c.createRadialGradient(0, 0, 0, 0, 0, this.s);
        g.addColorStop(0, '#fff');
        g.addColorStop(0.7, '#faf9f4');
        g.addColorStop(1, '#ddd8c8');
        c.fillStyle = g;
        c.beginPath();
        c.moveTo(0, -this.s / 2);
        c.bezierCurveTo(this.s * 0.6, -this.s * 0.6, this.s * 0.8, this.s * 0.4, 0, this.s);
        c.bezierCurveTo(-this.s * 0.8, this.s * 0.4, -this.s * 0.6, -this.s * 0.6, 0, -this.s / 2);
        c.fill();
        c.restore();
    }
}

class Spark {
    constructor(x, y) {
        this.x = x; this.y = y;
        this.s = Math.random() * 3 + 1;
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = (Math.random() - 0.5) * 4 - 2;
        this.op = 1;
        this.fade = Math.random() * 0.02 + 0.015;
    }
    update() { this.x += this.vx; this.y += this.vy; this.op -= this.fade; }
    draw(c) {
        c.save();
        c.globalAlpha = Math.max(0, this.op);
        const g = c.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.s);
        g.addColorStop(0, '#fef7d0');
        g.addColorStop(0.4, '#d4af37');
        g.addColorStop(1, 'transparent');
        c.fillStyle = g;
        c.beginPath();
        c.arc(this.x, this.y, this.s, 0, Math.PI * 2);
        c.fill();
        c.restore();
    }
}

function bgLoop() {
    bgCtx.clearRect(0, 0, bgCvs.width, bgCvs.height);
    if (Math.random() < 0.05 && petals.length < 50) petals.push(new FallingPetal());
    petals = petals.filter(p => { p.update(); p.draw(bgCtx); return p.y < bgCvs.height + 20 && p.y > -30 && p.op > 0; });
    sparkles = sparkles.filter(s => { s.update(); s.draw(bgCtx); return s.op > 0; });
    requestAnimationFrame(bgLoop);
}
bgLoop();

// Click sparkle
document.addEventListener('click', e => {
    if (e.target.tagName === 'BUTTON') return;
    const h = document.createElement('div');
    h.className = 'float-heart';
    h.innerHTML = Math.random() > 0.5 ? '🌸' : '♥';
    h.style.left = e.clientX + 'px';
    h.style.top = e.clientY + 'px';
    document.body.appendChild(h);
    setTimeout(() => h.remove(), 3000);
});


// ============ MAGIC BUTTON LOGIC ============
const magicBtn = document.getElementById('magicBtn');
const actionCont = document.getElementById('actionContainer');
const bouquetWrap = document.getElementById('bouquetWrapper');
const loveMsg = document.getElementById('loveMessage');

magicBtn.addEventListener('click', e => {
    e.stopPropagation();

    // Hide button
    actionCont.classList.add('hidden');

    // Show bouquet (slide up) & love message
    setTimeout(() => {
        loveMsg.classList.add('show');
        bouquetWrap.classList.add('show');
    }, 150);

    // Rising petal storm from bottom
    for (let i = 0; i < 60; i++) {
        setTimeout(() => {
            const rx = Math.random() * window.innerWidth;
            const ry = window.innerHeight + 10;
            petals.push(new FallingPetal(rx, ry, true));
            if (Math.random() < 0.25) sparkles.push(new Spark(rx, ry));
        }, i * 30);
    }
});
