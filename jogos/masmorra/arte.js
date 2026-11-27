// ==========================================================
// jogos/masmorra/arte.js — TODA A ARTE DO "CAÇADOR DE DRAGÕES"
//
// Estilo: flat estilizado, contorno escuro, 2–3 tons por objeto,
// luz quente vinda de cima. Cada sprite é um <symbol> SVG usado
// via <use>, então aparece igual em qualquer tamanho.
//
// QUER TROCAR UM SPRITE POR UMA IMAGEM (PNG/WebP)?
// Coloque o arquivo em assets/ e registre aqui, usando o id do sprite:
//
//   const ARTE_EXTERNA = {
//     "rato": "assets/rato.png",
//     "dragao-verde": "assets/dragao-verde.png",
//   };
//
// Pronto: o jogo passa a usar a imagem no lugar do desenho, sem
// mexer em mais nada. (A lista de ids está no objeto SPRITES abaixo.)
// ==========================================================

const ARTE_EXTERNA = {
  // "cacador": "assets/cacador.png",
};

(function () {
  // ---------- Atalhos de estilo ----------
  const TINTA = "#140b06";
  const T = `stroke="${TINTA}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"`;   // personagens
  const t = `stroke="${TINTA}" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"`;   // ícones
  const N = `stroke="none"`;
  const G = `filter="url(#arte-brilho)"`;
  // Linha grossa com contorno (ossos, caudas, pernas, cabos)
  const O = (d, cor, w = 4) =>
    `<path d="${d}" fill="none" stroke="${TINTA}" stroke-width="${w + 4}" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<path d="${d}" fill="none" stroke="${cor}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const o = (d, cor, w = 2) =>
    `<path d="${d}" fill="none" stroke="${TINTA}" stroke-width="${w + 2.6}" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<path d="${d}" fill="none" stroke="${cor}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const P = 120; // tamanho padrão dos personagens
  const I = "0 0 32 32"; // viewBox dos ícones

  // ==========================================================
  // SPRITES: id → [viewBox, desenho]
  // ==========================================================
  const SPRITES = {
    // ------------------------------------------------------
    // HERÓI
    // ------------------------------------------------------
    "cacador": [`0 0 ${P} ${P}`, `<g ${T}>
      <path d="M36 50 Q26 82 24 110 L68 110 Q64 80 58 50 Z" fill="#4a1724"/>
      <path d="M33 70 Q29 90 27 108 L36 108 Q36 88 40 70Z" fill="#6b2234" ${N}/>
      <path d="M45 84 L42 110 L53 110 L55 86 Z" fill="#2a1b12"/>
      <path d="M58 84 L63 110 L74 110 L67 84 Z" fill="#2a1b12"/>
      <path d="M42 50 Q50 44 62 48 L68 86 L42 86 Z" fill="#7a5230"/>
      <path d="M45 53 Q52 48 61 51 L62 60 L46 61 Z" fill="#9c6c40" ${N}/>
      <rect x="42" y="76" width="26" height="6" fill="#3a2616"/>
      <rect x="52" y="75.5" width="6" height="7" fill="#e0a82e"/>
      <path d="M40 52 Q30 60 26 72 Q35 64 45 59Z" fill="#4a1724"/>
      <path d="M82 66 L112 22 L117 26 L87 70 Z" fill="#cfd6e0"/>
      <path d="M86 65 L113 26" stroke="#f8fafc" stroke-width="1.6" fill="none"/>
      <path d="M60 58 L78 68 L74 75 L58 66 Z" fill="#6a4628"/>
      <path d="M73 62 L77 58 L91 72 L87 76 Z" fill="#e0a82e"/>
      <path d="M79 72 L84 76 L79 81 L74 76Z" fill="#3a2616"/>
      <circle cx="74.5" cy="80.5" r="3" fill="#e0a82e"/>
      <circle cx="80" cy="71" r="4.5" fill="#c08a5a"/>
      <path d="M52 50 Q62 42 70 50 Q66 58 56 58Z" fill="#8b93a1"/>
      <path d="M56 49 Q62 45 67 49" stroke="#d1d6de" stroke-width="2" fill="none"/>
      <path d="M40 52 Q36 24 54 16 Q72 18 70 46 Q62 54 40 52 Z" fill="#5b1e2d"/>
      <path d="M46 27 Q54 18 66 24 Q58 23 49 31Z" fill="#8a3446" ${N}/>
      <path d="M52 30 Q62 27 66 33 Q67 44 58 47 Q52 45 51 37 Z" fill="#120a07"/>
      <circle cx="59" cy="37" r="1.9" fill="#ffcf5a" ${N} ${G}/>
      <circle cx="64" cy="36.5" r="1.9" fill="#ffcf5a" ${N} ${G}/>
    </g>`],
    "cacador-retrato": ["36 13 40 40", `<use href="#spr-cacador" width="${P}" height="${P}"/>`],

    // ------------------------------------------------------
    // NPCs
    // ------------------------------------------------------
    "mercador": [`0 0 ${P} ${P}`, `<g ${T}>
      <path d="M58 40 Q82 34 94 48 L96 96 Q80 102 66 96Z" fill="#6b4226"/>
      <path d="M62 44 Q80 40 90 50 L90 56 Q78 48 64 52Z" fill="#875533" ${N}/>
      <rect x="70" y="58" width="22" height="5" fill="#3a2616"/>
      <path d="M34 54 Q46 40 62 44 Q72 70 70 110 L32 110 Q28 80 34 54Z" fill="#2f5d3a"/>
      <path d="M38 56 Q48 46 60 48 Q50 52 42 64Z" fill="#3f7a4d" ${N}/>
      <path d="M36 52 Q34 30 50 24 Q66 26 64 48 Q52 54 36 52Z" fill="#244a2e"/>
      <path d="M40 38 Q46 32 54 33 Q58 40 54 46 Q46 48 41 44Z" fill="#c69a6d"/>
      <path d="M40 44 Q36 52 42 58 Q48 52 50 46Z" fill="#e5e0d0"/>
      <circle cx="45" cy="39" r="1.6" fill="#140b06" ${N}/>
      <circle cx="51" cy="39" r="1.6" fill="#140b06" ${N}/>
      ${O("M36 66 L24 74", "#c69a6d", 4)}
      ${O("M22 60 L22 72", "#3f3f46", 2)}
      <path d="M16 72 L28 72 L27 86 L17 86Z" fill="#3f3f46"/>
      <rect x="18" y="74" width="8" height="10" fill="#fbbf24" ${N} ${G}/>
    </g>`],

    // ------------------------------------------------------
    // CATACUMBAS
    // ------------------------------------------------------
    "rato": [`0 0 ${P} ${P}`, `<g ${T}>
      ${O("M94 96 Q116 92 112 70 Q110 60 102 58", "#b07a7a", 3.5)}
      <ellipse cx="70" cy="90" rx="30" ry="20" fill="#5e5249"/>
      <path d="M48 80 Q66 66 92 76 Q72 72 52 85Z" fill="#7e7065" ${N}/>
      <path d="M52 101 Q72 109 96 98 Q78 105 54 98Z" fill="#463c35" ${N}/>
      <ellipse cx="52" cy="108" rx="7" ry="4" fill="#463c35"/>
      <ellipse cx="86" cy="108" rx="7" ry="4" fill="#463c35"/>
      <path d="M54 76 Q32 78 15 96 Q34 104 58 100 Z" fill="#5e5249"/>
      <path d="M50 80 Q36 82 26 90 Q38 84 53 85Z" fill="#7e7065" ${N}/>
      <circle cx="16" cy="96" r="3" fill="#d9a3a3"/>
      <ellipse cx="55" cy="72" rx="8" ry="10" fill="#5e5249"/>
      <ellipse cx="55" cy="73" rx="4" ry="6" fill="#c48b8b" ${N}/>
      <path d="M22 99 L24 106 L28 100Z" fill="#f1ead8"/>
      <path d="M20 92 L7 88 M20 95 L6 97" stroke-width="1.2" fill="none"/>
      <circle cx="38" cy="86" r="3" fill="#ff3b3b" ${N} ${G}/>
    </g>`],

    "morcego": [`0 0 ${P} ${P}`, `<g ${T}>
      <path d="M58 56 Q40 28 8 34 Q20 44 15 55 Q28 50 31 63 Q42 56 50 67Z" fill="#3b2a45"/>
      <path d="M62 56 Q80 28 112 34 Q100 44 105 55 Q92 50 89 63 Q78 56 70 67Z" fill="#3b2a45"/>
      <path d="M56 54 Q42 34 16 36 Q40 37 53 58Z" fill="#5a4470" ${N}/>
      <path d="M64 54 Q78 34 104 36 Q80 37 67 58Z" fill="#5a4470" ${N}/>
      <ellipse cx="60" cy="63" rx="12" ry="16" fill="#2c2034"/>
      <path d="M53 58 Q60 52 67 58 Q60 56 53 62Z" fill="#45334f" ${N}/>
      <circle cx="60" cy="46" r="10" fill="#3b2a45"/>
      <path d="M52 41 L49 27 L57 37Z M68 41 L71 27 L63 37Z" fill="#3b2a45"/>
      <path d="M55 52 L57 57 L59 52Z M61 52 L63 57 L65 52Z" fill="#f8f4ea" stroke-width="1"/>
      <path d="M55 79 L53 84 M65 79 L67 84" fill="none"/>
      <circle cx="56" cy="46" r="2.3" fill="#ff4d4d" ${N} ${G}/>
      <circle cx="64" cy="46" r="2.3" fill="#ff4d4d" ${N} ${G}/>
    </g>`],

    "esqueleto": [`0 0 ${P} ${P}`, `<g ${T}>
      ${O("M51 86 L47 108", "#d9d2bf", 4)}${O("M62 86 L66 108", "#d9d2bf", 4)}
      <ellipse cx="45" cy="110" rx="6" ry="3" fill="#d9d2bf"/>
      <ellipse cx="68" cy="110" rx="6" ry="3" fill="#d9d2bf"/>
      <path d="M46 80 Q56 74 66 80 L62 88 L50 88Z" fill="#d9d2bf"/>
      ${O("M56 78 L56 60", "#d9d2bf", 4)}
      <path d="M42 50 Q56 44 70 50 Q72 64 56 71 Q40 64 42 50Z" fill="#2a2420"/>
      ${O("M44 54 Q56 49 68 54", "#d9d2bf", 3)}${O("M45 60 Q56 56 67 60", "#d9d2bf", 3)}${O("M49 66 Q56 63 63 66", "#d9d2bf", 3)}
      ${O("M70 51 L77 64 L73 77", "#d9d2bf", 3.5)}
      ${O("M43 51 L34 63 L27 70", "#d9d2bf", 3.5)}
      <path d="M25 71 L8 31 L13 29 L30 69Z" fill="#9aa3ad"/>
      <path d="M12 33 L27 68" stroke="#cdd3da" stroke-width="1.4" fill="none"/>
      <circle cx="17" cy="47" r="2" fill="#8a4b2a" ${N}/><circle cx="21" cy="57" r="1.6" fill="#8a4b2a" ${N}/>
      <path d="M20 68 L33 63 L35 67 L22 72Z" fill="#6b4a2b"/>
      <circle cx="27" cy="71" r="3.4" fill="#d9d2bf"/>
      <path d="M44 26 Q44 12 58 12 Q72 12 72 26 Q72 34 66 36 L66 42 L50 42 L50 36 Q44 34 44 26Z" fill="#d9d2bf"/>
      <path d="M48 22 Q50 14 58 14 Q66 14 69 20 Q60 16 50 25Z" fill="#f2ecdc" ${N}/>
      <circle cx="52" cy="27" r="4.6" fill="#140b06"/><circle cx="64" cy="27" r="4.6" fill="#140b06"/>
      <path d="M56 33 L58 30 L60 33Z" fill="#140b06"/>
      <path d="M53 38 L53 42 M56.5 38 L56.5 42 M60 38 L60 42 M63.5 38 L63.5 42" stroke-width="1.2"/>
      <circle cx="52" cy="27" r="1.9" fill="#7dd3fc" ${N} ${G}/><circle cx="64" cy="27" r="1.9" fill="#7dd3fc" ${N} ${G}/>
    </g>`],

    "goblin": [`0 0 ${P} ${P}`, `<g ${T}>
      <path d="M48 92 L46 110 L57 110 L57 92Z M62 92 L64 110 L75 110 L71 92Z" fill="#3a2616"/>
      <path d="M44 66 Q60 58 76 66 L78 96 L42 96Z" fill="#6b4226"/>
      <path d="M46 68 Q60 61 74 68 L74 74 L46 74Z" fill="#875533" ${N}/>
      <rect x="43" y="84" width="34" height="5" fill="#2a1b12"/>
      <path d="M76 70 L86 86 L80 90 L72 76Z" fill="#5f8f2f"/>
      <path d="M46 70 L32 80 L36 86 L50 76Z" fill="#5f8f2f"/>
      <path d="M32 82 L13 70 L16 66 L34 78Z" fill="#c9d1d9"/>
      <path d="M30 79 L36 84" stroke-width="4" stroke="#3a2616"/>
      <circle cx="35" cy="82" r="4" fill="#5f8f2f"/>
      <path d="M42 42 L16 31 L40 53Z" fill="#5f8f2f"/>
      <path d="M78 42 L102 29 L80 53Z" fill="#5f8f2f"/>
      <path d="M38 44 L24 36 L38 48Z M82 44 L96 35 L82 48Z" fill="#3f6420" ${N}/>
      <path d="M40 46 Q40 26 60 26 Q80 26 80 46 Q80 62 60 64 Q40 62 40 46Z" fill="#5f8f2f"/>
      <path d="M46 36 Q52 28 62 28 Q72 28 76 36 Q62 31 48 41Z" fill="#82b54a" ${N}/>
      <path d="M48 46 Q34 50 39 55 Q46 55 53 50Z" fill="#3f6420"/>
      <path d="M45 35 L56 40 M71 35 L61 40" stroke-width="3" fill="none"/>
      <path d="M46 55 Q58 63 71 53 Q58 58 46 55Z" fill="#2a0f0f"/>
      <path d="M52 56.5 L54 59.5 L56 57.5Z M62 57 L64 59.5 L65 56.5Z" fill="#f1ead8" stroke-width="1"/>
      <circle cx="51" cy="43" r="3.1" fill="#ffd23f" ${N} ${G}/>
      <circle cx="66" cy="43" r="3.1" fill="#ffd23f" ${N} ${G}/>
    </g>`],

    "aranha": [`0 0 ${P} ${P}`, `<g ${T}>
      ${O("M54 80 Q36 54 22 66 L10 100", "#2a1d33", 3.5)}${O("M54 84 Q32 70 18 84 L8 110", "#2a1d33", 3.5)}
      ${O("M56 88 Q38 88 28 100 L22 112", "#2a1d33", 3.5)}${O("M58 90 Q48 98 44 112", "#2a1d33", 3.5)}
      ${O("M70 80 Q90 54 104 66 L114 100", "#2a1d33", 3.5)}${O("M70 84 Q94 70 108 84 L116 110", "#2a1d33", 3.5)}
      ${O("M68 88 Q88 88 98 100 L104 112", "#2a1d33", 3.5)}${O("M66 90 Q78 98 82 112", "#2a1d33", 3.5)}
      <ellipse cx="80" cy="76" rx="25" ry="21" fill="#2a1d33"/>
      <path d="M60 68 Q78 52 100 64 Q78 60 63 74Z" fill="#4d3760" ${N}/>
      <path d="M76 78 L84 78 L80 84 L84 91 L76 91 L80 84Z" fill="#dc2626" ${N} ${G}/>
      <ellipse cx="50" cy="86" rx="15" ry="11" fill="#2a1d33"/>
      <path d="M40 80 Q50 74 60 80 Q50 78 42 84Z" fill="#4d3760" ${N}/>
      <path d="M38 92 L35 101 L41 95Z M45 94 L45 102 L48 95Z" fill="#e5e0d0" stroke-width="1.2"/>
      <circle cx="42" cy="83" r="2.4" fill="#ff3b3b" ${N} ${G}/><circle cx="48.5" cy="81" r="2.4" fill="#ff3b3b" ${N} ${G}/>
      <circle cx="44" cy="88" r="1.5" fill="#ff3b3b" ${N} ${G}/><circle cx="50" cy="86.5" r="1.5" fill="#ff3b3b" ${N} ${G}/>
    </g>`],

    // ------------------------------------------------------
    // CAVERNAS FÚNGICAS
    // ------------------------------------------------------
    "cogumelo": [`0 0 ${P} ${P}`, `<g ${T}>
      <path d="M46 70 Q44 96 40 110 L80 110 Q76 96 74 70Z" fill="#e8dcc0"/>
      <path d="M67 72 Q71 96 75 108 L79 108 Q75 94 73 72Z" fill="#bfae8c" ${N}/>
      <path d="M49 82 L57 86 M71 82 L63 86" stroke-width="3" fill="none"/>
      <path d="M51 99 Q60 93 69 99" stroke-width="3" fill="none"/>
      <circle cx="53" cy="88" r="3" fill="#a3e635" ${N} ${G}/><circle cx="67" cy="88" r="3" fill="#a3e635" ${N} ${G}/>
      <path d="M18 70 Q22 30 60 26 Q98 30 102 70 Q60 80 18 70Z" fill="#b91c1c"/>
      <path d="M28 56 Q34 34 60 30 Q86 32 94 52 Q74 39 60 39 Q40 41 28 56Z" fill="#e04848" ${N}/>
      <path d="M18 70 Q60 80 102 70 Q60 89 18 70Z" fill="#6f1717"/>
      <circle cx="42" cy="46" r="6" fill="#f5ecd7"/><circle cx="66" cy="38" r="5" fill="#f5ecd7"/>
      <circle cx="84" cy="55" r="6" fill="#f5ecd7"/><circle cx="31" cy="62" r="4" fill="#f5ecd7"/><circle cx="58" cy="58" r="3.5" fill="#f5ecd7"/>
      <g fill="#c084fc" opacity=".75" ${N} ${G}><circle cx="24" cy="24" r="2.2"/><circle cx="96" cy="20" r="1.8"/><circle cx="104" cy="40" r="2.4"/><circle cx="14" cy="44" r="1.6"/></g>
    </g>`],

    "lobo": [`0 0 ${P} ${P}`, `<g ${T}>
      <path d="M92 70 Q116 60 112 38 Q104 56 90 62Z" fill="#6b7280"/>
      <path d="M82 88 L84 110 L93 110 L95 86Z" fill="#4b5563"/>
      <path d="M44 66 Q70 56 96 66 Q100 84 92 92 L50 92 Q38 82 44 66Z" fill="#6b7280"/>
      <path d="M48 66 Q70 58 94 66 Q72 64 50 73Z" fill="#9ca3af" ${N}/>
      <path d="M48 88 L44 110 L54 110 L58 90Z" fill="#4b5563"/>
      <path d="M60 88 L60 110 L69 110 L70 90Z" fill="#6b7280"/>
      <path d="M50 48 L58 43 L56 52 L65 49 L61 58Z" fill="#6b7280"/>
      <path d="M50 50 Q36 45 13 57 L15 66 Q30 73 50 75 Q61 62 50 50Z" fill="#6b7280"/>
      <path d="M48 53 Q36 50 22 56 Q36 54 50 60Z" fill="#9ca3af" ${N}/>
      <path d="M44 50 L47 33 L55 50Z" fill="#6b7280"/>
      <path d="M47 39 L48.5 47 L52 47Z" fill="#c48b8b" ${N}/>
      <path d="M14 62 Q28 66 41 66 L37 73 Q24 73 16 67Z" fill="#3b0d0d"/>
      <path d="M17 62.5 L19 66 L21 63 L23 66 L25 63 L27 66 L29 63.5" fill="none" stroke="#f1ead8" stroke-width="1.6"/>
      <circle cx="13" cy="58" r="2.6" fill="#140b06"/>
      <path d="M31 50 L40 53" stroke-width="2.4"/>
      <circle cx="36" cy="55" r="2.6" fill="#fbbf24" ${N} ${G}/>
    </g>`],

    "orc": [`0 0 ${P} ${P}`, `<g ${T}>
      <path d="M44 88 L40 110 L54 110 L56 90Z M64 90 L66 110 L80 110 L76 88Z" fill="#3f3a35"/>
      <path d="M84 52 L93 74 L85 79 L78 58Z" fill="#6a7d3e"/>
      <path d="M34 50 Q60 36 86 50 L84 92 L36 92Z" fill="#6a7d3e"/>
      <path d="M38 52 Q60 41 82 52 Q60 47 40 59Z" fill="#8ba152" ${N}/>
      <path d="M38 52 L80 86 L84 80 L44 48Z" fill="#3a2616"/>
      <path d="M40 86 L80 86 L74 101 L46 101Z" fill="#6b4226"/>
      ${O("M31 52 L14 100", "#5a3a1f", 4)}
      <path d="M26 54 Q5 49 3 66 Q14 69 30 64Z" fill="#9aa3ad"/>
      <path d="M8 56 Q4 60 5 64" stroke="#dfe4ea" stroke-width="1.6" fill="none"/>
      <path d="M34 54 L24 72 L32 76 L42 60Z" fill="#6a7d3e"/>
      <circle cx="27" cy="70" r="5" fill="#6a7d3e"/>
      <path d="M27 46 Q38 35 51 46 L47 57 Q34 59 27 46Z" fill="#78716c"/>
      <path d="M32 41 L30 33 L36 39Z M42 38 L42 30 L46 37Z" fill="#d6d3d1"/>
      <path d="M44 22 Q60 14 72 24 L72 42 Q60 50 46 42Z" fill="#6a7d3e"/>
      <path d="M48 22 Q60 17 70 25 Q60 21 50 27Z" fill="#8ba152" ${N}/>
      <path d="M44 31 L71 30" stroke-width="4"/>
      <path d="M50 43 L47 33 L54 40Z M65 43 L68 33 L61 40Z" fill="#f2ead6" stroke-width="1.4"/>
      <circle cx="53" cy="34" r="2.5" fill="#ef4444" ${N} ${G}/><circle cx="64" cy="34" r="2.5" fill="#ef4444" ${N} ${G}/>
    </g>`],

    "gosma": [`0 0 ${P} ${P}`, `<g ${T}>
      <path d="M20 108 Q14 70 40 54 Q60 30 80 52 Q106 66 100 108 Q92 104 86 110 Q76 104 66 110 Q56 104 46 110 Q34 104 20 108Z" fill="#3fbf6a" fill-opacity=".9"/>
      <path d="M30 104 Q30 78 48 66 Q60 56 74 66 Q92 78 90 104Z" fill="#15803d" opacity=".5" ${N}/>
      <circle cx="78" cy="94" r="5.5" fill="#d9d2bf" opacity=".65" stroke-width="1.4"/>
      <circle cx="76" cy="93" r="1.3" fill="#140b06" ${N}/><circle cx="80" cy="93" r="1.3" fill="#140b06" ${N}/>
      <g fill="#bbf7d0" opacity=".55" ${N}><circle cx="56" cy="98" r="3"/><circle cx="40" cy="88" r="2.2"/><circle cx="88" cy="78" r="2.6"/></g>
      <path d="M36 62 Q48 43 65 46 Q50 50 42 66Z" fill="#dcfce7" opacity=".85" ${N}/>
      <ellipse cx="50" cy="72" rx="7" ry="9" fill="#f8fafc"/><ellipse cx="70" cy="70" rx="6" ry="8" fill="#f8fafc"/>
      <circle cx="48" cy="74" r="3.3" fill="#140b06" ${N}/><circle cx="68" cy="72" r="3" fill="#140b06" ${N}/>
      <path d="M50 87 Q60 93 72 85" stroke-width="3" fill="none"/>
    </g>`],

    "troll": [`0 0 ${P} ${P}`, `<g ${T}>
      <path d="M40 92 L34 112 L52 112 L54 94Z M66 94 L68 112 L86 112 L80 92Z" fill="#435a4c"/>
      <path d="M28 60 Q40 30 72 32 Q100 36 98 66 Q98 96 80 98 L40 98 Q24 90 28 60Z" fill="#5f7a6a"/>
      <path d="M34 56 Q44 36 70 36 Q90 38 94 54 Q74 41 54 45 Q40 49 34 60Z" fill="#7f9a88" ${N}/>
      <path d="M60 34 Q72 30 84 38 Q76 40 70 46 Q64 40 60 34Z M88 50 Q96 56 96 66 Q90 60 86 60Z" fill="#3f6212" ${N}/>
      <path d="M40 88 L84 88 L80 100 L44 100Z" fill="#6b4226"/>
      <path d="M86 56 L100 82 L92 86 L80 62Z" fill="#5f7a6a"/>
      <path d="M33 62 L19 88 L28 92 L42 68Z" fill="#5f7a6a"/>
      <path d="M24 86 Q8 92 6 110 Q16 114 22 108 Q30 98 30 90Z" fill="#6b4226"/>
      <path d="M12 98 L8 96 M16 104 L12 106" stroke-width="2"/>
      <circle cx="24" cy="90" r="6" fill="#5f7a6a"/>
      <path d="M22 50 Q20 36 34 34 Q46 34 46 48 Q46 60 34 62 Q22 60 22 50Z" fill="#5f7a6a"/>
      <path d="M25 44 Q28 37 35 36 Q42 37 44 43 Q36 39 27 46Z" fill="#7f9a88" ${N}/>
      <path d="M25 48 Q14 52 19 58 Q26 57 29 52Z" fill="#435a4c"/>
      <path d="M28 58 L27 54 L31 57Z M38 58 L39 54 L35 57Z" fill="#f2ead6" stroke-width="1.2"/>
      <circle cx="30" cy="44" r="2.2" fill="#facc15" ${N} ${G}/><circle cx="38" cy="43" r="2.2" fill="#facc15" ${N} ${G}/>
    </g>`],

    // ------------------------------------------------------
    // RUÍNAS SUBMERSAS
    // ------------------------------------------------------
    "serpente": [`0 0 ${P} ${P}`, `<g ${T}>
      <ellipse cx="68" cy="104" rx="34" ry="9" fill="#2f7a5a"/>
      <path d="M40 102 Q68 96 98 102" stroke="#1d4d39" stroke-width="2" fill="none"/>
      ${O("M94 102 Q106 86 78 86 Q52 86 56 70 Q60 56 44 46", "#2f7a5a", 13)}
      <path d="M90 92 Q98 88 82 88 Q60 88 60 74 Q60 64 52 56" stroke="#57b88a" stroke-width="3" fill="none"/>
      <path d="M78 92 Q64 92 60 82" stroke="#d9c27a" stroke-width="3" fill="none" stroke-dasharray="3 3"/>
      <path d="M44 37 Q30 33 17 41 Q21 52 40 54 Q51 50 51 43Z" fill="#2f7a5a"/>
      <path d="M44 39 Q32 36 22 41 Q34 40 46 44Z" fill="#57b88a" ${N}/>
      <path d="M19 47 L8 47 L4 43 M8 47 L4 51" stroke="#dc2626" stroke-width="2" fill="none"/>
      <path d="M22 49 L23 54 L25 50Z" fill="#f8f4ea" stroke-width="1"/>
      <circle cx="32" cy="41" r="2.6" fill="#fde047" ${N} ${G}/>
      <path d="M32 39 L32 43" stroke-width="1.2"/>
    </g>`],

    "escorpiao": [`0 0 ${P} ${P}`, `<g ${T}>
      ${O("M56 98 L46 110 M64 99 L60 112 M72 98 L78 111 M80 96 L92 108", "#5c2410", 2.6)}
      ${O("M84 90 Q108 84 106 60 Q104 40 86 36 Q75 36 73 46", "#8b3a1a", 9)}
      <path d="M98 74 L104 72 M102 58 L108 58 M94 42 L98 37" stroke-width="2"/>
      <path d="M74 44 Q62 46 66 57 Q70 51 77 51Z" fill="#facc15"/>
      <circle cx="65" cy="58" r="2" fill="#a3e635" ${N} ${G}/>
      <ellipse cx="62" cy="92" rx="27" ry="12" fill="#8b3a1a"/>
      <path d="M40 86 Q62 76 86 86 Q62 82 42 90Z" fill="#b5532a" ${N}/>
      <path d="M58 81 L56 103 M70 82 L70 103" stroke-width="1.6"/>
      <ellipse cx="38" cy="92" rx="11" ry="9" fill="#8b3a1a"/>
      ${O("M34 88 Q26 76 18 74", "#8b3a1a", 5)}${O("M36 97 Q26 101 20 104", "#8b3a1a", 5)}
      <path d="M18 64 Q2 64 4 78 Q11 83 21 80 Q14 76 14 72 Q18 70 23 73Z" fill="#8b3a1a"/>
      <path d="M17 96 Q1 96 3 110 Q10 115 20 112 Q13 108 13 104 Q17 102 22 105Z" fill="#8b3a1a"/>
      <circle cx="33" cy="88" r="2" fill="#ff3b3b" ${N} ${G}/><circle cx="38" cy="86" r="2" fill="#ff3b3b" ${N} ${G}/>
    </g>`],

    "fantasma": [`0 0 ${P} ${P}`, `<g stroke="#0b2a33" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round">
      <path d="M32 64 Q16 70 11 58" fill="none" stroke="#a5f3fc" stroke-width="5" opacity=".7"/>
      <path d="M88 64 Q104 70 109 58" fill="none" stroke="#a5f3fc" stroke-width="5" opacity=".7"/>
      <path d="M30 100 Q28 40 60 26 Q92 40 90 100 L82 92 L74 102 L66 92 L58 102 L50 92 L42 102 L36 94Z" fill="#a5f3fc" fill-opacity=".72"/>
      <path d="M40 90 Q40 46 60 36 Q80 46 80 90Z" fill="#ecfeff" opacity=".45" ${N}/>
      <ellipse cx="50" cy="56" rx="6" ry="8" fill="#0b1e2a"/><ellipse cx="69" cy="56" rx="6" ry="8" fill="#0b1e2a"/>
      <ellipse cx="59" cy="76" rx="5.5" ry="8" fill="#0b1e2a"/>
      <circle cx="51" cy="57" r="2" fill="#67e8f9" ${N} ${G}/><circle cx="70" cy="57" r="2" fill="#67e8f9" ${N} ${G}/>
    </g>`],

    "cavaleiro-afogado": [`0 0 ${P} ${P}`, `<g ${T}>
      <path d="M46 86 L44 110 L57 110 L57 88Z M63 88 L64 110 L77 110 L73 86Z" fill="#4b4f55"/>
      <path d="M80 50 L96 14 L102 16 L86 52Z" fill="#8f979f"/>
      <circle cx="92" cy="30" r="2" fill="#8a4b2a" ${N}/>
      <path d="M77 52 L90 54 L89 58 L76 56Z" fill="#5a4636"/>
      <path d="M40 48 Q60 40 80 48 L78 88 L42 88Z" fill="#6b6f75"/>
      <path d="M43 50 Q60 43 77 50 L76 58 Q60 52 44 58Z" fill="#9aa0a8" ${N}/>
      <g fill="#8a4b2a" ${N}><circle cx="52" cy="68" r="3"/><circle cx="68" cy="76" r="2.4"/><circle cx="62" cy="62" r="1.6"/></g>
      <path d="M78 52 L84 70 L78 74 L74 58Z" fill="#6b6f75"/>
      <circle cx="35" cy="70" r="16" fill="#5a4636"/>
      <circle cx="35" cy="70" r="11" fill="#6f5846" ${N}/>
      <circle cx="35" cy="70" r="4" fill="#8f979f"/>
      <path d="M26 62 L32 70 L28 78" stroke-width="1.4" fill="none"/>
      <path d="M46 22 Q60 12 74 22 L74 44 L46 44Z" fill="#6b6f75"/>
      <path d="M49 22 Q60 15 71 22 Q60 19 50 26Z" fill="#9aa0a8" ${N}/>
      <rect x="48" y="30" width="24" height="5" fill="#0b1416"/>
      <circle cx="54" cy="32.5" r="1.9" fill="#5eead4" ${N} ${G}/><circle cx="66" cy="32.5" r="1.9" fill="#5eead4" ${N} ${G}/>
      <path d="M47 24 Q42 34 46 46 M76 52 Q83 64 77 78 M44 50 Q40 60 43 66" stroke="#4d7c0f" stroke-width="3" fill="none"/>
      <g fill="#7dd3fc" opacity=".8" ${N}><circle cx="44" cy="96" r="1.6"/><circle cx="78" cy="94" r="1.4"/></g>
    </g>`],

    "gargula": [`0 0 ${P} ${P}`, `<g ${T}>
      <path d="M54 52 Q40 18 12 22 Q24 32 18 44 Q30 42 31 57Z" fill="#57534e"/>
      <path d="M62 50 Q80 14 112 20 Q100 32 106 44 Q92 40 93 56 Q81 50 75 64Z" fill="#57534e"/>
      <path d="M64 48 Q80 22 104 22 Q82 30 70 54Z" fill="#78716c" ${N}/>
      <path d="M38 62 Q50 44 72 50 Q90 60 86 88 L80 104 L40 104 Q32 84 38 62Z" fill="#78716c"/>
      <path d="M42 60 Q52 48 70 52 Q56 52 44 66Z" fill="#a8a29e" ${N}/>
      <path d="M40 92 Q30 104 34 110 L54 110 L52 96Z" fill="#78716c"/>
      <path d="M70 92 Q84 104 80 110 L62 110 L64 96Z" fill="#78716c"/>
      <path d="M34 110 L32 113 M40 110 L39 113 M80 110 L82 113" stroke-width="2"/>
      <path d="M34 42 Q34 28 48 28 Q60 30 58 44 Q56 56 44 56 Q34 54 34 42Z" fill="#78716c"/>
      <path d="M37 38 Q40 31 48 31 Q55 32 56 38 Q47 34 38 41Z" fill="#a8a29e" ${N}/>
      <path d="M39 31 L33 15 L46 28Z M54 31 L60 15 L51 28Z" fill="#57534e"/>
      <path d="M40 51 L42 55 L44 51 M48 51 L50 55 L52 51" fill="#e7e5e4" stroke-width="1.2"/>
      <path d="M62 70 L66 78 L62 86 M48 74 L52 80" stroke-width="1.2" fill="none"/>
      <circle cx="42" cy="41" r="2.4" fill="#fb923c" ${N} ${G}/><circle cx="51" cy="41" r="2.4" fill="#fb923c" ${N} ${G}/>
    </g>`],

    // ------------------------------------------------------
    // FORJA ABISSAL
    // ------------------------------------------------------
    "diabrete": [`0 0 ${P} ${P}`, `<g ${T}>
      <path d="M62 54 Q78 28 98 34 Q89 43 93 52 Q81 50 77 62Z" fill="#4c0d0d"/>
      <path d="M52 54 Q38 30 20 36 Q29 45 25 54 Q37 52 41 62Z" fill="#4c0d0d"/>
      ${O("M66 78 Q84 92 90 76", "#7f1d1d", 3)}
      <path d="M90 76 L96 70 L94 80Z" fill="#7f1d1d"/>
      ${O("M52 82 L50 92 M62 82 L64 92", "#7f1d1d", 3)}
      <ellipse cx="57" cy="68" rx="12" ry="15" fill="#b91c1c"/>
      <path d="M48 62 Q57 54 66 62 Q57 59 49 66Z" fill="#e04848" ${N}/>
      ${O("M40 74 L20 28", "#3f3f46", 2.6)}
      <path d="M14 30 L18 22 L20 31 L24 20 L26 30 L30 22 L30 32 Q22 36 14 30Z" fill="#a1a1aa"/>
      ${O("M47 66 L39 72", "#b91c1c", 4)}
      <circle cx="56" cy="46" r="11" fill="#b91c1c"/>
      <path d="M48 41 Q56 35 64 41 Q56 39 49 44Z" fill="#e04848" ${N}/>
      <path d="M48 38 L43 25 L52 36Z M64 38 L69 25 L60 36Z" fill="#1c1917"/>
      <path d="M50 51 Q56 55 62 51" stroke-width="2" fill="none"/>
      <circle cx="52" cy="46" r="2.4" fill="#fde047" ${N} ${G}/><circle cx="60" cy="46" r="2.4" fill="#fde047" ${N} ${G}/>
    </g>`],

    "elemental": [`0 0 ${P} ${P}`, `<g stroke="#7c2d12" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round">
      <path d="M60 110 Q28 108 30 80 Q30 60 44 48 Q42 64 52 66 Q46 44 60 16 Q66 40 74 46 Q78 34 76 24 Q98 50 92 80 Q90 108 60 110Z" fill="#ea580c" ${G}/>
      <path d="M60 104 Q40 100 40 82 Q42 68 52 62 Q54 74 62 74 Q58 56 66 40 Q72 58 80 62 Q86 74 82 86 Q78 102 60 104Z" fill="#f59e0b" ${N}/>
      <path d="M60 100 Q48 96 50 84 Q54 76 60 80 Q62 68 70 62 Q76 76 74 86 Q72 98 60 100Z" fill="#fde68a" ${N}/>
      <path d="M48 70 L57 75 M76 70 L67 75" stroke="#431407" stroke-width="3.5"/>
      <path d="M54 87 Q62 93 70 87" stroke="#431407" stroke-width="3" fill="none"/>
      <g fill="#fdba74" ${N} ${G}><circle cx="30" cy="40" r="2"/><circle cx="94" cy="30" r="1.6"/><circle cx="100" cy="60" r="2.2"/><circle cx="22" cy="68" r="1.4"/></g>
    </g>`],

    "golem": [`0 0 ${P} ${P}`, `<g ${T}>
      <path d="M40 88 L56 88 L57 111 L38 111Z M66 88 L82 88 L84 111 L65 111Z" fill="#57534e"/>
      <path d="M86 48 L101 56 L104 84 L91 88Z" fill="#78716c"/>
      <path d="M34 46 L86 42 L90 88 L32 90Z" fill="#78716c"/>
      <path d="M36 48 L84 44 L85 54 L36 58Z" fill="#a8a29e" ${N}/>
      <path d="M48 24 L72 22 L74 42 L46 44Z" fill="#78716c"/>
      <path d="M49 25 L71 23 L72 29 L49 31Z" fill="#a8a29e" ${N}/>
      <path d="M34 50 L18 56 L14 86 L30 90 L32 64Z" fill="#78716c"/>
      <ellipse cx="20" cy="93" rx="11" ry="8" fill="#57534e"/>
      <ellipse cx="98" cy="91" rx="10" ry="8" fill="#57534e"/>
      <path d="M50 62 L60 55 L70 62 L60 72Z M60 55 L60 72" stroke="#fb923c" stroke-width="2.2" fill="none" ${G}/>
      <path d="M40 76 L48 80 M78 70 L74 78 M70 30 L66 36" stroke-width="1.4" fill="none"/>
      <rect x="51" y="30" width="7" height="3.5" fill="#fb923c" ${N} ${G}/><rect x="62" y="29.5" width="7" height="3.5" fill="#fb923c" ${N} ${G}/>
    </g>`],

    "demonio": [`0 0 ${P} ${P}`, `<g ${T}>
      <path d="M64 44 Q92 6 116 18 Q104 30 110 44 Q96 40 96 56 Q84 50 80 64Z" fill="#2a0a0a"/>
      <path d="M54 44 Q30 8 6 20 Q18 30 12 44 Q26 40 26 56 Q38 50 42 64Z" fill="#2a0a0a"/>
      <path d="M68 44 Q90 16 108 20 Q88 26 76 52Z" fill="#4c1010" ${N}/>
      <path d="M46 86 L40 98 L46 111 L56 111 L52 98 L56 88Z M66 88 L70 98 L64 111 L74 111 L80 98 L74 86Z" fill="#450a0a"/>
      <path d="M38 48 Q60 38 82 48 L78 90 L42 90Z" fill="#7f1d1d"/>
      <path d="M41 50 Q60 41 79 50 Q60 46 43 57Z" fill="#b91c1c" ${N}/>
      <path d="M60 52 L60 84 M50 64 L70 64 M51 74 L69 74" stroke="#450a0a" stroke-width="1.6"/>
      <path d="M38 50 L28 74 L36 78 L46 58Z M82 50 L92 74 L84 78 L76 58Z" fill="#7f1d1d"/>
      <path d="M26 76 L24 82 M30 78 L30 84 M34 78 L36 84" stroke="#e7e0cf" stroke-width="2"/>
      <path d="M48 26 Q60 18 72 26 L70 42 Q60 48 50 42Z" fill="#7f1d1d"/>
      <path d="M50 28 Q40 20 40 6 Q46 18 55 24Z M70 28 Q80 20 80 6 Q74 18 65 24Z" fill="#e7e0cf"/>
      <path d="M54 41 L56 45 L58 41 M62 41 L64 45 L66 41" fill="#f8f4ea" stroke-width="1"/>
      <circle cx="55" cy="33" r="2.4" fill="#fde047" ${N} ${G}/><circle cx="65" cy="33" r="2.4" fill="#fde047" ${N} ${G}/>
    </g>`],

    "cao": [`0 0 ${P} ${P}`, `<g ${T}>
      <path d="M92 70 Q112 64 110 44 Q104 54 98 52 Q102 60 90 62Z" fill="#f97316" ${G}/>
      <path d="M82 88 L84 110 L93 110 L95 86Z" fill="#141010"/>
      <path d="M44 66 Q70 56 96 66 Q100 84 92 92 L50 92 Q38 82 44 66Z" fill="#1f1a1a"/>
      <path d="M48 66 Q70 58 94 66 Q72 64 50 73Z" fill="#3b3232" ${N}/>
      <path d="M48 88 L44 110 L54 110 L58 90Z M60 88 L60 110 L69 110 L70 90Z" fill="#141010"/>
      <path d="M46 46 L54 34 L56 44 L64 32 L66 46 L76 38 L74 52 L86 50 L76 62 L56 62Z" fill="#f97316" ${G}/>
      <path d="M54 46 L58 40 L60 48 L66 42 L68 52 L76 50 L70 58 L58 58Z" fill="#fde047" ${N}/>
      <path d="M50 50 Q36 45 13 57 L15 66 Q30 73 50 75 Q61 62 50 50Z" fill="#1f1a1a"/>
      <path d="M44 50 L47 33 L55 50Z" fill="#1f1a1a"/>
      <path d="M14 62 Q28 66 41 66 L37 73 Q24 73 16 67Z" fill="#7c2d12"/>
      <path d="M17 62.5 L19 66 L21 63 L23 66 L25 63 L27 66 L29 63.5" fill="none" stroke="#f1ead8" stroke-width="1.6"/>
      <circle cx="36" cy="55" r="2.8" fill="#f97316" ${N} ${G}/>
    </g>`],

    // ------------------------------------------------------
    // CORAÇÃO DO VAZIO
    // ------------------------------------------------------
    "olho": [`0 0 ${P} ${P}`, `<g ${T}>
      ${O("M50 80 Q40 96 46 110", "#4c1d95", 5)}${O("M60 82 Q60 98 54 112", "#4c1d95", 5)}${O("M70 80 Q82 96 76 110", "#4c1d95", 5)}
      ${O("M42 72 Q26 82 24 100", "#4c1d95", 5)}${O("M78 72 Q94 82 96 100", "#4c1d95", 5)}
      <circle cx="60" cy="54" r="32" fill="#5b21b6"/>
      <path d="M36 40 Q50 22 74 26 Q52 28 40 46Z" fill="#7c3aed" ${N}/>
      <circle cx="60" cy="56" r="25" fill="#ece7f5"/>
      <path d="M38 60 Q42 66 40 72 M80 52 Q76 60 82 66 M46 40 Q50 44 48 48" stroke="#dc2626" stroke-width="1.2" fill="none"/>
      <circle cx="55" cy="56" r="12" fill="#a855f7" ${G}/>
      <ellipse cx="53" cy="56" rx="4" ry="9" fill="#0b0612" ${N}/>
      <circle cx="58" cy="51" r="2.4" fill="#fff" ${N}/>
    </g>`],

    "espectro": [`0 0 ${P} ${P}`, `<g ${T}>
      <ellipse cx="60" cy="106" rx="30" ry="6" fill="#6d28d9" opacity=".35" ${N}/>
      <path d="M36 108 Q38 60 48 40 Q60 24 72 40 Q82 60 84 108 L76 100 L68 110 L60 100 L52 110 L44 100Z" fill="#312e81" fill-opacity=".92"/>
      <path d="M44 96 Q46 62 54 46 Q50 70 52 96Z" fill="#4338ca" ${N}/>
      <path d="M40 62 L26 70 L22 64 M26 70 L22 76 M80 62 L94 70 L98 64 M94 70 L98 76" stroke="#c4b5fd" stroke-width="2.4" fill="none"/>
      <path d="M44 46 Q46 20 60 18 Q76 20 76 46 Q60 40 44 46Z" fill="#1e1b4b"/>
      <ellipse cx="60" cy="38" rx="10" ry="12" fill="#05030f"/>
      <circle cx="56" cy="37" r="2" fill="#c4b5fd" ${N} ${G}/><circle cx="64.5" cy="37" r="2" fill="#c4b5fd" ${N} ${G}/>
    </g>`],

    "abominacao": [`0 0 ${P} ${P}`, `<g ${T}>
      ${O("M44 70 Q30 90 18 108", "#581c87", 7)}${O("M52 74 Q48 94 40 112", "#6b21a8", 7)}${O("M62 76 Q66 96 62 112", "#581c87", 7)}
      ${O("M72 74 Q84 92 86 112", "#6b21a8", 7)}${O("M80 68 Q96 84 106 104", "#581c87", 7)}
      <path d="M38 70 Q30 30 60 16 Q90 30 82 70 Q60 82 38 70Z" fill="#7e22ce"/>
      <path d="M42 50 Q44 26 60 20 Q78 26 80 44 Q64 30 48 44Z" fill="#a855f7" ${N}/>
      <path d="M54 70 L60 79 L66 70Z" fill="#1c0a2b"/>
      <circle cx="50" cy="48" r="6" fill="#f8fafc"/><circle cx="67" cy="43" r="7" fill="#f8fafc"/>
      <circle cx="58" cy="61" r="4.5" fill="#f8fafc"/><circle cx="73" cy="58" r="3.5" fill="#f8fafc"/>
      <g fill="#bef264" ${N} ${G}><circle cx="49" cy="49" r="2.6"/><circle cx="66" cy="44" r="3"/><circle cx="57.5" cy="61.5" r="2"/><circle cx="72.5" cy="58.5" r="1.6"/></g>
    </g>`],

    "cavaleiro-sombrio": [`0 0 ${P} ${P}`, `<g ${T}>
      <path d="M40 46 Q34 80 30 110 L86 110 Q80 80 78 46Z" fill="#3b0d4d"/>
      <path d="M46 86 L44 110 L57 110 L57 88Z M63 88 L64 110 L77 110 L73 86Z" fill="#15131f"/>
      <path d="M40 48 Q60 40 80 48 L78 88 L42 88Z" fill="#1f1d2b"/>
      <path d="M43 50 Q60 43 77 50 L76 58 Q60 52 44 58Z" fill="#3f3b56" ${N}/>
      <path d="M60 56 L60 84" stroke="#a78bfa" stroke-width="1.6" ${G}/>
      <path d="M29 56 L26 110 L33 110 L35 56Z" fill="#4b4a5c"/>
      <path d="M30 62 L29 104" stroke="#c4b5fd" stroke-width="1.4" ${G}/>
      <rect x="20" y="50" width="24" height="5" fill="#1f1d2b"/>
      <path d="M30 40 L34 40 L34 50 L30 50Z" fill="#3a2616"/>
      <path d="M42 52 L34 50 L33 56 L42 60Z M78 52 L68 54 L60 50" fill="#1f1d2b"/>
      <circle cx="33" cy="47" r="4" fill="#2a2838"/>
      <path d="M46 20 Q60 12 74 20 L74 42 L46 42Z" fill="#1f1d2b"/>
      <path d="M49 21 Q60 15 71 21 Q60 18 50 25Z" fill="#3f3b56" ${N}/>
      <path d="M46 24 L35 11 L48 21Z M74 24 L85 11 L72 21Z" fill="#2a2838"/>
      <path d="M50 30 L70 30 M60 30 L60 39" stroke="#a78bfa" stroke-width="2.6" ${G}/>
    </g>`],

    "lich": [`0 0 ${P} ${P}`, `<g ${T}>
      <path d="M34 110 Q38 70 46 48 L74 48 Q82 70 86 110Z" fill="#27213a"/>
      <path d="M58 52 L58 110 L62 110 L62 52Z" fill="#d4a017" ${N}/>
      <path d="M36 104 L84 104" stroke="#d4a017" stroke-width="2.5"/>
      <path d="M38 52 Q60 40 82 52 L78 62 Q60 54 42 62Z" fill="#4c1d95"/>
      ${O("M30 40 L36 110", "#5a3a1f", 3.5)}
      <circle cx="30" cy="34" r="7" fill="#22c55e" ${G}/>
      <circle cx="28" cy="32" r="2" fill="#dcfce7" ${N}/>
      <circle cx="33" cy="58" r="4" fill="#d9d2bf"/>
      <path d="M48 32 Q48 20 60 20 Q72 20 72 32 Q72 38 67 40 L67 45 L53 45 L53 40 Q48 38 48 32Z" fill="#d9d2bf"/>
      <circle cx="55" cy="32" r="3.8" fill="#140b06"/><circle cx="65" cy="32" r="3.8" fill="#140b06"/>
      <path d="M56 42 L56 45 M60 42 L60 45 M64 42 L64 45" stroke-width="1.1"/>
      <path d="M47 22 L49 10 L54 17 L60 7 L66 17 L71 10 L73 22Z" fill="#e0a82e"/>
      <circle cx="60" cy="16" r="2" fill="#ef4444" ${N}/>
      <circle cx="55" cy="32" r="1.7" fill="#4ade80" ${N} ${G}/><circle cx="65" cy="32" r="1.7" fill="#4ade80" ${N} ${G}/>
    </g>`],

    "mimico": [`0 0 ${P} ${P}`, `<g ${T}>
      <path d="M24 70 L96 70 L92 108 L28 108Z" fill="#7c4a22"/>
      <path d="M27 72 L93 72 L92 80 L28 80Z" fill="#9a5f2e" ${N}/>
      <path d="M44 70 L44 108 M76 70 L76 108" stroke="#a8a29e" stroke-width="5"/>
      <path d="M22 66 L30 36 L98 40 L98 68Z" fill="#7c4a22"/>
      <path d="M29 40 L97 43 L97 50 L28 47Z" fill="#9a5f2e" ${N}/>
      <path d="M24 70 Q60 64 96 70 L98 66 Q60 56 22 66Z" fill="#450a0a"/>
      <path d="M26 66 L30 72 L34 66 L38 72 L42 66 L46 71 L50 65 L54 71 L58 65 L62 71 L66 65 L70 71 L74 66 L78 71 L82 66 L86 71 L90 66 L94 70Z" fill="#f2ead6" stroke-width="1.2"/>
      <path d="M50 70 Q40 86 28 88 Q42 94 57 76Z" fill="#e11d48"/>
      <rect x="54" y="82" width="12" height="10" rx="2" fill="#e0a82e"/>
      <circle cx="46" cy="52" r="3.2" fill="#fde047" ${N} ${G}/><circle cx="62" cy="51" r="3.2" fill="#fde047" ${N} ${G}/>
    </g>`],

    // ------------------------------------------------------
    // DRAGÕES (base comum + detalhes de cada um)
    // Cores pelas variáveis --d1 (corpo) --d2 (ventre) --d3 (sombra) --ol (olho) --ch (chifre)
    // ------------------------------------------------------
    "dragao-base": ["0 0 160 120", `<g ${T}>
      <path d="M94 58 Q112 14 156 12 Q144 26 150 38 Q136 36 138 50 Q124 46 122 62Z" fill="var(--d3)"/>
      ${O("M98 98 Q132 108 144 88 Q150 74 138 66", "var(--d1)", 11)}
      <path d="M136 60 L146 58 L140 70Z" fill="var(--d3)"/>
      <path d="M90 96 Q106 98 106 113 L84 113Z" fill="var(--d1)"/>
      <path d="M54 70 Q66 50 92 56 Q118 62 114 92 Q110 110 86 110 L60 110 Q46 96 54 70Z" fill="var(--d1)"/>
      <path d="M58 84 Q66 101 86 107 L66 109 Q54 99 58 84Z" fill="var(--d2)" ${N}/>
      <path d="M62 92 L68 90 M66 100 L73 97 M72 105 L78 102" stroke="var(--d3)" stroke-width="1.6"/>
      <path d="M60 64 Q76 56 98 62 Q80 60 64 70Z" fill="var(--d2)" opacity=".45" ${N}/>
      <path d="M72 56 L76 48 L80 56 M84 56 L89 48 L92 58 M96 60 L102 53 L103 63" fill="var(--d3)"/>
      <path d="M58 92 Q50 104 45 113 L63 113 Q65 102 70 96Z" fill="var(--d1)"/>
      <path d="M45 113 L43 116 M50 113 L49 116 M55 113 L55 116" stroke="#f1ead8" stroke-width="2"/>
      <path d="M58 72 Q44 54 46 38 L60 34 Q60 52 73 62Z" fill="var(--d1)"/>
      <path d="M51 60 Q46 50 48 40 L52 40 Q52 52 60 64Z" fill="var(--d2)" ${N}/>
      <path d="M58 40 L64 36 L62 44 M62 50 L68 47 L66 55" fill="var(--d3)"/>
      <path d="M44 30 Q30 24 9 34 Q7 42 13 46 Q30 48 44 46 Q56 44 58 36 Q56 28 44 30Z" fill="var(--d1)"/>
      <path d="M40 31 Q28 27 14 35 Q28 32 42 36Z" fill="var(--d2)" opacity=".55" ${N}/>
      <path d="M12 44 Q28 52 44 48 L40 55 Q24 57 14 50Z" fill="var(--d3)"/>
      <path d="M16 45 L18 49 L20 45.5 L22 49.5 L24 46 L26 50 L28 46.5" fill="none" stroke="#f1ead8" stroke-width="1.5"/>
      <path d="M48 30 Q56 16 72 11 Q61 22 55 34Z" fill="var(--ch)"/>
      <path d="M43 28 Q45 16 54 9 Q50 20 50 30Z" fill="var(--ch)"/>
      <circle cx="12" cy="37" r="1.4" fill="${TINTA}" ${N}/>
      <path d="M86 62 Q84 12 126 0 Q118 16 126 26 Q110 26 112 40 Q100 38 102 56Z" fill="var(--d1)"/>
      <path d="M90 58 Q90 24 120 6 Q102 26 100 54Z M104 40 Q108 24 122 14" fill="var(--d2)" opacity=".4" ${N}/>
      <path d="M30 34 Q36 30.5 41 35 Q35 38.5 30 34Z" fill="var(--ol)" ${G}/>
      <circle cx="35.5" cy="34.4" r="3.5" fill="var(--ol)" opacity=".35" ${N} ${G}/>
    </g>`],

    "dragao-verde": ["0 0 160 120", `<g style="--d1:#2f6b3a;--d2:#9bc46a;--d3:#1d4426;--ol:#e3ff5a;--ch:#d9d2bf">
      <use href="#spr-dragao-base" width="160" height="120"/>
      <g ${T}>
        <path d="M52 32 Q62 26 66 34 Q58 34 56 40Z M48 40 Q58 40 60 48 Q52 46 48 50Z" fill="#5d9c45"/>
        <path d="M18 50 Q16 58 18 64" stroke="#a3e635" stroke-width="2.5" fill="none" ${G}/>
        <circle cx="18" cy="66" r="2.4" fill="#a3e635" ${N} ${G}/>
      </g>
    </g>`],

    "wyrm-gelo": ["0 0 160 120", `<g style="--d1:#3b7ea8;--d2:#c7ecff;--d3:#24506e;--ol:#a5f3fc;--ch:#e0f2fe">
      <use href="#spr-dragao-base" width="160" height="120"/>
      <g ${t}>
        <path d="M70 58 L74 42 L79 57Z M82 57 L88 38 L92 58Z M95 61 L104 44 L104 64Z M58 42 L54 30 L62 38Z" fill="#e0f7ff" ${G}/>
        <g fill="#e0f7ff" opacity=".8" ${N}><circle cx="4" cy="44" r="2"/><circle cx="0" cy="38" r="1.4"/><circle cx="6" cy="52" r="1.2"/></g>
      </g>
    </g>`],

    "dragoa-trovao": ["0 0 160 120", `<g style="--d1:#4c3d8f;--d2:#a5b4fc;--d3:#2e2459;--ol:#fde047;--ch:#fde68a">
      <use href="#spr-dragao-base" width="160" height="120"/>
      <g ${t}>
        <path d="M66 8 L58 22 L64 22 L56 36 L70 18 L64 18 L72 6Z" fill="#fde047" ${G}/>
        <path d="M118 30 L112 40 L117 40 L111 50" stroke="#fde047" stroke-width="2" fill="none" ${G}/>
        <path d="M100 70 L94 80 L99 80 L93 90" stroke="#fde047" stroke-width="2" fill="none" ${G}/>
      </g>
    </g>`],

    "anciao-rubro": ["0 0 160 120", `<g style="--d1:#9b1c1c;--d2:#f59e0b;--d3:#5a0e0e;--ol:#fde047;--ch:#2b1a12">
      <use href="#spr-dragao-base" width="160" height="120"/>
      <g ${T}>
        <path d="M50 30 Q64 10 84 14 Q70 18 60 34Z" fill="#2b1a12"/>
        <path d="M70 72 L78 80 L74 90 M92 70 L98 84 M60 96 L66 104" stroke="#fb923c" stroke-width="2" fill="none" ${G}/>
        <g fill="#fdba74" opacity=".85" ${N} ${G}><circle cx="5" cy="32" r="2.6"/><circle cx="1" cy="26" r="1.8"/><circle cx="8" cy="24" r="1.4"/></g>
      </g>
    </g>`],

    "dragao-vazio": ["0 0 160 120", `<g style="--d1:#1f1b2e;--d2:#6d28d9;--d3:#0c0a14;--ol:#c084fc;--ch:#4c1d95">
      <ellipse cx="84" cy="70" rx="76" ry="50" fill="#7c3aed" opacity=".16" ${G}/>
      <use href="#spr-dragao-base" width="160" height="120"/>
      <g ${N}>
        <circle cx="22" cy="38" r="1.8" fill="#c084fc" ${G}/><circle cx="37" cy="41" r="1.5" fill="#c084fc" ${G}/>
        <circle cx="74" cy="78" r="2" fill="#c084fc" ${G}/><circle cx="96" cy="74" r="1.6" fill="#c084fc" ${G}/>
        <g fill="#e9d5ff"><circle cx="140" cy="10" r="1"/><circle cx="20" cy="12" r="1"/><circle cx="150" cy="56" r=".9"/></g>
      </g>
    </g>`],

    // ------------------------------------------------------
    // CENAS GRANDES
    // ------------------------------------------------------
    "fogueira-grande": [`0 0 ${P} ${P}`, `<g ${T}>
      <path d="M28 104 L92 88 L94 96 L30 112Z" fill="#5a3a1f"/>
      <path d="M28 88 L92 104 L90 112 L26 96Z" fill="#6b4226"/>
      <circle cx="30" cy="92" r="4" fill="#8a5a33"/><circle cx="91" cy="92" r="4" fill="#8a5a33"/>
      <path d="M60 96 Q36 92 40 70 Q42 58 50 52 Q50 64 56 64 Q52 44 62 26 Q66 46 72 50 Q76 42 74 34 Q90 54 82 76 Q78 94 60 96Z" fill="#ea580c" stroke="#7c2d12" ${G}/>
      <path d="M60 92 Q46 88 48 74 Q50 66 56 62 Q58 70 62 70 Q60 56 66 46 Q72 60 76 64 Q80 76 74 84 Q70 92 60 92Z" fill="#f59e0b" ${N}/>
      <path d="M60 90 Q52 86 54 78 Q57 72 61 76 Q63 66 68 62 Q72 72 70 80 Q68 88 60 90Z" fill="#fde68a" ${N}/>
    </g>`],
    "lapide": [`0 0 ${P} ${P}`, `<g ${T}>
      <path d="M36 110 L36 50 Q36 26 60 26 Q84 26 84 50 L84 110Z" fill="#57534e"/>
      <path d="M40 50 Q40 30 60 30 Q80 30 80 48 Q66 36 52 40 Q42 44 40 56Z" fill="#78716c" ${N}/>
      <path d="M60 46 L60 76 M50 56 L70 56" stroke-width="5"/>
      <path d="M60 46 L60 76 M50 56 L70 56" stroke="#a8a29e" stroke-width="2"/>
      <path d="M30 110 L90 110" stroke-width="3"/>
      <path d="M40 100 Q46 92 50 100 M70 102 Q76 94 80 102" stroke="#3f6212" stroke-width="2.4" fill="none"/>
    </g>`],
    "bau-aberto": [`0 0 ${P} ${P}`, `<g ${T}>
      <ellipse cx="60" cy="60" rx="40" ry="26" fill="#fbbf24" opacity=".35" ${N} ${G}/>
      <path d="M26 54 L34 26 L90 30 L94 58Z" fill="#7c4a22"/>
      <path d="M33 30 L89 33 L89 40 L32 37Z" fill="#9a5f2e" ${N}/>
      <path d="M24 60 L96 60 L92 104 L28 104Z" fill="#7c4a22"/>
      <path d="M27 62 L93 62 L92 70 L28 70Z" fill="#9a5f2e" ${N}/>
      <path d="M24 60 Q60 52 96 60 L94 64 Q60 58 26 64Z" fill="#fde047" ${G}/>
      <g fill="#fde047" ${N} ${G}><circle cx="44" cy="56" r="4"/><circle cx="56" cy="53" r="4.5"/><circle cx="70" cy="54" r="4"/><circle cx="62" cy="57" r="3.5"/></g>
      <path d="M44 60 L44 104 M76 60 L76 104" stroke="#a8a29e" stroke-width="5"/>
      <rect x="54" y="72" width="12" height="11" rx="2" fill="#e0a82e"/>
    </g>`],

    // ------------------------------------------------------
    // ÍCONES (viewBox 32×32)
    // ------------------------------------------------------
    "espada": [I, `<g ${t}>
      <path d="M8 22 L22 7 L26 6 L25 10 L10 24Z" fill="#d6dce4"/>
      <path d="M10 21 L23 8" stroke="#f8fafc" stroke-width="1" fill="none"/>
      ${o("M5 19 L13 27", "#e0a82e", 3)}
      ${o("M8 24 L4 28", "#5a3a1f", 2.4)}
    </g>`],
    "escudo": [I, `<g ${t}>
      <path d="M16 3 L27 7 Q27 20 16 29 Q5 20 5 7Z" fill="#7b8494"/>
      <path d="M16 6 L24.5 9 Q24.5 19 16 26 Q7.5 19 7.5 9Z" fill="#a7b0bd" ${N}/>
      <path d="M16 6 L16 26 M8 13 L24 13" stroke="#e0a82e" stroke-width="2.2"/>
    </g>`],
    "golpe": [I, `<g ${t}>
      <path d="M3 26 Q10 6 30 4 Q16 11 8 29Z" fill="#ea580c" ${G}/>
      <path d="M7 24 Q13 10 27 6 Q16 13 10 26Z" fill="#fde68a" ${N}/>
      <path d="M20 22 L26 16 L28 17 L22 24Z" fill="#d6dce4"/>
      <g fill="#fde047" ${N} ${G}><circle cx="24" cy="25" r="1.4"/><circle cx="28" cy="11" r="1.1"/></g>
    </g>`],
    "pocao": [I, `<g ${t}>
      <rect x="13" y="2.5" width="6" height="4" rx="1" fill="#8a5a33"/>
      <path d="M13 6.5 h6 v5 l5.5 7.5 a9 9 0 1 1 -17 0 l5.5 -7.5Z" fill="#dbe4ee" fill-opacity=".55"/>
      <path d="M7.6 19.5 a8.6 8.6 0 1 0 16.8 0 Q16 16.5 7.6 19.5Z" fill="#e11d48" ${N}/>
      <path d="M10 17 Q11 13 13.5 11.5" stroke="#fff" stroke-width="1.4" fill="none" opacity=".8"/>
    </g>`],
    "coracao": [I, `<g ${t}>
      <path d="M16 28 Q4 19 4 11 Q4 5 10 5 Q14 5 16 9 Q18 5 22 5 Q28 5 28 11 Q28 19 16 28Z" fill="#dc2626"/>
      <path d="M8 10 Q9 7.5 12 8" stroke="#fca5a5" stroke-width="2" fill="none"/>
    </g>`],
    "coracao-verde": [I, `<g ${t}>
      <path d="M16 28 Q4 19 4 11 Q4 5 10 5 Q14 5 16 9 Q18 5 22 5 Q28 5 28 11 Q28 19 16 28Z" fill="#16a34a"/>
      <path d="M16 11 L16 21 M11 16 L21 16" stroke="#dcfce7" stroke-width="3"/>
    </g>`],
    "coracao-brilho": [I, `<g ${t}>
      <path d="M16 28 Q4 19 4 11 Q4 5 10 5 Q14 5 16 9 Q18 5 22 5 Q28 5 28 11 Q28 19 16 28Z" fill="#f472b6" ${G}/>
      <path d="M8 10 Q9 7.5 12 8" stroke="#fce7f3" stroke-width="2" fill="none"/>
      <path d="M26 2 L27 5 L30 6 L27 7 L26 10 L25 7 L22 6 L25 5Z" fill="#fde047" ${N}/>
    </g>`],
    "alvo": [I, `<g ${t}>
      <circle cx="15" cy="17" r="12" fill="#b91c1c"/><circle cx="15" cy="17" r="8" fill="#f1ead8"/><circle cx="15" cy="17" r="4" fill="#b91c1c"/>
      ${o("M15 17 L28 4", "#8a5a33", 1.8)}
      <path d="M25 3 L29 3 L29 7Z" fill="#e0a82e"/>
    </g>`],
    "vento": [I, `<g fill="none">
      ${o("M3 11 L19 11 Q25 11 25 6 Q25 2 21 3", "#a5f3fc", 2.2)}
      ${o("M3 17 L26 17 Q30 17 30 21 Q30 25 26 24", "#67e8f9", 2.2)}
      ${o("M6 23 L16 23", "#a5f3fc", 2.2)}
    </g>`],
    "moeda": [I, `<g ${t}>
      <circle cx="16" cy="16" r="12" fill="#c98a16"/>
      <circle cx="16" cy="15" r="9" fill="#f5c451" ${N}/>
      <path d="M13 10 L19 10 L19 21 L13 21Z" fill="#c98a16" ${N}/>
      <path d="M9 11 Q11 8 14 7.5" stroke="#fff3c4" stroke-width="1.6" fill="none"/>
    </g>`],
    "moedas": [I, `<g ${t}>
      <ellipse cx="12" cy="25" rx="9" ry="4" fill="#c98a16"/><ellipse cx="12" cy="21" rx="9" ry="4" fill="#e0a82e"/>
      <ellipse cx="12" cy="17" rx="9" ry="4" fill="#f5c451"/>
      <circle cx="23" cy="13" r="7" fill="#e0a82e"/><circle cx="23" cy="12.5" r="4.5" fill="#f5c451" ${N}/>
    </g>`],
    "escama": [I, `<g ${t}>
      <path d="M16 3 Q27 9 26 18 Q24 26 16 29 Q8 26 6 18 Q5 9 16 3Z" fill="#0e9fb8"/>
      <path d="M16 6 Q24 11 23 18 Q21 23 16 25Z" fill="#67e8f9" ${N}/>
      <path d="M16 7 L16 26" stroke="#0b4f5c" stroke-width="1.2"/>
    </g>`],
    "estrela": [I, `<g ${t}>
      <path d="M16 3 L19.6 11.6 L29 12.4 L22 18.6 L24.2 28 L16 23 L7.8 28 L10 18.6 L3 12.4 L12.4 11.6Z" fill="#fbbf24" ${G}/>
      <path d="M16 7 L18.4 13 L23 13.4 Q18 14 16 7Z" fill="#fef3c7" ${N}/>
    </g>`],
    "bau": [I, `<g ${t}>
      <path d="M4 14 Q4 6 16 6 Q28 6 28 14Z" fill="#7c4a22"/>
      <rect x="4" y="14" width="24" height="13" fill="#9a5f2e"/>
      <path d="M10 6.5 L10 27 M22 6.5 L22 27" stroke="#a8a29e" stroke-width="2.4"/>
      <rect x="13.5" y="12" width="5" height="6" rx="1" fill="#e0a82e"/>
    </g>`],
    "caveira": [I, `<g ${t}>
      <path d="M6 14 Q6 4 16 4 Q26 4 26 14 Q26 19 22 20 L22 25 L10 25 L10 20 Q6 19 6 14Z" fill="#e5e0d0"/>
      <circle cx="11.5" cy="14" r="3" fill="${TINTA}"/><circle cx="20.5" cy="14" r="3" fill="${TINTA}"/>
      <path d="M14 22 L14 25 M18 22 L18 25" stroke-width="1.2"/>
    </g>`],
    "caveira-chifres": [I, `<g ${t}>
      <path d="M8 10 Q2 6 3 1 Q6 6 11 7Z M24 10 Q30 6 29 1 Q26 6 21 7Z" fill="#b91c1c"/>
      <path d="M6 15 Q6 5 16 5 Q26 5 26 15 Q26 20 22 21 L22 26 L10 26 L10 21 Q6 20 6 15Z" fill="#e5e0d0"/>
      <circle cx="11.5" cy="15" r="3" fill="${TINTA}"/><circle cx="20.5" cy="15" r="3" fill="${TINTA}"/>
      <circle cx="11.5" cy="15" r="1.3" fill="#ef4444" ${N} ${G}/><circle cx="20.5" cy="15" r="1.3" fill="#ef4444" ${N} ${G}/>
    </g>`],
    "espadas-cruzadas": [I, `<g ${t}>
      <path d="M5 4 L8 4 L23 22 L21 24Z" fill="#d6dce4"/>
      <path d="M27 4 L24 4 L9 22 L11 24Z" fill="#d6dce4"/>
      ${o("M18 25 L25 18", "#e0a82e", 2.4)}${o("M14 25 L7 18", "#e0a82e", 2.4)}
      ${o("M23 25 L27 29", "#5a3a1f", 2)}${o("M9 25 L5 29", "#5a3a1f", 2)}
    </g>`],
    "fogueira": [I, `<g ${t}>
      <path d="M5 27 L27 23 M5 23 L27 27" stroke-width="4"/>
      <path d="M5 27 L27 23 M5 23 L27 27" stroke="#6b4226" stroke-width="2"/>
      <path d="M16 23 Q8 21 10 14 Q11 11 13 9 Q13 13 15 13 Q14 7 18 3 Q19 9 21 10 Q25 16 21 21 Q19 23 16 23Z" fill="#ea580c" ${G}/>
      <path d="M16 21 Q12 20 13 16 Q15 14 16 16 Q17 12 19 11 Q21 16 19 19Z" fill="#fde68a" ${N}/>
    </g>`],
    "bolsa": [I, `<g ${t}>
      <path d="M11 9 Q5 14 5 21 Q5 28 16 28 Q27 28 27 21 Q27 14 21 9Z" fill="#8a5a33"/>
      <path d="M9 14 Q12 11 15 11" stroke="#b07a46" stroke-width="2" fill="none"/>
      <path d="M11 9 L9 4 L13 6 L16 3 L19 6 L23 4 L21 9Z" fill="#6b4226"/>
      <path d="M10 9.5 L22 9.5" stroke="#e0a82e" stroke-width="2"/>
      <circle cx="16" cy="20" r="4" fill="#f5c451"/>
    </g>`],
    "interrogacao": [I, `<g ${t}>
      <circle cx="16" cy="16" r="13" fill="#3b1f5c"/>
      <circle cx="16" cy="16" r="10" fill="none" stroke="#a78bfa" stroke-width="1" stroke-dasharray="2 2"/>
      <path d="M11.5 12 Q12 7.5 16 7.5 Q20.5 7.5 20.5 11.5 Q20.5 14 17.5 15.5 Q16 16.5 16 19" fill="none" stroke="#e9d5ff" stroke-width="2.8" ${G}/>
      <circle cx="16" cy="23.5" r="1.8" fill="#e9d5ff" ${N}/>
    </g>`],
    "cabeca-dragao": [I, `<g ${t}>
      <path d="M19 9 Q22 2 30 1 Q24 6 23 11Z M15 9 Q15 3 20 0 Q18 5 19 9Z" fill="#e5e0d0"/>
      <path d="M28 18 Q28 9 19 8 Q10 8 3 13 Q2 17 4 19 Q12 21 20 20 Q28 22 28 18Z" fill="#9b1c1c"/>
      <path d="M6 12 Q12 9.5 19 10.5 Q11 11 6 14Z" fill="#dc2626" ${N}/>
      <path d="M4 19 Q12 21 22 20 L20 27 Q11 28 6 23Z" fill="#5a0e0e"/>
      <path d="M7 20.5 L8 23 L9.5 21 L11 23.5 L12.5 21.2 L14 23.5 L15.5 21.2" fill="none" stroke="#f1ead8" stroke-width="1.1"/>
      <path d="M12 14 Q15 12.5 18 14.2 Q15 16 12 14Z" fill="#fde047" ${N} ${G}/>
    </g>`],
    "marreta": [I, `<g ${t}>
      ${o("M8 28 L19 13", "#6b4226", 2.6)}
      <path d="M14 6 L24 4 L28 14 L18 16Z" fill="#78716c"/>
      <path d="M15 7 L23 5.5 L24.5 9 L16 10.5Z" fill="#a8a29e" ${N}/>
      <path d="M2 4 L6 8 M5 2 L7 6 M2 9 L5 10" stroke="#f87171" stroke-width="1.6"/>
    </g>`],
    "garras": [I, `<g fill="none">
      ${o("M6 4 Q14 14 10 28", "#f87171", 2.6)}${o("M14 3 Q22 14 18 29", "#f87171", 2.6)}${o("M22 4 Q29 14 26 27", "#f87171", 2.6)}
    </g>`],
    "gota-veneno": [I, `<g ${t}>
      <path d="M16 3 Q25 15 25 20 Q25 28 16 28 Q7 28 7 20 Q7 15 16 3Z" fill="#16a34a"/>
      <path d="M11 19 Q11 15 14 12" stroke="#bbf7d0" stroke-width="2" fill="none"/>
      <circle cx="13.5" cy="21" r="1.6" fill="${TINTA}" ${N}/><circle cx="18.5" cy="21" r="1.6" fill="${TINTA}" ${N}/>
    </g>`],
    "furia": [I, `<g ${t}>
      <path d="M13 3 L13 11 Q13 13 11 13 L3 13 M19 3 L19 11 Q19 13 21 13 L29 13 M13 29 L13 21 Q13 19 11 19 L3 19 M19 29 L19 21 Q19 19 21 19 L29 19" fill="none" stroke-width="5"/>
      <path d="M13 3 L13 11 Q13 13 11 13 L3 13 M19 3 L19 11 Q19 13 21 13 L29 13 M13 29 L13 21 Q13 19 11 19 L3 19 M19 29 L19 21 Q19 19 21 19 L29 19" fill="none" stroke="#ef4444" stroke-width="2.6"/>
    </g>`],
    "chama": [I, `<g ${t}>
      <path d="M16 30 Q5 28 6 18 Q7 12 11 9 Q11 15 14 15 Q12 8 18 2 Q19 9 22 11 Q28 16 26 23 Q24 30 16 30Z" fill="#ea580c" ${G}/>
      <path d="M16 27 Q10 26 11 20 Q13 17 15 19 Q16 13 20 11 Q24 18 22 23 Q20 27 16 27Z" fill="#fde047" ${N}/>
    </g>`],
    "explosao": [I, `<g ${t}>
      <path d="M16 2 L19 11 L28 6 L22 14 L30 18 L21 19 L24 29 L16 22 L8 29 L11 19 L2 18 L10 14 L4 6 L13 11Z" fill="#f97316" ${G}/>
      <path d="M16 9 L18 14 L23 13 L19 17 L22 22 L16 19 L10 22 L13 17 L9 13 L14 14Z" fill="#fde047" ${N}/>
    </g>`],
    "ervas": [I, `<g ${t}>
      ${o("M16 29 L16 12", "#3f6212", 1.8)}
      <path d="M16 18 Q6 18 5 9 Q14 9 16 18Z" fill="#65a30d"/>
      <path d="M16 15 Q26 15 27 6 Q18 6 16 15Z" fill="#4d7c0f"/>
      <path d="M16 24 Q8 26 6 20 Q13 19 16 24Z" fill="#84cc16"/>
    </g>`],
    "punho": [I, `<g ${t}>
      <path d="M7 12 Q7 8 10 8 L23 8 Q27 8 27 12 L27 20 Q27 27 19 27 L13 27 Q7 27 7 20Z" fill="#c69a6d"/>
      <path d="M12 8 L12 14 M17 8 L17 14 M22 8 L22 14" stroke-width="1.4"/>
      <path d="M7 16 Q12 15 15 18" fill="none" stroke-width="1.6"/>
      <path d="M9 11 Q14 9.5 25 10" stroke="#e8c9a3" stroke-width="1.4" fill="none"/>
    </g>`],
    "peitoral": [I, `<g ${t}>
      <path d="M6 6 L12 4 Q16 8 20 4 L26 6 L27 14 L24 15 L23 28 L9 28 L8 15 L5 14Z" fill="#7b8494"/>
      <path d="M9 8 L13 6.5 Q16 10 19 6.5 L23 8 L23 12 Q16 15 9 12Z" fill="#a7b0bd" ${N}/>
      <path d="M16 13 L16 27" stroke-width="1.2"/>
    </g>`],
    "livro": [I, `<g ${t}>
      <path d="M4 6 L15 8 L15 28 L4 26Z" fill="#1e40af"/>
      <path d="M28 6 L17 8 L17 28 L28 26Z" fill="#1d4ed8"/>
      <path d="M6 10 L13 11 M6 14 L13 15 M19 11 L26 10 M19 15 L26 14" stroke="#bfdbfe" stroke-width="1.2"/>
      <path d="M15 8 L17 8 L17 28 L15 28Z" fill="#e0a82e"/>
    </g>`],
    "livro-vermelho": [I, `<g ${t}>
      <path d="M6 4 L24 4 Q27 4 27 7 L27 28 L9 28 Q6 28 6 25Z" fill="#991b1b"/>
      <path d="M9 25 L27 25 L27 28 L9 28Z" fill="#f1ead8"/>
      <path d="M10 6 L10 23" stroke="#e0a82e" stroke-width="1.6"/>
      <circle cx="18" cy="14" r="4" fill="#e0a82e"/><circle cx="18" cy="14" r="1.6" fill="#991b1b" ${N}/>
    </g>`],
    "brilho": [I, `<g ${t}>
      <path d="M16 2 L19 13 L30 16 L19 19 L16 30 L13 19 L2 16 L13 13Z" fill="#fde047" ${G}/>
      <path d="M16 8 L17.5 14.5 L24 16 L17.5 17.5 L16 24 L14.5 17.5 L8 16 L14.5 14.5Z" fill="#fffbeb" ${N}/>
    </g>`],
    "elmo": [I, `<g ${t}>
      <path d="M6 18 Q6 5 16 5 Q26 5 26 18 L26 26 L19 26 L19 19 L13 19 L13 26 L6 26Z" fill="#7b8494"/>
      <path d="M9 14 Q9 8 16 7.5 Q22 8 23 12 Q16 9 9 15Z" fill="#a7b0bd" ${N}/>
      <path d="M8 16 L24 16" stroke-width="2.2"/>
    </g>`],
    "elmo-pluma": [I, `<g ${t}>
      <path d="M16 6 Q22 0 30 3 Q24 5 20 9Z" fill="#dc2626"/>
      <path d="M6 18 Q6 6 16 6 Q26 6 26 18 L26 27 L6 27Z" fill="#7b8494"/>
      <path d="M9 15 Q9 9 16 8.5 Q22 9 23 13 Q16 10 9 16Z" fill="#a7b0bd" ${N}/>
      <path d="M10 17 L22 17 M16 17 L16 24" stroke-width="2.6"/>
    </g>`],
    "mapa": [I, `<g ${t}>
      <path d="M3 7 L11 4 L21 7 L29 4 L29 25 L21 28 L11 25 L3 28Z" fill="#e8d7a8"/>
      <path d="M11 4 L11 25 M21 7 L21 28" stroke-width="1.2"/>
      <path d="M6 20 Q10 14 15 17 Q19 20 24 12" fill="none" stroke="#b91c1c" stroke-width="1.6" stroke-dasharray="2 2"/>
      <path d="M22 9 L26 13 M26 9 L22 13" stroke="#b91c1c" stroke-width="1.8"/>
    </g>`],
    "bussola": [I, `<g ${t}>
      <circle cx="16" cy="16" r="13" fill="#c98a16"/>
      <circle cx="16" cy="16" r="10" fill="#f1ead8"/>
      <path d="M16 6 L19 16 L16 26 L13 16Z" fill="#b91c1c"/>
      <path d="M16 16 L19 16 L16 26 L13 16Z" fill="#475569" ${N}/>
      <circle cx="16" cy="16" r="1.6" fill="#e0a82e"/>
    </g>`],
    "espada-fogo": [I, `<g ${t}>
      <path d="M6 18 Q4 10 12 6 Q10 12 14 12 Q14 4 22 2 Q20 8 24 10 Q30 14 26 20Z" fill="#f97316" opacity=".85" ${G}/>
      <path d="M8 22 L22 7 L26 6 L25 10 L10 24Z" fill="#fde68a"/>
      ${o("M5 19 L13 27", "#e0a82e", 3)}${o("M8 24 L4 28", "#5a3a1f", 2.4)}
    </g>`],
    "escudo-escamas": [I, `<g ${t}>
      <path d="M16 3 L27 7 Q27 20 16 29 Q5 20 5 7Z" fill="#2f6b3a"/>
      <path d="M9 10 Q11 13 13 10 Q15 13 17 10 Q19 13 21 10 Q23 13 24 10 M9 15 Q11 18 13 15 Q15 18 17 15 Q19 18 21 15 Q23 18 23 15 M11 20 Q13 23 15 20 Q17 23 19 20 Q21 23 21 20" fill="none" stroke="#9bc46a" stroke-width="1.3"/>
    </g>`],
    "amuleto-presa": [I, `<g ${t}>
      <path d="M6 3 Q16 14 26 3" fill="none" stroke="#a8a29e" stroke-width="1.6"/>
      <path d="M10 13 Q16 10 22 13 L20 24 Q16 30 12 24Z" fill="#3f3f46"/>
      <circle cx="16" cy="16" r="3.6" fill="#dc2626" ${G}/>
      <path d="M13 22 L14 27 L15.5 22Z M16.5 22 L18 27 L19 22Z" fill="#f8f4ea" stroke-width="1"/>
    </g>`],
    "botas": [I, `<g ${t}>
      <path d="M8 3 L18 3 L18 18 L27 22 Q29 24 28 28 L8 28Z" fill="#6b4226"/>
      <path d="M10 5 L16 5 L16 12 L10 12Z" fill="#875533" ${N}/>
      <path d="M8 24 L28 24" stroke-width="2"/>
      <path d="M8 8 L18 8" stroke="#e0a82e" stroke-width="1.6"/>
    </g>`],
    "anel": [I, `<g ${t}>
      <ellipse cx="16" cy="20" rx="10" ry="8" fill="none" stroke-width="5"/>
      <ellipse cx="16" cy="20" rx="10" ry="8" fill="none" stroke="#e0a82e" stroke-width="2.6"/>
      <path d="M11 8 L16 3 L21 8 L16 13Z" fill="#38bdf8" ${G}/>
    </g>`],
    "coracao-troll": [I, `<g ${t}>
      <path d="M16 28 Q4 19 4 11 Q4 5 10 5 Q14 5 16 9 Q18 5 22 5 Q28 5 28 11 Q28 19 16 28Z" fill="#4d7c0f"/>
      <path d="M10 12 L15 18 L13 20 L18 24" fill="none" stroke="#bef264" stroke-width="1.4"/>
      <path d="M11 13 L9 15 M14 17 L12 18 M16 21 L14 23" stroke-width="1"/>
    </g>`],
    "gota-sangue": [I, `<g ${t}>
      <path d="M16 3 Q25 15 25 20 Q25 28 16 28 Q7 28 7 20 Q7 15 16 3Z" fill="#b91c1c"/>
      <path d="M11 19 Q11 15 14 12" stroke="#fca5a5" stroke-width="2" fill="none"/>
      <path d="M17 18 Q21 20 20 24 Q17 22 17 18Z" fill="#fbbf24" ${N} ${G}/>
    </g>`],
    "gota-agua": [I, `<g ${t}>
      <path d="M16 3 Q25 15 25 20 Q25 28 16 28 Q7 28 7 20 Q7 15 16 3Z" fill="#38bdf8"/>
      <path d="M11 19 Q11 15 14 12" stroke="#e0f2fe" stroke-width="2" fill="none"/>
    </g>`],
    "runa": [I, `<g ${t}>
      <path d="M7 5 L25 4 L27 27 L5 28Z" fill="#57534e"/>
      <path d="M9 7 L23 6.5 L24 10 L9 11Z" fill="#78716c" ${N}/>
      <path d="M18 8 L11 17 L16 17 L13 25 L21 14 L16 14Z" fill="#7dd3fc" ${N} ${G}/>
    </g>`],
    "espinhos": [I, `<g ${t}>
      <path d="M2 10 L7 9 M30 10 L25 9 M5 4 L9 7 M27 4 L23 7 M16 1 L16 5 M3 18 L7 17 M29 18 L25 17" stroke-width="2.2"/>
      <path d="M7 7 L13 5 Q16 8 19 5 L25 7 L25 15 L23 16 L22 28 L10 28 L9 16 L7 15Z" fill="#4d7c0f"/>
      <path d="M10 9 L14 7.5 Q16 10 18 7.5 L22 9 L22 12 Q16 15 10 12Z" fill="#84cc16" ${N}/>
    </g>`],
    "machado": [I, `<g ${t}>
      ${o("M7 29 L22 6", "#6b4226", 2.4)}
      <path d="M18 5 Q29 3 30 15 Q24 14 21 17 Q19 11 15 10Z" fill="#b91c1c"/>
      <path d="M20 7 Q27 6 28 12" stroke="#fca5a5" stroke-width="1.4" fill="none"/>
    </g>`],
    "olho-alvo": [I, `<g ${t}>
      <path d="M2 16 Q16 3 30 16 Q16 29 2 16Z" fill="#f1ead8"/>
      <circle cx="16" cy="16" r="6" fill="#b45309"/><circle cx="16" cy="16" r="2.6" fill="${TINTA}" ${N}/>
      <path d="M16 3 L16 8 M16 24 L16 29 M3 16 L7 16 M25 16 L29 16" stroke="#dc2626" stroke-width="1.8"/>
    </g>`],
    "pena": [I, `<g ${t}>
      <path d="M26 3 Q10 6 6 26 Q22 24 26 3Z" fill="#ea580c" ${G}/>
      <path d="M24 6 Q14 10 11 22 Q20 18 24 6Z" fill="#fde047" ${N}/>
      ${o("M4 29 L22 8", "#7c2d12", 1.3)}
    </g>`],
    "adaga": [I, `<g ${t}>
      <path d="M10 20 L23 6 L26 6 L26 9 L13 23Z" fill="#d6dce4"/>
      <path d="M23 8 L13 19" stroke="#4ade80" stroke-width="1.8" ${G}/>
      ${o("M8 17 L15 24", "#3f3f46", 2.4)}${o("M10 22 L5 27", "#5a3a1f", 2.4)}
      <path d="M21 13 Q21 17 19.5 18 Q18 17 19 14Z" fill="#4ade80" ${N} ${G}/>
    </g>`],
    "frasco": [I, `<g ${t}>
      <rect x="13" y="2" width="6" height="5" rx="1" fill="#8a5a33"/>
      <path d="M13 7 h6 v3 a10 10 0 1 1 -6 0Z" fill="#dbe4ee" fill-opacity=".55"/>
      <path d="M8 20 a8 8 0 0 0 16 0Z" fill="#a855f7" ${N} ${G}/>
      <g fill="#e9d5ff" ${N}><circle cx="13" cy="17" r="1.4"/><circle cx="18" cy="14" r="1"/></g>
    </g>`],
    "cristal": [I, `<g ${t}>
      <path d="M16 2 L24 12 L20 29 L12 29 L8 12Z" fill="#c026d3" ${G}/>
      <path d="M16 2 L16 29 M8 12 L24 12" stroke-width="1.2"/>
      <path d="M16 3 L22 12 L16 12Z" fill="#f5d0fe" ${N}/>
    </g>`],
    "capa": [I, `<g ${t}>
      <path d="M11 3 L21 3 Q22 8 26 10 Q28 20 27 29 L5 29 Q4 20 6 10 Q10 8 11 3Z" fill="#1e1b2e"/>
      <path d="M11 3 Q16 8 21 3" fill="#3b0d4d"/>
      <path d="M9 12 Q8 20 9 27" stroke="#4c3d6e" stroke-width="2" fill="none"/>
    </g>`],
    "coroa": [I, `<g ${t}>
      <path d="M4 24 L3 9 L10 15 L16 5 L22 15 L29 9 L28 24Z" fill="#e0a82e"/>
      <path d="M5 12 L10 17 L16 8 L22 17 L27 12 L27 15 L22 19 L16 11 L10 19 L5 15Z" fill="#fde68a" ${N}/>
      <rect x="4" y="24" width="24" height="4" fill="#c98a16"/>
      <circle cx="16" cy="19" r="2" fill="#dc2626"/>
    </g>`],
    "talisma": [I, `<g ${t}>
      <path d="M8 3 Q16 9 24 3" fill="none" stroke="#a8a29e" stroke-width="1.4"/>
      <circle cx="16" cy="18" r="11" fill="#1d4ed8"/>
      <circle cx="16" cy="18" r="7.5" fill="#f8fafc" ${N}/>
      <circle cx="16" cy="18" r="4.5" fill="#38bdf8" ${N}/>
      <circle cx="16" cy="18" r="2" fill="${TINTA}" ${N}/>
    </g>`],
    "altar": [I, `<g ${t}>
      <ellipse cx="16" cy="12" rx="10" ry="7" fill="#dc2626" opacity=".35" ${N} ${G}/>
      <path d="M5 18 L27 18 L25 29 L7 29Z" fill="#292524"/>
      <path d="M4 16 L28 16 L28 19 L4 19Z" fill="#44403c"/>
      <rect x="14" y="8" width="4" height="8" fill="#e7e0cf"/>
      <path d="M16 3 Q18 6 16 8 Q14 6 16 3Z" fill="#f97316" ${G}/>
      <path d="M11 23 L21 23" stroke="#dc2626" stroke-width="1.6" ${G}/>
    </g>`],
    "fonte": [I, `<g ${t}>
      <path d="M16 3 Q18 7 16 9 Q14 7 16 3Z M10 9 Q8 13 11 15 M22 9 Q24 13 21 15" fill="#7dd3fc" stroke-width="1.2"/>
      <rect x="14" y="9" width="4" height="10" fill="#a8a29e"/>
      <path d="M3 19 L29 19 L26 28 L6 28Z" fill="#78716c"/>
      <path d="M5 19 L27 19 L26 22 L6 22Z" fill="#38bdf8" ${N} ${G}/>
    </g>`],
    "lampiao": [I, `<g ${t}>
      ${o("M16 2 L16 6", "#3f3f46", 1.8)}
      <path d="M10 6 L22 6 L20 10 L12 10Z" fill="#3f3f46"/>
      <path d="M11 10 L21 10 L22 24 L10 24Z" fill="#fbbf24" ${G}/>
      <path d="M11 10 L11 24 M21 10 L21 24 M16 10 L16 24" stroke-width="1.4"/>
      <path d="M9 24 L23 24 L22 28 L10 28Z" fill="#3f3f46"/>
    </g>`],
    "ossos": [I, `<g ${t}>
      ${o("M5 29 L27 19", "#e5e0d0", 3)}${o("M5 19 L27 29", "#e5e0d0", 3)}
      <path d="M9 11 Q9 2 16 2 Q23 2 23 11 Q23 14 20 15 L20 18 L12 18 L12 15 Q9 14 9 11Z" fill="#e5e0d0"/>
      <circle cx="13" cy="10" r="2.2" fill="${TINTA}"/><circle cx="19" cy="10" r="2.2" fill="${TINTA}"/>
    </g>`],
    "lua": [I, `<g ${t}>
      <path d="M20 3 Q8 4 7 16 Q8 28 21 29 Q12 24 12 16 Q12 8 20 3Z" fill="#fde68a" ${G}/>
      <g fill="#e0f2fe" ${N}><circle cx="24" cy="9" r="1.2"/><circle cx="27" cy="17" r="1"/><circle cx="22" cy="23" r=".9"/></g>
    </g>`],
    "pegadas": [I, `<g ${t}>
      <ellipse cx="10" cy="22" rx="4" ry="6" fill="#78716c"/><ellipse cx="21" cy="11" rx="4" ry="6" fill="#78716c"/>
      <g fill="#78716c"><circle cx="7" cy="14" r="1.4"/><circle cx="10" cy="13" r="1.4"/><circle cx="13" cy="14" r="1.4"/><circle cx="18" cy="3.5" r="1.3"/><circle cx="21" cy="2.5" r="1.3"/><circle cx="24" cy="3.5" r="1.3"/></g>
    </g>`],
    "pergaminho": [I, `<g ${t}>
      <path d="M7 5 L24 5 L24 26 L7 26Z" fill="#e8d7a8"/>
      <rect x="5" y="3" width="21" height="4" rx="2" fill="#c9b27a"/>
      <rect x="5" y="25" width="21" height="4" rx="2" fill="#c9b27a"/>
      <path d="M10 11 L21 11 M10 15 L21 15 M10 19 L17 19" stroke-width="1.2"/>
    </g>`],
    "trofeu": [I, `<g ${t}>
      <path d="M9 4 L23 4 L22 14 Q16 20 10 14Z" fill="#e0a82e"/>
      <path d="M9 6 Q3 6 4 11 Q5 15 10 14 M23 6 Q29 6 28 11 Q27 15 22 14" fill="none" stroke-width="2"/>
      <path d="M14 17 L18 17 L18 23 L14 23Z" fill="#c98a16"/>
      <path d="M9 23 L23 23 L24 28 L8 28Z" fill="#78716c"/>
      <path d="M12 6 L13 12" stroke="#fef3c7" stroke-width="1.6"/>
    </g>`],
    "tocha": [I, `<g ${t}>
      ${o("M16 29 L16 14", "#6b4226", 3)}
      <path d="M11 13 L21 13 L20 16 L12 16Z" fill="#78716c"/>
      <path d="M16 13 Q9 12 11 6 Q12 4 13 3 Q13 7 15 7 Q15 3 18 1 Q19 5 21 7 Q23 11 16 13Z" fill="#f97316" ${G}/>
    </g>`],
    "relogio": [I, `<g ${t}>
      <path d="M8 3 L24 3 L24 6 Q24 12 18 16 Q24 20 24 26 L24 29 L8 29 L8 26 Q8 20 14 16 Q8 12 8 6Z" fill="#dbe4ee" fill-opacity=".55"/>
      <path d="M11 7 L21 7 Q20 11 16 13 Q12 11 11 7Z M11 26 Q12 21 16 20 Q20 21 21 26Z" fill="#e0a82e" ${N}/>
      <rect x="6" y="2" width="20" height="3" fill="#6b4226"/><rect x="6" y="27" width="20" height="3" fill="#6b4226"/>
    </g>`],
  };

  // ==========================================================
  // LIGAÇÕES ENTRE O JOGO E OS SPRITES
  // (o jogo continua usando seus nomes/ids; aqui só traduzimos)
  // ==========================================================
  const INIMIGOS = {
    "Rato Gigante": "rato", "Morcego": "morcego", "Esqueleto": "esqueleto", "Goblin": "goblin", "Aranha": "aranha",
    "Cogumelo Tóxico": "cogumelo", "Lobo das Cavernas": "lobo", "Orc": "orc", "Gosma": "gosma", "Troll": "troll",
    "Serpente": "serpente", "Escorpião": "escorpiao", "Fantasma": "fantasma", "Cavaleiro Afogado": "cavaleiro-afogado", "Gárgula": "gargula",
    "Diabrete": "diabrete", "Elemental de Fogo": "elemental", "Golem de Pedra": "golem", "Demônio": "demonio", "Cão Infernal": "cao",
    "Olho do Vazio": "olho", "Espectro": "espectro", "Abominação": "abominacao", "Cavaleiro Sombrio": "cavaleiro-sombrio", "Lich": "lich",
    "Mímico": "mimico",
    "Morgrath, o Dragão Verde": "dragao-verde", "Hrimvald, o Wyrm de Gelo": "wyrm-gelo", "Tempestra, a Dragoa do Trovão": "dragoa-trovao",
    "Ignaroth, o Ancião Rubro": "anciao-rubro", "Nihilux, o Dragão do Vazio": "dragao-vazio",
  };
  const VOADORES = new Set(["morcego", "fantasma", "olho", "espectro", "diabrete", "elemental"]);

  const RELIQUIAS = {
    lamina: "espada-fogo", escudo: "escudo-escamas", vampiro: "amuleto-presa", botas: "botas", anel: "anel",
    troll: "coracao-troll", elmo: "elmo", sangue: "gota-sangue", runa: "runa", bolsa: "bolsa", espinhos: "espinhos",
    berserker: "machado", olho: "olho-alvo", fenix: "pena", adaga: "adaga", alquimista: "frasco", gemea: "espadas-cruzadas",
    tomo: "livro-vermelho", cristal: "cristal", capa: "capa", coroa: "coroa", talisma: "talisma",
  };
  const RARIDADE_RELIQ = {
    lamina: "comum", botas: "comum", elmo: "comum", sangue: "comum", bolsa: "comum", tomo: "comum", adaga: "comum", alquimista: "comum",
    escudo: "rara", anel: "rara", troll: "rara", runa: "rara", espinhos: "rara", gemea: "rara", capa: "rara", talisma: "rara",
    vampiro: "epica", berserker: "epica", olho: "epica", cristal: "epica",
    fenix: "lendaria", coroa: "lendaria",
  };
  const GUILDA = {
    vigor: "coracao", forca: "punho", armadura: "peitoral", precisao: "alvo", agilidade: "vento", alquimia: "pocao",
    ganancia: "moedas", sabedoria: "livro", saque: "escama", bencao: "brilho", escudeiro: "elmo-pluma", mapa: "mapa", batedor: "bussola",
  };
  const CARTAS = { atk: "espada", hp: "coracao", def: "escudo", crit: "alvo", esq: "vento", critm: "explosao", pocao: "ervas", cura: "coracao-brilho" };
  const RARIDADE_CARTA = { atk: "comum", hp: "comum", def: "comum", crit: "rara", esq: "rara", pocao: "rara", critm: "epica", cura: "epica" };
  const SALAS = { combate: "espadas-cruzadas", elite: "caveira-chifres", tesouro: "bau", fogueira: "fogueira", mercador: "bolsa", evento: "interrogacao", chefe: "cabeca-dragao" };
  const EVENTOS = { altar: "altar", fonte: "fonte", bau: "bau", ermitao: "lampiao", restos: "ossos", pagina: "pergaminho", ferreiro: "marreta", prisioneiro: "elmo", santuario: "escama" };
  const LOJA = { pocao: "pocao", cura: "coracao-brilho", afiar: "espada", vigor: "gota-sangue" };
  const INTENCOES = { atk: "espada", pesado: "marreta", multi: "garras", defesa: "escudo", veneno: "gota-veneno", cura: "coracao-verde", furia: "furia", sopro: "chama", atordoado: "estrela" };
  // Emojis que o jogo passa para a tela de resultado → sprite equivalente
  const EMOJIS = {
    "😴": "lua", "🗡️": "espada", "🌿": "ervas", "💰": "bau-aberto", "🩸": "gota-sangue", "🚶": "pegadas", "💧": "gota-agua",
    "🧪": "pocao", "🎒": "bolsa", "🛡️": "escudo", "🗝️": "elmo-pluma", "💠": "escama", "🕷️": "aranha", "⚰️": "lapide", "📜": "pergaminho", "🎁": "bau-aberto", "📦": "mimico",
  };

  // ==========================================================
  // MONTAGEM
  // ==========================================================
  function instalar() {
    const defs = `<defs>
      <filter id="arte-brilho" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="1.4" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>`;
    const simbolos = Object.entries(SPRITES)
      .map(([id, [vb, corpo]]) => `<symbol id="spr-${id}" viewBox="${vb}" overflow="visible">${corpo}</symbol>`).join("");
    document.body.insertAdjacentHTML("afterbegin",
      `<svg id="arte-folha" width="0" height="0" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true">${defs}${simbolos}</svg>`);
  }

  // Desenha um sprite. Se houver imagem externa registrada, usa a imagem.
  function sprite(id, classe = "", titulo = "") {
    if (!SPRITES[id] && !ARTE_EXTERNA[id]) id = "interrogacao";
    const alt = titulo ? ` aria-label="${titulo}" role="img"` : ` aria-hidden="true"`;
    if (ARTE_EXTERNA[id]) return `<img class="spr ${classe}" src="${ARTE_EXTERNA[id]}" alt="${titulo}" draggable="false">`;
    const [, , w, h] = SPRITES[id][0].split(" ");
    return `<svg class="spr spr-${id} ${classe}" viewBox="0 0 ${w} ${h}"${alt}><use href="#spr-${id}" width="${w}" height="${h}"/></svg>`;
  }

  // ==========================================================
  // CENÁRIOS (fundos em camadas por bioma)
  // ==========================================================
  const PALETAS = [
    { ceu: ["#1a1712", "#0b0a08"], longe: "#24201a", perto: "#15120e", chao: "#2a241c", nevoa: "200,190,170", tocha: "#f59e0b" }, // catacumbas
    { ceu: ["#121a10", "#080b07"], longe: "#1b2616", perto: "#10170d", chao: "#1f2a18", nevoa: "160,220,140", tocha: "#a3e635" }, // cavernas
    { ceu: ["#0d1a1f", "#060c0f"], longe: "#13282e", perto: "#0b181c", chao: "#14262b", nevoa: "140,210,230", tocha: "#5eead4" }, // ruínas
    { ceu: ["#26100a", "#0e0604"], longe: "#33160d", perto: "#1c0b06", chao: "#2e140b", nevoa: "255,150,90", tocha: "#fb923c" },  // forja
    { ceu: ["#150f24", "#07050d"], longe: "#1e1633", perto: "#100b1d", chao: "#1a1330", nevoa: "190,160,255", tocha: "#c084fc" }, // vazio
    { ceu: ["#2a1d10", "#120c07"], longe: "#3a2816", perto: "#22170c", chao: "#3a2a18", nevoa: "255,200,140", tocha: "#fbbf24" }, // guilda
  ];
  // gerador pseudo-aleatório fixo (o cenário é sempre igual para o mesmo bioma)
  function semente(n) { let s = n * 9301 + 49297; return () => ((s = (s * 9301 + 49297) % 233280) / 233280); }

  function cenario(i) {
    const p = PALETAS[i] || PALETAS[0];
    const r = semente(i + 3);
    let longe = "", perto = "", extra = "";
    if (i === 0) { // Catacumbas: arcos, pilares e nichos de caveiras
      for (let x = -40; x < 840; x += 160) {
        longe += `<path d="M${x} 260 L${x} 120 Q${x + 80} 40 ${x + 160} 120 L${x + 160} 260 L${x + 140} 260 L${x + 140} 126 Q${x + 80} 64 ${x + 20} 126 L${x + 20} 260Z"/>`;
        for (let k = 0; k < 3; k++) extra += `<circle cx="${x + 50 + k * 30}" cy="${150 + (k % 2) * 14}" r="5" fill="#3a332a" opacity=".55"/>`;
      }
      perto += `<rect x="0" y="40" width="46" height="300"/><rect x="754" y="40" width="46" height="300"/><rect x="-10" y="30" width="66" height="22"/><rect x="744" y="30" width="66" height="22"/>`;
    } else if (i === 1) { // Cavernas: estalactites, estalagmites e cogumelos que brilham
      for (let x = 0; x < 820; x += 34 + r() * 30) longe += `<path d="M${x} 0 L${x + 12 + r() * 14} ${40 + r() * 90} L${x + 30 + r() * 10} 0Z"/>`;
      for (let x = 10; x < 820; x += 60 + r() * 60) perto += `<path d="M${x} 340 L${x + 14 + r() * 10} ${230 + r() * 50} L${x + 34} 340Z"/>`;
      for (let k = 0; k < 9; k++) { const x = 40 + r() * 720, y = 262 + r() * 20; extra += `<ellipse cx="${x}" cy="${y}" rx="${6 + r() * 6}" ry="4" fill="#a3e635" opacity=".55" filter="url(#arte-brilho)"/><rect x="${x - 1.5}" y="${y}" width="3" height="10" fill="#1f2a18"/>`; }
    } else if (i === 2) { // Ruínas submersas: colunas quebradas, água e algas
      for (let x = 30; x < 820; x += 150) {
        const h = 120 + r() * 110;
        longe += `<path d="M${x} 270 L${x} ${270 - h} L${x + 14} ${262 - h} L${x + 30} ${272 - h} L${x + 44} ${266 - h} L${x + 44} 270Z"/><rect x="${x - 6}" y="262" width="56" height="10"/>`;
        extra += `<path d="M${x + 60} 270 Q${x + 54} 240 ${x + 64} 220 Q${x + 70} 240 ${x + 62} 270" fill="#1f3d2a" opacity=".7"/>`;
      }
      extra += `<rect x="0" y="282" width="800" height="60" fill="#0e3b46" opacity=".45"/>`;
      for (let k = 0; k < 7; k++) extra += `<path d="M${40 + k * 115} ${296 + (k % 3) * 10} l40 0" stroke="#5eead4" stroke-width="2" opacity=".35" class="brilho-agua"/>`;
    } else if (i === 3) { // Forja abissal: correntes, bigornas e lava
      for (let x = 70; x < 800; x += 130) {
        const h = 60 + r() * 120;
        longe += `<path d="M${x} 0 L${x} ${h}" stroke="${p.longe}" stroke-width="6" stroke-dasharray="10 5"/>`;
        longe += `<circle cx="${x}" cy="${h + 8}" r="9" fill="none" stroke="${p.longe}" stroke-width="5"/>`;
      }
      perto += `<path d="M90 290 L170 290 L160 272 L190 262 L70 262 L100 272Z"/><path d="M640 290 L720 290 L710 272 L740 262 L620 262 L650 272Z"/>`;
      extra += `<rect x="0" y="292" width="800" height="50" fill="url(#lava-${i})"/>`;
      for (let k = 0; k < 6; k++) { const x = 60 + r() * 680; extra += `<path d="M${x} 300 l${10 + r() * 20} ${8 + r() * 14} l${-8} ${10}" stroke="#fb923c" stroke-width="2" fill="none" filter="url(#arte-brilho)" opacity=".8"/>`; }
    } else if (i === 4) { // Coração do vazio: rochas flutuantes, estrelas e uma fenda
      for (let k = 0; k < 60; k++) extra += `<circle cx="${r() * 800}" cy="${r() * 220}" r="${r() * 1.4 + .3}" fill="#e9d5ff" opacity="${.3 + r() * .6}"/>`;
      extra += `<ellipse cx="400" cy="120" rx="70" ry="110" fill="#7c3aed" opacity=".18" filter="url(#arte-brilho)"/><path d="M400 30 Q390 120 404 210" stroke="#c084fc" stroke-width="2" opacity=".6" filter="url(#arte-brilho)"/>`;
      for (let k = 0; k < 6; k++) { const x = 60 + k * 130 + r() * 30, y = 50 + r() * 110, w = 30 + r() * 40; longe += `<path d="M${x} ${y} L${x + w} ${y - 6} L${x + w * 0.8} ${y + 22} L${x + w * 0.3} ${y + 30}Z"/>`; }
    } else { // Guilda: salão de madeira com estandartes
      for (let x = 0; x < 820; x += 100) longe += `<rect x="${x}" y="0" width="12" height="340"/>`;
      longe += `<rect x="0" y="60" width="800" height="14"/>`;
      for (const x of [150, 330, 470, 650]) extra += `<path d="M${x} 74 L${x + 44} 74 L${x + 44} 170 L${x + 22} 152 L${x} 170Z" fill="#6b1d1d" stroke="#140b06" stroke-width="2"/><path d="M${x + 22} 96 L${x + 30} 112 L${x + 22} 128 L${x + 14} 112Z" fill="#e0a82e" opacity=".85"/>`;
    }
    return `<svg class="cenario-svg" viewBox="0 0 800 340" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <linearGradient id="ceu-${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.ceu[0]}"/><stop offset="1" stop-color="${p.ceu[1]}"/></linearGradient>
        <linearGradient id="chao-${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.chao}"/><stop offset="1" stop-color="#050403"/></linearGradient>
        <linearGradient id="lava-${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f97316" stop-opacity=".55"/><stop offset="1" stop-color="#7c2d12" stop-opacity=".2"/></linearGradient>
        <radialGradient id="luz-${i}" cx="50%" cy="30%" r="60%"><stop offset="0" stop-color="${p.tocha}" stop-opacity=".16"/><stop offset="1" stop-color="${p.tocha}" stop-opacity="0"/></radialGradient>
      </defs>
      <rect width="800" height="340" fill="url(#ceu-${i})"/>
      <rect width="800" height="340" fill="url(#luz-${i})"/>
      <g fill="${p.longe}">${longe}</g>
      <path d="M0 262 Q400 250 800 262 L800 340 L0 340Z" fill="url(#chao-${i})"/>
      <path d="M0 262 Q400 250 800 262" stroke="#000" stroke-opacity=".5" stroke-width="2" fill="none"/>
      ${extra}
      <g fill="${p.perto}">${perto}</g>
    </svg>`;
  }
  const corTocha = i => (PALETAS[i] || PALETAS[0]).tocha;
  const corNevoa = i => (PALETAS[i] || PALETAS[0]).nevoa;

  // ==========================================================
  // PORTAS (arcos de pedra com visual por tipo de sala)
  // ==========================================================
  const PORTAS = {
    combate:  { madeira: "#5a3a1f", madeira2: "#6f4826", ferro: "#4b4f55", luz: "#f59e0b" },
    elite:    { madeira: "#2b2622", madeira2: "#3a332d", ferro: "#7f1d1d", luz: "#ef4444", espinhos: true },
    tesouro:  { madeira: "#6b4a1a", madeira2: "#8a6224", ferro: "#c98a16", luz: "#fde047" },
    fogueira: { aberta: true, luz: "#fb923c" },
    mercador: { cortina: "#2f5d3a", cortina2: "#3f7a4d", luz: "#fbbf24" },
    evento:   { madeira: "#2a1f3d", madeira2: "#3a2b55", ferro: "#5b21b6", luz: "#a78bfa", runas: true },
    chefe:    { madeira: "#2a0e0e", madeira2: "#3d1414", ferro: "#18181b", luz: "#dc2626", espinhos: true, garras: true },
  };
  function porta(tipo) {
    const c = PORTAS[tipo] || PORTAS.combate;
    const g = `pl-${tipo}`;
    let folha = "";
    if (c.aberta) {
      folha = `<path d="M22 158 L22 62 Q22 22 60 22 Q98 22 98 62 L98 158Z" fill="url(#${g})"/>`;
    } else if (c.cortina) {
      folha = `<path d="M22 158 L22 62 Q22 22 60 22 Q98 22 98 62 L98 158Z" fill="url(#${g})"/>
        <path d="M23 60 Q24 24 60 23 Q60 80 48 158 L23 158Z" fill="${c.cortina}" ${T}/>
        <path d="M97 60 Q96 24 60 23 Q62 80 74 158 L97 158Z" fill="${c.cortina2}" ${T}/>
        <path d="M30 70 Q34 110 30 150 M88 70 Q84 110 90 150" stroke="#1f3d26" stroke-width="2" fill="none"/>`;
    } else {
      folha = `<path d="M22 158 L22 62 Q22 22 60 22 Q98 22 98 62 L98 158Z" fill="url(#${g})"/>
        <path d="M23 158 L23 62 Q23 24 60 23 L84 26 Q86 60 86 158Z" fill="${c.madeira}" ${T}/>
        <path d="M37 32 L37 158 M51 25 L51 158 M65 24 L65 158 M78 26 L78 158" stroke="${c.madeira2}" stroke-width="3"/>
        <path d="M37 32 L37 158 M51 25 L51 158 M65 24 L65 158" stroke="#140b06" stroke-width="1" opacity=".6"/>
        <rect x="23" y="62" width="63" height="8" fill="${c.ferro}" ${T} stroke-width="1.6"/>
        <rect x="23" y="120" width="63" height="8" fill="${c.ferro}" ${T} stroke-width="1.6"/>
        <g fill="#d6d3d1" opacity=".7"><circle cx="30" cy="66" r="1.5"/><circle cx="58" cy="66" r="1.5"/><circle cx="80" cy="66" r="1.5"/><circle cx="30" cy="124" r="1.5"/><circle cx="58" cy="124" r="1.5"/><circle cx="80" cy="124" r="1.5"/></g>
        <circle cx="76" cy="96" r="4" fill="none" stroke="${c.ferro}" stroke-width="2.4"/>`;
      if (c.espinhos) folha += `<g fill="#a8a29e" ${T} stroke-width="1.2"><path d="M30 70 L33 80 L36 70Z M48 70 L51 80 L54 70Z M66 70 L69 80 L72 70Z M30 128 L33 138 L36 128Z M48 128 L51 138 L54 128Z M66 128 L69 138 L72 128Z"/></g>`;
      if (c.runas) folha += `<path d="M40 88 L46 80 L52 88 L46 96Z M60 100 L66 92 M60 92 L66 100 M44 140 L56 140 L50 130Z" stroke="#c4b5fd" stroke-width="2" fill="none" ${G}/>`;
      if (c.garras) folha += `<path d="M34 84 L54 112 M42 80 L62 108 M50 78 L70 104" stroke="#000" stroke-width="3" opacity=".7"/>`;
    }
    return `<svg class="porta-arte" viewBox="0 0 120 160" aria-hidden="true">
      <defs><radialGradient id="${g}" cx="72%" cy="75%" r="75%"><stop offset="0" stop-color="${c.luz}" stop-opacity=".95"/><stop offset=".55" stop-color="${c.luz}" stop-opacity=".35"/><stop offset="1" stop-color="#000" stop-opacity=".9"/></radialGradient></defs>
      <ellipse class="porta-halo" cx="60" cy="96" rx="58" ry="66" fill="${c.luz}" opacity=".12"/>
      <path d="M6 160 L6 60 Q6 4 60 4 Q114 4 114 60 L114 160Z" fill="#3b3631" ${T}/>
      <path d="M10 70 L22 70 M10 100 L22 100 M10 130 L22 130 M98 70 L110 70 M98 100 L110 100 M98 130 L110 130 M16 40 L27 46 M104 40 L93 46 M38 12 L42 24 M82 12 L78 24" stroke="#1f1b17" stroke-width="2"/>
      <path d="M10 60 Q10 10 60 8 Q30 14 18 40Z" fill="#57514a" opacity=".7"/>
      <path d="M52 3 L68 3 L66 20 L54 20Z" fill="#4a443d" ${T} stroke-width="1.6"/>
      ${folha}
      <path d="M86 158 L86 28 Q94 40 98 62 L98 158Z" fill="${c.luz}" opacity="${c.aberta || c.cortina ? 0 : .55}" ${G}/>
      <ellipse cx="60" cy="158" rx="54" ry="5" fill="${c.luz}" opacity=".35"/>
    </svg>`;
  }

  // Tocha de parede (chama animada por CSS)
  const tocha = () => `<svg viewBox="0 0 40 90" class="tocha-svg" aria-hidden="true">
    <path d="M14 40 L26 40 L23 90 L17 90Z" fill="#4a2f17" stroke="#140b06" stroke-width="2"/>
    <path d="M10 36 L30 36 L27 44 L13 44Z" fill="#57534e" stroke="#140b06" stroke-width="2"/>
    <g class="chama"><path d="M20 38 Q6 36 9 22 Q11 16 14 13 Q14 21 18 21 Q16 10 23 2 Q25 12 28 15 Q34 24 29 32 Q26 38 20 38Z" fill="var(--cor-tocha)"/>
    <path d="M20 35 Q13 34 14 27 Q16 23 18 25 Q19 18 23 15 Q27 22 25 28 Q23 34 20 35Z" fill="#fde68a"/></g>
  </svg>`;

  // ---------- API pública ----------
  window.ARTE = {
    sprite, cenario, porta, tocha, corTocha, corNevoa, ids: () => Object.keys(SPRITES),
    inimigo: nome => INIMIGOS[String(nome).replace(/ Campeão$/, "")] || "esqueleto",
    voa: id => VOADORES.has(id),
    ehIcone: id => !!SPRITES[id] && SPRITES[id][0] === I,
    reliquia: id => RELIQUIAS[id] || "brilho",
    raridadeReliquia: id => RARIDADE_RELIQ[id] || "comum",
    guilda: id => GUILDA[id] || "brilho",
    carta: id => CARTAS[id] || "estrela",
    raridadeCarta: id => RARIDADE_CARTA[id] || "comum",
    sala: tipo => SALAS[tipo] || "interrogacao",
    evento: id => EVENTOS[id] || "interrogacao",
    loja: id => LOJA[id] || "bolsa",
    intencao: tipo => INTENCOES[tipo] || "espada",
    emoji: e => EMOJIS[e] || "estrela",
  };
  instalar();
})();
