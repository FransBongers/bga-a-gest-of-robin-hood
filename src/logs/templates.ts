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
