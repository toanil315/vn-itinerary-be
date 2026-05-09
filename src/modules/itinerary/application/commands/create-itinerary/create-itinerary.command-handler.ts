import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateItineraryCommand } from "./create-itinerary.command";
import { ItineraryRepository } from "../../../domain/itinerary.repository";
import { Result } from "@/common/domain/result";
import { CreateItineraryResponse } from "./create-itinerary.dto";

@CommandHandler(CreateItineraryCommand)
export class CreateItineraryCommandHandler implements ICommandHandler<CreateItineraryCommand> {
  constructor(private readonly itineraryRepository: ItineraryRepository) {}

  async execute(
    command: CreateItineraryCommand,
  ): Promise<Result<CreateItineraryResponse>> {
    const { data } = command;

    try {
      const result = await this.itineraryRepository.create(data);

      return Result.success(result);
    } catch (error) {
      // In a real app, we'd log this and potentially map specific DB errors
      throw error;
    }
  }
}
