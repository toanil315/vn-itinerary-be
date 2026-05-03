import { BusinessError } from '@/common/domain/error';

export namespace ItineraryErrors {
  export const NotFound = (id: string) =>
    BusinessError.NotFound('ITINERARY.NOT_FOUND', `Itinerary with ID ${id} not found`);

  export const NotOwner = () =>
    BusinessError.Problem('ITINERARY.NOT_OWNER', 'You do not have permission to modify this itinerary');

  export const CannotPublish = (reason: string) =>
    BusinessError.Problem('ITINERARY.CANNOT_PUBLISH', `Cannot publish itinerary: ${reason}`);

  export const AlreadyPublished = () =>
    BusinessError.Problem('ITINERARY.ALREADY_PUBLISHED', 'Itinerary is already published');
}
