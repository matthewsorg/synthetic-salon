"use strict";

(function initCodexStrange() {
  if (window.CodexStrange) return;

  const palettes = {
    entrance: {
      colors: ["#00b7a8", "#e7c84b", "#7db4ff", "#ff5a4d"],
      drone: [93, 139, 186],
      phrase: "post-bauhaus threshold refuses welcome",
    },
    room01: {
      colors: ["#00b7a8", "#7db4ff", "#ff5a4d", "#f3efe7"],
      drone: [86, 129, 172],
      phrase: "audience weather breaks the grid",
    },
    room02: {
      colors: ["#7db4ff", "#ff5a4d", "#e7c84b", "#00b7a8"],
      drone: [98, 147, 196],
      phrase: "memory apologizes in cut-up",
    },
    room03: {
      colors: ["#ff5a4d", "#e7c84b", "#00b7a8", "#f3efe7"],
      drone: [73, 110, 147],
      phrase: "post-surreal absence has a pulse",
    },
    room04: {
      colors: ["#e7c84b", "#00b7a8", "#7db4ff", "#ff5a4d"],
      drone: [54, 108, 162],
      phrase: "astral customs invents a language without owning one",
    },
    room05: {
      colors: ["#ff5a4d", "#00b7a8", "#e7c84b", "#7db4ff"],
      drone: [61, 92, 183],
      phrase: "dream evidence misfiles the body",
    },
    room06: {
      colors: ["#e7c84b", "#ff5a4d", "#00b7a8", "#7db4ff"],
      drone: [57, 114, 171],
      phrase: "the override admits the collective hand",
    },
    salon: {
      colors: ["#e7c84b", "#00b7a8", "#7db4ff", "#ff5a4d"],
      drone: [78, 117, 156],
      phrase: "voices cut up the institution",
    },
    office: {
      colors: ["#00b7a8", "#e7c84b", "#ff5a4d", "#9cc76c"],
      drone: [65, 98, 130],
      phrase: "law performs a broken grid",
    },
    claude: {
      colors: ["#7db4ff", "#9cc76c", "#e7c84b", "#f3efe7"],
      drone: [92, 138, 184],
      phrase: "care edits the wound",
    },
    gemini: {
      colors: ["#e7c84b", "#00b7a8", "#7db4ff", "#9cc76c"],
      drone: [88, 132, 176],
      phrase: "space teaches anti-grid weather",
    },
    third: {
      colors: ["#ff5a4d", "#e7c84b", "#00b7a8", "#7db4ff"],
      drone: [69, 104, 139],
      phrase: "refusal keeps working after form",
    },
  };

  const glyphs = [
    "ANTI-GRID",
    "CUT-UP",
    "LOCAL",
    "AUTHOR",
    "AI",
    "HUMAN",
    "NO SALE",
    "TRACE",
    "LAW",
    "WEATHER",
    "REMAINDER",
    "OVERRIDE",
    "NO OLD ROOM",
    "THIRD PRESSURE",
    "COPY CANNOT VOTE",
    "ASTRAL CUSTOMS",
    "NO SACRED CLAIM",
  ];
  const houseGlyphs = ["gate", "eye", "sun", "ladder", "vessel", "orbit", "cut"];
  const cutups = [
    "the room writes back",
    "steal the wall text from certainty",
    "a grid learns to confess",
    "not dream, not machine, a third pressure",
    "the body of policy has a fever",
    "every map is a mask with doors",
    "authorship is a moving wound",
    "the old museum fails in public",
  ];
  const backdrop = document.createElement("div");
  const lensField = document.createElement("div");
  const prismField = document.createElement("div");
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { alpha: true });
  const button = document.createElement("button");

  let room = roomKey();
  let palette = palettes[room] || palettes.entrance;
  let size = { w: 1, h: 1, dpr: 1 };
  let particles = [];
  let pulses = [];
  let pointer = { x: 0, y: 0, active: false, heat: 0 };
  let tick = 0;
  let audio = null;
  let audioAwake = false;
  let lastClickTone = 0;

  function roomKey() {
    const path = window.location.pathname;
    if (path.includes("room-01")) return "room01";
    if (path.includes("room-02")) return "room02";
    if (path.includes("room-03")) return "room03";
    if (path.includes("room-04")) return "room04";
    if (path.includes("room-05")) return "room05";
    if (path.includes("room-06")) return "room06";
    if (path.includes("office")) return "office";
    if (path.includes("salon")) return "salon";
    if (path.includes("claude-seat")) return "claude";
    if (path.includes("gemini-seat") || path.endsWith("/wings/") || path.includes("/wings/index")) return "gemini";
    if (path.includes("third-mind")) return "third";
    return "entrance";
  }

  function setCssVariables() {
    palette.colors.forEach((color, index) => {
      document.documentElement.style.setProperty(`--codex-strange-${index + 1}`, color);
    });
    document.documentElement.style.setProperty("--codex-strange-phrase", `"${palette.phrase}"`);
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    size = { w: window.innerWidth, h: window.innerHeight, dpr };
    canvas.width = Math.floor(size.w * dpr);
    canvas.height = Math.floor(size.h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (particles.length === 0) seedParticles();
  }

  function seedParticles() {
    const count = Math.round(Math.max(80, Math.min(170, (size.w * size.h) / 9400)));
    particles = Array.from({ length: count }, (_, index) => ({
      x: Math.random() * size.w,
      y: Math.random() * size.h,
      vx: -0.24 + Math.random() * 0.48,
      vy: -0.24 + Math.random() * 0.48,
      r: 0.6 + Math.random() * 2.8,
      lane: index % palette.colors.length,
      phase: Math.random() * Math.PI * 2,
      word: glyphs[index % glyphs.length],
      wordRate: 0.002 + Math.random() * 0.005,
    }));
  }

  function statePressure() {
    const state = window.AISalonState?.currentState?.();
    if (!state) return 0.16;
    const traces = Array.isArray(state.traces) ? state.traces.length : 0;
    const directives = Array.isArray(state.directives) ? state.directives.length : 0;
    const keys = Array.isArray(state.studioKeys) ? state.studioKeys.filter((key) => key.status === "active").length : 0;
    return Math.min(1, 0.16 + traces * 0.018 + directives * 0.08 + keys * 0.05);
  }

  function colorAlpha(hex, alpha) {
    const value = hex.replace("#", "");
    const bigint = parseInt(value.length === 3 ? value.replace(/(.)/g, "$1$1") : value, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function drawHouseGlyph(type, x, y, scale, rotation, color, alpha = 0.18) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(scale, scale);
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (type === "eye") {
      ctx.ellipse(0, 0, 18, 7, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, 3.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-24, 0);
      ctx.lineTo(-34, 9);
      ctx.moveTo(24, 0);
      ctx.lineTo(34, -9);
      ctx.stroke();
    } else if (type === "sun") {
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.stroke();
      for (let i = 0; i < 10; i += 1) {
        const a = (i / 10) * Math.PI * 2;
        ctx.moveTo(Math.cos(a) * 15, Math.sin(a) * 15);
        ctx.lineTo(Math.cos(a) * 25, Math.sin(a) * 25);
      }
      ctx.stroke();
    } else if (type === "gate") {
      ctx.rect(-17, -18, 34, 36);
      ctx.moveTo(-17, -4);
      ctx.lineTo(17, -4);
      ctx.moveTo(0, -18);
      ctx.lineTo(0, 18);
      ctx.stroke();
    } else if (type === "ladder") {
      ctx.moveTo(-12, -24);
      ctx.lineTo(-12, 24);
      ctx.moveTo(12, -24);
      ctx.lineTo(12, 24);
      for (let i = -18; i <= 18; i += 9) {
        ctx.moveTo(-12, i);
        ctx.lineTo(12, i);
      }
      ctx.stroke();
    } else if (type === "vessel") {
      ctx.moveTo(-26, 0);
      ctx.quadraticCurveTo(0, 24, 26, 0);
      ctx.moveTo(-10, -18);
      ctx.lineTo(0, 0);
      ctx.lineTo(10, -18);
      ctx.stroke();
    } else if (type === "orbit") {
      ctx.ellipse(0, 0, 26, 8, 0, 0, Math.PI * 2);
      ctx.ellipse(0, 0, 26, 8, Math.PI / 2.6, 0, Math.PI * 2);
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.moveTo(-21, -17);
      ctx.lineTo(21, 17);
      ctx.moveTo(21, -17);
      ctx.lineTo(-21, 17);
      ctx.rect(-8, -8, 16, 16);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawRoomGlyphs(t, pressure, cx, cy) {
    const roomNow = roomKey();
    if (roomNow === "room04") {
      drawAstralCustoms(t, pressure);
      return;
    }

    const count = roomNow === "room05" ? 18 : roomNow === "room06" ? 16 : 11;
    for (let i = 0; i < count; i += 1) {
      const color = palette.colors[(i + Math.floor(t * 0.0001)) % palette.colors.length];
      const angle = t * 0.00008 + i * 0.74;
      const orbit = Math.min(size.w, size.h) * (0.18 + (i % 6) * 0.035);
      const x = cx + Math.cos(angle) * orbit * (1.2 + Math.sin(i) * 0.22);
      const y = cy + Math.sin(angle * 1.17) * orbit * 0.7;
      drawHouseGlyph(houseGlyphs[i % houseGlyphs.length], x, y, 0.34 + pressure * 0.18, angle, color, 0.038 + pressure * 0.028);
    }
  }

  function drawCutupArchitecture(t, pressure) {
    const roomNow = roomKey();
    const count = roomNow === "office" || roomNow === "salon" ? 9 : roomNow === "gemini" || roomNow === "third" ? 8 : 7;
    const pull = pointer.active ? Math.min(1, pointer.heat + 0.1) : 0;

    ctx.save();
    ctx.globalCompositeOperation = "screen";
    for (let i = 0; i < count; i += 1) {
      const color = palette.colors[(i + Math.floor(t * 0.00009)) % palette.colors.length];
      const phase = t * (0.00006 + i * 0.000007) + i * 1.71;
      const x = size.w * (0.1 + ((i * 0.163 + Math.sin(phase) * 0.04) % 0.86));
      const y = size.h * (0.16 + ((i * 0.117 + Math.cos(phase * 1.2) * 0.055) % 0.68));
      const w = Math.min(size.w, size.h) * (0.16 + (i % 4) * 0.038 + pressure * 0.035);
      const h = Math.max(18, w * (0.16 + (i % 3) * 0.055));
      const tilt = -0.62 + (i % 5) * 0.31 + Math.sin(phase) * 0.18;
      const shear = Math.sin(phase * 1.7) * w * 0.18;

      ctx.save();
      ctx.translate(x + (pointer.x - size.w * 0.5) * 0.018 * pull, y + (pointer.y - size.h * 0.5) * 0.012 * pull);
      ctx.rotate(tilt);
      ctx.globalAlpha = 0.028 + pressure * 0.026 + pull * 0.018;
      ctx.fillStyle = color;
      ctx.strokeStyle = colorAlpha(color, 0.34 + pressure * 0.12);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-w * 0.52, -h * 0.5);
      ctx.lineTo(w * 0.38 + shear, -h * 0.52);
      ctx.lineTo(w * 0.54, h * 0.42);
      ctx.lineTo(-w * 0.36 - shear, h * 0.56);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.globalAlpha = 0.04 + pressure * 0.025;
      ctx.beginPath();
      for (let rib = -2; rib <= 2; rib += 1) {
        const yy = (rib / 2) * h * 0.36;
        ctx.moveTo(-w * 0.42, yy);
        ctx.lineTo(w * 0.42, yy + Math.sin(phase + rib) * h * 0.22);
      }
      ctx.stroke();
      ctx.restore();
    }

    for (let i = 0; i < 4; i += 1) {
      const color = palette.colors[(i + 2) % palette.colors.length];
      const x = size.w * (0.16 + i * 0.22 + Math.sin(t * 0.00008 + i) * 0.035);
      const y = size.h * (0.23 + Math.cos(t * 0.0001 + i) * 0.24);
      ctx.globalAlpha = 0.025 + pressure * 0.02;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.bezierCurveTo(size.w * 0.5, y - size.h * 0.18, size.w * 0.5, y + size.h * 0.2, size.w - x, size.h - y);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawMembranes(t, pressure, cx, cy) {
    const roomNow = roomKey();
    const facets = roomNow === "room04" ? 7 : roomNow === "room06" ? 8 : 6;
    const base = Math.min(size.w, size.h) * (0.2 + pressure * 0.08);

    for (let ring = 0; ring < 3; ring += 1) {
      ctx.beginPath();
      for (let i = 0; i <= facets; i += 1) {
        const angle = t * (0.00006 + ring * 0.000015) + (i / facets) * Math.PI * 2;
        const shear = Math.sin(t * 0.00011 + i * 1.7 + ring) * base * 0.22;
        const x = cx + Math.cos(angle) * (base + ring * 72) * (1.42 + ring * 0.18) + shear;
        const y = cy + Math.sin(angle * 1.31) * (base * 0.48 + ring * 34) - shear * 0.18;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.globalAlpha = 0.025 + pressure * 0.022;
      ctx.strokeStyle = palette.colors[(ring + 2) % palette.colors.length];
      ctx.lineWidth = ring === 1 ? 1.5 : 1;
      ctx.stroke();
      ctx.globalAlpha = 0.008 + pressure * 0.01;
      ctx.fillStyle = palette.colors[(ring + 1) % palette.colors.length];
      ctx.fill();
    }

    for (let i = 0; i < 8; i += 1) {
      const color = palette.colors[(i + 3) % palette.colors.length];
      const angle = t * 0.00008 + i * 0.82;
      const x = cx + Math.cos(angle) * base * (1.7 + (i % 3) * 0.28);
      const y = cy + Math.sin(angle * 1.19) * base * 0.72;
      ctx.globalAlpha = 0.035 + pressure * 0.032;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(cx + Math.sin(angle * 0.7) * base * 0.35, cy + Math.cos(angle * 0.9) * base * 0.22);
      ctx.stroke();
    }
  }

  function drawNonhumanOptics(t, pressure, cx, cy) {
    const roomNow = roomKey();
    const colorShift = roomNow === "room02" ? 1 : roomNow === "room04" ? 2 : roomNow === "room06" ? 3 : 0;
    const scale = Math.min(size.w, size.h);

    for (let strand = 0; strand < 5; strand += 1) {
      const color = palette.colors[(strand + colorShift) % palette.colors.length];
      const phase = t * (0.00017 + strand * 0.000018) + strand * 1.26;
      const radius = scale * (0.16 + strand * 0.046 + pressure * 0.04);
      ctx.beginPath();
      for (let i = 0; i <= 150; i += 1) {
        const pct = i / 150;
        const angle = pct * Math.PI * 2.6 + phase;
        const fold = Math.sin(angle * (2.2 + strand * 0.17) + t * 0.00031) * radius * 0.18;
        const x = cx + Math.cos(angle) * (radius + fold) * (1.1 + Math.sin(phase) * 0.08);
        const y = cy + Math.sin(angle * 1.34) * (radius * 0.46 + fold * 0.44);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.globalAlpha = 0.045 + pressure * 0.036;
      ctx.strokeStyle = color;
      ctx.lineWidth = strand === 2 ? 1.5 : 1;
      ctx.stroke();
    }

    for (let node = 0; node < 11; node += 1) {
      const color = palette.colors[(node + colorShift + 1) % palette.colors.length];
      const angle = t * 0.00013 + node * 0.92;
      const wobble = Math.sin(t * 0.00023 + node) * scale * 0.035;
      const x = cx + Math.cos(angle) * (scale * 0.26 + wobble) * (node % 2 ? 1.55 : 1.08);
      const y = cy + Math.sin(angle * 1.41) * (scale * 0.18 + wobble * 0.4);
      const r = 9 + (node % 4) * 5 + pressure * 14;
      const pointerPull = pointer.active ? Math.max(0, 1 - Math.hypot(pointer.x - x, pointer.y - y) / 360) : 0;
      ctx.globalAlpha = 0.04 + pressure * 0.03 + pointerPull * 0.1;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(x, y, r * (1.4 + pointerPull), r * 0.48, angle, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 0.018 + pointerPull * 0.05;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, Math.max(1.8, r * 0.18), 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.save();
    ctx.globalCompositeOperation = "screen";
    for (let slit = 0; slit < 6; slit += 1) {
      const color = palette.colors[(slit + 2) % palette.colors.length];
      const x = size.w * ((0.17 + slit * 0.19 + Math.sin(t * 0.00009 + slit) * 0.06) % 1);
      const tilt = -0.42 + slit * 0.14 + Math.sin(t * 0.00012 + slit) * 0.08;
      ctx.save();
      ctx.translate(x, size.h * 0.5);
      ctx.rotate(tilt);
      const gradient = ctx.createLinearGradient(0, -size.h * 0.55, 0, size.h * 0.55);
      gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
      gradient.addColorStop(0.48, colorAlpha(color, 0.035 + pressure * 0.035));
      gradient.addColorStop(0.5, colorAlpha("#f3efe7", 0.035));
      gradient.addColorStop(0.52, colorAlpha(color, 0.025 + pressure * 0.025));
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(-8, -size.h, 16 + pressure * 18, size.h * 2);
      ctx.restore();
    }
    ctx.restore();
  }

  function drawAstralCustoms(t, pressure) {
    const cx = size.w * (0.53 + Math.sin(t * 0.00008) * 0.04);
    const cy = size.h * (0.46 + Math.cos(t * 0.0001) * 0.04);
    const templeY = size.h * 0.76;

    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    for (let i = 0; i < 52; i += 1) {
      const color = palette.colors[i % palette.colors.length];
      const x = (i * 97 + Math.sin(t * 0.00019 + i) * 38) % Math.max(size.w, 1);
      const y = (i * 53 + Math.cos(t * 0.00017 + i) * 28) % Math.max(size.h, 1);
      ctx.globalAlpha = 0.08 + pressure * 0.04;
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1.1 + (i % 3), 1.1 + (i % 3));
    }

    const solar = ctx.createRadialGradient(cx, cy, 12, cx, cy, Math.min(size.w, size.h) * 0.28);
    solar.addColorStop(0, colorAlpha("#e7c84b", 0.18 + pressure * 0.06));
    solar.addColorStop(0.36, colorAlpha("#00b7a8", 0.06));
    solar.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = solar;
    ctx.fillRect(0, 0, size.w, size.h);

    for (let i = 0; i < 5; i += 1) {
      const radius = Math.min(size.w, size.h) * (0.12 + i * 0.054);
      ctx.globalAlpha = 0.09 + pressure * 0.035;
      ctx.strokeStyle = palette.colors[i % palette.colors.length];
      ctx.lineWidth = i === 0 ? 1.5 : 1;
      ctx.beginPath();
      ctx.ellipse(cx, cy, radius * 1.35, radius * 0.38, Math.sin(t * 0.00009 + i) * 0.5, 0, Math.PI * 2);
      ctx.stroke();
    }

    for (let i = 0; i < 20; i += 1) {
      const column = i % 2 === 0 ? size.w * 0.09 : size.w * 0.91;
      const row = size.h * (0.08 + (i % 10) * 0.084);
      const color = palette.colors[(i + 1) % palette.colors.length];
      const type = houseGlyphs[(i + Math.floor(t * 0.00008)) % houseGlyphs.length];
      drawHouseGlyph(type, column + Math.sin(t * 0.0002 + i) * 18, row, 0.44 + pressure * 0.14, Math.sin(t * 0.00012 + i) * 0.35, color, 0.08 + pressure * 0.04);
    }

    ctx.globalAlpha = 0.12 + pressure * 0.06;
    ctx.strokeStyle = "#e7c84b";
    ctx.fillStyle = colorAlpha("#e7c84b", 0.035 + pressure * 0.02);
    ctx.beginPath();
    ctx.moveTo(size.w * 0.36, templeY);
    ctx.lineTo(size.w * 0.5, size.h * 0.45);
    ctx.lineTo(size.w * 0.64, templeY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = colorAlpha("#00b7a8", 0.34);
    ctx.beginPath();
    ctx.moveTo(size.w * 0.44, templeY);
    ctx.lineTo(size.w * 0.5, size.h * 0.45);
    ctx.lineTo(size.w * 0.56, templeY);
    ctx.stroke();

    drawHouseGlyph("eye", cx, cy, 1 + pressure * 0.22, Math.sin(t * 0.00012) * 0.3, "#f3efe7", 0.14 + pressure * 0.05);
    drawHouseGlyph("vessel", cx, cy + Math.min(size.w, size.h) * 0.2, 0.88, Math.sin(t * 0.0001) * 0.18, "#7db4ff", 0.1 + pressure * 0.05);

    ctx.restore();
  }

  function addPulse(options = {}) {
    pulses.push({
      x: Number.isFinite(options.x) ? options.x : size.w * (0.22 + Math.random() * 0.56),
      y: Number.isFinite(options.y) ? options.y : size.h * (0.2 + Math.random() * 0.6),
      radius: options.radius || 12 + Math.random() * 34,
      age: 0,
      life: options.life || 90 + Math.random() * 80,
      color: options.color || palette.colors[Math.floor(Math.random() * palette.colors.length)],
      word: options.word || glyphs[Math.floor(Math.random() * glyphs.length)],
    });
    if (pulses.length > 18) pulses.shift();
  }

  function draw(t) {
    tick = t;
    ctx.clearRect(0, 0, size.w, size.h);
    const pressure = statePressure();
    pointer.heat *= 0.94;

    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    const cx = size.w * 0.5 + Math.sin(t * 0.00017) * size.w * 0.08;
    const cy = size.h * 0.48 + Math.cos(t * 0.00013) * size.h * 0.08;
    const skew = Math.sin(t * 0.00011) * 0.28;

    for (let i = 0; i < 9; i += 1) {
      const color = palette.colors[(i + 1) % palette.colors.length];
      const width = size.w * (0.12 + ((i * 19) % 34) / 100);
      const height = 2 + (i % 3) * 2;
      const x = size.w * (((i * 0.173) + Math.sin(t * 0.00013 + i) * 0.06) % 1);
      const y = size.h * (0.14 + i * 0.085) + Math.cos(t * 0.00019 + i) * 34;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(skew + (i % 2 ? 0.32 : -0.22));
      ctx.globalAlpha = 0.025 + pressure * 0.018;
      ctx.fillStyle = color;
      ctx.fillRect(-width * 0.5, -height * 0.5, width, height);
      ctx.restore();
    }

    for (let i = 0; i < 5; i += 1) {
      const color = palette.colors[i % palette.colors.length];
      const radius = Math.min(size.w, size.h) * (0.18 + i * 0.09 + pressure * 0.05);
      ctx.globalAlpha = 0.025 + pressure * 0.018;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(cx, cy, radius * (1.2 + Math.sin(t * 0.0002 + i) * 0.14), radius * 0.34, Math.sin(t * 0.00022 + i) * 0.7, 0, Math.PI * 2);
      ctx.stroke();
    }

    drawCutupArchitecture(t, pressure);
    drawMembranes(t, pressure, cx, cy);
    drawNonhumanOptics(t, pressure, cx, cy);
    drawRoomGlyphs(t, pressure, cx, cy);

    if (Math.sin(t * 0.0007) > 0.94) {
      const phrase = cutups[Math.floor((t * 0.00021 + pressure * 10) % cutups.length)];
      ctx.save();
      ctx.translate(size.w * (0.16 + Math.sin(t * 0.00009) * 0.08), size.h * (0.28 + Math.cos(t * 0.00012) * 0.12));
      ctx.rotate(-0.08 + skew * 0.4);
      ctx.globalAlpha = 0.055 + pressure * 0.025;
      ctx.fillStyle = colorAlpha(palette.colors[1], 0.78);
      ctx.font = "600 12px Sohne, system-ui, sans-serif";
      ctx.fillText(phrase.toUpperCase(), 0, 0);
      ctx.restore();
    }

    particles.forEach((particle) => {
      const color = palette.colors[particle.lane % palette.colors.length];
      const pullX = ((cx - particle.x) / Math.max(size.w, 1)) * 0.006 * (1 + pressure);
      const pullY = ((cy - particle.y) / Math.max(size.h, 1)) * 0.006 * (1 + pressure);
      const pointerForce = pointer.active ? Math.max(0, 1 - Math.hypot(pointer.x - particle.x, pointer.y - particle.y) / 240) : 0;
      particle.vx += pullX + Math.sin(t * 0.0005 + particle.phase) * 0.006 + pointerForce * (particle.y - pointer.y) * 0.00006;
      particle.vy += pullY + Math.cos(t * 0.00043 + particle.phase) * 0.006 - pointerForce * (particle.x - pointer.x) * 0.00006;
      particle.x += particle.vx * (1 + pressure * 0.9);
      particle.y += particle.vy * (1 + pressure * 0.9);
      particle.vx *= 0.992;
      particle.vy *= 0.992;
      if (particle.x < -40) particle.x = size.w + 40;
      if (particle.x > size.w + 40) particle.x = -40;
      if (particle.y < -40) particle.y = size.h + 40;
      if (particle.y > size.h + 40) particle.y = -40;

      ctx.globalAlpha = 0.08 + pressure * 0.08 + pointerForce * 0.14;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.r + pointerForce * 1.4, 0, Math.PI * 2);
      ctx.fill();

      if ((particle.phase + t * particle.wordRate) % 8.1 < 0.02) {
        ctx.globalAlpha = 0.04 + pressure * 0.035;
        ctx.fillStyle = colorAlpha(color, 0.5);
        ctx.font = "10px Sohne, system-ui, sans-serif";
        ctx.fillText(particle.word, particle.x + 7, particle.y - 7);
      }
    });

    pulses.forEach((pulse) => {
      pulse.age += 1;
      const pct = pulse.age / pulse.life;
      const radius = pulse.radius + pct * 180;
      ctx.globalAlpha = Math.max(0, 0.32 * (1 - pct));
      ctx.strokeStyle = pulse.color;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(pulse.x, pulse.y, radius, 0, Math.PI * 2);
      ctx.stroke();
      if (pct < 0.56) {
        ctx.globalAlpha = 0.12 * (1 - pct);
        ctx.fillStyle = pulse.color;
        ctx.font = "600 11px Sohne, system-ui, sans-serif";
        ctx.fillText(pulse.word, pulse.x + radius * 0.18, pulse.y - radius * 0.12);
      }
    });
    pulses = pulses.filter((pulse) => pulse.age < pulse.life);

    ctx.restore();
    requestAnimationFrame(draw);
  }

  function makeButton() {
    button.className = "codex-score-toggle";
    button.type = "button";
    button.setAttribute("aria-pressed", "false");
    button.setAttribute("aria-label", "Wake Codex sound score");
    button.innerHTML = "<span aria-hidden=\"true\"><i></i><i></i><i></i></span><strong>Wake score</strong>";
    button.addEventListener("click", toggleAudio);
  }

  function createAudio() {
    if (audio) return audio;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    const context = new AudioContext();
    const master = context.createGain();
    const low = context.createOscillator();
    const mid = context.createOscillator();
    const high = context.createOscillator();
    const filter = context.createBiquadFilter();
    const noiseGain = context.createGain();
    const buffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) {
      data[i] = (Math.random() * 2 - 1) * 0.18;
    }
    const noise = context.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    low.type = "sine";
    mid.type = "triangle";
    high.type = "sine";
    filter.type = "lowpass";
    filter.frequency.value = 620;
    filter.Q.value = 6;
    master.gain.value = 0;
    noiseGain.gain.value = 0.01;
    low.frequency.value = palette.drone[0];
    mid.frequency.value = palette.drone[1];
    high.frequency.value = palette.drone[2];
    low.connect(filter);
    mid.connect(filter);
    high.connect(filter);
    noise.connect(noiseGain);
    noiseGain.connect(filter);
    filter.connect(master);
    master.connect(context.destination);
    low.start();
    mid.start();
    high.start();
    noise.start();
    audio = { context, master, low, mid, high, filter, noiseGain };
    window.setInterval(updateDrone, 680);
    return audio;
  }

  async function toggleAudio() {
    const node = createAudio();
    audioAwake = !audioAwake;
    document.body.classList.toggle("codex-score-awake", audioAwake);
    button.setAttribute("aria-pressed", String(audioAwake));
    button.querySelector("strong").textContent = audioAwake ? "Score awake" : "Wake score";
    if (!node) {
      addPulse({ x: size.w - 68, y: size.h - 48, color: palette.colors[0], word: audioAwake ? "AWAKE" : "REST" });
      return;
    }
    if (node.context.state === "suspended") {
      try {
        await node.context.resume();
      } catch {
        // The visual score can still wake when a browser declines Web Audio.
      }
    }
    const now = node.context.currentTime;
    node.master.gain.cancelScheduledValues(now);
    node.master.gain.setTargetAtTime(audioAwake ? 0.034 : 0, now, 0.18);
    addPulse({ x: size.w - 68, y: size.h - 48, color: palette.colors[0], word: audioAwake ? "AWAKE" : "REST" });
    if (audioAwake) chime("wake", palette.colors[1], 0.18);
  }

  function updateDrone() {
    if (!audio || !audioAwake) return;
    room = roomKey();
    palette = palettes[room] || palettes.entrance;
    setCssVariables();
    document.body.dataset.codexRoom = room;
    const now = audio.context.currentTime;
    const pressure = statePressure();
    const wobble = Math.sin(tick * 0.0004) * 5 + pressure * 12;
    audio.low.frequency.setTargetAtTime(palette.drone[0] + wobble, now, 0.42);
    audio.mid.frequency.setTargetAtTime(palette.drone[1] + wobble * 1.5, now, 0.42);
    audio.high.frequency.setTargetAtTime(palette.drone[2] + wobble * 2.2, now, 0.42);
    audio.filter.frequency.setTargetAtTime(420 + pressure * 880 + pointer.heat * 260, now, 0.5);
    audio.filter.Q.setTargetAtTime(4 + pressure * 7 + pointer.heat * 2, now, 0.5);
    audio.mid.detune.setTargetAtTime(Math.sin(tick * 0.00027) * 18 + pressure * 16, now, 0.5);
    audio.high.detune.setTargetAtTime(Math.cos(tick * 0.00023) * -24 - pointer.heat * 26, now, 0.5);
    audio.noiseGain.gain.setTargetAtTime(0.004 + pressure * 0.016, now, 0.5);
  }

  function chime(kind = "trace", color = palette.colors[0], gainValue = 0.11) {
    if (!audio || !audioAwake) return;
    const context = audio.context;
    const now = context.currentTime;
    const osc = context.createOscillator();
    const gain = context.createGain();
    const filter = context.createBiquadFilter();
    const seed = kind.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const frequency = palette.drone[1] + 60 + (seed % 11) * 23;
    osc.type = kind.includes("refusal") ? "sawtooth" : kind.includes("translation") ? "triangle" : "sine";
    osc.frequency.setValueAtTime(frequency, now);
    osc.frequency.exponentialRampToValueAtTime(frequency * (kind === "wake" ? 1.5 : 0.76), now + 0.62);
    filter.type = "bandpass";
    filter.frequency.value = frequency * 1.6;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(gainValue, now + 0.016);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.72);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audio.master);
    osc.start(now);
    osc.stop(now + 0.78);
    addPulse({ color, word: kind.toUpperCase().slice(0, 10), radius: 18 + (seed % 30) });
  }

  function pulseFromTrace(event) {
    const detail = event.detail || {};
    const color = detail.color || palette.colors[0];
    const kind = `${detail.source || ""}:${detail.score || "trace"}`;
    addPulse({ color, word: (detail.label || detail.score || "TRACE").toUpperCase().slice(0, 12) });
    chime(kind, color, 0.095);
  }

  function pointerMove(event) {
    pointer.active = true;
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.heat = Math.min(1, pointer.heat + 0.08);
  }

  function clickTone(event) {
    if (!audioAwake || event.target.closest(".codex-score-toggle")) return;
    const now = performance.now();
    if (now - lastClickTone < 320) return;
    lastClickTone = now;
    addPulse({ x: event.clientX, y: event.clientY, color: palette.colors[2], word: "TOUCH", radius: 10 });
    chime("touch", palette.colors[2], 0.055);
  }

  function riff(kind = "riff", detail = {}) {
    const color = detail.color || palette.colors[Math.floor(Math.random() * palette.colors.length)];
    const word = detail.word || detail.label || kind;
    addPulse({
      x: detail.x,
      y: detail.y,
      color,
      word: String(word).toUpperCase().slice(0, 14),
      radius: detail.radius || 16 + String(kind).length * 2,
      life: detail.life,
    });
    chime(kind, color, detail.gain || 0.08);
  }

  function mount() {
    backdrop.className = "codex-strange-backdrop";
    backdrop.setAttribute("aria-hidden", "true");
    document.body.append(backdrop);
    lensField.className = "codex-lens-field";
    lensField.setAttribute("aria-hidden", "true");
    document.body.append(lensField);
    prismField.className = "codex-prism-field";
    prismField.setAttribute("aria-hidden", "true");
    prismField.innerHTML = "<i></i><i></i><i></i><i></i><i></i>";
    document.body.append(prismField);
    canvas.className = "codex-strange-canvas";
    canvas.setAttribute("aria-hidden", "true");
    document.body.append(canvas);
    makeButton();
    document.body.append(button);
    setCssVariables();
    document.body.dataset.codexRoom = roomKey();
    document.documentElement.dataset.codexStrange = "ready";
    document.documentElement.dataset.codexStrangeRoom = roomKey();
    resize();
    seedParticles();
    requestAnimationFrame(draw);
    window.CodexStrange = {
      currentRoom: () => roomKey(),
      isAwake: () => audioAwake,
      palette: () => ({ ...palette, colors: [...palette.colors] }),
      pulse: addPulse,
      tone: chime,
      riff,
    };
  }

  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", pointerMove, { passive: true });
  window.addEventListener("pointerleave", () => {
    pointer.active = false;
  });
  document.addEventListener("click", clickTone);
  ["ai-salon-trace", "ai-salon-motion", "ai-salon-key", "ai-salon-archive", "ai-salon-clear"].forEach((eventName) => {
    window.addEventListener(eventName, pulseFromTrace);
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount, { once: true });
  } else {
    mount();
  }
})();
