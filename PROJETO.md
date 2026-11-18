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
1. **Retrato vazado:** moldura com a cabeça do personagem saindo por cima.
   - Imagem com fundo transparente (token): efeito vazado.
   - Retrato retangular: imagem normal dentro da moldura.
   - Nome e nível embaixo.
2. **Bloco de status:**
   - PV e PM no topo, em trilhos com o texto "atual / máximo".
   - Abaixo, quatro caixas pequenas só com ícone e número: Defesa, Deslocamento, Iniciativa e CD das magias. Os valores não quebram linha.
   - Acima do bloco, as condições ativas em medalhões redondos, com o efeito no tooltip.
3. **Cristal (gema):** separa o status dos atalhos e pulsa em vermelho com a legenda "Seu turno" quando é o turno do personagem no combate. Fora do turno, mostra "Aguardando". Para quem configura o sistema para reduzir animações, ele fica aceso sem pulsar.
4. **Ações do turno (decidido em 2026-11-17):** três losangos em arco sobre o cristal: ação padrão, movimento e reação.
   - Aceso: disponível. Apagado e riscado: gasto. A ação completa apaga padrão e movimento.
   - Padrão e movimento recarregam no início do turno do personagem; a reação, no início da rodada.
   - Fora de combate, os losangos somem.
   - Arte: `assets/acao-padrao.webp`, `acao-movimento.webp`, `acao-reacao.webp` (original em `arte-original/acoes.png`). O estado gasto é feito em CSS (cinza + risco vermelho).
5. **Atalhos:** 10 slots em 2 fileiras de 5 (1–5 e 6–0), com o número no canto. Os vazios ficam apagados.

**Chat (fica para o módulo do tema):** cartão com cabeçalho de metal, emblema redondo do autor, corpo de pergaminho e rodapé com um rubi, como no conceito do Gemini. A caixa de mensagem fica com a mesma moldura. Vale tanto para a barra lateral aberta quanto recolhida (mensagens flutuantes).

**Resolução:**
- As molduras usam `border-image` em 9 partes, então esticam sem deformar.
- As texturas se repetem sem emenda.
- A HUD respeita a escala de interface do Foundry.
- Tudo foi gerado em alta resolução e é exibido reduzido, o que serve para telas 2x.

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

## Pendências (resolver nesta ordem)
1. [x] **Nome e id:** `hud-t20`.
2. [x] **Inspeção no mundo de teste** (2026-11-17): CD, condição e combate confirmados. Falta só ver uma armadura equipada na Defesa, o que dá para conferir já com o código rodando.
3. [ ] **De quem é a HUD.** Proposta, a confirmar: o jogador vê sempre o próprio personagem; o mestre vê o token selecionado e, sem seleção, a HUD some.
4. [ ] **Ações do turno:** arte recebida e no protótipo. Falta, na inspeção, ver onde o T20 guarda o tipo de execução do item (padrão, movimento, completa, reação, livre).
5. [ ] **Novo pergaminho** para o chat: marfim acinzentado, com fibras e manchas suaves, como no conceito. O atual ficou amarelo demais. O prompt está na conversa de 2026-11-17. Quando chegar, substituir `assets/pergaminho.webp`.
6. [ ] **Combate:** como detectar o turno do personagem para o cristal (`game.combat`, hook `updateCombat`).

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
  - Ativar ou desativar o efeito vazado (`client`).
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

## Ideias futuras
- Tema completo da interface (segundo módulo).
- Ícones próprios para condições e ações no mesmo estilo.
