// ==========================================================
// menu.js — A LISTA DE FERRAMENTAS DO SITE, NUM LUGAR SÓ
//
// Quer adicionar uma ferramenta nova? Crie o arquivo .html
// e acrescente uma linha nesta lista. O menu do topo, os
// cartões da página inicial e o botão Surpresa se atualizam
// sozinhos em todas as páginas.
// ==========================================================

const FERRAMENTAS = [
  { arquivo: "cotacoes.html", emoji: "💵", nome: "Cotações",          descricao: "Dólar, euro e bitcoin em reais, atualizados a cada minuto." },
  { arquivo: "clima.html",    emoji: "🌤️", nome: "Clima",             descricao: "Temperatura agora e previsão dos próximos dias em qualquer cidade." },
  { arquivo: "cep.html",      emoji: "📮", nome: "CEP",               descricao: "Digite o CEP e descubra rua, bairro e cidade." },
  { arquivo: "feriados.html", emoji: "📅", nome: "Feriados",          descricao: "Feriados nacionais do ano e quantos dias faltam para o próximo." },
  { arquivo: "senha.html",    emoji: "🔐", nome: "Senhas",            descricao: "Crie senhas fortes e aleatórias com um clique." },
  { arquivo: "conta.html",    emoji: "🍻", nome: "Dividir conta",     descricao: "Calcula a gorjeta e quanto cada um paga." },
  { arquivo: "roleta.html",   emoji: "🎡", nome: "Roleta",            descricao: "Não consegue decidir? Coloque as opções e gire a roleta." },
  { arquivo: "numeros.html",  emoji: "🔢", nome: "Números",           descricao: "Sorteie números, jogue dado, cara ou coroa e Mega-Sena." },
  { arquivo: "games.html",    emoji: "🎮", nome: "Games",             descricao: "Joguinhos para passar o tempo." },
];

// Pasta raiz do site, descoberta a partir de onde está este menu.js.
// Assim o menu funciona tanto na raiz quanto em subpastas (ex.: jogos/reino/).
const RAIZ_DO_SITE = new URL(".", document.currentScript.src);

// Endereço completo de um arquivo do site (ex.: "clima.html" → ".../clima.html")
function enderecoDe(arquivo) {
  return new URL(arquivo, RAIZ_DO_SITE).href;
}

// Descobre em qual página estamos (ex.: "clima.html" ou "jogos/reino/index.html")
function paginaAtual() {
  let caminho = decodeURI(location.href.split(/[?#]/)[0]).slice(decodeURI(RAIZ_DO_SITE.href).length);
  if (caminho === "" || caminho.endsWith("/")) caminho += "index.html";
  return caminho;
}

// Botão Surpresa: vai para uma ferramenta aleatória (nunca a página em que você já está)
function irParaSurpresa() {
  const opcoes = FERRAMENTAS.filter(f => f.arquivo !== paginaAtual());
  const sorteada = opcoes[Math.floor(Math.random() * opcoes.length)];
  location.href = enderecoDe(sorteada.arquivo);
}

// Monta o menu do topo dentro de <header id="topo">
(function montarMenu() {
  const atual = paginaAtual();
  const itens = [{ arquivo: "index.html", nome: "Início" }, ...FERRAMENTAS];

  const links = itens.map(f =>
    `<a href="${enderecoDe(f.arquivo)}" class="${f.arquivo === atual || (f.arquivo === "games.html" && atual.startsWith("jogos/")) ? "ativo" : ""}">${f.nome}</a>`
  ).join("");

  document.getElementById("topo").innerHTML = `
    <div class="topo-dentro">
      <a href="${enderecoDe("index.html")}" class="logo">🔧 Canivete Suíço</a>
      <nav class="menu">
        ${links}
        <a href="#" class="surpresa" onclick="irParaSurpresa(); return false;">🎁 Surpresa</a>
      </nav>
    </div>`;
})();
