import { Machine } from './Machine';
import { FactoryFloor } from '../FactoryFloor';
import { pluck } from '@basementuniverse/utils';
import { Item } from '../Item';

export class Oven extends Machine {
  public cookingTime = 2;
  public cookingProgress = 0;
  public cookingItem: Item | null = null;

  public constructor(data: Partial<Oven> = {}) {
    super(pluck(data, 'position', 'direction'));
  }

  public tick(factory: FactoryFloor): Oven {
    const cloned = this.clone();

    cloned.status = 'idle';

    if (cloned.cookingItem) {
      cloned.status = 'working';
      cloned.cookingProgress += 1;

      if (cloned.cookingProgress >= cloned.cookingTime) {
        const cookedItem = Item.clone(cloned.cookingItem);
        cookedItem.mergeTags('cooked');

        cloned.outputItem = cookedItem;
        cloned.cookingItem = null;
        cloned.cookingProgress = 0;
      }
    }

    const inputMachine = factory.findAdjacentMachine(
      cloned.position,
      factory.adjustDirection(cloned.direction, cloned.input)
    );

    if (inputMachine && inputMachine.outputItem && !cloned.cookingItem) {
      cloned.cookingItem = inputMachine.take(factory);
    }

    return cloned;
  }

  public clone(): Oven {
    const cloned = new Oven(this);

    cloned.cookingTime = this.cookingTime;
    cloned.cookingProgress = this.cookingProgress;
    cloned.cookingItem = this.cookingItem;

    return cloned;
  }

  public render(): string {
    const cookingItem = this.cookingItem?.render() || '-';
    return `OVN${super.render()}(${cookingItem}:${this.cookingProgress}/${this.cookingTime})`;
  }
}
