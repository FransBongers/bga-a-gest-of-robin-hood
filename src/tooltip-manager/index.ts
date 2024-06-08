//  .########..#######...#######..##.......########.####.########.
//  ....##....##.....##.##.....##.##..........##.....##..##.....##
//  ....##....##.....##.##.....##.##..........##.....##..##.....##
//  ....##....##.....##.##.....##.##..........##.....##..########.
//  ....##....##.....##.##.....##.##..........##.....##..##.......
//  ....##....##.....##.##.....##.##..........##.....##..##.......
//  ....##.....#######...#######..########....##....####.##.......

//  .##.....##....###....##....##....###.....######...########.########.
//  .###...###...##.##...###...##...##.##...##....##..##.......##.....##
//  .####.####..##...##..####..##..##...##..##........##.......##.....##
//  .##.###.##.##.....##.##.##.##.##.....##.##...####.######...########.
//  .##.....##.#########.##..####.#########.##....##..##.......##...##..
//  .##.....##.##.....##.##...###.##.....##.##....##..##.......##....##.
//  .##.....##.##.....##.##....##.##.....##..######...########.##.....##

class TooltipManager {
  private game: AGestOfRobinHoodGame;
  // This can't be used since some versions of safari don't support it
  // private idRegex = /(?<=id=")[a-z]*_[0-9]*_[0-9]*(?=")/;
  private idRegex = /id="[a-z]*_[0-9]*_[0-9]*"/;
  constructor(game: AGestOfRobinHoodGame) {
    this.game = game;
  }

  public addTextToolTip({nodeId, text}: {nodeId: string; text: string;}) {
    this.game.framework().addTooltip(nodeId, _(text), '', 500);
  }

  public removeTooltip(nodeId: string) {
    this.game.framework().removeTooltip(nodeId);
  }

  public setupTooltips() {
  }

  public addCardTooltip({nodeId, card}: {nodeId: string; card: GestCardStaticData}) {
    const html = tplCardTooltip({
      card,
      game: this.game,
      imageOnly:
        this.game.settings.get({ id: PREF_CARD_INFO_IN_TOOLTIP }) === DISABLED,
    });
    this.game.framework().addTooltipHtml(nodeId, html, 500);
  }

}
