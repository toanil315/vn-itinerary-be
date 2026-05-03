## Context

- [DB_SCHEMA.md — Page Query Mapping](file:///Users/dangcongtoan/Desktop/codes/VN%20itinerary/BE/docs/DB_SCHEMA.md)
- [Explore page FE](file:///Users/dangcongtoan/Desktop/codes/VN%20itinerary/vn-itinerary/src/routes/+page.svelte)
- [Detail page FE](file:///Users/dangcongtoan/Desktop/codes/VN%20itinerary/vn-itinerary/src/routes/itineraries/[id]/+page.ts)
- [Leaderboard FE](file:///Users/dangcongtoan/Desktop/codes/VN%20itinerary/vn-itinerary/src/routes/leaderboard/+page.ts)

## Overview

- **Priority:** P1
- **Status:** Pending
- **Description:** Public read APIs for explore, trending, detail, leaderboard, view tracking, tags.

## Implementation Steps

1. **ListItineraries** (`GET /v1/itineraries`) — `@Public()`, paginated, filter by region/tags, published only
2. **GetTrending** (`GET /v1/itineraries/trending`) — `@Public()`, top 10 by view_count
3. **GetItineraryDetail** (`GET /v1/itineraries/:slug`) — `@Public()`, full nested join
4. **GetLeaderboard** (`GET /v1/leaderboard`) — `@Public()`, top 20 with author info
5. **TrackView** (`POST /v1/itineraries/:id/views`) — `@Public()`, IP dedup 24h, atomic view_count++
6. **ListTags** (`GET /v1/tags`) — `@Public()`, all tags

All routes use `@Public()` from `@/modules/auth/public`.

## Response Shapes (aligned to FE)

### Explore Card
```ts
{ id, title, slug, duration, estimatedPriceCents, currency, avgRating,
  viewCount, coverImageUrl, region, tags: string[],
  author: { displayName, avatarUrl } }
```

### Detail
```ts
{ ...itinerary, author: { displayName, avatarUrl, bio, isVerified },
  days: [{ dayNumber, theme, activities: [{ title, description,
  sessionType, startTime, endTime, costDisplay, locationName, mapLink,
  categoryTag, images: [{ imageUrl, altText }] }] }], tags: string[] }
```

### Leaderboard
```ts
{ id, title, coverImageUrl, viewCount,
  author: { displayName, username, avatarUrl } }
```

## Todo List

- [x] ListItineraries query + handler + DTO
- [x] GetTrending query + handler
- [x] GetItineraryDetail query + handler
- [x] GetLeaderboard query + handler
- [x] TrackView command + handler
- [x] ListTags query + handler
- [x] Public controller + tag controller
- [x] Wire into ItineraryModule

## Success Criteria

- FE can replace mock data with real API calls
- All pages render: explore, detail, leaderboard
- View count increments (deduped per IP/24h)
