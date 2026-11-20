# HUD de Tormenta 20 — PROJETO

Diário do projeto. Primeiro arquivo a ler numa conversa nova.

## Objetivo
Uma barra fixa na parte de baixo da tela do Foundry VTT v13 (build 351, o único disponível no servidor) com o essencial do personagem para o combate de Tormenta 20 (sistema `tormenta20`), no visual "metal escuro, filete dourado e rubi", e um tema que deixa o chat e a interface nativa no mesmo estilo.

- **Mesa:** RPG dos Amiguinhos. Os testes são feitos no mundo de teste do limaserver e o envio é por FileZilla para `Data/modules/<id>/`.
- **Uso:** privado, só para a mesa. As artes foram geradas por IA (ChatGPT) e não serão divulgadas.

## Nome e id
- **HUD: `hud-t20`** (decidido em 2026-11-17). O id nunca muda depois de instalado.
- Temas da HUD (0.4.0): Tempestade Rubra e Aventureiro do Reinado, escolhidos no mesmo "Visual do módulo".
- Tema: **dentro do próprio `hud-t20`** (decidido em 2026-11-18; substitui a ideia de um módulo `arton-ui` separado). O título pode virar "Arton: HUD e Tema"; o id continua `hud-t20`.

## Estrutura (revisada em 2026-11-18)
Um módulo só, com duas partes:
1. **HUD do personagem:** o painel de baixo (já pronto).
2. **Tema da interface** (0.3.0): reskin por CSS do chat, da barra lateral, dos controles de cena, da navegação de cenas e da lista de jogadores. Não troca lógica nenhuma. CSS próprio em `styles/tema.css`, que só vale com a classe ligada no `body`.

**Configuração (world, só o mestre muda):** "Visual do módulo" com duas opções: **Só a HUD** ou **HUD e tema da interface**. Não há opção "só o tema" (ninguém vai usar o tema sem a HUD). Trocar não precisa recarregar. A chave de cada jogador para mostrar ou esconder a HUD continua.

Motivo da mudança: a arte de `assets/` é a mesma, e fica uma instalação, um ZIP e um repositório só.

## Visual aprovado (2026-11-17)
Protótipo: canvas "HUD de Tormenta 20 — arte do ChatGPT" (https://claude.ai/artifact/P1phEYPuckoBQPQWaYtUsP), com as telas Full HD a 100% e notebook 1366×768 a 80%.

Painel único, centralizado embaixo e sem ponteiras nas pontas. Da esquerda para a direita:
1. **Retrato:** a moldura passa só ~4 px acima da borda de cima do painel (ajustado no teste da 0.1.0, 2026-11-17; antes eram 34 px) e fica uns 12 px para dentro da ponta esquerda.
   - O retrato fica inteiro dentro da moldura e não é cortado: a imagem ocupa a abertura da moldura (6% dos lados, 7% em cima, 11% embaixo) com `contain`; o que sobrar fica escuro.
   - Nome e nível embaixo.
2. **Bloco de status:**
   - PV e PM no topo, em trilhos com o texto "atual / máximo".
   - Abaixo, quatro caixas pequenas só com ícone e número: Defesa, Deslocamento, Iniciativa e CD das magias. Os valores não quebram linha.
   - Acima do bloco, as condições ativas em medalhões redondos, com o efeito no tooltip.
3. **Cristal (gema):** separa o status dos atalhos e pulsa em vermelho com a legenda "Seu turno" quando é o turno do personagem no combate. Fora do turno e fora de combate, fica apagado e sem legenda (0.2.4; antes mostrava "Aguardando"). Para quem configura o sistema para reduzir animações, ele fica aceso sem pulsar.
4. **Ações do turno (decidido em 2026-11-17):** três losangos em arco sobre o cristal: ação padrão, movimento e reação.
   - Aceso: disponível. Apagado e riscado: gasto. A ação completa apaga padrão e movimento.
   - Padrão e movimento recarregam no início do turno do personagem; a reação, no início da rodada.
   - Fora de combate, os losangos somem.
   - Arte: `assets/acao-padrao.webp`, `acao-movimento.webp`, `acao-reacao.webp` (original em `arte-original/acoes.png`). O estado gasto é feito em CSS (cinza + risco vermelho).
5. **Atalhos:** 10 slots em 2 fileiras de 5 (1–5 e 6–0), com o número no canto. Os vazios ficam apagados. Os botões da barra nativa (som, menu, travar, limpar, página) ficam numa coluna fina à direita, apagada até passar o mouse.

**Tamanho (0.1.1, 2026-11-17):** depois do primeiro teste, o painel ficou ~20% menor: barras de PV e PM com 236 px, atalhos de 42 px, losangos de 30 px, cristal de 36 px, retrato de 104 × 106 px.

**Encaixe na tela (0.1.1):** a HUD mede o espaço livre de baixo, de `#ui-bottom` até a caixa de mensagem flutuante (`#chat-notifications`, que aparece quando a barra lateral está em outra aba que não o chat) ou a barra lateral. Ela se centraliza nesse espaço e encolhe até 60% se não couber (variáveis CSS `--hud-t20-x` e `--hud-t20-encaixe`). Recalcula com `ResizeObserver`, nos hooks `collapseSidebar` e `changeSidebarTab` e ao redimensionar a janela.

**Chat (fica para o módulo do tema):** cartão com cabeçalho de metal, emblema redondo do autor, corpo de pergaminho e rodapé com um rubi, como no conceito do Gemini. A caixa de mensagem fica com a mesma moldura. Vale tanto para a barra lateral aberta quanto recolhida (mensagens flutuantes).

**Resolução:**
- As molduras usam `border-image` em 9 partes, então esticam sem deformar.
- As texturas se repetem sem emenda.
- A HUD respeita a escala de interface do Foundry.
- Tudo foi gerado em alta resolução e é exibido reduzido, o que serve para telas 2x.

## Visual da 0.2.0 aprovado (2026-11-18)
Protótipo: "HUD T20 — protótipo 0.2.0" (https://claude.ai/artifact/Sty883VVnmBoM7Pfqqor7s). Substitui o que for diferente acima.

1. **Retrato como no conceito** (0.2.2: também vaza ~10 px na ponta esquerda, cobrindo a ponta do painel): o painel fica baixo, justo em volta do status (padding vertical 2 px), e a moldura do retrato é maior que ele (150 × 152 px, `margin: -30px 0`): ocupa só a altura do status e vaza ~10 px em cima e embaixo. O painel sobe um pouco da borda da tela para o retrato não encostar.
2. **Sem nome e nível embaixo do retrato** (o jogador sabe o nome do personagem). Nome e nível vão para o tooltip do retrato, com "Clique: abre a ficha · Botão direito: troca a imagem e o enquadramento".
3. **A imagem cobre a moldura** (`object-fit: cover`, sem faixas escuras; abertura 7% em cima, 6% dos lados e 7,5% embaixo desde a 0.2.2). O corte se resolve com a personalização:
   - Botão direito no retrato, ou engrenagem que aparece ao passar o mouse → janela "Retrato da HUD — <nome>" (ApplicationV2).
   - Trocar a imagem (FilePicker), "Usar a imagem da ficha", arrastar para enquadrar, zoom 100–300% (controle, roda do mouse, + e −), setas movem, "Centralizar", prévia em tamanho real, Cancelar/Salvar.
   - Guardar no ator: `flags.hud-t20.retrato = { img, x, y, zoom }` (x e y em %, usados em `object-position` e `transform-origin`; `transform: scale(zoom)`). Sem `img`, usa `actor.img`. Dono e mestre podem mudar.
4. **Tooltips translúcidos, no esquema do tooltip de melhorias/encantos:** fundo `rgba(20,17,16,.8)` com `backdrop-filter: blur(7px)`, borda dourada fraca; título da seção pequeno, em caixa alta e azul-aço (`#9FB4CC`) com o total em dourado à direita; uma linha por parcela com losango, nome em negrito, valor à direita e explicação menor embaixo; parcela que não soma fica riscada e apagada, com o motivo.
5. **Iniciativa clicável** (o tooltip continua no mouse; o rodapé dele diz o que o clique faz):
   - Fora de combate: rola um teste de Iniciativa no chat.
   - Em combate, sem iniciativa: rola e grava no combate (se o token não estiver no combate, adiciona).
   - Já rolada: o jogador recebe aviso; só o mestre rola de novo.
6. **Barra nativa:** some a coluna de som, menu, travar e limpar. Fica só o seletor de página (▲ número ▼), apagado até passar o mouse. Editar e remover atalho continua no botão direito.

## Tema da interface (ficha, 2026-11-18; antes chamado arton-ui)
- Só para a mesa de Tormenta 20 (pode estilizar os cartões do sistema `tormenta20`: perícia, item, ataque e dano).
- Cartões do Decreto do Panteão e do Bando da Raposa ficam como estão: o tema só veste o cabeçalho de metal e o emblema do autor.
- Reskin só por CSS de chat, barra lateral (abas na coluna vertical da direita, como no v13), controles de cena, navegação de cenas e lista de jogadores. Sem trocar lógica.
- Protótipo em andamento: canvas "Arton UI — protótipo 0.1.0" (https://claude.ai/artifact/A1BBBSjiYrvLU1G32g6MdG), com a barra lateral aberta e recolhida (mensagens flutuantes), em Full HD a 100%, mais uma tela só do cartão (100% e 200%). **Aprovado em 2026-11-18.** O CSS final está nos arquivos `project/*.dc.html` do canvas (ler com read_file antes de codar).
- **Cartão do chat (medidas aprovadas, ajustadas à mão pelo Daniel):**
  - Cabeçalho: `chat-cabecalho.webp` em `border-image` 0 80 fill / 0 30px, altura 36 px, 19 px mais largo que o corpo (5 px para a esquerda, 14 px para a direita), por cima do corpo (o corpo sobe 5 px por baixo dele). Nome em Cinzel 12 px dourado, jogador embaixo em Alegreya Sans 10,5 px, 3 px abaixo do centro da barra; hora à direita.
  - Emblema: `emblema.webp` 46 × 47 px, a 33 px para fora do começo da barra e 6 px acima; retrato/inicial no círculo de dentro (left 3,5%, top 7%, 93% × 90%).
  - Corpo: pergaminho com borda de 1 px só nas laterais e sombra; sem fundo de pergaminho em volta das pontas da barra.
  - Rodapé: rubi separado da linha (`rodape-gema` centralizado, `rodape-linha` à esquerda e à direita, cortados de `chat-rodape.webp`), 18 px de altura, com o centro da linha exatamente na borda de baixo do cartão.
- **Molduras rentes:** a `moldura-painel.webp` tem margem transparente fora da linha dourada (≈3 px dos lados e ≈5 px em cima e embaixo, em 14 px). O fundo vai num `::before` recuado 4 px 3 px e a moldura num `::after` por cima, para não sobrar fundo fora da linha. Vale para jogadores (largura pelo conteúdo), botões de cena, barra lateral, caixa de mensagem e barra de controles.
- **0.3.0 codada (2026-11-18)**, falta testar no mundo. A inspeção ao vivo não foi feita (o navegador embutido pede aprovação a cada ação no mundo de teste); só o esqueleto foi confirmado: `#ui-left-column-1` com `#scene-controls` e `#players`, `#ui-left-column-2` com `#scene-navigation`, `#ui-bottom` com `#hotbar`. O resto usa os seletores conhecidos do v13 e é conferido no roteiro abaixo.

**Decisões do código da 0.3.0:**
- Setting `visual` (world): `hud` (padrão, para nada mudar ao atualizar) ou `tema`. `aplicarVisual()` só liga a classe `hud-t20-tema` no `body` (no `setup` e no `onChange`).
- Hook `renderChatMessageHTML`: acrescenta `.hud-t20-emblema` (rosto = `message.speakerActor.img`, senão avatar do autor, senão a inicial na cor do autor) e `small.hud-t20-jogador` (nome do autor, se diferente do nome mostrado). Entram sempre; o CSS esconde sem o tema. Com o tema ligado, `.whisper-to` e `.flavor-text` vão do cabeçalho para o começo de `.message-content`.
- Mensagens com flags de `decreto-do-panteao` ou `bando-da-raposa` ganham `.hud-t20-externo`: o tema não estiliza as rolagens de dentro delas.
- Seletores usados: `.ui-control` (todos os botões), `#scene-navigation li.scene` (`.view`/`.active`), `.scene-players .scene-player`, `#players .player` (`.active`) e `.player-active`, `#sidebar-content`, `.chat-log`, `.chat-message` (`.whisper`, `.blind`), `.message-header`, `.message-sender`, `.message-metadata`, `.message-content`, `.dice-flavor`, `.dice-formula`, `.dice-total` (`.critical`/`.fumble`), `.tormenta20.chat-card .card-header`, `#chat-controls`, `#chat-message`, `#chat-notifications`.
- O emblema e o rodapé usam as medidas do canvas. A caixa de mensagem usa a moldura direto no `<textarea>` (`border-image` + `background-clip: padding-box`), porque `textarea` não aceita `::before`/`::after`.

## Roteiro de teste da 0.3.0 (mestre + jogador em aba anônima)
1. Atualizar o módulo. Sem mexer em nada: tudo igual à 0.2.5 (o padrão é "Só a HUD").
2. Mestre: Configurações → hud-t20 → "Visual do módulo" = "HUD e tema da interface". O tema aparece na hora para o mestre e para o jogador, sem recarregar. Voltar para "Só a HUD" tira o tema.
3. Chat: mensagem simples, teste de perícia, ataque com dano, sussurro (etiqueta "Sussurro para…" no corpo azulado) e uma mensagem do Decreto do Panteão e do Bando da Raposa (o conteúdo deles igual a antes, só cabeçalho e emblema novos). Conferir o emblema (retrato do personagem; mestre sem personagem: inicial na cor), o nome do jogador embaixo e o rubi do rodapé.
4. Recolher a barra lateral: as mensagens flutuantes e a caixa de mensagem com o mesmo visual.
5. Controles de cena, abas da barra lateral, navegação de cenas (cena vista com o traço rubi, bolinhas dos jogadores) e lista de jogadores com a moldura.
6. Se algo não pegar o estilo, F12 → clicar com o botão direito no elemento → Inspecionar, e mandar print do HTML dele.

## Temas alternativos da HUD (ideia, 2026-11-18)
Ideia de dar à HUD outros visuais com cara de Tormenta 20, escolhidos no "Visual do módulo". Só conceitos por enquanto, nada de código.

- **Uso do tema da interface:** o Daniel acha que a mesa vai acabar usando só a HUD do personagem. O tema da interface (0.3.0) fica como opção desligada por padrão; não investir mais nele até a mesa testar. Se só uma parte agradar, a aposta é o cartão do chat.
- **Conceitos:** os mesmos prompts no Gemini e no ChatGPT; **o ChatGPT ganhou** com folga. Quatro direções pedidas: Tempestade Rubra, Livro Básico, Panteão (não gerada ainda) e Aventureiro do Reinado. Imagens em `referencias/conceito-gpt-*.png`.
- **Escolhidas (2026-11-18): Tempestade Rubra e Aventureiro do Reinado**, as duas como opções. O Daniel quer reproduzir os conceitos o mais fiel possível.
  - Tempestade Rubra: moldura de carapaça vermelha com espinhos, raios e névoa carmim, tempestade no cristal central. Cuidados de UX: vermelho sobre vermelho apaga a barra de PV; o círculo central é grande demais e compete com os números; os espinhos aumentam a área ocupada.
  - Aventureiro: couro, fivelas de latão e bússola como cristal. Cuidado: é o mais genérico e o mais pesado.
  - Dos dois (e do Livro Básico): caixinhas claras com número escuro (as mais legíveis) e ícones de coração e gota nas barras.
- **O que dá e o que não dá para ficar igual:** moldura, pontas, cristal, losangos, moldura do retrato e ícones são recortados do próprio conceito. As barras precisam do cheio e do vazio separados, e os números são texto. A tempestade do centro pode ter um giro ou pulso lento em CSS. Os atalhos mostram os ícones dos itens da ficha, não os do conceito.
- [x] **0.4.0 codada (2026-11-18)**, falta testar no mundo (roteiro abaixo da tabela de medidas).
- [x] Arte pedida ao ChatGPT e protótipo montado (2026-11-18): canvas "hud-t20 — temas Tempestade e Aventureiro" (https://claude.ai/artifact/1BhEQnLYj98yzFqEeEcmx1), pranchas `Tempestade.dc.html` e `Main.dc.html` (Aventureiro). O Daniel deu o ok para testar no mundo ("bora testar").

### Temas da HUD — arte e medidas (para codar a 0.4.0)
Arte em `arte-original/temas/` (todas 1672 × 941, menos as folhas de peças):
- `tempestade-moldura.png`: céu rubro em cima e a HUD de carapaça embaixo, já com os 3 losangos desenhados (espada, fogo, cruz) no olho da tempestade.
- `tempestade-pecas-verde.png`: folha em verde com barras de PV e PM de cristal, coração, gota, escudo, bota alada, ampulheta, estrela e 3 losangos (espada, explosão, bandeira). **Esta folha tem visual de gema polida e acabou servindo melhor como peças soltas; no protótipo foi usada no primeiro Aventureiro, depois trocado.**
- `aventureiro-moldura.png`: mapa de Arton em cima e a HUD de couro, fivelas e bússola embaixo, com os 3 losangos desenhados (espada, explosão, bandeira).
- `aventureiro-pecas-verde.png` (1448 × 1086): barras de PV e PM, coração, gota, escudo, bota, ampulheta, estrela e 3 losangos soltos, no mesmo estilo da moldura do Aventureiro.
- `recorte-*.py`: os scripts de recorte do verde (chave por `g - max(r,b)`, transparente acima de 90, sólido abaixo de 40, com despill). Trocar o caminho de entrada para o arquivo desta pasta.

Como as molduras são uma imagem inteira (não 9 partes), o tema usa a parte de baixo como fundo do painel em proporção fixa, e cada peça vai por cima em posição medida. Medidas na imagem de 1672 × 941 (x, y em px):

| Peça | Tempestade | Aventureiro |
|---|---|---|
| Faixa da HUD | y ≈ 480–910 | y ≈ 500–910 |
| Retrato (abertura) | 74–270 × 596–822 | 108–290 × 598–795 |
| Barra PV (dentro do trilho) | 314–668 × 613–647 | 334–658 × 604–640 |
| Barra PM | 314–668 × 680–714 | 334–658 × 666–702 |
| 4 caixinhas | y 742–804; x 300, 397, 495, 594 (≈ 85 de largura) | y 732–800; x 324, 420, 515, 610 (76 de largura, fundo claro) |
| Losangos | centros ≈ (762, 700), (896, 700), (1030, 700) | centros ≈ (740, 654), (845, 658), (950, 654) |
| Atalhos 2 × 5 | 1147–1603 × 609–795 | 1030–1542 × 598–802 |

- **Atenção ao que já foi aprovado:** na HUD, os 3 losangos são as **ações do turno** (padrão, movimento, reação), e as 4 caixinhas são Defesa, Deslocamento, Iniciativa e CD. No protótipo dos temas os losangos aparecem como Ataque/Magia/Cura ou Habilidade e a 3ª caixinha como condição, só como exemplo; no código vale o que já está aprovado. Os losangos desenhados na moldura não podem ficar "gastos" (cinza e riscados), então no código **cobrir os da moldura com os losangos soltos da folha** e aplicar o estado gasto neles. O olho da tempestade e a bússola fazem o papel do cristal ("Seu turno").
- Barras: a cor sai do miolo das barras da folha (sem a moldura dourada dela, porque o trilho já está na moldura). No Aventureiro, os ícones de coração e gota vão no começo de cada barra.
- Condições: continuam nos medalhões acima do painel.

**Decisões do código da 0.4.0 (2026-11-18):**
- Setting `visual` ganhou `tempestade` e `aventureiro` (as chaves `hud` e `tema` não mudaram). O tema da interface (`hud-t20-tema` no `body`) continua só com `tema`; os temas novos são "só a HUD". `visualDaHud()` devolve `classico`, `tempestade` ou `aventureiro`; `arte(nome)` dá o caminho da peça (clássico em `assets/`, temas em `assets/temas/<tema>/`). Trocar o visual chama `aplicarVisual()` e redesenha a HUD.
- O painel ganha `data-visual` e, nos temas, a classe `hud-t20-arte`; o CSS dos temas fica em `styles/hud-temas.css`.
- Faixa recortada da arte: Tempestade y 470–930, Aventureiro y 490–930 (1672 de largura), exibida a 50% (836 × 230 e 836 × 220). Posições no CSS = (px da arte − começo da faixa) ÷ 2.
- Transparência da faixa: Aventureiro por GrabCut (`mascara-grabcut.py`); Tempestade por GrabCut + cor (o céu tem G ≈ 11–16 e R < 120; moldura e névoa passam disso) + polígono à mão nas garras da esquerda (`mascara-tempestade.py`). Peças da folha: `pecas-0.4.0.py`.
- Losangos: padrão = espada, movimento = bandeira, reação = explosão (folha de cada tema). Fora de combate ficam como decoração apagada (`.hud-acoes.fora`), cobrindo os da arte.
- Barras: o miolo da barra da folha (sem a moldura dourada) com `clip-path` pelo valor (não estica a textura); extra (PV/PM temporários) da direita, escurecido.
- Cristal: nos temas a gema some; fica `.hud-gema .brilho` (círculo com `mix-blend-mode: screen`) sobre o olho/bússola, pulsando só no turno.
- Conferido fora do Foundry com o template e o CSS reais (Playwright), em 1x e 2x, nos três visuais, em combate e fora.
- Limite conhecido: a janela "Retrato da HUD" mostra a moldura clássica na prévia; nos temas a abertura tem outra proporção (Tempestade mais alta), então o enquadramento pode cortar um pouco diferente.

## Roteiro de teste da 0.4.0 (mestre + jogador em aba anônima)
1. Atualizar o módulo. Sem mexer em nada: tudo igual à 0.3.0.
2. Mestre: "Visual do módulo" = "Tempestade Rubra (só a HUD)": a HUD troca na hora para os dois (sem recarregar) e o tema da interface sai. Conferir retrato, barras, caixinhas e atalhos dentro das caixas desenhadas.
3. Passar o mouse nas 4 caixinhas e no retrato: tooltips como antes. Clicar na Iniciativa: rola como antes. Clicar no retrato: abre a ficha.
4. Fora de combate: losangos apagados e sem clique. Iniciar combate: losangos acesos; usar uma magia de ação padrão gasta a espada; clicar num losango gasta ou devolve. No turno do personagem, o olho pulsa com "Seu turno".
5. Arrastar item para um atalho, usar pela tecla e trocar de página (▲ 1 ▼ à direita dos atalhos).
6. Clicar no céu/névoa em volta da HUD: o clique chega ao mapa (seleciona token, mede etc.).
7. Repetir 2–6 com "Aventureiro do Reinado". Voltar para "Metal e rubi": a HUD clássica volta igual.
8. Notebook (1366×768): a HUD encolhe para caber, como a clássica.

## Temas de cristal por personagem (0.5.0, aprovado em protótipo 2026-11-19)
Nova família de temas da HUD, um por personagem da mesa, todos no mesmo molde (a HUD do dragão alado gerada no ChatGPT). Protótipo aprovado: https://claude.ai/artifact/SAG8ia5DnHCgSD6Y8SP9ab (cópia em `arte-original/temas-cristal/prototipo.html`).

**Decisão do Daniel:** retrato **em cristal** (modo "vidro"): a foto do personagem com a camada de cristal por cima (`opacity .38`, `mix-blend-mode: screen`), as linhas das facetas (`opacity .75`, `screen`) e um brilho que passa a cada ~6 s. Com 0 PV o retrato fica cinza e o brilho para.

| Chave | Nome | Personagem | Símbolo |
|---|---|---|---|
| `cristal-dragao` | Dragão Alado | herói (base) | dragão, pedra turquesa |
| `cristal-forja` | Forja Mecânica | anão de armadura | engrenagem com núcleo branco, gemas verdes |
| `cristal-fenix` | Chama da Fênix | elfo da fênix | fênix, brasa e lava |
| `cristal-ossario` | Ossário | demônio esquelético | crânio com chifres, asas negras |
| `cristal-corsario` | Corsário da Raposa | pirata | raposa, madeira e cordas |
| `cristal-ursal` | Ursal | clérigo Ursal | urso, mármore e estrelas |
| `cristal-tempestade` | Tempestade Rubra (cristal) | — | horror rubro; não confundir com o tema `tempestade` da 0.4.0 |

**Arte:**
- Folhas originais em verde: `arte-original/temas-cristal/<tema>-folha-verde.png` (2172 × 724). Scripts: `recorte-cut.py` (chave verde; Forja e Ursal usam chave que preserva as esmeraldas; o brilho dourado atrás dos losangos é "desmisturado" do verde pelo canal vermelho), `recorte-slots.py` e `recorte-classify.py` (acham as aberturas escuras da moldura).
- Recortes prontos em `assets/temas/cristal-<tema>/`: `moldura.webp` (moldura inteira já com os losangos vazios), `barra-pv.webp`, `barra-pm.webp`, `acao-padrao.webp` (espada), `acao-movimento.webp` (estrela), `acao-reacao.webp` (redemoinho), `cristal.webp`, `facetas.webp`, `mascara-retrato.png` (alfa da abertura do retrato, para `mask-image`).
- Medidas em `assets/temas/cristal-medidas.json`, **em % da moldura** (x, y, largura, altura): retrato (caixa da máscara), barras PV/PM (miolo escuro do trilho), 4 caixinhas, aberturas dos 3 losangos (o losango solto vai centrado na abertura, com o tamanho de `losango_tamanho` em % da moldura) e os 10 atalhos (linha de cima 1–5, de baixo 6–0).
- Como as medidas são em %, a moldura pode ser exibida em qualquer largura (a original tem ~1640 px; a HUD deve ficar perto de 820–1100 px).

**Cuidados vistos no protótipo:**
- Corsário: o cristal e as facetas vieram com moldura própria; no protótipo foram ampliados 128% dentro da máscara para esconder a borda.
- Ursal: as barras vieram com pontas decoradas, que somem com a barra baixa (o `clip-path` corta da direita). As franjas têm um leve tom verde nas pontas.
- Tempestade (cristal): PM roxo. **Decidido (2026-11-19): PM azul fixo em todos**; a barra foi recolorida (`ajustes-0.5.0.py`, original em `barra-pm-roxo.webp`).
- Forja: um pedacinho solto da arte aparecia na ponta direita da moldura; **limpo** (`ajustes-0.5.0.py`).
- Proporção ~3,2 : 1: a HUD fica alta. Testar em 1366×768.
- O escudo central é só decoração (o "Seu turno" pode usar um brilho sobre ele, como o olho da Tempestade da 0.4.0).

**Para codar (0.5.0):** seguir o padrão da 0.4.0 (`visual` ganha as 7 chaves, `arte(nome)` aponta para `assets/temas/<chave>/`, CSS em `styles/hud-temas.css` ou num `hud-cristal.css`). A diferença: aqui a moldura é a peça inteira (sem faixa a recortar) e as posições vêm do JSON em %. Talvez valha **escolher o tema por personagem** (flag no ator) além do setting do mundo, já que cada tema foi feito para um personagem.

**Decisões do código da 0.5.0 (2026-11-19):**
- Nome: "Forja Rubra" virou **Forja Mecânica** (a chave continua `cristal-forja`).
- **PM azul fixo** em todos os temas. **Tema por personagem:** flag `flags.hud-t20.visual` no ator (qualquer visual da HUD: `hud` = metal e rubi, `tempestade`, `aventureiro` ou `cristal-*`); sem a flag, vale o "Visual do módulo" do mundo, que também ganhou as 7 opções. O tema da interface (`tema`) continua só da mesa.
- Onde escolher: a janela do retrato (botão direito no retrato ou engrenagem) virou "HUD de <nome>: retrato e visual", com o campo "Visual da HUD deste personagem" ("Seguir a mesa" + os visuais). O dono e o mestre podem mudar; a prévia do retrato na janela mostra a máscara e o vidro do tema escolhido.
- `visualDaHud(actor)` lê a flag; `arte()` usa o visual do personagem mostrado (`visualEmUso`). Nos temas de cristal os ícones das caixinhas não existem: as caixinhas mostram número e sigla (DEF, DESL, INI, CD), com o tooltip de sempre.
- Medidas: `cristal-medidas.json` é lido no `setup`; `varsCristal()` põe as posições em variáveis `--cr-<peça>-x/y/w/h` no `#hud-t20`, e `styles/hud-cristal.css` posiciona tudo com elas (classes `hud-t20-arte` + `hud-t20-cristal`). Losangos centrados na abertura com `losango_tamanho`. Atalhos: cada `.slot` da barra nativa na caixa medida; o seletor de página fica logo à direita da moldura.
- Painel com 1000 px de largura na proporção da arte (~3,2 : 1); o "Tamanho da HUD" e o encaixe automático continuam valendo.
- Retrato em vidro como no protótipo (cristal .38 e facetas .75 em `screen`, reflexo a cada 6 s; Corsário ampliado 128%); 0 PV = foto cinza e sem reflexo. **Sem "Seu turno"** nos temas de cristal (tirado a pedido em 2026-11-20: ficava estranho); o escudo do centro é só decoração.
- Condições: medalhões acima da cabeça do símbolo, à esquerda das barras.
- Conferido fora do Foundry com o template e o CSS reais (Playwright), nos 7 temas, em combate (seu turno), fora de combate e com 0 PV. Prévia: https://claude.ai/artifact/NjWYwkj8BEYLre4MGHXhrB

## Roteiro de teste da 0.5.0 (mestre + jogador em aba anônima)
1. Atualizar o módulo. Sem mexer em nada: tudo igual à 0.4.0.
2. Mestre: "Visual do módulo" = "Cristal: Dragão Alado": a HUD de todos troca na hora. Conferir retrato em vidro (reflexo passando), barras, caixinhas, losangos e atalhos dentro das caixas da arte.
3. Jogador: botão direito no retrato → "Visual da HUD deste personagem" = outro tema (ex.: Forja Mecânica) → Salvar. A HUD dele troca; o mestre, selecionando o token, vê o mesmo tema. Voltar para "Seguir a mesa": volta ao tema do mundo.
4. Tooltips das caixinhas e do retrato, clique na Iniciativa (rola) e no retrato (abre a ficha), como antes.
5. Combate: losangos acesos; usar magia de ação padrão gasta a espada; no turno do personagem nada brilha no escudo (sem "Seu turno"). Fora de combate, losangos apagados e sem clique.
6. PV a 0: retrato cinza, sem reflexo. PV e PM temporários: barra escura entrando da direita.
7. Atalhos: arrastar item, usar pela tecla, trocar de página (▲ 1 ▼ à direita da moldura). Clicar fora das peças (céu em volta dos losangos, por exemplo) chega ao mapa.
8. Passar pelos 7 temas. Notebook (1366×768): a HUD encolhe para caber; ver se a altura incomoda (se sim, baixar o "Tamanho da HUD").

## Próximo passo (conversa nova)
- [x] Codar a 0.5.0 com os 7 temas de cristal (2026-11-19).
- [ ] Testar no mundo (roteiro acima).

## Funções aprovadas
- **Clique no retrato:** abre a ficha completa do sistema (`actor.sheet.render(true)`).
- **Atalhos:**
  - Usar a barra nativa do Foundry (10 slots, teclas 1–0, páginas) com outro visual e reorganizada em 2×5. Não refazer a lógica da barra.
  - Preencher: arrastar da ficha para o slot.
  - Editar ou remover: botão direito (nativo). **Sem botão Personalizar.**
- **Tooltip ao passar o mouse nas caixas:** mostra a conta.
  - Exemplo: CD 18 = 10 base + 2 metade do nível + 4 Inteligência + 2 Foco em Magia.
  - O mesmo vale para Defesa, Deslocamento e Iniciativa, e o tooltip também abre pelo teclado.
- **Condições:** vêm dos efeitos ativos do token.
- **Ações do turno:**
  - Gasto automático ao usar um atalho ou item da HUD, conforme o tipo de execução do item.
  - Clique no losango gasta ou devolve manualmente.
  - Mover o token no mapa não gasta movimento sozinho.
  - O estado fica nas flags do combatente: o mestre vê e corrige; dono e mestre podem alterar.

## Inspeção do mundo de teste (2026-11-17)
Ambiente: Foundry 13.351, sistema `tormenta20` 1.5.015, ator de teste "Maicon" (character, nível 0, sem magias). Módulos ativos: bando-da-raposa 2.0.3, decreto-do-panteao 1.1.0, dice-calculator, dice-so-nice, vision-t20.

**Caminhos dos dados (`actor.system`):**
| Dado | Caminho | Parcelas guardadas? |
|---|---|---|
| PV | `attributes.pv.value` / `.max` / `.temp` | — |
| PM | `attributes.pm.value` / `.max` / `.temp` | — |
| Nível | `attributes.nivel.value` (também `actor.nivel`) | — |
| Defesa | `attributes.defesa.value` | Sim: `base` (10), `atributo` (chave, ex. `des`), `outros`, `condi`, `pda`, `bonus[]`. Armadura e escudo vêm dos itens equipados (`system.armadura.value`); armadura pesada não soma o atributo. |
| Deslocamento | `attributes.movement.walk.value` (unidade em `movement.unit`, "m") | Sim: `walk.base` + `walk.bonus[]`. Também `fly`, `swim`, `climb`, `burrow`. |
| Iniciativa | `pericias.inic.value` | Sim: `atributo`, `treinado`, `condi`, `outros`, `bonus[]`; treino em `attributes.treino` (2/4/6). |
| CD das magias | **Calcular:** `attributes.cd` + `atributos[attributes.conjuracao].value` | Parcial. `attributes.cd` = 10 + metade do nível. Cada magia guarda a CD final em `item.system.resistencia.cd` = 10 + metade do nível + atributo + `resistencia.bonus` (bônus por magia). Confirmado: Maicon nível 4, Int 5 → `attributes.cd` 12, Teia CD 17. Magia sem resistência tem CD 0. Tooltip: "10 base + 2 metade do nível + 5 Int" e, se alguma magia tiver `resistencia.bonus`, uma linha "+N em algumas magias". |
| Atributos | `atributos.<for/des/con/int/sab/car>.value` | `base`, `racial`, `bonus` |

**Barra nativa no v13 (medido no mundo em 2026-11-17, 0.1.1):** `aside#hotbar.faded-ui.flexrow` com `#hotbar-controls-left` (botões `mute` e `menu`), `menu#action-bar` (`li.slot.full|open` com `img.slot-icon` e `span.key`) e `#hotbar-controls-right` (página, travar, limpar). O core aplica `transform: translateX(-70px)` na `#hotbar`; a HUD anula isso.

**Atalhos:** o sistema já tem um hook `hotbarDrop` que cria macro para `Item` e `ActiveEffect` (`createT20Macro`). O módulo **não precisa tratar o drop**, só restilizar a `#hotbar` nativa (`aside#hotbar > menu#action-bar > li.slot[data-slot]`, com `.full`/`.open` e `span.key`).

**Condições:**
- Lista em `CONFIG.statusEffects` (38), com `id`, `name`, `img` em `systems/tormenta20/icons/conditions/<id>.svg`, `changes` e `flags.tormenta20` (`condition: true`, `category`, `stack`, `durationScene`). Origem: `CONFIG.T20.conditions`.
- No ator, a condição é um ActiveEffect com `statuses` (ex. `["sangrando"]`) e `flags.tormenta20.condition`.
- Efeitos de melhorias (Bando/Hayd, ex. "Macabro") também ficam em `actor.effects`, mas com `isSuppressed: true`. **A HUD mostra só efeitos ativos com `statuses` ou `flags.tormenta20.condition`**, para não encher a barra de encantos.
- As condições não têm texto de descrição no sistema; o tooltip vai mostrar o nome e as mudanças (`changes`), a menos que a gente escreva os textos no `lang/`.

**Rolagens no chat:** classe `RollT20`; `roll.options.type` = `attack` / `damage` (e `title`). As flags ficam em `flags.tormenta20` (`itemData` com `criticoM`/`criticoX`, `effects`, `onUseEffects`). Não há flag pronta de crítico: compara o d20 com `itemData.criticoM`. O cartão usa `div.tormenta20.chat-card.item-card`.

**Condição aplicada (testado com Abalado):** vira um ActiveEffect com `isTemporary: true`, `statuses: ["abalado"]`, `duration.rounds: 999`, `description` vazia e as flags acima. Aparece em `actor.temporaryEffects` (é a fonte dos medalhões) e em `actor.statuses`. Já mexe nos números: Iniciativa foi de 7 para 5 (`inic.condi` = -2). **Dispara `createActiveEffect`/`deleteActiveEffect`, não `updateActor`**: a HUD tem de escutar os dois.

**Combate (testado):** ao iniciar disparam `combatStart`, `combatTurnChange` e `updateCombat`; ao apagar, `deleteCombat`. **Atenção:** `game.combat` é o combate *exibido* no painel, não necessariamente o do personagem (no teste havia outro combate vazio aberto e `game.combat` apontou para ele). O cristal deve procurar em `game.combats` um combate iniciado cujo `combatant.actor` seja o ator da HUD.

**Escala:** `core.uiConfig.uiScale` (1 no mundo de teste) e `fontScale`.

**Tipo de execução do item (2026-11-17, lido no código-fonte do sistema 1.5.015):**
- Fica em `item.system.ativacao.execucao`. Valores (`CONFIG.T20.abilityActivationTypes`): `passive`, `action` (padrão), `move`, `full` (completa), `reaction`, `free`, `minute`, `hour`, `day`, `special`. Pode vir vazio (`""`).
- Nos compêndios do sistema: magias quase sempre `action` (às vezes `full`, `reaction`, `move`); poderes variam e muitos vêm vazios; **armas vêm sempre vazias** e equipamentos também.
- Custo em PM: `item.system.ativacao.custo`.
- O sistema não dispara hook próprio ao usar item. `item.roll()` (também chamado pelas macros da barra, via `game.tormenta20.rollItemMacro`) termina em `displayCard`, que cria a mensagem com `flags.tormenta20.itemData` = `item.system` inteiro (inclui `ativacao.execucao`) e `speaker` do ator. Se o jogador cancelar a janela de uso, não sai mensagem.
- **Regra de gasto automático:** hook `createChatMessage`, só no cliente que criou a mensagem (`message.author.id === game.user.id`), com `flags.tormenta20.itemData` presente e o ator do `speaker` num combate iniciado:
  - `action` → padrão; `move` → movimento; `full` → padrão e movimento; `reaction` → reação.
  - Vazio com rolagem de ataque (`itemData.rolls` com `type: "ataque"`, caso das armas) → padrão.
  - `free`, `passive`, vazio sem ataque, `minute`/`hour`/`day`/`special` → não gasta.
  - Se a ação já estava gasta, só avisa (não bloqueia o uso).
- Como vale qualquer uso de item (ficha, atalho ou HUD), o gasto é o mesmo de onde quer que o item seja usado.

## Pendências (resolver nesta ordem)
00. [x] **Codar a 0.2.0** (2026-11-18). Ver "Iniciativa no sistema" abaixo.
01. [x] **Testar a 0.2.0/0.2.1 no mundo de teste** (2026-11-18): roteiro da 0.2.0 inteiro aprovado com mestre e jogador, inclusive o seletor de página da barra, a Iniciativa clicável e o clique no retrato.
0. [x] **Testar a HUD em tela de notebook** (1366×768): aprovado em 2026-11-18.
0a. [x] **Legenda do cristal (pedido em 2026-11-18, feito na 0.2.4):** tirar o "Aguardando". A legenda só aparece como "Seu turno", em combate e no turno do personagem; fora do turno e fora de combate, sem texto nenhum (o cristal continua como separador, apagado).
1. [x] **Nome e id:** `hud-t20`.
2. [x] **Inspeção no mundo de teste** (2026-11-17): CD, condição e combate confirmados. Armadura pesada na Defesa conferida no teste da 0.2.0 (2026-11-18).
3. [x] **De quem é a HUD** (confirmado em 2026-11-18 com um usuário só jogador, que vê só a própria HUD): o jogador vê sempre o próprio personagem; o mestre vê o token selecionado e, sem seleção, a HUD some.
4. [x] **Ações do turno:** arte no protótipo e tipo de execução localizado (ver "Tipo de execução do item" acima).
5. [x] **Novo pergaminho** (2026-11-17): bege mais neutro, com fibras e manchas suaves, sem emenda ao repetir. Já em `assets/pergaminho.webp` (512 px); original em `arte-original/pergaminho-v2.png`.
6. [x] **Combate:** procurar em `game.combats` um combate iniciado com o ator da HUD (ver "Combate" acima) e escutar `combatStart`, `combatTurnChange`, `updateCombat` e `deleteCombat`.

**Iniciativa no sistema (lido no código-fonte do 1.5.015, 2026-11-18):**
- O sistema **não** sobrescreve `Combat.rollInitiative`. Só troca a fórmula: `CONFIG.Combat.initiative.formula = "1d20 + @pericias.inic.value"` e `Combat.prototype._getInitiativeFormula` (mesma conta).
- Teste da ficha: `actor.rollPericia("inic", { event, message: true })`. Abre a janela de uso do sistema (ou pula, com Shift, conforme a configuração `UsageConfig`), aplica efeitos de uso, cria o cartão no chat e **devolve a `ChatMessage`** (total em `message.rolls[0].total`). Se a janela for cancelada, devolve `undefined`.
- O próprio `rollPericia` tenta gravar a iniciativa, mas só em `game.combats.active` e só se ela estiver vazia. Por isso a HUD grava o total ela mesma, com `combat.setInitiative`, no combate certo.
- Fonte usada: espelho `MatthewsGoncalves/T20Foundry` no GitHub (system.json 1.5.015); o GitLab oficial não abre deste ambiente.

**Iniciativa na HUD (0.2.0):**
- Combate do personagem para a Iniciativa: combate iniciado em que ele está; senão, qualquer combate em que ele está (os jogadores costumam rolar antes do "Começar"); senão, o combate exibido no painel, se for da cena atual. Sem nenhum: fora de combate.
- Sem combatente: cria o combatente com o token do personagem na cena do combate; sem token na cena, avisa e não rola.

**Retrato da HUD (0.2.0):** `flags.hud-t20.retrato = { img, x, y, zoom }`; `img` vazio usa `actor.img` (acompanha a ficha). A janela é `EditorRetrato` (ApplicationV2), uma por ator (id `hud-t20-retrato-<uuid>`). Jogador sem permissão de navegar nos arquivos pode digitar o caminho.

## Plano técnico (v13)
- **Estrutura:** `module.json` (`compatibility` minimum 13, verified 13.351), `scripts/main.mjs`, `templates/hud.hbs`, `styles/hud.css`, `lang/pt-BR.json` e `assets/`.
- **Painel:**
  - `ApplicationV2` com `HandlebarsApplicationMixin`, sem moldura de janela.
  - Fica preso embaixo da tela, junto à barra nativa (`#hotbar`), que é reposicionada e restilizada por CSS em 2×5.
- **Atualização:**
  - Hooks `controlToken`, `updateActor`, `createActiveEffect`, `updateActiveEffect`, `deleteActiveEffect`, `createItem`/`updateItem`/`deleteItem` (armadura muda a Defesa), `updateCombat`, `combatStart`, `deleteCombat` e `canvasReady`.
  - Guardar os ids e chamar `Hooks.off` ao fechar.
  - A HUD só lê dados, então não precisa de socket.
- **Settings:**
  - Mostrar ou ocultar a HUD (`client`).
  - Escala extra da HUD (`client`).
- **Textos:** todo texto visível passa por `game.i18n.localize`.

## Arquivos deste pacote
- `assets/`: arte final em webp, recortada e reduzida (240 KB). É esta que vai para o módulo.
- `arte-original/`: PNGs originais do ChatGPT, para reexportar se precisar.
- `referencias/`: conceitos do ChatGPT (layout geral) e do Gemini (chat).

## Pronto
- [x] Conceito e direção visual.
- [x] Arte das 12 peças (pergaminho a refazer).
- [x] Protótipo interativo aprovado.
- [x] Inspeção do sistema concluída (dados, condições, combate, tipo de execução).
- [x] **0.1.0 (2026-11-17):** módulo com `module.json`, painel, tooltips, condições, cristal, ações do turno e atalhos. Primeiro teste no mundo: funcionou, mas ficou grande, o retrato cortava as laterais e a HUD era espremida (e coberta pela caixa de mensagem) com a barra lateral larga.
- [x] **0.1.1 (2026-11-17):** HUD menor, retrato inteiro e mais baixo, encaixe automático no espaço livre, botões da barra agrupados. Testado no mundo: o encaixe funcionou; os atalhos ficaram por cima do cristal.
- [x] **0.1.2 (2026-11-17):** atalhos no lugar (anulado o `translateX(-70px)` do core na `#hotbar`). Confirmado no mundo em 2026-11-18.
- [x] **0.2.0 (2026-11-18):** retrato maior que vaza e janela de enquadramento, tooltips translúcidos, Iniciativa clicável, barra só com o seletor de página. Testado no mundo em 2026-11-18: tudo certo.
- [x] **0.2.1 (2026-11-18):** clique no retrato voltou a abrir a ficha (botão do retrato tinha a altura fixa de botão do core). Testado no mundo em 2026-11-18. Lição: em botão posicionado com `inset`, sempre dar `width`/`height` explícitos, porque o core estiliza `<button>`.
- [x] **0.2.2 (2026-11-18):** ajustes do teste em tela de notebook, aprovados por prévia. O retrato cobre a ponta esquerda do painel (margem esquerda −34 px), e a imagem preenche a moldura até a barra de baixo (abertura 7% 6% 7,5% 6%; o 11% antigo era a altura da gema no centro). Conferido no mundo em 2026-11-18.
- [x] **0.2.3 (2026-11-18):** barras de PV/PM com a moldura numa camada por cima da cor (`.hud-trilho::after`; camadas fundo → cor → extra → moldura → número) e barra de extra (`attributes.pv.temp`/`pm.temp`) da direita para a esquerda, mais escura, proporcional ao máximo; mais espaço antes do "(+N)". Aprovado por prévia; conferido com o CSS real fora do Foundry. Conferido no mundo em 2026-11-18. Lição: a borda (`border-image`) de um elemento sempre fica atrás dos filhos; moldura que precisa cobrir o conteúdo vai num pseudo-elemento com `z-index`.
- [x] **0.2.4 (2026-11-18):** cristal sem o "Aguardando": a legenda só aparece ("Seu turno") em combate, no turno do personagem; fora disso o cristal fica apagado e sem texto (o espaço da legenda continua reservado, para nada pular). Conferido no mundo em 2026-11-18.
- [ ] **0.3.0 (2026-11-18):** tema da interface e configuração "Visual do módulo". Codada; falta o teste no mundo.
- [ ] **0.4.0 (2026-11-18):** temas Tempestade Rubra e Aventureiro do Reinado no "Visual do módulo". Codada e conferida fora do Foundry; falta o teste no mundo.
- [x] **0.2.5 (2026-11-18):** a HUD do jogador nunca some por falta de seleção. Jogador sem personagem atribuído fica no último personagem mostrado ou no primeiro dele (antes sumia ao trocar de ferramenta, porque a troca solta o token). Conferido no mundo em 2026-11-18.

## Decisões do código (0.1.0, 2026-11-17)
- O painel é um `ApplicationV2` sem moldura inserido em `#ui-bottom`, então herda a escala de interface do Foundry; a escala extra usa `zoom`.
- A barra nativa (`ui.hotbar.element`) é movida para dentro do painel numa caixa fora da parte do Handlebars, para não ser apagada a cada redesenho. Quando a HUD some (mestre sem token selecionado ou HUD desligada), a barra volta para o lugar original.
- Os hooks ficam ligados durante toda a sessão, porque o painel só esconde e reaparece (não é uma janela que se fecha de vez).
- Flags do combatente: `flags.hud-t20.gastas = { padrao, movimento, reacao }` (`true` = gasta).
- A recarga é gravada pelo mestre ativo; sem mestre conectado, pelo primeiro dono conectado do personagem. Voltar o turno não recarrega.
- Tooltips: as parcelas conhecidas são listadas e, se a soma não bater com o valor do sistema (modificadores globais, efeitos), entra a linha "Outros modificadores" com a diferença. O total é sempre o do sistema.
- CD das magias só aparece se o personagem tiver magias e atributo de conjuração; senão mostra "—".
- Fontes Cinzel e Alegreya Sans vêm do Google Fonts por `@import` (o navegador precisa de internet). Ideia futura: embutir os arquivos das fontes.
- Só há `lang/pt-BR.json`; ele também é registrado como `en` para não aparecerem chaves cruas num Foundry em inglês.

## Ideias futuras
- **Terceiro tema, "Mesa do grupo" (escolhido em 2026-11-18, ainda sem arte final):** no clima de capa de Heróis de Arton (alta fantasia heroica, luz dourada no centro contra sombras verde-azuladas). Conceito do ChatGPT escolhido: o 2º de 3 (retrato em quadro dourado, barras sobre couro e pele, escudo com sol no centro, rolo, mochila e machado antes dos 10 slots, losangos verde-azulados). Pedidos para a versão final: retrato, barras, caixinhas e slots vazios por dentro; sem os losangos desenhados (entram soltos); trecho entre o escudo e os slots mais compacto; fundo verde chapado; e folha de peças (miolo das barras, escudo, bota, ampulheta, estrela, coração, gota e 3 losangos). O sol do escudo faz o papel do cristal. Quando a arte chegar: recortar, medir, prévia e só depois o código.
- Ícones próprios para condições e ações no mesmo estilo.

## Roteiro de teste da 0.1.0 (mestre + jogador em aba anônima)
1. Ativar o módulo. Jogador com personagem atribuído: a HUD aparece com o retrato, PV, PM e os quatro números. Mestre sem token selecionado: só a barra nativa, no lugar de sempre.
2. Mestre seleciona um token: a HUD mostra aquele personagem; tira a seleção: a HUD some e a barra volta.
3. Passar o mouse (e dar Tab) nos quatro números: conferir as contas. Equipar uma armadura e ver a Defesa.
4. Aplicar Abalado no token: aparece o medalhão; a Iniciativa cai 2.
5. Arrastar um item da ficha para um slot, usar pela tecla 1–0 e pelo clique; botão direito edita ou remove.
6. Iniciar um combate com o personagem: os losangos aparecem. No turno dele, o cristal pulsa e mostra "Seu turno".
7. Usar uma magia de ação padrão: o losango padrão apaga dos dois lados (mestre e jogador). Usar de novo: aviso de ação já gasta.
8. Clicar num losango: gasta ou devolve. Jogador sem posse do personagem não consegue clicar.
9. Passar o turno até voltar ao personagem: padrão e movimento acendem. Nova rodada: reação acende.
10. Encerrar o combate: os losangos somem.

## Roteiro de teste da 0.2.0 (mestre + jogador em aba anônima)
1. Visual: o retrato passa ~10 px acima e abaixo do painel, sem nome embaixo; o painel não encosta na borda da tela. Passar o mouse no retrato: tooltip com nome e nível, e a engrenagem no canto.
2. Clique no retrato abre a ficha. Botão direito (ou engrenagem) abre "Retrato da HUD — <nome>".
3. Na janela: arrastar, roda do mouse, + e −, setas (Shift anda mais), "Centralizar". "Escolher…" abre o seletor de arquivos (como jogador também; se não tiver permissão, digitar o caminho). "Usar a imagem da ficha" volta para a imagem do ator. Salvar: a HUD atualiza nos dois lados (mestre e jogador). Cancelar não muda nada.
4. Tooltips: Defesa, Deslocamento, Iniciativa, CD e condições no estilo translúcido; equipar armadura pesada com Des positiva: a linha do atributo aparece riscada com "Não soma: armadura pesada".
5. Iniciativa fora de combate: o clique rola o teste no chat (com a janela de uso do sistema, ou sem ela segurando Shift, conforme a configuração).
6. Mestre cria um combate na cena **sem** o token do jogador: o tooltip diz "entrar no combate"; o jogador clica: o token entra no combate e a iniciativa aparece no painel de combate.
7. Combate com o personagem já dentro e sem iniciativa: o clique rola e grava. Clicar de novo como jogador: aviso "só o mestre pode rolar de novo". Como mestre (token selecionado): rola de novo e substitui.
8. Com dois combates abertos (um vazio exibido no painel): a iniciativa vai para o combate em que o personagem está, não para o exibido.
9. Cancelar a janela de uso da Iniciativa: nada é gravado.
10. Barra: só ▲ número ▼ ao lado dos atalhos, apagado até passar o mouse; trocar de página funciona; botão direito no atalho continua editando/removendo. Som, menu, travar e limpar sumiram.
