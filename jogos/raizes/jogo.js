// ==========================================================
// jogos/raizes/jogo.js — A LÓGICA DO "RAÍZES DE NEON"
//
// Um "survivors-like": o sobrevivente anda em direção ao mouse,
// as armas disparam sozinhas, as plantas vêm em ondas cada vez
// maiores e cada nível dá uma carta de melhoria. Armas no nível
// máximo + o módulo certo evoluem ao abrir uma Caixa de Suprimentos.
//
// Quer mexer no equilíbrio? Quase tudo está nas tabelas da seção 2:
// ARMAS, PASSIVOS, INIMIGOS, ONDAS e EVENTOS.
// ==========================================================
(() => {
  "use strict";

  // ========================================================
  // 1. UTILIDADES
  // ========================================================
  const $ = id => document.getElementById(id);
  const TAU = Math.PI * 2;
  const R = (a, b) => a + Math.random() * (b - a);
  const RI = (a, b) => Math.floor(a + Math.random() * (b - a + 1));
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const fmt = n => Math.floor(n).toLocaleString("pt-BR");
  const fmtTempo = s => { s = Math.max(0, Math.floor(s)); return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0"); };
  function angDif(a, b) { let d = (b - a) % TAU; if (d > Math.PI) d -= TAU; if (d < -Math.PI) d += TAU; return d; }
  const girarPara = (a, alvo, max) => a + clamp(angDif(a, alvo), -max, max);
  function sortearPeso(lista) {
    const total = lista.reduce((s, o) => s + o.peso, 0);
    let r = Math.random() * total;
    for (const o of lista) { r -= o.peso; if (r < 0) return o; }
    return lista[lista.length - 1];
  }
  function sortearChave(pesos) {
    let total = 0;
    for (const k in pesos) total += pesos[k];
    let r = Math.random() * total;
    for (const k in pesos) { r -= pesos[k]; if (r < 0) return k; }
    return Object.keys(pesos)[0];
  }

  // ========================================================
  // 2. DADOS
  // ========================================================
  const DURACAO = 600; // 10 minutos até a Árvore-Mãe

  // base: atributos do nível 1 • niveis: o que cada nível seguinte soma
  // evolui: { com: passivo necessário, em: arma evoluída }
  const ARMAS = {
    blaster: { tipo: "blaster", nome: "Blaster de Plasma", desc: "Atira plasma no inimigo mais próximo.",
      base: { dano: 16, recarga: 0.75, qtd: 1, perfura: 1, vel: 560, area: 1 },
      niveis: [
        { qtd: 1, txt: "+1 disparo por rajada." },
        { dano: 6, txt: "+6 de dano." },
        { perfura: 1, recarga: -0.15, txt: "Atravessa +1 planta e recarrega mais rápido." },
        { qtd: 1, dano: 6, txt: "+1 disparo e +6 de dano." },
      ], evolui: { com: "potencia", em: "fusao" } },
    fusao: { tipo: "blaster", evo: true, nome: "Canhão de Fusão", desc: "Rajadas de fusão gigantes que atravessam fileiras inteiras de plantas.",
      base: { dano: 40, recarga: 0.5, qtd: 3, perfura: 7, vel: 720, area: 1.7 } },

    chamas: { tipo: "chamas", nome: "Lança-chamas", desc: "Jatos de fogo em cone. Plantas odeiam fogo.",
      base: { dano: 9, recarga: 1.7, duracao: 1.6, area: 1 },
      niveis: [
        { dano: 3, txt: "+3 de dano." },
        { area: 0.25, txt: "+25% de alcance." },
        { duracao: 0.6, txt: "O jato dura +0,6s." },
        { dano: 4, recarga: -0.5, txt: "+4 de dano e recarrega 0,5s mais rápido." },
      ], evolui: { com: "amplificador", em: "inferno" } },
    inferno: { tipo: "chamas", evo: true, nome: "Inferno Azul", desc: "Fogo azul em duas direções que deixa as plantas queimando.",
      base: { dano: 18, recarga: 0.9, duracao: 2.4, area: 1.45, queima: 1 } },

    serras: { tipo: "serras", nome: "Serras Orbitais", desc: "Lâminas giratórias que orbitam ao seu redor.",
      base: { dano: 13, recarga: 2.2, duracao: 4.0, qtd: 2, area: 1, velRot: 3.0 },
      niveis: [
        { qtd: 1, txt: "+1 serra." },
        { dano: 6, duracao: 1, txt: "+6 de dano e giram 1s a mais." },
        { qtd: 1, velRot: 0.5, txt: "+1 serra e giram mais rápido." },
        { qtd: 1, dano: 6, txt: "+1 serra e +6 de dano." },
      ], evolui: { com: "bateria", em: "anel" } },
    anel: { tipo: "serras", evo: true, nome: "Anel Eterno", desc: "Serras douradas que nunca param de girar.",
      base: { dano: 26, recarga: 0, duracao: 1, qtd: 6, area: 1.3, velRot: 3.8, permanente: 1 } },

    pulso: { tipo: "pulso", nome: "Pulso EMP", desc: "Onda de choque que empurra e fere tudo ao redor.",
      base: { dano: 16, recarga: 2.6, area: 1, empurrao: 1 },
      niveis: [
        { dano: 6, txt: "+6 de dano." },
        { area: 0.25, txt: "+25% de raio." },
        { recarga: -0.5, empurrao: 0.4, txt: "Recarrega 0,5s mais rápido e empurra mais longe." },
        { dano: 8, area: 0.2, txt: "+8 de dano e +20% de raio." },
      ], evolui: { com: "blindagem", em: "colapso" } },
    colapso: { tipo: "pulso", evo: true, nome: "Colapso EMP", desc: "Pulsos gigantes que paralisam as plantas por um instante.",
      base: { dano: 42, recarga: 1.6, area: 1.9, empurrao: 1.6, atordoa: 0.8 } },

    misseis: { tipo: "misseis", nome: "Mísseis Teleguiados", desc: "Mísseis que perseguem plantas e explodem em área.",
      base: { dano: 22, recarga: 1.8, qtd: 1, area: 1, vel: 320 },
      niveis: [
        { qtd: 1, txt: "+1 míssil." },
        { dano: 8, txt: "+8 de dano." },
        { qtd: 1, area: 0.25, txt: "+1 míssil e explosão 25% maior." },
        { qtd: 1, recarga: -0.4, txt: "+1 míssil e recarrega 0,4s mais rápido." },
      ], evolui: { com: "refrigeracao", em: "chuva" } },
    chuva: { tipo: "misseis", evo: true, nome: "Chuva de Mísseis", desc: "Uma barragem incessante de mísseis.",
      base: { dano: 34, recarga: 1.1, qtd: 8, area: 1.5, vel: 400 } },

    tesla: { tipo: "tesla", nome: "Bobina Tesla", desc: "Raios que saltam de planta em planta.",
      base: { dano: 15, recarga: 1.4, qtd: 1, saltos: 3, area: 1 },
      niveis: [
        { saltos: 2, txt: "Salta em +2 plantas." },
        { dano: 7, txt: "+7 de dano." },
        { qtd: 1, txt: "+1 raio simultâneo." },
        { saltos: 3, recarga: -0.35, txt: "Salta +3 vezes e recarrega 0,35s mais rápido." },
      ], evolui: { com: "multiplicador", em: "tempestade" } },
    tempestade: { tipo: "tesla", evo: true, nome: "Tempestade Elétrica", desc: "Raios em cadeia e relâmpagos caindo do céu.",
      base: { dano: 32, recarga: 0.8, qtd: 3, saltos: 10, area: 1.3, ceu: 3 } },

    herbicida: { tipo: "herbicida", nome: "Granada Herbicida", desc: "Granadas que deixam poças tóxicas que ferem e deixam as plantas lentas.",
      base: { dano: 7, recarga: 2.8, qtd: 1, area: 1, duracao: 3 },
      niveis: [
        { qtd: 1, txt: "+1 granada." },
        { dano: 3, area: 0.2, txt: "+3 de dano e poça 20% maior." },
        { duracao: 1, recarga: -0.4, txt: "A poça dura +1s e recarrega 0,4s mais rápido." },
        { qtd: 1, dano: 3, txt: "+1 granada e +3 de dano." },
      ], evolui: { com: "nanobots", em: "nuvem" } },
    nuvem: { tipo: "herbicida", evo: true, nome: "Nuvem Nanotóxica", desc: "Nuvens de nanobots que caçam plantas sozinhas.",
      base: { dano: 16, recarga: 2.0, qtd: 4, area: 1.6, duracao: 5, segue: 1 } },

    drone: { tipo: "drone", nome: "Drone de Combate", desc: "Um drone fiel que atira lasers por conta própria.",
      base: { dano: 11, recarga: 0.7, qtd: 1, area: 1, perfura: 1 },
      niveis: [
        { dano: 4, txt: "+4 de dano." },
        { qtd: 1, txt: "+1 drone." },
        { recarga: -0.2, dano: 3, txt: "Atira mais rápido e +3 de dano." },
        { qtd: 1, txt: "+1 drone." },
      ], evolui: { com: "aprendizado", em: "enxame" } },
    enxame: { tipo: "drone", evo: true, nome: "Enxame Sentinela", desc: "Cinco drones com lasers perfurantes.",
      base: { dano: 21, recarga: 0.42, qtd: 5, area: 1, perfura: 4 } },

    laser: { tipo: "laser", nome: "Laser de Varredura", desc: "Um feixe longo que gira ao seu redor cortando tudo no caminho.",
      base: { dano: 18, recarga: 2.0, duracao: 3.0, qtd: 1, area: 1, velRot: 3.0 },
      niveis: [
        { dano: 6, txt: "+6 de dano." },
        { qtd: 1, txt: "+1 feixe." },
        { area: 0.25, duracao: 0.8, txt: "Feixe 25% mais longo e dura +0,8s." },
        { dano: 8, recarga: -0.6, txt: "+8 de dano e recarrega 0,6s mais rápido." },
      ], evolui: { com: "vitalidade", em: "prisma" } },
    prisma: { tipo: "laser", evo: true, nome: "Prisma Solar", desc: "Três feixes que nunca desligam. Cada planta cortada devolve um pouco de vida.",
      base: { dano: 30, recarga: 0, duracao: 1, qtd: 3, area: 1.35, velRot: 2.2, permanente: 1, cura: 0.4 } },

    disco: { tipo: "disco", nome: "Disco Bumerangue", desc: "Discos afiados que vão e voltam, cortando tudo duas vezes.",
      base: { dano: 18, recarga: 1.6, qtd: 1, area: 1, vel: 540 },
      niveis: [
        { dano: 6, txt: "+6 de dano." },
        { qtd: 1, txt: "+1 disco." },
        { area: 0.3, txt: "Discos 30% maiores e vão mais longe." },
        { qtd: 1, dano: 6, txt: "+1 disco e +6 de dano." },
      ], evolui: { com: "propulsor", em: "ciclone" } },
    ciclone: { tipo: "disco", evo: true, nome: "Ciclone de Lâminas", desc: "Discos dourados gigantes em vaivém sem fim, para todos os lados.",
      base: { dano: 36, recarga: 1.1, qtd: 5, area: 1.5, vel: 640 } },

    minas: { tipo: "minas", nome: "Minas de Proximidade", desc: "Arremessa minas que explodem quando uma planta pisa nelas.",
      base: { dano: 40, recarga: 1.8, qtd: 1, area: 1, duracao: 10 },
      niveis: [
        { dano: 14, txt: "+14 de dano." },
        { qtd: 1, txt: "+1 mina por arremesso." },
        { area: 0.3, txt: "Explosão 30% maior." },
        { qtd: 1, recarga: -0.4, txt: "+1 mina e recarrega 0,4s mais rápido." },
      ], evolui: { com: "ima", em: "singularidade" } },
    singularidade: { tipo: "minas", evo: true, nome: "Minas Gravitacionais", desc: "Minas que sugam as plantas próximas antes de detonar.",
      base: { dano: 85, recarga: 1.1, qtd: 3, area: 1.5, duracao: 12, puxa: 1 } },

    chicote: { tipo: "chicote", nome: "Chicote de Plasma", desc: "Um açoite de plasma de longo alcance para os lados.",
      base: { dano: 22, recarga: 1.3, qtd: 1, area: 1 },
      niveis: [
        { qtd: 1, txt: "Também corta para o lado oposto." },
        { dano: 8, txt: "+8 de dano." },
        { area: 0.25, txt: "Alcance 25% maior." },
        { dano: 8, recarga: -0.3, txt: "+8 de dano e golpeia mais rápido." },
      ], evolui: { com: "mira", em: "acoite" } },
    acoite: { tipo: "chicote", evo: true, nome: "Açoite Estelar", desc: "Golpes gigantes em quatro direções que sempre acertam críticos.",
      base: { dano: 46, recarga: 0.9, qtd: 4, area: 1.45, critico: 1 } },
  };
  const maxNivelArma = id => (ARMAS[id].evo ? 1 : ARMAS[id].niveis.length + 1);

  const PASSIVOS = {
    potencia:      { nome: "Módulo de Potência",      max: 5, por: "+10% de dano.",                       tot: n => `+${n * 10}% de dano` },
    refrigeracao:  { nome: "Refrigerador Criogênico", max: 5, por: "Armas recarregam 8% mais rápido.",    tot: n => `-${n * 8}% de recarga` },
    amplificador:  { nome: "Amplificador de Campo",   max: 5, por: "+10% de área de efeito.",             tot: n => `+${n * 10}% de área` },
    bateria:       { nome: "Bateria Estendida",       max: 5, por: "Efeitos duram 12% a mais.",           tot: n => `+${n * 12}% de duração` },
    blindagem:     { nome: "Placas de Blindagem",     max: 5, por: "+1 de armadura (reduz o dano recebido).", tot: n => `+${n} de armadura` },
    propulsor:     { nome: "Botas Propulsoras",       max: 5, por: "+8% de velocidade.",                  tot: n => `+${n * 8}% de velocidade` },
    nanobots:      { nome: "Nanorreparo",             max: 5, por: "Regenera +0,25 de vida por segundo.", tot: n => `+${(n * 0.25).toLocaleString("pt-BR")} vida/s` },
    ima:           { nome: "Ímã Gravitacional",       max: 5, por: "+25% de raio de coleta.",             tot: n => `+${n * 25}% de coleta` },
    multiplicador: { nome: "Duplicador Quântico",     max: 2, por: "+1 projétil em todas as armas.",      tot: n => `+${n} projétil` },
    aprendizado:   { nome: "Chip de Dados",           max: 5, por: "+8% de experiência.",                 tot: n => `+${n * 8}% de experiência` },
    vitalidade:    { nome: "Célula Vital",            max: 5, por: "+20 de vida máxima.",                 tot: n => `+${n * 20} de vida máxima` },
    mira:          { nome: "Mira Assistida",          max: 5, por: "+4% de chance de crítico (dano dobrado).", tot: n => `+${n * 4}% de crítico` },
  };

  // ia: comportamento • kb: resistência a empurrão (1 = normal, 0 = imóvel) • som: altura da sombra
  const INIMIGOS = {
    broto:     { nome: "Broto Mutante",     hp: 9,     vel: 74,  dano: 6,  r: 12, xp: 1, sy: 1.15, desc: "Fraco, mas nunca vem sozinho." },
    cipo:      { nome: "Cipó Rastejante",   hp: 22,    vel: 64,  dano: 8,  r: 14, xp: 2, sy: 0.9,  desc: "Serpenteia em bandos." },
    dioneia:   { nome: "Dioneia Saltadora", hp: 38,    vel: 50,  dano: 10, r: 17, xp: 3, sy: 1.2,  ia: "bote", desc: "Se prepara e dá um bote." },
    orquidea:  { nome: "Orquídea Volátil",  hp: 14,    vel: 108, dano: 12, r: 12, xp: 2, sy: 1.3,  ia: "kamikaze", desc: "Corre e explode ao tocar." },
    esporo:    { nome: "Fungo Esporífero",  hp: 30,    vel: 44,  dano: 9,  r: 16, xp: 4, sy: 1.15, ia: "atirador", desc: "Cospe esporos de longe." },
    cacto:     { nome: "Cacto Blindado",    hp: 120,   vel: 34,  dano: 14, r: 20, xp: 6, sy: 1.0,  ia: null, armadura: 3, kb: 0.3, desc: "Blindado. Solta espinhos ao morrer." },
    raiz:      { nome: "Raiz Emergente",    hp: 50,    vel: 0,   dano: 12, r: 14, xp: 3, sy: 1.1,  ia: "raiz", kb: 0, desc: "Brota do chão sob seus pés." },
    girassol:  { nome: "Girassol Solar",    hp: 55,    vel: 40,  dano: 11, r: 18, xp: 5, sy: 1.5,  ia: "girassol", desc: "Dispara sementes em leque." },
    cardo:     { nome: "Cardo Rolante",     hp: 34,    vel: 58,  dano: 11, r: 15, xp: 3, sy: 1.0,  ia: "rolar", desc: "Mira em você e sai rolando em disparada." },
    alada:     { nome: "Semente Alada",     hp: 6,     vel: 126, dano: 5,  r: 9,  xp: 1, sy: 2.2,  ia: "voo", bando: 5, desc: "Voa em revoadas rápidas e frágeis." },
    baoba:     { nome: "Baobá Andante",     hp: 360,   vel: 30,  dano: 22, r: 27, xp: 14, sy: 1.3, ia: "pisao", armadura: 2, kb: 0.12, desc: "Enorme e lento. Pisa forte quando chega perto." },
    barril:    { nome: "Barril de Suprimentos", hp: 22, vel: 0,  dano: 0,  r: 13, xp: 0, sy: 1.0,  ia: "parado", kb: 0, inofensivo: 1, fixo: 1 },
    rainha:    { nome: "Rainha Dioneia",    hp: 2600,  vel: 62,  dano: 22, r: 44, xp: 60,  sy: 1.1,  ia: "rainha", kb: 0, chefe: 1, desc: "Chefe dos 3 minutos." },
    colosso:   { nome: "Colosso de Cipós",  hp: 7000,  vel: 46,  dano: 26, r: 52, xp: 120, sy: 1.25, ia: "colosso", kb: 0, chefe: 1, desc: "Chefe dos 6 minutos." },
    matriarca: { nome: "Árvore-Mãe Ω",      hp: 22000, vel: 30,  dano: 32, r: 68, xp: 0,   sy: 1.2,  ia: "matriarca", kb: 0, chefe: 1, final: 1, desc: "A raiz de toda a praga." },
  };

  const PERSONAGENS = {
    kai:   { nome: "Kai Ferro",      papel: "Sobrevivente",        arma: "blaster",   custo: 0,    bonus: "Equilibrado em tudo." },
    iris:  { nome: "Dra. Íris Vale", papel: "Botânica rebelde",    arma: "herbicida", custo: 350,  area: 1.12, bonus: "+12% de área de efeito." },
    t07:   { nome: "Unidade T-07",   papel: "Androide de resgate", arma: "tesla",     custo: 800,  hp: 1.3, vel: 0.93, bonus: "+30% de vida, -7% de velocidade." },
    brasa: { nome: "Brasa",          papel: "Piromaníaca",         arma: "chamas",    custo: 1400, dano: 1.12, hp: 0.85, bonus: "+12% de dano, -15% de vida." },
    vega:  { nome: "Vega Ribeiro",   papel: "Batedora veloz",      arma: "disco",     custo: 2000, vel: 1.1, ima: 1.25, bonus: "+10% de velocidade e +25% de coleta." },
  };

  const OFICINA = [
    { id: "vida",     nome: "Reforço de Traje",    max: 5, custo: 60,  txt: "+10% de vida máxima",           ico: "vitalidade" },
    { id: "dano",     nome: "Calibragem de Armas", max: 5, custo: 80,  txt: "+5% de dano",                   ico: "potencia" },
    { id: "armadura", nome: "Placas Extras",       max: 3, custo: 120, txt: "+1 de armadura",                ico: "blindagem" },
    { id: "vel",      nome: "Servomotores",        max: 3, custo: 90,  txt: "+5% de velocidade",             ico: "propulsor" },
    { id: "recarga",  nome: "Dissipadores",        max: 3, custo: 110, txt: "-3% de recarga",                ico: "refrigeracao" },
    { id: "ima",      nome: "Bobina Magnética",    max: 3, custo: 60,  txt: "+15% de raio de coleta",        ico: "ima" },
    { id: "regen",    nome: "Kit Nanomédico",      max: 3, custo: 100, txt: "+0,2 de regeneração por segundo", ico: "nanobots" },
    { id: "xp",       nome: "Processador Neural",  max: 5, custo: 70,  txt: "+5% de experiência",            ico: "aprendizado" },
    { id: "sucata",   nome: "Garimpeiro",          max: 5, custo: 70,  txt: "+10% de sucata no fim",         ico: "sucata" },
    { id: "reroll",   nome: "Rádio Tático",        max: 3, custo: 150, txt: "+1 troca de cartas por partida", ico: "reroll" },
    { id: "revive",   nome: "Desfibrilador",       max: 1, custo: 500, txt: "Revive uma vez por partida",    ico: "revive" },
  ];
  const custoOficina = (u, nivel) => u.custo * (nivel + 1);

  // Ondas: até "ate" segundos, nascem "taxa" plantas por segundo, sorteadas pelos pesos
  // Ondas: até "ate" segundos, nascem "taxa" plantas por segundo, sorteadas pelos pesos.
  // Quem atira de longe (esporo, girassol) ficou raro: a pressão vem de plantas corpo a corpo.
  const ONDAS = [
    { ate: 45,       taxa: 2.2, tipos: { broto: 1 } },
    { ate: 90,       taxa: 2.9, tipos: { broto: 6, cipo: 2, alada: 0.5 } },
    { ate: 150,      taxa: 3.1, tipos: { broto: 5, cipo: 3, orquidea: 1, alada: 0.7 } },
    { ate: 180,      taxa: 3.4, tipos: { broto: 4, cipo: 3, dioneia: 2, orquidea: 1, cardo: 1 } },
    { ate: 240,      taxa: 3.1, tipos: { cipo: 4, dioneia: 3, cardo: 2, broto: 2, alada: 0.6, esporo: 0.4 } },
    { ate: 300,      taxa: 4.8, tipos: { broto: 3, cipo: 4, dioneia: 3, cardo: 2, orquidea: 1, alada: 0.6, esporo: 0.5 } },
    { ate: 360,      taxa: 5.8, tipos: { cipo: 3, dioneia: 3, cardo: 2, cacto: 2, orquidea: 2, baoba: 0.5, esporo: 0.4 } },
    { ate: 420,      taxa: 5.6, tipos: { dioneia: 3, cardo: 3, cacto: 3, broto: 2, baoba: 0.7, alada: 0.8, girassol: 0.4 } },
    { ate: 480,      taxa: 7.8, tipos: { broto: 4, dioneia: 3, cacto: 3, cardo: 3, orquidea: 2, baoba: 0.9, alada: 0.8, girassol: 0.5 } },
    { ate: 540,      taxa: 9.6, tipos: { cipo: 4, dioneia: 3, cacto: 3, cardo: 3, orquidea: 3, baoba: 1.1, alada: 1, girassol: 0.6, esporo: 0.5 } },
    { ate: 600,      taxa: 12,  tipos: { broto: 6, cipo: 4, dioneia: 4, cacto: 4, cardo: 4, orquidea: 3, baoba: 1.4, alada: 1, girassol: 0.6 } },
    { ate: Infinity, taxa: 4.5, tipos: { broto: 4, cipo: 3, dioneia: 2, orquidea: 2, cardo: 2 } },
  ];
  // [segundo, tipo, ...parâmetros] — precisa ficar em ordem de tempo
  const EVENTOS = [
    [60, "elite"], [100, "cerco", "broto", 26], [120, "revoada", "alada", 30], [140, "elite"],
    [170, "aviso", "rainha"], [180, "chefe", "rainha"],
    [215, "raizes", 6], [240, "elite"], [255, "estouro", "cardo", 10], [270, "enxame", "orquidea", 14], [300, "elite"], [320, "cerco", "cipo", 30],
    [350, "aviso", "colosso"], [360, "chefe", "colosso"],
    [390, "revoada", "alada", 45], [400, "elite"], [420, "estouro", "cardo", 14], [440, "enxame", "orquidea", 18], [455, "cerco", "dioneia", 24], [480, "elite"],
    [500, "tanques", "baoba", 4], [515, "raizes", 10], [530, "cerco", "cacto", 20], [545, "estouro", "cardo", 18], [550, "elite"], [565, "revoada", "alada", 60], [575, "enxame", "orquidea", 24],
    [590, "aviso", "matriarca"], [600, "chefe", "matriarca"],
  ];
  // Elites ganham um traço especial (mostrado pela cor da aura)
  const AFIXOS = {
    veloz:     { nome: "Veloz",        cor: "#ffd34d", sub: "Rápida como o vento" },
    espinhosa: { nome: "Espinhosa",    cor: "#ff4d6d", sub: "Não chegue perto da aura vermelha" },
    regenera:  { nome: "Regenerativa", cor: "#4ade80", sub: "Ela se cura — derrube-a rápido" },
    blindada:  { nome: "Blindada",     cor: "#60a5fa", sub: "Casca grossa e inabalável" },
  };
  const MAX_INIMIGOS = 420;

  // Equipamentos: encontrados em elites, chefes e caixas; equipados só no bunker (aba Arsenal)
  const ENCAIXES = { capacete: "Capacete", traje: "Traje", botas: "Botas", acessorio: "Módulo" };
  const RARIDADES = [
    { nome: "Comum",    cor: "#a9bfcc", mult: 1,   peso: 60, desmonta: 15 },
    { nome: "Raro",     cor: "#38bdf8", mult: 1.7, peso: 28, desmonta: 40 },
    { nome: "Épico",    cor: "#c084fc", mult: 2.6, peso: 10, desmonta: 100 },
    { nome: "Lendário", cor: "#ffb020", mult: 4,   peso: 2,  desmonta: 250 },
  ];
  // st: atributos por "ponto" (multiplicados pela raridade e pelo aprimoramento)
  const MODELOS = {
    visor:   { enc: "capacete",  nome: "Visor Tático",         cor: "#ff4d6d", st: { crit: 0.025 } },
    elmo:    { enc: "capacete",  nome: "Elmo Blindado",        cor: "#94a3b8", st: { armadura: 0.6, vida: 0.03 } },
    neural:  { enc: "capacete",  nome: "Capacete Neural",      cor: "#22e5ff", st: { xp: 0.05 } },
    kevlar:  { enc: "traje",     nome: "Colete de Kevlar",     cor: "#a3e635", st: { vida: 0.07 } },
    exo:     { enc: "traje",     nome: "Exotraje Reativo",     cor: "#60a5fa", st: { armadura: 0.8 } },
    termal:  { enc: "traje",     nome: "Traje Termal",         cor: "#ff8a1f", st: { duracao: 0.05, area: 0.03 } },
    corrida: { enc: "botas",     nome: "Botas de Corrida",     cor: "#facc15", st: { vel: 0.045 } },
    magnet:  { enc: "botas",     nome: "Botas Magnéticas",     cor: "#ef4444", st: { ima: 0.14 } },
    coturno: { enc: "botas",     nome: "Coturnos de Aço",      cor: "#cbd5e1", st: { armadura: 0.5, vel: 0.02 } },
    fusao:   { enc: "acessorio", nome: "Núcleo de Fusão",      cor: "#ff2bd6", st: { dano: 0.05 } },
    cryo:    { enc: "acessorio", nome: "Dissipador Portátil",  cor: "#7dd3fc", st: { recarga: 0.035 } },
    lente:   { enc: "acessorio", nome: "Lente Grande-Angular", cor: "#c084fc", st: { area: 0.06 } },
    seiva:   { enc: "acessorio", nome: "Cápsula de Seiva",     cor: "#4ade80", st: { regen: 0.12 } },
    garimpo: { enc: "acessorio", nome: "Chip Garimpeiro",      cor: "#fbbf24", st: { sucata: 0.07 } },
  };
  // a partir de Raro, o item ganha atributos extras sorteados (Lendário ganha dois)
  const EXTRAS = { dano: 0.025, recarga: 0.02, area: 0.03, vel: 0.025, vida: 0.035, crit: 0.015, ima: 0.08, xp: 0.03, regen: 0.06 };
  const MAX_NV_ITEM = 5, MAX_INV = 48, CUSTO_CAIXA = 120;

  // ========================================================
  // 3. SALVAMENTO
  // ========================================================
  const CHAVE = "raizes-de-neon";
  function metaPadrao() {
    return {
      sucata: 0, oficina: {}, personagens: ["kai"], escolhido: "kai",
      recordes: { tempo: 0, nivel: 0, abates: 0, maisAbates: 0, vitorias: 0, partidas: 0, chefes: 0 },
      opcoes: { som: true, numeros: true, mouse: "sempre", tremor: true },
      inventario: [], equip: { capacete: null, traje: null, botas: null, acessorio: null }, proxItem: 1, presente: false,
    };
  }
  function carregar() {
    const m = metaPadrao();
    try {
      const d = JSON.parse(localStorage.getItem(CHAVE));
      if (d && typeof d === "object") {
        Object.assign(m, d);
        m.recordes = Object.assign(metaPadrao().recordes, d.recordes);
        m.opcoes = Object.assign(metaPadrao().opcoes, d.opcoes);
        m.oficina = Object.assign({}, d.oficina);
        if (!Array.isArray(m.personagens) || !m.personagens.includes("kai")) m.personagens = ["kai", ...(m.personagens || [])];
        if (!PERSONAGENS[m.escolhido] || !m.personagens.includes(m.escolhido)) m.escolhido = "kai";
        m.inventario = (Array.isArray(d.inventario) ? d.inventario : []).filter(it => it && MODELOS[it.m] && RARIDADES[it.r] && Number.isFinite(it.id))
          .map(it => ({ id: it.id, m: it.m, r: it.r, n: clamp(it.n | 0, 0, MAX_NV_ITEM), x: (Array.isArray(it.x) ? it.x : []).filter(k => EXTRAS[k]) }));
        m.equip = Object.assign(metaPadrao().equip, d.equip);
        for (const enc in m.equip) {
          const it = m.inventario.find(i => i.id === m.equip[enc]);
          if (!ENCAIXES[enc] || !it || MODELOS[it.m].enc !== enc) m.equip[enc] = null;
        }
        m.proxItem = Math.max(+d.proxItem || 1, ...m.inventario.map(i => i.id + 1), 1);
      }
    } catch (e) { /* save corrompido ou sem armazenamento: começa do zero */ }
    return m;
  }
  function salvar() { try { localStorage.setItem(CHAVE, JSON.stringify(meta)); } catch (e) { /* sem armazenamento */ } }
  let meta = carregar();
  const nivelOf = id => meta.oficina[id] || 0;

  // ---------- Equipamentos ----------
  const pctTxt = v => (Math.round(v * 1000) / 10).toLocaleString("pt-BR") + "%";
  const ATRIB = {
    dano:     v => `+${pctTxt(v)} de dano`,
    recarga:  v => `-${pctTxt(v)} de recarga`,
    area:     v => `+${pctTxt(v)} de área`,
    duracao:  v => `+${pctTxt(v)} de duração`,
    vel:      v => `+${pctTxt(v)} de velocidade`,
    vida:     v => `+${pctTxt(v)} de vida máxima`,
    armadura: v => `+${v} de armadura`,
    regen:    v => `+${(Math.round(v * 100) / 100).toLocaleString("pt-BR")} vida/s`,
    ima:      v => `+${pctTxt(v)} de coleta`,
    xp:       v => `+${pctTxt(v)} de experiência`,
    crit:     v => `+${pctTxt(v)} de crítico`,
    sucata:   v => `+${pctTxt(v)} de sucata`,
  };
  const itemPorId = id => (id ? meta.inventario.find(i => i.id === id) : null);
  const nomeItem = it => MODELOS[it.m].nome + (it.n ? ` +${it.n}` : "");
  const iconeItem = it => ARTE.iconeEquip(MODELOS[it.m].enc, MODELOS[it.m].cor);
  const custoAprimorar = it => 30 * (it.r + 1) * (it.n + 1);
  const valorDesmontar = it => RARIDADES[it.r].desmonta + Math.floor(15 * (it.r + 1) * it.n * (it.n + 1) / 2);
  function statsItem(it) {
    const md = MODELOS[it.m], k = RARIDADES[it.r].mult * (1 + 0.15 * it.n), st = {};
    for (const a in md.st) st[a] = (st[a] || 0) + md.st[a] * k;
    for (const a of it.x) st[a] = (st[a] || 0) + EXTRAS[a] * k;
    if (st.armadura) st.armadura = Math.max(1, Math.round(st.armadura));
    return st;
  }
  function somaEquip() {
    const t = {};
    for (const enc in ENCAIXES) {
      const it = itemPorId(meta.equip[enc]);
      if (!it) continue;
      const st = statsItem(it);
      for (const a in st) t[a] = (t[a] || 0) + st[a];
    }
    return t;
  }
  function sortearIndice(pesos) {
    const total = pesos.reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    for (let i = 0; i < pesos.length; i++) { r -= pesos[i]; if (r < 0) return i; }
    return 0;
  }
  function novoItem(pesos = RARIDADES.map(r => r.peso), modelo = null) {
    const ids = Object.keys(MODELOS), m = modelo || ids[RI(0, ids.length - 1)];
    const r = sortearIndice(pesos), x = [];
    const pool = Object.keys(EXTRAS).filter(k => !(k in MODELOS[m].st));
    const n = r >= 3 ? 2 : r >= 1 ? 1 : 0;
    while (x.length < n) { const k = pool[RI(0, pool.length - 1)]; if (!x.includes(k)) x.push(k); }
    return { id: meta.proxItem++, m, r, n: 0, x };
  }
  // guarda no inventário; se estiver cheio, vira sucata na hora
  function guardarItem(it) {
    if (meta.inventario.length >= MAX_INV) { meta.sucata += valorDesmontar(it); return false; }
    meta.inventario.push(it);
    return true;
  }
  // presente de boas-vindas: o primeiro colete já vem equipado
  if (!meta.presente) {
    meta.presente = true;
    const it = novoItem([1, 0, 0, 0], "kevlar");
    meta.inventario.push(it);
    if (!meta.equip.traje) meta.equip.traje = it.id;
    salvar();
  }

  // ========================================================
  // 4. SOM (sintetizado na hora com WebAudio, sem arquivos)
  // ========================================================
  const Som = (() => {
    let ac = null, mestre = null, ruidoBuf = null;
    const ultimo = {};
    function iniciar() {
      if (ac) { if (ac.state === "suspended") ac.resume(); return; }
      try {
        ac = new (window.AudioContext || window.webkitAudioContext)();
        mestre = ac.createGain(); mestre.gain.value = 0.25; mestre.connect(ac.destination);
        ruidoBuf = ac.createBuffer(1, ac.sampleRate * 0.6, ac.sampleRate);
        const d = ruidoBuf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      } catch (e) { ac = null; }
    }
    function tom(f0, f1, dur, tipo = "square", vol = 0.2, atraso = 0) {
      const t = ac.currentTime + atraso;
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = tipo; o.frequency.setValueAtTime(f0, t);
      if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(mestre); o.start(t); o.stop(t + dur + 0.02);
    }
    function ruido(dur, vol, freq = 1200, tipo = "lowpass", atraso = 0) {
      const t = ac.currentTime + atraso;
      const s = ac.createBufferSource(); s.buffer = ruidoBuf;
      const f = ac.createBiquadFilter(); f.type = tipo; f.frequency.value = freq;
      const g = ac.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      s.connect(f); f.connect(g); g.connect(mestre); s.start(t); s.stop(t + dur + 0.02);
    }
    // nome: [intervalo mínimo entre repetições, função]
    const SONS = {
      tiro:     [0.07, () => tom(880, 300, 0.07, "square", 0.04)],
      laser:    [0.09, () => tom(1500, 600, 0.06, "sawtooth", 0.025)],
      fogo:     [0.3,  () => ruido(0.55, 0.12, 900, "bandpass")],
      pulso:    [0.1,  () => { tom(190, 55, 0.35, "sine", 0.28); ruido(0.25, 0.07, 500); }],
      missil:   [0.15, () => tom(300, 900, 0.15, "triangle", 0.05)],
      explosao: [0.08, () => { ruido(0.35, 0.18, 700); tom(120, 40, 0.3, "sine", 0.16); }],
      tesla:    [0.1,  () => { ruido(0.12, 0.08, 3000, "highpass"); tom(1800, 900, 0.1, "sawtooth", 0.03); }],
      granada:  [0.15, () => tom(500, 220, 0.12, "triangle", 0.05)],
      acerto:   [0.05, () => ruido(0.04, 0.05, 2400, "bandpass")],
      morte:    [0.045, () => tom(R(380, 470), 120, 0.08, "triangle", 0.05)],
      gema:     [0.03, n => { const f = 880 * Math.pow(1.06, Math.min(18, n)); tom(f, f * 1.4, 0.06, "sine", 0.06); }],
      sucata:   [0.06, () => { tom(1300, 1300, 0.05, "square", 0.03); tom(1800, 1800, 0.08, "square", 0.03, 0.05); }],
      nivel:    [0.3,  () => [523, 659, 784, 1047].forEach((f, i) => tom(f, f, 0.2, "triangle", 0.11, i * 0.07))],
      dor:      [0.15, () => { tom(220, 80, 0.2, "sawtooth", 0.13); ruido(0.15, 0.1, 400); }],
      item:     [0.1,  () => { tom(660, 990, 0.12, "sine", 0.11); tom(990, 1320, 0.12, "sine", 0.09, 0.08); }],
      bau:      [0.5,  () => [392, 523, 659, 784, 1047, 1319].forEach((f, i) => tom(f, f, 0.26, "triangle", 0.09, i * 0.09))],
      evolucao: [0.5,  () => [523, 784, 1047, 1568, 2093].forEach((f, i) => { tom(f, f, 0.4, "triangle", 0.09, i * 0.11); tom(f / 2, f / 2, 0.4, "sine", 0.07, i * 0.11); })],
      alerta:   [1,    () => { for (let i = 0; i < 3; i++) tom(440, 880, 0.35, "sawtooth", 0.07, i * 0.45); }],
      bomba:    [0.5,  () => { ruido(1.0, 0.3, 400); tom(90, 30, 0.9, "sine", 0.35); }],
      vitoria:  [1,    () => [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => tom(f, f, 0.3, "triangle", 0.1, i * 0.14))],
      derrota:  [1,    () => [392, 330, 262, 196].forEach((f, i) => tom(f, f * 0.98, 0.4, "triangle", 0.1, i * 0.22))],
      clique:   [0.04, () => tom(1200, 1200, 0.03, "square", 0.03)],
      chicote:  [0.12, () => { ruido(0.16, 0.12, 2600, "highpass"); tom(1400, 300, 0.12, "sawtooth", 0.03); }],
      feixe:    [0.6,  () => { tom(220, 440, 0.5, "sawtooth", 0.035); tom(660, 880, 0.5, "sine", 0.03); }],
      disco:    [0.12, () => tom(700, 1100, 0.1, "triangle", 0.05)],
      mina:     [0.15, () => { tom(1600, 1600, 0.04, "square", 0.035); tom(1600, 1600, 0.04, "square", 0.035, 0.08); }],
      pisao:    [0.2,  () => { tom(90, 35, 0.35, "sine", 0.25); ruido(0.3, 0.12, 300); }],
      raro:     [0.4,  () => [659, 880, 1175, 1568].forEach((f, i) => tom(f, f, 0.22, "sine", 0.1, i * 0.08))],
    };
    function tocar(nome, arg) {
      if (!ac || !meta.opcoes.som) return;
      const s = SONS[nome];
      if (!s) return;
      const agora = ac.currentTime;
      if (ultimo[nome] && agora - ultimo[nome] < s[0]) return;
      ultimo[nome] = agora;
      try { s[1](arg); } catch (e) { /* ignora */ }
    }
    return { iniciar, tocar };
  })();

  // ========================================================
  // 5. TELA E ENTRADA (mouse, toque e teclado)
  // ========================================================
  const palco = $("palco"), tela = $("tela"), ctx = tela.getContext("2d");
  let W = 0, H = 0, dpr = 1, zoom = 1, VW = 800, VH = 600, ALC = 600;
  let vinheta = null, vinhetaVermelha = null;
  function redimensionar() {
    if (!document.fullscreenElement) {
      // no celular, durante a partida o palco ocupa a tela inteira
      const topo = palco.classList.contains("cheio") ? 0 : $("topo").getBoundingClientRect().height;
      palco.style.setProperty("--altura", Math.max(460, window.innerHeight - topo) + "px");
    }
    const r = palco.getBoundingClientRect();
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = Math.max(1, Math.round(r.width * dpr)); H = Math.max(1, Math.round(r.height * dpr));
    tela.width = W; tela.height = H;
    zoom = clamp(Math.min(r.width, r.height) / 610, 0.6, 1.5);
    VW = r.width / zoom; VH = r.height / zoom;
    ALC = Math.hypot(VW, VH) / 2 + 40;
    vinheta = vinhetaVermelha = null;
  }

  const entrada = { mx: 0, my: 0, mouseDentro: false, mousePres: false, toque: null, teclas: new Set() };
  function posLocal(e) { const r = palco.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
  palco.addEventListener("pointermove", e => {
    const [x, y] = posLocal(e);
    if (e.pointerType === "touch") {
      if (entrada.toque && e.pointerId === entrada.toque.id) { entrada.toque.x = x; entrada.toque.y = y; }
      return;
    }
    entrada.mx = x; entrada.my = y; entrada.mouseDentro = true;
  });
  palco.addEventListener("pointerleave", e => { if (e.pointerType !== "touch") entrada.mouseDentro = false; });
  tela.addEventListener("pointerdown", e => {
    Som.iniciar();
    const [x, y] = posLocal(e);
    if (e.pointerType === "touch") {
      e.preventDefault();
      entrada.toque = { id: e.pointerId, ox: x, oy: y, x, y };
      try { tela.setPointerCapture(e.pointerId); } catch (er) { /* ok */ }
    } else { entrada.mousePres = true; entrada.mouseDentro = true; entrada.mx = x; entrada.my = y; }
  });
  function soltarPonteiro(e) {
    if (entrada.toque && e.pointerId === entrada.toque.id) entrada.toque = null;
    if (e.pointerType !== "touch") entrada.mousePres = false;
  }
  window.addEventListener("pointerup", soltarPonteiro);
  window.addEventListener("pointercancel", soltarPonteiro);
  tela.addEventListener("contextmenu", e => e.preventDefault());

  const TECLAS_MOV = ["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"];
  window.addEventListener("keydown", e => {
    const k = e.key.toLowerCase();
    if (TECLAS_MOV.includes(k)) { entrada.teclas.add(k); if (estado !== "menu") e.preventDefault(); }
    if (e.repeat) return;
    if (e.shiftKey && k === "d") { alternarDebug(); return; }
    if (k === "escape" || k === "p") { if (estado === "jogando" || estado === "pausa") { e.preventDefault(); alternarPausa(); } }
    if (estado === "nivel" && ["1", "2", "3", "4"].includes(k)) escolher(+k - 1);
    if (estado === "nivel" && k === "r") rerolar();
    if (estado === "bau" && (k === "enter" || k === " ") && !$("btn-bau").hidden) { e.preventDefault(); fecharBau(); }
    if (k === "m" && estado !== "menu") alternarSom();
    if (k === "f" && estado !== "menu") telaCheia();
    if (k === "enter" && estado === "menu") iniciarPartida();
  });
  window.addEventListener("keyup", e => entrada.teclas.delete(e.key.toLowerCase()));
  window.addEventListener("blur", () => { entrada.teclas.clear(); if (estado === "jogando") alternarPausa(); });
  document.addEventListener("visibilitychange", () => { if (document.hidden && estado === "jogando") alternarPausa(); });

  // ========================================================
  // 6. ESTADO DA PARTIDA
  // ========================================================
  let estado = "menu"; // menu | jogando | pausa | nivel | bau | fim
  let J = null;        // tudo da partida atual
  const cam = { x: 0, y: 0 };
  const debug = { invencivel: false, vel: 1 };

  const reqXP = n => Math.floor(4 + (n - 1) * 5 + 0.2 * (n - 1) * (n - 1));
  const nivelPassivo = id => { const p = J.passivos.find(p => p.id === id); return p ? p.nivel : 0; };

  function novaPartida() {
    const pid = meta.escolhido;
    J = {
      personagem: pid, tempo: 0,
      px: 0, py: 0, vx: 0, vy: 0, dirX: 1, dirY: 0, esq: false, andando: false, r: 13,
      hp: 1, hpMax: 0, invuln: 0, nivel: 1, xp: 0, xpReq: reqXP(1), nivelPend: 0,
      abates: 0, sucata: 0, rerolls: 1 + nivelOf("reroll"), revives: nivelOf("revive"),
      armas: [], passivos: [], evoluidas: [], mod: {},
      inimigos: [], grandes: [], tiros: [], tirosIni: [], gemas: [], itens: [], particulas: [], numeros: [],
      aneis: [], raios: [], pocas: [], granadas: [], explosoes: [], avisos: [], minas: [], golpes: [], achados: [],
      eq: somaEquip(),
      evento: 0, acumSpawn: 0, chefe: null, tremor: 0, flashDano: 0, flashBranco: 0,
      proxBarril: 18, proxRaizes: 225, comboGema: 0, tComboGema: 0,
      fimEm: null, vitoria: false, morto: false, chefesMortos: 0,
    };
    darArma(PERSONAGENS[pid].arma);
    J.hp = J.hpMax;
    cam.x = 0; cam.y = 0;
  }

  function darArma(id) {
    J.armas.push({ id, nivel: 1, t: 0.4, total: 0, desde: J.tempo, s: null, ativo: 0, ang: 0, tick: 0, rot: Math.random() * TAU, pos: [], drones: [] });
    recalcular();
  }

  function statsArma(a) {
    const def = ARMAS[a.id];
    const s = Object.assign({}, def.base);
    if (!def.evo) for (let i = 0; i < a.nivel - 1; i++) {
      const n = def.niveis[i];
      for (const k in n) if (k !== "txt") s[k] = (s[k] || 0) + n[k];
    }
    const m = J.mod;
    s.dano *= m.dano;
    if (s.recarga) s.recarga *= m.recarga;
    if (s.area) s.area *= m.area;
    if (s.duracao) s.duracao *= m.duracao;
    if (s.qtd != null) s.qtd += m.qtd;
    return s;
  }

  // Junta passivos da partida, Oficina, personagem e equipamentos em J.mod
  function recalcular() {
    const P = PERSONAGENS[J.personagem], pv = nivelPassivo, m = J.mod, q = J.eq, eq = k => q[k] || 0;
    m.dano = (1 + 0.1 * pv("potencia")) * (1 + 0.05 * nivelOf("dano")) * (P.dano || 1) * (1 + eq("dano"));
    m.recarga = (1 - 0.08 * pv("refrigeracao")) * (1 - 0.03 * nivelOf("recarga")) * (1 - eq("recarga"));
    m.area = (1 + 0.1 * pv("amplificador")) * (P.area || 1) * (1 + eq("area"));
    m.duracao = (1 + 0.12 * pv("bateria")) * (1 + eq("duracao"));
    m.qtd = pv("multiplicador");
    m.armadura = pv("blindagem") + nivelOf("armadura") + eq("armadura");
    m.vel = 150 * (1 + 0.08 * pv("propulsor")) * (1 + 0.05 * nivelOf("vel")) * (P.vel || 1) * (1 + eq("vel"));
    m.regen = 0.25 * pv("nanobots") + 0.2 * nivelOf("regen") + eq("regen");
    m.ima = 85 * (1 + 0.25 * pv("ima")) * (1 + 0.15 * nivelOf("ima")) * (P.ima || 1) * (1 + eq("ima"));
    m.xp = (1 + 0.08 * pv("aprendizado")) * (1 + 0.05 * nivelOf("xp")) * (1 + eq("xp"));
    m.crit = 0.05 + 0.04 * pv("mira") + eq("crit");
    const novoMax = Math.round((100 * (P.hp || 1) * (1 + 0.1 * nivelOf("vida")) + 20 * pv("vitalidade")) * (1 + eq("vida")));
    if (J.hpMax && novoMax > J.hpMax) J.hp += novoMax - J.hpMax;
    J.hpMax = novoMax;
    J.hp = Math.min(J.hp, J.hpMax);
    for (const a of J.armas) a.s = statsArma(a);
  }

  // ========================================================
  // 7. GRADE ESPACIAL (acha inimigos perto sem olhar todos)
  // ========================================================
  const CEL = 64, NB = 4096;
  const baldes = Array.from({ length: NB }, () => []);
  const baldesUsados = [];
  const BUF = [];
  let visitaId = 0;
  const chaveCel = (cx, cy) => (Math.imul(cx, 73856093) ^ Math.imul(cy, 19349663)) & (NB - 1);
  function montarGrade() {
    for (let i = 0; i < baldesUsados.length; i++) baldes[baldesUsados[i]].length = 0;
    baldesUsados.length = 0;
    const L = J.inimigos;
    for (let i = 0; i < L.length; i++) {
      const e = L[i];
      if (e.morto || e.grande) continue;
      const k = chaveCel(Math.floor(e.x / CEL), Math.floor(e.y / CEL));
      const b = baldes[k];
      if (b.length === 0) baldesUsados.push(k);
      b.push(e);
    }
  }
  // Devolve (no BUF compartilhado) os inimigos que encostam no círculo.
  // Atenção: não chame perto() de novo enquanto percorre o resultado.
  function perto(x, y, raio) {
    BUF.length = 0;
    const id = ++visitaId, m = raio + 24;
    const x0 = Math.floor((x - m) / CEL), x1 = Math.floor((x + m) / CEL);
    const y0 = Math.floor((y - m) / CEL), y1 = Math.floor((y + m) / CEL);
    for (let cx = x0; cx <= x1; cx++) for (let cy = y0; cy <= y1; cy++) {
      const b = baldes[chaveCel(cx, cy)];
      for (let i = 0; i < b.length; i++) {
        const e = b[i];
        if (e.visita === id || e.morto) continue;
        e.visita = id;
        const rr = raio + e.r, dx = e.x - x, dy = e.y - y;
        if (dx * dx + dy * dy < rr * rr) BUF.push(e);
      }
    }
    for (const e of J.grandes) {
      if (e.morto) continue;
      const rr = raio + e.r, dx = e.x - x, dy = e.y - y;
      if (dx * dx + dy * dy < rr * rr) BUF.push(e);
    }
    return BUF;
  }
  function maisProximo(x, y, max, excluir) {
    let melhor = null, md = max * max;
    const L = J.inimigos;
    for (let i = 0; i < L.length; i++) {
      const e = L[i];
      if (e.morto || e.inofensivo || (excluir && excluir.has(e))) continue;
      const dx = e.x - x, dy = e.y - y, d = dx * dx + dy * dy;
      if (d < md) { md = d; melhor = e; }
    }
    return melhor;
  }
  function alvoAleatorio(x, y, max) {
    let escolhido = null, n = 0;
    const m2 = max * max, L = J.inimigos;
    for (let i = 0; i < L.length; i++) {
      const e = L[i];
      if (e.morto || e.inofensivo) continue;
      const dx = e.x - x, dy = e.y - y;
      if (dx * dx + dy * dy < m2 && Math.random() * ++n < 1) escolhido = e;
    }
    return escolhido;
  }

  // ========================================================
  // 8. ONDAS, EVENTOS E NASCIMENTO DE PLANTAS
  // ========================================================
  const escalaHp = t => 1 + t / 200 + 1.5 * (t / 600) * (t / 600);
  const escalaDano = t => 1 + t / 380;
  const ondaAtual = () => ONDAS.find(o => J.tempo < o.ate) || ONDAS[ONDAS.length - 1];

  // Ponto logo fora da tela (com leve preferência pela direção em que você anda)
  function pontoBorda(margem = 60, viesForte = false) {
    let ang = Math.random() * TAU;
    if (J.andando && (viesForte || Math.random() < 0.35)) ang = Math.atan2(J.dirY, J.dirX) + R(-1, 1);
    const hw = VW / 2 + margem, hh = VH / 2 + margem;
    const c = Math.cos(ang), s = Math.sin(ang);
    const t = Math.min(hw / Math.max(1e-6, Math.abs(c)), hh / Math.max(1e-6, Math.abs(s)));
    return [J.px + c * t, J.py + s * t];
  }

  function criarInimigo(tipo, x, y, op = {}) {
    const d = INIMIGOS[tipo];
    const fixo = d.chefe || d.fixo;
    const e = {
      tipo, x, y, r: d.r, hp: d.hp * (fixo ? 1 : escalaHp(J.tempo)), hpMax: 0,
      vel: d.vel * R(0.9, 1.1), dano: d.dano * (d.chefe ? 1 : escalaDano(J.tempo)), xp: d.xp,
      armadura: d.armadura || 0, kbRes: d.kb ?? 1, kx: 0, ky: 0,
      flash: 0, fase: Math.random() * TAU, esq: x > J.px, ia: d.ia || null,
      t: R(0.8, 2), t2: R(3, 5), t3: 6, t4: 0, estado: 0, ang: Math.random() * TAU, bx: 0, by: 0, nasce: 0,
      morto: false, removido: false, lento: 0, atordoado: 0, queima: 0, tickQ: 0, danoQ: 0, armaQ: null,
      chefe: !!d.chefe, elite: false, grande: false, visita: 0, hitS: -9, hitL: -9, inofensivo: !!d.inofensivo, afixo: null, rot: 0,
    };
    if (op.elite) {
      e.elite = true; e.r *= 1.6; e.hp *= 16; e.dano *= 1.4; e.xp = Math.max(10, e.xp * 8); e.vel *= 0.92; e.kbRes = 0.15;
      e.afixo = op.afixo || null;
      if (e.afixo === "veloz") e.vel *= 1.5;
      if (e.afixo === "blindada") { e.armadura += 6; e.kbRes = 0; e.hp *= 1.2; }
    }
    if (tipo === "raiz") { e.nasce = 0.35; e.t3 = 5.5; }
    if (tipo === "rainha") { e.t = 2.5; e.t2 = 5; }
    if (tipo === "colosso") { e.t = 2; e.t2 = 4; }
    if (tipo === "matriarca") { e.t = 2; e.t2 = 5; e.t3 = 8; }
    e.hpMax = e.hp;
    e.grande = e.chefe || e.elite;
    J.inimigos.push(e);
    if (e.grande) J.grandes.push(e);
    return e;
  }

  function spawnar(dt) {
    if (J.vitoria) return;
    const onda = ondaAtual();
    // população mínima: quanto mais forte você está (e mais rápido mata), mais plantas chegam
    let alvoMin = 12 + Math.min(J.tempo, DURACAO) / DURACAO * 130;
    if (J.chefe && INIMIGOS[J.chefe.tipo].final) alvoMin *= 0.5;
    const falta = alvoMin - J.inimigos.length;
    J.acumSpawn += (onda.taxa + (falta > 0 ? falta * 0.6 : 0)) * dt;
    while (J.acumSpawn >= 1) {
      J.acumSpawn -= 1;
      if (J.inimigos.length >= MAX_INIMIGOS) { J.acumSpawn = 0; break; }
      const [x, y] = pontoBorda();
      const tipo = sortearChave(onda.tipos), n = INIMIGOS[tipo].bando || 1;
      for (let k = 0; k < n; k++) criarInimigo(tipo, x + (n > 1 ? R(-34, 34) : 0), y + (n > 1 ? R(-34, 34) : 0));
    }
    J.proxBarril -= dt;
    if (J.proxBarril <= 0) {
      J.proxBarril = R(26, 38);
      if (J.inimigos.filter(e => e.tipo === "barril" && !e.morto).length < 3) {
        const a = Math.random() * TAU, d = R(240, 400);
        criarInimigo("barril", J.px + Math.cos(a) * d, J.py + Math.sin(a) * d);
      }
    }
    if (J.tempo > 215) {
      J.proxRaizes -= dt;
      if (J.proxRaizes <= 0) { J.proxRaizes = R(10, 16) * (J.tempo > 480 ? 0.7 : 1); erupcao(RI(2, 4), 170); }
    }
  }

  function erupcao(n, raio = 160) {
    for (let i = 0; i < n; i++) {
      let x, y;
      if (i === 0) {
        const fx = J.andando ? J.dirX * 80 : 0, fy = J.andando ? J.dirY * 80 : 0;
        x = J.px + fx + R(-20, 20); y = J.py + fy + R(-20, 20);
      } else {
        const a = Math.random() * TAU, d = R(60, raio);
        x = J.px + Math.cos(a) * d; y = J.py + Math.sin(a) * d;
      }
      J.avisos.push({ x, y, t: 0, dur: 1.1, r: 26 });
    }
  }

  function processarEventos() {
    while (J.evento < EVENTOS.length && J.tempo >= EVENTOS[J.evento][0]) {
      executarEvento(EVENTOS[J.evento]);
      J.evento++;
    }
  }
  function executarEvento([, tipo, a, b]) {
    if (J.vitoria) return;
    switch (tipo) {
      case "elite": {
        const pesos = Object.assign({}, ondaAtual().tipos);
        delete pesos.alada;
        const t = sortearChave(pesos);
        const [x, y] = pontoBorda(60, true);
        const af = J.tempo < 100 ? null : Object.keys(AFIXOS)[RI(0, 3)];
        criarInimigo(t, x, y, { elite: true, afixo: af });
        faixa(af ? `Elite ${AFIXOS[af].nome.toLowerCase()} à vista!` : "Planta elite à vista!",
          af ? `${AFIXOS[af].sub} • ela guarda uma Caixa de Suprimentos` : "Derrote-a para ganhar uma Caixa de Suprimentos", af ? AFIXOS[af].cor : "#ffd34d");
        break;
      }
      case "revoada": {
        const [x, y] = pontoBorda(80);
        for (let i = 0; i < b; i++) criarInimigo(a, x + R(-90, 90), y + R(-90, 90));
        faixa("Revoada!", "Sementes aladas em bando", "#7dffb0");
        break;
      }
      case "estouro": {
        // uma fileira de cardos chega de um lado só e já vem rolando
        const ang = Math.random() * TAU, dist = Math.hypot(VW, VH) / 2 + 40;
        const cx = J.px + Math.cos(ang) * dist, cy = J.py + Math.sin(ang) * dist;
        for (let i = 0; i < b; i++) {
          const o = (i - (b - 1) / 2) * 42;
          const e = criarInimigo(a, cx - Math.sin(ang) * o, cy + Math.cos(ang) * o);
          e.t = R(0, 0.5);
        }
        faixa("Estouro de cardos!", "Saia da linha de rolagem", "#d58cff");
        break;
      }
      case "tanques":
        invocarAoRedor(a, b, Math.hypot(VW, VH) / 2 + 40);
        faixa("Baobás andantes!", "Gigantes lentos — mantenha distância", "#ffb020");
        break;
      case "cerco": {
        const raio = Math.hypot(VW, VH) / 2 + 30;
        for (let i = 0; i < b; i++) { const ang = i / b * TAU; criarInimigo(a, J.px + Math.cos(ang) * raio, J.py + Math.sin(ang) * raio); }
        faixa("Cerco!", "As plantas estão fechando o círculo", "#ff4d6d");
        break;
      }
      case "enxame": {
        const [x, y] = pontoBorda(80);
        for (let i = 0; i < b; i++) criarInimigo(a, x + R(-70, 70), y + R(-70, 70));
        faixa("Enxame volátil!", "Orquídeas explosivas se aproximando", "#ff8ef0");
        break;
      }
      case "raizes":
        erupcao(a, 230);
        faixa("Raízes emergindo!", "Fuja dos círculos vermelhos", "#ff9a3d");
        break;
      case "aviso":
        faixa("⚠ Chefe se aproximando", INIMIGOS[a].nome, "#ff2bd6");
        Som.tocar("alerta");
        break;
      case "chefe": {
        const [x, y] = pontoBorda(90, true);
        J.chefe = criarInimigo(a, x, y);
        break;
      }
    }
  }

  // ========================================================
  // 9. ARMAS
  // ========================================================
  function novoTiro(o) {
    o.morto = false;
    o.atraso = o.atraso || 0;
    o.kb = o.kb || 0;
    o.atingidos = o.perfura > 1 ? new Set() : null;
    return o;
  }

  const COMPORT = {
    blaster(a, dt) {
      a.t -= dt;
      if (a.t > 0) return;
      const alvo = maisProximo(J.px, J.py, Math.min(ALC, 430));
      if (!alvo) { a.t = 0.1; return; }
      a.t = a.s.recarga;
      const evo = a.id === "fusao", n = a.s.qtd;
      const base = Math.atan2(alvo.y - J.py, alvo.x - J.px);
      for (let i = 0; i < n; i++) {
        const ang = base + (i - (n - 1) / 2) * (evo ? 0.16 : 0.11);
        J.tiros.push(novoTiro({
          x: J.px, y: J.py - 4, vx: Math.cos(ang) * a.s.vel, vy: Math.sin(ang) * a.s.vel,
          r: (evo ? 9 : 5) * a.s.area, dano: a.s.dano, perfura: a.s.perfura, vida: 1.3,
          tipo: evo ? "fusao" : "plasma", arma: a, kb: evo ? 110 : 60,
        }));
      }
      Som.tocar("tiro");
    },

    chamas(a, dt) {
      const evo = a.id === "inferno";
      if (a.ativo > 0) {
        a.ativo -= dt;
        const alvo = maisProximo(J.px, J.py, 420);
        const alvoAng = alvo ? Math.atan2(alvo.y - J.py, alvo.x - J.px) : Math.atan2(J.dirY, J.dirX);
        a.ang = girarPara(a.ang, alvoAng, 5 * dt);
        const alcance = 205 * a.s.area, abre = 0.5;
        const dirs = evo ? [a.ang, a.ang + Math.PI] : [a.ang];
        for (const d of dirs) {
          for (let k = 0; k < (evo ? 4 : 5); k++) {
            const aa = d + R(-abre, abre) * 0.85, v = alcance * R(3.4, 4.4);
            particula(J.px + Math.cos(d) * 14, J.py - 4 + Math.sin(d) * 14, Math.cos(aa) * v + J.vx, Math.sin(aa) * v + J.vy,
              0.34, R(9, 15), evo ? (Math.random() < 0.5 ? "#5cc8ff" : "#d6f4ff") : (Math.random() < 0.5 ? "#ff8a1f" : "#ffd04a"), 1, 2.4, 0, 2.6);
          }
        }
        a.tick -= dt;
        if (a.tick <= 0) {
          a.tick = 0.12;
          for (const d of dirs) {
            const cx = Math.cos(d), cy = Math.sin(d);
            const lst = perto(J.px, J.py, alcance);
            for (let i = 0; i < lst.length; i++) {
              const e = lst[i];
              if (e.morto) continue;
              const ex = e.x - J.px, ey = e.y - J.py, de = Math.hypot(ex, ey) || 1;
              const ang = Math.acos(clamp((ex * cx + ey * cy) / de, -1, 1));
              if (ang > abre + e.r / de && de > e.r + 16) continue;
              ferir(e, a.s.dano, a, cx * 35, cy * 35);
              if (a.s.queima && !e.morto) { e.queima = 2; e.danoQ = a.s.dano * 0.5; e.armaQ = a; }
            }
          }
        }
      } else {
        a.t -= dt;
        if (a.t <= 0 && maisProximo(J.px, J.py, 225 * a.s.area)) {
          a.t = a.s.recarga; a.ativo = a.s.duracao; a.tick = 0;
          const alvo = maisProximo(J.px, J.py, 420);
          if (alvo) a.ang = Math.atan2(alvo.y - J.py, alvo.x - J.px);
          Som.tocar("fogo");
        }
      }
    },

    serras(a, dt) {
      const perm = !!a.s.permanente;
      if (!perm) {
        if (a.ativo <= 0) {
          a.t -= dt; a.pos.length = 0;
          if (a.t <= 0) a.ativo = a.s.duracao;
          return;
        }
        a.ativo -= dt;
        if (a.ativo <= 0) a.t = a.s.recarga;
      }
      a.rot += a.s.velRot * dt;
      // a órbita "respira" entre ~90 e ~125 px, cobrindo uma faixa larga ao seu redor
      const n = a.s.qtd, raio = 108 * a.s.area * (1 + 0.16 * Math.sin(a.rot * 0.55)), rs = 19 * Math.sqrt(a.s.area);
      a.pos.length = 0;
      for (let i = 0; i < n; i++) {
        const ang = a.rot + i * TAU / n;
        const x = J.px + Math.cos(ang) * raio, y = J.py - 4 + Math.sin(ang) * raio;
        a.pos.push(x, y);
        const lst = perto(x, y, rs);
        for (let k = 0; k < lst.length; k++) {
          const e = lst[k];
          if (e.morto || J.tempo - e.hitS < 0.3) continue;
          e.hitS = J.tempo;
          const ex = e.x - J.px, ey = e.y - J.py, de = Math.hypot(ex, ey) || 1;
          ferir(e, a.s.dano, a, ex / de * 160, ey / de * 160);
          faiscas(x, y, 3, perm ? "#fff36b" : "#c7f9ff");
        }
      }
    },

    pulso(a, dt) {
      a.t -= dt;
      if (a.t > 0) return;
      const rmax = 150 * a.s.area;
      if (!maisProximo(J.px, J.py, rmax + 60)) { a.t = 0.2; return; }
      a.t = a.s.recarga;
      J.aneis.push({ r: 8, rmax, vel: rmax / 0.32, dano: a.s.dano, arma: a, ids: new Set(), fim: 0,
        cor: a.id === "colapso" ? "#b18cff" : "#60f0ff", empurrao: a.s.empurrao, atordoa: a.s.atordoa || 0 });
      Som.tocar("pulso");
    },

    misseis(a, dt) {
      a.t -= dt;
      if (a.t > 0) return;
      const primeiro = maisProximo(J.px, J.py, Math.min(ALC, 480));
      if (!primeiro) { a.t = 0.2; return; }
      a.t = a.s.recarga;
      for (let i = 0; i < a.s.qtd; i++) {
        const alvo = i === 0 ? primeiro : (alvoAleatorio(J.px, J.py, Math.min(ALC, 480)) || primeiro);
        J.tiros.push(novoTiro({
          x: J.px, y: J.py - 8, vx: 0, vy: 0, ang: -Math.PI / 2 + R(-1.3, 1.3), vel: 150, velMax: a.s.vel,
          r: 7, dano: a.s.dano, perfura: 1, vida: 3.2, tipo: "missil", arma: a, alvo,
          explode: 58 * a.s.area, atraso: i * 0.06,
        }));
      }
      Som.tocar("missil");
    },

    tesla(a, dt) {
      a.t -= dt;
      if (a.t > 0) return;
      const alc = 260 * a.s.area;
      const primeiro = maisProximo(J.px, J.py, alc);
      if (!primeiro) { a.t = 0.15; return; }
      a.t = a.s.recarga;
      const usados = new Set(), evo = a.id === "tempestade";
      for (let q = 0; q < a.s.qtd; q++) {
        let atual = q === 0 ? primeiro : maisProximo(J.px, J.py, alc, usados);
        if (!atual) break;
        const pts = [J.px, J.py - 10];
        for (let s = 0; s <= a.s.saltos && atual; s++) {
          usados.add(atual);
          pts.push(atual.x, atual.y);
          ferir(atual, a.s.dano, a);
          faiscas(atual.x, atual.y, 2, "#e9ddff");
          atual = maisProximo(atual.x, atual.y, 130 * a.s.area, usados);
        }
        J.raios.push({ pts, vida: 0.22, vidaMax: 0.22, cor: evo ? "#fff3b0" : "#c4a1ff" });
      }
      for (let k = 0; k < (a.s.ceu || 0); k++) {
        const e = alvoAleatorio(J.px, J.py, ALC);
        if (!e) break;
        ferir(e, a.s.dano * 1.5, a);
        J.raios.push({ pts: [e.x + R(-40, 40), e.y - 420, e.x + R(-15, 15), e.y - 200, e.x, e.y], vida: 0.28, vidaMax: 0.28, cor: "#f0e1ff", ceu: true });
        explosao(e.x, e.y, 30, "#c4a1ff");
      }
      Som.tocar("tesla");
    },

    herbicida(a, dt) {
      a.t -= dt;
      if (a.t > 0) return;
      a.t = a.s.recarga;
      for (let i = 0; i < a.s.qtd; i++) {
        const e = alvoAleatorio(J.px, J.py, 380);
        let x, y;
        if (e) { x = e.x + R(-18, 18); y = e.y + R(-18, 18); }
        else { const ang = Math.random() * TAU, d = R(80, 220); x = J.px + Math.cos(ang) * d; y = J.py + Math.sin(ang) * d; }
        J.granadas.push({ x0: J.px, y0: J.py - 8, x1: x, y1: y, t: -i * 0.12, dur: 0.55, arma: a });
      }
      Som.tocar("granada");
    },

    drone(a, dt) {
      const n = a.s.qtd, evo = a.id === "enxame";
      while (a.drones.length < n) a.drones.push({ x: J.px, y: J.py, t: Math.random() * 0.5, ang: 0 });
      a.drones.length = n;
      for (let i = 0; i < n; i++) {
        const d = a.drones[i];
        const ang = J.tempo * 1.4 + i * TAU / n;
        const tx = J.px + Math.cos(ang) * 48, ty = J.py - 22 + Math.sin(ang) * 30;
        const f = Math.min(1, 6 * dt);
        d.x += (tx - d.x) * f; d.y += (ty - d.y) * f;
        d.t -= dt;
        if (d.t > 0) continue;
        const alvo = maisProximo(d.x, d.y, 340);
        if (!alvo) { d.t = 0.15; continue; }
        d.t = a.s.recarga;
        const an = Math.atan2(alvo.y - d.y, alvo.x - d.x);
        d.ang = an;
        J.tiros.push(novoTiro({ x: d.x, y: d.y, vx: Math.cos(an) * 780, vy: Math.sin(an) * 780, r: 4, dano: a.s.dano,
          perfura: a.s.perfura, vida: 0.55, tipo: evo ? "laserEvo" : "laser", arma: a, kb: 30 }));
        Som.tocar("laser");
      }
    },

    // Feixes que giram ao redor do jogador; cada planta leva um golpe por passada
    laser(a, dt) {
      const perm = !!a.s.permanente;
      if (!perm) {
        if (a.ativo <= 0) {
          a.t -= dt; a.pos.length = 0;
          if (a.t <= 0 && maisProximo(J.px, J.py, 250 * a.s.area)) { a.ativo = a.s.duracao; Som.tocar("feixe"); }
          return;
        }
        a.ativo -= dt;
        if (a.ativo <= 0) a.t = a.s.recarga;
      }
      a.rot += a.s.velRot * dt;
      const n = a.s.qtd, comp = 250 * a.s.area, larg = 10 * Math.sqrt(a.s.area), oy = J.py - 6;
      a.pos.length = 0;
      for (let i = 0; i < n; i++) a.pos.push(a.rot + i * TAU / n);
      const lst = perto(J.px, oy, comp);
      for (let k = 0; k < lst.length; k++) {
        const e = lst[k];
        if (e.morto || J.tempo - e.hitL < 0.3) continue;
        const ex = e.x - J.px, ey = e.y - oy;
        for (let i = 0; i < n; i++) {
          const cx = Math.cos(a.pos[i]), cy = Math.sin(a.pos[i]);
          const ao = ex * cx + ey * cy;
          if (ao < 0 || ao > comp + e.r || Math.abs(ey * cx - ex * cy) > larg + e.r) continue;
          e.hitL = J.tempo;
          ferir(e, a.s.dano, a, cx * 50, cy * 50);
          faiscas(e.x, e.y, 2, perm ? "#fff7b0" : "#ffb3c1");
          break;
        }
      }
    },

    // Discos que vão até o alcance máximo, freiam e voltam para a sua mão
    disco(a, dt) {
      a.t -= dt;
      if (a.t > 0) return;
      const alc = 240 * a.s.area;
      const primeiro = maisProximo(J.px, J.py, alc + 120);
      if (!primeiro) { a.t = 0.2; return; }
      a.t = a.s.recarga;
      const evo = a.id === "ciclone", n = a.s.qtd, v = a.s.vel;
      const base = Math.atan2(primeiro.y - J.py, primeiro.x - J.px);
      for (let i = 0; i < n; i++) {
        const ang = n > 3 ? base + i * TAU / n : base + (i - (n - 1) / 2) * 0.5;
        J.tiros.push(novoTiro({
          x: J.px, y: J.py - 6, vx: Math.cos(ang) * v, vy: Math.sin(ang) * v, r: 13 * a.s.area, dano: a.s.dano,
          perfura: 9999, vida: 5, tipo: evo ? "discoOuro" : "disco", arma: a, kb: 80, atraso: i * 0.05,
          volta: false, desac: v * v / (2 * alc), velMax: v * 1.15, giro: 0,
        }));
      }
      Som.tocar("disco");
    },

    // Minas arremessadas perto das plantas; explodem quando alguém pisa
    minas(a, dt) {
      a.t -= dt;
      if (a.t > 0) return;
      a.t = a.s.recarga;
      const evo = a.id === "singularidade", max = 6 + 3 * a.s.qtd;
      for (let i = 0; i < a.s.qtd; i++) {
        const minhas = J.minas.filter(m => m.arma === a && !m.feita);
        if (minhas.length >= max) detonar(minhas[0]);
        const alvo = alvoAleatorio(J.px, J.py, 280);
        let x, y;
        if (alvo && Math.random() < 0.65) { x = alvo.x + R(-26, 26); y = alvo.y + R(-26, 26); }
        else { const an = Math.random() * TAU, d = R(50, 170); x = J.px + Math.cos(an) * d; y = J.py + Math.sin(an) * d; }
        J.minas.push({ x0: J.px, y0: J.py - 8, x, y, t: -i * 0.1, voo: 0.35, arma: a, armada: 0.35, vida: a.s.duracao, evo, puxando: 0, fase: Math.random() * TAU, feita: false });
      }
      Som.tocar("granada");
    },

    // Chicote: golpes longos para os lados (frente, trás, cima, baixo)
    chicote(a, dt) {
      a.t -= dt;
      if (a.t > 0) return;
      if (!maisProximo(J.px, J.py, 280 * a.s.area)) { a.t = 0.15; return; }
      a.t = a.s.recarga;
      const frente = J.esq ? Math.PI : 0;
      const dirs = [frente, frente + Math.PI, -Math.PI / 2, Math.PI / 2];
      for (let i = 0; i < a.s.qtd; i++) J.golpes.push({ ang: dirs[i % 4], t: -(i % 4) * 0.1 - Math.floor(i / 4) * 0.35, vida: 0.24, feito: false, arma: a, lado: i % 2 ? -1 : 1 });
    },
  };

  function atualizarTiros(dt) {
    const T = J.tiros;
    for (let i = 0; i < T.length; i++) {
      const p = T[i];
      if (p.morto) continue;
      if (p.atraso > 0) {
        p.atraso -= dt;
        if (p.atraso > 0) continue;
        p.x = J.px; p.y = J.py - 8;
      }
      p.vida -= dt;
      if (p.volta !== undefined) {
        if (!p.volta) {
          const v = Math.hypot(p.vx, p.vy), nv = v - p.desac * dt;
          if (nv <= 50) { p.volta = true; p.vel = 50; p.atingidos.clear(); }
          else { p.vx *= nv / v; p.vy *= nv / v; }
        } else {
          const dx = J.px - p.x, dy = J.py - 6 - p.y, d = Math.hypot(dx, dy) || 1;
          p.vel = Math.min(p.velMax, p.vel + p.desac * 1.3 * dt);
          p.vx = dx / d * p.vel; p.vy = dy / d * p.vel;
          if (d < 20 || J.morto) { p.morto = true; continue; }
        }
        p.giro += dt * 20;
      } else if (p.tipo === "missil") {
        if (!p.alvo || p.alvo.morto) p.alvo = maisProximo(p.x, p.y, 520);
        if (p.alvo) p.ang = girarPara(p.ang, Math.atan2(p.alvo.y - p.y, p.alvo.x - p.x), 5.5 * dt);
        p.vel = Math.min(p.velMax, p.vel + 420 * dt);
        p.vx = Math.cos(p.ang) * p.vel; p.vy = Math.sin(p.ang) * p.vel;
        if (Math.random() < 0.6) particula(p.x - p.vx * 0.03, p.y - p.vy * 0.03, R(-15, 15), R(-15, 15), 0.4, R(5, 8), Math.random() < 0.4 ? "#ffb020" : "#5a6270", Math.random() < 0.4 ? 1 : 0, 1.5, 0, 1.5);
      }
      p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.vida <= 0) { if (p.explode) explodirTiro(p); p.morto = true; continue; }
      const lst = perto(p.x, p.y, p.r);
      for (let k = 0; k < lst.length; k++) {
        const e = lst[k];
        if (e.morto) continue;
        if (p.atingidos) { if (p.atingidos.has(e)) continue; p.atingidos.add(e); }
        if (p.explode) { explodirTiro(p); p.morto = true; break; } // explodirTiro usa perto(): sai do laço já
        const v = Math.hypot(p.vx, p.vy) || 1;
        ferir(e, p.dano, p.arma, p.vx / v * p.kb, p.vy / v * p.kb);
        faiscas(p.x, p.y, 2, p.tipo === "laser" || p.tipo === "laserEvo" ? "#ff9fb0" : "#c5fbff");
        if (--p.perfura <= 0) { p.morto = true; break; }
      }
    }
  }
  function explodirTiro(p) {
    explosao(p.x, p.y, p.explode, "#ffb020");
    const lst = perto(p.x, p.y, p.explode);
    for (let i = 0; i < lst.length; i++) {
      const e = lst[i];
      if (e.morto) continue;
      const dx = e.x - p.x, dy = e.y - p.y, d = Math.hypot(dx, dy) || 1;
      ferir(e, p.dano, p.arma, dx / d * 150, dy / d * 150);
    }
    Som.tocar("explosao");
  }

  function detonar(m) {
    if (m.feita) return;
    m.feita = true;
    const a = m.arma, rex = 78 * a.s.area * (m.evo ? 1.15 : 1);
    explosao(m.x, m.y, rex, m.evo ? "#b18cff" : "#ff5a3d");
    if (meta.opcoes.tremor) J.tremor = Math.min(10, J.tremor + 2);
    const lst = perto(m.x, m.y, rex);
    for (let i = 0; i < lst.length; i++) {
      const e = lst[i];
      if (e.morto) continue;
      const dx = e.x - m.x, dy = e.y - m.y, d = Math.hypot(dx, dy) || 1;
      ferir(e, a.s.dano, a, dx / d * 190, dy / d * 190);
    }
    Som.tocar("explosao");
  }
  function atualizarMinas(dt) {
    for (const m of J.minas) {
      if (m.feita) continue;
      if (m.t < m.voo) { m.t += dt; continue; }
      m.vida -= dt;
      if (m.armada > 0) { m.armada -= dt; if (m.armada <= 0) Som.tocar("mina"); continue; }
      if (m.puxando > 0) {
        // mina gravitacional: suga as plantas por meio segundo e então explode
        m.puxando -= dt;
        const raio = 170 * m.arma.s.area;
        const lst = perto(m.x, m.y, raio);
        for (let i = 0; i < lst.length; i++) {
          const e = lst[i];
          if (e.morto || e.chefe || e.vel === 0) continue;
          const dx = m.x - e.x, dy = m.y - e.y, d = Math.hypot(dx, dy) || 1;
          const passo = Math.min(d, 300 * dt * (e.elite ? 0.3 : 1));
          e.x += dx / d * passo; e.y += dy / d * passo;
        }
        if (Math.random() < 0.7) { const an = Math.random() * TAU; particula(m.x + Math.cos(an) * raio * 0.8, m.y + Math.sin(an) * raio * 0.8, -Math.cos(an) * 300, -Math.sin(an) * 300, 0.4, R(4, 7), "#c4a1ff", 1, 0, 0, 0); }
        if (m.puxando <= 0) detonar(m);
        continue;
      }
      if (m.vida <= 0) { detonar(m); continue; }
      const lst = perto(m.x, m.y, 20);
      let pisou = false;
      for (let i = 0; i < lst.length; i++) if (!lst[i].morto && !lst[i].inofensivo) { pisou = true; break; }
      if (pisou) { if (m.evo) { m.puxando = 0.5; Som.tocar("mina"); } else detonar(m); }
    }
    J.minas = J.minas.filter(m => !m.feita);
  }
  function atualizarGolpes(dt) {
    for (const g of J.golpes) {
      g.t += dt;
      if (g.feito || g.t < 0) continue;
      g.feito = true;
      const a = g.arma, comp = 200 * a.s.area, larg = 62 * a.s.area;
      const cx = Math.cos(g.ang), cy = Math.sin(g.ang), oy = J.py - 6;
      const lst = perto(J.px + cx * comp / 2, oy + cy * comp / 2, comp / 2 + larg / 2);
      for (let i = 0; i < lst.length; i++) {
        const e = lst[i];
        if (e.morto) continue;
        const ex = e.x - J.px, ey = e.y - oy, ao = ex * cx + ey * cy;
        if (ao < -12 || ao > comp + e.r || Math.abs(ey * cx - ex * cy) > larg / 2 + e.r) continue;
        ferir(e, a.s.dano, a, cx * 130, cy * 130, !!a.s.critico);
      }
      Som.tocar("chicote");
    }
    J.golpes = J.golpes.filter(g => g.t < g.vida);
  }

  function atualizarAneis(dt) {
    for (const an of J.aneis) {
      if (an.r < an.rmax) {
        an.r = Math.min(an.rmax, an.r + an.vel * dt);
        if (an.x !== undefined) continue; // anel decorativo com centro fixo (pisão do baobá)
        const lst = perto(J.px, J.py, an.r);
        for (let i = 0; i < lst.length; i++) {
          const e = lst[i];
          if (e.morto || an.ids.has(e)) continue;
          an.ids.add(e);
          if (!an.dano) continue; // anel só visual (bomba EMP)
          const dx = e.x - J.px, dy = e.y - J.py, d = Math.hypot(dx, dy) || 1;
          ferir(e, an.dano, an.arma, dx / d * 260 * an.empurrao, dy / d * 260 * an.empurrao);
          if (an.atordoa && !e.chefe && !e.morto) e.atordoado = an.atordoa;
        }
      } else an.fim += dt;
    }
    J.aneis = J.aneis.filter(an => an.fim < 0.2);
  }

  function atualizarGranadas(dt) {
    for (const g of J.granadas) {
      g.t += dt;
      if (g.t < g.dur) continue;
      g.feito = true;
      const a = g.arma, evo = a.id === "nuvem", cor = evo ? "#5dffb0" : "#9dff3a";
      J.pocas.push({ x: g.x1, y: g.y1, r: 60 * a.s.area, vida: a.s.duracao, vidaMax: a.s.duracao, tick: 0, dano: a.s.dano, arma: a, segue: !!a.s.segue, cor, rot: Math.random() * TAU });
      for (let i = 0; i < 12; i++) { const an = Math.random() * TAU, v = R(40, 160); particula(g.x1, g.y1, Math.cos(an) * v, Math.sin(an) * v * 0.6, 0.5, R(4, 7), cor, 1, 3, 0, 1); }
    }
    J.granadas = J.granadas.filter(g => !g.feito);
  }

  function atualizarPocas(dt) {
    for (const p of J.pocas) {
      p.vida -= dt; p.tick -= dt; p.rot += dt * 0.3;
      if (p.segue) {
        const alvo = maisProximo(p.x, p.y, 300);
        if (alvo) { const dx = alvo.x - p.x, dy = alvo.y - p.y, d = Math.hypot(dx, dy) || 1; p.x += dx / d * 55 * dt; p.y += dy / d * 55 * dt; }
      }
      if (Math.random() < 0.25) particula(p.x + R(-p.r, p.r) * 0.7, p.y + R(-p.r, p.r) * 0.5, 0, -R(10, 30), 0.7, R(3, 6), p.cor, 1, 1, 0, 0.6);
      if (p.tick <= 0) {
        p.tick = 0.3;
        const lst = perto(p.x, p.y, p.r);
        for (let i = 0; i < lst.length; i++) {
          const e = lst[i];
          if (e.morto) continue;
          ferir(e, p.dano, p.arma);
          e.lento = J.tempo + 0.5;
        }
      }
    }
    J.pocas = J.pocas.filter(p => p.vida > 0);
  }

  // ========================================================
  // 10. PLANTAS: COMPORTAMENTO
  // ========================================================
  const MOV = { x: 0, y: 0, v: 0 };
  function tiroInimigo(x, y, ang, vel, dano, tipo, vida = 4, guia = 0) {
    J.tirosIni.push({ x, y, vx: Math.cos(ang) * vel, vy: Math.sin(ang) * vel, vel, r: tipo === "esporo" ? 7 : 5, dano, tipo, vida, guia, rot: ang });
  }
  function anel(x, y, n, vel, dano, tipo, off = 0, vida = 4.5) {
    for (let k = 0; k < n; k++) tiroInimigo(x, y, off + k / n * TAU, vel, dano, tipo, vida);
  }
  function invocarAoRedor(tipo, n, raio) {
    for (let k = 0; k < n; k++) { const a = k / n * TAU + R(-0.2, 0.2); criarInimigo(tipo, J.px + Math.cos(a) * raio, J.py + Math.sin(a) * raio); }
  }

  const IA = {
    parado() { MOV.v = 0; },
    bote(e, d, dx, dy, dt) {
      if (e.estado === 0) { e.t -= dt; if (d < 240 && e.t <= 0) { e.estado = 1; e.t = 0.55; e.bx = dx; e.by = dy; } }
      else if (e.estado === 1) { MOV.v = 0; e.t -= dt; if (e.t <= 0) { e.estado = 2; e.t = 0.4; } }
      else if (e.estado === 2) { MOV.x = e.bx; MOV.y = e.by; MOV.v = 320; e.t -= dt; if (e.t <= 0) { e.estado = 3; e.t = 0.55; } }
      else { MOV.v *= 0.25; e.t -= dt; if (e.t <= 0) { e.estado = 0; e.t = R(1.2, 2.4); } }
    },
    kamikaze(e, d, dx, dy) {
      const w = Math.sin(J.tempo * 6 + e.fase) * 0.35;
      MOV.x = dx - dy * w; MOV.y = dy + dx * w;
      const l = Math.hypot(MOV.x, MOV.y) || 1; MOV.x /= l; MOV.y /= l;
    },
    atirador(e, d, dx, dy, dt) {
      if (d < 230) { const lado = e.fase > Math.PI ? 1 : -1; MOV.x = -dx * 0.5 - dy * lado * 0.8; MOV.y = -dy * 0.5 + dx * lado * 0.8; MOV.v *= 0.7; }
      else if (d < 320) MOV.v *= 0.2;
      e.t -= dt;
      if (e.t <= 0 && d < 440) { e.t = R(3.6, 4.6); tiroInimigo(e.x, e.y - 8, Math.atan2(dy, dx), 130, e.dano, "esporo", 3.4, 0.16); }
    },
    girassol(e, d, dx, dy, dt) {
      if (d < 300) MOV.v *= 0.15;
      e.t -= dt;
      if (e.t <= 0 && d < 480) {
        e.t = R(4.6, 5.6);
        const a = Math.atan2(dy, dx);
        for (let k = -1; k <= 1; k++) tiroInimigo(e.x, e.y - 10, a + k * 0.3, 165, e.dano * 0.7, "semente", 2.6);
      }
    },
    // Cardo: para, mira (mostra a linha no chão) e rola em linha reta
    rolar(e, d, dx, dy, dt) {
      if (e.estado === 0) { e.t -= dt; if (d < 330 && e.t <= 0) { e.estado = 1; e.t = 0.75; e.bx = dx; e.by = dy; } }
      else if (e.estado === 1) { MOV.v = 0; e.t -= dt; if (e.t <= 0) { e.estado = 2; e.t = 0.85; e.rot = 0; } }
      else if (e.estado === 2) { MOV.x = e.bx; MOV.y = e.by; MOV.v = 370; e.rot += dt * 15 * (e.bx < 0 ? -1 : 1); e.t -= dt; if (e.t <= 0) { e.estado = 3; e.t = 0.7; } }
      else { MOV.v *= 0.3; e.rot *= 0.9; e.t -= dt; if (e.t <= 0) { e.estado = 0; e.t = R(0.9, 1.7); e.rot = 0; } }
    },
    voo(e, d, dx, dy) {
      const w = Math.sin(J.tempo * 4 + e.fase) * 0.65;
      MOV.x = dx - dy * w; MOV.y = dy + dx * w;
      const l = Math.hypot(MOV.x, MOV.y) || 1; MOV.x /= l; MOV.y /= l;
    },
    // Baobá: quando chega perto, para e dá um pisão em área (com aviso no chão)
    pisao(e, d, dx, dy, dt) {
      if (e.estado === 0) { e.t -= dt; if (d < e.r * 3.6 + 20 && e.t <= 0) { e.estado = 1; e.t = 0.85; } }
      else {
        MOV.v = 0; e.t -= dt;
        if (e.t <= 0) {
          e.estado = 0; e.t = R(2.4, 3.4);
          const raio = e.r * 3.6;
          poeira(e.x, e.y + e.r * 0.8, 16);
          J.aneis.push({ r: 8, rmax: raio, vel: raio / 0.18, dano: 0, arma: null, ids: new Set(), fim: 0, cor: "#ffb020", empurrao: 0, atordoa: 0, x: e.x, y: e.y + e.r * 0.6 });
          if (meta.opcoes.tremor) J.tremor = Math.min(12, J.tremor + 5);
          Som.tocar("pisao");
          if (!J.morto && d < raio + J.r) ferirJogador(e.dano * 0.75);
        }
      }
    },
    raiz(e, d, dx, dy, dt) {
      MOV.v = 0;
      if (e.nasce > 0) e.nasce -= dt;
      e.t3 -= dt;
      if (e.t3 <= 0) { e.morto = true; e.removido = true; poeira(e.x, e.y + 12, 8); }
    },
    rainha(e, d, dx, dy, dt) {
      e.t2 -= dt;
      if (e.t2 <= 0) { e.t2 = 7; for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; criarInimigo("broto", e.x + Math.cos(a) * 80, e.y + Math.sin(a) * 80); } }
      if (e.estado === 0) { e.t -= dt; if (e.t <= 0 && d < 560) { e.estado = 1; e.t = 0.7; e.bx = dx; e.by = dy; } }
      else if (e.estado === 1) { MOV.v = 0; e.t -= dt; if (e.t <= 0) { e.estado = 2; e.t = 0.75; } }
      else { MOV.x = e.bx; MOV.y = e.by; MOV.v = 430; e.t -= dt;
        if (e.t <= 0) { e.estado = 0; e.t = R(2.6, 3.6); if (e.hp < e.hpMax * 0.5) anel(e.x, e.y, 10, 150, e.dano * 0.6, "semente", Math.random() * TAU); } }
    },
    colosso(e, d, dx, dy, dt) {
      const furia = e.hp < e.hpMax * 0.5;
      e.t -= dt;
      // anéis de espinhos com brechas largas (o chão pisca antes de cada um)
      if (e.t <= 0) { e.t = furia ? 2.6 : 3.4; anel(e.x, e.y, 13, 145, e.dano * 0.55, "espinho", e.ang); e.ang += 0.24; if (furia) e.t4 = 0.45; }
      if (e.t4 > 0) { e.t4 -= dt; if (e.t4 <= 0) anel(e.x, e.y, 13, 120, e.dano * 0.55, "espinho", e.ang); }
      e.t2 -= dt;
      if (e.t2 <= 0) { e.t2 = 6.5; erupcao(5, 180); }
    },
    matriarca(e, d, dx, dy, dt) {
      const fase = e.hp > e.hpMax * 0.66 ? 1 : e.hp > e.hpMax * 0.33 ? 2 : 3;
      if (fase === 3) MOV.v = 48;
      e.t -= dt;
      if (e.estado === 0) { if (e.t <= 0) { e.estado = 1; e.t = 2.2; e.t4 = 0; } }
      else {
        e.t4 -= dt;
        if (e.t4 <= 0) {
          e.t4 = 0.17;
          const n = fase + 1;
          for (let k = 0; k < n; k++) tiroInimigo(e.x, e.y - 30, e.ang + k * TAU / n, 135, e.dano * 0.5, "esporo", 4.5);
          e.ang += 0.3;
        }
        if (e.t <= 0) { e.estado = 0; e.t = fase === 3 ? 2 : 3; }
      }
      e.t2 -= dt;
      if (e.t2 <= 0) { e.t2 = [0, 7, 5.5, 4][fase]; erupcao(4 + fase * 2, 220); }
      e.t3 -= dt;
      if (e.t3 <= 0) {
        e.t3 = 10;
        const raio = Math.hypot(VW, VH) / 2 + 20;
        invocarAoRedor("orquidea", 6, raio);
        invocarAoRedor(fase >= 2 ? "dioneia" : "broto", 6, raio);
      }
    },
  };

  function atualizarInimigos(dt) {
    const distRecicla = Math.hypot(VW, VH) / 2 + 380;
    const L = J.inimigos;
    for (let i = 0; i < L.length; i++) {
      const e = L[i];
      if (e.morto) continue;
      if (e.flash > 0) e.flash -= dt;
      if (e.queima > 0) {
        e.queima -= dt; e.tickQ -= dt;
        if (e.tickQ <= 0) { e.tickQ = 0.35; ferir(e, e.danoQ, e.armaQ); if (e.morto) continue; }
      }
      e.x += e.kx * dt; e.y += e.ky * dt;
      const dec = Math.max(0, 1 - 9 * dt); e.kx *= dec; e.ky *= dec;
      let dx = J.px - e.x, dy = J.py - e.y;
      const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
      if (e.afixo === "regenera" && e.hp < e.hpMax) e.hp = Math.min(e.hpMax, e.hp + e.hpMax * 0.02 * dt);
      if (e.afixo === "espinhosa" && !J.morto && d < e.r * 2.2 + 40 + J.r) ferirJogador(e.dano * 0.35);
      if (e.atordoado > 0) { e.atordoado -= dt; continue; }
      MOV.x = dx; MOV.y = dy; MOV.v = e.vel * (e.lento > J.tempo ? 0.55 : 1);
      if (J.morto) MOV.v *= 0.3;
      if (e.ia) IA[e.ia](e, d, dx, dy, dt);
      if (e.morto) continue;
      e.x += MOV.x * MOV.v * dt; e.y += MOV.y * MOV.v * dt;
      if (MOV.v > 1 && Math.abs(MOV.x) > 0.15) e.esq = MOV.x < 0;
      if (!e.inofensivo && e.nasce <= 0 && !J.morto && d < e.r + J.r - 3) {
        if (e.ia === "kamikaze") { explodirOrquidea(e); continue; }
        ferirJogador(e.dano);
      }
      if (d > distRecicla) reciclar(e);
    }
  }

  // Planta que ficou muito para trás reaparece à sua frente
  function reciclar(e) {
    if (e.tipo === "raiz" || e.tipo === "barril") { e.morto = true; e.removido = true; return; }
    const [x, y] = pontoBorda(e.chefe ? 90 : 60, true);
    e.x = x; e.y = y;
  }

  function separar() {
    const L = J.inimigos;
    for (let i = 0; i < L.length; i++) {
      const e = L[i];
      if (e.morto || e.grande || e.vel === 0) continue;
      const cx = Math.floor(e.x / CEL), cy = Math.floor(e.y / CEL);
      for (let ox = -1; ox <= 1; ox++) for (let oy = -1; oy <= 1; oy++) {
        const b = baldes[chaveCel(cx + ox, cy + oy)];
        for (let j = 0; j < b.length; j++) {
          const o = b[j];
          if (o === e || o.morto) continue;
          const dx = e.x - o.x, dy = e.y - o.y, rr = (e.r + o.r) * 0.85;
          const d2 = dx * dx + dy * dy;
          if (d2 < rr * rr && d2 > 0.0001) {
            const d = Math.sqrt(d2), emp = (rr - d) / d * 0.22;
            e.x += dx * emp; e.y += dy * emp;
          }
        }
      }
    }
    for (const g of J.grandes) {
      if (g.morto) continue;
      const lst = perto(g.x, g.y, g.r);
      for (let i = 0; i < lst.length; i++) {
        const o = lst[i];
        if (o === g || o.grande || o.vel === 0) continue;
        const dx = o.x - g.x, dy = o.y - g.y, d = Math.hypot(dx, dy) || 1, rr = g.r + o.r * 0.8;
        if (d < rr) { o.x += dx / d * (rr - d) * 0.5; o.y += dy / d * (rr - d) * 0.5; }
      }
    }
  }

  function explodirOrquidea(e) {
    e.morto = true; e.removido = true;
    explosao(e.x, e.y, 60, "#ff6be6");
    J.tremor = Math.min(12, J.tremor + 5);
    if (Math.hypot(J.px - e.x, J.py - e.y) < 60 + J.r) ferirJogador(e.dano);
    const lst = perto(e.x, e.y, 60);
    for (let i = 0; i < lst.length; i++) if (lst[i] !== e && !lst[i].chefe) ferir(lst[i], 30, null);
    Som.tocar("explosao");
  }

  function atualizarTirosInimigos(dt) {
    for (const p of J.tirosIni) {
      p.vida -= dt;
      if (p.guia) {
        const a = Math.atan2(p.vy, p.vx), alvo = Math.atan2(J.py - p.y, J.px - p.x);
        const na = girarPara(a, alvo, p.guia * dt);
        p.vx = Math.cos(na) * p.vel; p.vy = Math.sin(na) * p.vel;
      }
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.rot += dt * 8;
      if (!J.morto && Math.hypot(J.px - p.x, J.py - 4 - p.y) < p.r + J.r - 2) { ferirJogador(p.dano); p.vida = 0; faiscas(p.x, p.y, 4, "#ff9fd8"); }
    }
    J.tirosIni = J.tirosIni.filter(p => p.vida > 0);
  }

  function atualizarAvisos(dt) {
    for (const av of J.avisos) {
      av.t += dt;
      if (av.t < av.dur) continue;
      av.feito = true;
      criarInimigo("raiz", av.x, av.y);
      poeira(av.x, av.y + 10, 14);
      J.tremor = Math.min(10, J.tremor + 2);
      if (!J.morto && Math.hypot(J.px - av.x, J.py - av.y) < av.r + J.r) ferirJogador(12 * escalaDano(J.tempo));
    }
    J.avisos = J.avisos.filter(av => !av.feito);
  }

  // ========================================================
  // 11. DANO, MORTE E COLETÁVEIS
  // ========================================================
  function ferir(e, dano, arma, kx = 0, ky = 0, critForcado = false) {
    if (e.morto) return;
    const crit = critForcado || Math.random() < J.mod.crit;
    let d = dano * (crit ? 2 : 1);
    if (e.armadura) d = Math.max(d * 0.3, d - e.armadura);
    const efetivo = Math.min(d, e.hp);
    e.hp -= d;
    e.flash = 0.09;
    if (arma) arma.total += efetivo;
    if (kx || ky) { e.kx += kx * e.kbRes; e.ky += ky * e.kbRes; }
    if (meta.opcoes.numeros) numero(e.x + R(-6, 6), e.y - e.r * 0.9, d, crit ? 1 : 0);
    if (e.hp <= 0) {
      matar(e);
      if (arma && arma.s && arma.s.cura && !J.morto && !e.inofensivo) J.hp = Math.min(J.hpMax, J.hp + arma.s.cura);
    } else Som.tocar("acerto");
  }

  function ferirJogador(dano) {
    if (J.invuln > 0 || J.morto || debug.invencivel) return;
    const d = Math.max(1, dano - J.mod.armadura);
    J.hp -= d;
    J.invuln = 0.5;
    J.flashDano = 0.3;
    if (meta.opcoes.tremor) J.tremor = Math.min(10, J.tremor + 4);
    numero(J.px, J.py - 30, d, 2);
    Som.tocar("dor");
    if (J.hp <= 0) morrer();
  }

  function matar(e) {
    e.morto = true;
    if (e.tipo === "barril") {
      const tipo = sortearChave({ cura: 34, ima: 16, bomba: 12, sucata: 36, equip: 2 });
      if (tipo === "equip") soltarItem("equip", e.x, e.y, novoItem());
      else soltarItem(tipo, e.x, e.y, tipo === "sucata" ? RI(5, 10) : 1);
      for (let i = 0; i < 10; i++) { const a = Math.random() * TAU, v = R(60, 180); particula(e.x, e.y, Math.cos(a) * v, Math.sin(a) * v - 60, 0.6, R(3, 6), Math.random() < 0.5 ? "#d9661f" : "#5a2a12", 0, 1.5, 300); }
      Som.tocar("acerto");
      return;
    }
    J.abates++;
    const n = e.chefe ? 60 : e.elite ? 26 : 7;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * TAU, v = R(40, 170) * (e.chefe ? 2 : 1);
      particula(e.x + R(-e.r, e.r) * 0.5, e.y + R(-e.r, e.r) * 0.5, Math.cos(a) * v, Math.sin(a) * v - 40, R(0.35, 0.7), R(3, 6),
        Math.random() < 0.6 ? (Math.random() < 0.5 ? "#4fbf4a" : "#2c7a29") : "#a3ff4f", Math.random() < 0.25 ? 1 : 0, 2, 220);
    }
    Som.tocar("morte");
    if (e.xp > 0) soltarGema(e.x, e.y, e.xp);
    if (Math.random() < 0.015) soltarItem("sucata", e.x + R(-8, 8), e.y + R(-8, 8), RI(1, 3));
    if (Math.random() < 0.005) soltarItem("cura", e.x, e.y);
    if (e.tipo === "cacto") anel(e.x, e.y, e.elite ? 8 : 4, 120, e.dano * 0.45, "espinho", Math.random() * TAU, 1.0);
    if (e.elite) {
      soltarItem("bau", e.x, e.y, 1);
      if (Math.random() < 0.3) soltarItem("equip", e.x - 20, e.y + 10, novoItem());
      soltarItem("sucata", e.x + 20, e.y, RI(8, 14));
      explosao(e.x, e.y, 70, "#ffd34d");
    }
    if (e.chefe) {
      J.chefesMortos++;
      J.tremor = 16; J.flashBranco = 0.7;
      explosao(e.x, e.y, e.r * 2.4, "#ff2bd6");
      Som.tocar("bomba");
      soltarItem("bau", e.x, e.y, 3);
      for (let i = 0; i < 10; i++) soltarItem("sucata", e.x + R(-70, 70), e.y + R(-70, 70), RI(3, 6));
      // chefes sempre deixam equipamento, e os mais fortes deixam itens melhores
      const pesosChefe = { rainha: [40, 40, 17, 3], colosso: [15, 45, 32, 8], matriarca: [0, 25, 50, 25] }[e.tipo] || undefined;
      soltarItem("equip", e.x + 40, e.y + 20, novoItem(pesosChefe));
      if (J.chefe === e) J.chefe = J.grandes.find(g => g.chefe && !g.morto) || null;
      if (INIMIGOS[e.tipo].final) vencer();
      else faixa(`${INIMIGOS[e.tipo].nome} derrotado!`, "Pegue a Caixa de Suprimentos", "#ffd34d");
    }
  }

  function vencer() {
    J.vitoria = true;
    J.fimEm = J.tempo + 4;
    faixa("A Árvore-Mãe caiu!", "A selva murcha ao seu redor...", "#a3ff4f");
    Som.tocar("vitoria");
    for (const e of J.inimigos) {
      if (e.morto) continue;
      e.morto = true; e.removido = e.tipo === "barril";
      if (e.tipo !== "barril") { poeira(e.x, e.y, 3); J.abates++; }
    }
  }

  function morrer() {
    if (J.revives > 0) {
      J.revives--;
      J.hp = J.hpMax * 0.5; J.invuln = 2.5;
      J.aneis.push({ r: 8, rmax: 260, vel: 900, dano: 50, arma: null, ids: new Set(), fim: 0, cor: "#facc15", empurrao: 3, atordoa: 1 });
      faixa("Desfibrilador ativado!", "Segunda chance — não desperdice", "#facc15");
      Som.tocar("evolucao");
      return;
    }
    J.hp = 0; J.morto = true;
    J.fimEm = J.tempo + 1.8;
    explosao(J.px, J.py, 50, "#ff4d6d");
    for (let i = 0; i < 30; i++) { const a = Math.random() * TAU, v = R(60, 220); particula(J.px, J.py - 8, Math.cos(a) * v, Math.sin(a) * v, 0.8, R(3, 6), Math.random() < 0.5 ? "#22e5ff" : "#d9601c", Math.random() < 0.5 ? 1 : 0, 1.5, 200); }
    Som.tocar("derrota");
  }

  function soltarGema(x, y, v) {
    J.gemas.push({ x, y, v, tier: tierGema(v), puxada: false, vel: 0, fase: Math.random() * TAU });
    if (J.gemas.length > 450) {
      // funde a gema mais antiga na seguinte, para não pesar
      const g = J.gemas.shift();
      J.gemas[0].v += g.v; J.gemas[0].tier = tierGema(J.gemas[0].v);
    }
  }
  const tierGema = v => (v >= 50 ? 3 : v >= 12 ? 2 : v >= 3 ? 1 : 0);
  function soltarItem(tipo, x, y, valor = 1) { J.itens.push({ tipo, x, y, valor, puxado: false, vel: 0, fase: Math.random() * TAU }); }

  function atualizarGemas(dt) {
    const ima2 = J.mod.ima * J.mod.ima;
    for (const g of J.gemas) {
      const dx = J.px - g.x, dy = J.py - g.y, d2 = dx * dx + dy * dy;
      if (!g.puxada && d2 < ima2) { g.puxada = true; g.vel = -140; }
      if (!g.puxada || J.morto) continue;
      g.vel = Math.min(950, g.vel + 1500 * dt);
      const d = Math.sqrt(d2) || 1, passo = Math.min(d, g.vel * dt);
      g.x += dx / d * passo; g.y += dy / d * passo;
      if (d < J.r + 6) {
        g.coletada = true;
        ganharXP(g.v);
        J.comboGema++; J.tComboGema = 0.45;
        Som.tocar("gema", J.comboGema);
      }
    }
    J.gemas = J.gemas.filter(g => !g.coletada);
    if (J.tComboGema > 0) { J.tComboGema -= dt; if (J.tComboGema <= 0) J.comboGema = 0; }
  }

  function atualizarItens(dt) {
    const ima2 = J.mod.ima * J.mod.ima;
    for (const it of J.itens) {
      const dx = J.px - it.x, dy = J.py - it.y, d2 = dx * dx + dy * dy;
      const limite = it.tipo === "sucata" ? ima2 : it.tipo === "equip" ? 60 * 60 : 45 * 45;
      if (!it.puxado && d2 < limite) { it.puxado = true; it.vel = -100; }
      if (!it.puxado || J.morto) continue;
      it.vel = Math.min(800, it.vel + 1300 * dt);
      const d = Math.sqrt(d2) || 1, passo = Math.min(d, it.vel * dt);
      it.x += dx / d * passo; it.y += dy / d * passo;
      if (d < J.r + 8) { it.coletado = true; coletar(it); }
    }
    J.itens = J.itens.filter(it => !it.coletado);
  }

  function coletar(it) {
    switch (it.tipo) {
      case "sucata":
        J.sucata += it.valor;
        numero(J.px, J.py - 34, "+" + it.valor, 4);
        Som.tocar("sucata");
        break;
      case "cura": {
        const c = Math.round(J.hpMax * 0.3);
        J.hp = Math.min(J.hpMax, J.hp + c);
        numero(J.px, J.py - 34, "+" + c, 3);
        Som.tocar("item");
        break;
      }
      case "ima":
        for (const g of J.gemas) if (!g.puxada) { g.puxada = true; g.vel = -60; }
        for (const s of J.itens) if (s.tipo === "sucata" && !s.puxado) { s.puxado = true; s.vel = -60; }
        faixa("Ímã!", "Todas as células de energia vêm até você", "#60a5fa");
        Som.tocar("item");
        break;
      case "bomba":
        bombaEMP();
        break;
      case "bau":
        abrirBau(it.valor);
        break;
      case "equip": {
        const item = it.valor, rar = RARIDADES[item.r];
        J.achados.push(item);
        faixa(nomeItem(item), `${ENCAIXES[MODELOS[item.m].enc]} ${rar.nome.toLowerCase()} — vai para o Arsenal no fim da expedição`, rar.cor);
        Som.tocar(item.r >= 2 ? "raro" : "item");
        numero(J.px, J.py - 34, rar.nome, 4);
        break;
      }
    }
  }

  function bombaEMP() {
    J.flashBranco = 0.6; J.tremor = 14;
    J.aneis.push({ r: 10, rmax: ALC, vel: ALC / 0.4, dano: 0, arma: null, ids: new Set(), fim: 0, cor: "#22e5ff", empurrao: 0, atordoa: 0 });
    for (const e of J.inimigos) {
      if (e.morto || e.inofensivo) continue;
      if (Math.abs(e.x - J.px) > VW / 2 + 40 || Math.abs(e.y - J.py) > VH / 2 + 40) continue;
      if (e.chefe) ferir(e, 300 + e.hpMax * 0.03, null);
      else ferir(e, e.hp + 1, null);
    }
    Som.tocar("bomba");
  }

  // ========================================================
  // 12. PROGRESSÃO: NÍVEIS, CARTAS, BAÚS E EVOLUÇÕES
  // ========================================================
  function ganharXP(v) {
    J.xp += v * J.mod.xp;
    while (J.xp >= J.xpReq) {
      J.xp -= J.xpReq;
      J.nivel++;
      J.xpReq = reqXP(J.nivel);
      J.nivelPend++;
    }
  }

  // passivo que faz cada arma evoluir (e o inverso)
  const parDoPassivo = id => Object.keys(ARMAS).filter(a => ARMAS[a].evolui && ARMAS[a].evolui.com === id);
  const temArmaBase = id => J.armas.some(a => a.id === id);

  function gerarOpcoes(n = 3, soMelhorias = false) {
    const pool = [];
    for (const a of J.armas) if (a.nivel < maxNivelArma(a.id)) {
      const par = ARMAS[a.id].evolui;
      pool.push({ tipo: "arma", id: a.id, peso: 10 + (par && nivelPassivo(par.com) ? 3 : 0) });
    }
    if (!soMelhorias && J.armas.length < 6) for (const id in ARMAS) {
      const d = ARMAS[id];
      if (d.evo || temArmaBase(id) || J.evoluidas.includes(id)) continue;
      pool.push({ tipo: "arma", id, novo: true, peso: 6 });
    }
    for (const p of J.passivos) if (p.nivel < PASSIVOS[p.id].max) pool.push({ tipo: "passivo", id: p.id, peso: 7 });
    if (!soMelhorias && J.passivos.length < 6) for (const id in PASSIVOS) {
      if (J.passivos.some(p => p.id === id)) continue;
      const combina = parDoPassivo(id).some(temArmaBase);
      pool.push({ tipo: "passivo", id, novo: true, peso: combina ? 9 : 4 });
    }
    const res = [];
    while (res.length < n && pool.length) { const o = sortearPeso(pool); res.push(o); pool.splice(pool.indexOf(o), 1); }
    if (!res.length && !soMelhorias) { res.push({ tipo: "cura" }); if (n > 1) res.push({ tipo: "sucata" }); }
    return res;
  }

  function infoOpcao(o) {
    if (o.tipo === "arma") {
      const d = ARMAS[o.id], a = J.armas.find(x => x.id === o.id), nv = a ? a.nivel : 0;
      const par = d.evolui;
      return {
        classe: "arma", ico: ARTE.icone(d.tipo, d.evo), nome: d.nome,
        tag: o.novo ? "Nova arma" : `Nível ${nv} → ${nv + 1}${nv + 1 === maxNivelArma(o.id) ? " (máx.)" : ""}`,
        txt: o.novo ? d.desc : d.niveis[nv - 1].txt,
        combina: par ? { ico: ARTE.icone(par.com), txt: `Evolui com ${PASSIVOS[par.com].nome}`, pronto: nivelPassivo(par.com) > 0 } : null,
      };
    }
    if (o.tipo === "passivo") {
      const d = PASSIVOS[o.id], nv = nivelPassivo(o.id);
      const armas = parDoPassivo(o.id);
      const tem = armas.find(temArmaBase);
      const arma = tem || armas[0];
      return {
        classe: "passivo", ico: ARTE.icone(o.id), nome: d.nome,
        tag: o.novo ? "Novo módulo" : `Nível ${nv} → ${nv + 1}`,
        txt: `${d.por} <span style="color:#7f9aab">(total: ${d.tot(nv + 1)})</span>`,
        combina: arma ? { ico: ARTE.icone(ARMAS[arma].tipo), txt: `Faz evoluir: ${ARMAS[arma].nome}`, pronto: !!tem } : null,
      };
    }
    if (o.tipo === "cura") return { classe: "extra", ico: ARTE.retratoSprite("cura"), nome: "Ração de emergência", tag: "Extra", txt: "Recupera 40% da vida." };
    return { classe: "extra", ico: ARTE.icone("sucata"), nome: "Pilha de sucata", tag: "Extra", txt: "+25 de sucata." };
  }

  function aplicarOpcao(o) {
    if (o.tipo === "arma") {
      const a = J.armas.find(x => x.id === o.id);
      if (a) a.nivel++; else darArma(o.id);
    } else if (o.tipo === "passivo") {
      const p = J.passivos.find(x => x.id === o.id);
      if (p) p.nivel++; else J.passivos.push({ id: o.id, nivel: 1 });
    } else if (o.tipo === "cura") J.hp = Math.min(J.hpMax, J.hp + J.hpMax * 0.4);
    else if (o.tipo === "sucata") J.sucata += 25;
    recalcular();
    renderSlots();
  }

  let opcoesAtuais = [], travaAte = 0;
  function abrirNivel() {
    estado = "nivel";
    J.nivelPend--;
    opcoesAtuais = gerarOpcoes(3);
    renderCartas();
    $("m-nivel").hidden = false;
    travaAte = performance.now() + 380;
    Som.tocar("nivel");
    for (let i = 0; i < 24; i++) { const a = i / 24 * TAU; particula(J.px, J.py - 6, Math.cos(a) * 200, Math.sin(a) * 200, 0.5, 8, "#22e5ff", 1, 3, 0, 1); }
  }
  function renderCartas() {
    $("nivel-sub").textContent = `Nível ${J.nivel - J.nivelPend} — escolha uma melhoria`;
    $("cartas").innerHTML = opcoesAtuais.map((o, i) => {
      const f = infoOpcao(o);
      return `<button class="carta ${f.classe}" data-i="${i}">
        <span class="tecla">${i + 1}</span>
        <div class="topo-c"><img class="ico-c" src="${f.ico}" alt=""><div><b>${f.nome}</b><span class="tag">${f.tag}</span></div></div>
        <p>${f.txt}</p>
        ${f.combina ? `<div class="combina ${f.combina.pronto ? "pronto" : ""}"><img src="${f.combina.ico}" alt="">${f.combina.txt}${f.combina.pronto ? " ✓" : ""}</div>` : ""}
      </button>`;
    }).join("");
    const b = $("btn-reroll");
    b.textContent = `Trocar opções (${J.rerolls})`;
    b.disabled = J.rerolls <= 0;
  }
  function escolher(i) {
    if (estado !== "nivel" || performance.now() < travaAte || !opcoesAtuais[i]) return;
    aplicarOpcao(opcoesAtuais[i]);
    Som.tocar("clique");
    $("m-nivel").hidden = true;
    estado = "jogando";
  }
  function rerolar() {
    if (estado !== "nivel" || J.rerolls <= 0) return;
    J.rerolls--;
    opcoesAtuais = gerarOpcoes(3);
    renderCartas();
    travaAte = performance.now() + 250;
    Som.tocar("clique");
  }

  const elegivel = a => { const d = ARMAS[a.id]; return d.evolui && a.nivel >= maxNivelArma(a.id) && nivelPassivo(d.evolui.com) > 0; };
  function evoluir(a) {
    J.evoluidas.push(a.id);
    a.id = ARMAS[a.id].evolui.em;
    a.nivel = 1; a.t = 0; a.ativo = 0; a.pos.length = 0;
    recalcular();
    renderSlots();
  }

  function abrirBau(qtd) {
    estado = "bau";
    const premios = [];
    const cand = J.armas.find(elegivel);
    if (cand) {
      const de = ARMAS[cand.id].nome;
      evoluir(cand);
      const d = ARMAS[cand.id];
      premios.push({ evo: true, ico: ARTE.icone(d.tipo, true), nome: `EVOLUÇÃO: ${d.nome}`, txt: `${de} evoluiu! ${d.desc}` });
      qtd--;
    }
    for (let i = 0; i < qtd; i++) {
      const [o] = gerarOpcoes(1, true);
      if (!o) break;
      const f = infoOpcao(o);
      aplicarOpcao(o);
      premios.push({ ico: f.ico, nome: f.nome, txt: `${f.tag} — ${f.txt}` });
    }
    const suc = RI(10, 20) * (premios.length >= 3 ? 2 : 1);
    J.sucata += suc;
    premios.push({ ico: ARTE.icone("sucata"), nome: `+${suc} de sucata`, txt: "Peças recuperadas da caixa." });
    if (premios.length === 1) { J.hp = J.hpMax; premios.push({ ico: ARTE.retratoSprite("cura"), nome: "Kit médico completo", txt: "Vida restaurada ao máximo." }); }

    const img = $("bau-img");
    img.src = ARTE.retratoSprite("bau", 160);
    img.className = "tremer";
    $("bau-titulo").textContent = cand ? "Evolução!" : "Caixa de suprimentos";
    $("premios").innerHTML = "";
    $("btn-bau").hidden = true;
    $("m-bau").hidden = false;
    Som.tocar("bau");
    $("bau-palco").classList.remove("aberto");
    setTimeout(() => {
      img.className = "abrir";
      setTimeout(() => $("bau-palco").classList.add("aberto"), 420);
      if (cand) Som.tocar("evolucao");
      $("premios").innerHTML = premios.map((p, i) => `
        <div class="premio ${p.evo ? "evo" : ""}" style="animation-delay:${i * 0.12}s">
          <img src="${p.ico}" alt=""><div><b>${p.nome}</b><span>${p.txt}</span></div>
        </div>`).join("");
      $("btn-bau").hidden = false;
      $("btn-bau").focus({ preventScroll: true });
    }, 950);
  }
  function fecharBau() {
    if (estado !== "bau") return;
    $("m-bau").hidden = true;
    estado = "jogando";
  }

  // ========================================================
  // 13. EFEITOS VISUAIS (partículas, números, explosões)
  // ========================================================
  // tipo: 0 = pedaço sólido, 1 = brilho aditivo
  function particula(x, y, vx, vy, vida, tam, cor, tipo = 0, arrasto = 2, grav = 0, cresce = 0) {
    if (J.particulas.length > 1400) return;
    J.particulas.push({ x, y, vx, vy, vida, vidaMax: vida, tam, cor, tipo, arrasto, grav, cresce, rot: Math.random() * TAU });
  }
  function faiscas(x, y, n, cor) {
    for (let i = 0; i < n; i++) { const a = Math.random() * TAU, v = R(80, 220); particula(x, y, Math.cos(a) * v, Math.sin(a) * v, 0.18, R(3, 5), cor, 1, 6); }
  }
  function poeira(x, y, n) {
    for (let i = 0; i < n; i++) { const a = Math.random() * TAU, v = R(30, 110); particula(x, y, Math.cos(a) * v, Math.sin(a) * v * 0.5 - 30, R(0.4, 0.7), R(3, 6), Math.random() < 0.5 ? "#5a3d2b" : "#3a2a20", 0, 3, 120); }
  }
  function explosao(x, y, r, cor) {
    J.explosoes.push({ x, y, r, vida: 0.35, vidaMax: 0.35, cor });
    for (let i = 0; i < Math.min(20, r / 3); i++) { const a = Math.random() * TAU, v = R(60, 260) * r / 50; particula(x, y, Math.cos(a) * v, Math.sin(a) * v, R(0.25, 0.5), R(5, 10), Math.random() < 0.5 ? cor : "#fff1c2", 1, 4, 0, 1); }
  }
  // estilo: 0 normal, 1 crítico, 2 dano no jogador, 3 cura, 4 sucata
  function numero(x, y, v, estilo = 0) {
    if (J.numeros.length > 140) J.numeros.splice(0, 20);
    J.numeros.push({ x, y, txt: typeof v === "number" ? String(Math.max(1, Math.round(v))) : v, estilo, vida: 0.7 });
  }
  function atualizarEfeitos(dt) {
    for (const p of J.particulas) {
      p.vida -= dt;
      const a = Math.max(0, 1 - p.arrasto * dt);
      p.vx *= a; p.vy = p.vy * a + p.grav * dt;
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.tam += p.cresce * p.tam * dt;
      p.rot += dt * 6;
    }
    J.particulas = J.particulas.filter(p => p.vida > 0);
    for (const n of J.numeros) { n.vida -= dt; n.y -= 34 * dt; }
    J.numeros = J.numeros.filter(n => n.vida > 0);
    for (const x of J.explosoes) x.vida -= dt;
    J.explosoes = J.explosoes.filter(x => x.vida > 0);
    for (const r of J.raios) r.vida -= dt;
    J.raios = J.raios.filter(r => r.vida > 0);
  }

  function limparMortos() {
    let w = 0;
    const L = J.inimigos;
    for (let i = 0; i < L.length; i++) if (!L[i].morto) L[w++] = L[i];
    L.length = w;
    if (J.grandes.some(e => e.morto)) J.grandes = J.grandes.filter(e => !e.morto);
    if (J.tiros.length) J.tiros = J.tiros.filter(p => !p.morto);
  }

  // ========================================================
  // 14. ATUALIZAÇÃO DE UM PASSO DA SIMULAÇÃO
  // ========================================================
  function moverJogador(dt) {
    if (J.morto) { J.andando = false; J.vx = J.vy = 0; return; }
    let dx = 0, dy = 0, mag = 0;
    const T = entrada.teclas;
    const kx = (T.has("d") || T.has("arrowright") ? 1 : 0) - (T.has("a") || T.has("arrowleft") ? 1 : 0);
    const ky = (T.has("s") || T.has("arrowdown") ? 1 : 0) - (T.has("w") || T.has("arrowup") ? 1 : 0);
    if (kx || ky) { const l = Math.hypot(kx, ky); dx = kx / l; dy = ky / l; mag = 1; }
    else if (entrada.toque) {
      const tx = entrada.toque.x - entrada.toque.ox, ty = entrada.toque.y - entrada.toque.oy, l = Math.hypot(tx, ty);
      if (l > 6) { dx = tx / l; dy = ty / l; mag = Math.min(1, (l - 6) / 40); }
    } else if (entrada.mouseDentro && (meta.opcoes.mouse === "sempre" || entrada.mousePres)) {
      // a câmera fica centrada no jogador: a direção é do centro da tela até o cursor
      const wx = (entrada.mx - W / dpr / 2) / zoom, wy = (entrada.my - H / dpr / 2) / zoom + 6, l = Math.hypot(wx, wy);
      if (l > 10) { dx = wx / l; dy = wy / l; mag = Math.min(1, (l - 10) / 55); }
    }
    J.andando = mag > 0.05;
    if (J.andando) { J.dirX = dx; J.dirY = dy; if (Math.abs(dx) > 0.12) J.esq = dx < 0; }
    const v = J.mod.vel * mag;
    J.vx = dx * v; J.vy = dy * v;
    J.px += J.vx * dt; J.py += J.vy * dt;
  }

  function atualizar(dt) {
    J.tempo += dt;
    processarEventos();
    spawnar(dt);
    moverJogador(dt);
    montarGrade();
    if (!J.morto) for (const a of J.armas) COMPORT[ARMAS[a.id].tipo](a, dt);
    atualizarTiros(dt);
    atualizarAneis(dt);
    atualizarGranadas(dt);
    atualizarPocas(dt);
    atualizarMinas(dt);
    atualizarGolpes(dt);
    atualizarAvisos(dt);
    atualizarInimigos(dt);
    separar();
    atualizarTirosInimigos(dt);
    atualizarGemas(dt);
    atualizarItens(dt);
    atualizarEfeitos(dt);
    limparMortos();
    if (!J.morto) J.hp = Math.min(J.hpMax, J.hp + J.mod.regen * dt);
    if (J.invuln > 0) J.invuln -= dt;
    J.tremor = Math.max(0, J.tremor - 30 * dt);
    if (J.flashDano > 0) J.flashDano -= dt;
    if (J.flashBranco > 0) J.flashBranco -= dt;
    cam.x = J.px; cam.y = J.py;
    if (J.fimEm != null && J.tempo >= J.fimEm) terminar(J.vitoria);
  }

  // ========================================================
  // 15. DESENHO
  // ========================================================
  let Z = 1, BX = 0, BY = 0, VX0 = 0, VY0 = 0, VX1 = 0, VY1 = 0;
  let tAnim = 0; // relógio das animações (pausa junto com o jogo)
  const ORDEM = [];
  const base = () => ctx.setTransform(Z, 0, 0, Z, BX, BY);
  const vis = (x, y, m) => x > VX0 - m && x < VX1 + m && y > VY0 - m && y < VY1 + m;

  function carimbo(img, x, y, tam, esq = false, sx = 1, sy = 1, rot = 0, alfa = 1) {
    const kx = (esq ? -sx : sx) * Z, ky = sy * Z;
    if (rot) { const c = Math.cos(rot), s = Math.sin(rot); ctx.setTransform(c * kx, s * kx, -s * ky, c * ky, BX + x * Z, BY + y * Z); }
    else ctx.setTransform(kx, 0, 0, ky, BX + x * Z, BY + y * Z);
    if (alfa !== 1) ctx.globalAlpha = alfa;
    ctx.drawImage(img, -tam / 2, -tam / 2, tam, tam);
    if (alfa !== 1) ctx.globalAlpha = 1;
  }
  function brilhoEm(cor, x, y, tam, alfa = 1) {
    if (alfa !== 1) ctx.globalAlpha = alfa;
    ctx.drawImage(ARTE.brilho(cor), x - tam / 2, y - tam / 2, tam, tam);
    if (alfa !== 1) ctx.globalAlpha = 1;
  }

  function criarVinhetas() {
    const fazer = (cor, ini) => {
      const c = document.createElement("canvas"); c.width = W; c.height = H;
      const g = c.getContext("2d");
      const grd = g.createRadialGradient(W / 2, H / 2, Math.min(W, H) * ini, W / 2, H / 2, Math.hypot(W, H) / 2);
      grd.addColorStop(0, cor + "0)"); grd.addColorStop(1, cor + "1)");
      g.fillStyle = grd; g.fillRect(0, 0, W, H);
      return c;
    };
    vinheta = fazer("rgba(0,0,0,", 0.32);
    vinhetaVermelha = fazer("rgba(200,10,40,", 0.2);
  }

  function desenharChao() {
    const L = ARTE.LAJE;
    const cx0 = Math.floor(VX0 / L), cx1 = Math.floor(VX1 / L), cy0 = Math.floor(VY0 / L), cy1 = Math.floor(VY1 / L);
    for (let cy = cy0; cy <= cy1; cy++) for (let cx = cx0; cx <= cx1; cx++) {
      const ch = ARTE.chunk(cx, cy);
      const fx = ch.variante !== 3 && ch.espelhoX, fy = ch.variante !== 3 && ch.espelhoY;
      ctx.setTransform(fx ? -Z : Z, 0, 0, fy ? -Z : Z, BX + (cx * L + (fx ? L : 0)) * Z, BY + (cy * L + (fy ? L : 0)) * Z);
      ctx.drawImage(ARTE.laje(ch.variante), 0, 0, L + 0.5, L + 0.5);
    }
    base();
    for (let cy = cy0 - 1; cy <= cy1 + 1; cy++) for (let cx = cx0 - 1; cx <= cx1 + 1; cx++) {
      const ch = ARTE.chunk(cx, cy);
      for (const p of ch.props) {
        const x = cx * L + p.x, y = cy * L + p.y, t = ARTE.PROPS[p.tipo].caixa;
        if (!vis(x, y, t / 2)) continue;
        ctx.drawImage(ARTE.prop(p.tipo, p.var_), x - t / 2, y - t / 2, t, t);
      }
    }
  }

  // Partículas decorativas no ar (esporos flutuando)
  const motes = Array.from({ length: 46 }, () => ({ x: Math.random() * 2000 - 1000, y: Math.random() * 1400 - 700, vx: R(-8, 8), vy: R(-14, -4), tam: R(6, 14), cor: Math.random() < 0.6 ? "#7dff8a" : "#22e5ff", fase: Math.random() * TAU }));
  function desenharMotes(dt) {
    const w = VX1 - VX0 + 100, h = VY1 - VY0 + 100;
    ctx.globalCompositeOperation = "lighter";
    for (const m of motes) {
      m.x += m.vx * dt; m.y += m.vy * dt;
      if (m.x < VX0 - 50) m.x += w; else if (m.x > VX1 + 50) m.x -= w;
      if (m.y < VY0 - 50) m.y += h; else if (m.y > VY1 + 50) m.y -= h;
      brilhoEm(m.cor, m.x + Math.sin(tAnim + m.fase) * 6, m.y, m.tam, 0.35 + 0.25 * Math.sin(tAnim * 2 + m.fase));
    }
    ctx.globalCompositeOperation = "source-over";
  }

  // Plantas decorativas do menu inicial
  const vitrine = [];
  function montarVitrine() {
    const tipos = ["broto", "broto", "cipo", "dioneia", "orquidea", "esporo", "cacto", "girassol", "broto", "cipo", "dioneia", "esporo"];
    vitrine.length = 0;
    for (const t of tipos) vitrine.push({ tipo: t, x: R(-700, 700), y: R(-420, 420), fase: Math.random() * TAU, esq: Math.random() < 0.5 });
  }

  function desenharEntidade(e) {
    const def = INIMIGOS[e.tipo];
    const tam = ARTE.caixa(e.tipo) * (e.r / def.r);
    const q = Math.floor(tAnim * 4 + e.fase) & 1;
    let sx = 1, sy = 1 + Math.sin(tAnim * 8 + e.fase) * 0.05, x = e.x, y = e.y, alfa = 1;
    if (e.tipo === "raiz") { const p = clamp(1 - e.nasce / 0.35, 0, 1); sy = p; y += (1 - p) * tam * 0.3; if (e.t3 < 0.4) alfa = e.t3 / 0.4; }
    if (e.tipo === "barril") sy = 1;
    if ((e.ia === "bote" || e.ia === "rainha") && e.estado === 1) { x += R(-2, 2); sx = 1.08; sy = 0.92; }
    if (e.atordoado > 0) { x += R(-1, 1); }
    if (e.ia === "rolar" && e.estado === 1) { x += R(-1.5, 1.5); sx = 0.92; sy = 1.08; }
    if (e.ia === "pisao" && e.estado === 1) { sy = 1 + 0.12 * Math.sin(clamp(1 - e.t / 0.85, 0, 1) * Math.PI); }
    if (e.ia === "voo") y += Math.sin(tAnim * 9 + e.fase) * 3;
    sx /= Math.sqrt(sy);
    const rot = e.ia === "rolar" ? e.rot : 0;
    carimbo(ARTE.sprite(e.tipo, q), x, y, tam, e.esq, sx, sy, rot, alfa);
    if (e.flash > 0) carimbo(ARTE.sprite(e.tipo, q, true), x, y, tam, e.esq, sx, sy, rot, clamp(e.flash / 0.09, 0, 1) * 0.85);
    if (e.queima > 0 && Math.random() < 0.3) particula(e.x + R(-e.r, e.r) * 0.6, e.y - R(0, e.r), R(-10, 10), -R(30, 70), 0.4, R(5, 9), "#5cc8ff", 1, 1, 0, 1);
  }

  function desenharJogo(dt) {
    const v = J;
    // sombras
    base();
    ctx.fillStyle = "rgba(0,0,0,.36)";
    ctx.beginPath();
    for (const e of ORDEM) {
      const rx = e.r * (e.chefe ? 1.1 : 0.95), ry = e.r * 0.36, sy = e.y + e.r * INIMIGOS[e.tipo].sy;
      ctx.moveTo(e.x + rx, sy); ctx.ellipse(e.x, sy, rx, ry, 0, 0, TAU);
    }
    if (!v.morto) { ctx.moveTo(v.px + 11, v.py + 19); ctx.ellipse(v.px, v.py + 19, 11, 4, 0, 0, TAU); }
    for (const it of v.itens) if (vis(it.x, it.y, 20)) { ctx.moveTo(it.x + 9, it.y + 12); ctx.ellipse(it.x, it.y + 12, 9, 3, 0, 0, TAU); }
    ctx.fill();

    // brilhos no chão (aditivo): gemas, elites, auras
    ctx.globalCompositeOperation = "lighter";
    const CORES_GEMA = ["#22d3ee", "#a3e635", "#f472f6", "#ff4d4d"];
    for (const g of v.gemas) if (vis(g.x, g.y, 20)) brilhoEm(CORES_GEMA[g.tier], g.x, g.y, 22 + g.tier * 8, 0.55);
    for (const e of ORDEM) if (e.elite) brilhoEm(e.afixo ? AFIXOS[e.afixo].cor : "#ff2bd6", e.x, e.y, e.r * 4.2, 0.4 + 0.15 * Math.sin(tAnim * 5));
    for (const it of v.itens) if (it.tipo === "bau" && vis(it.x, it.y, 40)) brilhoEm("#ffd34d", it.x, it.y, 90, 0.5 + 0.2 * Math.sin(tAnim * 4));
    for (const it of v.itens) if (it.tipo === "equip" && vis(it.x, it.y, 40)) brilhoEm(RARIDADES[it.valor.r].cor, it.x, it.y, 80 + it.valor.r * 12, 0.55 + 0.2 * Math.sin(tAnim * 5));
    ctx.globalCompositeOperation = "source-over";

    // gemas e itens
    for (const g of v.gemas) if (vis(g.x, g.y, 20)) {
      const t = "gema" + g.tier;
      carimbo(ARTE.sprite(t), g.x, g.y + Math.sin(tAnim * 4 + g.fase) * 2, ARTE.caixa(t));
    }
    for (const it of v.itens) if (vis(it.x, it.y, 30)) {
      const b = Math.sin(tAnim * 3.5 + it.fase) * 3;
      const sp = it.tipo === "equip" ? "maleta" : it.tipo;
      carimbo(ARTE.sprite(sp), it.x, it.y - 4 + b, ARTE.caixa(sp) * (it.tipo === "sucata" && it.valor > 3 ? 1.3 : 1));
    }

    // entidades ordenadas por altura (o jogador entra na ordem certa)
    let jogadorDesenhado = v.morto;
    for (const e of ORDEM) {
      if (!jogadorDesenhado && e.y > v.py) { desenharJogador(); jogadorDesenhado = true; }
      desenharEntidade(e);
    }
    if (!jogadorDesenhado) desenharJogador();

    // serras e drones
    for (const a of v.armas) {
      const tipo = ARMAS[a.id].tipo;
      if (tipo === "serras" && a.pos.length) {
        const perm = !!a.s.permanente;
        const alfa = perm ? 1 : clamp(Math.min(a.ativo, a.s.duracao - a.ativo) / 0.15, 0, 1);
        const img = ARTE.sprite(perm ? "serraOuro" : "serra"), tam = ARTE.caixa(perm ? "serraOuro" : "serra") * Math.sqrt(a.s.area) * (perm ? 1.25 : 1.4);
        for (let i = 0; i < a.pos.length; i += 2) carimbo(img, a.pos[i], a.pos[i + 1], tam, false, 1, 1, tAnim * 16, alfa);
      }
      if (tipo === "drone") for (const d of a.drones) {
        base(); ctx.fillStyle = "rgba(0,0,0,.25)"; ctx.beginPath(); ctx.ellipse(d.x, d.y + 30, 9, 3, 0, 0, TAU); ctx.fill();
        carimbo(ARTE.sprite("drone", Math.floor(tAnim * 30) & 1), d.x, d.y + Math.sin(tAnim * 5) * 2, a.id === "enxame" ? 30 : 34, Math.cos(d.ang) < 0);
      }
    }

    // granadas no ar
    for (const g of v.granadas) {
      if (g.t < 0) continue;
      const p = g.t / g.dur, x = g.x0 + (g.x1 - g.x0) * p, y = g.y0 + (g.y1 - g.y0) * p, h = Math.sin(Math.PI * p) * 70;
      base(); ctx.fillStyle = "rgba(0,0,0,.3)"; ctx.beginPath(); ctx.ellipse(x, y + 6, 5, 2, 0, 0, TAU); ctx.fill();
      carimbo(ARTE.sprite("granada"), x, y - h, 22, false, 1, 1, g.t * 14);
    }

    // minas no ar
    for (const m of v.minas) {
      if (m.t < 0 || m.t >= m.voo) continue;
      const p = m.t / m.voo, x = m.x0 + (m.x - m.x0) * p, y = m.y0 + (m.y - m.y0) * p, h = Math.sin(Math.PI * p) * 50;
      carimbo(ARTE.sprite(m.evo ? "minaEvo" : "mina", 1), x, y - h, m.evo ? 26 : 22, false, 1, 1, m.t * 12);
    }
    // discos
    for (const p of v.tiros) if (p.volta !== undefined && p.atraso <= 0 && vis(p.x, p.y, 40)) {
      const ouro = p.tipo === "discoOuro";
      carimbo(ARTE.sprite(p.tipo), p.x, p.y, ARTE.caixa(p.tipo) * p.r / (ouro ? 17 : 13), false, 1, 1, p.giro);
    }
    // mísseis (corpo sólido)
    for (const p of v.tiros) if (p.tipo === "missil" && p.atraso <= 0 && vis(p.x, p.y, 20)) carimbo(ARTE.sprite("missil"), p.x, p.y, 30, false, 1, 1, p.ang);
    // projéteis inimigos sólidos
    for (const p of v.tirosIni) if (p.tipo !== "esporo" && vis(p.x, p.y, 20)) {
      if (p.tipo === "semente") carimbo(ARTE.sprite("semente"), p.x, p.y, 16, false, 1, 1, p.rot);
      else carimbo(ARTE.sprite("espinhoP"), p.x, p.y, 18, false, 1, 1, Math.atan2(p.vy, p.vx));
    }

    // partículas sólidas
    base();
    for (const p of v.particulas) if (p.tipo === 0) {
      ctx.globalAlpha = clamp(p.vida / p.vidaMax * 1.5, 0, 1);
      ctx.fillStyle = p.cor;
      const s = p.tam;
      ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s * 0.7);
    }
    ctx.globalAlpha = 1;

    // camada aditiva: projéteis, fogo, raios, explosões
    ctx.globalCompositeOperation = "lighter";
    for (const p of v.tiros) {
      if (p.atraso > 0 || !vis(p.x, p.y, 30)) continue;
      const vl = Math.hypot(p.vx, p.vy) || 1, ux = p.vx / vl, uy = p.vy / vl;
      if (p.tipo === "plasma" || p.tipo === "fusao") {
        const f = p.tipo === "fusao";
        brilhoEm(f ? "#7df9ff" : "#22e5ff", p.x, p.y, f ? 60 : 30);
        ctx.strokeStyle = "#ffffff"; ctx.lineWidth = f ? 6 : 3; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(p.x - ux * (f ? 22 : 12), p.y - uy * (f ? 22 : 12)); ctx.lineTo(p.x, p.y); ctx.stroke();
      } else if (p.tipo === "laser" || p.tipo === "laserEvo") {
        const cor = p.tipo === "laser" ? "#ff4d6d" : "#ff7a9c";
        brilhoEm(cor, p.x, p.y, 20);
        ctx.strokeStyle = cor; ctx.lineWidth = 2.5; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(p.x - ux * 16, p.y - uy * 16); ctx.lineTo(p.x, p.y); ctx.stroke();
      } else if (p.tipo === "missil") {
        brilhoEm("#ffb020", p.x - ux * 10, p.y - uy * 10, 22);
      }
    }
    for (const p of v.tirosIni) {
      if (!vis(p.x, p.y, 20)) continue;
      if (p.tipo === "esporo") { brilhoEm("#c084fc", p.x, p.y, 30); brilhoEm("#f5d0fe", p.x, p.y, 10); }
      else if (p.tipo === "semente") brilhoEm("#ffd04a", p.x, p.y, 16, 0.5);
    }
    for (const a of v.armas) if (ARMAS[a.id].tipo === "serras" && a.pos.length) {
      const cor = a.s.permanente ? "#ffd34d" : "#22e5ff";
      for (let i = 0; i < a.pos.length; i += 2) brilhoEm(cor, a.pos[i], a.pos[i + 1], 58 * Math.sqrt(a.s.area), 0.35);
    }
    for (const p of v.tiros) if (p.volta !== undefined && p.atraso <= 0 && vis(p.x, p.y, 40)) brilhoEm(p.tipo === "discoOuro" ? "#ffd34d" : "#ff4fd8", p.x, p.y, p.r * 4, 0.45);
    // feixes do laser
    for (const a of v.armas) if (ARMAS[a.id].tipo === "laser" && a.pos.length) {
      const perm = !!a.s.permanente, comp = 250 * a.s.area, oy = v.py - 6;
      const alfa = perm ? 1 : clamp(Math.min(a.ativo, a.s.duracao - a.ativo) / 0.15, 0, 1);
      const cor = perm ? "#ffd34d" : "#ff4d6d";
      ctx.lineCap = "round";
      for (const ang of a.pos) {
        const ex = v.px + Math.cos(ang) * comp, ey = oy + Math.sin(ang) * comp;
        ctx.globalAlpha = alfa * 0.35; ctx.strokeStyle = cor; ctx.lineWidth = 22 * Math.sqrt(a.s.area);
        ctx.beginPath(); ctx.moveTo(v.px, oy); ctx.lineTo(ex, ey); ctx.stroke();
        ctx.globalAlpha = alfa * 0.8; ctx.lineWidth = 8 * Math.sqrt(a.s.area); ctx.stroke();
        ctx.globalAlpha = alfa; ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 2.5; ctx.stroke();
        ctx.globalAlpha = 1;
        brilhoEm(cor, ex, ey, 46, alfa);
        if (Math.random() < 0.5) particula(ex, ey, R(-60, 60), R(-60, 60), 0.25, R(4, 7), cor, 1, 3);
      }
      brilhoEm(cor, v.px, oy, 44, alfa);
    }
    // golpes do chicote: um arco de plasma que some rápido
    for (const g of v.golpes) {
      if (g.t < 0) continue;
      const a = g.arma, p = clamp(g.t / g.vida, 0, 1), comp = 200 * a.s.area, larg = 62 * a.s.area;
      const cx = Math.cos(g.ang), cy = Math.sin(g.ang), nx = -cy * g.lado, ny = cx * g.lado, oy = v.py - 6;
      const evo = !!a.s.critico, cor = evo ? "#ffd34d" : "#22e5ff";
      const alc = comp * (0.35 + 0.65 * Math.min(1, p * 3));
      const arco = () => {
        ctx.beginPath(); ctx.moveTo(v.px + cx * 10, oy + cy * 10);
        ctx.quadraticCurveTo(v.px + cx * alc * 0.5 + nx * larg * 0.6, oy + cy * alc * 0.5 + ny * larg * 0.6, v.px + cx * alc, oy + cy * alc);
      };
      ctx.lineCap = "round";
      ctx.globalAlpha = (1 - p) * 0.45; ctx.strokeStyle = cor; ctx.lineWidth = larg * 0.55; arco(); ctx.stroke();
      ctx.globalAlpha = (1 - p) * 0.9; ctx.lineWidth = 9; arco(); ctx.stroke();
      ctx.globalAlpha = 1 - p; ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 3; arco(); ctx.stroke();
      ctx.globalAlpha = 1;
      brilhoEm(cor, v.px + cx * alc, oy + cy * alc, 50, 1 - p);
    }
    for (const p of v.particulas) if (p.tipo === 1 && vis(p.x, p.y, 30)) brilhoEm(p.cor, p.x, p.y, p.tam * 2, clamp(p.vida / p.vidaMax, 0, 1));
    for (const r of v.raios) {
      const a = clamp(r.vida / r.vidaMax, 0, 1);
      const caminho = () => {
        ctx.beginPath(); ctx.moveTo(r.pts[0], r.pts[1]);
        for (let i = 2; i < r.pts.length; i += 2) {
          const x0 = r.pts[i - 2], y0 = r.pts[i - 1], x1 = r.pts[i], y1 = r.pts[i + 1];
          const nx = -(y1 - y0), ny = x1 - x0, l = Math.hypot(nx, ny) || 1;
          for (let k = 1; k < 4; k++) { const t = k / 4, o = R(-9, 9); ctx.lineTo(x0 + (x1 - x0) * t + nx / l * o, y0 + (y1 - y0) * t + ny / l * o); }
          ctx.lineTo(x1, y1);
        }
      };
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.globalAlpha = a * 0.45; ctx.strokeStyle = r.cor; ctx.lineWidth = r.ceu ? 10 : 7; caminho(); ctx.stroke();
      ctx.globalAlpha = a; ctx.strokeStyle = "#ffffff"; ctx.lineWidth = r.ceu ? 3 : 2; caminho(); ctx.stroke();
      ctx.globalAlpha = 1;
      for (let i = 2; i < r.pts.length; i += 2) brilhoEm(r.cor, r.pts[i], r.pts[i + 1], 26, a);
    }
    for (const x of v.explosoes) {
      const p = 1 - x.vida / x.vidaMax;
      brilhoEm(x.cor, x.x, x.y, x.r * 2.8 * (0.5 + p * 0.6), 1 - p);
      brilhoEm("#ffffff", x.x, x.y, x.r * 1.2 * (1 - p), 1 - p);
      ctx.globalAlpha = (1 - p) * 0.8; ctx.strokeStyle = x.cor; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(x.x, x.y, x.r * (0.4 + p * 0.8), 0, TAU); ctx.stroke(); ctx.globalAlpha = 1;
    }
    ctx.globalCompositeOperation = "source-over";

    // barras de vida das elites
    base();
    for (const e of ORDEM) if (e.elite && e.hp < e.hpMax) {
      const w = e.r * 2, y = e.y - e.r * 1.5 - 8;
      ctx.fillStyle = "rgba(0,0,0,.7)"; ctx.fillRect(e.x - w / 2 - 1, y - 1, w + 2, 6);
      ctx.fillStyle = "#ff2bd6"; ctx.fillRect(e.x - w / 2, y, w * e.hp / e.hpMax, 4);
    }

    // números de dano
    if (v.numeros.length) {
      ctx.font = "800 13px Orbitron, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.lineWidth = 3; ctx.strokeStyle = "rgba(0,0,0,.85)"; ctx.lineJoin = "round";
      const CORES = ["#ffffff", "#ffd34d", "#ff4d6d", "#4ade80", "#ffb020"];
      for (const n of v.numeros) {
        if (!vis(n.x, n.y, 20)) continue;
        ctx.globalAlpha = clamp(n.vida / 0.25, 0, 1);
        const s = n.estilo === 1 ? 1.35 : n.estilo >= 2 ? 1.2 : 1;
        if (s !== 1) { ctx.save(); ctx.translate(n.x, n.y); ctx.scale(s, s); ctx.strokeText(n.txt, 0, 0); ctx.fillStyle = CORES[n.estilo]; ctx.fillText(n.txt, 0, 0); ctx.restore(); }
        else { ctx.strokeText(n.txt, n.x, n.y); ctx.fillStyle = CORES[0]; ctx.fillText(n.txt, n.x, n.y); }
      }
      ctx.globalAlpha = 1;
    }

    // barra de vida do jogador
    if (!v.morto) {
      const w = 34, y = v.py + 25, p = clamp(v.hp / v.hpMax, 0, 1);
      ctx.fillStyle = "rgba(0,0,0,.75)"; ctx.fillRect(v.px - w / 2 - 1, y - 1, w + 2, 6);
      ctx.fillStyle = p > 0.5 ? "#4ade80" : p > 0.25 ? "#facc15" : "#ff4d6d";
      ctx.fillRect(v.px - w / 2, y, w * p, 4);
    }
  }

  function desenharJogador() {
    ctx.setTransform(Z, 0, 0, Z, BX + J.px * Z, BY + (J.py + 6) * Z);
    if (J.invuln > 0 && Math.floor(J.invuln * 20) % 2 === 0) ctx.globalAlpha = 0.45;
    ARTE.desenharJogador(ctx, tAnim, J.andando, J.esq, J.personagem);
    ctx.globalAlpha = 1;
  }

  function desenharChaoEfeitos() {
    base();
    for (const p of J.pocas) {
      const a = clamp(Math.min(p.vida, p.vidaMax - p.vida + 0.3) / 0.3, 0, 1);
      const img = ARTE.poca(p.cor);
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.globalAlpha = a * 0.9;
      ctx.drawImage(img, -p.r * 1.15, -p.r * 1.15, p.r * 2.3, p.r * 2.3);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
    // avisos de ataque corpo a corpo e auras de elite
    for (const e of ORDEM) {
      if (e.ia === "rolar" && e.estado === 1) {
        const p = 1 - e.t / 0.75, comp = 370 * 0.85;
        ctx.strokeStyle = `rgba(213,140,255,${0.18 + 0.3 * p})`; ctx.lineWidth = e.r * 2; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(e.x, e.y); ctx.lineTo(e.x + e.bx * comp, e.y + e.by * comp); ctx.stroke();
        ctx.strokeStyle = `rgba(255,255,255,${0.25 + 0.5 * p})`; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(e.x, e.y); ctx.lineTo(e.x + e.bx * comp * p, e.y + e.by * comp * p); ctx.stroke();
      }
      if (e.ia === "pisao" && e.estado === 1) {
        const p = 1 - e.t / 0.85, raio = e.r * 3.6, y = e.y + e.r * 0.6;
        ctx.fillStyle = `rgba(255,150,40,${0.1 + 0.22 * p})`;
        ctx.beginPath(); ctx.arc(e.x, y, raio, 0, TAU); ctx.fill();
        ctx.strokeStyle = `rgba(255,190,90,${0.5 + 0.5 * Math.abs(Math.sin(tAnim * 12))})`; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(e.x, y, raio, 0, TAU); ctx.stroke();
        ctx.beginPath(); ctx.arc(e.x, y, raio * p, 0, TAU); ctx.stroke();
      }
      if (e.afixo === "espinhosa") {
        const raio = e.r * 2.2 + 40;
        ctx.fillStyle = "rgba(255,60,90,.08)"; ctx.beginPath(); ctx.arc(e.x, e.y, raio, 0, TAU); ctx.fill();
        ctx.setLineDash([8, 7]); ctx.lineDashOffset = -tAnim * 30;
        ctx.strokeStyle = "rgba(255,90,120,.75)"; ctx.lineWidth = 2.5; ctx.stroke();
        ctx.setLineDash([]);
      }
      if (e.tipo === "colosso" && (e.t < 0.7 || (e.t4 > 0 && e.t4 < 0.45))) {
        const p = Math.abs(Math.sin(tAnim * 18));
        ctx.strokeStyle = `rgba(243,236,203,${0.25 + 0.5 * p})`; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(e.x, e.y, e.r * 1.25, 0, TAU); ctx.stroke();
      }
    }
    // minas no chão (piscam mais rápido quando armadas)
    for (const m of J.minas) {
      if (m.t < m.voo || !vis(m.x, m.y, 30)) continue;
      const q = m.armada > 0 ? 0 : Math.floor(tAnim * (m.vida < 2 ? 10 : 3) + m.fase) & 1;
      if (m.puxando > 0) {
        const raio = 170 * m.arma.s.area * (m.puxando / 0.5);
        ctx.strokeStyle = "rgba(177,140,255,.6)"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(m.x, m.y, raio, 0, TAU); ctx.stroke();
      }
      ctx.drawImage(ARTE.sprite(m.evo ? "minaEvo" : "mina", q), m.x - (m.evo ? 17 : 15), m.y - (m.evo ? 17 : 15), m.evo ? 34 : 30, m.evo ? 34 : 30);
    }
    for (const av of J.avisos) {
      const p = av.t / av.dur;
      ctx.fillStyle = `rgba(255,40,60,${0.12 + 0.3 * p})`;
      ctx.beginPath(); ctx.arc(av.x, av.y, av.r, 0, TAU); ctx.fill();
      ctx.strokeStyle = `rgba(255,90,90,${0.5 + 0.5 * Math.abs(Math.sin(tAnim * 12))})`; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(av.x, av.y, av.r, 0, TAU); ctx.stroke();
      ctx.beginPath(); ctx.arc(av.x, av.y, av.r * (1 - p), 0, TAU); ctx.stroke();
    }
    ctx.globalCompositeOperation = "lighter";
    for (const an of J.aneis) {
      const a = an.r >= an.rmax ? clamp(1 - an.fim / 0.2, 0, 1) : 1;
      ctx.fillStyle = an.cor; ctx.globalAlpha = 0.06 * a; ctx.beginPath(); ctx.arc(an.x ?? J.px, an.y ?? J.py - 4, an.r, 0, TAU); ctx.fill();
      ctx.strokeStyle = an.cor; ctx.globalAlpha = 0.45 * a; ctx.lineWidth = 12; ctx.stroke();
      ctx.globalAlpha = 0.95 * a; ctx.lineWidth = 3; ctx.strokeStyle = "#ffffff"; ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }

  function desenharTelaFixa() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (!vinheta) criarVinhetas();
    ctx.drawImage(vinheta, 0, 0);
    if (!J) return;
    const pouca = J.hp / J.hpMax < 0.3 && !J.morto;
    const dano = Math.max(J.flashDano / 0.3, pouca ? 0.35 + 0.25 * Math.sin(tAnim * 6) : 0);
    if (dano > 0) { ctx.globalAlpha = clamp(dano, 0, 1); ctx.drawImage(vinhetaVermelha, 0, 0); ctx.globalAlpha = 1; }
    if (J.flashBranco > 0) { ctx.fillStyle = `rgba(255,255,255,${clamp(J.flashBranco, 0, 0.8)})`; ctx.fillRect(0, 0, W, H); }
    // setas para chefe e baús fora da tela
    const seta = (x, y, cor) => {
      const sx = BX + x * Z, sy = BY + y * Z, m = 34 * dpr;
      if (sx > 0 && sx < W && sy > 0 && sy < H) return;
      const cx = W / 2, cy = H / 2, ang = Math.atan2(sy - cy, sx - cx);
      const t = Math.min((W / 2 - m) / Math.max(1e-6, Math.abs(Math.cos(ang))), (H / 2 - m) / Math.max(1e-6, Math.abs(Math.sin(ang))));
      ctx.setTransform(dpr, 0, 0, dpr, cx + Math.cos(ang) * t, cy + Math.sin(ang) * t);
      ctx.rotate(ang);
      ctx.fillStyle = cor; ctx.shadowColor = cor; ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.moveTo(14, 0); ctx.lineTo(-8, -10); ctx.lineTo(-4, 0); ctx.lineTo(-8, 10); ctx.closePath(); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    };
    if (J.chefe && !J.chefe.morto) seta(J.chefe.x, J.chefe.y, "#ff2bd6");
    for (const it of J.itens) if (it.tipo === "bau") seta(it.x, it.y, "#ffd34d");
    for (const it of J.itens) if (it.tipo === "equip") seta(it.x, it.y, RARIDADES[it.valor.r].cor);
    // joystick de toque
    if (entrada.toque && estado === "jogando") {
      const t = entrada.toque;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.strokeStyle = "rgba(34,229,255,.5)"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(t.ox, t.oy, 46, 0, TAU); ctx.stroke();
      const dx = t.x - t.ox, dy = t.y - t.oy, l = Math.hypot(dx, dy), k = l > 46 ? 46 / l : 1;
      ctx.fillStyle = "rgba(34,229,255,.35)";
      ctx.beginPath(); ctx.arc(t.ox + dx * k, t.oy + dy * k, 20, 0, TAU); ctx.fill();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
  }

  function desenhar(dt) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "#05080c"; ctx.fillRect(0, 0, W, H);
    Z = zoom * dpr;
    let cx = cam.x, cy = cam.y;
    if (J && J.tremor > 0.3 && meta.opcoes.tremor && estado === "jogando") { cx += R(-1, 1) * J.tremor * 0.6; cy += R(-1, 1) * J.tremor * 0.6; }
    BX = W / 2 - cx * Z; BY = H / 2 - cy * Z;
    const vw = W / Z, vh = H / Z;
    VX0 = cx - vw / 2; VY0 = cy - vh / 2; VX1 = VX0 + vw; VY1 = VY0 + vh;
    desenharChao();
    if (J && estado !== "menu") {
      ORDEM.length = 0;
      for (const e of J.inimigos) if (!e.morto && vis(e.x, e.y, e.r * 3 + 60)) ORDEM.push(e);
      ORDEM.sort((a, b) => a.y - b.y);
      desenharChaoEfeitos();
      desenharJogo(dt);
    } else {
      // vitrine do menu
      for (const p of vitrine) {
        let x = p.x, y = p.y;
        const w = VX1 - VX0 + 200, h = VY1 - VY0 + 200;
        while (x < VX0 - 100) { x += w; p.x += w; } while (x > VX1 + 100) { x -= w; p.x -= w; }
        while (y < VY0 - 100) { y += h; p.y += h; } while (y > VY1 + 100) { y -= h; p.y -= h; }
        const tam = ARTE.caixa(p.tipo), q = Math.floor(tAnim * 3 + p.fase) & 1;
        base(); ctx.fillStyle = "rgba(0,0,0,.35)"; ctx.beginPath(); ctx.ellipse(x, y + INIMIGOS[p.tipo].r * INIMIGOS[p.tipo].sy, INIMIGOS[p.tipo].r, INIMIGOS[p.tipo].r * 0.36, 0, 0, TAU); ctx.fill();
        carimbo(ARTE.sprite(p.tipo, q), x, y, tam, p.esq, 1, 1 + Math.sin(tAnim * 6 + p.fase) * 0.05);
      }
    }
    desenharMotes(dt);
    desenharTelaFixa();
  }

  // ========================================================
  // 16. HUD, MENUS E TELAS
  // ========================================================
  const hudCache = {};
  function setTxt(id, v) { if (hudCache[id] !== v) { hudCache[id] = v; $(id).textContent = v; } }
  function atualizarHUD() {
    if (!J || estado === "menu") return;
    setTxt("relogio", fmtTempo(J.tempo));
    const pct = (Math.min(1, J.xp / J.xpReq) * 100).toFixed(1) + "%";
    if (hudCache.xp !== pct) { hudCache.xp = pct; $("xp-barra").style.width = pct; }
    setTxt("xp-nivel", "NV " + J.nivel);
    setTxt("h-abates", fmt(J.abates));
    setTxt("h-sucata", fmt(J.sucata));
    const final = J.tempo >= DURACAO - 10;
    if (hudCache.final !== final) { hudCache.final = final; $("relogio").classList.toggle("final", final); }
    const c = J.chefe && !J.chefe.morto ? J.chefe : null;
    if (hudCache.chefe !== c) { hudCache.chefe = c; $("barra-chefe").hidden = !c; if (c) $("chefe-nome").textContent = INIMIGOS[c.tipo].nome; }
    if (c) { const w = (c.hp / c.hpMax * 100).toFixed(1) + "%"; if (hudCache.cv !== w) { hudCache.cv = w; $("chefe-vida").style.width = w; } }
  }

  function faixa(txt, sub, cor) {
    const f = $("faixa");
    f.innerHTML = txt + (sub ? `<small>${sub}</small>` : "");
    f.style.setProperty("--c", cor || "#22e5ff");
    f.classList.remove("mostrar");
    void f.offsetWidth;
    f.classList.add("mostrar");
  }

  const pips = (n, max) => Array.from({ length: max }, (_, i) => `<i class="${i < n ? "on" : ""}"></i>`).join("");
  function renderSlots() {
    if (!J) return;
    let h = "";
    for (let i = 0; i < 6; i++) {
      const a = J.armas[i];
      if (!a) { h += `<div class="slot vazio"></div>`; continue; }
      const d = ARMAS[a.id];
      h += `<div class="slot ${d.evo ? "evo" : ""}" title="${d.nome}"><img src="${ARTE.icone(d.tipo, d.evo)}" alt="${d.nome}"><div class="pips">${d.evo ? pips(1, 1) : pips(a.nivel, maxNivelArma(a.id))}</div></div>`;
    }
    $("slots-armas").innerHTML = h;
    h = "";
    for (let i = 0; i < 6; i++) {
      const p = J.passivos[i];
      if (!p) { h += `<div class="slot vazio"></div>`; continue; }
      h += `<div class="slot" title="${PASSIVOS[p.id].nome}"><img src="${ARTE.icone(p.id)}" alt="${PASSIVOS[p.id].nome}"><div class="pips">${pips(p.nivel, PASSIVOS[p.id].max)}</div></div>`;
    }
    $("slots-passivos").innerHTML = h;
  }

  function combosHTML() {
    return Object.keys(ARMAS).filter(id => ARMAS[id].evolui).map(id => {
      const d = ARMAS[id], evo = ARMAS[d.evolui.em];
      const tem = J && (temArmaBase(id) || J.evoluidas.includes(id));
      return `<div class="combo ${tem ? "tem" : ""}" title="${d.nome} (nível máx.) + ${PASSIVOS[d.evolui.com].nome}">
        <img src="${ARTE.icone(d.tipo)}" alt="${d.nome}"><span class="mais">+</span><img src="${ARTE.icone(d.evolui.com)}" alt="${PASSIVOS[d.evolui.com].nome}"><span class="mais">=</span><img src="${ARTE.icone(evo.tipo, true)}" alt=""><b>${evo.nome}</b>
      </div>`;
    }).join("");
  }

  function renderPausa() {
    $("pausa-sub").textContent = `${fmtTempo(J.tempo)} • nível ${J.nivel} • ${fmt(J.abates)} plantas abatidas • ${J.rerolls} trocas restantes`;
    $("pausa-armas").innerHTML = J.armas.map(a => {
      const d = ARMAS[a.id];
      return `<div class="item-build"><img src="${ARTE.icone(d.tipo, d.evo)}" alt="">${d.nome}<small>${d.evo ? "EVOLUÍDA" : "NV " + a.nivel + "/" + maxNivelArma(a.id)}</small></div>`;
    }).join("") || `<div class="item-build" style="color:#7f9aab">Nenhuma</div>`;
    $("pausa-passivos").innerHTML = J.passivos.map(p => `<div class="item-build"><img src="${ARTE.icone(p.id)}" alt="">${PASSIVOS[p.id].nome}<small>NV ${p.nivel}/${PASSIVOS[p.id].max}</small></div>`).join("")
      || `<div class="item-build" style="color:#7f9aab">Nenhum ainda</div>`;
    $("pausa-combos").innerHTML = combosHTML();
    renderOpcoes();
    const b = $("btn-desistir"); b.textContent = "Desistir"; b.dataset.confirmar = "";
  }

  function renderOpcoes() {
    const o = meta.opcoes;
    const linhas = [
      ["som", "Som", o.som ? "Ligado" : "Desligado"],
      ["mouse", "Movimento com o mouse", o.mouse === "sempre" ? "Seguir sempre" : "Segurar botão"],
      ["numeros", "Números de dano", o.numeros ? "Mostrar" : "Esconder"],
      ["tremor", "Tremor de tela", o.tremor ? "Ligado" : "Desligado"],
    ];
    $("opcoes").innerHTML = linhas.map(([k, nome, val]) => `<div class="opcao"><span>${nome}</span><button data-op="${k}">${val}</button></div>`).join("");
  }
  $("opcoes").addEventListener("click", e => {
    const b = e.target.closest("[data-op]");
    if (!b) return;
    const o = meta.opcoes, k = b.dataset.op;
    if (k === "mouse") o.mouse = o.mouse === "sempre" ? "segurar" : "sempre";
    else o[k] = !o[k];
    salvar(); renderOpcoes(); atualizarBotaoSom();
    Som.tocar("clique");
  });

  function alternarPausa() {
    if (estado === "jogando") { estado = "pausa"; renderPausa(); $("m-pausa").hidden = false; }
    else if (estado === "pausa") { $("m-pausa").hidden = true; estado = "jogando"; }
  }
  function alternarSom() { meta.opcoes.som = !meta.opcoes.som; salvar(); atualizarBotaoSom(); if (estado === "pausa") renderOpcoes(); if (meta.opcoes.som) Som.iniciar(); }
  function atualizarBotaoSom() { const b = $("btn-som"); b.textContent = meta.opcoes.som ? "♪" : "✕"; b.style.opacity = meta.opcoes.som ? 1 : 0.6; }
  function telaCheia() {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else if (palco.requestFullscreen) palco.requestFullscreen().catch(() => {});
  }

  function iniciarPartida() {
    Som.iniciar();
    novaPartida();
    for (const id of ["menu", "m-nivel", "m-bau", "m-pausa", "m-fim"]) $(id).hidden = true;
    $("hud").hidden = false;
    for (const k in hudCache) delete hudCache[k];
    renderSlots();
    meta.recordes.partidas++;
    salvar();
    estado = "jogando";
    if (window.innerWidth < 760 || window.matchMedia("(pointer: coarse)").matches) {
      palco.classList.add("cheio");
      redimensionar();
      palco.scrollIntoView({ block: "start" });
    }
    faixa("Sobreviva!", "Mova o mouse para guiar o sobrevivente — as armas atiram sozinhas", "#22e5ff");
  }

  function terminar(vitoria) {
    estado = "fim";
    const tempoEf = Math.min(J.tempo, DURACAO);
    const bonusTempo = Math.floor(tempoEf / 6), bonusAbates = Math.floor(J.abates / 25), bonusVit = vitoria ? 200 : 0;
    const bruto = J.sucata + bonusTempo + bonusAbates + bonusVit;
    const multSucata = (1 + 0.1 * nivelOf("sucata")) * (1 + (J.eq.sucata || 0));
    const ganho = Math.round(bruto * multSucata);
    meta.sucata += ganho;
    // equipamentos achados vão para o inventário (mesmo se você morreu)
    let viraramSucata = 0;
    for (const it of J.achados) if (!guardarItem(it)) viraramSucata++;
    const rec = meta.recordes;
    const recorde = J.tempo > rec.tempo + 0.5 && rec.tempo > 0;
    rec.tempo = Math.max(rec.tempo, J.tempo);
    rec.nivel = Math.max(rec.nivel, J.nivel);
    rec.abates += J.abates;
    rec.maisAbates = Math.max(rec.maisAbates, J.abates);
    rec.chefes += J.chefesMortos;
    if (vitoria) rec.vitorias++;
    salvar();

    $("fim-titulo").textContent = vitoria ? "A selva recuou!" : "Você foi enraizado";
    $("fim-titulo").style.setProperty("--c", vitoria ? "#a3ff4f" : "#ff4d6d");
    $("fim-sub").textContent = vitoria
      ? `${PERSONAGENS[J.personagem].nome} derrubou a Árvore-Mãe Ω. A cidade respira de novo — por enquanto.`
      : `${PERSONAGENS[J.personagem].nome} foi engolido pela selva${recorde ? " — mas bateu o recorde de tempo!" : "."}`;
    $("fim-resumo").innerHTML = [
      [fmtTempo(J.tempo), "tempo"], [J.nivel, "nível"], [fmt(J.abates), "abates"], [J.chefesMortos, "chefes"],
    ].map(([b, s]) => `<div><b>${b}</b><span>${s}</span></div>`).join("");
    const maxDano = Math.max(1, ...J.armas.map(a => a.total));
    $("fim-tabela").innerHTML = J.armas.slice().sort((a, b) => b.total - a.total).map(a => {
      const d = ARMAS[a.id], dur = Math.max(1, J.tempo - a.desde);
      return `<tr><td><img src="${ARTE.icone(d.tipo, d.evo)}" alt="">${d.nome}<div class="barra-dano" style="width:${(a.total / maxDano * 100).toFixed(0)}%"></div></td>
        <td>${d.evo ? "EVO" : a.nivel}</td><td>${fmt(a.total)}</td><td>${fmt(a.total / dur)}</td></tr>`;
    }).join("");
    $("fim-ganho").innerHTML = `<img src="${ARTE.icone("sucata")}" alt="" style="width:22px;height:22px;vertical-align:-5px"> <b>+${fmt(ganho)}</b> de sucata
      <small>coletada ${fmt(J.sucata)} + tempo ${bonusTempo} + abates ${bonusAbates}${bonusVit ? " + vitória " + bonusVit : ""}${multSucata > 1.001 ? ` × ${(Math.round(multSucata * 100) / 100).toLocaleString("pt-BR")} (bônus de sucata)` : ""}</small>`;
    $("fim-achados").innerHTML = J.achados.length ? `<h3>Equipamentos encontrados</h3><div class="achados">${J.achados.map(it =>
      `<div class="achado" style="--r:${RARIDADES[it.r].cor}"><img src="${iconeItem(it)}" alt=""><div><b>${nomeItem(it)}</b><small>${RARIDADES[it.r].nome} • ${ENCAIXES[MODELOS[it.m].enc]}</small></div></div>`).join("")}</div>
      <p class="dica-achados">Equipe-os na aba <b>Arsenal</b> do bunker.${viraramSucata ? ` (${viraramSucata} viraram sucata: inventário cheio)` : ""}</p>` : "";
    $("m-fim").hidden = false;
    $("m-nivel").hidden = true; $("m-bau").hidden = true; $("m-pausa").hidden = true;
  }

  function voltarAoMenu() {
    estado = "menu";
    J = null;
    for (const id of ["m-nivel", "m-bau", "m-pausa", "m-fim"]) $(id).hidden = true;
    $("hud").hidden = true;
    $("menu").hidden = false;
    if (palco.classList.contains("cheio")) { palco.classList.remove("cheio"); redimensionar(); }
    renderMenu();
  }

  // ---------- Arsenal (equipamentos) ----------
  let itemSel = null, itemNovo = null, confirmarDesmontar = false;
  const linhasStats = st => Object.entries(st).map(([k, v]) => `<li>${ATRIB[k](v)}</li>`).join("");
  function renderArsenal() {
    $("equipados").innerHTML = Object.entries(ENCAIXES).map(([enc, nome]) => {
      const it = itemPorId(meta.equip[enc]);
      if (!it) return `<div class="eq-slot vazio"><img src="${ARTE.iconeEquip(enc, "#3b5566")}" alt=""><div><b>${nome}</b><small>vazio</small></div></div>`;
      const rar = RARIDADES[it.r];
      return `<button class="eq-slot ${itemSel === it.id ? "sel" : ""}" data-item="${it.id}" style="--r:${rar.cor}"><img src="${iconeItem(it)}" alt=""><div><b>${nomeItem(it)}</b><small>${nome} • ${rar.nome}</small></div></button>`;
    }).join("");
    const tot = somaEquip();
    $("eq-resumo").innerHTML = Object.keys(tot).length
      ? `<h3>Bônus do equipamento</h3><ul>${linhasStats(tot)}</ul>` : `<h3>Bônus do equipamento</h3><p>Nenhum item equipado.</p>`;
    const inv = meta.inventario.slice().sort((a, b) => b.r - a.r || b.n - a.n || a.m.localeCompare(b.m) || a.id - b.id);
    $("inv-titulo").textContent = `Inventário (${meta.inventario.length}/${MAX_INV})`;
    $("inventario").innerHTML = inv.map(it => {
      const eq = meta.equip[MODELOS[it.m].enc] === it.id;
      return `<button class="inv-item ${eq ? "equipado" : ""} ${itemSel === it.id ? "sel" : ""} ${itemNovo === it.id ? "novo" : ""}" data-item="${it.id}" style="--r:${RARIDADES[it.r].cor}" title="${nomeItem(it)} (${RARIDADES[it.r].nome})">
        <img src="${iconeItem(it)}" alt="">${it.n ? `<span class="nv">+${it.n}</span>` : ""}${eq ? `<span class="eq">E</span>` : ""}</button>`;
    }).join("") || `<p class="vazio-inv">Nenhum equipamento ainda. Elites, chefes e barris podem deixar maletas — ou abra uma caixa.</p>`;
    const bc = $("btn-caixa-eq");
    bc.disabled = meta.sucata < CUSTO_CAIXA;
    bc.innerHTML = `<img src="${ARTE.icone("sucata")}" alt="">Caixa de equipamento • ${CUSTO_CAIXA}`;
    renderDetalhe();
  }
  function renderDetalhe() {
    const it = itemPorId(itemSel), box = $("detalhe-item");
    if (!it) { box.style.removeProperty("--r"); box.innerHTML = `<p class="dica">Toque em um equipamento para ver os detalhes, equipar, aprimorar ou desmontar.</p>`; return; }
    const md = MODELOS[it.m], rar = RARIDADES[it.r], enc = md.enc, eq = meta.equip[enc] === it.id;
    const atual = eq ? null : itemPorId(meta.equip[enc]);
    const custo = custoAprimorar(it), max = it.n >= MAX_NV_ITEM;
    box.style.setProperty("--r", rar.cor);
    box.innerHTML = `<img src="${iconeItem(it)}" alt="">
      <div class="info"><b>${nomeItem(it)}</b><span class="rar">${rar.nome} • ${ENCAIXES[enc]}${eq ? " • equipado" : ""}</span>
        <div class="pips">${pips(it.n, MAX_NV_ITEM)}</div><ul>${linhasStats(statsItem(it))}</ul>
        ${atual ? `<small>No lugar de: ${nomeItem(atual)} (${Object.entries(statsItem(atual)).map(([k, v]) => ATRIB[k](v)).join(", ")})</small>` : ""}</div>
      <div class="acoes">
        <button class="btn-sec" data-acao="equipar">${eq ? "Desequipar" : "Equipar"}</button>
        <button class="comprar" data-acao="aprimorar" ${max || meta.sucata < custo ? "disabled" : ""}>${max ? "Nível máx." : `<img src="${ARTE.icone("sucata")}" alt="">Aprimorar • ${custo}`}</button>
        <button class="btn-sec perigo" data-acao="desmontar">${confirmarDesmontar ? "Confirmar?" : `Desmontar (+${valorDesmontar(it)})`}</button>
      </div>`;
  }
  $("aba-arsenal").addEventListener("click", e => {
    const bi = e.target.closest("[data-item]"), ba = e.target.closest("[data-acao]");
    Som.iniciar();
    if (e.target.closest("#btn-caixa-eq")) {
      if (meta.sucata < CUSTO_CAIXA) return;
      meta.sucata -= CUSTO_CAIXA;
      const it = novoItem();
      if (guardarItem(it)) { itemSel = itemNovo = it.id; }
      salvar(); renderMenu();
      Som.tocar(it.r >= 2 ? "raro" : "bau");
      return;
    }
    if (bi) { itemSel = +bi.dataset.item; confirmarDesmontar = false; Som.tocar("clique"); renderArsenal(); return; }
    if (!ba) return;
    const it = itemPorId(itemSel);
    if (!it) return;
    const enc = MODELOS[it.m].enc;
    if (ba.dataset.acao === "equipar") {
      meta.equip[enc] = meta.equip[enc] === it.id ? null : it.id;
      Som.tocar("item");
    } else if (ba.dataset.acao === "aprimorar") {
      const custo = custoAprimorar(it);
      if (it.n >= MAX_NV_ITEM || meta.sucata < custo) return;
      meta.sucata -= custo; it.n++;
      Som.tocar("evolucao");
    } else if (ba.dataset.acao === "desmontar") {
      if (!confirmarDesmontar) { confirmarDesmontar = true; renderDetalhe(); Som.tocar("clique"); return; }
      meta.sucata += valorDesmontar(it);
      if (meta.equip[enc] === it.id) meta.equip[enc] = null;
      meta.inventario = meta.inventario.filter(x => x !== it);
      itemSel = null;
      Som.tocar("sucata");
    }
    confirmarDesmontar = false;
    salvar(); renderMenu();
  });

  // ---------- Menu inicial ----------
  let abaAtual = "sobrev";
  function renderMenu() {
    $("m-sucata").textContent = fmt(meta.sucata);
    $("lista-sobrev").innerHTML = Object.entries(PERSONAGENS).map(([id, p]) => {
      const tem = meta.personagens.includes(id), esc = meta.escolhido === id, pode = meta.sucata >= p.custo;
      const arma = ARMAS[p.arma];
      return `<button class="sobrev ${tem ? "" : "bloqueado"} ${esc ? "escolhido" : ""}" data-p="${id}">
        ${esc ? `<span class="marca">ESCOLHIDO</span>` : ""}
        <img class="retrato" src="${ARTE.retrato(id)}" alt="">
        <h3>${tem ? p.nome : "???"}</h3>
        <span class="papel">${p.papel}</span>
        <p>${p.bonus}</p>
        <span class="arma-ini"><img src="${ARTE.icone(arma.tipo)}" alt="">${arma.nome}</span>
        ${tem ? "" : `<span class="preco" style="${pode ? "" : "opacity:.6"}"><img src="${ARTE.icone("sucata")}" alt="">${fmt(p.custo)} • ${pode ? "clique para desbloquear" : "bloqueado"}</span>`}
      </button>`;
    }).join("");
    $("lista-oficina").innerHTML = OFICINA.map(u => {
      const n = nivelOf(u.id), max = n >= u.max, custo = custoOficina(u, n);
      return `<div class="melhoria"><img src="${ARTE.icone(u.ico)}" alt="">
        <div class="info"><b>${u.nome}</b><small>${u.txt}</small><div class="pips">${pips(n, u.max)}</div></div>
        ${max ? `<button class="comprar max" disabled>MÁX.</button>` : `<button class="comprar" data-u="${u.id}" ${meta.sucata >= custo ? "" : "disabled"}><img src="${ARTE.icone("sucata")}" alt="">${fmt(custo)}</button>`}
      </div>`;
    }).join("");
    const r = meta.recordes;
    $("registros").innerHTML = [
      [fmtTempo(r.tempo), "melhor tempo"], [r.nivel, "maior nível"], [fmt(r.maisAbates), "mais abates"],
      [fmt(r.abates), "abates no total"], [r.chefes, "chefes caídos"], [r.vitorias, "vitórias"], [r.partidas, "expedições"],
    ].map(([b, s]) => `<div><b>${b}</b><span>${s}</span></div>`).join("");
    $("combos-menu").innerHTML = combosHTML();
    $("bestiario").innerHTML = Object.entries(INIMIGOS).filter(([, d]) => d.desc).map(([id, d]) =>
      `<div class="besta ${d.chefe ? "chefe" : ""}"><img src="${ARTE.retratoSprite(id, 92)}" alt=""><div>${d.nome}<small>${d.desc}</small></div></div>`).join("");
    renderArsenal();
  }
  $("abas").addEventListener("click", e => {
    const b = e.target.closest("[data-aba]");
    if (!b) return;
    abaAtual = b.dataset.aba;
    for (const x of $("abas").children) x.classList.toggle("ativa", x === b);
    for (const id of ["sobrev", "oficina", "arsenal", "arquivo", "como"]) $("aba-" + id).hidden = id !== abaAtual;
    itemNovo = null;
    Som.iniciar(); Som.tocar("clique");
  });
  $("lista-sobrev").addEventListener("click", e => {
    const b = e.target.closest("[data-p]");
    if (!b) return;
    const id = b.dataset.p, p = PERSONAGENS[id];
    Som.iniciar();
    if (!meta.personagens.includes(id)) {
      if (meta.sucata < p.custo) { b.animate([{ transform: "translateX(-5px)" }, { transform: "translateX(5px)" }, { transform: "none" }], { duration: 220 }); return; }
      meta.sucata -= p.custo;
      meta.personagens.push(id);
      Som.tocar("bau");
    } else Som.tocar("clique");
    meta.escolhido = id;
    salvar(); renderMenu();
  });
  $("lista-oficina").addEventListener("click", e => {
    const b = e.target.closest("[data-u]");
    if (!b) return;
    const u = OFICINA.find(x => x.id === b.dataset.u), n = nivelOf(u.id), custo = custoOficina(u, n);
    if (n >= u.max || meta.sucata < custo) return;
    meta.sucata -= custo;
    meta.oficina[u.id] = n + 1;
    salvar(); renderMenu();
    Som.iniciar(); Som.tocar("item");
  });

  // ---------- Botões ----------
  $("btn-iniciar").addEventListener("click", iniciarPartida);
  $("cartas").addEventListener("click", e => { const b = e.target.closest("[data-i]"); if (b) escolher(+b.dataset.i); });
  $("btn-reroll").addEventListener("click", rerolar);
  $("btn-bau").addEventListener("click", fecharBau);
  $("btn-pausa").addEventListener("click", alternarPausa);
  $("btn-continuar").addEventListener("click", alternarPausa);
  $("btn-som").addEventListener("click", alternarSom);
  $("btn-tela").addEventListener("click", telaCheia);
  $("btn-desistir").addEventListener("click", () => {
    const b = $("btn-desistir");
    if (!b.dataset.confirmar) { b.dataset.confirmar = "1"; b.textContent = "Confirmar desistência"; return; }
    $("m-pausa").hidden = true;
    terminar(false);
  });
  $("btn-denovo").addEventListener("click", iniciarPartida);
  $("btn-bunker").addEventListener("click", voltarAoMenu);
  document.addEventListener("fullscreenchange", () => setTimeout(redimensionar, 50));
  window.addEventListener("resize", redimensionar);
  // o topo do site muda de altura quando as fontes carregam: reajusta o palco junto
  if (window.ResizeObserver) new ResizeObserver(() => redimensionar()).observe($("topo"));

  // ---------- Debug ----------
  const DEBUG_BTS = [
    ["inv", "Invencível", () => { debug.invencivel = !debug.invencivel; }],
    ["vel", "Velocidade x1", () => { debug.vel = debug.vel === 1 ? 2 : debug.vel === 2 ? 4 : 1; }],
    ["n1", "+1 nível", () => J && (J.xp = J.xpReq)],
    ["n5", "+5 níveis", () => { if (J) for (let i = 0; i < 5; i++) { J.nivel++; J.nivelPend++; J.xpReq = reqXP(J.nivel); } }],
    ["t", "+1 minuto", () => { if (J) J.tempo += 60; }],
    ["chefe", "Próximo chefe", () => { if (!J) return; const i = EVENTOS.findIndex((ev, k) => k >= J.evento && ev[1] === "chefe"); if (i >= 0) { J.tempo = EVENTOS[i][0] - 0.5; } }],
    ["matar", "Matar tudo", () => { if (J) for (const e of J.inimigos) if (!e.morto && !e.inofensivo) ferir(e, e.hp + 1, null); }],
    ["bau", "Dar baú", () => { if (J) soltarItem("bau", J.px + 40, J.py, 1); }],
    ["arsenal", "Arsenal máx.", () => {
      if (!J) return;
      const bases = Object.keys(ARMAS).filter(id => !ARMAS[id].evo);
      for (const id of bases) { if (J.armas.length >= 6) break; if (!temArmaBase(id) && !J.evoluidas.includes(id)) darArma(id); }
      for (const a of J.armas) if (!ARMAS[a.id].evo) a.nivel = maxNivelArma(a.id);
      for (const a of J.armas) { const par = ARMAS[a.id].evolui; if (par && J.passivos.length < 6 && !nivelPassivo(par.com)) J.passivos.push({ id: par.com, nivel: 1 }); }
      recalcular(); renderSlots();
    }],
    ["sucata", "+1000 sucata", () => { meta.sucata += 1000; salvar(); if (estado === "menu") renderMenu(); }],
    ["equip", "Dar equipamento", () => {
      if (J && estado !== "menu") { soltarItem("equip", J.px + 50, J.py, novoItem([0, 3, 2, 1])); return; }
      const it = novoItem([0, 3, 2, 1]); guardarItem(it); itemSel = it.id; salvar(); renderMenu();
    }],
  ];
  function renderDebug() {
    $("debug-bts").innerHTML = DEBUG_BTS.map(([id, nome]) => {
      let txt = nome, on = false;
      if (id === "inv") on = debug.invencivel;
      if (id === "vel") { txt = "Velocidade x" + debug.vel; on = debug.vel > 1; }
      return `<button data-d="${id}" class="${on ? "on" : ""}">${txt}</button>`;
    }).join("");
  }
  $("debug-bts").addEventListener("click", e => {
    const b = e.target.closest("[data-d]");
    if (!b) return;
    DEBUG_BTS.find(x => x[0] === b.dataset.d)[2]();
    renderDebug();
  });
  function alternarDebug() { const d = $("debug"); d.hidden = !d.hidden; if (!d.hidden) renderDebug(); }
  $("btn-debug").addEventListener("click", alternarDebug);
  $("debug-fechar").addEventListener("click", alternarDebug);

  // ========================================================
  // 17. LAÇO PRINCIPAL
  // ========================================================
  const PASSO = 1 / 60;
  let ultimo = performance.now(), acum = 0;
  function quadro(agora) {
    requestAnimationFrame(quadro);
    const dt = Math.min(0.1, (agora - ultimo) / 1000);
    ultimo = agora;
    if (estado === "jogando") {
      acum += dt * debug.vel;
      let n = 0;
      while (acum >= PASSO && n < 10) {
        atualizar(PASSO);
        acum -= PASSO; n++;
        if (estado === "jogando" && J.nivelPend > 0 && !J.morto) abrirNivel();
        if (estado !== "jogando") { acum = 0; break; }
      }
      if (n >= 10) acum = 0;
      tAnim += dt * debug.vel;
    } else if (estado === "menu") {
      tAnim += dt;
      cam.x += 16 * dt; cam.y += 7 * dt;
    }
    desenhar(estado === "jogando" || estado === "menu" ? dt : 0);
    atualizarHUD();
  }

  // ---------- Início ----------
  document.querySelectorAll("[data-ico]").forEach(img => { img.src = ARTE.icone(img.dataset.ico); });
  redimensionar();
  montarVitrine();
  renderMenu();
  atualizarBotaoSom();
  requestAnimationFrame(quadro);
})();
