import Camera from '@basementuniverse/camera';
import ContentManager from '@basementuniverse/content-manager';

export class Customer {
  public status: 'pending' | 'waiting' | 'served-happy' | 'served-angry' =
    'pending';

  public reset() {
    this.status = 'pending';
  }

  public draw(context: CanvasRenderingContext2D, camera: Camera) {
    context.save();

    let customerImageName = 'customer-waiting';
    if (this.status === 'served-happy') {
      customerImageName = 'customer-happy';
    }
    if (this.status === 'served-angry') {
      customerImageName = 'customer-angry';
    }

    const customerImage =
      ContentManager.get<HTMLImageElement>(customerImageName);
    if (customerImage) {
      context.drawImage(
        customerImage,
        camera.bounds.right - 400,
        camera.bounds.bottom - 200,
        200,
        200
      );
    }

    context.restore();
  }
}
