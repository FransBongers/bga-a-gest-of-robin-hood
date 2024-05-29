const LOG_TOKEN_BOLD_TEXT = "boldText";
const LOG_TOKEN_NEW_LINE = "newLine";
// const LOG_TOKEN_PLAYER_NAME = "playerName";
// Game specific
const LOG_TOKEN_CARD = "card";

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
  const splitKey = key.split("_");
  const type = splitKey[1];
  switch (type) {
    case LOG_TOKEN_BOLD_TEXT:
      return tlpLogTokenBoldText({ text: value });
    case LOG_TOKEN_CARD:
      return tplLogTokenCard(value);
    case LOG_TOKEN_NEW_LINE:
      return "<br>";
    default:
      return value;
  }
};
