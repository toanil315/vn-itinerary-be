import { createZodDto } from 'nestjs-zod';
import { CreateItinerarySchema } from '../create-itinerary/create-itinerary.dto';

export class UpdateItineraryDto extends createZodDto(CreateItinerarySchema) {}
