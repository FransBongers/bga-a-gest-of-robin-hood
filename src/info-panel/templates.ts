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

const tplHelpModeSwitch = () => `<div id="help-mode-switch">
           <input type="checkbox" class="checkbox" id="help-mode-chk" />
           <label class="label" for="help-mode-chk">
             <div class="ball"></div>
           </label><svg aria-hidden="true" focusable="false" data-prefix="fad" data-icon="question-circle" class="svg-inline--fa fa-question-circle fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><g class="fa-group"><path class="fa-secondary" fill="currentColor" d="M256 8C119 8 8 119.08 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 422a46 46 0 1 1 46-46 46.05 46.05 0 0 1-46 46zm40-131.33V300a12 12 0 0 1-12 12h-56a12 12 0 0 1-12-12v-4c0-41.06 31.13-57.47 54.65-70.66 20.17-11.31 32.54-19 32.54-34 0-19.82-25.27-33-45.7-33-27.19 0-39.44 13.14-57.3 35.79a12 12 0 0 1-16.67 2.13L148.82 170a12 12 0 0 1-2.71-16.26C173.4 113 208.16 90 262.66 90c56.34 0 116.53 44 116.53 102 0 77-83.19 78.21-83.19 106.67z" opacity="0.4"></path><path class="fa-primary" fill="currentColor" d="M256 338a46 46 0 1 0 46 46 46 46 0 0 0-46-46zm6.66-248c-54.5 0-89.26 23-116.55 63.76a12 12 0 0 0 2.71 16.24l34.7 26.31a12 12 0 0 0 16.67-2.13c17.86-22.65 30.11-35.79 57.3-35.79 20.43 0 45.7 13.14 45.7 33 0 15-12.37 22.66-32.54 34C247.13 238.53 216 254.94 216 296v4a12 12 0 0 0 12 12h56a12 12 0 0 0 12-12v-1.33c0-28.46 83.19-29.67 83.19-106.67 0-58-60.19-102-116.53-102z"></path></g></svg>
         </div>`