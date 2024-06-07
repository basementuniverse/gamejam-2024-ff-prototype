import ContentManager from '@basementuniverse/content-manager';
import { pluck } from '@basementuniverse/utils';
import { vec } from '@basementuniverse/vec';
import { FactoryFloor } from '../FactoryFloor';
import { Item } from '../Item';
import { Machine } from './Machine';

export class Dispenser extends Machine {
  public static readonly ROTATIONS = ['down'];

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

  public reset(): Dispenser {
    return new Dispenser(this);
  }

  public clone(): Dispenser {
    return new Dispenser(this);
  }

  public update(dt: number) {}

  public draw(context: CanvasRenderingContext2D, size: number) {
    context.save();
    context.translate(this.position.x * size, this.position.y * size);

    let image = ContentManager.get<HTMLImageElement>('dispenser');
    if (image) {
      context.drawImage(image, 0, 0, size, size);
    }

    if (this.outputItem) {
      this.outputItem.draw(context, vec(), vec.mul(vec(size), 0.25));
    }

    context.restore();
  }

  public debugOutput(): string {
    return `DSP${super.debugOutput()}`;
  }
}
