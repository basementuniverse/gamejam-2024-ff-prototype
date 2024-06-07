import ContentManager from '@basementuniverse/content-manager';
import { pluck } from '@basementuniverse/utils';
import { vec } from '@basementuniverse/vec';
import { FactoryFloor } from '../FactoryFloor';
import { Item } from '../Item';
import { Machine } from './Machine';

export class Slicer extends Machine {
  private static readonly WORKING_JITTER_FREQUENCY = 15;
  private static readonly WORKING_JITTER_AMPLITUDE = 2;

  public slicingTime = 1;
  public slicingProgress = 0;
  public slicingItem: Item | null = null;

  private t = 0;

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

  public reset(): Slicer {
    return new Slicer(this);
  }

  public clone(): Slicer {
    const cloned = new Slicer(this);

    cloned.slicingTime = this.slicingTime;
    cloned.slicingProgress = this.slicingProgress;
    cloned.slicingItem = this.slicingItem;

    return cloned;
  }

  public update(dt: number) {
    this.t += dt;
  }

  public draw(context: CanvasRenderingContext2D, size: number) {
    context.save();
    context.translate(this.position.x * size, this.position.y * size);

    const p = vec(0, 0);
    if (this.status === 'working') {
      p.x =
        Math.sin(this.t * Slicer.WORKING_JITTER_FREQUENCY) *
        Slicer.WORKING_JITTER_AMPLITUDE;
      p.y =
        Math.cos(this.t * Slicer.WORKING_JITTER_FREQUENCY) *
        Slicer.WORKING_JITTER_AMPLITUDE;
    }

    let image: HTMLImageElement | undefined = undefined;
    switch (this.direction) {
      case 'left':
        image = ContentManager.get<HTMLImageElement>('slicer-left');
        break;

      case 'right':
        image = ContentManager.get<HTMLImageElement>('slicer-right');
        break;

      case 'up':
        image = ContentManager.get<HTMLImageElement>('slicer-up');
        break;

      case 'down':
        image = ContentManager.get<HTMLImageElement>('slicer-down');
        break;
    }

    if (image) {
      context.drawImage(image, p.x, p.y, size, size);
    }

    if (this.slicingItem) {
      this.slicingItem.draw(context, vec(), vec.mul(vec(size), 0.25));
    }

    if (this.outputItem) {
      this.outputItem.draw(context, vec(), vec.mul(vec(size), 0.25));
    }

    context.restore();
  }

  public debugOutput(): string {
    const slicingItem = this.slicingItem?.debugOutput() || '-';
    return `SLC${super.debugOutput()}(${slicingItem}:${this.slicingProgress}/${
      this.slicingTime
    })`;
  }
}
