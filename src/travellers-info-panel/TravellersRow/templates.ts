const tplTravellersRow = ({ id, title }: { id: string; title: string }) => `
  <div id="gest_info_${id}" class="gest_traveller_row">
    <div style="margin-bottom: 2px;">
      <span class="gest_row_title">${_(title)}: </span>
      
      <span id="gest_travellers_row_${id}_counter" class="gest_row_title"></span>
      
    </div>
      
    <div id="gest_travellers_${id}">
      
    </div>
  </div>`;
