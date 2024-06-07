import { vec } from '@basementuniverse/vec';
import { FactoryFloor } from '../FactoryFloor';
import { Item } from '../Item';
import { Direction, Facing } from '../types';

export abstract class Machine {
  public static readonly ROTATIONS = ['right', 'down', 'left', 'up'];

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

  public abstract reset(): Machine;

  public abstract clone(): Machine;

  public take(factory: FactoryFloor): Item | null {
    const item = this.outputItem;

    this.outputItem = null;

    const found = factory.newState.find(machine =>
      vec.eq(machine.position, this.position)
    );
    if (found) {
      found.outputItem = null;
    }

    return item;
  }

  public abstract draw(context: CanvasRenderingContext2D, size: number): void;

  public abstract update(dt: number): void;

  public debugOutput(): string {
    return `(${this.status}|${
      this.outputItem ? this.outputItem.debugOutput() : '-'
    })`;
  }
}
