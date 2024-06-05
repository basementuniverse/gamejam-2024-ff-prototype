import { vec } from '@basementuniverse/vec';
import { Direction, GameScene } from '../GameScene';
import { Item } from '../Item';
import { Machine } from './Machine';

export class Dispenser extends Machine {
  public item: Item | null = null;

  constructor(direction: Direction, item: Item) {
    super(direction);
    this.item = item;
  }

  public tick(game: GameScene, p: vec) {
    if (!this.item) {
      return;
    }

    if (this.internalItem && !this.outputItem) {
      this.outputItem = this.internalItem;
      this.internalItem = null;
    }

    if (!this.internalItem) {
      this.internalItem = Item.clone(this.item);
    }
  }

  public render(): string {
    return `DSP${super.render()}`;
  }
}
