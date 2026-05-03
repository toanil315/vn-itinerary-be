## Overview

- **Priority:** P2
- **Status:** Pending
- **Description:** Bookmark/unbookmark itineraries for authenticated users.

## Implementation Steps

1. **CreateBookmark** (`POST /v1/bookmarks`) — body: `{ itineraryId }`, check exists, insert
2. **DeleteBookmark** (`DELETE /v1/bookmarks/:itineraryId`) — delete by user+itinerary
3. **ListMyBookmarks** (`GET /v1/me/bookmarks`) — paginated, join itineraries

## Todo List

- [x] CreateBookmark command + handler
- [x] DeleteBookmark command + handler
- [x] ListMyBookmarks query
- [x] Bookmark controller

## Success Criteria

- Bookmark/unbookmark works, duplicate is idempotent
- `GET /me/bookmarks` returns paginated list
