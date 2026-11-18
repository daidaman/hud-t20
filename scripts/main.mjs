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

const t = (chave, dados) => (dados ? game.i18n.format(`HUDT20.${chave}`, dados) : game.i18n.localize(`HUDT20.${chave}`));
const comSinal = (n) => (n > 0 ? `+${n}` : `${n}`);

/* -------------------------------------------- */
/*  Personagem e combate                        */
/* -------------------------------------------- */

/**
 * De quem é a HUD (proposta da pendência 3):
 * jogador → o próprio personagem (ou, sem personagem, o token dele selecionado);
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
  if (controlado?.actor?.isOwner) return { actor: controlado.actor, token: controlado.document };
  return null;
}

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

/** Monta as linhas e fecha a conta com "Outros modificadores" se faltar algo. */
function fecharConta(linhas, total, { formatar = comSinal, primeiraSemSinal = false } = {}) {
  const soma = linhas.reduce((s, l) => s + (Number.isFinite(l.n) ? l.n : 0), 0);
  const diff = Math.round((total - soma) * 100) / 100;
  const saida = linhas
    .filter((l) => l.n !== 0 || l.sempre)
    .map((l, i) => ({ rot: l.rot, val: l.txt ?? (i === 0 && primeiraSemSinal ? String(l.n) : formatar(l.n)) }));
  if (diff) saida.push({ rot: t("OutrosMods"), val: formatar(diff) });
  return saida;
}

function bonusEmLinhas(bonus, rollData) {
  return (bonus ?? []).map((b) => {
    const n = avaliar(b, rollData);
    return n === null ? null : { rot: t("Bonus"), n };
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

  const linhas = [{ rot: t("Base"), n: def.base ?? 10, sempre: true }];
  if (actor.type === "character" && configT20("progressiveDefense")) linhas.push({ rot: t("MetadeNivel"), n: meioNivel });
  if (armadura?.system.tipo === "pesada") {
    const limitado = Math.clamp(valorAtr, 0, armadura.system.armadura?.maxAtr ?? 0);
    linhas.push({ rot: rotuloAtributo(def.atributo), n: limitado });
  } else {
    linhas.push({ rot: rotuloAtributo(def.atributo), n: valorAtr, sempre: true });
  }
  if (armadura) linhas.push({ rot: t("Armadura", { nome: armadura.name }), n: armadura.system.armadura?.value ?? 0 });
  if (escudo) linhas.push({ rot: t("Escudo", { nome: escudo.name }), n: escudo.system.armadura?.value ?? 0 });
  const acc = acessorios.reduce((s, i) => s + (i.system.armadura?.value ?? 0), 0);
  if (acc) linhas.push({ rot: t("Acessorios"), n: acc });
  linhas.push(...bonusEmLinhas(def.bonus, rollData));
  if (def.outros) linhas.push({ rot: t("Outros"), n: def.outros });
  if (def.condi) linhas.push({ rot: t("Condicoes"), n: def.condi });

  return {
    rotulo: t("Defesa"),
    icone: "ic-defesa.webp",
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
    icone: "ic-desloc.webp",
    valor: `${valor} ${unidade}`,
    linhas: fecharConta(linhas, valor, { formatar: fmt })
  };
}

function statIniciativa(actor, rollData) {
  const sys = actor.system;
  const inic = sys.pericias?.inic ?? {};
  const meioNivel = Math.floor((sys.attributes.nivel?.value ?? 0) / 2);
  const treino = Number(rollData.treino ?? sys.attributes?.treino ?? 0) || 0;
  const linhas = [
    { rot: t("MetadeNivel"), n: meioNivel },
    { rot: rotuloAtributo(inic.atributo), n: sys.atributos?.[inic.atributo]?.value ?? 0, sempre: true }
  ];
  if (inic.treinado) linhas.push({ rot: t("Treino"), n: treino });
  linhas.push(...bonusEmLinhas(inic.bonus, rollData));
  if (inic.outros) linhas.push({ rot: t("Outros"), n: inic.outros });
  if (inic.condi) linhas.push({ rot: t("Condicoes"), n: inic.condi });
  const valor = inic.value ?? 0;
  return { rotulo: t("Iniciativa"), icone: "ic-iniciativa.webp", valor: comSinal(valor), linhas: fecharConta(linhas, valor) };
}

function statCD(actor) {
  const sys = actor.system;
  const magias = actor.itemTypes?.magia ?? [];
  const chave = sys.attributes?.conjuracao;
  if (!magias.length || !chave) {
    return { rotulo: t("CD"), icone: "ic-cd.webp", valor: "—", linhas: [{ rot: t("SemMagias"), val: "" }] };
  }
  const meioNivel = Math.floor((sys.attributes.nivel?.value ?? 0) / 2);
  const atr = sys.atributos?.[chave]?.value ?? 0;
  const base = (sys.attributes.cd ?? 10 + meioNivel) - meioNivel;
  const valor = base + meioNivel + atr;
  const linhas = fecharConta(
    [
      { rot: t("Base"), n: base, sempre: true },
      { rot: t("MetadeNivel"), n: meioNivel },
      { rot: t("AtributoChave", { atributo: rotuloAtributo(chave) }), n: atr, sempre: true }
    ],
    valor,
    { primeiraSemSinal: true }
  );
  const extra = Math.max(0, ...magias.map((m) => Number(m.system.resistencia?.bonus) || 0));
  if (extra) linhas.push({ rot: t("BonusAlgumasMagias", { n: extra }), val: "" });
  return { rotulo: t("CD"), icone: "ic-cd.webp", valor: String(valor), linhas };
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

function condicoesDoAtor(actor) {
  return actor.temporaryEffects
    .filter((e) => e.active && (e.statuses?.size || e.getFlag("tormenta20", "condition")))
    .map((e) => {
      const linhas = e.changes
        .filter((c) => c.value !== "" && c.value !== undefined)
        .map((c) => {
          const n = Number(c.value);
          return { rot: rotuloMudanca(c.key), val: Number.isFinite(n) ? comSinal(n) : String(c.value) };
        });
      if (!linhas.length) linhas.push({ rot: t("SemEfeitoNumerico"), val: "" });
      return { nome: e.name, img: e.img, linhas };
    });
}

function recurso(rotulo, dados, classe) {
  const value = Number(dados?.value) || 0;
  const max = Number(dados?.max) || 0;
  const pct = max > 0 ? Math.clamp(Math.round((value / max) * 100), 0, 100) : 0;
  return { rotulo, value, max, pct, temp: Number(dados?.temp) || 0, classe };
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
      acao: HudT20.#alternarAcao
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

    return {
      ator: { nome: actor.name, img: actor.img, nivelTxt: t("Nivel", { nivel }) },
      rotuloFicha: t("AbrirFicha", { nome: actor.name }),
      rotuloTotal: t("Total"),
      recursos: [recurso(t("PV"), sys.attributes?.pv, "pv"), recurso(t("PM"), sys.attributes?.pm, "pm")],
      stats: [statDefesa(actor, rollData), statDeslocamento(actor, rollData), statIniciativa(actor, rollData), statCD(actor)],
      condicoes: condicoesDoAtor(actor),
      combate: !!emCombate,
      podeMarcar: !!emCombate?.combatant.canUserModify(game.user, "update"),
      acoes: ACOES.map((chave) => {
        const acao = t(`Acao.${chave}`);
        const estado = g[chave] ? t("Acao.Gasta") : t("Acao.Disponivel");
        return { chave, meio: chave === "movimento", gasta: g[chave], dica: t("Acao.Dica", { acao, estado }) };
      }),
      vez,
      legendaGema: vez ? t("Turno.Seu") : t("Turno.Aguardando")
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
    this.#puxarHotbar();
    this.#vigiarEspaco();
    this.encaixar();
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

  static async #alternarAcao(event, target) {
    const chave = target.dataset.acao;
    const emCombate = combateDoAlvo(this.alvo);
    if (!emCombate || !ACOES.includes(chave)) return;
    const atual = gastas(emCombate.combatant);
    await marcarAcoes(emCombate.combatant, { [chave]: !atual[chave] });
  }
}

/* -------------------------------------------- */
/*  Controle: abrir, atualizar, esconder        */
/* -------------------------------------------- */

let hud = null;

const atualizar = foundry.utils.debounce(() => {
  if (!hud) return;
  const alvo = game.settings.get(MODULE_ID, "mostrar") ? alvoDaHud() : null;
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
/*  Hooks                                       */
/* -------------------------------------------- */

Hooks.once("init", () => {
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
