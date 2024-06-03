const tplPlayerPanel = ({ playerId }: { playerId: number }) => {
  return `<div id="gest_player_panel_${playerId}" class="gest_player_panel">
            <div class="gest_player_panel_shillings_counter">
              <span>Shillings: </span><span id="shillings_counter_${playerId}"></span>
            </div>
          </div>`;
};
