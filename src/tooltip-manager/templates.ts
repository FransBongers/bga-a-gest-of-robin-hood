const tplCardTooltipContainer = ({ card, content }: { card: string; content: string }): string => {
  return `<div class="gest_card_tooltip">
  <div class="gest_card_tooltip_inner_container">
    ${content}
  </div>
  ${card}
</div>`;
};
