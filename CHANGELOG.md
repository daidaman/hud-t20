# Changelog

## 0.2.3 — 2026-11-18
- Barras de PV e PM encaixadas na moldura: a moldura agora fica por cima da cor (antes o vermelho e o azul passavam por cima da borda interna e, cheios, deixavam uma fresta escura na ponta direita).
- PV e PM extras (temporários): barra mais escura que entra da direita para a esquerda, por cima da barra normal, com o tamanho do extra em relação ao máximo. Vinho no PV, roxo-azulado no PM, filete dourado na ponta. Sem extra, não aparece.
- Mais espaço antes do "(+N)".

## 0.2.2 — 2026-11-18
- Lado esquerdo: o retrato agora encosta na ponta do painel e vaza ~10 px, como em cima e embaixo. Some a faixa do painel (com a ponta da moldura e os rubis) que sobrava à esquerda dele. A HUD fica ~40 px mais estreita.
- A imagem do retrato preenche a moldura até a barra de baixo, sem a faixa escura dos lados da gema (a abertura tinha sido medida no centro, onde a gema sobe). Vale também para a janela de enquadramento. Enquadramentos já salvos podem descer um pouquinho.

## 0.2.1 — 2026-11-18
- Corrigido: clicar no retrato não abria a ficha. O core do Foundry dá altura fixa a todo `<button>`, e o botão invisível do retrato virava uma faixa fina no topo. Agora ele tem largura e altura explícitas, e o próprio retrato também abre a ficha. A engrenagem continua abrindo o ajuste.

## 0.2.0 — 2026-11-18
- Retrato como no conceito: o painel fica baixo, justo em volta do status, e a moldura do retrato (150 × 152 px) vaza ~10 px em cima e embaixo. O painel sobe um pouco da borda da tela.
- Sem nome e nível embaixo do retrato: eles foram para o tooltip do retrato, que também explica o clique (abre a ficha) e o botão direito.
- A imagem cobre a moldura (sem faixas escuras). Nova janela "Retrato da HUD": botão direito no retrato ou engrenagem ao passar o mouse. Troca a imagem (seletor de arquivos ou caminho digitado), "Usar a imagem da ficha", arrastar para enquadrar, zoom de 100 a 300% (controle, roda do mouse, + e −), setas movem, "Centralizar", prévia em tamanho real. Salvo no ator em `flags.hud-t20.retrato` (dono e mestre).
- Tooltips translúcidos no esquema do tooltip de melhorias: seção em caixa alta azul-aço com o total em dourado, uma linha por parcela com losango e explicação menor, parcela que não soma riscada com o motivo (ex.: atributo com armadura pesada).
- Iniciativa clicável. Fora de combate rola o teste do sistema no chat. Em combate (mesmo antes de começar) rola e grava no combate do personagem, colocando o token no combate se ele ainda não estiver. Já rolada: o jogador recebe aviso e só o mestre rola de novo. O rodapé do tooltip diz o que o clique vai fazer.
- Barra nativa: somem som, menu, travar e limpar. Fica só o seletor de página (▲ número ▼), apagado até passar o mouse.

## 0.1.2 — 2026-11-17
- Corrigido: os atalhos ficavam por cima do cristal e dos losangos. O Foundry v13 desloca a `#hotbar` com `transform: translateX(-70px)`; dentro do painel esse transform agora é anulado.

## 0.1.1 — 2026-11-17
- HUD mais compacta: painel ~20% menor, barras de PV e PM de 320 para 236 px, atalhos de 52 para 42 px.
- Retrato aparece inteiro, sem cortar as laterais: a imagem ocupa a abertura da moldura e usa `contain`. A moldura passa só ~4 px acima do painel.
- Encaixe automático: a HUD se centraliza no espaço livre entre a esquerda da tela e a caixa de mensagem flutuante (ou a barra lateral) e encolhe até 60% se não couber. Reage a abrir, fechar e trocar a aba da barra lateral e ao redimensionar a janela.
- Botões da barra nativa (som, menu, travar, limpar, página) agrupados numa coluna fina à direita dos atalhos, apagada até passar o mouse.

## 0.1.0 — 2026-11-17
- Primeira versão do módulo: `module.json`, painel (`ApplicationV2`) preso embaixo da tela, dentro de `#ui-bottom`.
- Retrato (abre a ficha), nome e nível; PV e PM em trilhos; Defesa, Deslocamento, Iniciativa e CD das magias com a conta no tooltip (mouse e teclado).
- Condições ativas em medalhões, com as mudanças no tooltip.
- Cristal do turno ("Seu turno" / "Aguardando"), procurando o combate do personagem em `game.combats`.
- Ações do turno: losangos de padrão, movimento e reação, gravados nas flags do combatente. Gasto automático pelo tipo de execução do item usado; clique gasta ou devolve; recarga no início do turno (padrão e movimento) e da rodada (reação).
- Atalhos: a barra nativa do Foundry entra no painel, em 2 × 5, com o visual novo.
- Configurações por navegador: mostrar a HUD e tamanho da HUD.
- Pergaminho novo do chat em `assets/` (para o módulo do tema).

## 0.0.1 — 2026-11-17
- Projeto iniciado: conceito, arte (12 peças) e protótipo visual aprovados.
- Nenhum código do módulo ainda.
