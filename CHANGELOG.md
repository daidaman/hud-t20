# Changelog

## 0.6.1 — 2026-11-20
- Corrigido: nos temas de cristal, os tooltips dos losangos (Defesa, Iniciativa, Deslocamento) não apareciam. O recorte em losango do brilho do mouse cortava o tooltip; agora o brilho fica num pseudo-elemento.

## 0.6.0 — 2026-11-20
Temas de cristal com a arte nova (v2), nos 7 temas:
- **Losangos com os números principais:** Defesa (meio, maior), Iniciativa (esquerda; o clique rola) e Deslocamento (direita), com ícone e número dentro dos losangos da própria moldura. A CD das magias foi para o tooltip da barra de PM (só para quem conjura). Nos temas de cristal saíram as ações do turno e as 4 caixinhas.
- **Barras de líquido:** PV e PM mais altas, com líquido que desliza, bolhas, superfície ondulando na ponta e vidro por cima. No dano o líquido escorre e deixa um rastro claro que some; na cura, enche aos poucos. PV baixo (até 30%) acelera as bolhas e pulsa. PV e PM temporários em dourado e ciano, logo depois do fim do líquido. Tudo parado para quem pede menos animação.
- **Atalhos em grupos de 5 com placa de nome:** ◀ nome ▶ em cima dos atalhos. As setas trocam o grupo (10 grupos: cada página do Foundry vira 2). Clicar no nome deixa escrever ("Ataques", "Magias"…); Enter salva, Esc cancela, vazio volta para "Atalhos N". Os nomes ficam na conta de cada jogador.

## 0.5.0 — 2026-11-19
- Sete temas de cristal, um por personagem da mesa, no "Visual do módulo": **Dragão Alado**, **Forja Mecânica**, **Chama da Fênix**, **Ossário**, **Corsário da Raposa**, **Ursal** e **Tempestade Rubra (cristal)**.
- **Tema por personagem:** botão direito no retrato da HUD → "Visual da HUD deste personagem". Vale para todos que veem a HUD daquele personagem; "Seguir a mesa" volta ao visual do mundo. O dono e o mestre podem mudar. A janela mostra a prévia do retrato no tema escolhido.
- **Meu visual (cada jogador):** nova opção em Configurações → HUD de Tormenta 20, só para quem a escolhe. O jogador troca o próprio visual, inclusive "só a HUD" × "HUD e tema da interface"; "Seguir a mesa" (padrão) usa o do mestre, que agora se chama "Visual da mesa". Ordem: visual do personagem > meu visual > visual da mesa.
- **Retrato em cristal (cada jogador):** logo abaixo de "Meu visual", escolhe como o retrato aparece nos temas de cristal: com cristal (vidro e reflexo, padrão), cristal suave (mais leve, sem reflexo) ou sem cristal (só a foto).
- Condições: no máximo 5 medalhões por fileira; da 6ª em diante sobem para uma fileira de cima, com o mesmo espaço de 6 px. Ficam por cima das peças da HUD (antes passavam por trás). Vale para todos os visuais.
- Retrato em cristal (vidro): a foto com a camada de cristal, as facetas e um reflexo que passa a cada ~6 s. Com 0 PV, a foto fica cinza e o reflexo para.
- PM azul em todos os temas (a barra roxa da Tempestade foi recolorida).
- Caixinhas com número e sigla (DEF, DESL, INI, CD); os tooltips continuam iguais. Nos temas de cristal não há o "Seu turno" (o escudo do centro é só decoração).
- Posições lidas de `assets/temas/cristal-medidas.json`; CSS novo em `styles/hud-cristal.css`. Forja: tirado um pedacinho solto da arte na ponta direita.

## 0.4.0 — 2026-11-18
- Dois temas novos da HUD na configuração "Visual do módulo": **Tempestade Rubra** (carapaça rubra com garras, névoa e o olho da Tormenta no centro) e **Aventureiro do Reinado** (couro, fivelas de latão e a bússola no centro). As opções agora são: "Metal e rubi: só a HUD" (padrão), "Metal e rubi: HUD e tema da interface", "Tempestade Rubra (só a HUD)" e "Aventureiro do Reinado (só a HUD)". Troca na hora, sem recarregar. Quem já tinha escolhido uma opção na 0.3.0 continua igual.
- Nos temas, a moldura é a arte inteira do conceito e cada peça vai na posição medida: retrato, barras de PV e PM (cor do miolo das barras da folha, cortada pelo valor), as 4 caixinhas (Defesa, Deslocamento, Iniciativa e CD, com escudo, bota, ampulheta e estrela), os 3 losangos das ações do turno e os 10 atalhos nas caixas desenhadas.
- Os losangos soltos cobrem os desenhados na arte e continuam funcionando como antes (padrão = espada, movimento = bandeira, reação = explosão; gasto = cinza e riscado). Fora de combate, ficam apagados e sem clique, para os da arte não parecerem ações disponíveis.
- O olho da tempestade e a bússola fazem o papel do cristal: no turno do personagem, pulsam (vermelho / dourado) com a legenda "Seu turno".
- Aventureiro: coração e gota no começo das barras e caixinhas claras com número escuro. Tempestade: "PV" e "PM" escritos na barra e um brilho claro em volta do PV, para não sumir no vermelho.
- Só as peças recebem o mouse; o céu e a névoa transparentes em volta deixam clicar no mapa.
- CSS novo em `styles/hud-temas.css` (só vale com a classe `hud-t20-arte`). Arte em `assets/temas/tempestade/` e `assets/temas/aventureiro/`; scripts de recorte em `arte-original/temas/`.

## 0.3.0 — 2026-11-18
- Tema da interface (parte 2 do módulo), no visual do protótipo "Arton UI" aprovado: cartão do chat com cabeçalho de metal, emblema redondo do autor (retrato do personagem ou inicial na cor do jogador), nome do jogador embaixo do nome do personagem, corpo de pergaminho e rodapé com rubi. Vale no chat da barra lateral e nas mensagens flutuantes.
- Rolagens do core e cartões do sistema `tormenta20` no estilo do pergaminho (fórmula, total, crítico em verde, falha em vermelho). Os cartões do Decreto do Panteão e do Bando da Raposa ficam como estão: só ganham o cabeçalho e o emblema.
- Botões de metal com brilho rubi no ativo (controles de cena, abas da barra lateral, controles do chat); cenas da navegação, lista de jogadores, barra lateral e controles do chat com a moldura rente; caixa de mensagem de pergaminho na moldura.
- Nova configuração "Visual do módulo" (mundo, só o mestre muda): "Só a HUD" (padrão) ou "HUD e tema da interface". Troca na hora, sem recarregar.
- "Sussurro para…" e o texto de sabor saem do cabeçalho (que tem altura fixa) para o começo do corpo, quando o tema está ligado.
- CSS novo em `styles/tema.css`, que só vale com a classe `hud-t20-tema` no `body`. Peças novas: `assets/rodape-gema.webp` e `assets/rodape-linha.webp` (recortes de `chat-rodape.webp`).

## 0.2.5 — 2026-11-18
- Corrigido: a HUD do jogador sumia ao trocar de ferramenta nos controles de cena (a troca solta o token selecionado). Jogador sem personagem atribuído agora continua vendo o último personagem mostrado ou, no começo, o primeiro personagem dele. A HUD do jogador nunca some por falta de seleção. O mestre continua como antes: sem token selecionado, a HUD some.

## 0.2.4 — 2026-11-18
- Cristal: saiu a legenda "Aguardando". O texto "Seu turno" só aparece em combate, no turno do personagem; no turno dos outros e fora de combate, o cristal fica apagado e sem texto.

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
