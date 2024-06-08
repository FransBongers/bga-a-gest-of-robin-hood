const LOG_TOKEN_BOLD_TEXT = 'boldText';
const LOG_TOKEN_NEW_LINE = 'newLine';
// const LOG_TOKEN_PLAYER_NAME = "playerName";
// Game specific
const LOG_TOKEN_CARD = 'card';
const LOG_TOKEN_CARD_NAME = "cardName";

let tooltipIdCounter = 0;

const getTokenDiv = ({
  key,
  value,
  game,
}: {
  key: string;
  value: string;
  game: AGestOfRobinHoodGame;
}) => {
  const splitKey = key.split('_');
  const type = splitKey[1];
  switch (type) {
    case LOG_TOKEN_BOLD_TEXT:
      return tlpLogTokenBoldText({ text: value });
    case LOG_TOKEN_CARD:
      return tplLogTokenCard(value);
    case LOG_TOKEN_CARD_NAME:
      let cardNameTooltipId = undefined;
      const withTooltip = value.includes(':');
      if (withTooltip) {
        cardNameTooltipId = `gest_tooltip_${game._last_tooltip_id}`;
        game.tooltipsToMap.push([game._last_tooltip_id, value.split(':')[0]]);
        game._last_tooltip_id++;
      }
      return tlpLogTokenBoldText({
        text: withTooltip ? value.split(':')[1] : value,
        tooltipId: cardNameTooltipId,
      });
    case LOG_TOKEN_NEW_LINE:
      return '<br>';
    default:
      return value;
  }
};
