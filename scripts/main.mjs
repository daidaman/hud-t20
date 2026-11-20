/**
 * HUD de Tormenta 20 — painel do personagem embaixo da tela.
 * Foundry VTT v13, sistema tormenta20 1.5.x.
 */

const MODULE_ID = "hud-t20";
const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

const ACOES = ["padrao", "movimento", "reacao"];

/** Tipo de execução do item (system.ativacao.execucao) → ações gastas. */
const GASTO_POR_EXECUCAO = {
  action: ["padrao"],
  move: ["movimento"],
  full: ["padrao", "movimento"],
  reaction: ["reacao"]
};

/**
 * Visual da HUD (0.4.0). "hud" e "tema" usam a arte de metal e rubi (o "tema" ainda veste a interface);
 * "tempestade" e "aventureiro" trocam a moldura inteira da HUD pela arte do tema (styles/hud-temas.css).
 * 0.5.0: os 7 temas de cristal ("cristal-*", styles/hud-cristal.css), um por personagem da mesa.
 * As posições das peças vêm de assets/temas/cristal-medidas.json, em % da moldura.
 */
const TEMAS_CRISTAL = ["cristal-dragao", "cristal-forja", "cristal-fenix", "cristal-ossario", "cristal-corsario", "cristal-ursal", "cristal-tempestade"];
const ARTE_TEMAS = ["tempestade", "aventureiro", ...TEMAS_CRISTAL];
const ICONES_STAT = { defesa: "ic-defesa", desloc: "ic-desloc", iniciativa: "ic-iniciativa", cd: "ic-cd" };
const eCristal = (visual) => TEMAS_CRISTAL.includes(visual);

/** Medidas dos temas de cristal (carregadas no setup). */
let MEDIDAS_CRISTAL = {};

/**
 * Nome do visual da HUD: "classico", "tempestade", "aventureiro" ou "cristal-*".
 * 0.5.0: o personagem pode ter um visual próprio (flags.hud-t20.visual); sem ele, vale o do mundo.
 */
function visualDaHud(actor = null) {
  // 0.7.0: só os temas de cristal ou "nenhum" (sem HUD: fica a barra padrão do Foundry). Valores antigos
  // (metal e rubi, tema da interface, Tempestade, Aventureiro) contam como não escolhidos.
  const proprio = actor?.getFlag(MODULE_ID, "visual");
  if (eCristal(proprio)) return proprio;
  const v = visualEscolhido();
  return eCristal(v) ? v : "nenhum";
}

/**
 * Visual escolhido neste computador: o do próprio jogador ("Meu visual", 0.5.0) ou, se ele não escolheu, o da mesa.
 * Ordem na HUD: visual do personagem > meu visual > visual da mesa. O tema da interface ("tema") segue esta escolha.
 */
function visualEscolhido() {
  let meu = "";
  try {
    meu = game.settings.get(MODULE_ID, "visualMeu");
  } catch {
    /* ainda não registrado */
  }
  return (meu === "nenhum" || eCristal(meu)) ? meu : game.settings.get(MODULE_ID, "visual");
}

/** Efeito do retrato nos temas de cristal, escolhido por cada jogador: "vidro" (padrão), "suave" ou "nenhum". */
function efeitoRetrato() {
  try {
    const v = game.settings.get(MODULE_ID, "retratoCristal");
    return ["vidro", "suave", "nenhum"].includes(v) ? v : "vidro";
  } catch {
    return "vidro";
  }
}

/**
 * Grupos de atalhos (cristal v2). A barra do Foundry tem 5 páginas de 10; cada página vira 2 grupos de 5
 * (metade de cima: atalhos 1–5; de baixo: 6–0). Grupo = (página − 1) × 2 + metade, de 0 a 9.
 */
let metadeAtalhos = 0;
const grupoAtalhos = () => ((ui.hotbar?.page ?? 1) - 1) * 2 + metadeAtalhos;

function nomeGrupoAtalhos(g) {
  return game.user.getFlag(MODULE_ID, "gruposAtalhos")?.[g] || t("Atalhos.Padrao", { n: g + 1 });
}

async function mudarGrupoAtalhos(passo) {
  const g = (((grupoAtalhos() + passo) % 10) + 10) % 10;
  metadeAtalhos = g % 2;
  const pagina = Math.floor(g / 2) + 1;
  if (ui.hotbar && ui.hotbar.page !== pagina) await ui.hotbar.changePage(pagina);
  atualizarPlaca();
}

/** Atualiza a placa e a metade mostrada sem redesenhar a HUD (troca de página pelo Foundry também passa aqui). */
function atualizarPlaca() {
  const el = hud?.element;
  if (!el?.classList.contains("hud-t20-cristal")) return;
  el.dataset.metade = String(metadeAtalhos);
  const nome = el.querySelector(".hud-placa .nome");
  if (nome) nome.textContent = nomeGrupoAtalhos(grupoAtalhos());
}

/**
 * Tela de morte (0.8.0): com 0 PV, uma frase sorteada da lista do mestre fica no meio do retrato,
 * estilo "YOU DIED". A frase é sorteada uma vez por queda (neste computador) e some quando o PV volta.
 */
const FRASES_MORTE_PADRAO = "VOCÊ MORREU;SE FUDEU;DEU RUIM, PARCEIRO;KHALMYR VIU E RIU;TENEBRA MANDOU UM ABRAÇO;THYATIS TÁ OCUPADO, TENTA AMANHÃ;ROLOU 1, NÉ?;ERA SÓ NÃO TER IDO NA FRENTE;O CURANDEIRO TAVA OLHANDO O CELULAR;FAZ A FICHA NOVA AÍ;MORREU IGUAL UM GOBLIN;ACHOU QUE ERA PROTAGONISTA;NIMB DECIDIU QUE HOJE NÃO;VAI PRO BANCO DE RESERVA;PERDEU, PLAYBOY;A MESA AGRADECE SUA CONTRIBUIÇÃO;CAIU QUE NEM SACO DE BATATA;ARTON NÃO PERDOA;O MESTRE TÁ RINDO ATÉ AGORA;GIT GUD;FOI DE VASCO;VIROU CAMISA DE SAUDADE;E ESSAS FORAM SUAS ÚLTIMAS PALAVRAS;TOCA O LARALI LARALÁ;FOI DE KURIRIN";
const frasesSorteadas = new Map();

function fraseDaMorte(actor) {
  const pv = Number(actor.system?.attributes?.pv?.value) || 0;
  if (pv > 0 || !game.settings.get(MODULE_ID, "morte")) {
    frasesSorteadas.delete(actor.uuid);
    return "";
  }
  if (!frasesSorteadas.has(actor.uuid)) {
    const lista = String(game.settings.get(MODULE_ID, "morteFrases") || "").split(";").map((f) => f.trim()).filter(Boolean);
    frasesSorteadas.set(actor.uuid, lista.length ? lista[Math.floor(Math.random() * lista.length)] : t("Morte.Padrao"));
  }
  return frasesSorteadas.get(actor.uuid);
}

/** Visual do personagem mostrado agora (as funções dos tooltips usam para achar os ícones). */
let visualEmUso = "classico";

/** Caminho de uma peça de arte do visual em uso (o clássico fica direto em assets/). */
function arte(nome, visual = visualEmUso) {
  // Os temas de cristal não têm ícones próprios: as caixinhas mostram só o número e a sigla.
  if (visual === "classico" || (eCristal(visual) && nome.startsWith("ic-"))) return `modules/${MODULE_ID}/assets/${nome}.webp`;
  return `modules/${MODULE_ID}/assets/temas/${visual}/${nome}.webp`;
}

/**
 * Variáveis CSS com as posições do tema de cristal (todas em % da moldura).
 * styles/hud-cristal.css usa: --cr-ar (proporção), --cr-r (retrato), --cr-pv/--cr-pm (barras),
 * --cr-c1..4 (caixinhas), --cr-l1..3 (losangos, já centrados na abertura) e --cr-a1..10 (atalhos),
 * cada uma como -x, -y, -w, -h.
 */
function varsCristal(visual) {
  const m = MEDIDAS_CRISTAL[visual];
  if (!m) return {};
  const vars = { "--cr-ar": `${m.moldura_px[0]} / ${m.moldura_px[1]}` };
  const caixa = (nome, [x, y, w, h]) => {
    vars[`--cr-${nome}-x`] = `${x}%`;
    vars[`--cr-${nome}-y`] = `${y}%`;
    vars[`--cr-${nome}-w`] = `${w}%`;
    vars[`--cr-${nome}-h`] = `${h}%`;
  };
  // v2 (2026-11-20): losangos com Defesa/Iniciativa/Deslocamento, placa de nome dos atalhos e 5 atalhos.
  caixa("r", m.retrato);
  caixa("pv", m.barras.pv);
  caixa("pm", m.barras.pm);
  // Losangos: os da própria moldura (abertura escura: esquerda, meio, direita); só o ícone e o número por cima.
  const [ini, def, des] = m.losangos_abertura;
  caixa("ldef", def);
  caixa("lini", ini);
  caixa("ldes", des);
  caixa("placa", m.placa);
  caixa("se", m.setas.esq);
  caixa("sd", m.setas.dir);
  m.atalhos.forEach((c, i) => caixa(`a${i + 1}`, c));
  return vars;
}

const t = (chave, dados) => (dados ? game.i18n.format(`HUDT20.${chave}`, dados) : game.i18n.localize(`HUDT20.${chave}`));
const comSinal = (n) => (n > 0 ? `+${n}` : `${n}`);

/* -------------------------------------------- */
/*  Personagem e combate                        */
/* -------------------------------------------- */

/**
 * De quem é a HUD (proposta da pendência 3):
 * jogador → o próprio personagem (ou, sem personagem atribuído, o token dele selecionado;
 *   sem seleção, o último mostrado ou o primeiro personagem dele: nunca some);
 * mestre → o token selecionado; sem seleção, a HUD some.
 * @returns {{actor: Actor, token: TokenDocument|null}|null}
 */
function alvoDaHud() {
  const controlado = canvas?.ready ? canvas.tokens.controlled[0] : null;
  if (game.user.isGM) {
    return controlado?.actor ? { actor: controlado.actor, token: controlado.document } : null;
  }
  const proprio = game.user.character;
  if (proprio) {
    const token = controlado?.actor === proprio ? controlado.document : null;
    return { actor: proprio, token };
  }
  // Jogador sem personagem atribuído: o token dele selecionado; sem seleção (trocar de
  // ferramenta solta o token), continua no último mostrado ou, no começo, no primeiro
  // personagem dele. A HUD do jogador nunca some por falta de seleção (0.2.5).
  if (controlado?.actor?.isOwner) {
    ultimoAtorJogador = controlado.actor.id;
    return { actor: controlado.actor, token: controlado.document };
  }
  const ultimo = game.actors.get(ultimoAtorJogador);
  const reserva = ultimo?.isOwner ? ultimo : game.actors.find((a) => a.type === "character" && a.isOwner);
  if (!reserva) return null;
  ultimoAtorJogador = reserva.id;
  const token = reserva.getActiveTokens(false, true).find((tk) => tk.parent === canvas?.scene) ?? null;
  return { actor: reserva, token };
}

/** Último personagem mostrado para o jogador sem personagem atribuído. */
let ultimoAtorJogador = null;

/** O combatente pertence a este personagem? Token sintético compara pelo token; o resto, pelo ator. */
function eDoAlvo(combatant, alvo) {
  if (!combatant || !alvo) return false;
  if (alvo.actor.isToken) return combatant.tokenId === alvo.actor.token?.id;
  return combatant.actorId === alvo.actor.id;
}

/**
 * `game.combat` é o combate exibido, não necessariamente o do personagem:
 * procura um combate iniciado em que ele esteja.
 */
function combateDoAlvo(alvo) {
  for (const combat of game.combats) {
    if (!combat.started) continue;
    const combatant = combat.combatants.find((c) => eDoAlvo(c, alvo));
    if (combatant) return { combat, combatant };
  }
  return null;
}

/**
 * Combate onde a Iniciativa do personagem deve ser gravada.
 * Vale também combate ainda não iniciado (os jogadores costumam rolar antes do "Começar").
 * Ordem: combate iniciado em que ele está → qualquer combate em que ele está →
 * o combate exibido no painel, se for da cena atual (aí ele ainda não entrou).
 * @returns {{combat: Combat, combatant: Combatant|null}|null}
 */
function combateParaIniciativa(alvo) {
  if (!alvo) return null;
  const comEle = game.combats.filter((c) => c.combatants.some((cb) => eDoAlvo(cb, alvo)));
  const combat = comEle.find((c) => c.started) ?? comEle[0];
  if (combat) return { combat, combatant: combat.combatants.find((cb) => eDoAlvo(cb, alvo)) };
  const exibido = game.combat;
  if (exibido && (!exibido.scene || exibido.scene.id === canvas?.scene?.id)) return { combat: exibido, combatant: null };
  return null;
}

/** Texto do rodapé do tooltip da Iniciativa: diz o que o clique vai fazer. */
function rodapeIniciativa(alvo) {
  const ctx = combateParaIniciativa(alvo);
  if (!ctx) return t("Inic.Fora");
  const valor = ctx.combatant?.initiative;
  if (valor === null || valor === undefined) return ctx.combatant ? t("Inic.Combate") : t("Inic.Entrar");
  const n = Math.round(valor * 100) / 100;
  return game.user.isGM ? t("Inic.DeNovoGM", { n }) : t("Inic.JaRolou", { n });
}

/** Põe o token do personagem (na cena do combate) no combate. Devolve o combatente ou null com aviso. */
async function entrarNoCombate(combat, alvo) {
  const cena = combat.scene ?? canvas?.scene;
  let token = alvo.token?.parent === cena ? alvo.token : null;
  token ??= alvo.actor.getActiveTokens(false, true).find((tk) => tk.parent === cena);
  if (!token) {
    ui.notifications.warn(t("Inic.SemToken", { nome: alvo.actor.name }));
    return null;
  }
  const [criado] = await combat.createEmbeddedDocuments("Combatant", [
    { tokenId: token.id, sceneId: cena.id, actorId: token.actorId, hidden: token.hidden }
  ]);
  return criado ?? null;
}

/** Retrato da HUD salvo no ator: { img, x, y, zoom }. Sem img, usa a imagem da ficha. */
function retratoDoAtor(actor) {
  const r = actor.getFlag(MODULE_ID, "retrato") ?? {};
  const num = (v, padrao) => (Number.isFinite(Number(v)) && v !== null && v !== "" ? Number(v) : padrao);
  return {
    img: r.img || actor.img,
    propria: !!r.img,
    x: Math.clamp(num(r.x, 50), 0, 100),
    y: Math.clamp(num(r.y, 50), 0, 100),
    zoom: Math.clamp(num(r.zoom, 1), 1, 3)
  };
}

function gastas(combatant) {
  const f = combatant?.getFlag(MODULE_ID, "gastas") ?? {};
  return { padrao: !!f.padrao, movimento: !!f.movimento, reacao: !!f.reacao };
}

async function marcarAcoes(combatant, mudancas) {
  if (!combatant?.canUserModify(game.user, "update")) return;
  const novo = { ...gastas(combatant), ...mudancas };
  await combatant.update({ [`flags.${MODULE_ID}.gastas`]: novo });
}

/**
 * Quem escreve a recarga: o mestre ativo; sem mestre, o primeiro dono conectado do personagem.
 * Os hooks rodam em todos os clientes, então só um deles pode gravar.
 */
function souResponsavel(combatant) {
  const gm = game.users.activeGM;
  if (gm) return gm.isSelf;
  const donos = game.users
    .filter((u) => u.active && !u.isGM && combatant.actor?.testUserPermission(u, "OWNER"))
    .sort((a, b) => a.id.localeCompare(b.id));
  return donos[0]?.isSelf ?? false;
}

/* -------------------------------------------- */
/*  Cálculos para os tooltips                   */
/* -------------------------------------------- */

function avaliar(parte, rollData) {
  if (typeof parte === "number") return parte;
  if (parte === null || parte === undefined || parte === "") return 0;
  try {
    const formula = Roll.replaceFormulaData(String(parte), rollData, { missing: "0" });
    const n = Roll.safeEval(formula);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

function rotuloAtributo(chave) {
  const cfg = CONFIG.T20?.atributos?.[chave];
  const rot = typeof cfg === "string" ? cfg : cfg?.label;
  return rot ? game.i18n.localize(rot) : String(chave ?? "").toUpperCase();
}

function configT20(chave) {
  try {
    return game.settings.get("tormenta20", chave);
  } catch {
    return false;
  }
}

/**
 * Monta as linhas do tooltip e fecha a conta com "Outros modificadores" se faltar algo.
 * Cada linha: { rot, n, txt?, sub? (explicação menor), ext? (não soma: riscada), sempre? }.
 */
function fecharConta(linhas, total, { formatar = comSinal, primeiraSemSinal = false } = {}) {
  const somam = linhas.filter((l) => !l.ext);
  const soma = somam.reduce((s, l) => s + (Number.isFinite(l.n) ? l.n : 0), 0);
  const diff = Math.round((total - soma) * 100) / 100;
  const saida = linhas
    .filter((l) => l.ext || l.n !== 0 || l.sempre)
    .map((l, i) => ({
      rot: l.rot,
      val: l.txt ?? (i === 0 && primeiraSemSinal ? String(l.n) : formatar(l.n)),
      sub: l.sub ?? "",
      ext: !!l.ext
    }));
  if (diff) saida.push({ rot: t("OutrosMods"), val: formatar(diff), sub: t("OutrosModsDica"), ext: false });
  return saida;
}

function bonusEmLinhas(bonus, rollData) {
  return (bonus ?? []).map((b) => {
    const n = avaliar(b, rollData);
    if (n === null) return null;
    const formula = String(b).trim();
    return { rot: t("Bonus"), n, sub: /^[+-]?\d+(\.\d+)?$/.test(formula) ? "" : formula };
  }).filter(Boolean);
}

function itensEquipados(actor) {
  const slots = configT20("equipmentSlots");
  return (actor.itemTypes?.equipamento ?? []).filter((i) => (slots ? i.system.equipado2?.slot : i.system.equipado));
}

function statDefesa(actor, rollData) {
  const sys = actor.system;
  const def = sys.attributes.defesa;
  const meioNivel = Math.floor((sys.attributes.nivel?.value ?? 0) / 2);
  const itens = itensEquipados(actor);
  const armadura = itens.find((i) => ["leve", "pesada"].includes(i.system.tipo));
  const escudo = itens.find((i) => i.system.tipo === "escudo");
  const acessorios = itens.filter((i) => !["escudo", "leve", "pesada"].includes(i.system.tipo));
  const valorAtr = sys.atributos?.[def.atributo]?.value ?? 0;

  const rotAtr = rotuloAtributo(def.atributo);
  const linhas = [{ rot: t("Base"), n: def.base ?? 10, sempre: true }];
  if (actor.type === "character" && configT20("progressiveDefense")) linhas.push({ rot: t("MetadeNivel"), n: meioNivel });
  if (armadura?.system.tipo === "pesada") {
    // Armadura pesada limita o atributo (maxAtr; quase sempre 0, então ele não soma).
    const limitado = Math.min(valorAtr, armadura.system.armadura?.maxAtr ?? 0);
    if (limitado === valorAtr) linhas.push({ rot: rotAtr, n: valorAtr });
    else if (limitado > 0) linhas.push({ rot: rotAtr, n: limitado, sub: t("LimitadoPesada", { n: comSinal(valorAtr) }) });
    else if (valorAtr > 0) linhas.push({ rot: rotAtr, n: valorAtr, ext: true, sub: t("NaoSomaPesada") });
    else linhas.push({ rot: rotAtr, n: limitado });
  } else {
    linhas.push({ rot: rotAtr, n: valorAtr, sempre: true });
  }
  if (armadura) linhas.push({ rot: armadura.name, n: armadura.system.armadura?.value ?? 0, sub: t("Armadura"), sempre: true });
  if (escudo) linhas.push({ rot: escudo.name, n: escudo.system.armadura?.value ?? 0, sub: t("Escudo"), sempre: true });
  for (const i of acessorios) {
    const n = i.system.armadura?.value ?? 0;
    if (n) linhas.push({ rot: i.name, n, sub: t("ItemEquipado") });
  }
  linhas.push(...bonusEmLinhas(def.bonus, rollData));
  if (def.outros) linhas.push({ rot: t("Outros"), n: def.outros });
  if (def.condi) linhas.push({ rot: t("Condicoes"), n: def.condi });

  return {
    rotulo: t("Defesa"),
    abrev: t("Abrev.Defesa"),
    icone: arte(ICONES_STAT.defesa),
    valor: String(def.value),
    linhas: fecharConta(linhas, def.value, { primeiraSemSinal: true })
  };
}

function statDeslocamento(actor, rollData) {
  const mov = actor.system.attributes.movement;
  const andar = mov.walk ?? {};
  const unidade = mov.unit || "m";
  const fmt = (n) => `${comSinal(n)} ${unidade}`;
  const linhas = [{ rot: t("Base"), n: andar.base ?? 0, txt: `${andar.base ?? 0} ${unidade}`, sempre: true }];
  linhas.push(...bonusEmLinhas(andar.bonus, rollData));
  const pesada = itensEquipados(actor).some((i) => i.system.tipo === "pesada");
  if (pesada && !mov.tags?.has?.("ignora-armadura")) linhas.push({ rot: t("ArmaduraPesada"), n: -3 });
  if (actor.system.attributes.carga?.encumbered && !mov.tags?.has?.("ignora-carga")) linhas.push({ rot: t("Carga"), n: -3 });
  const valor = andar.value ?? 0;
  return {
    rotulo: t("Deslocamento"),
    abrev: t("Abrev.Deslocamento"),
    icone: arte(ICONES_STAT.desloc),
    valor: `${valor} ${unidade}`,
    valorCurto: `${valor}${unidade}`,
    linhas: fecharConta(linhas, valor, { formatar: fmt })
  };
}

function statIniciativa(actor, rollData, alvo) {
  const sys = actor.system;
  const inic = sys.pericias?.inic ?? {};
  const meioNivel = Math.floor((sys.attributes.nivel?.value ?? 0) / 2);
  const treino = Number(rollData.treino ?? sys.attributes?.treino ?? 0) || 0;
  const linhas = [
    { rot: t("MetadeNivel"), n: meioNivel },
    { rot: rotuloAtributo(inic.atributo), n: sys.atributos?.[inic.atributo]?.value ?? 0, sempre: true }
  ];
  if (inic.treinado) linhas.push({ rot: t("Treino"), n: treino, sub: t("Treinado") });
  linhas.push(...bonusEmLinhas(inic.bonus, rollData));
  if (inic.outros) linhas.push({ rot: t("Outros"), n: inic.outros });
  if (inic.condi) linhas.push({ rot: t("Condicoes"), n: inic.condi, sub: nomesCondicoes(actor) });
  const valor = inic.value ?? 0;
  return {
    rotulo: t("Iniciativa"),
    abrev: t("Abrev.Iniciativa"),
    icone: arte(ICONES_STAT.iniciativa),
    valor: comSinal(valor),
    linhas: fecharConta(linhas, valor),
    clicavel: true,
    pe: rodapeIniciativa(alvo)
  };
}

/** Nomes das condições ativas, para explicar a linha "Condições". */
function nomesCondicoes(actor) {
  return actor.temporaryEffects
    .filter((e) => e.active && (e.statuses?.size || e.getFlag("tormenta20", "condition")))
    .map((e) => e.name)
    .join(", ");
}

function statCD(actor) {
  const sys = actor.system;
  const magias = actor.itemTypes?.magia ?? [];
  const chave = sys.attributes?.conjuracao;
  if (!magias.length || !chave) {
    return { rotulo: t("CD"), abrev: t("Abrev.CD"), icone: arte(ICONES_STAT.cd), valor: "—", linhas: [{ rot: t("SemMagias"), val: "", sub: "", ext: false }] };
  }
  const meioNivel = Math.floor((sys.attributes.nivel?.value ?? 0) / 2);
  const atr = sys.atributos?.[chave]?.value ?? 0;
  const base = (sys.attributes.cd ?? 10 + meioNivel) - meioNivel;
  const valor = base + meioNivel + atr;
  const linhas = fecharConta(
    [
      { rot: t("Base"), n: base, sempre: true },
      { rot: t("MetadeNivel"), n: meioNivel },
      { rot: rotuloAtributo(chave), n: atr, sempre: true, sub: t("AtributoChave") }
    ],
    valor,
    { primeiraSemSinal: true }
  );
  const extra = Math.max(0, ...magias.map((m) => Number(m.system.resistencia?.bonus) || 0));
  if (extra) linhas.push({ rot: t("BonusMagias"), val: `+${extra}`, sub: t("BonusMagiasDica"), ext: false });
  return { rotulo: t("CD"), abrev: t("Abrev.CD"), icone: arte(ICONES_STAT.cd), valor: String(valor), linhas };
}

/** Nome legível para a chave de uma mudança de efeito (ex. system.pericias.inic.condi). */
function rotuloMudanca(key) {
  const p = key.replace(/^system\./, "").split(".");
  if (p[0] === "pericias" && p[1]) {
    const cfg = CONFIG.T20?.pericias?.[p[1]];
    const rot = typeof cfg === "string" ? cfg : cfg?.label;
    return rot ? game.i18n.localize(rot) : p[1];
  }
  if (p[0] === "atributos" && p[1]) return rotuloAtributo(p[1]);
  if (p.includes("defesa")) return t("Defesa");
  if (p.includes("movement")) return t("Deslocamento");
  return p.at(-2) ?? p.at(-1);
}

function textoSemHtml(html) {
  if (!html) return "";
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent.replace(/\s+/g, " ").trim();
}

function condicoesDoAtor(actor) {
  return actor.temporaryEffects
    .filter((e) => e.active && (e.statuses?.size || e.getFlag("tormenta20", "condition")))
    .map((e) => {
      const mudancas = e.changes
        .filter((c) => c.value !== "" && c.value !== undefined)
        .map((c) => {
          const n = Number(c.value);
          return { rot: rotuloMudanca(c.key), val: Number.isFinite(n) ? comSinal(n) : String(c.value), sub: "", ext: false };
        });
      const ehCondicao = !!e.getFlag("tormenta20", "condition");
      return {
        nome: e.name,
        img: e.img,
        secao: ehCondicao ? t("Condicao") : t("Efeito"),
        descricao: textoSemHtml(e.description),
        mudancas,
        semMudancas: t("SemEfeitoNumerico")
      };
    });
}

function recurso(rotulo, dados, classe, icone = "") {
  const value = Number(dados?.value) || 0;
  const max = Number(dados?.max) || 0;
  const temp = Math.max(Number(dados?.temp) || 0, 0);
  const pct = max > 0 ? Math.clamp(Math.round((value / max) * 100), 0, 100) : 0;
  // Extra (PV/PM temporários): barra mais escura da direita para a esquerda, proporcional ao máximo.
  const tempPct = max > 0 ? Math.clamp(Math.round((temp / max) * 1000) / 10, 0, 100) : (temp > 0 ? 100 : 0);
  // 0.5.0 (cristal): o temporário entra logo depois do fim do líquido; se passar do máximo, encosta na direita.
  const tempIni = Math.max(0, Math.min(pct, 100 - tempPct));
  return { rotulo, value, max, pct, temp, tempPct, tempIni, tempFim: Math.min(100, tempIni + tempPct), classe, icone };
}

/* -------------------------------------------- */
/*  Aplicação                                   */
/* -------------------------------------------- */

class HudT20 extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: "hud-t20",
    tag: "section",
    classes: ["hud-t20"],
    window: { frame: false, positioned: false },
    actions: {
      abrirFicha: HudT20.#abrirFicha,
      ajustarRetrato: HudT20.#ajustarRetrato,
      iniciativa: HudT20.#rolarIniciativa,
      acao: HudT20.#alternarAcao,
      grupoAnterior: HudT20.#grupoAnterior,
      grupoProximo: HudT20.#grupoProximo,
      renomearGrupo: HudT20.#renomearGrupo
    }
  };

  static PARTS = {
    hud: { template: `modules/${MODULE_ID}/templates/hud.hbs` }
  };

  /** Onde a barra nativa estava antes de entrar no painel. */
  #origemHotbar = null;

  /** @type {{actor: Actor, token: TokenDocument|null}|null} */
  alvo = null;

  async _prepareContext(options) {
    const actor = this.alvo.actor;
    const sys = actor.system;
    const rollData = actor.getRollData();
    const nivel = sys.attributes?.nivel?.value ?? actor.nivel ?? 0;
    const emCombate = combateDoAlvo(this.alvo);
    const g = gastas(emCombate?.combatant);
    const vez = !!emCombate && eDoAlvo(emCombate.combat.combatant, this.alvo);

    const retrato = retratoDoAtor(actor);
    const visual = visualDaHud(actor);
    visualEmUso = visual;
    const cristal = eCristal(visual);
    // Coração e gota no começo das barras só no Aventureiro (no Tempestade fica o texto PV/PM).
    const iconeBarra = (n) => (visual === "aventureiro" ? arte(n, visual) : "");
    const recursos = [
      recurso(t("PV"), sys.attributes?.pv, "pv", iconeBarra("ic-coracao")),
      recurso(t("PM"), sys.attributes?.pm, "pm", iconeBarra("ic-gota"))
    ];
    const stats = [statDefesa(actor, rollData), statDeslocamento(actor, rollData), statIniciativa(actor, rollData, this.alvo), statCD(actor)];
    // Cristal: tooltip das barras com o valor normal e o temporário (0.7.1; antes a barra de PM mostrava a CD).
    if (cristal) {
      for (const r of recursos) {
        const linhas = [{ rot: t("Barra.Normal", { r: r.rotulo }), val: `${r.value} / ${r.max}` }];
        if (r.temp) linhas.push({ rot: t("Barra.Temporario", { r: r.rotulo }), val: `+${r.temp}` });
        r.tip = { rotulo: r.rotulo, valor: String(r.value + (r.temp || 0)), linhas };
      }
    }

    return {
      visual,
      gema: arte("gema", "classico"),
      ator: { nome: actor.name, nivelTxt: t("Nivel", { nivel }) },
      // 0.5.0: retrato em cristal (modo vidro): camada de cristal, facetas e um reflexo por cima da foto.
      // Cada jogador escolhe o efeito em "Retrato em cristal": vidro, suave ou só a foto (sem as camadas).
      cristal: cristal && efeitoRetrato() !== "nenhum" ? { vidro: arte("cristal", visual), facetas: arte("facetas", visual) } : null,
      retrato: {
        ...retrato,
        caido: cristal && (Number(sys.attributes?.pv?.value) || 0) <= 0,
        frase: cristal ? fraseDaMorte(actor) : "",
        estilo: `--px:${retrato.x}%;--py:${retrato.y}%;--pz:${retrato.zoom}`,
        podeEditar: actor.isOwner,
        rotulo: t("Retrato.Rotulo", { nome: actor.name, nivel }),
        rotuloAjustar: t("Retrato.Ajustar"),
        dicaClique: t("Retrato.Clique"),
        dicaCliqueSub: t("Retrato.CliqueSub"),
        dicaDireito: t("Retrato.Direito"),
        dicaDireitoSub: t("Retrato.DireitoSub")
      },
      rotuloMudancas: t("Mudancas"),
      recursos,
      stats,
      cristalTema: cristal,
      // v2: placa com o nome do grupo de atalhos (5 por grupo; cada página do Foundry tem 2 grupos).
      placa: cristal ? { nome: nomeGrupoAtalhos(grupoAtalhos()), anterior: t("Atalhos.Anterior"), proximo: t("Atalhos.Proximo"), dica: t("Atalhos.Renomear") } : null,
      condicoes: condicoesDoAtor(actor),
      // v2 dos temas de cristal: sem as ações do turno (os losangos mostram Defesa, Iniciativa e Deslocamento).
      combate: !!emCombate && !cristal,
      acoesDecorativas: visual !== "classico" && !cristal,
      podeMarcar: !!emCombate?.combatant.canUserModify(game.user, "update"),
      acoes: ACOES.map((chave) => {
        const acao = t(`Acao.${chave}`);
        const estado = g[chave] ? t("Acao.Gasta") : t("Acao.Disponivel");
        return { chave, img: arte(`acao-${chave}`, visual), meio: chave === "movimento", gasta: g[chave], dica: t("Acao.Dica", { acao, estado }) };
      }),
      vez,
      legendaGema: t("Turno.Seu")
    };
  }

  _insertElement(element) {
    const destino = document.getElementById("ui-bottom") ?? document.body;
    destino.append(element);
  }

  async _onFirstRender(context, options) {
    await super._onFirstRender(context, options);
    const atalhos = document.createElement("div");
    atalhos.className = "hud-atalhos";
    this.element.append(atalhos);
  }

  async _onRender(context, options) {
    await super._onRender(context, options);
    this.element.style.setProperty("--hud-t20-escala", game.settings.get(MODULE_ID, "escala"));
    // Visual da HUD (0.4.0): o CSS de cada tema vale só com este atributo.
    this.element.dataset.visual = context.visual;
    this.element.classList.toggle("hud-t20-arte", context.visual !== "classico");
    // 0.5.0: temas de cristal, posições do JSON em variáveis CSS (as antigas saem ao trocar de tema).
    const cristal = eCristal(context.visual);
    this.element.classList.toggle("hud-t20-cristal", cristal);
    this.element.dataset.retrato = cristal ? efeitoRetrato() : "";
    this.element.dataset.temp = game.settings.get(MODULE_ID, "corTemporario") === "dourado" ? "dourado" : "escuro";
    for (const nome of [...this.element.style]) if (nome.startsWith("--cr-")) this.element.style.removeProperty(nome);
    if (cristal) for (const [nome, valor] of Object.entries(varsCristal(context.visual))) this.element.style.setProperty(nome, valor);
    // Botão direito no retrato abre o ajuste (o botão direito dos atalhos continua o nativo).
    this.element.querySelector(".hud-retrato")?.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      event.stopPropagation();
      HudT20.#ajustarRetrato.call(this, event);
    });
    this.#puxarHotbar();
    this.element.dataset.metade = cristal ? String(grupoAtalhos() % 2) : "";
    if (cristal) this.#animarBarras(context);
    this.#vigiarEspaco();
    this.encaixar();
  }

  /** Último valor de cada barra (por ator), para o líquido escorrer ou encher a partir dele. */
  #ultimo = new Map();

  /**
   * Barras de líquido (cristal v2): parte do valor anterior e anima até o novo. No dano, um rastro claro
   * marca o que saiu e some. Sem animação para quem pede menos movimento.
   */
  #animarBarras(context) {
    const reduzir = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const id = this.alvo?.actor?.uuid;
    for (const r of context.recursos) {
      const chave = `${id}:${r.classe}`;
      const antes = this.#ultimo.get(chave);
      this.#ultimo.set(chave, r.pct);
      const cheio = this.element.querySelector(`.hud-trilho .cheio.${r.classe}`);
      const trilho = cheio?.parentElement;
      if (!trilho) continue;
      trilho.classList.toggle("baixo", r.classe === "pv" && r.pct > 0 && r.pct <= 30);
      if (reduzir || antes === undefined || antes === r.pct) continue;
      const sup = trilho.querySelector(".superficie");
      for (const el of [cheio, sup]) if (el) el.style.setProperty("--pct", antes);
      if (r.pct < antes) {
        const rastro = trilho.querySelector(".rastro");
        rastro?.style.setProperty("--de", r.pct);
        rastro?.style.setProperty("--ate", antes);
        rastro?.classList.add("ativo");
      }
      requestAnimationFrame(() => requestAnimationFrame(() => {
        for (const el of [cheio, sup]) if (el) el.style.setProperty("--pct", r.pct);
      }));
    }
  }

  /** Grupos de atalhos (cristal v2): ◀ ▶ na placa. */
  static async #grupoAnterior() {
    await mudarGrupoAtalhos(-1);
  }

  static async #grupoProximo() {
    await mudarGrupoAtalhos(1);
  }

  /** Clique no nome da placa: vira campo de texto; Enter ou sair salva, Esc cancela. Salvo no usuário. */
  static #renomearGrupo(event, alvo) {
    const nome = alvo.closest(".hud-placa")?.querySelector(".nome");
    if (!nome || nome.querySelector("input")) return;
    const g = grupoAtalhos();
    const campo = document.createElement("input");
    campo.type = "text";
    campo.maxLength = 24;
    campo.value = game.user.getFlag(MODULE_ID, "gruposAtalhos")?.[g] ?? "";
    campo.placeholder = t("Atalhos.Padrao", { n: g + 1 });
    nome.replaceChildren(campo);
    campo.focus();
    let feito = false;
    const fechar = async (salvar) => {
      if (feito) return;
      feito = true;
      if (salvar) {
        const texto = campo.value.trim();
        await game.user.update({ [`flags.${MODULE_ID}.gruposAtalhos.${g}`]: texto || null });
      }
      atualizarPlaca();
    };
    campo.addEventListener("keydown", (ev) => {
      ev.stopPropagation(); // as teclas não disparam os atalhos enquanto escreve
      if (ev.key === "Enter") fechar(true);
      else if (ev.key === "Escape") fechar(false);
    });
    campo.addEventListener("blur", () => fechar(true));
  }

  _onClose(options) {
    super._onClose(options);
    this.#observador?.disconnect();
    this.#observador = null;
    this.#devolverHotbar();
  }

  /** Observa o que muda o espaço livre: janela, barra lateral e caixa de mensagem flutuante. */
  #observador = null;

  #vigiarEspaco() {
    if (this.#observador) return;
    this.#observador = new ResizeObserver(() => this.encaixar());
    for (const sel of ["#ui-bottom", "#sidebar", "#chat-notifications"]) {
      const el = document.querySelector(sel);
      if (el) this.#observador.observe(el);
    }
  }

  /**
   * Centraliza o painel no espaço livre de baixo e encolhe se não couber.
   * O espaço livre vai da esquerda de #ui-bottom até a borda da barra lateral
   * ou, se a caixa de mensagem flutuante estiver aparecendo, até ela.
   */
  encaixar() {
    const el = this.element;
    const base = document.getElementById("ui-bottom");
    if (!el?.isConnected || !base) return;
    el.style.setProperty("--hud-t20-x", "0px");
    el.style.setProperty("--hud-t20-encaixe", "1");

    const area = base.getBoundingClientRect();
    let esquerda = area.left + 8;
    let direita = area.right - 8;
    const caixaMsg = document.querySelector("#chat-notifications :is(.chat-form, form, textarea)")?.closest("#chat-notifications > *");
    const rMsg = caixaMsg?.getBoundingClientRect();
    if (rMsg && rMsg.width > 0 && rMsg.height > 0 && rMsg.left < direita && rMsg.bottom > window.innerHeight - 260) {
      direita = Math.min(direita, rMsg.left - 8);
    }

    const painel = el.getBoundingClientRect();
    const livre = Math.max(0, direita - esquerda);
    // A margem de cima (retrato que vaza) não conta na largura; só a largura importa.
    const encaixe = Math.max(0.6, Math.min(1, livre / painel.width));
    const deslocVisual = (esquerda + direita) / 2 - (painel.left + painel.width / 2);
    // Converte px de tela para px CSS do painel (escala de interface do Foundry × tamanho da HUD).
    const escalaPai = base.offsetWidth ? area.width / base.offsetWidth : 1;
    const zoom = Number(game.settings.get(MODULE_ID, "escala")) || 1;
    el.style.setProperty("--hud-t20-x", `${Math.round(deslocVisual / (escalaPai * zoom))}px`);
    el.style.setProperty("--hud-t20-encaixe", encaixe.toFixed(3));
  }

  /** Usa a barra nativa (teclas 1–0, páginas, arrastar da ficha) dentro do painel. */
  #puxarHotbar() {
    const hotbar = ui.hotbar?.element;
    const caixa = this.element.querySelector(".hud-atalhos");
    if (!hotbar || !caixa || caixa.contains(hotbar)) return;
    this.#origemHotbar ??= { pai: hotbar.parentElement, proximo: hotbar.nextElementSibling };
    caixa.append(hotbar);
  }

  #devolverHotbar() {
    const hotbar = ui.hotbar?.element;
    const origem = this.#origemHotbar;
    if (!hotbar || !origem?.pai) return;
    if (origem.proximo?.parentElement === origem.pai) origem.pai.insertBefore(hotbar, origem.proximo);
    else origem.pai.append(hotbar);
    this.#origemHotbar = null;
  }

  static #abrirFicha() {
    this.alvo?.actor.sheet.render(true);
  }

  static #ajustarRetrato(event) {
    event?.stopPropagation?.();
    const actor = this.alvo?.actor;
    if (!actor?.isOwner) return;
    EditorRetrato.abrir(actor);
  }

  /** Evita dois cliques seguidos abrirem duas rolagens. */
  #rolandoIniciativa = false;

  /**
   * Iniciativa clicável:
   * - fora de combate: só o teste no chat;
   * - em combate sem iniciativa: rola e grava (entra no combate se o token não estiver nele);
   * - já rolada: o jogador recebe aviso; o mestre rola de novo.
   * O teste é o do próprio sistema (rollPericia), que respeita a janela de uso e os bônus;
   * a HUD só grava o total no combate certo (o sistema grava em game.combats.active).
   */
  static async #rolarIniciativa(event) {
    const alvo = this.alvo;
    const actor = alvo?.actor;
    if (!actor || this.#rolandoIniciativa) return;
    this.#rolandoIniciativa = true;
    try {
      const ctx = combateParaIniciativa(alvo);
      if (!ctx) {
        await actor.rollPericia("inic", { event, message: true });
        return;
      }
      const { combat } = ctx;
      let combatant = ctx.combatant;
      if (combatant && combatant.initiative !== null && !game.user.isGM) {
        ui.notifications.warn(t("Inic.AvisoJaRolou", { nome: actor.name, n: combatant.initiative }));
        return;
      }
      if (!combatant) {
        combatant = await entrarNoCombate(combat, alvo);
        if (!combatant) return;
      }
      const msg = await actor.rollPericia("inic", { event, message: true });
      const total = msg?.rolls?.[0]?.total;
      if (!Number.isFinite(total)) return; // janela cancelada
      const atual = combat.combatants.get(combatant.id);
      if (atual && atual.initiative !== total) await combat.setInitiative(atual.id, total);
    } catch (err) {
      console.error(`${MODULE_ID} | erro ao rolar a iniciativa`, err);
      ui.notifications.error(t("Inic.Erro"));
    } finally {
      this.#rolandoIniciativa = false;
    }
  }

  static async #alternarAcao(event, target) {
    const chave = target.dataset.acao;
    const emCombate = combateDoAlvo(this.alvo);
    if (!emCombate || !ACOES.includes(chave)) return;
    const atual = gastas(emCombate.combatant);
    await marcarAcoes(emCombate.combatant, { [chave]: !atual[chave] });
  }
}

/* -------------------------------------------- */
/*  Janela: ajustar o retrato da HUD            */
/* -------------------------------------------- */

const limitar = (v, a, b) => Math.min(b, Math.max(a, v));

/** Visuais que um personagem pode ter (0.5.0). "hud" = metal e rubi; o tema da interface é só da mesa. */
const OPCOES_VISUAL = [...TEMAS_CRISTAL]; // 0.7.0: só os cristais

function rotuloVisual(chave) {
  if (chave === "nenhum") return t("Config.VisualNenhum");
  if (chave === "hud" || chave === "tema") return t(chave === "hud" ? "Editor.VisualClassico" : "Config.VisualTema");
  if (eCristal(chave)) return t(`Cristal.${chave}`).replace(/ \(só a HUD\)$/, "");
  const nomes = { tempestade: "Config.VisualTempestade", aventureiro: "Config.VisualAventureiro" };
  return nomes[chave] ? t(nomes[chave]).replace(/ \(só a HUD\)$/, "") : chave;
}

class EditorRetrato extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    classes: ["hud-t20-editor"],
    window: { icon: "fa-solid fa-image-portrait", resizable: false },
    position: { width: 620, height: "auto" },
    actions: {
      escolher: EditorRetrato.#escolher,
      usarFicha: EditorRetrato.#usarFicha,
      centralizar: EditorRetrato.#centralizar,
      salvar: EditorRetrato.#salvar,
      cancelar: EditorRetrato.#cancelar
    }
  };

  static PARTS = {
    editor: { template: `modules/${MODULE_ID}/templates/editor-retrato.hbs` }
  };

  /** Uma janela por personagem: abrir de novo só traz a mesma para frente. */
  static abrir(actor) {
    const id = `hud-t20-retrato-${actor.uuid.replace(/\./g, "-")}`;
    const aberta = foundry.applications.instances.get(id);
    if (aberta) return aberta.bringToFront();
    return new EditorRetrato({ id, actor }).render({ force: true });
  }

  constructor({ actor, ...options } = {}) {
    super(options);
    this.actor = actor;
    const r = retratoDoAtor(actor);
    /** Rascunho: só vai para o ator ao salvar. img "" = imagem da ficha; visual "" = segue a mesa. */
    const visual = actor.getFlag(MODULE_ID, "visual");
    this.rasc = { img: r.propria ? r.img : "", x: r.x, y: r.y, zoom: r.zoom, visual: OPCOES_VISUAL.includes(visual) ? visual : "" };
  }

  get title() {
    return t("Editor.Titulo", { nome: this.actor.name });
  }

  async _prepareContext() {
    return {
      id: this.id,
      img: this.rasc.img || this.actor.img,
      caminho: this.rasc.img,
      fichaImg: this.actor.img,
      zoomMin: 1,
      zoomMax: 3,
      zoom: this.rasc.zoom,
      zoomTxt: `${Math.round(this.rasc.zoom * 100)}%`,
      estilo: this.#estilo(),
      opcoesVisual: [
        { valor: "", rotulo: t("Editor.VisualMesa", { nome: rotuloVisual(visualEscolhido()) }) },
        ...OPCOES_VISUAL.map((valor) => ({ valor, rotulo: rotuloVisual(valor) }))
      ].map((o) => ({ ...o, sel: o.valor === this.rasc.visual })),
      txt: {
        visual: t("Editor.Visual"),
        visualDica: t("Editor.VisualDica"),
        palco: t("Editor.Palco"),
        dicaPalco: t("Editor.DicaPalco"),
        imagem: t("Editor.Imagem"),
        escolher: t("Editor.Escolher"),
        usarFicha: t("Editor.UsarFicha"),
        zoom: t("Editor.Zoom"),
        menos: t("Editor.Menos"),
        mais: t("Editor.Mais"),
        centralizar: t("Editor.Centralizar"),
        previa: t("Editor.Previa"),
        previaDica: t("Editor.PreviaDica"),
        nota: t("Editor.Nota"),
        cancelar: t("Editor.Cancelar"),
        salvar: t("Editor.Salvar")
      }
    };
  }

  #estilo() {
    return `--px:${this.rasc.x}%;--py:${this.rasc.y}%;--pz:${this.rasc.zoom}`;
  }

  /** Atualiza as imagens sem redesenhar a janela (o arrasto fica liso). */
  #sincronizar() {
    const el = this.element;
    if (!el) return;
    const src = this.rasc.img || this.actor.img;
    for (const img of el.querySelectorAll(".hud-t20-enq")) {
      if (img.getAttribute("src") !== src) img.setAttribute("src", src);
      img.style.setProperty("--px", `${this.rasc.x}%`);
      img.style.setProperty("--py", `${this.rasc.y}%`);
      img.style.setProperty("--pz", this.rasc.zoom);
    }
    const faixa = el.querySelector("input[name=zoom]");
    if (faixa) faixa.value = this.rasc.zoom;
    const saida = el.querySelector("output.zoom-valor");
    if (saida) saida.textContent = `${Math.round(this.rasc.zoom * 100)}%`;
    const campo = el.querySelector("input[name=img]");
    if (campo && document.activeElement !== campo) campo.value = this.rasc.img;
    this.#previaVisual();
  }

  /** Prévia do retrato no visual escolhido: moldura clássica ou, nos temas de cristal, a máscara e o vidro. */
  #previaVisual() {
    const previa = this.element?.querySelector(".retrato-previa");
    if (!previa) return;
    const visual = this.rasc.visual ? visualDaHud({ getFlag: () => this.rasc.visual }) : visualDaHud();
    const m = MEDIDAS_CRISTAL[visual];
    const cristal = eCristal(visual) && !!m;
    previa.classList.toggle("cristal", cristal);
    previa.dataset.visual = visual;
    if (!cristal) {
      previa.style.removeProperty("aspect-ratio");
      return;
    }
    const [W, H] = m.moldura_px;
    previa.style.aspectRatio = `${(m.retrato[2] * W).toFixed(1)} / ${(m.retrato[3] * H).toFixed(1)}`;
    const abertura = previa.querySelector(".abertura");
    const mascara = `url("modules/${MODULE_ID}/assets/temas/${visual}/mascara-retrato.png")`;
    abertura.style.maskImage = mascara;
    abertura.style.webkitMaskImage = mascara;
    previa.dataset.retrato = efeitoRetrato();
    previa.querySelector(".hud-vidro")?.setAttribute("src", arte("cristal", visual));
    previa.querySelector(".hud-facetas")?.setAttribute("src", arte("facetas", visual));
  }

  #mudarZoom(delta) {
    this.rasc.zoom = Math.round(limitar(this.rasc.zoom + delta, 1, 3) * 100) / 100;
    this.#sincronizar();
  }

  async _onRender(context, options) {
    await super._onRender(context, options);
    const el = this.element;
    const palco = el.querySelector(".palco");

    el.querySelector("input[name=zoom]")?.addEventListener("input", (ev) => {
      this.rasc.zoom = Number(ev.target.value);
      this.#sincronizar();
    });
    el.querySelector("select[name=visual]")?.addEventListener("change", (ev) => {
      this.rasc.visual = ev.target.value;
      this.#previaVisual();
    });
    this.#previaVisual();
    // Caminho digitado à mão (jogador sem permissão de navegar nos arquivos).
    el.querySelector("input[name=img]")?.addEventListener("change", (ev) => {
      this.rasc.img = ev.target.value.trim();
      this.#sincronizar();
    });
    el.querySelector("[data-zoom=menos]")?.addEventListener("click", () => this.#mudarZoom(-0.1));
    el.querySelector("[data-zoom=mais]")?.addEventListener("click", () => this.#mudarZoom(0.1));

    if (!palco) return;
    let arrasto = null;
    palco.addEventListener("pointerdown", (ev) => {
      if (ev.button !== 0) return;
      arrasto = { x: ev.clientX, y: ev.clientY, ox: this.rasc.x, oy: this.rasc.y };
      palco.setPointerCapture(ev.pointerId);
    });
    palco.addEventListener("pointermove", (ev) => {
      if (!arrasto) return;
      // Mesma sensibilidade do protótipo aprovado: com mais zoom, o arrasto anda menos.
      const k = 100 / (palco.clientWidth * 0.88) / Math.max(0.35, this.rasc.zoom - 0.6);
      this.rasc.x = Math.round(limitar(arrasto.ox - (ev.clientX - arrasto.x) * k, 0, 100) * 10) / 10;
      this.rasc.y = Math.round(limitar(arrasto.oy - (ev.clientY - arrasto.y) * k, 0, 100) * 10) / 10;
      this.#sincronizar();
    });
    const soltar = () => (arrasto = null);
    palco.addEventListener("pointerup", soltar);
    palco.addEventListener("pointercancel", soltar);
    palco.addEventListener("wheel", (ev) => {
      ev.preventDefault();
      this.#mudarZoom(-Math.sign(ev.deltaY) * 0.1);
    }, { passive: false });
    palco.addEventListener("keydown", (ev) => {
      const p = ev.shiftKey ? 10 : 3;
      const r = this.rasc;
      const mapa = {
        ArrowLeft: () => (r.x = limitar(r.x - p, 0, 100)),
        ArrowRight: () => (r.x = limitar(r.x + p, 0, 100)),
        ArrowUp: () => (r.y = limitar(r.y - p, 0, 100)),
        ArrowDown: () => (r.y = limitar(r.y + p, 0, 100)),
        "+": () => this.#mudarZoom(0.1),
        "=": () => this.#mudarZoom(0.1),
        "-": () => this.#mudarZoom(-0.1)
      };
      if (!mapa[ev.key]) return;
      ev.preventDefault();
      ev.stopPropagation();
      mapa[ev.key]();
      this.#sincronizar();
    });
    if (options.isFirstRender) palco.focus();
  }

  static #escolher() {
    const FP = foundry.applications.apps.FilePicker.implementation;
    new FP({
      type: "image",
      current: this.rasc.img || this.actor.img,
      callback: (caminho) => {
        Object.assign(this.rasc, { img: caminho, x: 50, y: 50, zoom: 1 });
        this.#sincronizar();
      }
    }).render({ force: true });
  }

  static #usarFicha() {
    Object.assign(this.rasc, { img: "", x: 50, y: 50, zoom: 1 });
    this.#sincronizar();
  }

  static #centralizar() {
    Object.assign(this.rasc, { x: 50, y: 50 });
    this.#sincronizar();
  }

  static async #salvar() {
    const { img, x, y, zoom, visual } = this.rasc;
    try {
      await this.actor.update({
        [`flags.${MODULE_ID}.retrato`]: { img, x, y, zoom },
        // 0.5.0: visual próprio do personagem ("" = segue a mesa: apaga a flag).
        ...(visual ? { [`flags.${MODULE_ID}.visual`]: visual } : { [`flags.${MODULE_ID}.-=visual`]: null })
      });
      ui.notifications.info(t("Editor.Salvo"));
      this.close();
    } catch (err) {
      console.error(`${MODULE_ID} | não consegui salvar o retrato`, err);
      ui.notifications.error(t("Editor.ErroSalvar"));
    }
  }

  static #cancelar() {
    this.close();
  }
}

/* -------------------------------------------- */
/*  Controle: abrir, atualizar, esconder        */
/* -------------------------------------------- */

let hud = null;

const atualizar = foundry.utils.debounce(() => {
  if (!hud) return;
  let alvo = game.settings.get(MODULE_ID, "mostrar") ? alvoDaHud() : null;
  // 0.7.0: "Sem HUD" (do jogador ou da mesa, sem visual próprio do personagem) = barra padrão do Foundry.
  if (alvo && visualDaHud(alvo.actor) === "nenhum") alvo = null;
  hud.alvo = alvo;
  if (!alvo) {
    if (hud.rendered) hud.close({ animate: false });
    return;
  }
  hud.render({ force: true });
}, 60);

/** Só redesenha se a mudança for do personagem mostrado. */
function seForDoAlvo(actor) {
  if (!hud?.alvo || !actor) return;
  if (actor === hud.alvo.actor || actor.id === hud.alvo.actor.id) atualizar();
}

/* -------------------------------------------- */
/*  Gasto automático das ações                  */
/* -------------------------------------------- */

/**
 * O sistema não tem hook de "usou item": item.roll() termina numa mensagem com
 * flags.tormenta20.itemData = item.system. Só o cliente que criou a mensagem grava.
 */
async function gastarPorMensagem(message, options, userId) {
  if (userId !== game.user.id) return;
  const itemData = message.getFlag("tormenta20", "itemData");
  if (!itemData) return;
  const actor = ChatMessage.getSpeakerActor(message.speaker);
  if (!actor) return;

  const execucao = itemData.ativacao?.execucao ?? "";
  let chaves = GASTO_POR_EXECUCAO[execucao];
  const temAtaque = Array.isArray(itemData.rolls) && itemData.rolls.some((r) => r?.type === "ataque");
  if (!chaves && !execucao && temAtaque) chaves = ["padrao"];
  if (!chaves) return;

  const alvo = { actor, token: null };
  const emCombate = combateDoAlvo(alvo);
  if (!emCombate) return;
  const atual = gastas(emCombate.combatant);
  const jaGastas = chaves.filter((c) => atual[c]);
  for (const c of jaGastas) {
    ui.notifications.warn(t("Acao.JaGasta", { acao: t(`Acao.${c}`), nome: actor.name }));
  }
  await marcarAcoes(emCombate.combatant, Object.fromEntries(chaves.map((c) => [c, true])));
}

/**
 * Recarga: padrão e movimento no início do turno do personagem; reação no início da rodada.
 * Voltar o turno (botão "anterior") não recarrega nada.
 */
async function recarregar(combat, prior, current) {
  const avancou =
    current.round > (prior.round ?? 0) || (current.round === prior.round && current.turn > (prior.turn ?? -1));
  if (!avancou) return;
  const novaRodada = current.round > (prior.round ?? 0);
  const daVez = combat.combatants.get(current.combatantId) ?? combat.combatant;

  for (const c of combat.combatants) {
    const mudancas = {};
    if (novaRodada) mudancas.reacao = false;
    if (c === daVez) Object.assign(mudancas, { padrao: false, movimento: false });
    if (!Object.keys(mudancas).length || !souResponsavel(c)) continue;
    const atual = gastas(c);
    if (Object.entries(mudancas).every(([k, v]) => atual[k] === v)) continue;
    try {
      await c.update({ [`flags.${MODULE_ID}.gastas`]: { ...atual, ...mudancas } });
    } catch (err) {
      console.error(`${MODULE_ID} | não consegui recarregar as ações de ${c.name}`, err);
    }
  }
}

/* -------------------------------------------- */
/*  Tema da interface (0.3.0)                   */
/* -------------------------------------------- */

/** Módulos cujos cartões ficam como estão: o tema só veste o cabeçalho e o emblema. */
const MODULOS_EXTERNOS = ["decreto-do-panteao", "bando-da-raposa"];

const temaLigado = () => visualEscolhido() === "tema";

/** Liga ou desliga o tema: só a classe no body (styles/tema.css). Não precisa recarregar. */
function aplicarVisual() {
  document.body.classList.toggle("hud-t20-tema", game.system.id === "tormenta20" && temaLigado());
}

/**
 * Veste o cabeçalho da mensagem: emblema redondo do autor e o nome do jogador embaixo do nome.
 * As peças entram sempre (o CSS esconde sem o tema), para o tema ligar e desligar sem redesenhar o chat.
 * Só decoração: não mexe no conteúdo nem nos botões dos cartões.
 */
function vestirMensagem(message, html) {
  const header = html.querySelector(".message-header");
  if (!header || header.querySelector(".hud-t20-emblema")) return;

  if (MODULOS_EXTERNOS.some((id) => message.flags?.[id])) html.classList.add("hud-t20-externo");

  const autor = message.author;
  const ator = message.speakerActor;
  const nome = message.alias || ator?.name || autor?.name || "?";
  let img = ator?.img || autor?.avatar || "";
  if (img === CONST.DEFAULT_TOKEN || img.endsWith("mystery-man.svg")) img = "";

  const emblema = document.createElement("div");
  emblema.className = "hud-t20-emblema";
  emblema.setAttribute("aria-hidden", "true");
  const rosto = document.createElement("span");
  rosto.className = "hud-t20-emblema-rosto";
  rosto.style.setProperty("--hud-t20-cor", autor?.color?.css ?? String(autor?.color ?? "#555"));
  if (img) rosto.style.backgroundImage = `url("${img}")`;
  else rosto.textContent = nome.trim().charAt(0).toUpperCase();
  const moldura = document.createElement("img");
  moldura.className = "hud-t20-emblema-moldura";
  moldura.src = `modules/${MODULE_ID}/assets/emblema.webp`;
  moldura.alt = "";
  emblema.append(rosto, moldura);
  header.prepend(emblema);

  // Nome do jogador embaixo do nome do personagem (só quando é diferente).
  const remetente = header.querySelector(".message-sender");
  if (remetente && autor && autor.name !== nome && !remetente.querySelector(".hud-t20-jogador")) {
    const jogador = document.createElement("small");
    jogador.className = "hud-t20-jogador";
    jogador.textContent = autor.name;
    remetente.append(jogador);
  }

  // O cabeçalho tem altura fixa: "Sussurro para…" e o texto de sabor vão para o começo do corpo.
  if (temaLigado()) {
    const conteudo = html.querySelector(".message-content");
    const extras = [...header.querySelectorAll(":scope > .whisper-to, :scope > .flavor-text")];
    if (conteudo && extras.length) conteudo.prepend(...extras);
  }
}

/* -------------------------------------------- */
/*  Hooks                                       */
/* -------------------------------------------- */

Hooks.once("init", () => {
  game.settings.register(MODULE_ID, "visual", {
    name: "HUDT20.Config.Visual",
    hint: "HUDT20.Config.VisualDica",
    scope: "world",
    config: true,
    type: String,
    // 0.7.0: só "Sem HUD" e os temas de cristal (os visuais antigos saíram; valor antigo guardado = sem HUD).
    choices: {
      nenhum: "HUDT20.Config.VisualNenhum",
      ...Object.fromEntries(TEMAS_CRISTAL.map((k) => [k, `HUDT20.Cristal.${k}`]))
    },
    default: "nenhum",
    onChange: () => {
      aplicarVisual();
      atualizar();
    }
  });
  // 0.5.0: cada jogador pode escolher o próprio visual (inclusive "só a HUD" × "HUD e tema da interface").
  game.settings.register(MODULE_ID, "visualMeu", {
    name: "HUDT20.Config.VisualMeu",
    hint: "HUDT20.Config.VisualMeuDica",
    scope: "client",
    config: true,
    type: String,
    choices: {
      "": "HUDT20.Config.VisualMeuMesa",
      nenhum: "HUDT20.Config.VisualNenhum",
      ...Object.fromEntries(TEMAS_CRISTAL.map((k) => [k, `HUDT20.Cristal.${k}`]))
    },
    default: "",
    onChange: () => {
      aplicarVisual();
      atualizar();
    }
  });
  // 0.8.0: tela de morte no retrato (temas de cristal).
  game.settings.register(MODULE_ID, "morte", {
    name: "HUDT20.Config.Morte",
    hint: "HUDT20.Config.MorteDica",
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
    onChange: () => atualizar()
  });
  game.settings.register(MODULE_ID, "morteFrases", {
    name: "HUDT20.Config.MorteFrases",
    hint: "HUDT20.Config.MorteFrasesDica",
    scope: "world",
    config: true,
    type: String,
    default: FRASES_MORTE_PADRAO,
    onChange: () => {
      frasesSorteadas.clear();
      atualizar();
    }
  });
  // 0.7.1: cor do PV/PM temporário, escolha de cada jogador.
  game.settings.register(MODULE_ID, "corTemporario", {
    name: "HUDT20.Config.CorTemporario",
    hint: "HUDT20.Config.CorTemporarioDica",
    scope: "client",
    config: true,
    type: String,
    choices: { escuro: "HUDT20.Config.CorTempEscuro", dourado: "HUDT20.Config.CorTempDourado" },
    default: "escuro",
    onChange: () => atualizar()
  });
  // 0.5.0: o cristal do retrato não é obrigatório; cada jogador escolhe.
  game.settings.register(MODULE_ID, "retratoCristal", {
    name: "HUDT20.Config.RetratoCristal",
    hint: "HUDT20.Config.RetratoCristalDica",
    scope: "client",
    config: true,
    type: String,
    choices: {
      vidro: "HUDT20.Config.RetratoVidro",
      suave: "HUDT20.Config.RetratoSuave",
      nenhum: "HUDT20.Config.RetratoNenhum"
    },
    default: "vidro",
    onChange: () => atualizar()
  });
  game.settings.register(MODULE_ID, "mostrar", {
    name: "HUDT20.Config.Mostrar",
    hint: "HUDT20.Config.MostrarDica",
    scope: "client",
    config: true,
    type: Boolean,
    default: true,
    onChange: () => atualizar()
  });
  game.settings.register(MODULE_ID, "escala", {
    name: "HUDT20.Config.Escala",
    hint: "HUDT20.Config.EscalaDica",
    scope: "client",
    config: true,
    type: Number,
    range: { min: 0.6, max: 1.4, step: 0.05 },
    default: 1,
    onChange: () => atualizar()
  });
});

Hooks.once("setup", () => aplicarVisual());
// Cristal v2: trocar a página da barra (pelo Foundry ou pelo teclado) atualiza o nome da placa.
Hooks.on("renderHotbar", () => atualizarPlaca());

/** Medidas dos temas de cristal (0.5.0). Sem elas, o tema não tem onde pôr as peças: volta ao clássico. */
Hooks.once("setup", async () => {
  try {
    MEDIDAS_CRISTAL = await foundry.utils.fetchJsonWithTimeout(`modules/${MODULE_ID}/assets/temas/cristal-medidas.json`);
  } catch (err) {
    console.error(`${MODULE_ID} | não consegui ler as medidas dos temas de cristal`, err);
  }
  atualizar();
});
Hooks.on("renderChatMessageHTML", (message, html) => {
  if (game.system.id === "tormenta20") vestirMensagem(message, html);
});

Hooks.once("ready", () => {
  if (game.system.id !== "tormenta20") return;
  hud = new HudT20();

  for (const nome of ["canvasReady", "controlToken", "updateUser"]) Hooks.on(nome, () => atualizar());
  Hooks.on("updateActor", (actor) => seForDoAlvo(actor));
  for (const nome of ["createActiveEffect", "updateActiveEffect", "deleteActiveEffect", "createItem", "updateItem", "deleteItem"]) {
    Hooks.on(nome, (doc) => seForDoAlvo(doc.parent instanceof Actor ? doc.parent : doc.parent?.parent));
  }
  Hooks.on("updateToken", (tokenDoc) => seForDoAlvo(tokenDoc.actor));
  for (const nome of ["combatStart", "updateCombat", "deleteCombat", "createCombatant", "updateCombatant", "deleteCombatant"]) {
    Hooks.on(nome, () => atualizar());
  }
  Hooks.on("combatTurnChange", recarregar);
  // Abrir, fechar ou trocar a aba da barra lateral muda o espaço livre embaixo.
  for (const nome of ["collapseSidebar", "changeSidebarTab"]) {
    Hooks.on(nome, () => requestAnimationFrame(() => hud?.encaixar()));
  }
  window.addEventListener("resize", () => hud?.encaixar());
  Hooks.on("createChatMessage", gastarPorMensagem);

  atualizar();
});
