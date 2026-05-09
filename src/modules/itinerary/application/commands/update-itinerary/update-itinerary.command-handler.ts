import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateItineraryCommand } from './update-itinerary.command';
import { ItineraryRepository } from '../../../domain/itinerary.repository';
import { ItineraryErrors } from '../../../domain/itinerary.errors';
import { Result } from '@/common/domain/result';

@CommandHandler(UpdateItineraryCommand)
export class UpdateItineraryCommandHandler implements ICommandHandler<UpdateItineraryCommand> {
  constructor(private readonly itineraryRepository: ItineraryRepository) {}

  async execute(command: UpdateItineraryCommand): Promise<Result<void>> {
    const { id, userId, data } = command;

    const itinerary = await this.itineraryRepository.findById(id);
    if (!itinerary) {
      return Result.failure(ItineraryErrors.NotFound(id));
    }

    if (!itinerary.isOwner(userId)) {
      return Result.failure(ItineraryErrors.NotOwner());
    }

    if (itinerary.status === 'published') {
      return Result.failure(ItineraryErrors.AlreadyPublished());
    }

    await this.itineraryRepository.update(id, {
      ...data,
      userId,
    });

    return Result.success(undefined);
  }
}
