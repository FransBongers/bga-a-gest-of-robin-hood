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

  public addTextToolTip({ nodeId, text }: { nodeId: string; text: string }) {
    this.game.framework().addTooltip(nodeId, _(text), '', 500);
  }

  public removeTooltip(nodeId: string) {
    this.game.framework().removeTooltip(nodeId);
  }

  public setupTooltips() {}

  public addCardTooltip({
    nodeId,
    cardId,
  }: {
    nodeId: string;
    cardId: string;
  }) {
    const card = this.game.gamedatas.staticData.cards[cardId];
    const html = tplGestCardTooltip({
      card,
      game: this.game,
      imageOnly:
        this.game.settings.get({ id: PREF_CARD_INFO_IN_TOOLTIP }) === DISABLED,
    });
    this.game.framework().addTooltipHtml(nodeId, html, 500);
  }

  public addCarriageTooltip({
    nodeId,
    type,
  }: {
    type: string;
    nodeId: string;
  }) {
    this.game
      .framework()
      .addTooltipHtml(nodeId, tplCarriageTooltip(this.game, type), 500);
  }

  // ..######..########.########.##.....##.########.
  // .##....##.##..........##....##.....##.##.....##
  // .##.......##..........##....##.....##.##.....##
  // ..######..######......##....##.....##.########.
  // .......##.##..........##....##.....##.##.......
  // .##....##.##..........##....##.....##.##.......
  // ..######..########....##.....#######..##.......

  public addTravellersTooltip(nodeId: string, imageId: string) {
    const config = getTravellersConfig();
    this.game
      .framework()
      .addTooltipHtml(
        nodeId,
        tplTravellerTooltip(config.find((data) => data.image === imageId)),
        500
      );
  }

  // public addTravellersTooltips() {
  //   const config = getTravellersConfig();
  //   TRAVELLERS.forEach((traveller) => {
  //     this.game
  //       .framework()
  //       .addTooltipHtml(
  //         `gest_traveller_${traveller}_counter_row`,
  //         tplTravellerTooltip(config.find((data) => data.image === traveller)),
  //         500
  //       );
  //   });
  // }

  public addGameMapTooltips() {
    this.game
      .framework()
      .addTooltipHtml(
        'royalInspectionTrack_unrest',
        royalInspectionUnrest({ game: this.game }),
        500
      );
    this.game
      .framework()
      .addTooltipHtml(
        'royalInspectionTrack_mischief',
        royalInspectionMischief({ game: this.game }),
        500
      );
    this.game
      .framework()
      .addTooltipHtml(
        'royalInspectionTrack_governance',
        royalInspectionGovernance({ game: this.game }),
        500
      );
    this.game
      .framework()
      .addTooltipHtml(
        'royalInspectionTrack_redeployment',
        royalInspectionRedployment({ game: this.game }),
        500
      );
    this.game
      .framework()
      .addTooltipHtml(
        'royalInspectionTrack_reset',
        royalInspectionReset({ game: this.game }),
        500
      );
  }
}
