import { Machine } from './Machine';
import { FactoryFloor } from '../FactoryFloor';
import { pluck } from '@basementuniverse/utils';
import { Item } from '../Item';

export class Grater extends Machine {
  public gratingTime = 2;
  public gratingProgress = 0;
  public gratingItem: Item | null = null;

  public constructor(data: Partial<Grater> = {}) {
    super(pluck(data, 'position', 'direction'));
  }

  public tick(factory: FactoryFloor): Grater {
    const cloned = this.clone();

    cloned.status = 'idle';

    if (cloned.gratingItem) {
      cloned.status = 'working';
      cloned.gratingProgress += 1;

      if (cloned.gratingProgress >= cloned.gratingTime) {
        const gratedItem = Item.clone(cloned.gratingItem);
        gratedItem.mergeTags('grated');

        cloned.outputItem = gratedItem;
        cloned.gratingItem = null;
        cloned.gratingProgress = 0;
      }
    }

    const inputMachine = factory.findAdjacentMachine(
      cloned.position,
      factory.adjustDirection(cloned.direction, cloned.input)
    );

    if (inputMachine && inputMachine.outputItem && !cloned.gratingItem) {
      cloned.gratingItem = inputMachine.take(factory);
    }

    return cloned;
  }

  public clone(): Grater {
    const cloned = new Grater(this);

    cloned.gratingTime = this.gratingTime;
    cloned.gratingProgress = this.gratingProgress;
    cloned.gratingItem = this.gratingItem;

    return cloned;
  }

  public debugOutput(): string {
    const gratingItem = this.gratingItem?.debugOutput() || '-';
    return `GRT${super.debugOutput()}(${gratingItem}:${this.gratingProgress}/${this.gratingTime})`;
  }
}
