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

const tplGestCardTooltipClarification = (text: string) => `
  <div class="gest_card_clarification">
    <div class="gest_arrow"></div>
    <span class="gest_tooltip_text">${_(text)}</span>
  </div>
`

const tplGestCardTooltip = ({
  card,
  game,
  imageOnly = false,
}: {
  card: GestCardStaticData;
  game: AGestOfRobinHoodGame;
  imageOnly?: boolean;
}) => {
  const cardHtml = `<div class="gest_card_side" data-card-id="${
    card.id.split('_')[0]
  }"></div>`;
  if (imageOnly) {
    return `<div class="gest_card_only_tooltip">${cardHtml}</div>`;
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
    ${card.clarificationLight.map((text) => tplGestCardTooltipClarification(text)).join('')}
    <span class="gest_section_title">${_(card.titleDark)}</span>
    <span class="gest_tooltip_text">${_(card.textDark)}</span>
    ${card.clarificationDark.map((text) => tplGestCardTooltipClarification(text)).join('')}
    `,
  });
};

const tplTravellerTooltip = (info: TravellerInfo) => {
  return `
  <div class="gest_traveller_tooltip">
    <div class="gest_traveller_image" data-image="${info.image}"></div>
    <div class="gest_traveller_stats_container">
      <span class="gest_traveller_name">${_(info.name)}</span>
      <div class="gest_row">
        <span class="gest_traveller_defense">${_('Defense')}: ${info.defense}</span>
      </div>
      <div class="gest_row">
        <span class="gest_rob_result">${_('Success: ')}</span>
        <span>${_(info.success)}</span>
      </div>
      <div class="gest_row">
        <span class="gest_rob_result">${_('Failure: ')}</span>
        <span>${_(info.failure)}</span>
      </div>
    </div>
  </div>`
}

const tplCarriageTypesTooltip = (game: AGestOfRobinHoodGame) => {
  return `
    <div class="gest_carriage_types_tooltip">
    <span class="gest_carriage_types_title">${_('Carriage types')}</span>
    ${tplCarriageTooltip(game, TALLAGE_CARRIAGE)}
    ${tplCarriageTooltip(game, TRIBUTE_CARRIAGE)}
    ${tplCarriageTooltip(game, TRAP_CARRIAGE)}
    </div>
  `
}

const tplCarriageTooltip = (game: AGestOfRobinHoodGame, type: string) => {
  const info = carriagesRobInfo().find((data) => data.image === type);
  return `
          <div class="gest_carriage_tooltip gest_row">
            <div class="gest_force_side" data-type="${
              info.image
            }" data-revealed="true"></div>
            <div>
              <span class="gest_title">${_(info.name)}</span>
              <div><span class="gest_section_title">${_(
                'Defense'
              )}: ${info.defense}</span></div>
              <div style="margin-top: 8px;">
                <span class="gest_section_title">${_('If reaches Nottingham:')}</span>
              </div>
              <div>
                <span>${_(info.nottingham)}</span>
              </div>
              <div style="margin-top: 8px;">
                <span class="gest_section_title">${_('If Robbed:')}</span>
              </div>
              <div><span>${game.format_string_recursive(_(info.success), {
                tkn_boldItalicText_success: _('Success: '),
              })}</span></div>
              <div>
                <span>${game.format_string_recursive(_(info.failure), {
                  tkn_boldItalicText_failure: _('Failure: '),
                })}</span></div>
            </div>
          </div>   
          
          
  `
}

const tplTooltipWithIcon = ({
  title,
  text,
  iconHtml,
  iconWidth,
}: {
  title?: string;
  text: string;
  iconHtml: string;
  iconWidth?: number;
}): string => {
  return `<div class="gest_icon_tooltip">
            <div class="gest_icon_tooltip_icon"${
              iconWidth ? `style="min-width: ${iconWidth}px;"` : ''
            }>
              ${iconHtml}
            </div>
            <div class="gest_icon_tooltip_content">
              ${title ? `<span class="gest_tooltip_title" >${title}</span>` : ''}
              <span class="gest_tooltip_text">${text}</span>
            </div>
          </div>`;
};

const tplTextTooltip = ({ text }: { text: string }) => {
  return `<span class="gest_text_tooltip">${text}</span>`;
};