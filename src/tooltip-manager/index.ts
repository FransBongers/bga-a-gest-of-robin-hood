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

  private _customTooltipIdCounter: number = 0;
  private _registeredCustomTooltips = {};

  constructor(game: AGestOfRobinHoodGame) {
    this.game = game;
  }

  public addTextToolTip({
    nodeId,
    text,
    custom = true,
  }: {
    nodeId: string;
    text: string;
    custom?: boolean;
  }) {
    if (custom) {
      this.addCustomTooltip(
        nodeId,
        tplTextTooltip({
          text,
        })
      );
    } else {
      this.game.framework().addTooltipHtml(
        nodeId,
        tplTextTooltip({
          text,
        }),
        400
      );
    }
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
    this.addCustomTooltip(nodeId, html);
  }

  public addCarriageTooltip({
    nodeId,
    type,
  }: {
    type: string;
    nodeId: string;
  }) {
    if (type === CARRIAGE) {
      this.addCustomTooltip(nodeId, tplCarriageTypesTooltip(this.game));
    } else {
      this.addCustomTooltip(nodeId, tplCarriageTooltip(this.game, type));
    }
    
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
    this.addCustomTooltip(
      nodeId,
      tplTravellerTooltip(config.find((data) => data.image === imageId))
    );
  }

  public addGameMapTooltips() {
    this.addCustomTooltip(
      'royalInspectionTrack_unrest',
      royalInspectionUnrest({ game: this.game })
    );
    this.addCustomTooltip(
      'royalInspectionTrack_mischief',
      royalInspectionMischief({ game: this.game })
    );
    this.addCustomTooltip(
      'royalInspectionTrack_governance',
      royalInspectionGovernance({ game: this.game })
    );
    this.addCustomTooltip(
      'royalInspectionTrack_redeployment',
      royalInspectionRedployment({ game: this.game })
    );
    this.addCustomTooltip(
      'royalInspectionTrack_reset',
      royalInspectionReset({ game: this.game })
    );
  }

  // .##.....##.########.##.......########.....##.....##..#######..########..########
  // .##.....##.##.......##.......##.....##....###...###.##.....##.##.....##.##......
  // .##.....##.##.......##.......##.....##....####.####.##.....##.##.....##.##......
  // .#########.######...##.......########.....##.###.##.##.....##.##.....##.######..
  // .##.....##.##.......##.......##...........##.....##.##.....##.##.....##.##......
  // .##.....##.##.......##.......##...........##.....##.##.....##.##.....##.##......
  // .##.....##.########.########.##...........##.....##..#######..########..########

  /**
   * Tooltip to work with help mode
   */
  registerCustomTooltip(html, id = null) {
    id =
      id ||
      this.game.framework().game_name +
        '-tooltipable-' +
        this._customTooltipIdCounter++;
    this._registeredCustomTooltips[id] = html;
    return id;
  }
  public attachRegisteredTooltips() {
    Object.keys(this._registeredCustomTooltips).forEach((id) => {
      if ($(id)) {
        this.addCustomTooltip(id, this._registeredCustomTooltips[id], {
          forceRecreate: true,
        });
      }
    });
    this._registeredCustomTooltips = {};
  }
  public addCustomTooltip(
    id: string,
    html: string | Function,
    config: { delay?: number; midSize?: boolean; forceRecreate?: boolean } = {}
  ) {
    if(!document.getElementById(id)) {
      return;
    }
    config = Object.assign(
      {
        delay: 400,
        midSize: true,
        forceRecreate: false,
      },
      config
    ) as { delay: 400; midSize: boolean; forceRecreate: boolean };

    // Handle dynamic content out of the box
    let getContent = () => {
      let content = typeof html === 'function' ? html() : html;
      if (config.midSize) {
        content = '<div class="midSizeDialog">' + content + '</div>';
      }
      return content;
    };

    if (this.game.framework().tooltips[id] && !config.forceRecreate) {
      this.game.framework().tooltips[id].getContent = getContent;
      return;
    }

    let tooltip = new dijit.Tooltip({
      //        connectId: [id],
      getContent,
      position: this.game.framework().defaultTooltipPosition,
      showDelay: config.delay,
    });
    this.game.framework().tooltips[id] = tooltip;
    dojo.addClass(id, 'tooltipable');
    dojo.place(
      `<div class='help-marker'>
            <svg><use href="#help-marker-svg" /></svg>
          </div>`,
      id
    );

    dojo.connect($(id), 'click', (evt) => {
      if (!this.game._helpMode) {
        tooltip.close();
      } else {
        evt.stopPropagation();

        if (tooltip.state == 'SHOWING') {
          this.game.closeCurrentTooltip();
        } else {
          this.game.closeCurrentTooltip();
          tooltip.open($(id));
          this.game._displayedTooltip = tooltip;
        }
      }
    });

    tooltip.showTimeout = null;
    dojo.connect($(id), 'mouseenter', (evt) => {
      evt.stopPropagation();
      if (!this.game._helpMode && !this.game._dragndropMode) {
        if (tooltip.showTimeout != null) clearTimeout(tooltip.showTimeout);

        tooltip.showTimeout = setTimeout(() => {
          if ($(id)) tooltip.open($(id));
        }, config.delay);
      }
    });

    dojo.connect($(id), 'mouseleave', (evt) => {
      evt.stopPropagation();
      if (!this.game._helpMode && !this.game._dragndropMode) {
        tooltip.close();
        if (tooltip.showTimeout != null) clearTimeout(tooltip.showTimeout);
      }
    });
  }
}
