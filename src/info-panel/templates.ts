const tplInfoPanel = () => `<div class='player-board' id="info_panel">
  <div id="gest_ballad_info">
    <span id="gest_ballad_info_ballad_number"></span>
    <span id="gest_ballad_info_event_number"></span>
  </div>
  <div id="info_panel_buttons">
    
  </div>

</div>`;
// <div id="gest_travellers_info">
// <span class="gest_title">${_('Travellers')}</span>
// <div></div>
// </div>

const tplPlotDeedInfo = ({
  title,
  cost,
  location,
  procedure,
}: PlotOrDeedInfo) => `
<div class="gest_plot_deed_item">
  <span class="gest_plot_deed_title">${_(title)}</span>
  <div class="gest_plot_deed_info_row">
    <span class="gest_plot_deed_info_label">${_('Cost: ')}</span><span>${_(
  cost
)}</span>
  </div>
      <div class="gest_plot_deed_info_row"?
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
  <div class="gest_plots_and_deeds_container" data-side="robinHood">
    <span class="gest_plot_title">${_('Plots')}</span>
    <div class="gest_plots_row">
        ${getRobinHoodPlotsAndDeeds()
          .plots.map((info) => tplPlotDeedInfo(info))
          .join('')}
    </div>
    <span class="gest_plot_title" style="margin-top: 8px;">${_('Deeds')}</span>
    <div class="gest_plots_row" data-items="4">
        ${getRobinHoodPlotsAndDeeds()
          .deeds.map((info) => tplPlotDeedInfo(info))
          .join('')}
    </div>
  </div>
`;

const tplSheriffPlotsAndDeeds = () => `
  <div class="gest_plots_and_deeds_container" data-side="sheriff">
    <span class="gest_plot_title">${_('Plots')}</span>
    <div class="gest_plots_row">
        ${getSheriffPlotsAndDeeds()
          .plots.map((info) => tplPlotDeedInfo(info))
          .join('')}
    </div>
    <span class="gest_plot_title" style="margin-top: 8px;">${_('Deeds')}</span>
    <div class="gest_plots_row">
        ${getSheriffPlotsAndDeeds()
          .deeds.map((info) => tplPlotDeedInfo(info))
          .join('')}
    </div>
  </div>
`;
