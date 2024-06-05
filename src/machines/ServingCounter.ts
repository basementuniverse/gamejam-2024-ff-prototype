import { vec } from '@basementuniverse/vec';
import { Direction, GameScene } from '../GameScene';
import { Item } from '../Item';
import { Machine } from './Machine';

export class ServingCounter extends Machine {
  public expectedItem: Item | null = null;

  constructor(direction: Direction, expectedItem: Item) {
    super(direction);
    this.expectedItem = expectedItem;
  }

  public tick(game: GameScene, p: vec) {
    const inputMachine = game.factoryFloor.findAdjacentMachine(
      p,
      game.adjustDirection(this.direction, this.input)
    );

    if (inputMachine && inputMachine.outputItem) {
      this.internalItem = inputMachine.outputItem;
      inputMachine.outputItem = null;
    }

    if (this.internalItem) {
      console.log('internal: ', this.internalItem);
      console.log('expected: ', this.expectedItem);
      console.log('valid: ', this.isValidOrder() ? 'yes' : 'no');
    }
  }

  private isValidOrder() {
    if (!this.expectedItem) {
      return false;
    }

    if (!this.internalItem) {
      return false;
    }

    return this.expectedItem.tags.every(
      tag => this.internalItem!.tags.includes(tag)
    );
  }

  private calculateScore() {
    // compare expectedItem to internalItem and apply score based on similarity
  }

  public render(): string {
    return `SVC${super.render()}`;
  }
}
