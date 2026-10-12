# ARQUIVO DOS MORTOS AFOGADOS — RPG offline

RPG narrativo e tático original baseado no material da campanha Carcaça fornecido pelo criador.

## Publicação no GitHub Pages

1. Crie um repositório público (por exemplo `arquivo-dos-mortos-afogados`).
2. Extraia o ZIP e envie **todos** os arquivos e pastas do jogo para a raiz do repositório; `index.html` deve ficar na raiz, ao lado de `sw.js` e `manifest.webmanifest`.
3. Em **Settings → Pages**, escolha **Deploy from a branch**, `main`, `/(root)` e salve.
4. Abra o endereço HTTPS fornecido pelo GitHub Pages no navegador do celular, enquanto conectado.
5. Aguarde a primeira abertura carregar completamente e só então use **Instalar app** ou **Adicionar à Tela de Início**.
6. Abra pelo ícone, teste em modo avião e mantenha a opção de exportar o save como backup.

O jogo não faz requisições a APIs externas; imagens, regras e roteiro estão dentro do pacote. Os arquivos são guardados via Service Worker depois de uma instalação bem-sucedida. A capacidade de instalação depende do navegador e sistema operacional. 

## Controles

- **Cena:** observar, vasculhar, interpretar os mecanismos, abrir portas, atravessar passagens e descansar.
- **Mapa:** arraste o mapa original fornecido pelo criador e toque nos números visitados e conexões próximas.
- **Combate:** toque no herói, mova-o para uma casa pontilhada, toque numa habilidade e em seu alvo. Depois finalize a rodada.
- **Bolsa:** exportar/importar save JSON; itens e evidências reunidos.

## Mecânicas

- 43 ambientes interligados, com descrições, tesouros, colecionáveis, características de portas, pistas e armadilhas adaptados do arquivo de referência. A rota 28 → 32 → 35 → 41 → 40 começa demolida, conforme o material canônico.
- 3 personagens no grupo; ação e movimento por rodada, ataques d20, habilidades, dano, foco, defesa, efeitos de imobilização, cobertura pela névoa e terreno rochoso.
- 12 Selos da Foz e 6 Fragmentos do Juramento, provas políticas, grandes escolhas, quatro desfechos. Os Selos fortalecem testes e o Berrante Aquático tem efeito ativo em combate. A guardiã não aceita entregar voluntariamente a Lança a senhores que considera ilegítimos.
- Fôlego consumido nos ambientes totalmente submersos, com bolha emergencial da arcanista, repouso e provisões.
- Derrotas com perda de recursos, evolução de nível e salvamento automático local.

## Fontes internas

- `Arquivo_dos_Mortos_Afogados_12_carcaca_v4_entrada(1).html` — 43 salas e portas, textos, rastros e tesouros.
- `Arquivo dos Mortos Afogados.docx` — Jorō, Akaname, Kappa-Escribas, Gharoz, Veren, Morgat e Lampreias.
- `Arquivo dos Mortos Afogados 12 (player, 51 x 45).png` — mapa dos jogadores.
- `Ambientação - A Carcaça - Visão Geral.txt` e `Apêndice I - Trelohim, Uln-Shayr, Yokai, Kuo-Toa.txt` — política, história e linguagem dos yokai.

As estatísticas foram **adaptadas para jogo digital**, não são implementação literal das regras de D&D 5E; desafios narrativos e personagens adicionais são elaboração original para videogame. Evite publicar textos ou ilustrações de terceiros para os quais não tenha direito de distribuição.
