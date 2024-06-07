import Camera from '@basementuniverse/camera';
import ContentManager from '@basementuniverse/content-manager';

export class Customer {
  private static readonly DEFAULT_SPEECH = `Make me a\npepperoni pizza!`;
  public status: 'pending' | 'waiting' | 'served-happy' | 'served-angry' =
    'pending';

  public speech: string = Customer.DEFAULT_SPEECH;

  public reset() {
    this.status = 'pending';
    this.speech = Customer.DEFAULT_SPEECH;
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
        camera.bounds.right - 300,
        camera.bounds.bottom - 200,
        200,
        200
      );
    }

    if (this.speech) {
      const speechBubbleImage = ContentManager.get<HTMLImageElement>(
        'speech-bubble'
      );
      if (speechBubbleImage) {
        context.drawImage(
          speechBubbleImage,
          camera.bounds.right - 250,
          camera.bounds.bottom - 350,
          200,
          200
        );

        context.font = '16px sans-serif';
        context.fillStyle = 'black';
        context.textAlign = 'center';
        context.textBaseline = 'middle';

        const text = this.speech.split('\n');
        let y = 0;
        for (let i = 0; i < text.length; i++) {
          context.fillText(
            text[i],
            camera.bounds.right - 155,
            camera.bounds.bottom - 280 + y
          );
          y += 20;
        }
      }
    }

    context.restore();
  }
}
