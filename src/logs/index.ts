const LOG_TOKEN_BOLD_TEXT = 'boldText';
const LOG_TOKEN_BOLD_ITALIC_TEXT = 'boldItalicText';
const LOG_TOKEN_NEW_LINE = 'newLine';
const LOG_TOKEN_PLAYER_NAME = 'playerName';
// Game specific
const LOG_TOKEN_CAMP = 'camp';
const LOG_TOKEN_CARD = 'card';
const LOG_TOKEN_CARD_NAME = 'cardName';
const LOG_TOKEN_CARRIAGE = 'carriage';
const LOG_TOKEN_DIE_RESULT = 'dieResult';
const LOG_TOKEN_FORCE = 'force';
const LOG_TOKEN_HENCHMAN = 'henchman';
const LOG_TOKEN_MERRY_MEN = 'merryMan';
const LOG_TOKEN_SHILLING = 'shilling';
const LOG_TOKEN_TRAVELLER_BACK = 'travellerBack';

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
    case LOG_TOKEN_BOLD_ITALIC_TEXT:
      return tlpLogTokenBoldText({ text: value, italic: true });
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
    case LOG_TOKEN_DIE_RESULT:
      return tplLogTokenDieResult(value);
    case LOG_TOKEN_CAMP:
    case LOG_TOKEN_FORCE:
    case LOG_TOKEN_CARRIAGE:
    case LOG_TOKEN_HENCHMAN:
    case LOG_TOKEN_MERRY_MEN:
      return tplLogTokenForce(value);
    case LOG_TOKEN_NEW_LINE:
      return '<br>';
    case LOG_TOKEN_SHILLING:
      return tplLogTokenShilling();
    case LOG_TOKEN_PLAYER_NAME:
      const player = game.playerManager
        .getPlayers()
        .find((player) => player.getName() === value);
      return player
        ? tplLogTokenPlayerName({
            name: player.getName(),
            color: player.getColor(),
          })
        : value;
    case LOG_TOKEN_TRAVELLER_BACK:
      return tplLogTokenCard(value, undefined, 'gest_traveller_back_log');
    default:
      return value;
  }
};
