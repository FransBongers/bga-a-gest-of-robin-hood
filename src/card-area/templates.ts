const travellerCardIdMap = {
  RichMerchant: 'Traveller01'
}

const travellersDeckCounter = (traveller: string) => `
  <div class="travellers_deck_counter_container">
    <span id="travellers_deck_${traveller}_counter"></span>
    <div class="gest_card_side" data-card-id="${travellerCardIdMap[traveller]}" style="width: 21px; height: 36px;"></div>
  </div>
`

// const tplTravellers= () => `
// <div>
//   <span class="gest_title">${_('Travellers')}</span>
//   <div class="gest_card_row">
//     <div id="gest_travellers_decks_info">
//       <div class="gest_traveller_counter_row">
//         <span>${_('Deck: ')}</span><span id="gest_travellers_deck_counter" style="margin-left: auto;"></span>
//       </div>
//       <div>
//         <div id="gest_travellers_deck_composition">
//           ${getTravellersConfig().map((config) => `
//               <div id="gest_traveller_${config.image}_counter_row" class="gest_traveller_counter_row">
//                 <div class="gest_traveller_image" data-image="${config.image}"></div>
//                 <span>${ _(config.name)}: </span>
//                 <span id="gest_traveller_${config.image}_counter" style="margin-left: auto;"></span>
//               </div>
//             `).join('')}
//         </div>
//       </div>
//       <div class="gest_traveller_counter_row">
//         <span>${_('Discard Pile: ')}</span><span id="gest_travellers_discard_counter" style="margin-left: auto;"></span>
//       </div>
//       <div class="gest_traveller_counter_row">
//         <span>${_('Victims Pile: ')}</span><span id="gest_victims_pile_counter" style="margin-left: auto;"></span>
//       </div>
//     </div>
//     <div id="gest_traveller_robbed" class="gest_card_stock"></div>
//   </div>
// </div>`

const tplTravellers= () => `
<div>
  <div class="gest_card_row">
    <div id="gest_travellers_deck" class="gest_card_stock gest_card_side" data-card-id="TravellerBack" style="box-shadow: 1px 1px 2px 1px rgba(0, 0, 0, 0.5);"></div>
    <div id="gest_traveller_robbed" class="gest_card_stock"></div>
  </div>
</div>`

const tplCardArea = () => `
  <div id="gest_card_area">
    <div id="gest_decks">
      <div class="gest_card_row">
        <div id="gest_events_deck" class="gest_card_stock gest_card_side" data-card-id="EventBack" style="box-shadow: 1px 1px 2px 1px rgba(0, 0, 0, 0.5);"></div>
        <div id="gest_events_discard" class="gest_card_stock"></div>
      </div>
      ${tplTravellers()}
    </div>
  </div>
`

// <div class="gest_card_row">
// <div id="gest_travellers_deck_container">
//   <div id="gest_travellers_deck" class="gest_card_stock gest_card_side" data-card-id="TravellerBack" style=" box-shadow: 1px 1px 2px 1px rgba(0, 0, 0, 0.5);"></div>
//     <div id="gest_travellers_deck_counters">
//       ${['RichMerchant'].map(travellersDeckCounter).join('')}
//     </div>
// </div>
// <div id="gest_travellers_discard" class="gest_card_stock"></div>
// <div id="gest_travellers_vicitimsPile_container">
//   <div id="gest_travellers_vicitimsPile_placeholder">
//     <span style="margin-bottom: auto;">${_('Victims Pile')}</span>
//   </div>
//   <div id="gest_travellers_vicitimsPile" class="gest_card_stock"></div>
//   <div id="gest_victims_pile_counter_container">
//     <span id="gest_victims_pile_counter" class="gest_deck_counter_text"></span>
//   </div>
// </div>
// </div>