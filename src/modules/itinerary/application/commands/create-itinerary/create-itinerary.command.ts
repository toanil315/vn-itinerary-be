import { ICommand } from '@nestjs/cqrs';
import { CreateItineraryDto } from './create-itinerary.dto';

export class CreateItineraryCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly data: CreateItineraryDto
  ) {}
}
