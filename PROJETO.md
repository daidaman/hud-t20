# HUD de Tormenta 20 — PROJETO

Diário do projeto. Primeiro arquivo a ler numa conversa nova.

## Objetivo
Uma barra fixa na parte de baixo da tela do Foundry VTT v13 (build 346) com o essencial do personagem para o combate de Tormenta 20 (sistema `tormenta20`), no visual "metal escuro, filete dourado e rubi", e um tema que deixa o chat e a interface nativa no mesmo estilo.

- **Mesa:** RPG dos Amiguinhos. Os testes são feitos no mundo de teste do limaserver e o envio é por FileZilla para `Data/modules/<id>/`.
- **Uso:** privado, só para a mesa. As artes foram geradas por IA (ChatGPT) e não serão divulgadas.

## Nome e id
- **A definir antes do primeiro código.** O id nunca muda depois de instalado.
- Sugestões: `t20-hud` (HUD) e `t20-tema-rubi` (tema).

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
4. **Atalhos:** 10 slots em 2 fileiras de 5 (1–5 e 6–0), com o número no canto. Os vazios ficam apagados.

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

## Pendências (resolver nesta ordem)
1. [ ] **Nome e id** dos módulos.
2. [ ] **Inspeção no mundo de teste**, antes de escrever a lógica, documentando aqui o que for encontrado:
   - [ ] Caminhos dos dados no ator do `tormenta20`: PV, PM, Defesa, Deslocamento, Iniciativa e CD das magias.
   - [ ] Se o sistema guarda as parcelas de Defesa e CD (para o tooltip) ou só o total. Se for só o total, o módulo recalcula pelas regras e mostra a diferença como "outros bônus".
   - [ ] Se arrastar item ou magia para a barra já cria macro no T20. Se não criar, o módulo trata o drop.
   - [ ] Como as condições aparecem (ActiveEffects e statuses) e onde ficam os ícones delas.
   - [ ] Formato das rolagens no chat (`message.rolls` e flags do sistema), necessário para o tema.
3. [ ] **De quem é a HUD.** Proposta, a confirmar: o jogador vê sempre o próprio personagem; o mestre vê o token selecionado e, sem seleção, a HUD some.
4. [ ] **Ação padrão e movimento** no turno: mostrar ou não? Ficou sem resposta.
5. [ ] **Novo pergaminho** para o chat: marfim acinzentado, com fibras e manchas suaves, como no conceito. O atual ficou amarelo demais. O prompt está na conversa de 2026-11-17. Quando chegar, substituir `assets/pergaminho.webp`.
6. [ ] **Combate:** como detectar o turno do personagem para o cristal (`game.combat`, hook `updateCombat`).

## Plano técnico (v13)
- **Estrutura:** `module.json` (`compatibility` minimum 13, verified 13.346), `scripts/main.mjs`, `templates/hud.hbs`, `styles/hud.css`, `lang/pt-BR.json` e `assets/`.
- **Painel:**
  - `ApplicationV2` com `HandlebarsApplicationMixin`, sem moldura de janela.
  - Fica preso embaixo da tela, junto à barra nativa (`#hotbar`), que é reposicionada e restilizada por CSS em 2×5.
- **Atualização:**
  - Hooks `controlToken`, `updateActor`, `createActiveEffect`, `deleteActiveEffect`, `updateCombat` e `canvasReady`.
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
