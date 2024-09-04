const tplInfoPanel = () => `<div class='player-board' id="info_panel">
  <div id="gest_ballad_info">
    <div class="gest_ballad_info_side_column"></div>
    <div id="gest_ballad_info_events">
      <span id="gest_ballad_info_ballad_number"></span>
      <span id="gest_ballad_info_event_number"></span>
    </div>
    <div class="gest_ballad_info_side_column">
      <div id="gest_fortune_event_icon"></div>
    </div>
  </div>
  <div id="info_panel_buttons">
    
  </div>

</div>`;
// <div id="gest_travellers_info">
// <span class="gest_title">${_('Travellers')}</span>
// <div></div>
// </div>

const tplPlotDeedInfo = ({
  id,
  title,
  cost,
  location,
  procedure,
}: PlotOrDeedInfo) => `
<div class="gest_plot_deed_item" id="gest_plot_deed_info_${id}">
  <span class="gest_plot_deed_title">${_(title)}</span>
  <div class="gest_plot_deed_info_row">
    <span class="gest_plot_deed_info_label">${_('Cost: ')}</span><span>${_(
  cost
)}</span>
  </div>
      <div class="gest_plot_deed_info_row">
    <span class="gest_plot_deed_info_label">${_('Location: ')}</span><span>${_(
  location
)}</span>
  </div>
      <div class="gest_plot_deed_info_row">
    <span class="gest_plot_deed_info_label">${_('Procedure: ')}</span><span>${_(
  procedure
)}</span>
  </div>
</div>`;

const tplRobinHoodPlotsAndDeeds = () => `
<div class="gest_plots_and_deeds_wrapper">
  <div class="gest_plots_and_deeds_container" data-side="robinHood">
    <div class="gest_title_container" data-row="plots">
      <span class="gest_plot_title">${_('Plots')}</span>
    </div>
    ${getRobinHoodPlotsAndDeeds()
      .plots.map((info) => tplPlotDeedInfo(info))
      .join('')}
    <div class="gest_title_container" data-row="deeds">
      <span class="gest_plot_title">${_('Deeds')}</span>
    </div>
    ${getRobinHoodPlotsAndDeeds()
        .deeds.map((info) => tplPlotDeedInfo(info))
        .join('')}    
  </div>
</div>
`;

// <div class="gest_plots_row" data-items="4">
// ${getRobinHoodPlotsAndDeeds()
//   .deeds.map((info) => tplPlotDeedInfo(info))
//   .join('')}
// </div>

const tplSheriffPlotsAndDeeds = () => `
  <div class="gest_plots_and_deeds_wrapper">
    <div class="gest_plots_and_deeds_container" data-side="sheriff">
      <div class="gest_title_container" data-row="plots">
        <span class="gest_plot_title">${_('Plots')}</span>
      </div>
      ${getSheriffPlotsAndDeeds()
        .plots.map((info) => tplPlotDeedInfo(info))
        .join('')}
      <div class="gest_title_container" data-row="deeds">
        <span class="gest_plot_title">${_('Deeds')}</span>
      </div>
      ${getSheriffPlotsAndDeeds()
        .deeds.map((info) => tplPlotDeedInfo(info))
        .join('')}
      
    </div>
  </div>
`;

const tplBalladModalTab = ({ id, text }: { id: string; text: string }) => `
  <div id="ballad_modal_tab_${id}" class="ballad_modal_tab">
    <span>${_(text)}</span>
  </div>`;

const tplBalladModalBalladInfo = (
  game: AGestOfRobinHoodGame,
  cards: GestCard[]
) => `
  ${cards
    .map((card) =>
      tplLogTokenCard(card.id.split('_')[0], `balladInfo_${card.id}`)
    )
    .join('')}
`;

const tplBalladModalContent = ({
  tabs,
  game,
  cards,
}: {
  tabs: Record<string, { text: string }>;
  game: AGestOfRobinHoodGame;
  cards: GestCard[];
}) => {
  return `<div id="ballad_modal_content">
    <div class="ballad_modal_tabs">
      ${Object.entries(tabs)
        .map(([id, info]) => tplBalladModalTab({ id, text: info.text }))
        .join('')}
    </div>
      <div id="gest_ballad1" class="gest_ballad_info" style="display: none;">
        ${tplBalladModalBalladInfo(
          game,
          cards.filter((card, index) => index <= 6)
        )}
      </div>
      <div id="gest_ballad2" class="gest_ballad_info" style="display: none;">
      ${tplBalladModalBalladInfo(
        game,
        cards.filter((card, index) => index > 7 && index <= 14)
      )}
      </div>
      <div id="gest_ballad3" class="gest_ballad_info" style="display: none;">
      ${tplBalladModalBalladInfo(
        game,
        cards.filter((card, index) => index > 15 && index <= 23)
      )}
    </div>
  </div>`;
};
