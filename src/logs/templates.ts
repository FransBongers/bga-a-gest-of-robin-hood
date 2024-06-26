/* ------- DEFAULT LOG TOKENS ------- */

const tlpLogTokenBoldText = ({
  text,
  tooltipId,
}: {
  text: string;
  tooltipId?: string;
}) =>
  `<span ${tooltipId ? `id="${tooltipId}"` : ''} style="font-weight: 700;">${_(
    text
  )}</span>`;

const tplLogTokenPlayerName = ({
  name,
  color,
}: {
  name: string;
  color: string;
}) => `<span class="playername" style="color:#${color};">${name}</span>`;

/* ------- GAME SPECIFIC LOG TOKENS ------- */

const tplLogTokenCard = (id: string) => {
  return `<div class="gest_log_card gest_card" data-card-id="${id}"></div>`;
};

const tplLogTokenDieResult = (dieResult: string) => {
  const [color, result] = dieResult.split(':');

  return `<div class="gest_log_die" data-die-color="${color}"><span class="gest_log_die_value">${
    Number(result) > 0 ? '+' : ''
  }${result}</span></div>`;
};
