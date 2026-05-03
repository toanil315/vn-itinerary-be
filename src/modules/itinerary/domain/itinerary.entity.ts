import { ItineraryDay } from './day.entity';

export enum ItineraryStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export class Itinerary {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly title: string,
    public readonly slug: string,
    public readonly description: string | null,
    public readonly region: string,
    public readonly duration: string,
    public readonly durationDays: number,
    public readonly thumbnailUrl: string | null,
    public readonly status: ItineraryStatus,
    public readonly estimatedPriceCents: number | null,
    public readonly currency: string,
    public readonly avgRating: number,
    public readonly viewCount: number,
    public readonly likeCount: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly publishedAt: Date | null,
    public readonly days: ItineraryDay[] = [],
    public readonly tags: string[] = [],
  ) {}

  static create(props: {
    id: string;
    userId: string;
    title: string;
    slug: string;
    description?: string | null;
    region: string;
    duration: string;
    durationDays: number;
    thumbnailUrl?: string | null;
    status: ItineraryStatus;
    estimatedPriceCents?: number | null;
    currency?: string;
    avgRating?: number;
    viewCount?: number;
    likeCount?: number;
    createdAt: Date;
    updatedAt: Date;
    publishedAt?: Date | null;
    days?: ItineraryDay[];
    tags?: string[];
  }): Itinerary {
    return new Itinerary(
      props.id,
      props.userId,
      props.title,
      props.slug,
      props.description ?? null,
      props.region,
      props.duration,
      props.durationDays,
      props.thumbnailUrl ?? null,
      props.status,
      props.estimatedPriceCents ?? null,
      props.currency ?? 'USD',
      props.avgRating ?? 0,
      props.viewCount ?? 0,
      props.likeCount ?? 0,
      props.createdAt,
      props.updatedAt,
      props.publishedAt ?? null,
      props.days ?? [],
      props.tags ?? [],
    );
  }

  isOwner(userId: string): boolean {
    return this.userId === userId;
  }

  canPublish(): boolean {
    if (this.status === ItineraryStatus.PUBLISHED) return false;
    if (this.days.length === 0) return false;
    return this.days.some(day => day.activities.length > 0);
  }
}
