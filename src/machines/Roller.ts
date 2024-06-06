import { Machine } from './Machine';
import { FactoryFloor } from '../FactoryFloor';
import { pluck } from '@basementuniverse/utils';
import { Item } from '../Item';

export class Roller extends Machine {
  public rollingTime = 2;
  public rollingProgress = 0;
  public rollingItem: Item | null = null;

  public constructor(data: Partial<Roller> = {}) {
    super(pluck(data, 'position', 'direction'));
  }

  public tick(factory: FactoryFloor): Roller {
    const cloned = this.clone();

    cloned.status = 'idle';

    if (cloned.rollingItem) {
      cloned.status = 'working';
      cloned.rollingProgress += 1;

      if (cloned.rollingProgress >= cloned.rollingTime) {
        const gratedItem = Item.clone(cloned.rollingItem);
        gratedItem.mergeTags('rolled');

        cloned.outputItem = gratedItem;
        cloned.rollingItem = null;
        cloned.rollingProgress = 0;
      }
    }

    const inputMachine = factory.findAdjacentMachine(
      cloned.position,
      factory.adjustDirection(cloned.direction, cloned.input)
    );

    if (inputMachine && inputMachine.outputItem && !cloned.rollingItem) {
      cloned.rollingItem = inputMachine.take(factory);
    }

    return cloned;
  }

  public clone(): Roller {
    const cloned = new Roller(this);

    cloned.rollingTime = this.rollingTime;
    cloned.rollingProgress = this.rollingProgress;
    cloned.rollingItem = this.rollingItem;

    return cloned;
  }

  public render(): string {
    const rollingItem = this.rollingItem?.render() || '-';
    return `ROL${super.render()}(${rollingItem}:${this.rollingProgress}/${this.rollingTime})`;
  }
}
