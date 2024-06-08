const tplCardTooltipContainer = ({
  card,
  content,
}: {
  card: string;
  content: string;
}): string => {
  return `<div class="gest_card_tooltip">
  <div class="gest_card_tooltip_inner_container">
    ${content}
  </div>
  ${card}
</div>`;
};

const tplTableauCardTooltip = ({
  card,
  game,
  imageOnly = false,
}: {
  card: GestCardStaticData;
  game: AGestOfRobinHoodGame;
  imageOnly?: boolean;
}) => {
  const cardHtml = `<div class="gest_card" data-card-id="${
    card.id.split('_')[0]
  }"></div>`;
  if (imageOnly) {
    return `<div style="--gestCardScale: 1.7;">${cardHtml}</div>`;
  }
  // const dataCardId = card.id.split('_')[0];
  // console.log('dataCardId',dataCardId);
  return tplCardTooltipContainer({
    card: cardHtml,
    content: `
    <span class="gest_title">${_(card.title)}</span>
    <span>${
      card.type === 'travellerCard'
        ? game.format_string_recursive(_('Strength: ${strength}'), {
            strength: card.strength,
          })
        : game.format_string_recursive(_('Carriages: ${carriages}'), {
            carriages: card.carriageMoves,
          })
    }</span>
    <span class="gest_section_title">${_(card.titleLight)}</span>
    <span class="gest_tooltip_text">${_(card.textLight)}</span>
    <span class="gest_section_title">${_(card.titleDark)}</span>
    <span class="gest_tooltip_text">${_(card.textDark)}</span>
    `,
  });
};
