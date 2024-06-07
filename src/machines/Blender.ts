import ContentManager from '@basementuniverse/content-manager';
import { pluck } from '@basementuniverse/utils';
import { vec } from '@basementuniverse/vec';
import { FactoryFloor } from '../FactoryFloor';
import { Item } from '../Item';
import { Machine } from './Machine';

export class Blender extends Machine {
  private static readonly WORKING_JITTER_FREQUENCY = 15;
  private static readonly WORKING_JITTER_AMPLITUDE = 2;

  public blendingTime = 3;
  public blendingProgress = 0;
  public blendingItem: Item | null = null;

  private t = 0;

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

  public reset(): Blender {
    return new Blender(this);
  }

  public clone(): Blender {
    const cloned = new Blender(this);

    cloned.blendingTime = this.blendingTime;
    cloned.blendingProgress = this.blendingProgress;
    cloned.blendingItem = this.blendingItem;

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
        Math.sin(this.t * Blender.WORKING_JITTER_FREQUENCY) *
        Blender.WORKING_JITTER_AMPLITUDE;
      p.y =
        Math.cos(this.t * Blender.WORKING_JITTER_FREQUENCY) *
        Blender.WORKING_JITTER_AMPLITUDE;
    }

    let image: HTMLImageElement | undefined = undefined;
    switch (this.direction) {
      case 'left':
        image = ContentManager.get<HTMLImageElement>('blender-left');
        break;

      case 'right':
        image = ContentManager.get<HTMLImageElement>('blender-right');
        break;

      case 'up':
        image = ContentManager.get<HTMLImageElement>('blender-up');
        break;

      case 'down':
        image = ContentManager.get<HTMLImageElement>('blender-down');
        break;
    }

    if (image) {
      context.drawImage(image, p.x, p.y, size, size);
    }

    if (this.blendingItem) {
      this.blendingItem.draw(context, vec(), vec.mul(vec(size), 0.25));
    }

    if (this.outputItem) {
      this.outputItem.draw(context, vec(), vec.mul(vec(size), 0.25));
    }

    context.restore();
  }

  public debugOutput(): string {
    const blendingItem = this.blendingItem?.debugOutput() || '-';
    return `BLN${super.debugOutput()}(${blendingItem}:${
      this.blendingProgress
    }/${this.blendingTime})`;
  }
}
