import { Item } from '../Item';
import { Machine } from './Machine';
import { pluck } from '@basementuniverse/utils';
import { FactoryFloor } from '../FactoryFloor';

export class ServingCounter extends Machine {
  public expectedItem: Item | null = null;

  constructor(data: Partial<ServingCounter> = {}) {
    super(pluck(data, 'position', 'direction'));
    this.expectedItem = data.expectedItem || null;
  }

  public tick(factory: FactoryFloor): ServingCounter {
    const cloned = this.clone();

    const inputMachine = factory.findAdjacentMachine(
      cloned.position,
      factory.adjustDirection(this.direction, this.input)
    );

    if (inputMachine && inputMachine.outputItem && !cloned.outputItem) {
      cloned.outputItem = inputMachine.take(factory);
    }

    if (cloned.outputItem) {
      console.log('item: ', cloned.outputItem);
      console.log('expected: ', cloned.expectedItem);
      console.log('valid: ', cloned.isValidOrder() ? 'yes' : 'no');
    }

    return cloned;
  }

  public clone(): ServingCounter {
    const cloned = new ServingCounter(this);

    cloned.expectedItem = this.expectedItem;
    cloned.outputItem = this.outputItem;

    return cloned;
  }

  private isValidOrder() {
    if (!this.expectedItem) {
      return false;
    }

    if (!this.outputItem) {
      return false;
    }

    return (
      this.expectedItem.tags.length === this.outputItem.tags.length &&
      this.expectedItem.tags.every(
        tag => this.outputItem!.tags.includes(tag)
      )
    );
  }

  private calculateScore() {
    // compare expectedItem to outputItem and apply score based on similarity
  }

  public debugOutput(): string {
    return `SVC${super.debugOutput()}`;
  }
}
