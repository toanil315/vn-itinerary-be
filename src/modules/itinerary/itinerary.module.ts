import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ItineraryController } from './presentation/itinerary.controller';
import { PublicItineraryController } from './presentation/public-itinerary.controller';
import { TagController } from './presentation/tag.controller';
import { BookmarkController } from './presentation/bookmark.controller';
import { ItineraryRepository } from './domain/itinerary.repository';
import { ItineraryRepositoryImpl } from './infrastructure/itinerary.repository.impl';
import { CreateItineraryCommandHandler } from './application/commands/create-itinerary/create-itinerary.command-handler';
import { UpdateItineraryCommandHandler } from './application/commands/update-itinerary/update-itinerary.command-handler';
import { PublishItineraryCommandHandler } from './application/commands/publish-itinerary/publish-itinerary.command-handler';
import { ArchiveItineraryCommandHandler } from './application/commands/archive-itinerary/archive-itinerary.command-handler';
import { TrackViewCommandHandler } from './application/commands/track-view/track-view.command-handler';
import { CreateBookmarkCommandHandler } from './application/commands/create-bookmark/create-bookmark.command-handler';
import { DeleteBookmarkCommandHandler } from './application/commands/delete-bookmark/delete-bookmark.command-handler';
import { ListMyItinerariesQueryHandler } from './application/queries/list-my-itineraries/list-my-itineraries.query-handler';
import { ListItinerariesQueryHandler } from './application/queries/list-itineraries/list-itineraries.query-handler';
import { GetTrendingItinerariesQueryHandler } from './application/queries/get-trending/get-trending.query-handler';
import { GetItineraryDetailQueryHandler } from './application/queries/get-itinerary-detail/get-itinerary-detail.query-handler';
import { GetLeaderboardQueryHandler } from './application/queries/get-leaderboard/get-leaderboard.query-handler';
import { ListTagsQueryHandler } from './application/queries/list-tags/list-tags.query-handler';
import { ListMyBookmarksQueryHandler } from './application/queries/list-my-bookmarks/list-my-bookmarks.query-handler';

const CommandHandlers = [
  CreateItineraryCommandHandler,
  UpdateItineraryCommandHandler,
  PublishItineraryCommandHandler,
  ArchiveItineraryCommandHandler,
  TrackViewCommandHandler,
  CreateBookmarkCommandHandler,
  DeleteBookmarkCommandHandler,
];

const QueryHandlers = [
  ListMyItinerariesQueryHandler,
  ListItinerariesQueryHandler,
  GetTrendingItinerariesQueryHandler,
  GetItineraryDetailQueryHandler,
  GetLeaderboardQueryHandler,
  ListTagsQueryHandler,
  ListMyBookmarksQueryHandler,
];

@Module({
  imports: [CqrsModule],
  controllers: [
    ItineraryController,
    PublicItineraryController,
    TagController,
    BookmarkController,
  ],
  providers: [
    {
      provide: ItineraryRepository,
      useClass: ItineraryRepositoryImpl,
    },
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [ItineraryRepository],
})
export class ItineraryModule {}
