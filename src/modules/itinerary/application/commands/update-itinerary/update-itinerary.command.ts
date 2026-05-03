import { ICommand } from '@nestjs/cqrs';
import { UpdateItineraryDto } from './update-itinerary.dto';

export class UpdateItineraryCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly data: UpdateItineraryDto
  ) {}
}
