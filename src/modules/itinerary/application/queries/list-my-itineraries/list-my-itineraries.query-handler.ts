import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListMyItinerariesQuery } from './list-my-itineraries.query';
import { ItineraryRepository } from '../../../domain/itinerary.repository';
import { Result } from '@/common/domain/result';
import { ListMyItinerariesResponse } from './list-my-itineraries.dto';

@QueryHandler(ListMyItinerariesQuery)
export class ListMyItinerariesQueryHandler implements IQueryHandler<ListMyItinerariesQuery> {
  constructor(private readonly itineraryRepository: ItineraryRepository) {}

  async execute(query: ListMyItinerariesQuery): Promise<Result<ListMyItinerariesResponse>> {
    const { userId, page, limit } = query;
    const offset = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.itineraryRepository.listByAuthor(userId, limit, offset),
      this.itineraryRepository.countByAuthor(userId),
    ]);

    return Result.success({
      items: items.map(item => ({
        id: item.id,
        title: item.title,
        slug: item.slug,
        status: item.status,
        updated_at: item.updatedAt.toISOString(),
        thumbnail_url: item.thumbnailUrl,
        region: item.region,
      })),
      total,
    });
  }
}
