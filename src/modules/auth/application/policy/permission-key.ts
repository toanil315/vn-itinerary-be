export const PermissionKeys = {
  ITINERARY_CREATE: 'itinerary:create',
  ITINERARY_UPDATE: 'itinerary:update',
  ITINERARY_PUBLISH: 'itinerary:publish',
  ITINERARY_ARCHIVE: 'itinerary:archive',
  ITINERARY_LIST_OWN: 'itinerary:list-own',
  ACTIVITY_IMAGE_UPLOAD: 'activity-image:upload',
  BOOKMARK_CREATE: 'bookmark:create',
  BOOKMARK_DELETE: 'bookmark:delete',
  BOOKMARK_LIST: 'bookmark:list',
  AUTH_PROFILE: 'auth:profile',
} as const;

export type PermissionKey =
  (typeof PermissionKeys)[keyof typeof PermissionKeys];
