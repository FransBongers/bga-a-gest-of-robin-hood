/* ------- DEFAULT LOG TOKENS ------- */

const tlpLogTokenBoldText = ({
  text,
  tooltipId,
  italic = false,
}: {
  text: string;
  tooltipId?: string;
  italic?: boolean;
}) =>
  `<span ${tooltipId ? `id="${tooltipId}" class="log_tooltip"` : ''} style="font-weight: 700;${
    italic ? ' font-style: italic;' : ''
  }">${_(text)}</span>`;

const tplLogTokenPlayerName = ({
  name,
  color,
}: {
  name: string;
  color: string;
}) => `<span class="playername" style="color:#${color};">${name}</span>`;

/* ------- GAME SPECIFIC LOG TOKENS ------- */

const tplLogTokenCard = (cardId: string, nodeId?: string, extraClasses?: string,) => {
  return `<div ${
    nodeId ? `id="${nodeId}"` : ''
  } class="gest_log_card gest_card gest_card_side${extraClasses ? ` ${extraClasses}` : ''}" data-card-id="${cardId}"></div>`;
};

const tplLogTokenDieResult = (dieResult: string) => {
  const [color, result] = dieResult.split(':');

  return `<div class="gest_log_die" data-die-color="${color}"><span class="gest_log_die_value">${
    Number(result) > 0 ? '+' : ''
  }${result}</span></div>`;
};

const tplLogTokenForce = (forceInfo: string) => {
  const [side, type] = forceInfo.split(':');
  return `<div class="gest_force_side gest_log_token" data-revealed="${
    side === 'revealed'
  }" data-type="${type}"></div>`;
};

const tplLogTokenShilling = (): string =>
  '<div class="gest_log_token gest_icon" data-icon="shilling"></div>';
