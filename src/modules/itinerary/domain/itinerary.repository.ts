import { Itinerary } from './itinerary.entity';

export abstract class ItineraryRepository {
  abstract findById(id: string): Promise<Itinerary | null>;
  abstract findBySlug(slug: string): Promise<Itinerary | null>;
  abstract create(data: any): Promise<{ id: string; slug: string }>;
  abstract update(id: string, data: any): Promise<void>;
  abstract delete(id: string): Promise<void>;
  abstract listByAuthor(authorId: string, limit: number, offset: number): Promise<Itinerary[]>;
  abstract countByAuthor(authorId: string): Promise<number>;
  abstract getFullItinerary(id: string): Promise<Itinerary | null>;
}
