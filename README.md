# ignacioneves.github.io

Canivete Suíço: ferramentas úteis e joguinhos, direto no navegador.

## Estrutura

```
index.html, *.html   ferramentas (cotações, clima, CEP, ...)
style.css            estilo compartilhado por todas as páginas
menu.js              lista de ferramentas + menu do topo
games.html           vitrine dos jogos
jogos/
  reino/             Reino Ocioso       (index.html, estilo.css, jogo.js)
  masmorra/          Caçador de Dragões (index.html, estilo.css, jogo.js, arte.js, historia.js)
  raizes/            Raízes de Neon     (index.html, estilo.css, jogo.js, arte.js)
```

`reino.html`, `masmorra.html` e `raizes.html` na raiz só redirecionam para
os endereços novos, para links antigos continuarem funcionando.
