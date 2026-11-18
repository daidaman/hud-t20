# HUD de Tormenta 20 — PROJETO

Diário do projeto. Primeiro arquivo a ler numa conversa nova.

## Objetivo
Uma barra fixa na parte de baixo da tela do Foundry VTT v13 (build 351, o único disponível no servidor) com o essencial do personagem para o combate de Tormenta 20 (sistema `tormenta20`), no visual "metal escuro, filete dourado e rubi", e um tema que deixa o chat e a interface nativa no mesmo estilo.

- **Mesa:** RPG dos Amiguinhos. Os testes são feitos no mundo de teste do limaserver e o envio é por FileZilla para `Data/modules/<id>/`.
- **Uso:** privado, só para a mesa. As artes foram geradas por IA (ChatGPT) e não serão divulgadas.

## Nome e id
- **HUD: `hud-t20`** (decidido em 2026-11-17). O id nunca muda depois de instalado.
- Tema: id a definir quando o repositório dele for criado.

## Estrutura (decidido em 2026-11-17)
Os dois são módulos separados, porque um mestre pode querer um sem o outro:
1. **HUD do personagem** (este repositório, vem primeiro): o painel de baixo.
2. **Tema** (repositório próprio, depois): faz o reskin por CSS do chat, da barra lateral, dos controles de cena, da navegação de cenas e da lista de jogadores. Não troca lógica nenhuma.

Os dois usam a mesma arte de `assets/`. Um módulo-base compartilhado só se justifica se 3 ou mais módulos repetirem o código.

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
- [x] **0.2.2 (2026-11-18):** ajustes do teste em tela de notebook, aprovados por prévia. O retrato cobre a ponta esquerda do painel (margem esquerda −34 px), e a imagem preenche a moldura até a barra de baixo (abertura 7% 6% 7,5% 6%; o 11% antigo era a altura da gema no centro). **Falta conferir no mundo.**
- [x] **0.2.3 (2026-11-18):** barras de PV/PM com a moldura numa camada por cima da cor (`.hud-trilho::after`; camadas fundo → cor → extra → moldura → número) e barra de extra (`attributes.pv.temp`/`pm.temp`) da direita para a esquerda, mais escura, proporcional ao máximo; mais espaço antes do "(+N)". Aprovado por prévia; conferido com o CSS real fora do Foundry. **Falta conferir no mundo.** Lição: a borda (`border-image`) de um elemento sempre fica atrás dos filhos; moldura que precisa cobrir o conteúdo vai num pseudo-elemento com `z-index`.
- [x] **0.2.4 (2026-11-18):** cristal sem o "Aguardando": a legenda só aparece ("Seu turno") em combate, no turno do personagem; fora disso o cristal fica apagado e sem texto (o espaço da legenda continua reservado, para nada pular). **Falta conferir no mundo, junto com a 0.2.2 e a 0.2.3.**

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
- Tema completo da interface (segundo módulo).
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
