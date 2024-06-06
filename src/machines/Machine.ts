import { vec } from '@basementuniverse/vec';
import { Direction, Facing, FactoryFloor } from '../FactoryFloor';
import { Item } from '../Item';

export abstract class Machine {
  public position: vec = vec(0, 0);
  public direction: Direction = 'right';
  public input: Facing = 'back';
  public output: Facing = 'front';
  public outputItem: Item | null = null;
  public status: 'idle' | 'working' | 'broken' = 'idle';

  public constructor(data: Partial<Machine> = {}) {
    Object.assign(this, data);
  }

  public abstract tick(factory: FactoryFloor, ...args: any[]): Machine;

  public abstract clone(): Machine;

  public take(factory: FactoryFloor): Item | null {
    const item = this.outputItem;

    this.outputItem = null;

    const found = factory.newState.find(
      machine => vec.eq(machine.position, this.position)
    );
    if (found) {
      found.outputItem = null;
    }

    return item;
  }

  public render(): string {
    return `(${this.status}|${this.outputItem ? this.outputItem.render() : '-'})`;
  }
}
