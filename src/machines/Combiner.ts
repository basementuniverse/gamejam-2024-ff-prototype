import { pluck } from '@basementuniverse/utils';
import { FactoryFloor } from '../FactoryFloor';
import { Item } from '../Item';
import { Facing } from '../types';
import { Machine } from './Machine';

export class Combiner extends Machine {
  public inputs: Facing[] = ['left', 'right', 'back'];
  public combiningItemA: Item | null = null;
  public combiningItemB: Item | null = null;

  public constructor(
    data: Partial<Combiner> & {
      inputs?: Facing[];
    } = {}
  ) {
    super(pluck(data, 'position', 'direction'));

    if (data.inputs) {
      this.inputs = data.inputs;
    }
  }

  public tick(factory: FactoryFloor): Combiner {
    const cloned = this.clone();

    if (cloned.combiningItemA && cloned.combiningItemB) {
      const combinedItem = Item.clone(cloned.combiningItemA);
      combinedItem.addTags(...cloned.combiningItemB.tags);

      cloned.outputItem = combinedItem;
      cloned.combiningItemA = null;
      cloned.combiningItemB = null;
    }

    for (const input of cloned.inputs) {
      const inputMachine = factory.findAdjacentMachine(
        cloned.position,
        factory.adjustDirection(cloned.direction, input)
      );

      if (inputMachine && inputMachine.outputItem) {
        if (!cloned.combiningItemA) {
          cloned.combiningItemA = inputMachine.take(factory);
        } else if (!cloned.combiningItemB) {
          cloned.combiningItemB = inputMachine.take(factory);
        }
      }
    }

    return cloned;
  }

  public clone(): Combiner {
    const cloned = new Combiner(this);

    cloned.inputs = this.inputs;
    cloned.combiningItemA = this.combiningItemA;
    cloned.combiningItemB = this.combiningItemB;

    return cloned;
  }

  public debugOutput(): string {
    const combiningItemA = this.combiningItemA?.debugOutput() || '-';
    const combiningItemB = this.combiningItemB?.debugOutput() || '-';
    return `CMB${super.debugOutput()}(${combiningItemA}+${combiningItemB})`;
  }
}
