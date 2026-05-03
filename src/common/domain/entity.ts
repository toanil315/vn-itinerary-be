import { DomainEvent } from './event';

export class Entity {
  domainEvents: DomainEvent[] = [];

  constructor() {
    this.domainEvents = [];
  }

  clear() {
    this.domainEvents = [];
  }

  raise(domainEvent: DomainEvent) {
    this.domainEvents.push(domainEvent);
  }
}
