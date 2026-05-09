export enum SessionType {
  MORNING = 'morning',
  LUNCH = 'lunch',
  AFTERNOON = 'afternoon',
  EVENING = 'evening',
}

export class ActivityImage {
  constructor(
    public readonly id: string,
    public readonly objectKey: string,
    public readonly url: string | null,
    public readonly caption: string | null,
    public readonly displayOrder: number,
  ) {}

  static create(props: {
    id: string;
    objectKey: string;
    url?: string | null;
    caption?: string | null;
    displayOrder: number;
  }): ActivityImage {
    return new ActivityImage(
      props.id,
      props.objectKey,
      props.url ?? null,
      props.caption ?? null,
      props.displayOrder,
    );
  }
}

export class Activity {
  constructor(
    public readonly id: string,
    public readonly dayId: string,
    public readonly title: string,
    public readonly description: string | null,
    public readonly sessionType: SessionType | null,
    public readonly orderIndex: number,
    public readonly locationName: string | null,
    public readonly locationAddress: string | null,
    public readonly locationLat: number | null,
    public readonly locationLng: number | null,
    public readonly estimatedCost: number | null,
    public readonly currency: string,
    public readonly costDisplay: string | null,
    public readonly mapLink: string | null,
    public readonly categoryTag: string | null,
    public readonly images: ActivityImage[] = [],
  ) {}

  static create(props: {
    id: string;
    dayId: string;
    title: string;
    description?: string | null;
    sessionType?: SessionType | null;
    orderIndex: number;
    locationName?: string | null;
    locationAddress?: string | null;
    locationLat?: number | null;
    locationLng?: number | null;
    estimatedCost?: number | null;
    currency?: string;
    costDisplay?: string | null;
    mapLink?: string | null;
    categoryTag?: string | null;
    images?: ActivityImage[];
  }): Activity {
    return new Activity(
      props.id,
      props.dayId,
      props.title,
      props.description ?? null,
      props.sessionType ?? null,
      props.orderIndex,
      props.locationName ?? null,
      props.locationAddress ?? null,
      props.locationLat ?? null,
      props.locationLng ?? null,
      props.estimatedCost ?? null,
      props.currency ?? 'VND',
      props.costDisplay ?? null,
      props.mapLink ?? null,
      props.categoryTag ?? null,
      props.images ?? [],
    );
  }
}
