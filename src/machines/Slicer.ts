import { pluck } from '@basementuniverse/utils';
import { FactoryFloor } from '../FactoryFloor';
import { Item } from '../Item';
import { Machine } from './Machine';

export class Slicer extends Machine {
  public slicingTime = 1;
  public slicingProgress = 0;
  public slicingItem: Item | null = null;

  public constructor(data: Partial<Slicer> = {}) {
    super(pluck(data, 'position', 'direction'));
  }

  public tick(factory: FactoryFloor): Slicer {
    const cloned = this.clone();

    cloned.status = 'idle';

    if (cloned.slicingItem) {
      cloned.status = 'working';
      cloned.slicingProgress += 1;

      if (cloned.slicingProgress >= cloned.slicingTime) {
        const slicedItem = Item.clone(cloned.slicingItem);
        slicedItem.mergeTags('sliced');

        cloned.outputItem = slicedItem;
        cloned.slicingItem = null;
        cloned.slicingProgress = 0;
      }
    }

    const inputMachine = factory.findAdjacentMachine(
      cloned.position,
      factory.adjustDirection(cloned.direction, cloned.input)
    );

    if (inputMachine && inputMachine.outputItem && !cloned.slicingItem) {
      cloned.slicingItem = inputMachine.take(factory);
    }

    return cloned;
  }

  public clone(): Slicer {
    const cloned = new Slicer(this);

    cloned.slicingTime = this.slicingTime;
    cloned.slicingProgress = this.slicingProgress;
    cloned.slicingItem = this.slicingItem;

    return cloned;
  }

  public debugOutput(): string {
    const slicingItem = this.slicingItem?.debugOutput() || '-';
    return `SLC${super.debugOutput()}(${slicingItem}:${this.slicingProgress}/${
      this.slicingTime
    })`;
  }
}
