import { randomUUID } from 'crypto';

export class DomainEvent {
  static type: string;

  public readonly id: string;
  public readonly occurredOn: number;
  public readonly type: string;

  constructor(type: string) {
    this.id = randomUUID();
    this.occurredOn = Date.now();
    this.type = type;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}
