const tplInformationButton =
  () => `<button id="information_button" type="button" class="information_modal_button">
<div class="information_modal_icon"></div>
</button>`;

const tplInfoModalTab = ({ id, text }: { id: string; text: string }) => `
  <div id="information_modal_tab_${id}" class="information_modal_tab">
    <span>${_(text)}</span>
  </div>`;

const orderJusticeInfo = ({ game }: { game: AGestOfRobinHoodGame }) => `
  <div>
    <div style="margin-bottom: 2px;">
      <span>${game.format_string_recursive(
        _('To shift Royal Favour towards ${tkn_boldText_order}'),
        { tkn_boldText_order: _('Order:') }
      )}</span>
    </div>
    <div class="gest_row">
      <div class="gest_arrow"></div>
      <span>${_('Some Event and Traveller effects (+1 Order)')}</span>
    </div>
    <div class="gest_row">
      <div class="gest_arrow"></div>
      <span>${_('Remove Camps (+1 Order)')}</span>
    </div>
    <div class="gest_row">
      <div class="gest_arrow"></div>
      <span>${_('Capture Robin Hood (+1 Order)')}</span>
    </div>
    <div class="gest_row">
      <div class="gest_arrow"></div>
      <span>${_(
        'Bring Carriages to Nottingham (+1 Order, +2 for Tribute)'
      )}</span>
    </div>
    <div class="gest_row">
      <div class="gest_arrow"></div>
      <span>${game.format_string_recursive(
        _(
          '${tkn_boldItalicText_royalInspection} 5-7 Submissive Parishes (+1 Order)'
        ),
        {
          tkn_boldItalicText_royalInspection: _('Royal Inspection:'),
        }
      )}</span>
    </div>
  </div>
  <div>
  </div>
  <div style="margin-top: 16px;">
    <div style="margin-bottom: 2px;">
      <span>${game.format_string_recursive(
        _('To shift Royal Favour towards ${tkn_boldText_order}'),
        { tkn_boldText_order: _('Justice:') }
      )}</span>
    </div>
    <div class="gest_row">
      <div class="gest_arrow"></div>
      <span>${game.format_string_recursive(
        _('Some Event and Traveller effects (+1 Justice)'),
        { tkn_arrow: '=>' }
      )}</span>
    </div>
    <div class="gest_row">
      <div class="gest_arrow"></div>
      <span>${game.format_string_recursive(_('Place Camps (+1 Justice)'), {
        tkn_arrow: '=>',
      })}</span>
    </div>
    <div class="gest_row">
      <div class="gest_arrow"></div>
      <span>${game.format_string_recursive(
        _('Inspire in Revolting Parishes (+1 Justice)'),
        { tkn_arrow: '=>' }
      )}</span>
    </div>
    <div class="gest_row">
      <div class="gest_arrow"></div>
      <span>${game.format_string_recursive(
        _('Rob Tribute Carriages or the Treasury (+1 Justice)'),
        { tkn_arrow: '=>' }
      )}</span>
    </div>
    <div class="gest_row">
      <div class="gest_arrow"></div>
      <span>${game.format_string_recursive(
        _(
          '${tkn_boldItalicText_royalInspection} 3-4 Submissive Parishes (+1 Justice)'
        ),
        {
          tkn_boldItalicText_royalInspection: _('Royal Inspection:'),
        }
      )}</span>
    </div>
    <div class="gest_row">
      <div class="gest_arrow"></div>
      <span>${game.format_string_recursive(
        _(
          '${tkn_boldItalicText_royalInspection} 1-2 Submissive Parishes (+2 Justice)'
        ),
        {
          tkn_boldItalicText_royalInspection: _('Royal Inspection:'),
        }
      )}</span>
    </div>
    <div class="gest_row">
      <div class="gest_arrow"></div>
      <span>${game.format_string_recursive(
        _(
          '${tkn_boldItalicText_royalInspection} 0 Submissive Parishes (+3 Justice)'
        ),
        {
          tkn_boldItalicText_royalInspection: _('Royal Inspection:'),
        }
      )}</span>
    </div>
  </div>
`;

const robSummaryInfo = ({ game }: { game: AGestOfRobinHoodGame }) => `
  <div>
      ${robSummarySteps()
        .map(
          (step) => `
          <div class="gest_row">
            <div class="gest_arrow"></div>
            <span>${_(step)}</span>
          </div>
        `
        )
        .join('')}
    <div class="gest_row" style="margin-top: 16px;">
      <div id="gest_nottingham_image"></div>
      <div>
        <span class="gest_title">${_('Treasury')}</span>
          <div><span>${game.format_string_recursive(
             _(
               '${tkn_boldItalicText_success} 2 Shillings from Sheriff, +1 Justice'
             ),
             {
               tkn_boldItalicText_success: _('Success: '),
             }
           )}</span></div>
      <div>
        <span>${game.format_string_recursive(
          _('${tkn_boldItalicText_failure} No effect'),
          {
            tkn_boldItalicText_failure: _('Failure: '),
          }
        )}</span></div>
      </div>
    </div>
    <div style="margin-top: 16px;">
        <span class="gest_title" style="margin-left: 68px;">${_(
          'Carriages'
        )}</span>
        ${carriagesRobInfo()
          .map(
            (info) => `
          <div class="gest_row" style="margin-top: 8px;">
            <div class="gest_force_side" data-type="${
              info.image
            }" data-revealed="true"></div>
            <div>
              <div><span class="gest_section_title">${_(
                info.title
              )}</span></div>
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
          )
          .join('')}
    </div>
  </div>
`;

const travellerInfoRow = (
  info: TravellerInfo
) => `<div class="gest_traveller_info_row">
        <div class="gest_traveller_image" data-image="${info.image}"></div>
        <div class="gest_traveller_stats_container">
          <div class="gest_row">
            <span class="gest_traveller_name">${_(info.name)}</span>
            <span class="gest_traveller_deck_count">${_(info.inDeck)}</span>
            <span style="font-weight: bold;">: </span>
            <span class="gest_traveller_defense">${info.defense} ${_('Defense')}</span>
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
</div>`;

const royalInspectionUnrest = ({game}: {game: AGestOfRobinHoodGame}) => `
  <div class="gest_royal_inspection_info">
    <div>    
      <span>${game.format_string_recursive(_('${tkn_boldText_unrest} Check the number of Submissive Parises:'), {tkn_boldText_unrest: _('Unrest: ')})}</span>
    </div>
    <div class="gest_row">    
      <span class="gest_list_item">•</span>
      <span>${_('5-7 Submissive Parishes: +1 Order')}</span>
    </div>
    <div class="gest_row">    
      <span class="gest_list_item">•</span>
      <span>${_('3-4 Submissive Parishes: +1 Justice')}</span>
    </div>
    <div class="gest_row">    
      <span class="gest_list_item">•</span>
      <span">${_('1-2 Submissive Parishes: +2 Justice')}</span>
    </div>
    <div class="gest_row">    
      <span class="gest_list_item">•</span>
      <span>${_('0 Submissive Parishes: +3 Justice')}</span>
    </div>
    <div><span>${_('Then check for automatic victory (Royal Favour at 5 or more)')}</span></div>
  </div>
`

const royalInspectionMischief = ({game}: {game: AGestOfRobinHoodGame}) => `
  <div class="gest_royal_inspection_info">
    <span>${game.format_string_recursive(_('${tkn_boldText_mischief} Robin Hood gains 1 Shilling for each Camp in a Forest or Ollerton Hill, then performs a Single Rob Plot and may Donate in up to two Parishes. Return half (rounded down) Merry Men in Prison to Available.'), {tkn_boldText_mischief: _('Mischief: ')})}</span>
  </div>
`

const royalInspectionGovernance = ({game}: {game: AGestOfRobinHoodGame}) => `
  <div class="gest_royal_inspection_info">
    <span>${game.format_string_recursive(_('${tkn_boldText_governance} Sheriff gains 1 Shilling for each Submissive space (including Nottingham). Remove half (rounded down) Henchmen from each Revolting Parish. Set any Revolting Parish where Henchmen now outnumber Merry Men to Submissive.'), {tkn_boldText_governance: _('Governance: ')})}</span>
  </div>
`

const royalInspectionRedployment = ({game}: {game: AGestOfRobinHoodGame}) => `
  <div class="gest_royal_inspection_info">
    <div><span>${game.format_string_recursive(_('${tkn_boldText_redeployment} Sheriff then Robin Hood must redeploy their Henchmen and Merry Men:'), {tkn_boldText_redeployment: _('Redeployment: ')})}</span></div>
    <div class="gest_row">
      <span class="gest_list_item">•</span>
      <span>${_('Henchmen must move from Revolting Parishes and Forests to Submissive spaces, any other may move to Nottingham. Used Carriages to Available.')}</span></li>
    </div>  
    <div class="gest_row">    
      <span class="gest_list_item">•</span>
      <span>${_('Merry Men must move from Submissive spaces to Forests or Camps, any others may do the same, then flip all Hidden. Place Robin Hood from Available to any Forest, then may secretly swap him with any Merry Man.')}</span></li>
    </div>
  </div>
`

const royalInspectionReset = ({game}: {game: AGestOfRobinHoodGame}) => `
  <div class="gest_royal_inspection_info">
    <span>${game.format_string_recursive(_('${tkn_boldText_reset} Shuffle the Traveller deck discard pile back into the main Traveller deck. Set Robin Hood to First Eligible and the Sheriff to Second Eligible, then draw the next Event card and continue play.'), {tkn_boldText_reset: _('Reset: ')})}</span>
  </div>
`

const royalInspectionRoundInfo = ({game}: {game: AGestOfRobinHoodGame}) => `
  <div class="gest_row">
    <div class="gest_arrow"></div>
    ${royalInspectionUnrest({game})}
  </div>
  <div class="gest_row">
    <div class="gest_arrow"></div>
    ${royalInspectionMischief({game})}
  </div>  
  <div class="gest_row">
    <div class="gest_arrow"></div>
    ${royalInspectionGovernance({game})}
  </div>
  <div class="gest_row">
    <div class="gest_arrow"></div>
    ${royalInspectionRedployment({game})}
  </div>
  <div class="gest_row">
    <div class="gest_arrow"></div>
    ${royalInspectionReset({game})}
  </div>  
`

const tplInformationModalContent = ({
  tabs,
  game,
}: {
  tabs: Record<string, { text: string }>;
  game: AGestOfRobinHoodGame;
}) => {
  const TRAVELLERS_CONFIG = getTravellersConfig();

  return `<div id="information_modal_content">
    <div class="information_modal_tabs">
      ${Object.entries(tabs)
        .map(([id, info]) => tplInfoModalTab({ id, text: info.text }))
        .join('')}
    </div>
      <div id="gest_orderJustice" style="display: none;">
        ${orderJusticeInfo({ game })}
      </div>
      <div id="gest_robSummary" style="display: none;">
      ${robSummaryInfo({ game })}
    </div>
    <div id="gest_travellers" style="display: none;">
    ${TRAVELLERS_CONFIG.map(travellerInfoRow).join('')}
    </div>
    <div id="gest_royalInspectionRound" style="display: none;">
    ${royalInspectionRoundInfo({ game })}
    </div>
  </div>`;
};
