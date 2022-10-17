export interface AgeDatapoint {
  id: string;
  age_group: string;
  population_size: number;
}

export interface YearDatapoint {
  id: string;
  year: string;
  population_size: number;
}

export type ToAgeDatapoint = (row: any) => AgeDatapoint;
export type ToYearDatapoint = (row: any) => YearDatapoint;

export type Datapoint = AgeDatapoint | YearDatapoint;
export type DatapointArray = AgeDatapoint[] | YearDatapoint[];
