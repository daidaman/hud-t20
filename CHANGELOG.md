# Changelog

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
