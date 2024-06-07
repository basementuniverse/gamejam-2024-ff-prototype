import ContentManager from '@basementuniverse/content-manager';
import { pluck } from '@basementuniverse/utils';
import { vec } from '@basementuniverse/vec';
import { FactoryFloor } from '../FactoryFloor';
import { Item } from '../Item';
import { Machine } from './Machine';

export class Oven extends Machine {
  private static readonly WORKING_JITTER_FREQUENCY = 2;
  private static readonly WORKING_JITTER_AMPLITUDE = 2;

  public cookingTime = 2;
  public cookingProgress = 0;
  public cookingItem: Item | null = null;

  private t = 0;

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

  public reset(): Oven {
    return new Oven(this);
  }

  public clone(): Oven {
    const cloned = new Oven(this);

    cloned.cookingTime = this.cookingTime;
    cloned.cookingProgress = this.cookingProgress;
    cloned.cookingItem = this.cookingItem;

    return cloned;
  }

  public update(dt: number) {
    this.t += dt;
  }

  public draw(context: CanvasRenderingContext2D, size: number) {
    context.save();
    context.translate(this.position.x * size, this.position.y * size);

    let s = 0;
    if (this.status === 'working') {
      s =
        Math.sin(this.t * Oven.WORKING_JITTER_FREQUENCY) *
        Oven.WORKING_JITTER_AMPLITUDE;
    }

    let image: HTMLImageElement | undefined = undefined;
    switch (this.direction) {
      case 'left':
        image = ContentManager.get<HTMLImageElement>('oven-left');
        break;

      case 'right':
        image = ContentManager.get<HTMLImageElement>('oven-right');
        break;

      case 'up':
        image = ContentManager.get<HTMLImageElement>('oven-up');
        break;

      case 'down':
        image = ContentManager.get<HTMLImageElement>('oven-down');
        break;
    }

    if (image) {
      context.drawImage(image, -s, -s, size + s, size + s);
    }

    if (this.cookingItem) {
      this.cookingItem.draw(
        context,
        vec.mul(vec(size), 0.35),
        vec.mul(vec(size), 0.4)
      );
    }

    if (this.outputItem) {
      this.outputItem.draw(
        context,
        vec.mul(vec(size), 0.35),
        vec.mul(vec(size), 0.4)
      );
    }

    context.restore();
  }

  public debugOutput(): string {
    const cookingItem = this.cookingItem?.debugOutput() || '-';
    return `OVN${super.debugOutput()}(${cookingItem}:${this.cookingProgress}/${
      this.cookingTime
    })`;
  }
}
