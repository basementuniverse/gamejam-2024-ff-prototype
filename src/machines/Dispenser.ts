import { Item } from '../Item';
import { Machine } from './Machine';
import { FactoryFloor } from '../FactoryFloor';
import { pluck } from '@basementuniverse/utils';

export class Dispenser extends Machine {
  public item: Item | null = null;

  public constructor(data: Partial<Dispenser> = {}) {
    super(pluck(data, 'position', 'direction'));

    this.item = data.item || null;
  }

  public tick(factory: FactoryFloor, dispense: boolean): Dispenser {
    const cloned = this.clone();

    if (!cloned.item) {
      return cloned;
    }

    if (!cloned.outputItem && dispense) {
      cloned.outputItem = Item.clone(cloned.item);
    }

    return cloned;
  }

  public clone(): Dispenser {
    return new Dispenser(this);
  }

  public render(): string {
    return `DSP${super.render()}`;
  }
}
