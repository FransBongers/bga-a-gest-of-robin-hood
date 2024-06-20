const tplCardArea = () => `
  <div id="gest_card_area">
    <div class="gest_card_row">
      <div id="gest_events_deck" class="gest_card_stock gest_card_side" data-card-id="EventBack" style="box-shadow: 1px 1px 2px 1px rgba(0, 0, 0, 0.5);"></div>
      <div id="gest_events_discard" class="gest_card_stock"></div>
    </div>
    <div class="gest_card_row">
      <div id="gest_travellers_deck" class="gest_card_stock gest_card_side" data-card-id="TravellerBack" style=" box-shadow: 1px 1px 2px 1px rgba(0, 0, 0, 0.5);"></div>
      <div id="gest_travellers_discard" class="gest_card_stock"></div>
      <div id="gest_travellers_vicitimsPile" class="gest_card_stock"></div>
    </div>
  </div>
`