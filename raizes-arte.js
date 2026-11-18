// ==========================================================
// raizes-arte.js — TODA A ARTE DO "RAÍZES DE NEON"
//
// Nada de imagens externas: cada planta, prop, ícone e o próprio
// sobrevivente são desenhados aqui com canvas 2D. Os desenhos são
// feitos uma vez só (em 2x, para ficarem nítidos) e guardados em
// cache — o jogo só "carimba" as imagens prontas a cada quadro.
//
// Estilo: contorno escuro grosso, 2–3 tons por objeto e partes
// bioluminescentes (olhos, esporos, neon) que brilham no escuro.
// Todos os sprites olham para a DIREITA; o jogo espelha quando
// o bicho anda para a esquerda.
// ==========================================================

const ARTE = (() => {
  const E = 2;               // escala de pré-renderização
  const TINTA = "#05080b";   // cor do contorno
  const TAU = Math.PI * 2;
  const cache = new Map();

  // ---------- Ajudantes ----------
  function tela(w, h) {
    const c = document.createElement("canvas");
    c.width = Math.ceil(w); c.height = Math.ceil(h);
    return c;
  }
  function rng(semente) {
    let s = (semente >>> 0) || 1;
    return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
  }
  function hash2(x, y) {
    let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return (h ^ (h >>> 16)) >>> 0;
  }
  function elipse(c, x, y, rx, ry, rot = 0) { c.beginPath(); c.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot, 0, TAU); }
  function rr(c, x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x + r, y); c.lineTo(x + w - r, y); c.quadraticCurveTo(x + w, y, x + w, y + r);
    c.lineTo(x + w, y + h - r); c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    c.lineTo(x + r, y + h); c.quadraticCurveTo(x, y + h, x, y + h - r);
    c.lineTo(x, y + r); c.quadraticCurveTo(x, y, x + r, y); c.closePath();
  }
  function contornar(c, w = 2, cor = TINTA) { c.strokeStyle = cor; c.lineWidth = w; c.stroke(); }
  function encher(c, cor) { c.fillStyle = cor; c.fill(); }
  function radial(c, x, y, r, paradas, x0 = x, y0 = y) {
    const g = c.createRadialGradient(x0, y0, 0, x, y, r);
    for (const [p, cor] of paradas) g.addColorStop(p, cor);
    return g;
  }
  function linear(c, x0, y0, x1, y1, paradas) {
    const g = c.createLinearGradient(x0, y0, x1, y1);
    for (const [p, cor] of paradas) g.addColorStop(p, cor);
    return g;
  }
  function brilhar(c, cor, blur, fn) {
    c.save(); c.shadowColor = cor; c.shadowBlur = blur; fn(); c.restore();
  }
  // Traço grosso com contorno (caules, cipós, raízes)
  function traco(c, caminho, larg, cor, brilho) {
    caminho(); c.strokeStyle = TINTA; c.lineWidth = larg + 3.5; c.stroke();
    caminho(); c.strokeStyle = cor; c.lineWidth = larg; c.stroke();
    if (brilho) { caminho(); c.strokeStyle = brilho; c.lineWidth = Math.max(1, larg * 0.3); c.stroke(); }
  }
  function folha(c, x, y, ang, comp, larg, cor, corEsc) {
    c.save(); c.translate(x, y); c.rotate(ang);
    c.beginPath(); c.moveTo(0, 0);
    c.quadraticCurveTo(larg, -comp * 0.5, 0, -comp);
    c.quadraticCurveTo(-larg, -comp * 0.5, 0, 0);
    c.closePath();
    c.fillStyle = linear(c, -larg, 0, larg, 0, [[0, corEsc], [1, cor]]); c.fill();
    contornar(c, 1.6);
    c.beginPath(); c.moveTo(0, -1); c.lineTo(0, -comp * 0.85);
    c.strokeStyle = "rgba(0,0,0,.3)"; c.lineWidth = 1; c.stroke();
    c.restore();
  }
  function espinho(c, x, y, ang, comp, cor = "#ece6c4") {
    c.save(); c.translate(x, y); c.rotate(ang);
    c.beginPath(); c.moveTo(0, -comp * 0.3); c.lineTo(comp, 0); c.lineTo(0, comp * 0.3); c.closePath();
    encher(c, cor); contornar(c, 1);
    c.restore();
  }
  function olho(c, x, y, r, cor, pupila = true) {
    brilhar(c, cor, r * 3, () => { elipse(c, x, y, r, r); encher(c, cor); });
    elipse(c, x, y, r, r); contornar(c, 1.2);
    if (pupila) { elipse(c, x + r * 0.18, y, r * 0.33, r * 0.72); encher(c, "#1a0420"); }
    elipse(c, x - r * 0.35, y - r * 0.4, r * 0.24, r * 0.24); encher(c, "rgba(255,255,255,.85)");
  }
  function bez(p0, p1, p2, p3, t) {
    const u = 1 - t;
    return [
      u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
      u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
    ];
  }

  // Mandíbula de planta carnívora (dobradiça na origem, abre para a direita)
  function mandibula(c, ang, lado, esc = 1, coroa = false) {
    c.save(); c.rotate(ang); c.scale(esc, lado * esc);
    // espinhos/cílios da borda
    for (let a = Math.PI * 1.12; a < Math.PI * 1.97; a += coroa ? 0.24 : 0.16) {
      const x = 13 + Math.cos(a) * 14, y = Math.sin(a) * 11;
      const ex = Math.cos(a) * (coroa ? 7 : 5), ey = Math.sin(a) * (coroa ? 7 : 5);
      c.beginPath(); c.moveTo(x, y); c.lineTo(x + ex, y + ey);
      if (coroa) { c.save(); c.shadowColor = "#ff3fd8"; c.shadowBlur = 6; c.strokeStyle = "#ff7ae8"; c.lineWidth = 2.2; c.stroke(); c.restore(); }
      else { c.strokeStyle = "#cfe8a8"; c.lineWidth = 1.4; c.stroke(); }
    }
    // lobo externo
    c.beginPath(); c.moveTo(0, 0); c.ellipse(13, 0, 14, 11, 0, Math.PI, TAU); c.closePath();
    c.fillStyle = linear(c, 0, -11, 0, 0, [[0, "#2c7428"], [0.65, "#58bd45"], [1, "#86e266"]]); c.fill();
    contornar(c, 2 / esc);
    // interior vermelho
    c.beginPath(); c.moveTo(1.5, 0); c.ellipse(13, 0, 12, 4.6, 0, Math.PI, TAU); c.closePath();
    encher(c, "#d61b4b");
    elipse(c, 10, -2, 3, 1.2); encher(c, "rgba(255,170,190,.5)");
    // dentes
    for (let x = 2.5; x <= 24; x += 3.6) {
      c.beginPath(); c.moveTo(x - 1.4, -0.3); c.lineTo(x, 4.6); c.lineTo(x + 1.4, -0.3); c.closePath();
      encher(c, "#f6f1d2"); contornar(c, 0.8 / esc);
    }
    // pintas
    for (const [x, y] of [[8, -7], [15, -8.5], [21, -6]]) { elipse(c, x, y, 1.6, 1.1); encher(c, "rgba(15,60,20,.55)"); }
    c.restore();
  }
  function cabecaCarnivora(c, x, y, rot, esc, ab, coroa = false) {
    c.save(); c.translate(x, y); c.rotate(rot);
    mandibula(c, ab, -1, esc);
    brilhar(c, "#ff4f9a", 10 * esc, () => { elipse(c, 4 * esc, 0, 4 * esc, 2.2 * esc); encher(c, "#ff8fb8"); });
    mandibula(c, -ab, 1, esc, coroa);
    c.restore();
  }

  // ==========================================================
  // SPRITES: tipo → { caixa (tamanho em px do mundo), quadros, desenhar }
  // ==========================================================
  const SPRITES = {
    // ------------------------------------------------------
    // PLANTAS INIMIGAS
    // ------------------------------------------------------
    broto: { caixa: 46, quadros: 2, desenhar(c, q) {
      const b = q ? 0.2 : -0.12;
      for (const [x0, x1] of [[-6, -11], [0, 1], [6, 11]]) {
        traco(c, () => { c.beginPath(); c.moveTo(x0, 6); c.quadraticCurveTo(x0, 12, x1, 15 - (q && x0 === 0 ? 1 : 0)); }, 2.4, "#3d6b2a");
      }
      folha(c, -1, -9, -0.75 + b, 13, 6, "#86e566", "#2c7a29");
      folha(c, 1, -9, 0.75 + b, 12, 6, "#86e566", "#2c7a29");
      elipse(c, 0, 0, 13, 11.5);
      c.fillStyle = radial(c, -4, -5, 18, [[0, "#b2f394"], [0.45, "#3fae4c"], [1, "#124a24"]]); c.fill();
      contornar(c, 2.2);
      for (const [x, y, r] of [[-7, 4, 2], [-3, 7, 1.4], [-8, -2, 1.2]]) { elipse(c, x, y, r, r * 0.8); encher(c, "rgba(8,40,18,.5)"); }
      c.beginPath(); c.moveTo(1, 5); c.quadraticCurveTo(7, 9.5, 12, 3.5); contornar(c, 1.8);
      for (const x of [4, 7, 10]) { c.beginPath(); c.moveTo(x - 1, 6.2 + (x === 7 ? 0.6 : 0)); c.lineTo(x, 4.4); c.lineTo(x + 1, 6.4); encher(c, "#f4f0d0"); }
      olho(c, 5, -2, 3.6, "#ff4fe0");
    }},

    cipo: { caixa: 62, quadros: 2, desenhar(c, q) {
      const w = q ? 1 : -1;
      const p0 = [-26, 12], p1 = [-17, 12 - 11 * w], p2 = [-6, 12 + 11 * w], p3 = [4, 0];
      const corpo = () => { c.beginPath(); c.moveTo(...p0); c.bezierCurveTo(...p1, ...p2, ...p3); };
      traco(c, corpo, 8.5, "#356e2a", "#69bd48");
      for (let i = 1; i < 6; i++) {
        const [x, y] = bez(p0, p1, p2, p3, i / 6);
        espinho(c, x, y - 4, -Math.PI / 2 - 0.3, 5);
        if (i % 2) folha(c, x, y + 3, 2.4 + w * 0.3, 8, 3.5, "#7ad85a", "#2a6b26");
      }
      c.save(); c.translate(9, -2); c.rotate(-0.22);
      elipse(c, 0, 0, 11, 8.5);
      c.fillStyle = radial(c, -3, -4, 14, [[0, "#a3ec74"], [0.6, "#3c8c34"], [1, "#1a481c"]]); c.fill();
      contornar(c, 2);
      c.beginPath(); c.moveTo(3, 1.5); c.lineTo(12.5, q ? -3 : -1.5); c.lineTo(12.5, q ? 5 : 3.5); c.closePath();
      encher(c, "#ff3d8b"); contornar(c, 1.4);
      olho(c, 0, -3.5, 2.4, "#e8ff4a"); olho(c, 5, -3, 1.9, "#e8ff4a");
      c.restore();
    }},

    dioneia: { caixa: 74, quadros: 2, desenhar(c, q) {
      const ab = q ? 0.55 : 0.2;
      folha(c, -4, 20, -1.9, 17, 6, "#5cc04a", "#1f5f27");
      folha(c, 2, 20, 1.7, 16, 6, "#5cc04a", "#1f5f27");
      folha(c, 0, 21, -0.25, 12, 5, "#5cc04a", "#1f5f27");
      traco(c, () => { c.beginPath(); c.moveTo(-1, 20); c.quadraticCurveTo(-11, 10, -11, 0); }, 4, "#3b7a2c");
      cabecaCarnivora(c, -11, 0, 0, 1, ab);
    }},

    orquidea: { caixa: 52, quadros: 2, desenhar(c, q) {
      for (const [x0, x1] of [[-3, -9], [3, 9]]) traco(c, () => { c.beginPath(); c.moveTo(x0, 6); c.quadraticCurveTo(x0, 14, x1, 17); }, 2, "#4d6b2e");
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * TAU - Math.PI / 2 + (q ? 0.14 : 0);
        c.save(); c.rotate(a);
        c.beginPath(); c.moveTo(0, 0);
        c.bezierCurveTo(6, -5, 14, -7, 16, 0); c.bezierCurveTo(14, 7, 6, 5, 0, 0);
        c.fillStyle = linear(c, 0, 0, 16, 0, [[0, "#ffd6ff"], [0.4, "#e879f9"], [1, "#86198f"]]); c.fill();
        contornar(c, 1.5);
        c.beginPath(); c.moveTo(3, 0); c.lineTo(12, 0); c.strokeStyle = "rgba(80,0,90,.4)"; c.lineWidth = 1; c.stroke();
        c.restore();
      }
      const rn = q ? 6.8 : 5.4;
      brilhar(c, "#fff36b", q ? 18 : 9, () => {
        elipse(c, 0, 0, rn, rn);
        c.fillStyle = radial(c, 0, 0, rn, [[0, "#ffffff"], [0.4, "#fff36b"], [1, "#ff8a00"]]); c.fill();
      });
      elipse(c, 0, 0, rn, rn); contornar(c, 1.4);
      for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; elipse(c, Math.cos(a) * rn * 0.55, Math.sin(a) * rn * 0.55, 0.9, 0.9); encher(c, "#a33a00"); }
    }},

    esporo: { caixa: 62, quadros: 2, desenhar(c, q) {
      const s = q ? 1.07 : 0.97;
      c.beginPath(); c.moveTo(-7, 19); c.quadraticCurveTo(-8, 5, -5, -2); c.lineTo(5, -2); c.quadraticCurveTo(8, 5, 7, 19); c.closePath();
      c.fillStyle = linear(c, -7, 0, 7, 0, [[0, "#a49d80"], [0.5, "#ece6cc"], [1, "#9c957a"]]); c.fill();
      contornar(c, 2);
      for (const [x, y] of [[-4, 16], [3, 17]]) traco(c, () => { c.beginPath(); c.moveTo(x, 17); c.lineTo(x + (x < 0 ? -4 : 4), 21); }, 1.5, "#7d7660");
      olho(c, -1.5, 7, 2.3, "#7dff6a"); olho(c, 3.5, 6, 1.9, "#7dff6a");
      c.save(); c.translate(0, -2); c.scale(s, 2 - s);
      c.beginPath(); c.moveTo(-20, 2); c.quadraticCurveTo(-20, -18, 0, -19); c.quadraticCurveTo(20, -18, 20, 2);
      c.quadraticCurveTo(0, 7, -20, 2); c.closePath();
      c.fillStyle = radial(c, -6, -11, 26, [[0, "#d7a6ff"], [0.35, "#8b3fd9"], [1, "#2e0656"]]); c.fill();
      contornar(c, 2.2);
      c.beginPath(); c.moveTo(-17, 2.5); c.quadraticCurveTo(0, 6, 17, 2.5); c.strokeStyle = "rgba(0,0,0,.35)"; c.lineWidth = 2; c.stroke();
      for (const [x, y, r] of [[-10, -8, 3], [2, -13, 3.6], [11, -6, 2.6], [-3, -4, 2], [14, -12, 1.6], [-14, -2, 1.5]]) {
        brilhar(c, "#b6ff3b", 8, () => { elipse(c, x, y, r, r * 0.85); encher(c, "#dcff86"); });
      }
      c.restore();
    }},

    cacto: { caixa: 74, quadros: 2, desenhar(c, q) {
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * TAU;
        const x = Math.cos(a) * 19, y = Math.sin(a) * 21 - 1;
        if (y > 16) continue;
        espinho(c, x, y, a + (i % 2 ? 0.2 : -0.2), 6);
      }
      c.beginPath(); c.moveTo(-17, 20); c.bezierCurveTo(-25, 4, -21, -21, 0, -23); c.bezierCurveTo(21, -21, 25, 4, 17, 20); c.closePath();
      c.fillStyle = linear(c, -22, 0, 22, 0, [[0, "#163f28"], [0.45, "#3f9a5a"], [0.6, "#4fae68"], [1, "#163f28"]]); c.fill();
      contornar(c, 2.4);
      for (const x of [-12, -4, 4, 12]) {
        c.beginPath(); c.moveTo(x * 0.85, 19); c.quadraticCurveTo(x * 1.35, 0, x * 0.55, -21);
        c.strokeStyle = "rgba(0,0,0,.28)"; c.lineWidth = 1.6; c.stroke();
      }
      rr(c, -12, -9, 24, 19, 3);
      c.fillStyle = linear(c, 0, -9, 0, 10, [[0, "#b6bec8"], [1, "#545c68"]]); c.fill();
      contornar(c, 2);
      for (const [x, y] of [[-9, -6], [9, -6], [-9, 7], [9, 7]]) { elipse(c, x, y, 1.3, 1.3); encher(c, "#2b3138"); }
      c.beginPath(); c.moveTo(-12, 2); c.lineTo(12, 2); c.strokeStyle = "rgba(0,0,0,.25)"; c.lineWidth = 1; c.stroke();
      brilhar(c, "#ff7a1a", 10, () => { rr(c, -8, -4, 16, 4, 1.5); encher(c, q ? "#ffd08a" : "#ff9a3d"); });
      for (let i = 0; i < 5; i++) {
        c.save(); c.translate(0, -23); c.rotate(i / 5 * TAU);
        c.beginPath(); c.ellipse(0, -4, 2.4, 4.5, 0, 0, TAU);
        brilhar(c, "#ff3fd8", 6, () => encher(c, "#ff6be6"));
        contornar(c, 1);
        c.restore();
      }
      elipse(c, 0, -23, 2.2, 2.2); encher(c, "#fff36b"); contornar(c, 1);
    }},

    raiz: { caixa: 62, quadros: 2, desenhar(c, q) {
      const w = q ? 1 : -1;
      elipse(c, 0, 17, 16, 6.5); encher(c, "#06080a"); contornar(c, 1.6, "#3a2a20");
      for (const a of [0.3, 1.4, 2.6, 3.4]) {
        c.beginPath(); c.moveTo(Math.cos(a) * 15, 17 + Math.sin(a) * 6); c.lineTo(Math.cos(a) * 24, 17 + Math.sin(a) * 9);
        c.strokeStyle = "#1a1410"; c.lineWidth = 1.5; c.stroke();
      }
      const pts = [];
      for (let i = 0; i <= 12; i++) {
        const t = i / 12;
        pts.push([Math.sin(t * 3.2) * 8 * w * t, 16 - t * 42, 8.5 * (1 - t) + 0.8]);
      }
      c.beginPath();
      pts.forEach(([x, y, l], i) => (i ? c.lineTo(x - l, y) : c.moveTo(x - l, y)));
      for (let i = pts.length - 1; i >= 0; i--) c.lineTo(pts[i][0] + pts[i][2], pts[i][1]);
      c.closePath();
      c.fillStyle = linear(c, -8, 0, 8, 0, [[0, "#3a1f15"], [0.5, "#7a4a32"], [1, "#2e1810"]]); c.fill();
      contornar(c, 2);
      c.beginPath(); pts.slice(0, 10).forEach(([x, y], i) => (i ? c.lineTo(x + 1, y) : c.moveTo(x + 1, y)));
      brilhar(c, "#ff3fd8", 6, () => { c.strokeStyle = "#ff6be6"; c.lineWidth = 1.3; c.stroke(); });
      for (let i = 2; i < 11; i += 2) {
        const [x, y, l] = pts[i];
        espinho(c, x + l, y, -0.4, 5);
        espinho(c, x - l, y + 2, Math.PI + 0.4, 4.5);
      }
    }},

    girassol: { caixa: 78, quadros: 2, desenhar(c, q) {
      traco(c, () => { c.beginPath(); c.moveTo(0, 30); c.quadraticCurveTo(-4, 16, 0, 6); }, 4, "#3b7a2c");
      folha(c, -1, 22, -1.3, 14, 5.5, "#62c44b", "#1f5f27");
      folha(c, 0, 18, 1.35, 13, 5.5, "#62c44b", "#1f5f27");
      c.save(); c.translate(0, -6); c.rotate(q ? 0.13 : 0);
      for (let i = 0; i < 12; i++) {
        c.save(); c.rotate(i / 12 * TAU);
        c.beginPath(); c.moveTo(9, -3); c.lineTo(22, 0); c.lineTo(9, 3); c.closePath();
        c.fillStyle = linear(c, 9, 0, 22, 0, [[0, "#ca8a04"], [0.5, "#fde047"], [1, "#fff7b0"]]); c.fill();
        contornar(c, 1.3);
        c.restore();
      }
      elipse(c, 0, 0, 11.5, 11.5);
      c.fillStyle = radial(c, -3, -3, 14, [[0, "#6a4318"], [1, "#24130a"]]); c.fill();
      contornar(c, 2);
      for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; elipse(c, Math.cos(a) * 8, Math.sin(a) * 8, 1, 1); encher(c, "#ffb43a"); }
      olho(c, 1.5, 0, 4.6, "#ff9a1a");
      c.restore();
    }},

    barril: { caixa: 44, quadros: 1, desenhar(c) {
      elipse(c, 0, 13, 13, 4.5); encher(c, "#3a1a0c"); contornar(c, 2);
      c.beginPath(); c.moveTo(-13, -11); c.lineTo(-13, 13); c.ellipse(0, 13, 13, 4.5, 0, Math.PI, 0, true); c.lineTo(13, -11); c.closePath();
      c.fillStyle = linear(c, -13, 0, 13, 0, [[0, "#5a2a12"], [0.4, "#d9661f"], [0.6, "#e8803a"], [1, "#5a2a12"]]); c.fill();
      contornar(c, 2);
      for (const y of [-4, 6]) { c.beginPath(); c.moveTo(-13, y); c.quadraticCurveTo(0, y + 4.5, 13, y); contornar(c, 1.6, "#3a1a0c"); }
      elipse(c, 0, -11, 13, 4.5);
      c.fillStyle = radial(c, -3, -12, 14, [[0, "#ff9b55"], [1, "#9a4314"]]); c.fill(); contornar(c, 2);
      elipse(c, 4, -11, 2.5, 1); encher(c, "#2a1206");
      c.beginPath(); c.moveTo(0, -1); c.lineTo(5, 7); c.lineTo(-5, 7); c.closePath(); encher(c, "#ffe14a"); contornar(c, 1.2);
      c.fillStyle = TINTA; c.fillRect(-0.6, 1.5, 1.2, 3); c.fillRect(-0.6, 5, 1.2, 1.2);
      c.beginPath(); c.moveTo(-11, -2); c.lineTo(-11, 9); c.strokeStyle = "rgba(255,255,255,.18)"; c.lineWidth = 2; c.stroke();
    }},

    // ------------------------------------------------------
    // CHEFES
    // ------------------------------------------------------
    rainha: { caixa: 176, quadros: 2, desenhar(c, q) {
      const ab = q ? 0.5 : 0.2;
      for (const [x, y, a] of [[-46, 30, -1.9], [-38, 42, -2.4], [-22, 48, -2.9], [-4, 52, 3.1], [14, 50, 2.7], [32, 44, 2.2], [44, 32, 1.8]]) {
        folha(c, x, y, a, 38, 14, "#5fc94a", "#1a5622");
      }
      traco(c, () => { c.beginPath(); c.moveTo(-14, 44); c.quadraticCurveTo(-44, 26, -44, 2); }, 6, "#3b7a2c");
      traco(c, () => { c.beginPath(); c.moveTo(4, 44); c.quadraticCurveTo(26, 30, 30, 10); }, 6, "#3b7a2c");
      cabecaCarnivora(c, -44, 2, -2.25, 0.95, q ? 0.3 : 0.55);
      cabecaCarnivora(c, 30, 10, -0.95, 0.85, q ? 0.55 : 0.28);
      traco(c, () => { c.beginPath(); c.moveTo(-6, 48); c.quadraticCurveTo(-26, 26, -24, -6); }, 13, "#3b7a2c", "#5ba944");
      cabecaCarnivora(c, -24, -6, -0.12, 2.05, ab, true);
    }},

    colosso: { caixa: 184, quadros: 2, desenhar(c, q) {
      const w = q ? 1 : -1;
      const V1 = "#2f6b2a", V2 = "#4f9a3a";
      for (const [x0, x1] of [[-14, -38], [0, -6], [14, 32]]) {
        traco(c, () => { c.beginPath(); c.moveTo(x0, 22); c.quadraticCurveTo(x1 * 0.8, 44, x1, 66); }, 10, V1, "#4b8c38");
      }
      traco(c, () => { c.beginPath(); c.moveTo(-20, -22); c.bezierCurveTo(-50, -32 + w * 6, -66, 0, -56, 26 + w * 5); }, 12, V1, V2);
      traco(c, () => { c.beginPath(); c.moveTo(20, -22); c.bezierCurveTo(52, -36 - w * 6, 70, -4, 60, 22 - w * 5); }, 12, V1, V2);
      for (const [x, y] of [[-56, 28 + w * 5], [60, 24 - w * 5]]) {
        for (let i = 0; i < 9; i++) { const a = i / 9 * TAU; espinho(c, x + Math.cos(a) * 12, y + Math.sin(a) * 11, a, 7); }
        elipse(c, x, y, 13, 12);
        c.fillStyle = radial(c, x - 4, y - 4, 16, [[0, "#8fdc62"], [1, "#1f4d1d"]]); c.fill(); contornar(c, 2.2);
      }
      for (let i = 0; i < 7; i++) {
        const o = (i - 3) * 6.5;
        traco(c, () => { c.beginPath(); c.moveTo(o * 1.5, 28); c.bezierCurveTo(o + 16, 8, o - 16, -18, o * 0.8, -42); }, 7, i % 2 ? V1 : V2);
      }
      brilhar(c, "#b6ff3b", 26, () => {
        elipse(c, 0, -10, 13, 13);
        c.fillStyle = radial(c, 0, -10, 13, [[0, "#ffffff"], [0.35, "#e2ff8a"], [1, "#56b81a"]]); c.fill();
      });
      elipse(c, 0, -10, 13, 13); contornar(c, 2);
      for (const [a, b] of [[-14, 14], [14, -14]]) traco(c, () => { c.beginPath(); c.moveTo(a, -24); c.quadraticCurveTo(0, -8, b, 4); }, 3.5, V1);
      for (let i = 0; i < 7; i++) espinho(c, (i - 3) * 6, -58 - Math.abs(i - 3) * -1.5, -Math.PI / 2 + (i - 3) * 0.25, 8, "#ff7ae8");
      elipse(c, 0, -50, 17, 13);
      c.fillStyle = radial(c, -5, -55, 20, [[0, "#86d45a"], [1, "#1a441a"]]); c.fill(); contornar(c, 2.2);
      olho(c, -7, -51, 3.4, "#e8ff4a"); olho(c, 2, -54, 3.8, "#e8ff4a"); olho(c, 10, -49, 3, "#e8ff4a");
      c.beginPath(); c.moveTo(-8, -43); c.quadraticCurveTo(2, -38, 12, -43); contornar(c, 2);
    }},

    matriarca: { caixa: 290, quadros: 2, desenhar(c, q) {
      for (let i = 0; i < 9; i++) {
        const a = Math.PI * (0.06 + i * 0.11);
        const x1 = Math.cos(a) * 125, y1 = 82 + Math.sin(a) * 42;
        traco(c, () => { c.beginPath(); c.moveTo((i - 4) * 9, 58); c.quadraticCurveTo(x1 * 0.55, 72 + Math.sin(i) * 8, x1, y1); }, 11 - Math.abs(i - 4) * 1.3, "#4a3122", "#6b4a34");
      }
      c.beginPath(); c.moveTo(-44, 64); c.bezierCurveTo(-36, 22, -32, -18, -38, -50);
      c.lineTo(38, -50); c.bezierCurveTo(32, -18, 36, 22, 44, 64); c.closePath();
      c.fillStyle = linear(c, -44, 0, 44, 0, [[0, "#22160f"], [0.45, "#5f412d"], [0.6, "#6c4a33"], [1, "#22160f"]]); c.fill();
      contornar(c, 3);
      for (const x of [-26, -14, 12, 25]) {
        c.beginPath(); c.moveTo(x, 60); c.bezierCurveTo(x + 5, 30, x - 5, 0, x + 2, -46);
        c.strokeStyle = "rgba(0,0,0,.35)"; c.lineWidth = 2; c.stroke();
      }
      const bolhas = [[-66, -78, 40], [-28, -104, 44], [22, -108, 42], [64, -80, 40], [0, -70, 46], [-54, -44, 28], [54, -44, 28]];
      for (const [x, y, r] of bolhas) { elipse(c, x, y, r, r * 0.9); contornar(c, 7); }
      for (const [x, y, r] of bolhas) {
        elipse(c, x, y, r, r * 0.9);
        c.fillStyle = radial(c, x, y, r, [[0, "#2f6a35"], [0.7, "#173d22"], [1, "#0d2615"]], x - r * 0.3, y - r * 0.4); c.fill();
      }
      for (const [x, y, r] of [[-70, -86, 4], [-36, -116, 3.5], [10, -122, 4.5], [50, -96, 4], [76, -70, 3.2], [-12, -86, 3.5], [30, -78, 3], [-50, -58, 3], [-84, -60, 2.8], [64, -52, 3]]) {
        brilhar(c, "#ff3fd8", 12, () => { elipse(c, x, y, r, r); encher(c, "#ff8ef0"); });
      }
      for (const [x, y] of [[-22, -36], [22, -36]]) {
        traco(c, () => { c.beginPath(); c.moveTo(x, y); c.bezierCurveTo(x * 1.6, y + 30, x * 1.9, y + 50, x * 1.7, y + 70); }, 2.5, "#2b3138");
        rr(c, x * 1.7 - 3, y + 68, 6, 7, 1.5); encher(c, "#8a94a3"); contornar(c, 1.4);
      }
      c.save(); c.translate(0, -8);
      elipse(c, 0, 0, 27, 27);
      c.fillStyle = linear(c, 0, -27, 0, 27, [[0, "#9aa4b1"], [1, "#30363e"]]); c.fill(); contornar(c, 2.5);
      for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; elipse(c, Math.cos(a) * 23, Math.sin(a) * 23, 1.8, 1.8); encher(c, "#1c2026"); }
      brilhar(c, "#ff2bd6", 30, () => {
        elipse(c, 0, 0, 19, 19);
        c.fillStyle = radial(c, 0, 0, 19, [[0, "#ffe0fb"], [0.4, "#ff4fe0"], [1, "#6e0a5a"]]); c.fill();
      });
      elipse(c, 0, 0, 19, 19); contornar(c, 2);
      const pr = q ? 6 : 8.5;
      elipse(c, 0, 0, pr * 0.45, pr * 1.7); encher(c, "#190014");
      elipse(c, -6, -7, 3.5, 3); encher(c, "rgba(255,255,255,.8)");
      c.restore();
      c.beginPath(); c.moveTo(-20, 34); c.lineTo(-10, 30); c.lineTo(-3, 36); c.lineTo(5, 29); c.lineTo(12, 35); c.lineTo(21, 31);
      brilhar(c, "#ff3fd8", 10, () => { c.strokeStyle = "#ff6be6"; c.lineWidth = 3; c.stroke(); });
      contornar(c, 1);
    }},

    // ------------------------------------------------------
    // ITENS E COLETÁVEIS
    // ------------------------------------------------------
    gema0: { caixa: 18, quadros: 1, desenhar(c) { gema(c, 5, "#22d3ee", "#cffafe", "#0e7490"); } },
    gema1: { caixa: 22, quadros: 1, desenhar(c) { gema(c, 6.5, "#a3e635", "#ecfccb", "#3f6212"); } },
    gema2: { caixa: 28, quadros: 1, desenhar(c) { gema(c, 8.5, "#f472f6", "#fde7ff", "#86198f"); } },
    gema3: { caixa: 34, quadros: 1, desenhar(c) { gema(c, 11, "#ff4d4d", "#ffe1e1", "#7f1d1d"); } },
    sucata: { caixa: 22, quadros: 1, desenhar(c) { engrenagem(c, 0, 0, 7.5, "#fbbf24", "#92400e"); } },
    cura: { caixa: 30, quadros: 1, desenhar(c) {
      rr(c, -9, -10, 18, 20, 4); c.fillStyle = linear(c, 0, -10, 0, 10, [[0, "#f8fafc"], [1, "#a8b3c2"]]); c.fill(); contornar(c, 2);
      rr(c, -6, -14, 12, 5, 2); encher(c, "#64748b"); contornar(c, 1.6);
      brilhar(c, "#4ade80", 8, () => { c.fillStyle = "#22c55e"; c.fillRect(-2.2, -6, 4.4, 12); c.fillRect(-6, -2.2, 12, 4.4); });
    }},
    ima: { caixa: 32, quadros: 1, desenhar(c) {
      c.lineCap = "butt";
      c.beginPath(); c.arc(0, -1, 8, Math.PI, 0); c.lineTo(8, 9); c.moveTo(-8, 9); c.lineTo(-8, -1);
      c.strokeStyle = TINTA; c.lineWidth = 9; c.stroke();
      c.beginPath(); c.arc(0, -1, 8, Math.PI, 0); c.strokeStyle = "#ef4444"; c.lineWidth = 5.5; c.stroke();
      c.beginPath(); c.moveTo(-8, -1); c.lineTo(-8, 5); c.moveTo(8, -1); c.lineTo(8, 5); c.stroke();
      c.beginPath(); c.moveTo(-8, 5); c.lineTo(-8, 9); c.moveTo(8, 5); c.lineTo(8, 9); c.strokeStyle = "#e2e8f0"; c.stroke();
      c.lineCap = "round";
      brilhar(c, "#60a5fa", 6, () => { for (const x of [-12, 12]) { c.beginPath(); c.moveTo(x, 10); c.lineTo(x * 1.25, 13); c.strokeStyle = "#93c5fd"; c.lineWidth = 1.5; c.stroke(); } });
    }},
    bomba: { caixa: 32, quadros: 1, desenhar(c) {
      elipse(c, 0, 1, 10, 10); c.fillStyle = radial(c, -3, -2, 13, [[0, "#64748b"], [1, "#0f172a"]]); c.fill(); contornar(c, 2);
      brilhar(c, "#22e5ff", 8, () => { elipse(c, 0, 1, 10, 3.5); c.strokeStyle = "#22e5ff"; c.lineWidth = 2; c.stroke(); });
      rr(c, -3.5, -12, 7, 4, 1); encher(c, "#94a3b8"); contornar(c, 1.4);
      brilhar(c, "#ff3b3b", 6, () => { elipse(c, 0, -4, 2, 2); encher(c, "#ff6b6b"); });
    }},
    bau: { caixa: 46, quadros: 1, desenhar(c) {
      rr(c, -16, -8, 32, 20, 3); c.fillStyle = linear(c, 0, -8, 0, 12, [[0, "#4b5563"], [1, "#1f2937"]]); c.fill(); contornar(c, 2.2);
      rr(c, -17, -14, 34, 9, 3); c.fillStyle = linear(c, 0, -14, 0, -5, [[0, "#6b7280"], [1, "#374151"]]); c.fill(); contornar(c, 2.2);
      c.save(); rr(c, -16, 2, 32, 7, 0); c.clip();
      for (let x = -20; x < 20; x += 6) { c.beginPath(); c.moveTo(x, 9); c.lineTo(x + 4, 2); c.lineTo(x + 7, 2); c.lineTo(x + 3, 9); c.closePath(); encher(c, "#facc15"); }
      c.restore();
      brilhar(c, "#22e5ff", 10, () => { c.fillStyle = "#67f3ff"; c.fillRect(-15, -5.5, 30, 1.8); });
      rr(c, -4, -8, 8, 7, 1.5); encher(c, "#fbbf24"); contornar(c, 1.4);
    }},

    // ------------------------------------------------------
    // PROJÉTEIS (armas e inimigos)
    // ------------------------------------------------------
    serra: { caixa: 36, quadros: 1, desenhar(c) {
      c.beginPath();
      for (let i = 0; i < 24; i++) { const a = i / 24 * TAU, r = i % 2 ? 11 : 15; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
      c.closePath();
      c.fillStyle = radial(c, -3, -3, 16, [[0, "#ffffff"], [0.5, "#cbd5e1"], [1, "#64748b"]]); c.fill(); contornar(c, 1.8);
      elipse(c, 0, 0, 5, 5); encher(c, "#1e293b"); contornar(c, 1.5);
      brilhar(c, "#22e5ff", 6, () => { elipse(c, 0, 0, 8.5, 8.5); c.strokeStyle = "#67e8f9"; c.lineWidth = 1.2; c.stroke(); });
    }},
    serraOuro: { caixa: 40, quadros: 1, desenhar(c) {
      c.beginPath();
      for (let i = 0; i < 28; i++) { const a = i / 28 * TAU, r = i % 2 ? 12 : 17; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
      c.closePath();
      c.fillStyle = radial(c, -3, -3, 18, [[0, "#fffbe0"], [0.5, "#fcd34d"], [1, "#b45309"]]); c.fill(); contornar(c, 1.8);
      elipse(c, 0, 0, 5, 5); encher(c, "#451a03"); contornar(c, 1.5);
      brilhar(c, "#fff36b", 8, () => { elipse(c, 0, 0, 9, 9); c.strokeStyle = "#fff7b0"; c.lineWidth = 1.4; c.stroke(); });
    }},
    missil: { caixa: 30, quadros: 1, desenhar(c) {
      c.beginPath(); c.moveTo(-8, -3); c.lineTo(-12, -6); c.lineTo(-9, 0); c.lineTo(-12, 6); c.lineTo(-8, 3); c.closePath(); encher(c, "#ef4444"); contornar(c, 1.2);
      rr(c, -9, -3, 15, 6, 2); c.fillStyle = linear(c, 0, -3, 0, 3, [[0, "#f1f5f9"], [1, "#94a3b8"]]); c.fill(); contornar(c, 1.4);
      c.beginPath(); c.moveTo(6, -3); c.quadraticCurveTo(12, 0, 6, 3); c.closePath(); encher(c, "#ffb020"); contornar(c, 1.2);
    }},
    drone: { caixa: 36, quadros: 2, desenhar(c, q) {
      for (const [x, y] of [[-9, -7], [9, -7], [-9, 7], [9, 7]]) {
        traco(c, () => { c.beginPath(); c.moveTo(0, 0); c.lineTo(x, y); }, 2, "#475569");
        elipse(c, x, y, 6, q ? 1.4 : 2.6); encher(c, "rgba(200,220,240,.45)"); contornar(c, 0.8, "rgba(0,0,0,.6)");
      }
      rr(c, -6, -5, 12, 10, 3); c.fillStyle = linear(c, 0, -5, 0, 5, [[0, "#64748b"], [1, "#1e293b"]]); c.fill(); contornar(c, 1.6);
      olho(c, 2.5, 0, 2.2, "#ff4d6d", false);
    }},
    granada: { caixa: 22, quadros: 1, desenhar(c) {
      rr(c, -4.5, -7, 9, 14, 3); c.fillStyle = linear(c, -4.5, 0, 4.5, 0, [[0, "#3f6212"], [0.5, "#a3e635"], [1, "#3f6212"]]); c.fill(); contornar(c, 1.6);
      rr(c, -3, -9.5, 6, 3, 1); encher(c, "#94a3b8"); contornar(c, 1.2);
      c.fillStyle = TINTA; c.fillRect(-4.5, -1, 9, 2);
    }},
    semente: { caixa: 16, quadros: 1, desenhar(c) {
      elipse(c, 0, 0, 5.5, 3.5); c.fillStyle = radial(c, -1, -1, 6, [[0, "#fff1a8"], [1, "#b8860b"]]); c.fill(); contornar(c, 1.3);
      c.beginPath(); c.moveTo(-3, 0); c.lineTo(3, 0); c.strokeStyle = "rgba(0,0,0,.4)"; c.lineWidth = 0.8; c.stroke();
    }},
    espinhoP: { caixa: 18, quadros: 1, desenhar(c) {
      c.beginPath(); c.moveTo(8, 0); c.lineTo(-5, -2.6); c.lineTo(-3, 0); c.lineTo(-5, 2.6); c.closePath();
      c.fillStyle = linear(c, -5, 0, 8, 0, [[0, "#6b4a2e"], [1, "#f3eccb"]]); c.fill(); contornar(c, 1.2);
    }},
  };

  function gema(c, r, cor, claro, escuro) {
    brilhar(c, cor, r * 1.6, () => {
      c.beginPath(); c.moveTo(0, -r * 1.3); c.lineTo(r, 0); c.lineTo(0, r * 1.3); c.lineTo(-r, 0); c.closePath(); encher(c, cor);
    });
    c.beginPath(); c.moveTo(0, -r * 1.3); c.lineTo(r, 0); c.lineTo(0, r * 1.3); c.lineTo(-r, 0); c.closePath(); contornar(c, 1.4);
    c.beginPath(); c.moveTo(0, -r * 1.3); c.lineTo(r * 0.45, 0); c.lineTo(0, r * 0.2); c.lineTo(-r, 0); c.closePath(); encher(c, claro);
    c.beginPath(); c.moveTo(0, r * 1.3); c.lineTo(r, 0); c.lineTo(r * 0.45, 0); c.lineTo(0, r * 0.2); c.closePath(); encher(c, escuro);
  }
  function engrenagem(c, x, y, r, cor, escuro, contorno = true) {
    c.beginPath();
    for (let i = 0; i < 32; i++) {
      const a = i / 32 * TAU, rr2 = i % 4 < 2 ? r : r * 0.72;
      c.lineTo(x + Math.cos(a + 0.1) * rr2, y + Math.sin(a + 0.1) * rr2);
    }
    c.closePath();
    c.fillStyle = radial(c, x - r * 0.3, y - r * 0.3, r * 1.3, [[0, "#fff4c2"], [0.4, cor], [1, escuro]]); c.fill();
    if (contorno) contornar(c, 1.5);
    elipse(c, x, y, r * 0.32, r * 0.32); encher(c, escuro);
  }

  function sprite(tipo, q = 0, branco = false) {
    const def = SPRITES[tipo];
    q = q % (def.quadros || 1);
    const k = tipo + "|" + q + (branco ? "|b" : "");
    let img = cache.get(k);
    if (img) return img;
    const tam = def.caixa;
    img = tela(tam * E, tam * E);
    const c = img.getContext("2d");
    if (branco) {
      c.drawImage(sprite(tipo, q, false), 0, 0);
      c.globalCompositeOperation = "source-atop";
      c.fillStyle = "rgba(255,255,255,.95)";
      c.fillRect(0, 0, img.width, img.height);
    } else {
      c.scale(E, E); c.translate(tam / 2, tam / 2);
      c.lineJoin = "round"; c.lineCap = "round";
      def.desenhar(c, q);
    }
    cache.set(k, img);
    return img;
  }
  const caixa = tipo => SPRITES[tipo].caixa;

  // Brilho radial colorido (projéteis, gemas, explosões) — usar com "lighter"
  function brilho(cor) {
    const k = "brilho|" + cor;
    let img = cache.get(k);
    if (img) return img;
    img = tela(64, 64);
    const c = img.getContext("2d");
    const g = c.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, cor); g.addColorStop(0.25, cor + "aa"); g.addColorStop(1, cor + "00");
    c.fillStyle = g; c.fillRect(0, 0, 64, 64);
    cache.set(k, img);
    return img;
  }

  // Poça tóxica / nuvem (herbicida)
  function poca(cor) {
    const k = "poca|" + cor;
    let img = cache.get(k);
    if (img) return img;
    img = tela(128, 128);
    const c = img.getContext("2d");
    const r = rng(7);
    c.translate(64, 64);
    for (let i = 0; i < 9; i++) {
      const a = r() * TAU, d = r() * 22, rr2 = 26 + r() * 16;
      elipse(c, Math.cos(a) * d, Math.sin(a) * d, rr2, rr2 * 0.9);
      c.fillStyle = radial(c, Math.cos(a) * d, Math.sin(a) * d, rr2, [[0, cor + "88"], [0.7, cor + "44"], [1, cor + "00"]]); c.fill();
    }
    elipse(c, 0, 0, 60, 60); c.strokeStyle = cor + "55"; c.lineWidth = 2; c.stroke();
    cache.set(k, img);
    return img;
  }

  // ==========================================================
  // CHÃO: lajes de concreto rachadas (com junta nas bordas, então
  // emendam sem costura) + props espalhados de forma determinística
  // ==========================================================
  const LAJE = 320;
  function laje(variante) {
    const k = "laje|" + variante;
    let img = cache.get(k);
    if (img) return img;
    const s = LAJE;
    img = tela(s * E, s * E);
    const c = img.getContext("2d");
    c.scale(E, E);
    const r = rng(1013 + variante * 7919);
    c.fillStyle = "#121921"; c.fillRect(0, 0, s, s);
    for (let i = 0; i < 7; i++) {
      const x = r() * s, y = r() * s, rad = 50 + r() * 110;
      c.fillStyle = radial(c, x, y, rad, r() < 0.5 ? [[0, "rgba(40,54,66,.35)"], [1, "rgba(40,54,66,0)"]] : [[0, "rgba(3,6,9,.45)"], [1, "rgba(3,6,9,0)"]]);
      c.fillRect(0, 0, s, s);
    }
    for (let i = 0; i < 1400; i++) {
      c.fillStyle = r() < 0.5 ? "rgba(255,255,255,.03)" : "rgba(0,0,0,.22)";
      const t = r() < 0.9 ? 1.2 : 2.4;
      c.fillRect(r() * s, r() * s, t, t);
    }
    // marcas de pintura (algumas variantes)
    if (variante === 1) {
      c.save(); c.globalAlpha = 0.16;
      for (let i = 0; i < 4; i++) { c.fillStyle = "#f5c518"; c.fillRect(30 + i * 70, s / 2 - 4, 40, 8); }
      c.restore();
    }
    if (variante === 3) {
      c.save(); c.globalAlpha = 0.12; c.strokeStyle = "#22e5ff"; c.lineWidth = 6;
      elipse(c, s / 2, s / 2, 80, 80); c.stroke();
      c.font = "bold 70px sans-serif"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillStyle = "#22e5ff";
      c.fillText("H", s / 2, s / 2 + 3);
      c.restore();
    }
    // juntas da laje
    c.strokeStyle = "rgba(0,0,0,.6)"; c.lineWidth = 4; c.strokeRect(0, 0, s, s);
    c.strokeStyle = "rgba(140,180,210,.06)"; c.lineWidth = 1; c.strokeRect(4, 4, s - 8, s - 8);
    c.strokeStyle = "rgba(0,0,0,.28)"; c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(s / 2, 0); c.lineTo(s / 2, s); c.moveTo(0, s / 2); c.lineTo(s, s / 2); c.stroke();
    // rachaduras com musgo brilhante
    const nRach = 1 + Math.floor(r() * 3);
    for (let k2 = 0; k2 < nRach; k2++) {
      let x = 30 + r() * (s - 60), y = 30 + r() * (s - 60), a = r() * TAU;
      const pts = [[x, y]];
      for (let i = 0; i < 9 + r() * 9; i++) {
        a += (r() - 0.5) * 1.1; x += Math.cos(a) * (8 + r() * 10); y += Math.sin(a) * (8 + r() * 10);
        x = Math.max(8, Math.min(s - 8, x)); y = Math.max(8, Math.min(s - 8, y));
        pts.push([x, y]);
      }
      c.beginPath(); pts.forEach(([px, py], i) => (i ? c.lineTo(px, py) : c.moveTo(px, py)));
      c.strokeStyle = "rgba(50,190,90,.06)"; c.lineWidth = 6; c.stroke();
      c.strokeStyle = "#05080b"; c.lineWidth = 1.8; c.stroke();
      for (const [px, py] of pts) if (r() < 0.2) {
        c.fillStyle = radial(c, px, py, 7, [[0, "rgba(120,255,140,.22)"], [1, "rgba(120,255,140,0)"]]);
        c.fillRect(px - 7, py - 7, 14, 14);
        c.fillStyle = "#2d6b33"; c.fillRect(px - 1.5, py - 1.5, 3, 3);
      }
    }
    cache.set(k, img);
    return img;
  }

  const PROPS = {
    musgo: { caixa: 130, chato: true, desenhar(c, r) {
      for (let i = 0; i < 10; i++) {
        const a = r() * TAU, d = r() * 34, rad = 16 + r() * 20;
        elipse(c, Math.cos(a) * d, Math.sin(a) * d * 0.7, rad, rad * 0.7);
        c.fillStyle = radial(c, Math.cos(a) * d, Math.sin(a) * d * 0.7, rad, [[0, "rgba(46,110,52,.75)"], [1, "rgba(22,60,30,0)"]]); c.fill();
      }
      for (let i = 0; i < 16; i++) {
        const a = r() * TAU, d = r() * 40;
        const x = Math.cos(a) * d, y = Math.sin(a) * d * 0.7;
        brilhar(c, "#7dff8a", 6, () => { elipse(c, x, y, 1.4, 1.4); encher(c, r() < 0.3 ? "#b6ff3b" : "#7dff8a"); });
      }
    }},
    poca: { caixa: 110, chato: true, desenhar(c, r) {
      c.beginPath();
      for (let i = 0; i < 14; i++) { const a = i / 14 * TAU, rad = 34 + r() * 12; c.lineTo(Math.cos(a) * rad, Math.sin(a) * rad * 0.55); }
      c.closePath();
      c.fillStyle = linear(c, -40, -20, 40, 20, [[0, "#0b1d2a"], [0.5, "#06111a"], [1, "#160b22"]]); c.fill();
      c.strokeStyle = "rgba(0,0,0,.6)"; c.lineWidth = 2; c.stroke();
      c.save(); c.clip();
      c.globalAlpha = 0.5;
      for (const [x, cor] of [[-12, "#22e5ff"], [14, "#ff2bd6"]]) {
        c.fillStyle = radial(c, x, -4, 22, [[0, cor], [1, cor + "00"]]); c.fillRect(-60, -40, 120, 80);
      }
      c.restore();
      c.beginPath(); c.moveTo(-20, -6); c.lineTo(8, -10); c.strokeStyle = "rgba(255,255,255,.18)"; c.lineWidth = 1.5; c.stroke();
    }},
    entulho: { caixa: 80, desenhar(c, r) {
      elipse(c, 0, 8, 30, 10); encher(c, "rgba(0,0,0,.35)");
      for (let i = 0; i < 8; i++) {
        const x = (r() - 0.5) * 40, y = (r() - 0.5) * 18, t = 6 + r() * 9;
        c.beginPath();
        for (let k2 = 0; k2 < 5; k2++) { const a = k2 / 5 * TAU + r(); c.lineTo(x + Math.cos(a) * t, y + Math.sin(a) * t * 0.7); }
        c.closePath();
        const v = 60 + Math.floor(r() * 40);
        encher(c, `rgb(${v},${v + 4},${v + 10})`); contornar(c, 1.6);
      }
      for (let i = 0; i < 3; i++) {
        const x = (r() - 0.5) * 30;
        c.beginPath(); c.moveTo(x, 0); c.lineTo(x + (r() - 0.5) * 24, -14 - r() * 10);
        c.strokeStyle = "#7c4a2a"; c.lineWidth = 2; c.stroke();
      }
    }},
    carro: { caixa: 150, desenhar(c, r) {
      const cor = ["#5b3a2a", "#3d4a5a", "#4a2a3a", "#4a4a2a"][Math.floor(r() * 4)];
      elipse(c, 0, 18, 64, 18); encher(c, "rgba(0,0,0,.45)");
      rr(c, -60, -14, 120, 34, 12);
      c.fillStyle = linear(c, 0, -14, 0, 20, [[0, cor], [1, "#120c0a"]]); c.fill(); contornar(c, 2.5);
      rr(c, -34, -32, 64, 24, 10);
      c.fillStyle = linear(c, 0, -32, 0, -8, [[0, cor], [1, "#1a110c"]]); c.fill(); contornar(c, 2.5);
      for (const [x, w] of [[-28, 26], [2, 24]]) {
        rr(c, x, -28, w, 16, 4); c.fillStyle = linear(c, x, -28, x + w, -12, [[0, "#0f2a33"], [1, "#051015"]]); c.fill(); contornar(c, 1.6);
        c.beginPath(); c.moveTo(x + 4, -26); c.lineTo(x + w * 0.6, -14); c.moveTo(x + w * 0.5, -27); c.lineTo(x + w - 3, -18);
        c.strokeStyle = "rgba(200,240,255,.25)"; c.lineWidth = 1; c.stroke();
      }
      for (let i = 0; i < 9; i++) { elipse(c, -50 + r() * 100, -10 + r() * 26, 3 + r() * 5, 2 + r() * 3); encher(c, `rgba(${110 + r() * 60},${50 + r() * 30},20,.55)`); }
      for (const x of [-38, 38]) { elipse(c, x, 20, 11, 7); encher(c, "#0c0c0e"); contornar(c, 2); elipse(c, x, 20, 4, 3); encher(c, "#3a3a40"); }
      brilhar(c, "#ffb020", 8, () => { rr(c, 52, -6, 7, 6, 2); encher(c, "#ffcf6a"); });
      for (let i = 0; i < 3; i++) {
        traco(c, () => { c.beginPath(); const x = -40 + r() * 80; c.moveTo(x, 20); c.bezierCurveTo(x + 10, 0, x - 20, -20, x + r() * 30 - 15, -32); }, 2.4, "#2f6b2a");
        folha(c, -30 + r() * 60, -10 + r() * 20, r() * TAU, 9, 4, "#5fbf3a", "#1f5f27");
      }
    }},
    barreira: { caixa: 100, desenhar(c, r) {
      elipse(c, 0, 14, 44, 9); encher(c, "rgba(0,0,0,.4)");
      c.beginPath(); c.moveTo(-42, 14); c.lineTo(-34, -6); c.lineTo(-26, -14); c.lineTo(26, -14); c.lineTo(34, -6); c.lineTo(42, 14); c.closePath();
      c.fillStyle = linear(c, 0, -14, 0, 14, [[0, "#9aa1a8"], [1, "#4a5056"]]); c.fill(); contornar(c, 2.2);
      c.save(); c.clip(); c.globalAlpha = 0.55;
      for (let x = -50; x < 50; x += 14) { c.beginPath(); c.moveTo(x, 14); c.lineTo(x + 7, 14); c.lineTo(x + 19, -14); c.lineTo(x + 12, -14); c.closePath(); encher(c, "#e5b614"); }
      c.restore();
      c.beginPath(); c.moveTo(-6, -14); c.lineTo(-2, -2); c.lineTo(-8, 6); c.lineTo(-3, 14); contornar(c, 1.5);
      if (r() < 0.6) folha(c, 30, 10, 0.6, 16, 6, "#5fbf3a", "#1f5f27");
    }},
    placa: { caixa: 120, desenhar(c, r) {
      elipse(c, 0, 26, 50, 10); encher(c, "rgba(0,0,0,.45)");
      c.save(); c.rotate(-0.12);
      rr(c, -48, -18, 96, 40, 4); encher(c, "#15151c"); contornar(c, 2.5);
      const cor = r() < 0.5 ? "#ff2bd6" : "#22e5ff";
      brilhar(c, cor, 12, () => {
        c.strokeStyle = cor; c.lineWidth = 3.2;
        c.beginPath(); c.moveTo(-36, 12); c.lineTo(-36, -8); c.lineTo(-22, 12); c.lineTo(-22, -8); c.stroke();
        c.beginPath(); c.moveTo(-6, -8); c.lineTo(-14, -8); c.lineTo(-14, 12); c.lineTo(-6, 12); c.moveTo(-14, 2); c.lineTo(-8, 2); c.stroke();
        elipse(c, 8, 2, 7, 10); c.stroke();
        c.beginPath(); c.moveTo(22, 12); c.lineTo(22, -8); c.lineTo(36, 12); c.lineTo(36, -8); c.stroke();
      });
      c.beginPath(); c.moveTo(-6, 2); c.lineTo(-2, 2); c.strokeStyle = "#3a1030"; c.lineWidth = 3.4; c.stroke();
      c.restore();
      traco(c, () => { c.beginPath(); c.moveTo(-50, 20); c.bezierCurveTo(-30, 0, -10, 30, 20, 16); }, 2.2, "#2f6b2a");
    }},
    poste: { caixa: 140, desenhar(c, r) {
      elipse(c, 46, 6, 28, 12); c.fillStyle = radial(c, 46, 6, 30, [[0, "rgba(34,229,255,.28)"], [1, "rgba(34,229,255,0)"]]); c.fill();
      traco(c, () => { c.beginPath(); c.moveTo(-60, 12); c.lineTo(36, -4); }, 4.5, "#4b5563", "#9ca3af");
      rr(c, 30, -10, 22, 10, 3); encher(c, "#374151"); contornar(c, 2);
      brilhar(c, "#22e5ff", 14, () => { rr(c, 33, -2, 16, 4, 2); encher(c, "#a5f3fc"); });
      rr(c, -66, 6, 12, 12, 2); encher(c, "#2b3138"); contornar(c, 2);
    }},
    bueiro: { caixa: 60, chato: true, desenhar(c, r) {
      elipse(c, 0, 0, 20, 12); c.fillStyle = radial(c, 0, 0, 26, [[0, "rgba(120,255,140,.25)"], [1, "rgba(120,255,140,0)"]]); c.fill();
      elipse(c, 0, 0, 15, 9); encher(c, "#22272e"); contornar(c, 2);
      for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(i * 5 - 3, -6 + Math.abs(i)); c.lineTo(i * 5 + 3, -6 + Math.abs(i)); c.moveTo(i * 5 - 3, 6 - Math.abs(i)); c.lineTo(i * 5 + 3, 6 - Math.abs(i)); c.strokeStyle = "#0b0e12"; c.lineWidth = 1.5; c.stroke(); }
    }},
    pneus: { caixa: 64, desenhar(c, r) {
      elipse(c, 0, 12, 24, 7); encher(c, "rgba(0,0,0,.4)");
      for (const [x, y] of [[-8, 6], [9, 7], [0, -3]]) {
        elipse(c, x, y, 11, 6); encher(c, "#141518"); contornar(c, 2);
        elipse(c, x, y - 0.5, 5, 2.5); encher(c, "#050506");
      }
      if (r() < 0.7) folha(c, 6, -6, 0.4, 13, 5, "#5fbf3a", "#1f5f27");
    }},
    cogumelos: { caixa: 64, desenhar(c, r) {
      for (let i = 0; i < 5; i++) {
        const x = (r() - 0.5) * 34, y = (r() - 0.5) * 14 + 4, h = 6 + r() * 8, w = 4 + r() * 4;
        c.beginPath(); c.moveTo(x - 1.5, y); c.lineTo(x - 1, y - h); c.lineTo(x + 1, y - h); c.lineTo(x + 1.5, y); c.closePath(); encher(c, "#cfd6c8"); contornar(c, 1);
        const cor = r() < 0.5 ? "#22e5ff" : "#b6ff3b";
        brilhar(c, cor, 10, () => { c.beginPath(); c.ellipse(x, y - h, w, w * 0.65, 0, Math.PI, TAU); c.closePath(); encher(c, cor); });
        c.beginPath(); c.ellipse(x, y - h, w, w * 0.65, 0, Math.PI, TAU); c.closePath(); contornar(c, 1.2);
      }
    }},
  };
  const PESO_PROPS = [["musgo", 3], ["entulho", 3], ["poca", 2], ["cogumelos", 2], ["carro", 1], ["barreira", 1.5], ["placa", 0.7], ["poste", 1], ["bueiro", 1], ["pneus", 1.2]];
  const PESO_TOTAL = PESO_PROPS.reduce((a, [, p]) => a + p, 0);

  function prop(tipo, var_) {
    const k = "prop|" + tipo + "|" + var_;
    let img = cache.get(k);
    if (img) return img;
    const d = PROPS[tipo], tam = d.caixa;
    img = tela(tam * E, tam * E);
    const c = img.getContext("2d");
    c.scale(E, E); c.translate(tam / 2, tam / 2); c.lineJoin = "round"; c.lineCap = "round";
    d.desenhar(c, rng(9001 + var_ * 131 + tipo.length * 17));
    cache.set(k, img);
    return img;
  }

  // Descreve um pedaço de chão (laje + props) a partir das coordenadas
  const chunks = new Map();
  function chunk(cx, cy) {
    const k = cx + "," + cy;
    let ch = chunks.get(k);
    if (ch) return ch;
    const h = hash2(cx, cy);
    const r = rng(h);
    const v = h % 20;
    ch = { variante: v < 8 ? 0 : v < 14 ? 2 : v < 19 ? 1 : 3, espelhoX: (h >>> 3) & 1, espelhoY: (h >>> 4) & 1, props: [] };
    const n = Math.floor(r() * 3.2);
    for (let i = 0; i < n; i++) {
      let s = r() * PESO_TOTAL, tipo = "musgo";
      for (const [t, p] of PESO_PROPS) { s -= p; if (s < 0) { tipo = t; break; } }
      ch.props.push({ tipo, var_: Math.floor(r() * 3), x: 50 + r() * (LAJE - 100), y: 50 + r() * (LAJE - 100), chato: !!PROPS[tipo].chato });
    }
    ch.props.sort((a, b) => (b.chato - a.chato) || (a.y - b.y));
    if (chunks.size > 600) chunks.clear();
    chunks.set(k, ch);
    return ch;
  }

  // ==========================================================
  // SOBREVIVENTES
  // ==========================================================
  const PALETAS = {
    kai:   { jaqueta: "#d9601c", sombra: "#8a3410", calca: "#2b3340", capuz: "#3c4654", visor: "#22e5ff", cachecol: "#ffc23d", mochila: "#4b5563" },
    iris:  { jaqueta: "#e8edf2", sombra: "#9aa6b4", calca: "#2f5d46", cabelo: "#f8fafc", visor: "#b6ff3b", cachecol: "#ff6fb5", mochila: "#6b4f3a" },
    t07:   { robo: true, jaqueta: "#aab4c0", sombra: "#5f6b7a", calca: "#4b5563", capuz: "#7b8796", visor: "#ff3b3b", mochila: "#374151" },
    brasa: { jaqueta: "#8b1e1e", sombra: "#4c0d0d", calca: "#1f2229", capuz: "#16181d", visor: "#ff9a3d", cachecol: "#ff4d2e", mochila: "#c2410c", tanque: true },
  };

  // Desenha o sobrevivente com a origem nos pés-ish (centro do corpo em y≈-6)
  function desenharJogador(c, t, andando, esq, id) {
    const p = PALETAS[id] || PALETAS.kai;
    c.save();
    c.lineJoin = "round"; c.lineCap = "round";
    if (esq) c.scale(-1, 1);
    const passo = andando ? Math.sin(t * 13) : 0;
    const bob = andando ? Math.abs(Math.cos(t * 13)) * 1.6 : Math.sin(t * 2.4) * 0.6;
    // cachecol
    if (p.cachecol) {
      const o = Math.sin(t * (andando ? 14 : 4)) * 2.5;
      c.beginPath(); c.moveTo(-3, -15 - bob); c.quadraticCurveTo(-12, -16 - bob + o, -19, -12 - bob - o);
      c.lineTo(-17, -9 - bob - o); c.quadraticCurveTo(-11, -11 - bob + o, -2, -11 - bob); c.closePath();
      encher(c, p.cachecol); contornar(c, 1.6);
    }
    // mochila / tanque
    c.save(); c.translate(0, -bob);
    if (p.tanque) {
      rr(c, -14, -17, 8, 17, 4); c.fillStyle = linear(c, -14, 0, -6, 0, [[0, "#7a2808"], [0.5, "#f97316"], [1, "#7a2808"]]); c.fill(); contornar(c, 1.6);
      c.beginPath(); c.moveTo(-10, -2); c.quadraticCurveTo(-8, 6, 4, 0); contornar(c, 1.6, "#1f2229");
    } else {
      rr(c, -14, -16, 9, 15, 2.5); encher(c, p.mochila); contornar(c, 1.6);
      c.beginPath(); c.moveTo(-11, -16); c.lineTo(-14, -27); contornar(c, 1.4, "#1f2229");
      if ((t % 1.2) < 0.6) brilhar(c, "#ff3b3b", 6, () => { elipse(c, -14, -27, 1.6, 1.6); encher(c, "#ff6b6b"); });
    }
    c.restore();
    // pernas
    for (const [x, ang, tom] of [[-3, passo * 0.55, 0.75], [4, -passo * 0.55, 1]]) {
      c.save(); c.translate(x, 1); c.rotate(ang);
      rr(c, -2.6, -1, 5.2, 11, 2); encher(c, p.calca); contornar(c, 1.6);
      rr(c, -3, 8, 6.5, 4, 1.5); encher(c, tom === 1 ? "#1b1e24" : "#111318"); contornar(c, 1.4);
      c.restore();
    }
    c.translate(0, -bob);
    // tronco
    c.beginPath(); c.moveTo(-8, -15); c.lineTo(8, -15); c.lineTo(9.5, 3); c.lineTo(-9.5, 3); c.closePath();
    c.fillStyle = linear(c, -9, 0, 9, 0, [[0, p.sombra], [0.6, p.jaqueta], [1, p.jaqueta]]); c.fill(); contornar(c, 2);
    if (p.robo) {
      c.beginPath(); c.moveTo(-5, -10); c.lineTo(5, -10); contornar(c, 1, "rgba(0,0,0,.4)");
      brilhar(c, p.visor, 6, () => { elipse(c, 2, -6, 2.2, 2.2); encher(c, p.visor); });
    } else {
      c.beginPath(); c.moveTo(-6, -15); c.lineTo(6, 1); c.strokeStyle = "rgba(0,0,0,.45)"; c.lineWidth = 2.2; c.stroke();
    }
    rr(c, -9.5, -1, 19, 3.5, 1); encher(c, "#1c1f25");
    brilhar(c, p.visor, 4, () => { c.fillStyle = p.visor; c.fillRect(-1.5, -0.5, 3, 2.5); });
    // braço + arma
    c.save(); c.translate(3, -10); c.rotate(0.15 + passo * 0.12);
    rr(c, -2, -2, 5, 10, 2); encher(c, p.sombra); contornar(c, 1.5);
    rr(c, 1, 6, 13, 4.5, 1.5); encher(c, "#2a3038"); contornar(c, 1.5);
    brilhar(c, p.visor, 6, () => { c.fillStyle = p.visor; c.fillRect(11, 7, 3, 2.5); });
    c.restore();
    // cabeça
    if (p.robo) {
      rr(c, -8, -30, 16, 14, 4); c.fillStyle = linear(c, 0, -30, 0, -16, [[0, "#d5dbe2"], [1, p.capuz]]); c.fill(); contornar(c, 2);
      brilhar(c, p.visor, 10, () => { rr(c, -1, -26, 9, 4, 2); encher(c, p.visor); });
      c.beginPath(); c.moveTo(-3, -30); c.lineTo(-5, -36); contornar(c, 1.4);
      brilhar(c, p.visor, 6, () => { elipse(c, -5, -36.5, 1.6, 1.6); encher(c, p.visor); });
      c.fillStyle = "rgba(0,0,0,.35)"; c.fillRect(-6, -19, 10, 1.4);
    } else {
      if (p.cabelo) {
        c.beginPath(); c.arc(0, -22, 8.5, 0, TAU); c.fillStyle = "#e6b89c"; c.fill(); contornar(c, 2);
        c.beginPath(); c.moveTo(-9, -21); c.quadraticCurveTo(-10, -33, 0, -32); c.quadraticCurveTo(8, -33, 9, -25);
        c.lineTo(4, -27); c.lineTo(-1, -24); c.lineTo(-5, -26); c.lineTo(-8, -15); c.closePath();
        encher(c, p.cabelo); contornar(c, 1.8);
        brilhar(c, p.visor, 8, () => { rr(c, 0, -25, 9, 4.5, 2); encher(c, p.visor); });
        rr(c, 0, -25, 9, 4.5, 2); contornar(c, 1.2);
      } else {
        c.beginPath(); c.arc(0, -22, 9, 0, TAU); c.fillStyle = linear(c, 0, -31, 0, -13, [[0, p.capuz], [1, "#14171c"]]); c.fill(); contornar(c, 2);
        c.beginPath(); c.moveTo(0, -27); c.lineTo(9, -27); c.lineTo(9.5, -17); c.lineTo(1, -16); c.closePath(); encher(c, "#2b3138"); contornar(c, 1.5);
        brilhar(c, p.visor, 10, () => { rr(c, 1.5, -26, 8, 4, 2); encher(c, p.visor); });
        elipse(c, 6, -18, 2.8, 2.6); encher(c, "#4b5563"); contornar(c, 1.2);
      }
    }
    c.restore();
  }

  function retrato(id, tam = 128) {
    const k = "retrato|" + id + "|" + tam;
    if (cache.has(k)) return cache.get(k);
    const cv = tela(tam, tam);
    const c = cv.getContext("2d");
    c.translate(tam / 2, tam * 0.66);
    c.scale(tam / 44, tam / 44);
    desenharJogador(c, 0.3, false, false, id);
    const url = cv.toDataURL();
    cache.set(k, url);
    return url;
  }

  function retratoSprite(tipo, tam = 96) {
    const k = "rs|" + tipo + "|" + tam;
    if (cache.has(k)) return cache.get(k);
    const cv = tela(tam, tam);
    const c = cv.getContext("2d");
    c.drawImage(sprite(tipo, 0), 0, 0, tam, tam);
    const url = cv.toDataURL();
    cache.set(k, url);
    return url;
  }

  // ==========================================================
  // ÍCONES (armas, passivos e interface) — caixa de 64x64
  // ==========================================================
  const ICONES = {
    blaster(c, evo) {
      const cor = evo ? "#7df9ff" : "#22e5ff";
      c.translate(32, 33); c.rotate(-0.3);
      rr(c, -20, -8, 30, 13, 4); c.fillStyle = linear(c, 0, -8, 0, 5, [[0, "#64748b"], [1, "#1e293b"]]); c.fill(); contornar(c, 2.5);
      rr(c, 8, -5, evo ? 18 : 13, 7, 2); encher(c, "#334155"); contornar(c, 2.5);
      rr(c, -14, 3, 9, 15, 3); encher(c, "#1e293b"); contornar(c, 2.5);
      brilhar(c, cor, 10, () => { rr(c, -15, -4, 18, 4, 2); encher(c, cor); });
      brilhar(c, cor, 14, () => { elipse(c, evo ? 28 : 23, -1.5, evo ? 5 : 3.5, evo ? 5 : 3.5); encher(c, "#ffffff"); });
    },
    chamas(c, evo) {
      const [a, b, d] = evo ? ["#1d4ed8", "#5cc8ff", "#e0f7ff"] : ["#c2410c", "#ff8a1f", "#fff3a0"];
      c.translate(32, 36);
      const chama = (s) => { c.beginPath(); c.moveTo(0, 20 * s); c.bezierCurveTo(-18 * s, 14 * s, -16 * s, -6 * s, -4 * s, -24 * s); c.bezierCurveTo(-2 * s, -10 * s, 6 * s, -12 * s, 8 * s, -18 * s); c.bezierCurveTo(20 * s, -2 * s, 16 * s, 16 * s, 0, 20 * s); c.closePath(); };
      brilhar(c, b, 12, () => { chama(1); encher(c, a); });
      chama(1); contornar(c, 2.5);
      chama(0.68); encher(c, b);
      c.save(); c.translate(0, 6); chama(0.36); encher(c, d); c.restore();
    },
    serras(c, evo) {
      c.translate(32, 32);
      c.beginPath();
      for (let i = 0; i < 24; i++) { const a = i / 24 * TAU, r = i % 2 ? 17 : 24; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
      c.closePath();
      c.fillStyle = evo ? radial(c, -5, -5, 26, [[0, "#fffbe0"], [0.5, "#fcd34d"], [1, "#b45309"]]) : radial(c, -5, -5, 26, [[0, "#ffffff"], [0.5, "#cbd5e1"], [1, "#475569"]]);
      c.fill(); contornar(c, 2.5);
      elipse(c, 0, 0, 7, 7); encher(c, "#0f172a"); contornar(c, 2);
      brilhar(c, evo ? "#fff36b" : "#22e5ff", 8, () => { elipse(c, 0, 0, 12, 12); c.strokeStyle = evo ? "#fff7b0" : "#67e8f9"; c.lineWidth = 2; c.stroke(); });
    },
    pulso(c, evo) {
      const cor = evo ? "#b18cff" : "#60f0ff";
      c.translate(32, 32);
      for (const [r, a] of [[24, 0.35], [17, 0.6], [10, 0.9]]) {
        brilhar(c, cor, 8, () => { elipse(c, 0, 0, r, r); c.strokeStyle = cor; c.globalAlpha = a; c.lineWidth = 4; c.stroke(); });
      }
      c.globalAlpha = 1;
      brilhar(c, cor, 10, () => { elipse(c, 0, 0, 5, 5); encher(c, "#ffffff"); });
    },
    misseis(c, evo) {
      c.translate(32, 32);
      const um = (x, y, s) => {
        c.save(); c.translate(x, y); c.rotate(-0.8); c.scale(s, s);
        brilhar(c, "#ffb020", 12, () => { c.beginPath(); c.moveTo(-18, 0); c.lineTo(-30, -5); c.lineTo(-27, 0); c.lineTo(-30, 5); c.closePath(); encher(c, "#ffcf6a"); });
        c.beginPath(); c.moveTo(-12, -4); c.lineTo(-19, -10); c.lineTo(-15, 0); c.lineTo(-19, 10); c.lineTo(-12, 4); c.closePath(); encher(c, evo ? "#ff6b3d" : "#ef4444"); contornar(c, 2);
        rr(c, -16, -5, 26, 10, 4); c.fillStyle = linear(c, 0, -5, 0, 5, [[0, "#f8fafc"], [1, "#94a3b8"]]); c.fill(); contornar(c, 2.2);
        c.beginPath(); c.moveTo(10, -5); c.quadraticCurveTo(20, 0, 10, 5); c.closePath(); encher(c, evo ? "#ff6b3d" : "#ffb020"); contornar(c, 2);
        c.restore();
      };
      if (evo) { um(-8, 6, 0.75); um(10, -8, 0.75); um(10, 12, 0.6); } else um(0, 0, 1);
    },
    tesla(c, evo) {
      c.translate(32, 32);
      const raio = () => { c.beginPath(); c.moveTo(4, -26); c.lineTo(-12, 2); c.lineTo(-1, 2); c.lineTo(-6, 26); c.lineTo(13, -6); c.lineTo(2, -6); c.closePath(); };
      brilhar(c, evo ? "#f0e1ff" : "#c4a1ff", 14, () => { raio(); encher(c, evo ? "#fff7b0" : "#d8c4ff"); });
      raio(); contornar(c, 2.5);
      c.save(); c.scale(0.55, 0.55); raio(); encher(c, "#ffffff"); c.restore();
    },
    herbicida(c, evo) {
      const cor = evo ? "#5dffb0" : "#9dff3a";
      c.translate(32, 32);
      rr(c, -11, -18, 22, 36, 6); c.fillStyle = linear(c, -11, 0, 11, 0, [[0, "#334155"], [0.5, "#94a3b8"], [1, "#334155"]]); c.fill(); contornar(c, 2.5);
      rr(c, -6, -24, 12, 7, 2); encher(c, "#475569"); contornar(c, 2);
      brilhar(c, cor, 10, () => { rr(c, -8, -4, 16, 18, 4); encher(c, cor); });
      c.beginPath(); c.moveTo(0, -1); c.quadraticCurveTo(6, 6, 0, 11); c.quadraticCurveTo(-6, 6, 0, -1); encher(c, "#14532d");
      if (evo) for (const [x, y] of [[-17, -10], [18, -2], [-16, 12]]) brilhar(c, cor, 6, () => { elipse(c, x, y, 2.5, 2.5); encher(c, cor); });
    },
    drone(c, evo) {
      c.translate(32, 32);
      const um = (x, y, s) => {
        c.save(); c.translate(x, y); c.scale(s, s);
        for (const [ax, ay] of [[-14, -11], [14, -11], [-14, 11], [14, 11]]) {
          c.beginPath(); c.moveTo(0, 0); c.lineTo(ax, ay); c.strokeStyle = TINTA; c.lineWidth = 6; c.stroke(); c.strokeStyle = "#64748b"; c.lineWidth = 3; c.stroke();
          elipse(c, ax, ay, 9, 3.5); encher(c, "rgba(200,220,240,.6)"); contornar(c, 1.5);
        }
        rr(c, -9, -7, 18, 14, 4); c.fillStyle = linear(c, 0, -7, 0, 7, [[0, "#94a3b8"], [1, "#1e293b"]]); c.fill(); contornar(c, 2.2);
        brilhar(c, evo ? "#ff7a9c" : "#ff4d6d", 10, () => { elipse(c, 3, 0, 3.5, 3.5); encher(c, evo ? "#ffc2d1" : "#ff4d6d"); });
        c.restore();
      };
      if (evo) { um(-10, -10, 0.6); um(12, -6, 0.6); um(0, 12, 0.7); } else um(0, 0, 1);
    },
    potencia(c) {
      c.translate(32, 32);
      c.beginPath(); for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + Math.PI / 6; c.lineTo(Math.cos(a) * 24, Math.sin(a) * 24); } c.closePath();
      c.fillStyle = linear(c, 0, -24, 0, 24, [[0, "#ffb86b"], [1, "#9a3412"]]); c.fill(); contornar(c, 2.5);
      c.beginPath(); c.moveTo(0, -14); c.lineTo(12, 2); c.lineTo(5, 2); c.lineTo(5, 14); c.lineTo(-5, 14); c.lineTo(-5, 2); c.lineTo(-12, 2); c.closePath();
      brilhar(c, "#fff3a0", 8, () => encher(c, "#fff7d6")); contornar(c, 2);
    },
    refrigeracao(c) {
      c.translate(32, 32);
      brilhar(c, "#7dd3fc", 8, () => {
        for (let i = 0; i < 6; i++) {
          c.save(); c.rotate(i / 6 * TAU);
          c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -24); c.moveTo(0, -14); c.lineTo(-7, -20); c.moveTo(0, -14); c.lineTo(7, -20);
          c.strokeStyle = TINTA; c.lineWidth = 7; c.stroke(); c.strokeStyle = "#bae6fd"; c.lineWidth = 3.5; c.stroke();
          c.restore();
        }
      });
      elipse(c, 0, 0, 5, 5); encher(c, "#e0f2fe"); contornar(c, 2);
    },
    amplificador(c) {
      c.translate(32, 32);
      elipse(c, 0, 0, 10, 10); c.fillStyle = radial(c, 0, 0, 10, [[0, "#ffffff"], [1, "#a855f7"]]); c.fill(); contornar(c, 2.5);
      for (let i = 0; i < 4; i++) {
        c.save(); c.rotate(i * Math.PI / 2 + Math.PI / 4);
        c.beginPath(); c.moveTo(0, -14); c.lineTo(0, -25); c.moveTo(-6, -20); c.lineTo(0, -26); c.lineTo(6, -20);
        c.strokeStyle = TINTA; c.lineWidth = 7; c.stroke(); c.strokeStyle = "#d8b4fe"; c.lineWidth = 3.5; c.stroke();
        c.restore();
      }
    },
    bateria(c) {
      c.translate(32, 32);
      rr(c, -13, -20, 26, 42, 5); encher(c, "#1e293b"); contornar(c, 2.5);
      rr(c, -6, -26, 12, 7, 2); encher(c, "#64748b"); contornar(c, 2);
      for (let i = 0; i < 4; i++) brilhar(c, "#4ade80", 6, () => { rr(c, -8, 12 - i * 9, 16, 6, 1.5); encher(c, i < 3 ? "#4ade80" : "#bbf7d0"); });
    },
    blindagem(c) {
      c.translate(32, 32);
      const esc = () => { c.beginPath(); c.moveTo(0, -24); c.lineTo(20, -16); c.quadraticCurveTo(20, 10, 0, 25); c.quadraticCurveTo(-20, 10, -20, -16); c.closePath(); };
      esc(); c.fillStyle = linear(c, -20, -24, 20, 25, [[0, "#cbd5e1"], [0.5, "#64748b"], [1, "#1e293b"]]); c.fill(); contornar(c, 2.5);
      c.save(); c.scale(0.6, 0.6); esc(); c.restore(); contornar(c, 2, "rgba(255,255,255,.35)");
      for (const [x, y] of [[-12, -13], [12, -13], [0, 15]]) { elipse(c, x, y, 2, 2); encher(c, "#0f172a"); }
    },
    propulsor(c) {
      c.translate(30, 30);
      brilhar(c, "#ff8a1f", 12, () => { c.beginPath(); c.moveTo(-14, 16); c.quadraticCurveTo(-24, 22, -26, 30); c.quadraticCurveTo(-16, 26, -6, 24); c.closePath(); encher(c, "#ffb020"); });
      c.beginPath(); c.moveTo(-10, -20); c.lineTo(4, -20); c.lineTo(4, 4); c.lineTo(20, 10); c.lineTo(20, 20); c.lineTo(-12, 20); c.closePath();
      c.fillStyle = linear(c, 0, -20, 0, 20, [[0, "#475569"], [1, "#0f172a"]]); c.fill(); contornar(c, 2.5);
      brilhar(c, "#22e5ff", 6, () => { c.fillStyle = "#22e5ff"; c.fillRect(-10, 13, 30, 3); });
    },
    nanobots(c) {
      c.translate(32, 32);
      brilhar(c, "#4ade80", 10, () => { c.fillStyle = "#22c55e"; c.fillRect(-6, -20, 12, 40); c.fillRect(-20, -6, 40, 12); });
      c.strokeStyle = TINTA; c.lineWidth = 2.5; c.strokeRect(-6, -20, 12, 40); c.strokeRect(-20, -6, 40, 12);
      c.fillStyle = "#22c55e"; c.fillRect(-4.8, -4.8, 9.6, 9.6);
      for (const [x, y] of [[-17, -17], [17, -15], [16, 18], [-18, 16]]) {
        c.beginPath(); for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; c.lineTo(x + Math.cos(a) * 4, y + Math.sin(a) * 4); } c.closePath();
        encher(c, "#bbf7d0"); contornar(c, 1.5);
      }
    },
    ima(c) {
      c.translate(32, 34); c.scale(1.9, 1.9); c.lineCap = "butt";
      c.beginPath(); c.arc(0, -1, 8, Math.PI, 0); c.lineTo(8, 9); c.moveTo(-8, 9); c.lineTo(-8, -1);
      c.strokeStyle = TINTA; c.lineWidth = 8.5; c.stroke();
      c.beginPath(); c.arc(0, -1, 8, Math.PI, 0); c.moveTo(-8, -1); c.lineTo(-8, 5); c.moveTo(8, -1); c.lineTo(8, 5);
      c.strokeStyle = "#ef4444"; c.lineWidth = 5; c.stroke();
      c.beginPath(); c.moveTo(-8, 5); c.lineTo(-8, 9); c.moveTo(8, 5); c.lineTo(8, 9); c.strokeStyle = "#e2e8f0"; c.stroke();
    },
    multiplicador(c) {
      c.translate(32, 32);
      for (const [x, y, cor] of [[-7, -5, "#a78bfa"], [7, 5, "#22e5ff"]]) {
        c.save(); c.translate(x, y); c.rotate(Math.PI / 4);
        brilhar(c, cor, 8, () => { rr(c, -12, -12, 24, 24, 4); c.globalAlpha = 0.9; encher(c, cor); });
        c.globalAlpha = 1; rr(c, -12, -12, 24, 24, 4); contornar(c, 2.5);
        c.restore();
      }
    },
    aprendizado(c) {
      c.translate(32, 32);
      for (let i = -2; i <= 2; i++) {
        c.strokeStyle = "#94a3b8"; c.lineWidth = 2.5;
        c.beginPath(); c.moveTo(i * 7, -24); c.lineTo(i * 7, 24); c.moveTo(-24, i * 7); c.lineTo(24, i * 7); c.stroke();
      }
      rr(c, -16, -16, 32, 32, 4); c.fillStyle = linear(c, 0, -16, 0, 16, [[0, "#334155"], [1, "#0f172a"]]); c.fill(); contornar(c, 2.5);
      c.font = "bold 15px sans-serif"; c.textAlign = "center"; c.textBaseline = "middle";
      brilhar(c, "#22e5ff", 8, () => { c.fillStyle = "#67e8f9"; c.fillText("XP", 0, 1); });
    },
    vitalidade(c) {
      c.translate(32, 33);
      const cor = () => { c.beginPath(); c.moveTo(0, 20); c.bezierCurveTo(-28, 2, -22, -24, 0, -12); c.bezierCurveTo(22, -24, 28, 2, 0, 20); c.closePath(); };
      brilhar(c, "#ff4d6d", 10, () => { cor(); c.fillStyle = radial(c, -6, -8, 26, [[0, "#ffb3c1"], [0.5, "#ff4d6d"], [1, "#9f1239"]]); c.fill(); });
      cor(); contornar(c, 2.5);
      c.beginPath(); c.moveTo(-16, 0); c.lineTo(-7, 0); c.lineTo(-3, -8); c.lineTo(2, 8); c.lineTo(6, 0); c.lineTo(16, 0);
      c.strokeStyle = "#fff"; c.lineWidth = 2.5; c.stroke();
    },
    sucata(c) { c.translate(32, 32); engrenagem(c, 0, 0, 22, "#fbbf24", "#92400e"); },
    caveira(c) {
      c.translate(32, 32);
      c.beginPath(); c.arc(0, -4, 17, Math.PI * 0.85, Math.PI * 2.15); c.lineTo(9, 18); c.lineTo(-9, 18); c.closePath();
      encher(c, "#e2e8f0"); contornar(c, 2.5);
      elipse(c, -7, -3, 5, 6); encher(c, "#0f172a"); elipse(c, 7, -3, 5, 6); encher(c, "#0f172a");
      c.beginPath(); c.moveTo(0, 4); c.lineTo(-3, 9); c.lineTo(3, 9); c.closePath(); encher(c, "#0f172a");
      folha(c, 10, -16, 0.5, 14, 6, "#86e566", "#2c7a29");
    },
    reroll(c) {
      c.translate(32, 32);
      for (const s of [1, -1]) {
        c.save(); c.rotate(s === 1 ? 0 : Math.PI);
        c.beginPath(); c.arc(0, 0, 18, Math.PI * 1.1, Math.PI * 1.85);
        c.strokeStyle = TINTA; c.lineWidth = 9; c.stroke(); c.strokeStyle = "#22e5ff"; c.lineWidth = 5; c.stroke();
        const a = Math.PI * 1.85; const x = Math.cos(a) * 18, y = Math.sin(a) * 18;
        c.beginPath(); c.moveTo(x + 7, y - 2); c.lineTo(x - 1, y + 8); c.lineTo(x - 6, y - 5); c.closePath(); encher(c, "#22e5ff"); contornar(c, 2);
        c.restore();
      }
    },
    revive(c) {
      ICONES.vitalidade(c);
      c.setTransform(1.5, 0, 0, 1.5, 0, 0);
      c.translate(46, 46); c.scale(0.75, 0.75);
      elipse(c, 0, 0, 13, 13); encher(c, "#0f172a"); contornar(c, 2.5);
      brilhar(c, "#facc15", 8, () => { c.beginPath(); c.moveTo(2, -10); c.lineTo(-6, 2); c.lineTo(0, 2); c.lineTo(-2, 10); c.lineTo(6, -2); c.lineTo(0, -2); c.closePath(); encher(c, "#facc15"); });
    },
    relogio(c) {
      c.translate(32, 32);
      elipse(c, 0, 0, 22, 22); encher(c, "#0f172a"); contornar(c, 3);
      brilhar(c, "#22e5ff", 8, () => { elipse(c, 0, 0, 19, 19); c.strokeStyle = "#22e5ff"; c.lineWidth = 2.5; c.stroke(); });
      c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -13); c.moveTo(0, 0); c.lineTo(9, 5); c.strokeStyle = "#e2e8f0"; c.lineWidth = 3; c.stroke();
    },
  };
  function icone(id, evo = false) {
    const k = "ico|" + id + "|" + (evo ? 1 : 0);
    if (cache.has(k)) return cache.get(k);
    const cv = tela(96, 96);
    const c = cv.getContext("2d");
    c.scale(1.5, 1.5); c.lineJoin = "round"; c.lineCap = "round";
    (ICONES[id] || ICONES.caveira)(c, evo);
    const url = cv.toDataURL();
    cache.set(k, url);
    return url;
  }

  return { E, LAJE, sprite, caixa, brilho, poca, laje, prop, chunk, PROPS, desenharJogador, retrato, retratoSprite, icone, PALETAS };
})();
