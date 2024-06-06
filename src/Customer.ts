export class Customer {
  public status: 'pending' | 'waiting' | 'served' = 'pending';

  public reset() {
    this.status = 'pending';
  }
}
