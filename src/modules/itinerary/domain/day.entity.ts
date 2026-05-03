import { Activity } from './activity.entity';

export class ItineraryDay {
  constructor(
    public readonly id: string,
    public readonly itineraryId: string,
    public readonly dayNumber: number,
    public readonly theme: string | null,
    public readonly orderIndex: number,
    public readonly activities: Activity[] = [],
  ) {}

  static create(props: {
    id: string;
    itineraryId: string;
    dayNumber: number;
    theme?: string | null;
    orderIndex: number;
    activities?: Activity[];
  }): ItineraryDay {
    return new ItineraryDay(
      props.id,
      props.itineraryId,
      props.dayNumber,
      props.theme ?? null,
      props.orderIndex,
      props.activities ?? [],
    );
  }
}
