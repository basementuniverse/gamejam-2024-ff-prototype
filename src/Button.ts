import Camera from '@basementuniverse/camera';
import ContentManager from '@basementuniverse/content-manager';
import InputManager from '@basementuniverse/input-manager';
import { vec } from '@basementuniverse/vec';
import { Bounds, intersectPointAABB } from './utilities';

export class Button {
  private bounds: Bounds;

  constructor(
    public position: vec,
    public size: vec,
    public image: string | null,
    public label: string,
    private onClick: () => void
  ) {
    this.bounds = {
      left: position.x,
      right: position.x + size.x,
      top: position.y,
      bottom: position.y + size.y,
    };
  }

  public update(camera: Camera) {
    if (
      InputManager.mousePressed() &&
      intersectPointAABB(
        camera.positionToWorld(InputManager.mousePosition),
        this.bounds
      )
    ) {
      this.onClick();
    }
  }

  public draw(context: CanvasRenderingContext2D) {
    context.save();

    if (this.image) {
      const image = ContentManager.get<HTMLImageElement>(this.image);

      if (image) {
        context.drawImage(
          image,
          this.position.x,
          this.position.y,
          this.size.x,
          this.size.y
        );
      }
    }

    context.strokeStyle = 'white';
    context.lineWidth = 2;

    context.strokeRect(
      this.position.x,
      this.position.y,
      this.size.x,
      this.size.y
    );

    context.font = '16px monospace';
    context.fillStyle = 'white';
    context.textAlign = 'center';
    context.textBaseline = 'middle';

    context.fillText(
      this.label,
      this.position.x + this.size.x / 2,
      this.position.y + this.size.y / 2
    );

    context.restore();
  }
}
