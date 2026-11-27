// ==========================================================
// jogos/masmorra/jogo.js — A LÓGICA DO "Caçador de Dragões"
// (O visual fica em estilo.css e a estrutura em index.html.)
// ==========================================================

  (() => {
    // ========================================================
    // 1. UTILIDADES
    // ========================================================
    const R = (a, b) => a + Math.random() * (b - a);
    const sortear = arr => arr[Math.floor(Math.random() * arr.length)];
    const embaralhar = arr => arr.map(v => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map(x => x[1]);
    const $ = id => document.getElementById(id);
    function sortearPeso(pesos) {
      const total = Object.values(pesos).reduce((a, b) => a + b, 0);
      let r = Math.random() * total;
      for (const [k, v] of Object.entries(pesos)) { r -= v; if (r < 0) return k; }
      return Object.keys(pesos)[0];
    }
    function fmt(n) {
      n = Math.floor(n);
      if (n < 1e6) return n.toLocaleString("pt-BR");
      const suf = ["", "mil", "mi", "bi", "tri", "quatri"];
      const i = Math.min(suf.length - 1, Math.floor(Math.log10(n) / 3));
      return (n / 10 ** (3 * i)).toLocaleString("pt-BR", { maximumFractionDigits: 2 }) + " " + suf[i];
    }
    const pct = v => Math.round(v * 100) + "%";

    // ========================================================
    // 2. DADOS: biomas, inimigos e dragões
    // ========================================================
    // acoes: pesos das intenções que o inimigo pode escolher a cada turno
    const BIOMAS = [
      {
        nome: "Catacumbas Esquecidas", cor: "#6b7280",
        inimigos: [
          { nome: "Rato Gigante",  emoji: "🐀", hp: 14, atk: 4, acoes: { atk: 6, multi: 2 } },
          { nome: "Morcego",       emoji: "🦇", hp: 10, atk: 4, acoes: { multi: 5, atk: 2 }, esquiva: 0.15 },
          { nome: "Esqueleto",     emoji: "💀", hp: 20, atk: 5, acoes: { atk: 5, defesa: 2, pesado: 2 } },
          { nome: "Goblin",        emoji: "👺", hp: 16, atk: 5, acoes: { atk: 5, pesado: 2, furia: 1 } },
          { nome: "Aranha",        emoji: "🕷️", hp: 15, atk: 4, acoes: { veneno: 4, atk: 3 } },
        ],
        chefe: { nome: "Morgrath, o Dragão Verde", emoji: "🐲", hp: 95, atk: 8, acoes: { atk: 3, veneno: 3, pesado: 2, multi: 2 }, filtro: "" },
      },
      {
        nome: "Cavernas Fúngicas", cor: "#65a30d",
        inimigos: [
          { nome: "Cogumelo Tóxico", emoji: "🍄", hp: 22, atk: 4, acoes: { veneno: 5, cura: 1 } },
          { nome: "Lobo das Cavernas", emoji: "🐺", hp: 18, atk: 6, acoes: { multi: 4, atk: 3 } },
          { nome: "Orc",           emoji: "👹", hp: 28, atk: 6, acoes: { atk: 4, pesado: 3, furia: 1 } },
          { nome: "Gosma",         emoji: "🦠", hp: 30, atk: 4, acoes: { atk: 4, cura: 2, defesa: 2 } },
          { nome: "Troll",         emoji: "🧌", hp: 34, atk: 6, acoes: { atk: 4, pesado: 2, cura: 2 } },
        ],
        chefe: { nome: "Hrimvald, o Wyrm de Gelo", emoji: "🐉", hp: 115, atk: 9, acoes: { sopro: 2, multi: 2, defesa: 2, atk: 3 }, filtro: "hue-rotate(150deg) saturate(1.4)" },
      },
      {
        nome: "Ruínas Submersas", cor: "#0e7490",
        inimigos: [
          { nome: "Serpente",      emoji: "🐍", hp: 22, atk: 6, acoes: { veneno: 4, multi: 2 } },
          { nome: "Escorpião",     emoji: "🦂", hp: 24, atk: 6, acoes: { veneno: 3, pesado: 3 } },
          { nome: "Fantasma",      emoji: "👻", hp: 18, atk: 7, acoes: { atk: 5, furia: 2 }, esquiva: 0.25 },
          { nome: "Cavaleiro Afogado", emoji: "🧟", hp: 34, atk: 6, acoes: { atk: 4, defesa: 3, pesado: 2 } },
          { nome: "Gárgula",       emoji: "🗿", hp: 30, atk: 6, acoes: { defesa: 3, pesado: 3 } },
        ],
        chefe: { nome: "Tempestra, a Dragoa do Trovão", emoji: "🐉", hp: 135, atk: 10, acoes: { sopro: 2, multi: 3, furia: 1, atk: 2 }, filtro: "hue-rotate(220deg) saturate(1.6)" },
      },
      {
        nome: "Forja Abissal", cor: "#c2410c",
        inimigos: [
          { nome: "Diabrete",      emoji: "👿", hp: 20, atk: 7, acoes: { multi: 4, furia: 2 } },
          { nome: "Elemental de Fogo", emoji: "🔥", hp: 26, atk: 8, acoes: { atk: 4, pesado: 3 } },
          { nome: "Golem de Pedra", emoji: "🪨", hp: 44, atk: 7, acoes: { defesa: 3, pesado: 3 } },
          { nome: "Demônio",       emoji: "😈", hp: 34, atk: 8, acoes: { atk: 4, furia: 2, pesado: 2 } },
          { nome: "Cão Infernal",  emoji: "🐕", hp: 28, atk: 7, acoes: { multi: 4, atk: 2 } },
        ],
        chefe: { nome: "Ignaroth, o Ancião Rubro", emoji: "🐉", hp: 160, atk: 11, acoes: { sopro: 3, pesado: 2, multi: 2, furia: 1 }, filtro: "hue-rotate(-100deg) saturate(1.8)" },
      },
      {
        nome: "Coração do Vazio", cor: "#7c3aed",
        inimigos: [
          { nome: "Olho do Vazio", emoji: "👁️", hp: 30, atk: 8, acoes: { atk: 4, veneno: 2, furia: 2 } },
          { nome: "Espectro",      emoji: "🌫️", hp: 26, atk: 9, acoes: { atk: 5, multi: 3 }, esquiva: 0.25 },
          { nome: "Abominação",    emoji: "🦑", hp: 46, atk: 8, acoes: { multi: 3, cura: 2, pesado: 2 } },
          { nome: "Cavaleiro Sombrio", emoji: "🗡️", hp: 40, atk: 9, acoes: { atk: 3, defesa: 2, pesado: 3 } },
          { nome: "Lich",          emoji: "☠️", hp: 34, atk: 9, acoes: { veneno: 3, cura: 2, pesado: 2 } },
        ],
        chefe: { nome: "Nihilux, o Dragão do Vazio", emoji: "🐲", hp: 200, atk: 13, acoes: { sopro: 3, multi: 2, cura: 1, furia: 1, pesado: 2 }, filtro: "grayscale(1) brightness(.7) drop-shadow(0 0 18px #a78bfa)" },
      },
    ];
    const MIMICO = { nome: "Mímico", emoji: "📦", hp: 26, atk: 7, acoes: { multi: 2, pesado: 3 } };
    const biomaDo = andar => BIOMAS[Math.min(BIOMAS.length - 1, Math.floor((andar - 1) / 10))];
    // Os inimigos ficam mais fortes a cada andar
    const escala = andar => (1 + 0.1 * (andar - 1)) * Math.pow(1.05, andar - 1);

    // ========================================================
    // 3. RELÍQUIAS (valem só durante a expedição)
    // ========================================================
    const RELIQUIAS = {
      lamina:     { emoji: "🗡️", nome: "Lâmina Flamejante",     desc: "+4 de ataque.", mod: { atk: 4 } },
      escudo:     { emoji: "🛡️", nome: "Escudo de Escamas",      desc: "Defender bloqueia 60% a mais." },
      vampiro:    { emoji: "🧛", nome: "Amuleto Vampírico",      desc: "Cura 15% do dano que você causa." },
      botas:      { emoji: "👢", nome: "Botas Silenciosas",      desc: "+10% de esquiva.", mod: { esquiva: 0.10 } },
      anel:       { emoji: "💍", nome: "Anel do Olho Certeiro",  desc: "+12% de chance de crítico.", mod: { crit: 0.12 } },
      troll:      { emoji: "💚", nome: "Coração de Troll",       desc: "Regenera 3% da vida a cada turno." },
      elmo:       { emoji: "⛑️", nome: "Elmo do Cavaleiro",      desc: "+3 de defesa.", mod: { def: 3 } },
      sangue:     { emoji: "🩸", nome: "Sangue de Dragão",       desc: "+30 de vida máxima.", mod: { hp: 30 } },
      runa:       { emoji: "⚡", nome: "Runa do Trovão",         desc: "O Golpe do Caçador recarrega 1 turno mais rápido." },
      bolsa:      { emoji: "👝", nome: "Bolsa do Ladrão",        desc: "+50% de ouro." },
      espinhos:   { emoji: "🌵", nome: "Armadura de Espinhos",   desc: "Devolve 30% do dano recebido." },
      berserker:  { emoji: "🪓", nome: "Fúria do Berserker",     desc: "+50% de ataque com menos de metade da vida." },
      olho:       { emoji: "🎯", nome: "Olho do Caçador",        desc: "Dano dobrado contra dragões." },
      fenix:      { emoji: "🪶", nome: "Pena de Fênix",          desc: "Uma vez por expedição, renasce com 50% da vida." },
      adaga:      { emoji: "🔪", nome: "Adaga Envenenada",       desc: "Seus ataques envenenam o inimigo." },
      alquimista: { emoji: "⚗️", nome: "Frasco do Alquimista",   desc: "Poções curam 60% em vez de 40%." },
      gemea:      { emoji: "⚔️", nome: "Lâmina Gêmea",           desc: "25% de chance de atacar duas vezes." },
      tomo:       { emoji: "📕", nome: "Tomo do Sábio",          desc: "+30% de experiência." },
      cristal:    { emoji: "🔮", nome: "Cristal da Fúria",       desc: "O Golpe do Caçador causa 4× em vez de 2,5×." },
      capa:       { emoji: "🧥", nome: "Capa das Sombras",       desc: "O primeiro golpe inimigo de cada combate sempre erra." },
      coroa:      { emoji: "👑", nome: "Coroa do Rei Caído",     desc: "+2 de ataque, +2 de defesa e +15 de vida.", mod: { atk: 2, def: 2, hp: 15 } },
      talisma:    { emoji: "🧿", nome: "Talismã Purificador",    desc: "Imunidade a veneno." },
    };

    // ========================================================
    // 4. GUILDA DOS CAÇADORES (melhorias permanentes)
    // ========================================================
    const GUILDA = [
      { id: "vigor",     emoji: "💗", nome: "Vigor",            desc: "+10 de vida máxima.",              custo: 5,   max: 50 },
      { id: "forca",     emoji: "💪", nome: "Força",            desc: "+1 de ataque.",                    custo: 5,   max: 50 },
      { id: "armadura",  emoji: "🛡️", nome: "Armadura",         desc: "+1 de defesa.",                    custo: 8,   max: 30 },
      { id: "precisao",  emoji: "🎯", nome: "Precisão",         desc: "+2% de chance de crítico.",        custo: 10,  max: 20 },
      { id: "agilidade", emoji: "💨", nome: "Agilidade",        desc: "+1,5% de esquiva.",                custo: 10,  max: 20 },
      { id: "alquimia",  emoji: "🧪", nome: "Alquimia",         desc: "+1 poção no início.",              custo: 15,  max: 5 },
      { id: "ganancia",  emoji: "💰", nome: "Ganância",         desc: "+15% de ouro.",                    custo: 8,   max: 20 },
      { id: "sabedoria", emoji: "📖", nome: "Sabedoria",        desc: "+10% de experiência.",             custo: 12,  max: 20 },
      { id: "saque",     emoji: "💠", nome: "Coletor de Escamas", desc: "+10% de escamas ao fim.",        custo: 20,  max: 25 },
      { id: "bencao",    emoji: "✨", nome: "Bênção do Templo", desc: "Começa cada expedição com 1 relíquia.", custo: 40, max: 1 },
      { id: "escudeiro", emoji: "🤖", nome: "Escudeiro",        desc: "Libera o combate automático.",     custo: 50,  max: 1 },
      { id: "mapa",      emoji: "🗺️", nome: "Mapa da Masmorra", desc: "Comece após um dragão já derrotado.", custo: 80, max: 1 },
      { id: "batedor",   emoji: "🧭", nome: "Batedor",          desc: "Libera a exploração automática (modo ocioso).", custo: 150, max: 1 },
    ];
    const custoGuilda = u => Math.ceil(u.custo * Math.pow(1.4, nivelG(u.id)) * meta.cheats.precoGuilda);

    // ========================================================
    // 5. ESTADO
    // ========================================================
    const CHAVE = "cacador-dragoes-v1";
    // Cheats: multiplicadores que você pode mudar no painel 🧪
    const novosCheats = () => ({ escamas: 1, ouro: 1, xp: 1, vidaInimigo: 1, danoInimigo: 1, danoHeroi: 1, precoGuilda: 1, deus: false });
    const novaMeta = () => ({
      escamas: 0, totalEscamas: 0, guilda: {}, recorde: 1, dragoes: 0, expedicoes: 0, abates: 0, checkpoint: 0,
      auto: { combate: false, explorar: false, reiniciar: false }, vel: 1,
      cheats: novosCheats(),
      trofeus: [], capitulos: [], paginas: [], prologo: false, epilogo: false,
    });
    let meta = novaMeta();
    let run = null;          // a expedição atual (null = no acampamento)
    let registro = [];       // mensagens do diário
    let ocupado = false;     // true enquanto o inimigo "pensa"
    let fila = [];           // efeitos visuais esperando a tela ser desenhada
    let historiaPend = null; // cartão de história esperando o fim da vitória

    const nivelG = id => meta.guilda[id] || 0;
    const tem = id => run && run.reliquias.includes(id);
    const C = () => meta.cheats;
    const multOuro = () => (1 + 0.15 * nivelG("ganancia")) * (tem("bolsa") ? 1.5 : 1) * C().ouro;
    const multXp = () => (1 + 0.10 * nivelG("sabedoria")) * (tem("tomo") ? 1.3 : 1) * C().xp;
    const multEscamas = () => (1 + 0.10 * nivelG("saque")) * C().escamas;
    const xpProx = n => Math.round(15 * Math.pow(1.28, n - 1));
    // Cada dragão derrotado pela primeira vez vira um troféu: +8% de ataque e vida para sempre
    const multTrofeus = () => 1 + 0.08 * meta.trofeus.length;
    const idxDoBioma = andar => Math.min(BIOMAS.length - 1, Math.floor((andar - 1) / 10));

    // Atributos atuais do herói (base da expedição + relíquias)
    function H() {
      let atk = run.atk, hpMax = run.hpMax, def = run.def, crit = run.crit, esq = run.esquiva;
      run.reliquias.forEach(id => {
        const m = RELIQUIAS[id].mod;
        if (!m) return;
        atk += m.atk || 0; hpMax += m.hp || 0; def += m.def || 0; crit += m.crit || 0; esq += m.esquiva || 0;
      });
      if (tem("berserker") && run.hp < hpMax * 0.5) atk *= 1.5;
      return { atk, hpMax, def, crit: Math.min(crit, 1), esq: Math.min(esq, 0.6), critMult: run.critMult };
    }

    // ========================================================
    // 6. DIÁRIO E EFEITOS VISUAIS
    // ========================================================
    function log(texto, tipo = "") {
      registro.unshift({ texto, tipo });
      registro.length = Math.min(registro.length, 80);
    }
    const fx = (alvo, texto, tipo) => fila.push({ alvo, texto, tipo });

    // ========================================================
    // 7. EXPEDIÇÃO
    // ========================================================
    function novaExpedicao(inicio = 1) {
      run = {
        andar: inicio, inicio,
        hpMax: 50 + 10 * nivelG("vigor"), atk: 6 + nivelG("forca"), def: nivelG("armadura"),
        crit: 0.05 + 0.02 * nivelG("precisao"), critMult: 1.75, esquiva: 0.03 + 0.015 * nivelG("agilidade"),
        pocoes: 1 + nivelG("alquimia"), ouro: 0, nivel: 1, xp: 0,
        reliquias: [], abates: 0, elites: 0, dragoes: 0, escamas: 0,
        fase: "escolha", opcoes: [], inimigo: null, cd: 0, bloqueio: 0, veneno: 0,
        fenixUsada: false, niveisPend: 0, cartas: null, escolhaReliq: null, evento: null, loja: null, resultado: null,
      };
      run.hpMax = Math.round(run.hpMax * multTrofeus());
      run.atk = Math.round(run.atk * multTrofeus());
      run.hp = run.hpMax;
      registro = [];
      log(`🔥 Você acende a tocha e desce à masmorra${inicio > 1 ? ` pelo atalho até o andar ${inicio}` : ""}.`, "sist");
      if (nivelG("bencao")) ganharReliquia(reliquiaAleatoria(), "A Bênção do Templo concede");
      // Atalho do mapa: compensa os andares pulados
      const pulos = Math.floor((inicio - 1) / 10);
      for (let i = 0; i < pulos; i++) {
        ganharReliquia(reliquiaAleatoria(), "Você encontra no caminho");
        for (let k = 0; k < 4; k++) { run.nivel++; aplicarCarta(sortear(["atk", "hp", "atk", "hp", "def"]), true); }
        run.ouro += 60;
      }
      run.hp = H().hpMax;
      gerarOpcoes();
      meta.expedicoes++;
      if (!meta.prologo) { meta.prologo = true; contarHistoria(Object.assign({ tipo: "prologo" }, HISTORIA.prologo)); }
      capituloSeNovo(inicio);
      tela(); salvar();
    }

    // ---- História: cartões que aparecem entre as salas ----
    function contarHistoria(h, depois = "escolha") {
      run.historias = (run.historias || []).concat([h]);
      if (run.fase !== "historia") { run.depoisHistoria = depois; run.fase = "historia"; }
    }
    function continuarHistoria() {
      if (!run || run.fase !== "historia") return;
      run.historias.shift();
      if (run.historias.length) { tela(); salvar(); return; }
      const depois = run.depoisHistoria;
      run.depoisHistoria = null;
      if (depois === "proxFase") return proxFase();
      run.fase = "escolha";
      tela(); salvar();
    }
    function capituloSeNovo(andar) {
      const i = idxDoBioma(andar);
      if (meta.capitulos.includes(i) || !HISTORIA.capitulos[i]) return;
      meta.capitulos.push(i);
      contarHistoria(Object.assign({ tipo: "capitulo", bioma: i }, HISTORIA.capitulos[i]));
    }

    function reliquiaAleatoria(qtd = 1) {
      const livres = Object.keys(RELIQUIAS).filter(id => !run.reliquias.includes(id));
      const lista = embaralhar(livres).slice(0, qtd);
      return qtd === 1 ? lista[0] : lista;
    }
    function ganharReliquia(id, frase = "Você obtém") {
      if (!id) return;
      run.reliquias.push(id);
      const r = RELIQUIAS[id];
      if (r.mod && r.mod.hp) run.hp += r.mod.hp;
      log(`${r.emoji} ${frase}: ${r.nome}!`, "epico");
    }

    // ---- Salas ----
    const SALAS = {
      combate:  { emoji: "⚔️", nome: "Combate" },
      elite:    { emoji: "💀", nome: "Elite" },
      tesouro:  { emoji: "💰", nome: "Tesouro" },
      fogueira: { emoji: "🔥", nome: "Fogueira", dica: "Descanse ou prepare-se." },
      mercador: { emoji: "🛒", nome: "Mercador", dica: "Gaste seu ouro." },
      evento:   { emoji: "❓", nome: "Desconhecido", dica: "Algo estranho aguarda..." },
      chefe:    { emoji: "🐉", nome: "Covil do Dragão" },
    };

    function criarInimigo(tpl, rank) {
      const m = escala(run.andar);
      let hp = tpl.hp * m * C().vidaInimigo, atk = tpl.atk * m * C().danoInimigo;
      if (rank === "elite") { hp *= 1.7; atk *= 1.25; }
      // Dragões: desafio, não paredão. O primeiro é calibrado para quem ainda não tem melhorias.
      if (rank === "chefe") { const primeiro = run.andar <= 10; hp *= primeiro ? 0.6 : 0.8; atk *= primeiro ? 0.65 : 0.8; }
      return {
        nome: tpl.nome + (rank === "elite" ? " Campeão" : ""), emoji: tpl.emoji, filtro: tpl.filtro || "",
        hp: Math.round(hp), hpMax: Math.round(hp), atk: Math.max(1, Math.round(atk)),
        acoes: tpl.acoes, esquiva: tpl.esquiva || 0, rank,
        bloqueio: 0, veneno: 0, furia: 0, intencao: null, primeiroAtaque: true,
      };
    }
    function criarSala(tipo) {
      const b = biomaDo(run.andar);
      const sala = { tipo };
      if (tipo === "combate") sala.inimigo = criarInimigo(sortear(b.inimigos), "normal");
      if (tipo === "elite") sala.inimigo = criarInimigo(sortear(b.inimigos), "elite");
      if (tipo === "chefe") sala.inimigo = criarInimigo(b.chefe, "chefe");
      return sala;
    }
    function gerarOpcoes() {
      const f = run.andar;
      run.fase = "escolha";
      if (f % 10 === 0) { run.opcoes = [criarSala("chefe")]; return; }
      const pesos = { combate: 45, evento: 15, tesouro: 9, fogueira: 10 };
      if (f >= 2) pesos.mercador = 8;
      if (f >= 3) pesos.elite = 13;
      const ops = [];
      let tentativas = 0;
      while (ops.length < 3 && tentativas++ < 100) {
        const t = sortearPeso(pesos);
        if (ops.filter(o => o.tipo === t).length >= (t === "combate" ? 2 : 1)) continue;
        ops.push(criarSala(t));
      }
      if (f % 10 === 9 && !ops.some(o => o.tipo === "fogueira")) ops[2] = criarSala("fogueira");
      if (f % 10 === 5 && !ops.some(o => o.tipo === "mercador")) ops[1] = criarSala("mercador");
      run.opcoes = ops;
    }

    function escolherSala(i) {
      const s = run.opcoes[i];
      if (!s || run.fase !== "escolha") return;
      if (s.inimigo) return iniciarCombate(s.inimigo);
      if (s.tipo === "tesouro") return abrirTesouro();
      if (s.tipo === "fogueira") { run.fase = "fogueira"; log("🔥 Você encontra uma fogueira crepitante.", "sist"); }
      if (s.tipo === "mercador") { run.loja = gerarLoja(); run.fase = "loja"; log("🛒 Um mercador encapuzado abre sua mochila.", "sist"); }
      if (s.tipo === "evento") { run.evento = sortear(Object.keys(EVENTOS).filter(k => !EVENTOS[k].disponivel || EVENTOS[k].disponivel())); run.fase = "evento"; }
      tela(); salvar();
    }

    // ========================================================
    // 8. COMBATE POR TURNOS
    // ========================================================
    const atkInimigo = e => e.atk * (1 + 0.2 * e.furia);

    function escolherIntencao(e) {
      let t = sortearPeso(e.acoes);
      if (t === "cura" && e.hp > e.hpMax * 0.6) t = "atk";
      if (t === "defesa" && e.bloqueio > 0) t = "atk";
      const a = atkInimigo(e);
      const it = { tipo: t };
      if (t === "atk") it.dano = Math.round(a);
      if (t === "pesado") it.dano = Math.round(a * 2.2);
      if (t === "multi") { it.golpes = Math.random() < 0.5 ? 2 : 3; it.dano = Math.max(1, Math.round(a * 0.6)); }
      if (t === "defesa") it.bloq = Math.round(a * 1.5);
      if (t === "veneno") { it.dano = Math.max(1, Math.round(a * 0.5)); it.pilhas = Math.max(2, Math.round(a * 0.4)); }
      if (t === "cura") it.cura = Math.round(e.hpMax * 0.2);
      if (t === "sopro") it.dano = Math.round(a * 2.8);
      e.intencao = it;
    }
    function descreverIntencao(it) {
      switch (it.tipo) {
        case "atk":    return { txt: `⚔️ Atacar: ${it.dano}`, perigo: false };
        case "pesado": return { txt: `⚠️ Golpe pesado: ${it.dano}`, perigo: true };
        case "multi":  return { txt: `🗡️ ${it.golpes} golpes de ${it.dano}`, perigo: false };
        case "defesa": return { txt: `🛡️ Vai se defender (+${it.bloq})`, perigo: false };
        case "veneno": return { txt: `☠️ Veneno: ${it.dano} + ${it.pilhas} de veneno`, perigo: false };
        case "cura":   return { txt: `💚 Vai se curar (+${it.cura})`, perigo: false };
        case "furia":  return { txt: `💢 Vai se enfurecer (+20% ataque)`, perigo: false };
        case "sopro":  return { txt: `🔥 SOPRO DE DRAGÃO: ${it.dano} (ignora defesa)`, perigo: true };
        case "atordoado": return { txt: "💫 Atordoado: perde o turno", perigo: false };
      }
    }

    function iniciarCombate(e) {
      run.inimigo = e;
      run.cd = 0; run.bloqueio = 0;
      run.fase = "combate";
      escolherIntencao(e);
      if (e.rank === "chefe") {
        log(`🐉 O chão treme... ${e.nome} desperta!`, "epico");
        const d = HISTORIA.dragoes[e.nome];
        if (d) { e.fala = d.fala; log(`"${d.fala}"`, "epico"); }
      }
      else log(`${e.emoji} ${e.nome} bloqueia o caminho!`, "sist");
      tela(); salvar();
    }

    function curar(v) {
      const h = H();
      const antes = run.hp;
      run.hp = Math.min(h.hpMax, run.hp + Math.round(v));
      const c = run.hp - antes;
      if (c > 0) fx("heroi", "+" + c, "cura");
      return c;
    }

    function danoPrevisto(mult) {
      const h = H();
      let d = h.atk * mult * (run.contra ? 1.5 : 1);
      if (tem("olho") && run.inimigo && run.inimigo.rank === "chefe") d *= 2;
      d *= C().danoHeroi;
      return Math.round(d);
    }

    function golpe(mult) {
      const h = H(), e = run.inimigo;
      if (e.esquiva && Math.random() < e.esquiva) {
        log(`${e.nome} se esquivou!`, "sist"); fx("inimigo", "Errou", "miss"); return false;
      }
      let d = h.atk * mult * R(0.85, 1.15);
      if (run.contra) { d *= 1.5; run.contra = false; log("⚔️ Contra-ataque! (+50% de dano)", "bom"); }
      const crit = Math.random() < h.crit;
      if (crit) d *= h.critMult;
      if (tem("olho") && e.rank === "chefe") d *= 2;
      d *= C().danoHeroi;
      d = Math.max(1, Math.round(d));
      const abs = Math.min(e.bloqueio, d);
      e.bloqueio -= abs;
      const real = d - abs;
      e.hp -= real;
      log(`${crit ? "💥 CRÍTICO! " : ""}Você causa ${real} de dano${abs ? ` (${abs} bloqueado)` : ""}.`, "bom");
      fx("inimigo", real ? (crit ? `-${real}!` : `-${real}`) : "Bloqueado", real ? (crit ? "crit" : "dano") : "bloq");
      if (tem("adaga")) e.veneno += 2 + Math.floor(run.andar / 4);
      if (tem("vampiro") && real > 0) curar(real * 0.15);
      return true;
    }

    function acao(tipo) {
      if (!run || run.fase !== "combate" || ocupado) return;
      const e = run.inimigo, h = H();
      if (tipo === "pocao") {
        if (run.pocoes <= 0 || run.hp >= h.hpMax) return;
        run.pocoes--;
        const c = curar(h.hpMax * (tem("alquimista") ? 0.6 : 0.4));
        log(`🧪 Você bebe uma poção e recupera ${c} de vida.`, "bom");
        tela(); salvar();
        return; // poção não gasta o turno
      }
      if (tipo === "atacar") {
        golpe(1);
        if (tem("gemea") && e.hp > 0 && Math.random() < 0.25) { log("⚔️ Lâmina Gêmea: golpe extra!", "bom"); golpe(1); }
      }
      if (tipo === "habilidade") {
        if (run.cd > 0) return;
        log("🏹 Golpe do Caçador!", "bom");
        const it = e.intencao;
        const acertou = golpe(tem("cristal") ? 4 : 2.5);
        run.cd = tem("runa") ? 2 : 3;
        if (acertou && e.hp > 0 && (it.tipo === "pesado" || it.tipo === "sopro")) {
          if (e.rank === "chefe") {
            it.dano = Math.round(it.dano / 2);
            log(`💫 Você acerta ${e.nome} no meio do fôlego: o ataque perde metade da força!`, "bom");
            fx("inimigo", "ENGASGOU", "miss");
          } else {
            e.intencao = { tipo: "atordoado" };
            log(`💫 Golpe no tempo certo! ${e.nome} perde o equilíbrio e não vai atacar.`, "bom");
            fx("inimigo", "INTERROMPIDO", "miss");
          }
        }
      }
      if (tipo === "defender") {
        const b = Math.round((h.atk * 0.6 + h.def * 2 + 4) * (tem("escudo") ? 1.6 : 1));
        run.bloqueio += b;
        run.defendeu = true;
        log(`🛡️ Você ergue a guarda (+${b} de bloqueio).`, "sist");
        fx("heroi", `+${b} 🛡️`, "bloq");
      }
      if (e.hp <= 0) return vitoria();
      ocupado = true;
      tela();
      setTimeout(turnoInimigo, 480 / meta.vel);
    }

    function atingir(dano, ignoraDef) {
      const h = H(), e = run.inimigo;
      if (e.primeiroAtaque && tem("capa")) {
        e.primeiroAtaque = false;
        log("🧥 A Capa das Sombras desvia o golpe!", "bom"); fx("heroi", "Errou", "miss");
        return false;
      }
      e.primeiroAtaque = false;
      if (Math.random() < h.esq) { log("💨 Você se esquiva!", "bom"); fx("heroi", "Esquivou", "miss"); return false; }
      let d = ignoraDef ? dano : Math.max(1, dano - h.def);
      if (C().deus) d = 0;
      const abs = Math.min(run.bloqueio, d);
      run.bloqueio -= abs;
      d -= abs;
      run.hp -= d;
      log(`${e.emoji} ${e.nome} causa ${d} de dano${abs ? ` (${abs} bloqueado)` : ""}.`, "dano");
      fx("heroi", d ? `-${d}` : "Bloqueado", d ? "dano" : "bloq");
      if (tem("espinhos") && d + abs > 0) {
        const r = Math.max(1, Math.round((d + abs) * 0.3));
        e.hp -= r; fx("inimigo", `-${r} 🌵`, "dano");
      }
      verificarFenix();
      return true;
    }
    function verificarFenix() {
      if (run.hp <= 0 && tem("fenix") && !run.fenixUsada) {
        run.fenixUsada = true;
        run.hp = Math.round(H().hpMax * 0.5);
        log("🪶 A Pena de Fênix arde em chamas! Você renasce!", "epico");
        fx("heroi", "RENASCEU", "cura");
      }
    }

    function turnoInimigo() {
      ocupado = false;
      if (!run || run.fase !== "combate") return;
      const e = run.inimigo;
      e.bloqueio = 0;
      if (e.veneno > 0) {
        e.hp -= e.veneno; fx("inimigo", `-${e.veneno} ☠️`, "ven");
        log(`☠️ O veneno causa ${e.veneno} em ${e.nome}.`, "bom");
        e.veneno--;
        if (e.hp <= 0) return vitoria();
      }
      const it = e.intencao;
      const hpAntes = run.hp;
      e.turnos = (e.turnos || 0) + 1;
      switch (it.tipo) {
        case "atordoado": log(`💫 ${e.nome} cambaleia e perde o turno.`, "bom"); break;
        case "atk": case "pesado": atingir(it.dano); break;
        case "sopro": log(`🔥 ${e.nome} cospe fogo!`, "dano"); atingir(it.dano, true); break;
        case "multi": for (let i = 0; i < it.golpes && run.hp > 0; i++) atingir(it.dano); break;
        case "veneno":
          if (atingir(it.dano)) {
            if (tem("talisma")) log("🧿 O Talismã repele o veneno.", "bom");
            else { run.veneno += it.pilhas; fx("heroi", `+${it.pilhas} ☠️`, "ven"); }
          }
          break;
        case "defesa": e.bloqueio += it.bloq; log(`${e.emoji} ${e.nome} se protege (+${it.bloq}).`, "sist"); fx("inimigo", `+${it.bloq} 🛡️`, "bloq"); break;
        case "cura": { const c = Math.min(it.cura, e.hpMax - e.hp); e.hp += c; log(`${e.emoji} ${e.nome} se cura em ${c}.`, "sist"); fx("inimigo", `+${c}`, "cura"); break; }
        case "furia": e.furia++; log(`💢 ${e.nome} fica furioso!`, "dano"); fx("inimigo", "FÚRIA", "crit"); break;
      }
      if (run.hp <= 0) return morte();
      if (e.hp <= 0) return vitoria();
      // Defesa perfeita: aparou um ataque sem perder vida → próximo golpe é um contra-ataque
      if (run.defendeu && ["atk", "pesado", "multi", "veneno", "sopro"].includes(it.tipo) && run.hp >= hpAntes && !run.contra) {
        run.contra = true;
        log("⚔️ Defesa perfeita! Seu próximo golpe será um contra-ataque (+50%).", "bom");
        fx("heroi", "CONTRA-ATAQUE!", "bloq");
      }
      run.defendeu = false;

      // Fim do turno
      run.bloqueio = 0;
      if (run.veneno > 0) {
        if (!C().deus) run.hp -= run.veneno;
        fx("heroi", `-${run.veneno} ☠️`, "ven");
        log(`☠️ O veneno queima: -${run.veneno}.`, "dano");
        run.veneno--;
        verificarFenix();
        if (run.hp <= 0) return morte();
      }
      if (tem("troll")) curar(Math.max(2, H().hpMax * 0.03));
      if (run.cd > 0) run.cd--;
      escolherIntencao(e);
      tela(); salvar();
    }

    function vitoria() {
      const e = run.inimigo, f = run.andar;
      const mult = e.rank === "chefe" ? 5 : e.rank === "elite" ? 2 : 1;
      const ouro = Math.round((6 + f * 2.5) * R(0.8, 1.2) * mult * multOuro());
      const xp = Math.round((6 + f * 2.2) * mult * multXp());
      run.ouro += ouro;
      run.abates++; meta.abates++;
      fx("inimigo", "☠", "crit");
      if (e.rank === "chefe") {
        const tier = f / 10;
        run.dragoes++; meta.dragoes++;
        run.escamas += 25 * tier;
        meta.checkpoint = Math.max(meta.checkpoint, f);
        log(`🐉 ${e.nome} tomba! Você arranca ${25 * tier} escamas do dragão!`, "epico");
        curar(H().hpMax * 0.3);
        const d = HISTORIA.dragoes[e.nome];
        if (d) log(`"${d.queda}"`, "epico");
        if (!meta.trofeus.includes(e.nome)) {
          meta.trofeus.push(e.nome);
          log(`🏆 Novo troféu para a Guilda: todos os próximos caçadores ganham +8% de ataque e vida.`, "epico");
          if (d) historiaPend = Object.assign({ tipo: "dragao", inimigo: e.nome, titulo: d.selo, subtitulo: e.nome,
            texto: [`"${d.queda}"`, "Você arranca do peito do dragão uma escama-troféu. Pendurada na Guilda, ela vai fortalecer todos os próximos caçadores: +8% de ataque e de vida, para sempre."] });
        }
      } else {
        run.escamas += mult === 2 ? 5 : 1;
        if (e.rank === "elite") run.elites++;
        log(`🏆 ${e.nome} foi derrotado!`, "bom");
      }
      log(`+${ouro} de ouro, +${xp} de experiência.`, "ouro");
      run.inimigo = null; run.veneno = 0; run.bloqueio = 0; run.cd = 0; run.contra = false; run.defendeu = false;
      ganharXp(xp);
      if (mult > 1) run.escolhaReliq = reliquiaAleatoria(3);
      if (historiaPend) {
        const h = historiaPend; historiaPend = null;
        contarHistoria(h, "proxFase");
        if (h.inimigo === "Nihilux, o Dragão do Vazio" && !meta.epilogo) { meta.epilogo = true; contarHistoria(Object.assign({ tipo: "epilogo" }, HISTORIA.epilogo)); }
        tela(); salvar();
        return;
      }
      proxFase();
    }

    function ganharXp(x) {
      run.xp += x;
      while (run.xp >= xpProx(run.nivel)) {
        run.xp -= xpProx(run.nivel);
        run.nivel++;
        run.niveisPend++;
        log(`⭐ Nível ${run.nivel}!`, "epico");
      }
    }

    function morte() {
      run.hp = 0;
      const doOuro = Math.floor(run.ouro / 40);
      run.escamasOuro = doOuro;
      const ganho = Math.round((run.escamas + doOuro) * multEscamas());
      meta.escamas += ganho;
      meta.totalEscamas += ganho;
      run.ganho = ganho;
      run.fase = "morto";
      ocupado = false;
      if (doOuro) log(`💰 A Guilda troca seus ${run.ouro} de ouro por ${doOuro} escamas.`, "ouro");
      log(`💀 Você caiu no andar ${run.andar}. A guilda recupera ${ganho} escamas.`, "epico");
      tela(); salvar();
    }

    // Resolve o que estiver pendente (níveis, relíquias) e depois desce
    function proxFase() {
      if (run.niveisPend > 0) { run.fase = "nivel"; run.cartas = gerarCartas(); tela(); salvar(); return; }
      if (run.escolhaReliq && run.escolhaReliq.length) { run.fase = "reliquia"; tela(); salvar(); return; }
      run.escolhaReliq = null;
      if (run.voltarEscolha) { run.opcoes = run.voltarEscolha; run.voltarEscolha = null; run.fase = "escolha"; tela(); salvar(); return; }
      descer();
    }
    function descer() {
      run.escamas += 1 + Math.floor(run.andar / 5);
      run.andar++;
      meta.recorde = Math.max(meta.recorde, run.andar);
      if ((run.andar - 1) % 10 === 0) log(`🌑 Você entra em: ${biomaDo(run.andar).nome}.`, "epico");
      log(`⬇️ Você desce ao andar ${run.andar}.`, "sist");
      gerarOpcoes();
      capituloSeNovo(run.andar);
      tela(); salvar();
    }
    function resultado(emoji, titulo, texto) {
      run.resultado = { emoji, titulo, texto };
      run.fase = "resultado";
      tela(); salvar();
    }

    // ========================================================
    // 9. NÍVEIS, FOGUEIRA, TESOURO, LOJA E EVENTOS
    // ========================================================
    function valorCarta(id) {
      switch (id) {
        case "atk": return Math.max(2, Math.round(run.atk * 0.2));
        case "hp":  return Math.max(10, Math.round(run.hpMax * 0.2));
        case "def": return Math.max(1, Math.round(1 + run.andar * 0.25));
      }
    }
    const CARTAS = {
      atk:   { emoji: "⚔️", nome: "Braço Forte",     desc: () => `+${valorCarta("atk")} de ataque` },
      hp:    { emoji: "❤️", nome: "Robustez",        desc: () => `+${valorCarta("hp")} de vida máxima` },
      def:   { emoji: "🛡️", nome: "Pele de Couro",   desc: () => `+${valorCarta("def")} de defesa` },
      crit:  { emoji: "🎯", nome: "Olhar Afiado",    desc: () => "+6% de chance de crítico" },
      esq:   { emoji: "💨", nome: "Passos Leves",    desc: () => "+4% de esquiva" },
      critm: { emoji: "💥", nome: "Golpe Brutal",    desc: () => "+30% de dano crítico" },
      pocao: { emoji: "🧪", nome: "Kit de Ervas",    desc: () => "+2 poções" },
      cura:  { emoji: "💖", nome: "Segundo Fôlego",  desc: () => "Recupera toda a vida" },
    };
    function gerarCartas() {
      let ids = ["atk", "hp", "def", "crit", "esq", "critm", "pocao", "cura"];
      if (run.esquiva >= 0.5) ids = ids.filter(i => i !== "esq");
      if (run.crit >= 0.9) ids = ids.filter(i => i !== "crit");
      // ataque e vida aparecem com mais frequência
      const sorteadas = embaralhar(ids.concat(["atk", "hp"]));
      return [...new Set(sorteadas)].slice(0, 3);
    }
    function aplicarCarta(id, silencioso) {
      const v = valorCarta(id);
      switch (id) {
        case "atk": run.atk += v; break;
        case "hp": run.hpMax += v; run.hp += v; break;
        case "def": run.def += v; break;
        case "crit": run.crit += 0.06; break;
        case "esq": run.esquiva += 0.04; break;
        case "critm": run.critMult += 0.3; break;
        case "pocao": run.pocoes += 2; break;
        case "cura": run.hp = H().hpMax; break;
      }
      if (!silencioso) log(`${CARTAS[id].emoji} ${CARTAS[id].nome}!`, "bom");
    }
    function escolherCarta(i) {
      if (run.fase !== "nivel") return;
      aplicarCarta(run.cartas[i]);
      curar(H().hpMax * 0.1);
      run.niveisPend--;
      proxFase();
    }
    function escolherReliquia(i) {
      if (run.fase !== "reliquia") return;
      if (i >= 0) ganharReliquia(run.escolhaReliq[i], "Você escolhe");
      run.escolhaReliq = null;
      proxFase();
    }

    function fogueira(op) {
      if (run.fase !== "fogueira") return;
      const h = H();
      if (op === 0) { const c = curar(h.hpMax * 0.35); resultado("😴", "Descanso", `Você dorme junto ao fogo e recupera ${c} de vida.`); }
      if (op === 1) { const v = valorCarta("atk"); run.atk += v; resultado("🗡️", "Lâmina afiada", `Você afia sua espada: +${v} de ataque.`); }
      if (op === 2) { run.pocoes += 1; resultado("🌿", "Ervas fervidas", "Você prepara uma poção com ervas da caverna. +1 poção."); }
    }

    function abrirTesouro() {
      const f = run.andar;
      const ouro = Math.round((15 + f * 5) * R(0.8, 1.3) * multOuro());
      run.ouro += ouro;
      let extra = "";
      if (Math.random() < 0.3) { run.pocoes++; extra += " Há também uma poção!"; }
      if (Math.random() < 0.15) { const id = reliquiaAleatoria(); if (id) { ganharReliquia(id, "No fundo do baú"); extra += ` E uma relíquia: ${RELIQUIAS[id].emoji} ${RELIQUIAS[id].nome}!`; } }
      log(`💰 Tesouro: +${ouro} de ouro.`, "ouro");
      resultado("💰", "Baú do tesouro", `Você encontra ${ouro} moedas de ouro.${extra}`);
    }

    function gerarLoja() {
      const f = run.andar;
      const itens = [
        { id: "pocao", emoji: "🧪", nome: "Poção de Cura", desc: "Cura 40% da vida.", preco: 20 + f * 3, estoque: 2 },
        { id: "cura",  emoji: "💖", nome: "Curandeiro", desc: "Recupera toda a vida.", preco: 30 + f * 4, estoque: 1 },
        { id: "afiar", emoji: "🪨", nome: "Pedra de Amolar", desc: `+${bonusLoja("afiar")} de ataque.`, preco: 50 + f * 6, estoque: 1 },
        { id: "vigor", emoji: "🍷", nome: "Elixir de Vigor", desc: `+${bonusLoja("vigor")} de vida máxima.`, preco: 45 + f * 6, estoque: 1 },
      ];
      reliquiaAleatoria(2).forEach(id => itens.push({ id: "reliq", reliq: id, emoji: RELIQUIAS[id].emoji, nome: RELIQUIAS[id].nome, desc: RELIQUIAS[id].desc, preco: 90 + f * 10, estoque: 1 }));
      return itens;
    }
    // Bônus do mercador: valores fixos que crescem com o andar (não se multiplicam entre si)
    function bonusLoja(id) {
      if (id === "afiar") return Math.max(2, Math.round(2 + run.andar * 0.35));
      if (id === "vigor") return Math.round(8 + run.andar * 1.5);
    }
    function comprar(i) {
      const it = run.loja[i];
      if (!it || it.estoque <= 0 || run.ouro < it.preco) return;
      run.ouro -= it.preco;
      it.estoque--;
      if (it.id === "pocao") run.pocoes++;
      if (it.id === "cura") curar(H().hpMax);
      if (it.id === "afiar") run.atk += bonusLoja("afiar");
      if (it.id === "vigor") { const v = bonusLoja("vigor"); run.hpMax += v; run.hp += v; }
      if (it.id === "reliq") ganharReliquia(it.reliq, "Você compra");
      log(`🛒 Comprou: ${it.nome} (−${it.preco} de ouro).`, "ouro");
      tela(); salvar();
    }

    // Eventos: cada opção devolve [emoji, título, texto]
    const EVENTOS = {
      altar: {
        emoji: "🕯️", titulo: "Altar Sombrio",
        texto: "Um altar de pedra negra pulsa com uma luz vermelha. Uma voz sussurra: \"Sangue por poder...\"",
        opcoes: [
          { txt: "Oferecer sangue (−25% da vida)", fazer: () => {
            run.hp = Math.max(1, run.hp - Math.round(H().hpMax * 0.25));
            const id = reliquiaAleatoria();
            if (id) ganharReliquia(id, "O altar concede");
            return ["🩸", "Pacto selado", id ? `Você sangra sobre o altar e recebe ${RELIQUIAS[id].emoji} ${RELIQUIAS[id].nome}.` : "O altar aceita seu sangue, mas não tem mais nada a oferecer."];
          } },
          { txt: "Ir embora", fazer: () => ["🚶", "Prudência", "Você se afasta do altar. Melhor não mexer com isso."] },
        ],
        auto: () => run.hp > H().hpMax * 0.6 ? 0 : 1,
      },
      fonte: {
        emoji: "⛲", titulo: "Fonte Encantada",
        texto: "Uma fonte de água prateada brilha no meio da sala. Moedas antigas repousam no fundo.",
        opcoes: [
          { txt: "Beber (cura 40%)", fazer: () => { const c = curar(H().hpMax * 0.4); return ["💧", "Água revigorante", `Você recupera ${c} de vida.`]; } },
          { txt: "Encher frascos (+1 poção)", fazer: () => { run.pocoes++; return ["🧪", "Frasco cheio", "A água mágica vira uma poção. +1 poção."]; } },
        ],
        auto: () => run.hp < H().hpMax * 0.6 ? 0 : 1,
      },
      bau: {
        emoji: "📦", titulo: "Baú Suspeito",
        texto: "Um baú solitário no centro da sala. Parece valioso... talvez valioso demais.",
        opcoes: [
          { txt: "Abrir o baú", fazer: () => {
            if (Math.random() < 0.5) {
              const ouro = Math.round((40 + run.andar * 10) * multOuro());
              run.ouro += ouro;
              return ["💰", "Fortuna!", `O baú estava cheio: +${ouro} de ouro.`];
            }
            iniciarCombate(criarInimigo(MIMICO, "elite"));
            log("📦 O baú cria dentes! É um MÍMICO!", "dano");
            return null;
          } },
          { txt: "Deixar para lá", fazer: () => ["🚶", "Desconfiado", "Você contorna o baú com cuidado."] },
        ],
        auto: () => run.hp > H().hpMax * 0.7 ? 0 : 1,
      },
      ermitao: {
        emoji: "🧙", titulo: "O Ermitão",
        texto: "Um velho caçador de dragões aposentado vive nesta caverna. Ele tem histórias... e itens.",
        opcoes: [
          { txt: "Ouvir histórias (+experiência)", fazer: () => {
            const x = Math.round(xpProx(run.nivel) * 0.7);
            ganharXp(x);
            return ["📜", "Sabedoria antiga", `Você aprende os pontos fracos dos dragões. +${x} de experiência.`];
          } },
          { txt: () => `Comprar relíquia (${60 + run.andar * 6} de ouro)`, pode: () => run.ouro >= 60 + run.andar * 6, fazer: () => {
            run.ouro -= 60 + run.andar * 6;
            const id = reliquiaAleatoria();
            if (id) ganharReliquia(id, "O ermitão entrega");
            return ["🎁", "Bom negócio", id ? `Você recebe ${RELIQUIAS[id].emoji} ${RELIQUIAS[id].nome}.` : "Ele não tem mais nada para vender."];
          } },
        ],
        auto: () => 0,
      },
      restos: {
        emoji: "🦴", titulo: "Restos de um Aventureiro",
        texto: "O esqueleto de um aventureiro que não teve sorte. Sua mochila ainda parece cheia.",
        opcoes: [
          { txt: "Revistar a mochila", fazer: () => {
            if (Math.random() < 0.6) {
              const ouro = Math.round((20 + run.andar * 6) * multOuro());
              run.ouro += ouro; run.pocoes++;
              return ["🎒", "Achados", `Você encontra ${ouro} de ouro e uma poção.`];
            }
            const v = 3 + run.andar;
            if (!tem("talisma")) run.veneno += v;
            return ["🕷️", "Picada!", tem("talisma") ? "Uma aranha pula da mochila, mas seu Talismã o protege." : `Uma aranha venenosa pula da mochila! +${v} de veneno (será aplicado no próximo combate).`];
          } },
          { txt: "Dar um enterro digno (cura 15%)", fazer: () => { const c = curar(H().hpMax * 0.15); return ["⚰️", "Paz", `Você se sente em paz. +${c} de vida.`]; } },
        ],
        auto: () => 0,
      },
      pagina: {
        emoji: "📜", titulo: "Página Rasgada",
        texto: "Presa sob uma pedra, uma folha de pergaminho manchada de fuligem. A letra apressada é inconfundível: é de Aldric, seu mestre.",
        disponivel: () => meta.paginas.length < HISTORIA.paginas.length,
        opcoes: [
          { txt: "Ler a página", fazer: () => {
            const n = meta.paginas.length;
            meta.paginas.push(n);
            const x = Math.round(xpProx(run.nivel) * 0.3);
            ganharXp(x);
            log(`📜 Você guarda a página ${n + 1} do diário de Aldric (+${x} de experiência).`, "epico");
            contarHistoria({ tipo: "pagina", titulo: `Diário de Aldric · página ${n + 1} de ${HISTORIA.paginas.length}`, subtitulo: "Página Rasgada", sprite: "pergaminho", texto: [`"${HISTORIA.paginas[n]}"`] }, "proxFase");
            tela(); salvar();
            return null;
          } },
        ],
        auto: () => 0,
      },
      ferreiro: {
        emoji: "🔨", titulo: "Ferreiro Anão",
        texto: "Um anão de barba chamuscada martela uma bigorna improvisada. \"Ponha ouro na mesa e eu deixo sua lâmina digna de um dragão.\"",
        opcoes: [
          { txt: () => `Afiar a lâmina: +25% de ataque (${40 + run.andar * 6} de ouro)`, pode: () => run.ouro >= 40 + run.andar * 6, fazer: () => {
            run.ouro -= 40 + run.andar * 6;
            const v = Math.max(2, Math.round(run.atk * 0.25));
            run.atk += v;
            return ["🗡️", "Fio de navalha", `O anão devolve sua espada cantando no ar. +${v} de ataque.`];
          } },
          { txt: () => `Reforçar a armadura: +${2 + Math.floor(run.andar / 4)} de defesa (${35 + run.andar * 5} de ouro)`, pode: () => run.ouro >= 35 + run.andar * 5, fazer: () => {
            run.ouro -= 35 + run.andar * 5;
            const v = 2 + Math.floor(run.andar / 4);
            run.def += v;
            return ["🛡️", "Placas novas", `Rebites novos, placas mais grossas. +${v} de defesa.`];
          } },
          { txt: "Recusar e seguir", fazer: () => ["🚶", "Talvez outro dia", "\"Volte quando tiver ouro de verdade\", resmunga o anão."] },
        ],
        auto: () => run.ouro >= 40 + run.andar * 6 ? 0 : run.ouro >= 35 + run.andar * 5 ? 1 : 2,
      },
      prisioneiro: {
        emoji: "⛓️", titulo: "Prisioneiro na Jaula",
        texto: "Um caçador da Guilda, magro e ferido, balança numa jaula pendurada sobre o abismo. \"Me tire daqui e eu lhe dou tudo o que tenho.\"",
        opcoes: [
          { txt: "Libertá-lo (−15% da vida)", fazer: () => {
            run.hp = Math.max(1, run.hp - Math.round(H().hpMax * 0.15));
            const id = reliquiaAleatoria();
            if (id) ganharReliquia(id, "O prisioneiro entrega");
            return ["🗝️", "Um caçador a mais", `Você força as grades até cortar as mãos. Ele lhe entrega ${id ? `${RELIQUIAS[id].emoji} ${RELIQUIAS[id].nome}` : "um aperto de mão"} e sobe em direção à luz. "Aldric passou por aqui. Ele falava de você."`];
          } },
          { txt: "Seguir em frente", fazer: () => ["🚶", "Peso na consciência", "Você segue. Os gritos ecoam pelos corredores por muito tempo."] },
        ],
        auto: () => run.hp > H().hpMax * 0.5 ? 0 : 1,
      },
      santuario: {
        emoji: "💠", titulo: "Santuário de Escamas",
        texto: "Escamas de dragões antigos cobrem um altar de osso. Arrancá-las queima a pele e a alma, mas a Guilda pagaria muito bem por elas.",
        opcoes: [
          { txt: () => `Arrancar escamas: +${6 + run.andar} escamas (−15% da vida máxima nesta expedição)`, fazer: () => {
            const perda = Math.max(1, Math.round(run.hpMax * 0.15));
            run.hpMax -= perda;
            run.hp = Math.min(run.hp, H().hpMax);
            const ganho = 6 + run.andar;
            run.escamas += ganho;
            log(`💠 Santuário: +${ganho} escamas para a Guilda, −${perda} de vida máxima.`, "epico");
            return ["💠", "Escamas ardentes", `As escamas queimam suas mãos. +${ganho} escamas, mas sua vida máxima cai ${perda} até o fim da expedição.`];
          } },
          { txt: "Deixar o santuário em paz", fazer: () => ["🚶", "Respeito", "Algumas coisas devem ficar onde estão."] },
        ],
        auto: () => run.hp > H().hpMax * 0.6 ? 0 : 1,
      },
    };
    function opcaoEvento(i) {
      if (run.fase !== "evento") return;
      const op = EVENTOS[run.evento].opcoes[i];
      if (op.pode && !op.pode()) return;
      const r = op.fazer();
      if (r) resultado(...r);
    }

    // ========================================================
    // 10. TELAS
    // ========================================================
    // (Camada visual: só desenha o estado do jogo. Nenhuma regra mora aqui.)
    const A = window.ARTE;
    const S = (id, classe = "", titulo = "") => A.sprite(id, classe, titulo);
    const semEmoji = txt => String(txt).replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}\u{20E3}]/gu, "").replace(/\s{2,}/g, " ").trim();
    const reduzido = () => window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ms = v => v / (meta.vel || 1);
    const faseAtual = () => run ? run.fase : "guilda";
    const idxBioma = andar => Math.min(BIOMAS.length - 1, Math.floor((andar - 1) / 10));
    const RAR_NOME = { comum: "Comum", rara: "Rara", epica: "Épica", lendaria: "Lendária" };
    let antes = { fase: null, andar: null, chefe: false };
    let barrasAntes = {};
    let fundoAtual = null;
    let ultimoComprado = null;
    let entrando = false;
    let posInimigo = null;

    // Ícones fixos da barra do topo e tochas (desenhados uma vez)
    document.querySelector(".ico-titulo").innerHTML = S("cabeca-dragao");
    document.querySelector(".ico-escama").innerHTML = S("escama");
    document.querySelector(".ico-recorde").innerHTML = S("tocha");
    document.querySelector(".ico-dragoes").innerHTML = S("trofeu");
    document.querySelectorAll(".tocha").forEach(t => t.innerHTML = A.tocha());

    function tela() {
      const c = meta.cheats, padrao = novosCheats();
      $("btn-cheats").classList.toggle("ativos", Object.keys(padrao).some(k => c[k] !== padrao[k]));
      if (!$("cheats-fundo").hidden) $("cheats").innerHTML = htmlCheats();
      $("b-escamas").textContent = fmt(meta.escamas);
      $("b-recorde").textContent = meta.recorde;
      $("b-dragoes").textContent = meta.dragoes;
      document.body.classList.toggle("em-run", !!run);
      const raiz = document.documentElement.style;
      raiz.setProperty("--vel", meta.vel);

      const fantasma = capturarMorte();
      if (!run) {
        telaAcampamento();
      } else {
        const b = idxBioma(run.andar);
        raiz.setProperty("--bioma", biomaDo(run.andar).cor);
        raiz.setProperty("--perigo", (((run.andar - 1) % 10) / 9).toFixed(2));
        montarFundo(b);
        $("andar-topo").innerHTML = htmlAndarTopo();
        $("camada").innerHTML = htmlCamada();
        $("inferior").innerHTML = htmlInferior();
        $("p-heroi").className = "painel em-run-heroi";
        $("p-heroi").innerHTML = htmlHeroi();
        $("p-lado").innerHTML = htmlRegistro();
      }
      $("palco").dataset.fase = faseAtual();
      requestAnimationFrame(() => depoisDeDesenhar(fantasma));
    }

    function montarFundo(i) {
      if (fundoAtual === i) return;
      fundoAtual = i;
      $("fundo").innerHTML = A.cenario(i);
      document.documentElement.style.setProperty("--cor-tocha", A.corTocha(i));
      document.documentElement.style.setProperty("--nevoa", A.corNevoa(i));
    }

    // ---------- Pequenos construtores de HTML ----------
    function barra(id, tipo, atual, max, texto, icone = "") {
      const p = Math.max(0, Math.min(100, atual / max * 100));
      return `<div class="barra-st ${tipo}" data-barra="${id}" data-pct="${p.toFixed(2)}"><i class="rastro"></i><i class="cheio"></i><span>${icone ? S(icone) : ""}${texto}</span></div>`;
    }
    const tag = (cls, ico, txt) => `<span class="tag ${cls}">${S(ico)}${txt}</span>`;
    const atraso = dur => `animation-delay:-${((Date.now() % (dur * 1000)) / 1000).toFixed(2)}s`;
    function atributo(ico, nome, valor) { return `<div class="atributo">${S(ico)}<span>${nome}<b>${valor}</b></span></div>`; }

    function htmlHeroi() {
      const h = H();
      const tags = [];
      if (run.bloqueio > 0) tags.push(tag("bloq", "escudo", run.bloqueio));
      if (run.veneno > 0) tags.push(tag("ven", "gota-veneno", run.veneno));
      if (tem("berserker") && run.hp < h.hpMax * 0.5) tags.push(tag("fur", "machado", "Fúria"));
      if (run.contra) tags.push(tag("contra", "espadas-cruzadas", "Contra-ataque"));
      const rel = run.reliquias.map(id => {
        const r = RELIQUIAS[id];
        return `<button class="reliq-ico r-${A.raridadeReliquia(id)}" data-reliq="${id}" aria-label="${r.nome}: ${r.desc}">${S(A.reliquia(id))}<span class="tip"><b>${r.nome}</b>${r.desc}</span></button>`;
      }).join("");
      return `
        <div class="col-a">
          <div class="heroi-topo">
            <div class="retrato">${S("cacador-retrato")}</div>
            <div><div class="heroi-nome">Caçador</div><span class="nivel-selo">Nível ${run.nivel}</span></div>
          </div>
          ${barra("heroi-hp", "vida", run.hp, h.hpMax, `${Math.max(0, Math.ceil(run.hp))} / ${Math.round(h.hpMax)}`, "coracao")}
          ${barra("heroi-xp", "xp", run.xp, xpProx(run.nivel), `XP ${run.xp} / ${xpProx(run.nivel)}`)}
          <div class="status">${tags.join("")}</div>
          <div class="recursos">
            <span class="recurso" title="Ouro">${S("moeda")}${fmt(run.ouro)}</span>
            <span class="recurso" title="Poções">${S("pocao")}${run.pocoes}</span>
            <span class="recurso esc" title="Escamas desta expedição">${S("escama")}${fmt(run.escamas * multEscamas())}</span>
          </div>
        </div>
        <div class="col-b">
          <div class="atributos">
            ${atributo("espada", "Ataque", Math.round(h.atk))}
            ${atributo("escudo", "Defesa", h.def)}
            ${atributo("alvo", "Crítico", pct(h.crit))}
            ${atributo("vento", "Esquiva", pct(h.esq))}
          </div>
          <h3 class="sub">Relíquias <small>(${run.reliquias.length})</small></h3>
          <div class="reliquias">${rel || '<span class="fraco pequeno">Nenhuma ainda.</span>'}</div>
          <div class="reliq-info" id="reliq-info"></div>
        </div>`;
    }

    function htmlAndarTopo() {
      const f = run.andar;
      const inicioBloco = Math.floor((f - 1) / 10) * 10 + 1;
      let trilha = "";
      for (let i = inicioBloco; i < inicioBloco + 10; i++) {
        if (i % 10 === 0) trilha += S("cabeca-dragao", i === f ? "aqui" : "");
        else trilha += `<i class="${i < f ? "feito" : i === f ? "aqui" : ""}"></i>`;
      }
      const falta = 10 - ((f - 1) % 10) - 1;
      return `
        <div><div class="num">Andar ${f}</div><div class="trilha">${trilha}</div></div>
        <div class="bioma"><b>${biomaDo(f).nome}</b><br><span class="pequeno">${falta ? `Dragão em ${falta} andar${falta > 1 ? "es" : ""}` : "Covil do dragão!"}</span></div>`;
    }

    function htmlAuto() {
      const chaves = [];
      if (nivelG("escudeiro")) chaves.push(`<button class="chave ${meta.auto.combate ? "on" : ""}" data-auto="combate">${S("elmo-pluma")}Combate automático</button>`);
      if (nivelG("batedor")) {
        chaves.push(`<button class="chave ${meta.auto.explorar ? "on" : ""}" data-auto="explorar">${S("bussola")}Explorar sozinho</button>`);
        chaves.push(`<button class="chave ${meta.auto.reiniciar ? "on" : ""}" data-auto="reiniciar">${S("pena")}Recomeçar ao morrer</button>`);
      }
      if (!chaves.length) return "";
      chaves.push(`<button class="chave" data-vel="1">${S("relogio")}Velocidade ×${meta.vel}</button>`);
      return `<div class="auto-barra">${chaves.join("")}</div>`;
    }

    // ---------- Valores da intenção do inimigo ----------
    function infoIntencao(it) {
      switch (it.tipo) {
        case "atk":    return { valor: it.dano, rotulo: "Ataque" };
        case "pesado": return { valor: it.dano, rotulo: "Golpe pesado" };
        case "multi":  return { valor: `${it.golpes}×${it.dano}`, rotulo: "Golpes múltiplos" };
        case "defesa": return { valor: `+${it.bloq}`, rotulo: "Vai se defender", calmo: true };
        case "veneno": return { valor: it.dano, rotulo: `Veneno (+${it.pilhas})` };
        case "cura":   return { valor: `+${it.cura}`, rotulo: "Vai se curar", calmo: true };
        case "furia":  return { valor: "+20%", rotulo: "Vai se enfurecer" };
        case "sopro":  return { valor: it.dano, rotulo: "Sopro · ignora defesa" };
        case "atordoado": return { valor: "—", rotulo: "Atordoado: perde o turno", calmo: true };
      }
      return { valor: "?", rotulo: "" };
    }

    // ---------- O que aparece no palco ----------
    function heroiAtor(classe = "", extra = "") {
      return `<div class="ator ator-heroi ${classe}">${extra}<div class="corpo idle" style="${atraso(2.6)}">${S("cacador", "", "Caçador")}</div><div class="sombra"></div></div>`;
    }
    function objeto(sprId, classe = "", brilho = "") {
      return `<div class="objeto-central ${classe}" style="${brilho ? `--brilho:${brilho}` : ""}">${S(sprId)}</div>`;
    }

    function htmlCamada() {
      const f = run.fase;
      if (f === "escolha") {
        return `<div class="portas n${run.opcoes.length}">${run.opcoes.map((s, i) => {
          const info = SALAS[s.tipo];
          let dica = info.dica || "";
          if (s.inimigo) dica = `<span class="mini-inimigo">${S(A.inimigo(s.inimigo.nome))}</span>${s.inimigo.nome}<span>${S("coracao")}${s.inimigo.hp}</span><span>${S("espada")}${s.inimigo.atk}</span>`;
          if (s.tipo === "tesouro") dica = "Ouro e, quem sabe, algo mais.";
          return `<button class="porta p-${s.tipo}" data-sala="${i}" aria-label="${info.nome}">
            <span class="porta-moldura">${A.porta(s.tipo)}<span class="porta-emblema">${S(A.sala(s.tipo))}</span></span>
            <span class="porta-rotulo"><b>${info.nome}</b><span class="dica">${dica}</span></span>
            <kbd>${i + 1}</kbd>
          </button>`;
        }).join("")}</div>`;
      }
      if (f === "combate") {
        const e = run.inimigo;
        const id = A.inimigo(e.nome);
        const it = e.intencao;
        const perigo = descreverIntencao(it).perigo;
        const ii = infoIntencao(it);
        const tags = [];
        if (e.bloqueio > 0) tags.push(tag("bloq", "escudo", e.bloqueio));
        if (e.veneno > 0) tags.push(tag("ven", "gota-veneno", e.veneno));
        if (e.furia > 0) tags.push(tag("fur", "furia", `×${e.furia}`));
        if (e.esquiva) tags.push(tag("", "vento", pct(e.esquiva)));
        const aura = run.bloqueio > 0 ? `<div class="aura-escudo"><b>${run.bloqueio}</b></div>` : "";
        return `
          ${heroiAtor(run.veneno > 0 ? "envenenado" : "", aura)}
          <div class="hud-inimigo">
            <div class="nome-inimigo ${e.rank}">${e.nome}</div>
            ${barra(`ini-${e.nome}-${e.hpMax}`, "inimigo", e.hp, e.hpMax, `${Math.max(0, Math.ceil(e.hp))} / ${e.hpMax}`)}
            <div class="status">${tags.join("")}</div>
          </div>
          ${e.fala && !e.turnos ? `<div class="fala-dragao">"${e.fala}"</div>` : ""}
          <div class="intencao ${perigo ? "perigo" : ""} ${ii.calmo ? "calmo" : ""} ${it.tipo === "atordoado" ? "atordoado" : ""} ${e.rank === "chefe" ? "vs-chefe" : ""}" title="${semEmoji(descreverIntencao(it).txt)}">
            <span class="rotulo">Próxima ação</span>${S(A.intencao(it.tipo), "it-ico")}<div><b>${ii.valor}</b><small>${ii.rotulo}</small></div>
          </div>
          <div class="ator ator-inimigo ${e.rank} ${A.voa(id) ? "voa" : ""} ${e.veneno > 0 ? "envenenado" : ""}">
            <div class="corpo idle" style="${atraso(2.6)}">${S(id, "", e.nome)}</div><div class="sombra"></div>
          </div>`;
      }
      if (f === "historia") {
        const h = run.historias[0];
        if (h.tipo === "dragao") return `<div class="titulo-palco">${h.titulo}</div><div class="dragao-caido">${S(A.inimigo(h.inimigo))}</div>`;
        if (h.tipo === "capitulo") return `<div class="titulo-palco">${h.titulo}</div>${heroiAtor()}${objeto(h.sprite, "icone")}`;
        return `<div class="titulo-palco">${h.titulo}</div>${objeto(h.sprite, "icone")}`;
      }
      if (f === "nivel") return `<div class="titulo-palco">Nível ${run.nivel - run.niveisPend + 1}!</div>${heroiAtor("heroi-centro")}`;
      if (f === "reliquia") return `<div class="titulo-palco">Espólios!</div>${objeto("bau-aberto")}`;
      if (f === "fogueira") return `${heroiAtor()}${objeto("fogueira-grande", "", "251,146,60")}`;
      if (f === "loja") return `${heroiAtor()}<div class="ator ator-inimigo"><div class="corpo idle" style="${atraso(2.6)}">${S("mercador", "", "Mercador")}</div><div class="sombra"></div></div>`;
      if (f === "evento") return objeto(A.evento(run.evento), "icone", "167,139,250");
      if (f === "resultado") {
        const spr = A.emoji(run.resultado.emoji);
        return objeto(spr, A.ehIcone(spr) ? "icone" : "");
      }
      if (f === "morto") return `<div class="titulo-palco roxo">Fim da caçada</div><div class="ator caido">${S("cacador")}</div>${objeto("lapide", "", "167,139,250")}`;
      return "";
    }

    // ---------- Parte de baixo: ações, cartas e textos ----------
    function carta(attrs, ico, raridade, nome, desc, extra = "", tecla = "") {
      return `<button class="carta r-${raridade}" ${attrs}>${S(ico, "c-ico")}<span class="c-rar">${RAR_NOME[raridade]}</span><span class="c-nome">${nome}</span><span class="c-desc">${desc}</span>${extra}${tecla ? `<kbd>${tecla}</kbd>` : ""}</button>`;
    }

    function htmlInferior() {
      const f = run.fase;
      if (f === "escolha") {
        return `<p class="dica-portas">${run.opcoes.length > 1 ? "Três passagens se abrem diante de você. Qual caminho seguir?" : "Um calor sufocante vem da última porta..."}</p>${htmlAuto()}`;
      }
      if (f === "combate") {
        const h = H();
        const bloq = Math.round((h.atk * 0.6 + h.def * 2 + 4) * (tem("escudo") ? 1.6 : 1));
        const multH = tem("cristal") ? 4 : 2.5;
        const sug = ocupado ? null : decidirCombate();
        const dis = ocupado ? "disabled" : "";
        const recarga = run.cd > 0 ? `<span class="recarga">${"<i></i>".repeat(run.cd)}</span>` : "";
        const tipoIt = run.inimigo.intencao.tipo;
        const interrompe = run.cd === 0 && (tipoIt === "pesado" || tipoIt === "sopro");
        const botao = (id, ico, nome, info, desabilitado, extra = "", classe = "") =>
          `<button class="acao ${classe} ${sug === id && !desabilitado ? "sugerida" : ""}" data-acao="${id}" ${desabilitado ? "disabled" : ""}>${S(ico, "a-ico")}<span class="a-nome">${nome}</span><span class="a-info">${info}</span>${extra}</button>`;
        return `<div class="acoes">
            ${botao("atacar", "espada", "Atacar", `~${danoPrevisto(1)} de dano`, !!dis, "<kbd>1</kbd>")}
            ${botao("defender", "escudo", "Defender", `+${bloq} de bloqueio`, !!dis, "<kbd>2</kbd>")}
            ${botao("habilidade", "golpe", "Golpe do Caçador", run.cd > 0 ? `recarga: ${run.cd} turno${run.cd > 1 ? "s" : ""}` : interrompe ? `<b class="a-info interrompe" style="display:inline">~${danoPrevisto(multH)} e INTERROMPE!</b>` : `~${danoPrevisto(multH)} de dano`, run.cd > 0 || ocupado, "<kbd>3</kbd>" + recarga, "especial")}
            ${botao("pocao", "pocao", `Poção (${run.pocoes})`, "não gasta o turno", run.pocoes <= 0 || run.hp >= h.hpMax || ocupado, "<kbd>4</kbd>")}
          </div>${htmlAuto()}`;
      }
      if (f === "historia") {
        const h = run.historias[0];
        const resto = run.historias.length - 1;
        return `<div class="historia-texto ${h.tipo === "pagina" || h.tipo === "dragao" ? "citacao" : ""}">
            <div class="sub-hist">${h.subtitulo || ""}</div>
            ${h.texto.map(p => `<p>${p}</p>`).join("")}
          </div>
          <div class="centralizar"><button class="botao-tocha" data-historia="1">${resto ? "Continuar" : "Seguir"} ➜</button></div>${htmlAuto()}`;
      }
      if (f === "nivel") {
        return `<div class="texto-cena"><p>Escolha uma bênção:</p></div>
          <div class="cartas cartas-entrada">${run.cartas.map((id, i) => carta(`data-carta="${i}"`, A.carta(id), A.raridadeCarta(id), CARTAS[id].nome, CARTAS[id].desc(), "", i + 1)).join("")}</div>${htmlAuto()}`;
      }
      if (f === "reliquia") {
        return `<div class="texto-cena"><p>Escolha uma relíquia para levar:</p></div>
          <div class="cartas cartas-entrada">${run.escolhaReliq.map((id, i) => carta(`data-reliq-escolha="${i}"`, A.reliquia(id), A.raridadeReliquia(id), RELIQUIAS[id].nome, RELIQUIAS[id].desc, "", i + 1)).join("")}</div>
          <div class="centralizar"><button class="botao-leve" data-reliq-escolha="-1">Pular</button></div>${htmlAuto()}`;
      }
      if (f === "fogueira") {
        const h = H();
        return `<div class="texto-cena"><h3>Fogueira</h3><p>O calor afasta o frio da masmorra. Você tem tempo para uma coisa só.</p></div>
          <div class="cartas cartas-entrada">
            ${carta(`data-fogo="0"`, "lua", "comum", "Descansar", `Recupera ${Math.round(h.hpMax * 0.35)} de vida`, "", 1)}
            ${carta(`data-fogo="1"`, "espada", "comum", "Afiar a espada", `+${valorCarta("atk")} de ataque`, "", 2)}
            ${carta(`data-fogo="2"`, "ervas", "comum", "Ferver ervas", "+1 poção", "", 3)}
          </div>${htmlAuto()}`;
      }
      if (f === "loja") {
        return `<div class="texto-cena"><h3>Mercador da Masmorra</h3><p>"Ouro brilhante, mercadoria brilhante, heh heh." Você tem <b>${fmt(run.ouro)}</b> de ouro.</p></div>
          <div class="cartas ${run.loja.length > 5 ? "" : "c5"} cartas-entrada">${run.loja.map((it, i) => {
            const rel = it.id === "reliq";
            const preco = `<span class="preco">${it.estoque <= 0 ? "Esgotado" : `${S("moeda")}${it.preco}`}</span>`;
            return carta(`data-comprar="${i}" ${it.estoque <= 0 || run.ouro < it.preco ? "disabled" : ""}`, rel ? A.reliquia(it.reliq) : A.loja(it.id), rel ? A.raridadeReliquia(it.reliq) : "comum", it.nome, it.desc, preco);
          }).join("")}</div>
          <div class="centralizar"><button class="botao-tocha" data-sair="1">Seguir em frente ➜</button></div>${htmlAuto()}`;
      }
      if (f === "evento") {
        const ev = EVENTOS[run.evento];
        return `<div class="texto-cena"><h3>${ev.titulo}</h3><p>${ev.texto}</p></div>
          <div class="cartas c2">${ev.opcoes.map((op, i) => {
            const txt = typeof op.txt === "function" ? op.txt() : op.txt;
            const pode = !op.pode || op.pode();
            return `<button class="carta so-texto" data-evento="${i}" ${pode ? "" : "disabled"}><span class="c-nome">${txt}</span></button>`;
          }).join("")}</div>${htmlAuto()}`;
      }
      if (f === "resultado") {
        const r = run.resultado;
        return `<div class="texto-cena"><h3>${r.titulo}</h3><p>${r.texto}</p></div>
          <div class="centralizar"><button class="botao-tocha" data-continuar="1">Continuar ➜</button></div>${htmlAuto()}`;
      }
      if (f === "morto") {
        return `<div class="texto-cena"><h3>Você tombou no andar ${run.andar}</h3>
          <p>Seu corpo é levado de volta à Guilda dos Caçadores. Sua história inspira os próximos.</p></div>
          <dl class="stats stats-morte">
            <dt>Andares descidos</dt><dd>${run.andar - run.inicio}</dd>
            <dt>Monstros abatidos</dt><dd>${run.abates}</dd>
            <dt>Elites derrotados</dt><dd>${run.elites}</dd>
            <dt>Dragões caçados</dt><dd>${run.dragoes}</dd>
            <dt>Nível alcançado</dt><dd>${run.nivel}</dd>
            ${run.escamasOuro ? `<dt>Ouro trocado por escamas</dt><dd>${fmt(run.escamasOuro)}</dd>` : ""}
            <dt>Escamas ganhas</dt><dd style="color:var(--escama)">${fmt(run.ganho)}</dd>
          </dl>
          <div class="centralizar"><button class="botao-tocha" data-acampamento="1">${S("tocha")}Voltar à Guilda ➜</button></div>${htmlAuto()}`;
      }
      return "";
    }

    function htmlRegistro() {
      const cls = { bom: "causado", dano: "recebido", epico: "evento", ouro: "evento" };
      const linhas = registro.slice().reverse().map(r => `<li class="${cls[r.tipo] || ""}">${semEmoji(r.texto)}</li>`).join("");
      return `<h2 class="titulo-painel">${S("pergaminho")} Diário</h2>
        <div class="legenda"><span><i style="background:#f59e0b"></i>seus golpes</span><span><i style="background:#ef4444"></i>dano sofrido</span><span><i style="background:#a78bfa"></i>eventos</span></div>
        <ul class="registro">${linhas}</ul>`;
    }

    // ---------- Depois de desenhar: animações e efeitos ----------
    function reiniciarClasse(el, c) {
      if (!el) return;
      el.classList.remove(c); void el.offsetWidth; el.classList.add(c);
    }

    function capturarMorte() {
      const sumiu = antes.fase === "combate" && run && run.fase !== "combate" && run.fase !== "morto";
      const el = document.querySelector("#camada .ator-inimigo .corpo");
      if (!sumiu || !el) return null;
      const r = el.getBoundingClientRect();
      posInimigo = r;
      return { html: el.innerHTML, r, chefe: antes.chefe };
    }

    function animarBarras() {
      document.querySelectorAll("[data-barra]").forEach(b => {
        const id = b.dataset.barra, p = +b.dataset.pct;
        const cheio = b.querySelector(".cheio"), rastro = b.querySelector(".rastro");
        const ant = barrasAntes[id];
        barrasAntes[id] = p;
        if (ant === undefined || reduzido()) { cheio.style.width = rastro.style.width = p + "%"; return; }
        cheio.style.transition = rastro.style.transition = "none";
        cheio.style.width = ant + "%";
        rastro.style.width = Math.max(ant, p) + "%";
        void b.offsetWidth;
        cheio.style.transition = rastro.style.transition = "";
        cheio.style.width = p + "%";
        setTimeout(() => { if (rastro.isConnected) rastro.style.width = p + "%"; }, ms(420));
      });
    }

    function particulas(x, y, n, tipo, forca = 90) {
      if (reduzido()) return;
      for (let i = 0; i < n; i++) {
        const d = document.createElement("div");
        const ang = Math.random() * Math.PI * 2, dist = forca * (0.4 + Math.random());
        d.className = "part " + tipo;
        d.style.left = x + "px"; d.style.top = y + "px";
        d.style.setProperty("--dx", Math.cos(ang) * dist + "px");
        d.style.setProperty("--dy", Math.sin(ang) * dist - forca * 0.4 + "px");
        d.style.setProperty("--s", (3 + Math.random() * 6) + "px");
        document.body.appendChild(d);
        setTimeout(() => d.remove(), ms(950));
      }
    }

    function morteInimigo(g) {
      const d = document.createElement("div");
      d.className = "morrendo";
      Object.assign(d.style, { left: g.r.left + "px", top: g.r.top + "px", width: g.r.width + "px", height: g.r.height + "px" });
      d.innerHTML = g.html;
      document.body.appendChild(d);
      setTimeout(() => d.remove(), ms(850));
      const cx = g.r.left + g.r.width / 2, cy = g.r.top + g.r.height * 0.55;
      particulas(cx, cy, g.chefe ? 60 : 22, g.chefe ? "brasa" : "cinza", g.chefe ? 160 : 80);
      if (g.chefe) { particulas(cx, cy, 40, "ouro", 200); if (!reduzido()) reiniciarClasse($("jogo"), "tremor-tela"); }
    }

    function flutuar(ref, txt, tipo, icone, i = 0) {
      const r = ref.getBoundingClientRect ? ref.getBoundingClientRect() : ref;
      const d = document.createElement("div");
      d.className = "flutua " + tipo;
      d.innerHTML = (icone ? S(icone, "f-ico") : "") + `<span></span>`;
      d.querySelector("span").textContent = txt;
      d.style.left = (r.left + r.width / 2 + (Math.random() * 40 - 20)) + "px";
      d.style.top = (r.top + r.height * 0.22 + i * 10) + "px";
      document.body.appendChild(d);
      setTimeout(() => d.remove(), ms(1050));
    }

    // Efeitos que a lógica pediu com fx(alvo, texto, tipo)
    function processarFila() {
      if (!fila.length) return;
      const lote = fila;
      fila = [];
      const ator = alvo => document.querySelector(alvo === "inimigo" ? "#camada .ator-inimigo" : "#camada .ator-heroi");
      const corpo = alvo => {
        const a = ator(alvo);
        if (a) return a.querySelector(".corpo");
        return alvo === "inimigo" ? posInimigo : document.querySelector("#p-heroi .retrato");
      };
      const golpe = f => ["dano", "crit", "miss", "bloq"].includes(f.tipo) && !/☠|🌵/u.test(f.texto) && !String(f.texto).startsWith("+");
      const heroiAtaca = lote.some(f => f.alvo === "inimigo" && golpe(f));
      const inimigoAtaca = lote.some(f => f.alvo === "heroi" && golpe(f));
      if (heroiAtaca) reiniciarClasse(ator("heroi"), "avanca");
      if (inimigoAtaca) reiniciarClasse(ator("inimigo"), "avanca");
      const espera = heroiAtaca || inimigoAtaca ? ms(130) : 0;
      lote.forEach((f, i) => setTimeout(() => {
        const ref = corpo(f.alvo);
        if (!ref || (ref.isConnected === false)) return;
        let tipo = f.tipo, txt = semEmoji(f.texto), icone = "";
        if (f.tipo === "miss" && /Errou|Esquivou/.test(f.texto)) { txt = "ESQUIVOU"; reiniciarClasse(ator(f.alvo), "esquiva"); }
        if (f.tipo === "bloq" && txt.startsWith("+")) { tipo = "escudo"; icone = "escudo"; }
        if (/☠/u.test(f.texto)) { tipo = "ven"; icone = "gota-veneno"; }
        if (/🌵/u.test(f.texto)) icone = "espinhos";
        if (f.texto === "☠") { txt = ""; icone = "caveira"; }
        if ((f.tipo === "dano" || f.tipo === "crit") && ref.classList) reiniciarClasse(ref, "atingido");
        if (f.alvo === "heroi" && (f.tipo === "dano" || tipo === "ven")) reiniciarClasse($("p-heroi"), "flash");
        if (f.tipo === "crit" && f.alvo === "inimigo" && !reduzido()) reiniciarClasse($("palco"), "tremor");
        if (txt || icone) flutuar(ref, txt, tipo, icone, i % 3);
      }, espera + i * ms(90)));
    }

    function depoisDeDesenhar(fantasma) {
      animarBarras();
      const f = faseAtual();
      if (fantasma) morteInimigo(fantasma);
      const palco = $("palco");
      if (run && antes.andar !== null && run.andar !== antes.andar) reiniciarClasse(palco, "transicao");
      else if (f !== antes.fase && antes.fase !== null) reiniciarClasse($("camada"), "aparece");
      if (f === "nivel" && antes.fase !== "nivel") {
        const r = palco.getBoundingClientRect();
        particulas(r.left + r.width / 2, r.top + r.height * 0.5, 46, "ouro", 150);
      }
      if (f === "morto" && antes.fase !== "morto" && !reduzido()) reiniciarClasse(palco, "tremor");
      if (ultimoComprado) {
        const el = document.querySelector(`[data-upg="${ultimoComprado.id}"]`);
        if (el) {
          reiniciarClasse(el, "comprado");
          flutuar(el, `−${fmt(ultimoComprado.custo)}`, "gasto", "escama");
          const r = el.getBoundingClientRect();
          particulas(r.left + 30, r.top + r.height / 2, 14, "ouro", 50);
        }
        ultimoComprado = null;
      }
      processarFila();
      const reg = document.querySelector(".registro");
      if (reg) reg.scrollTop = reg.scrollHeight;
      antes = { fase: f, andar: run ? run.andar : null, chefe: !!(run && run.inimigo && run.inimigo.rank === "chefe") };
      if (f !== "combate") posInimigo = null;
    }

    // Entrar por uma porta: pequena animação antes de abrir a sala
    function entrarPorta(i) {
      if (!run || run.fase !== "escolha" || entrando || !run.opcoes[i]) return;
      const el = document.querySelector(`.porta[data-sala="${i}"]`);
      if (!el || reduzido()) return escolherSala(i);
      entrando = true;
      el.classList.add("entrando");
      $("palco").classList.add("mergulho");
      setTimeout(() => {
        entrando = false;
        $("palco").classList.remove("mergulho");
        escolherSala(i);
      }, ms(360));
    }

    // ---- Painel de cheats ----
    const OPCOES_MULT = [0, 0.25, 0.5, 1, 2, 3, 5, 10, 25, 100];
    const CAMPOS_CHEAT = [
      ["escamas", "💠 Escamas ganhas"], ["ouro", "💰 Ouro ganho"],
      ["xp", "⭐ Experiência"], ["danoHeroi", "⚔️ Seu dano"],
      ["vidaInimigo", "❤️ Vida dos monstros"], ["danoInimigo", "👹 Dano dos monstros"],
      ["precoGuilda", "🏷️ Preço da Guilda"],
    ];
    function htmlCheats() {
      const c = meta.cheats;
      const selects = CAMPOS_CHEAT.map(([k, nome]) => {
        const ops = (k === "precoGuilda" ? [0, 0.1, 0.25, 0.5, 1, 2] : OPCOES_MULT.filter(v => v > 0 || k === "danoInimigo"))
          .map(v => `<option value="${v}" ${c[k] === v ? "selected" : ""}>×${String(v).replace(".", ",")}</option>`).join("");
        return `<label>${nome}<select data-cheat="${k}" class="${c[k] !== 1 ? "mudado" : ""}">${ops}</select></label>`;
      }).join("");
      const emRun = !!run && run.fase !== "morto";
      const dis = emRun ? "" : "disabled";
      return `
        <h2>Painel de Debug</h2>
        <p class="fraco pequeno" style="text-align:center">Atalho: Shift + C</p>
        <p class="fraco pequeno" style="text-align:center">As mudanças valem na hora. Vida e dano dos monstros afetam os próximos monstros que aparecerem.</p>
        <h3>Multiplicadores</h3>
        <div class="grade-c">${selects}</div>
        <label class="chave-c" style="margin-top:12px"><input type="checkbox" data-cheat-deus="1" ${c.deus ? "checked" : ""}> 😇 Modo deus (não perde vida)</label>
        <h3>Guilda</h3>
        <div class="botoes-c">
          <button data-cheat-acao="esc100">+100 💠</button>
          <button data-cheat-acao="esc1000">+1.000 💠</button>
          <button data-cheat-acao="esc100k">+100.000 💠</button>
          <button data-cheat-acao="checkpoints">🗺️ Liberar atalhos (andar 41)</button>
        </div>
        <h3>Expedição atual ${emRun ? "" : '<span class="fraco">(comece uma expedição para usar)</span>'}</h3>
        <div class="botoes-c">
          <button data-cheat-acao="ouro" ${dis}>+500 💰</button>
          <button data-cheat-acao="curar" ${dis}>💖 Curar tudo</button>
          <button data-cheat-acao="pocoes" ${dis}>+3 🧪</button>
          <button data-cheat-acao="nivel" ${dis}>⭐ Subir de nível</button>
          <button data-cheat-acao="reliquia" ${dis}>🎁 Relíquia aleatória</button>
          <button data-cheat-acao="todas" ${dis}>👑 Todas as relíquias</button>
          <button data-cheat-acao="matar" ${emRun && run.fase === "combate" && !ocupado ? "" : "disabled"}>☠️ Matar inimigo</button>
          <button data-cheat-acao="pular" ${emRun && run.fase === "escolha" ? "" : "disabled"}>⬇️ Pular andar</button>
        </div>
        <div class="rodape-c">
          <button class="chave" data-cheat-acao="resetar">↺ Voltar ao normal</button>
          <button class="botao-tocha" data-cheats-fechar="1">Fechar</button>
        </div>`;
    }
    function acaoCheat(a) {
      if (a === "esc100") meta.escamas += 100;
      if (a === "esc1000") meta.escamas += 1000;
      if (a === "esc100k") meta.escamas += 100000;
      if (a === "checkpoints") meta.checkpoint = Math.max(meta.checkpoint, 40);
      if (a === "resetar") meta.cheats = novosCheats();
      if (run && run.fase !== "morto") {
        if (a === "ouro") run.ouro += 500;
        if (a === "curar") { run.hp = H().hpMax; run.veneno = 0; }
        if (a === "pocoes") run.pocoes += 3;
        if (a === "reliquia") ganharReliquia(reliquiaAleatoria(), "Um cheat concede");
        if (a === "todas") Object.keys(RELIQUIAS).forEach(id => { if (!tem(id)) ganharReliquia(id, "Um cheat concede"); });
        if (a === "nivel") { ganharXp(xpProx(run.nivel) - run.xp); if (run.fase === "escolha") { $("cheats-fundo").hidden = true; return proxFaseNivel(); } }
        if (a === "matar" && run.fase === "combate" && !ocupado) { run.inimigo.hp = 0; $("cheats-fundo").hidden = true; return vitoria(); }
        if (a === "pular" && run.fase === "escolha") { $("cheats-fundo").hidden = true; descer(); return; }
      }
      tela(); salvar();
    }
    // Subir de nível fora do combate: mostra as cartas e depois volta para as portas
    function proxFaseNivel() {
      const opcoes = run.opcoes;
      run.fase = "nivel"; run.cartas = gerarCartas(); run.voltarEscolha = opcoes;
      tela(); salvar();
    }

    // ---- Acampamento (entre expedições) ----
    function telaAcampamento() {
      const raiz = document.documentElement.style;
      raiz.setProperty("--bioma", "#b45309");
      raiz.setProperty("--perigo", 0);
      montarFundo(5);
      const hp = Math.round((50 + 10 * nivelG("vigor")) * multTrofeus()), atk = Math.round((6 + nivelG("forca")) * multTrofeus()), def = nivelG("armadura");
      const crit = 0.05 + 0.02 * nivelG("precisao"), esq = 0.03 + 0.015 * nivelG("agilidade");
      $("p-heroi").className = "painel";
      $("p-heroi").innerHTML = `
        <div class="heroi-topo">
          <div class="retrato">${S("cacador-retrato")}</div>
          <div><div class="heroi-nome">Caçador de Dragões</div><div class="fraco pequeno">Pronto para a próxima expedição</div></div>
        </div>
        <div class="atributos">
          ${atributo("coracao", "Vida", hp)}
          ${atributo("espada", "Ataque", atk)}
          ${atributo("escudo", "Defesa", def)}
          ${atributo("pocao", "Poções", 1 + nivelG("alquimia"))}
          ${atributo("alvo", "Crítico", pct(crit))}
          ${atributo("vento", "Esquiva", pct(esq))}
        </div>
        ${meta.trofeus.length ? `<p class="pequeno" style="margin-top:8px;color:var(--tocha-2)">Troféus de dragão: +${Math.round((multTrofeus() - 1) * 100)}% de ataque e vida</p>` : ""}
        <h3 class="sub">${S("pergaminho")} Como jogar</h3>
        <p class="pequeno fraco">Desça andar por andar escolhendo portas. Em combate, observe a <b>próxima ação</b> do inimigo.</p>
        <p class="pequeno fraco" style="margin-top:6px"><b>Defesa perfeita:</b> defenda e não perca vida, e o próximo golpe vira um contra-ataque (+50%).</p>
        <p class="pequeno fraco" style="margin-top:6px"><b>Interromper:</b> use o Golpe do Caçador quando o inimigo preparar um golpe pesado. Ele perde o turno; dragões só perdem metade da força.</p>
        <p class="pequeno fraco" style="margin-top:6px">A cada 10 andares, um dragão guarda o caminho. Quando você cair, as <b>escamas</b> voltam para a Guilda e compram melhorias permanentes.</p>`;

      $("andar-topo").innerHTML = `
        <div><div class="num">Guilda dos Caçadores</div><div class="fraco pequeno">O salão onde toda caçada começa</div></div>
        <div class="bioma"><b>${fmt(meta.escamas)} escamas</b><br><span class="pequeno">para gastar em melhorias</span></div>`;
      $("camada").innerHTML = `${heroiAtor()}${objeto("fogueira-grande", "", "251,146,60")}`;

      const upgs = GUILDA.map(u => {
        const n = nivelG(u.id), max = n >= u.max, c = custoGuilda(u);
        const pode = !max && meta.escamas >= c;
        const progresso = u.max <= 5
          ? `<span class="u-pips">${Array.from({ length: u.max }, (_, k) => `<i class="${k < n ? "on" : ""}"></i>`).join("")}</span>`
          : `<span class="u-prog"><i style="width:${n / u.max * 100}%"></i></span>`;
        return `<button class="upg ${pode ? "pode" : ""} ${max ? "max" : ""}" data-upg="${u.id}" ${pode ? "" : "disabled"}>
          ${S(A.guilda(u.id), "u-ico")}
          <span>
            <span class="u-nome">${u.nome}<span class="u-niv">${u.max > 1 ? `${n}/${u.max}` : max ? "✔" : ""}</span></span>
            <span class="u-desc">${u.desc}</span>
            ${u.max > 1 ? progresso : ""}
            <span class="u-custo">${max ? "Completo" : `${S("escama")}${fmt(c)}`}</span>
          </span>
        </button>`;
      }).join("");

      let partidas = `<button class="botao-tocha" data-partir="1">${S("tocha")}Descer à masmorra</button>`;
      if (nivelG("mapa")) {
        for (let cp = 10; cp <= meta.checkpoint; cp += 10) partidas += `<button class="botao-tocha" data-partir="${cp + 1}">${S("mapa")}Andar ${cp + 1}</button>`;
      }
      $("inferior").innerHTML = `
        <div class="partidas">${partidas}</div>
        ${htmlAuto()}
        <h3 class="sub" style="margin-top:18px">${S("escama")} Melhorias permanentes <small>· você tem ${fmt(meta.escamas)} escamas</small></h3>
        <div class="guilda">${upgs}</div>`;

      $("p-lado").innerHTML = `
        <h2 class="titulo-painel">${S("trofeu")} Feitos</h2>
        <dl class="stats">
          <dt>Andar mais fundo</dt><dd>${meta.recorde}</dd>
          <dt>Dragões caçados</dt><dd>${meta.dragoes}</dd>
          <dt>Monstros abatidos</dt><dd>${fmt(meta.abates)}</dd>
          <dt>Expedições</dt><dd>${meta.expedicoes}</dd>
          <dt>Escamas totais</dt><dd>${fmt(meta.totalEscamas)}</dd>
          <dt>Páginas do diário</dt><dd>${meta.paginas.length}/${HISTORIA.paginas.length}</dd>
        </dl>
        <h3 class="sub">${S("trofeu")} Troféus de dragão <small>${meta.trofeus.length}/${BIOMAS.length}</small></h3>
        <div class="trofeus">${BIOMAS.map(b => `<span class="t ${meta.trofeus.includes(b.chefe.nome) ? "" : "off"}" title="${meta.trofeus.includes(b.chefe.nome) ? b.chefe.nome : "???"}">${S(A.inimigo(b.chefe.nome))}</span>`).join("")}</div>
        <div class="centralizar" style="margin-top:12px"><button class="botao-leve" data-cronicas="" style="display:inline-flex;align-items:center;gap:6px"><span style="width:20px;height:20px;display:inline-block">${S("pergaminho")}</span>Ler as Crônicas</button></div>
        <h3 class="sub">${S("pergaminho")} Progresso</h3>
        <p class="pequeno fraco">Tudo é salvo neste navegador automaticamente, até no meio de uma expedição.</p>
        <div class="botoes-save">
          <button data-save="exportar">Exportar</button>
          <button data-save="importar">Importar</button>
          <button data-save="apagar" class="perigo">Apagar tudo</button>
        </div>
        ${registro.length ? `<div style="margin-top:18px">${htmlRegistro()}</div>` : ""}`;
    }

    // ---- Crônicas: tudo o que já foi descoberto da história ----
    function entradasCronicas() {
      const e = [];
      e.push({ grupo: "Início", id: "prologo", nome: "Prólogo", spr: "espada", ok: meta.prologo, h: HISTORIA.prologo });
      HISTORIA.capitulos.forEach((c, i) => e.push({ grupo: "Capítulos", id: "cap" + i, nome: `${c.titulo}: ${c.subtitulo}`, spr: c.sprite, ok: meta.capitulos.includes(i), h: c }));
      BIOMAS.forEach((b, i) => {
        const d = HISTORIA.dragoes[b.chefe.nome];
        if (d) e.push({ grupo: "Dragões", id: "dr" + i, nome: b.chefe.nome, spr: A.inimigo(b.chefe.nome), ok: meta.trofeus.includes(b.chefe.nome),
          h: { titulo: d.selo, subtitulo: b.chefe.nome, texto: [`Ao aparecer: "${d.fala}"`, `Ao cair: "${d.queda}"`] } });
      });
      HISTORIA.paginas.forEach((t, i) => e.push({ grupo: "Diário de Aldric", id: "pg" + i, nome: `Página ${i + 1}`, spr: "pergaminho", ok: meta.paginas.includes(i),
        h: { titulo: `Página ${i + 1}`, subtitulo: "Diário de Aldric", texto: [`"${t}"`] } }));
      e.push({ grupo: "Fim", id: "epilogo", nome: "Epílogo", spr: "coroa", ok: meta.epilogo, h: HISTORIA.epilogo });
      return e;
    }
    function abrirCronicas(id) {
      const lista = entradasCronicas();
      const atual = lista.find(x => x.id === id && x.ok) || lista.find(x => x.ok);
      let grupo = "", html = "";
      lista.forEach(x => {
        if (x.grupo !== grupo) { grupo = x.grupo; html += `<h3>${grupo}</h3>`; }
        html += `<button class="item-cr ${atual && x.id === atual.id ? "ativo" : ""}" data-cronicas="${x.id}" ${x.ok ? "" : "disabled"}>${S(x.ok ? x.spr : "interrogacao")}${x.ok ? x.nome : "???"}</button>`;
      });
      const leitura = atual
        ? `<h2>${atual.h.titulo}</h2><div class="sub-hist">${atual.h.subtitulo || ""}</div>${atual.h.texto.map(p => `<p>${p}</p>`).join("")}`
        : `<h2>Crônicas</h2><p class="fraco">Nada descoberto ainda. Desça à masmorra!</p>`;
      const total = lista.length, achados = lista.filter(x => x.ok).length;
      $("cronicas").innerHTML = `<div class="lista"><p class="fraco pequeno" style="margin-bottom:8px">${achados} de ${total} descobertos</p>${html}</div>
        <div class="leitura"><button class="botao-leve fechar" data-fechar-cronicas="1">Fechar</button>${leitura}</div>`;
      $("cronicas-fundo").hidden = false;
    }

    function comprarGuilda(id) {
      const u = GUILDA.find(g => g.id === id);
      const c = custoGuilda(u);
      if (nivelG(id) >= u.max || meta.escamas < c) return;
      meta.escamas -= c;
      meta.guilda[id] = nivelG(id) + 1;
      tela(); salvar();
    }

    function voltarAcampamento() { run = null; ocupado = false; tela(); salvar(); }

    // ========================================================
    // 11. CLIQUES E TECLADO
    // ========================================================
    document.getElementById("jogo").addEventListener("click", e => {
      const b = e.target.closest("button");
      if (!b || b.disabled) return;
      const d = b.dataset;
      if (d.sala !== undefined) entrarPorta(+d.sala);
      else if (d.acao) acao(d.acao);
      else if (d.carta !== undefined) escolherCarta(+d.carta);
      else if (d.reliqEscolha !== undefined) escolherReliquia(+d.reliqEscolha);
      else if (d.fogo !== undefined) fogueira(+d.fogo);
      else if (d.comprar !== undefined) comprar(+d.comprar);
      else if (d.sair) proxFase();
      else if (d.evento !== undefined) opcaoEvento(+d.evento);
      else if (d.continuar) proxFase();
      else if (d.acampamento) voltarAcampamento();
      else if (d.historia) continuarHistoria();
      else if (d.cronicas !== undefined) abrirCronicas(d.cronicas);
      else if (d.fecharCronicas) $("cronicas-fundo").hidden = true;
      else if (d.partir) novaExpedicao(+d.partir);
      else if (d.upg) {
        const u = GUILDA.find(g => g.id === d.upg);
        if (u && nivelG(u.id) < u.max && meta.escamas >= custoGuilda(u)) ultimoComprado = { id: u.id, custo: custoGuilda(u) };
        comprarGuilda(d.upg);
      }
      else if (d.auto) { meta.auto[d.auto] = !meta.auto[d.auto]; tela(); salvar(); }
      else if (d.vel) { meta.vel = meta.vel >= 4 ? 1 : meta.vel * 2; tela(); salvar(); }
      else if (d.reliq) { const r = RELIQUIAS[d.reliq]; $("reliq-info").innerHTML = `<b>${r.nome}:</b> ${r.desc}`; }
      else if (d.save) gerenciarSave(d.save);
      else if (d.cheatsAbrir) { $("cheats-fundo").hidden = false; tela(); }
      else if (d.cheatsFechar) { $("cheats-fundo").hidden = true; }
      else if (d.cheatAcao) acaoCheat(d.cheatAcao);
    });

    $("jogo").addEventListener("change", e => {
      const t = e.target;
      if (t.dataset.cheat) meta.cheats[t.dataset.cheat] = parseFloat(t.value);
      else if (t.dataset.cheatDeus) meta.cheats.deus = t.checked;
      else return;
      tela(); salvar();
    });
    $("cheats-fundo").addEventListener("click", e => { if (e.target.id === "cheats-fundo") e.target.hidden = true; });
    $("cronicas-fundo").addEventListener("click", e => {
      if (e.target.id === "cronicas-fundo") { e.target.hidden = true; return; }
      const b = e.target.closest("button");
      if (b && b.dataset.cronicas !== undefined) abrirCronicas(b.dataset.cronicas);
      if (b && b.dataset.fecharCronicas) $("cronicas-fundo").hidden = true;
    });

    document.addEventListener("keydown", e => {
      if (e.key === "Escape") { $("cheats-fundo").hidden = true; $("cronicas-fundo").hidden = true; }
      if (run && run.fase === "historia" && (e.key === "Enter" || e.key === " ") && $("cheats-fundo").hidden) { e.preventDefault(); continuarHistoria(); return; }
      // Atalho discreto do painel de debug: Shift + C
      if (e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey && e.key.toLowerCase() === "c" && !/input|select|textarea/i.test(e.target.tagName)) {
        const fundo = $("cheats-fundo");
        fundo.hidden = !fundo.hidden;
        if (!fundo.hidden) tela();
        return;
      }
      if (!$("cheats-fundo").hidden) return;
      if (!run || e.ctrlKey || e.metaKey || e.altKey) return;
      const n = parseInt(e.key, 10);
      if (!n) return;
      const f = run.fase;
      if (f === "combate") acao(["atacar", "defender", "habilidade", "pocao"][n - 1]);
      else if (f === "escolha") entrarPorta(n - 1);
      else if (f === "nivel" && n <= 3) escolherCarta(n - 1);
      else if (f === "reliquia" && n <= run.escolhaReliq.length) escolherReliquia(n - 1);
      else if (f === "fogueira" && n <= 3) fogueira(n - 1);
    });

    // ========================================================
    // 12. AUTOMÁTICO (Escudeiro e Batedor)
    // ========================================================
    function decidirCombate() {
      const e = run.inimigo, h = H(), it = e.intencao;
      if (run.pocoes > 0 && run.hp < h.hpMax * 0.35) return "pocao";
      if ((it.tipo === "pesado" || it.tipo === "sopro") && run.cd === 0) return "habilidade"; // interromper
      const golpes = it.tipo === "multi" ? it.golpes : 1;
      const perigo = it.dano ? (it.tipo === "sopro" ? it.dano : Math.max(1, it.dano - h.def) * golpes) : 0;
      if (perigo >= run.hp * 0.45 || ((it.tipo === "pesado" || it.tipo === "sopro") && perigo > h.hpMax * 0.15)) return "defender";
      if (run.cd === 0) return "habilidade";
      return "atacar";
    }
    function decidirSala() {
      const h = H(), vida = run.hp / h.hpMax;
      let melhor = 0, nota = -1;
      run.opcoes.forEach((s, i) => {
        let p = { combate: 3, tesouro: 4, evento: 2.5, mercador: run.ouro >= 60 ? 3.5 : 1, elite: vida > 0.75 ? 3.5 : 0.5, fogueira: vida < 0.6 ? 6 : 1.5, chefe: 9 }[s.tipo];
        if (s.inimigo && s.tipo === "combate") p -= s.inimigo.hp / (h.atk * 20);
        if (p > nota) { nota = p; melhor = i; }
      });
      return melhor;
    }
    function passoAuto() {
      if (!run) return;
      const f = run.fase;
      if (f === "combate") { if (meta.auto.combate && !ocupado) acao(decidirCombate()); return; }
      if (!meta.auto.explorar) return;
      if (f === "escolha") escolherSala(decidirSala());
      else if (f === "nivel") {
        const pref = ["atk", "hp", "cura", "def", "crit", "critm", "esq", "pocao"];
        let ids = run.cartas;
        if (run.hp < H().hpMax * 0.4 && ids.includes("cura")) return escolherCarta(ids.indexOf("cura"));
        escolherCarta(ids.indexOf(pref.find(p => ids.includes(p))));
      }
      else if (f === "reliquia") escolherReliquia(0);
      else if (f === "fogueira") fogueira(run.hp < H().hpMax * 0.65 ? 0 : 1);
      else if (f === "loja") {
        const i = run.loja.findIndex(it => it.estoque > 0 && run.ouro >= it.preco && (it.id !== "cura" || run.hp < H().hpMax * 0.5) && (it.id !== "pocao" || run.pocoes < 4));
        if (i >= 0) comprar(i); else proxFase();
      }
      else if (f === "evento") opcaoEvento(EVENTOS[run.evento].auto());
      else if (f === "resultado") proxFase();
      else if (f === "historia") continuarHistoria();
      else if (f === "morto" && meta.auto.reiniciar) {
        const inicio = nivelG("mapa") && meta.checkpoint ? meta.checkpoint + 1 : 1;
        novaExpedicao(inicio);
      }
    }
    let proxAuto = 0;
    setInterval(() => {
      const agora = Date.now();
      if (agora < proxAuto) return;
      const espera = run && run.fase === "morto" ? 3000 : 750;
      proxAuto = agora + espera / meta.vel;
      passoAuto();
    }, 50);

    // ========================================================
    // 13. SALVAR E CARREGAR
    // ========================================================
    function salvar() {
      try { localStorage.setItem(CHAVE, JSON.stringify({ meta, run, registro: registro.slice(0, 40) })); } catch (e) { /* sem armazenamento */ }
    }
    function aplicar(dados) {
      meta = Object.assign(novaMeta(), dados.meta || {});
      meta.auto = Object.assign({ combate: false, explorar: false, reiniciar: false }, meta.auto);
      meta.cheats = Object.assign(novosCheats(), meta.cheats);
      run = dados.run || null;
      registro = dados.registro || [];
      if (run && run.fase === "combate" && run.inimigo && !run.inimigo.intencao) escolherIntencao(run.inimigo);
    }
    function gerenciarSave(op) {
      if (op === "exportar") {
        salvar();
        const codigo = btoa(unescape(encodeURIComponent(JSON.stringify({ meta, run, registro }))));
        if (navigator.clipboard) navigator.clipboard.writeText(codigo).then(() => alert("Código copiado para a área de transferência!"), () => prompt("Copie seu código:", codigo));
        else prompt("Copie seu código:", codigo);
      }
      if (op === "importar") {
        const c = prompt("Cole o código exportado:");
        if (!c) return;
        try { aplicar(JSON.parse(decodeURIComponent(escape(atob(c.trim()))))); tela(); salvar(); }
        catch (e) { alert("Código inválido."); }
      }
      if (op === "apagar") {
        if (!confirm("Apagar TODO o progresso da Guilda? Não dá para desfazer.")) return;
        meta = novaMeta(); run = null; registro = [];
        try { localStorage.removeItem(CHAVE); } catch (e) {}
        tela();
      }
    }

    try {
      const txt = localStorage.getItem(CHAVE);
      if (txt) aplicar(JSON.parse(txt));
    } catch (e) { /* save corrompido: começa do zero */ }
    tela();
  })();
