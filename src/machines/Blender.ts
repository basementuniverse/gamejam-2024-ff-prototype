import { Machine } from './Machine';
import { FactoryFloor } from '../FactoryFloor';
import { pluck } from '@basementuniverse/utils';
import { Item } from '../Item';

export class Blender extends Machine {
  public blendingTime = 3;
  public blendingProgress = 0;
  public blendingItem: Item | null = null;

  public constructor(data: Partial<Blender> = {}) {
    super(pluck(data, 'position', 'direction'));
  }

  public tick(factory: FactoryFloor): Blender {
    const cloned = this.clone();

    cloned.status = 'idle';

    if (cloned.blendingItem) {
      if (cloned.blendingItem.hasSomeTags('dough', 'cooked')) {
        cloned.status = 'broken';

        return cloned;
      }

      cloned.status = 'working';
      cloned.blendingProgress += 1;

      if (cloned.blendingProgress >= cloned.blendingTime) {
        const blendedItem = Item.clone(cloned.blendingItem);
        blendedItem.mergeTags('blended');

        cloned.outputItem = blendedItem;
        cloned.blendingItem = null;
        cloned.blendingProgress = 0;
      }
    }

    const inputMachine = factory.findAdjacentMachine(
      cloned.position,
      factory.adjustDirection(cloned.direction, cloned.input)
    );

    if (inputMachine && inputMachine.outputItem && !cloned.blendingItem) {
      cloned.blendingItem = inputMachine.take(factory);
    }

    return cloned;
  }

  public clone(): Blender {
    const cloned = new Blender(this);

    cloned.blendingTime = this.blendingTime;
    cloned.blendingProgress = this.blendingProgress;
    cloned.blendingItem = this.blendingItem;

    return cloned;
  }

  public render(): string {
    const blendingItem = this.blendingItem?.render() || '-';
    return `BLN${super.render()}(${blendingItem}:${this.blendingProgress}/${this.blendingTime})`;
  }
}
