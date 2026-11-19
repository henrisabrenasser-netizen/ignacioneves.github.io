// ==========================================================
// masmorra-historia.js — A HISTÓRIA DO "CAÇADOR DE DRAGÕES"
//
// Todo o texto narrativo do jogo mora aqui: prólogo, capítulos
// de cada bioma, falas dos dragões, páginas do diário do mentor
// e o epílogo. Pode editar à vontade: o jogo só lê estes textos.
// ==========================================================

const HISTORIA = {
  prologo: {
    titulo: "Prólogo",
    subtitulo: "A espada na porta",
    sprite: "espada",
    texto: [
      "Sob a montanha de Pedra Funda dorme Nihilux, o Dragão do Vazio, preso por quatro selos. Há dez anos, quatro dragões, os Arautos, despertaram na masmorra e começaram a roer os selos por dentro.",
      "Aldric, seu mestre, desceu para detê-los e nunca voltou. Semanas depois, a espada dele apareceu cravada na porta da masmorra.",
      "Hoje a espada é sua. A caçada começa.",
    ],
  },

  // Um capítulo por bioma (na ordem de BIOMAS no jogo)
  capitulos: [
    {
      titulo: "Capítulo I", subtitulo: "Catacumbas Esquecidas", sprite: "caveira",
      texto: [
        "Os mortos daqui foram os primeiros caçadores. Os ossos ainda se levantam, não por maldade, mas porque o Vazio os chama.",
        "Em algum lugar lá embaixo, um fedor de veneno anuncia Morgrath, o Arauto Verde, guardião do primeiro selo.",
      ],
    },
    {
      titulo: "Capítulo II", subtitulo: "Cavernas Fúngicas", sprite: "ervas",
      texto: [
        "Aqui a pedra respira. Esporos brilham no escuro, e trolls dormem sobre os ossos de quem dormiu primeiro.",
        "O frio que sobe das fendas tem nome: Hrimvald, o Wyrm de Gelo, que congelou o segundo selo.",
      ],
    },
    {
      titulo: "Capítulo III", subtitulo: "Ruínas Submersas", sprite: "gota-agua",
      texto: [
        "Uma cidade inteira afundou para esconder o terceiro selo. Os cavaleiros que a guardavam ainda patrulham, afogados e leais.",
        "Sobre as águas paradas, trovões estouram sem céu. Tempestra está perto.",
      ],
    },
    {
      titulo: "Capítulo IV", subtitulo: "Forja Abissal", sprite: "chama",
      texto: [
        "Foi aqui que os selos foram forjados. Agora as forjas queimam para outro mestre.",
        "Ignaroth, o mais antigo dos Arautos, está transformando o quarto selo em brasa.",
      ],
    },
    {
      titulo: "Capítulo V", subtitulo: "Coração do Vazio", sprite: "olho-alvo",
      texto: [
        "Não há chão, só a lembrança de um. As estrelas aqui embaixo estão erradas.",
        "Algo enorme respira no escuro, e cada respiração apaga um pouco do mundo lá em cima.",
      ],
    },
  ],

  // Falas de cada dragão: ao aparecer e ao cair (por nome, como no jogo)
  dragoes: {
    "Morgrath, o Dragão Verde": {
      fala: "Mais um caçador... Seu mestre também tinha esse cheiro de coragem. Apodreceu igualzinho.",
      queda: "O primeiro selo... se fecha... Mas ele já ouviu você chegando.",
      selo: "Primeiro selo restaurado",
    },
    "Hrimvald, o Wyrm de Gelo": {
      fala: "Desça mais um andar, pequeno, e seu sangue congela antes de tocar o chão.",
      queda: "Frio... então é assim que termina? Até o Vazio pode morrer...",
      selo: "Segundo selo restaurado",
    },
    "Tempestra, a Dragoa do Trovão": {
      fala: "Afoguei uma cidade inteira por um selo. O que você acha que vou fazer com você?",
      queda: "A tempestade passa... mas o trovão lá embaixo é dele, não meu.",
      selo: "Terceiro selo restaurado",
    },
    "Ignaroth, o Ancião Rubro": {
      fala: "Eu vi os selos serem forjados. Vou estar aqui quando o último derreter.",
      queda: "Aldric disse que você viria... Ele está esperando... lá no fundo.",
      selo: "Quarto selo restaurado",
    },
    "Nihilux, o Dragão do Vazio": {
      fala: "Você trouxe a espada dele de volta para mim. Que gentileza.",
      queda: "Eu não sou o fim... sou só... o começo do silêncio...",
      selo: "O Vazio se cala",
    },
  },

  // Páginas do diário de Aldric, encontradas no evento "Página Rasgada"
  paginas: [
    "Dia 1. Desci com três tochas e uma promessa: se eu não voltar, que meu aprendiz não venha atrás de mim. (Ele vai vir. Eu viria.)",
    "Os esqueletos usam o brasão da Guilda. Somos nós. Sempre fomos nós. Os mortos daqui não atacam por ódio: estão tentando nos impedir de descer.",
    "Defender não é covardia. Um golpe bem aparado abre a guarda de qualquer fera, e o contra-ataque vem com o dobro da raiva.",
    "Um golpe certeiro no instante em que a fera respira fundo quebra o ataque dela. Até dragões engasgam. Guarde seu melhor golpe para essa hora.",
    "Morgrath falou comigo. Disse que os Arautos não querem libertar Nihilux. Querem se tornar ele.",
    "O mercador da masmorra não é humano. Não sei o que ele é. Mas aceita ouro e nunca mente sobre os preços.",
    "Cheguei à Forja. Ignaroth me reconheceu: meu nome está gravado no quarto selo, ao lado dos fundadores. Somos do sangue de quem prendeu o Vazio. Você também, aprendiz.",
    "Acabaram as tochas. Ouço Nihilux respirar. Paguei o mercador para levar minha espada até a porta da masmorra. Ele cobrou caro. Termine o que eu não terminei.",
  ],

  epilogo: {
    titulo: "Epílogo",
    subtitulo: "O silêncio no fundo da montanha",
    sprite: "coroa",
    texto: [
      "O último rugido de Nihilux ecoa por toda a montanha e se cala. Pela primeira vez em dez anos, a masmorra fica em silêncio.",
      "No chão do covil, entre escamas negras, você encontra o elmo de Aldric, intacto.",
      "A Guilda vai gravar o seu nome ao lado do dele. Mas o Vazio não morre, apenas dorme. As profundezas continuam se abrindo, cada vez mais escuras... e alguém precisa continuar descendo.",
    ],
  },
};
