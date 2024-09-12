class GestLineStock<T> extends LineStock<T> {
  private onCardRemoved?: (card: T) => void;

  constructor(
    protected manager: CardManager<T>,
    protected element: HTMLElement,
    settings?: LineStockSettings,
    onCardRemoved?: (card: T) => void
  ) {
    super(manager, element, settings);
    this.onCardRemoved = onCardRemoved;
  }

  public cardRemoved(card: T, settings?: RemoveCardSettings) {
    if (this.onCardRemoved) {
      this.onCardRemoved(card);
    }
    super.cardRemoved(card, settings);
  }
}
