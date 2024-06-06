import { Machine } from './Machine';
import { FactoryFloor } from '../FactoryFloor';
import { pluck } from '@basementuniverse/utils';
import { Item } from '../Item';

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

  public render(): string {
    const slicingItem = this.slicingItem?.render() || '-';
    return `OVN${super.render()}(${slicingItem}:${this.slicingProgress}/${this.slicingTime})`;
  }
}
