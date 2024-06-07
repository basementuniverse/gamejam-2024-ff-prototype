import Camera from '@basementuniverse/camera';
import ContentManager from '@basementuniverse/content-manager';
import InputManager from '@basementuniverse/input-manager';
import { vec } from '@basementuniverse/vec';
import { Bounds, intersectPointAABB } from './utilities';

export class Button {
  private bounds: Bounds;
  private hover = false;

  constructor(
    public position: vec,
    public size: vec,
    public image: string | null,
    public colour: string | null,
    public label: string,
    private onClick: () => void
  ) {}

  public update(camera: Camera) {
    this.bounds = {
      left: this.position.x,
      right: this.position.x + this.size.x,
      top: this.position.y,
      bottom: this.position.y + this.size.y,
    };

    this.hover = false;
    if (
      intersectPointAABB(
        camera.positionToWorld(InputManager.mousePosition),
        this.bounds
      )
    ) {
      this.hover = true;

      if (InputManager.mousePressed()) {
        const sound = ContentManager.get<HTMLAudioElement>('button-sound');
        if (sound) {
          sound.play();
        }

        this.onClick();
      }
    }
  }

  public draw(context: CanvasRenderingContext2D) {
    context.save();

    if (this.image) {
      const image = ContentManager.get<HTMLImageElement>(this.image);
      const s = this.hover ? 5 : 0;

      if (image) {
        context.drawImage(
          image,
          this.position.x - s / 2,
          this.position.y - s / 2,
          this.size.x + s,
          this.size.y + s
        );
      }
    }

    if (this.colour) {
      context.strokeStyle = this.colour;
      context.lineWidth = this.hover ? 4 : 2;

      context.strokeRect(
        this.position.x,
        this.position.y,
        this.size.x,
        this.size.y
      );
    }

    if (this.label) {
      context.font = this.hover ? 'bold 18px monospace' : '16px monospace';
      context.fillStyle = this.colour ?? 'white';
      context.textAlign = 'center';
      context.textBaseline = 'middle';

      context.fillText(
        this.label,
        this.position.x + this.size.x / 2,
        this.position.y + this.size.y / 2
      );
    }

    context.restore();
  }
}
