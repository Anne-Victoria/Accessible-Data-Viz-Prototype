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

export interface BirthsDeathsDatapoint {
  id: string;
  year: string;
  births: number;
  deaths: number;
}

type ToAgeDatapoint = (row: any) => AgeDatapoint;
type ToYearDatapoint = (row: any) => YearDatapoint;
type ToBirthsDeathsDatapoint = (row: any) => BirthsDeathsDatapoint;

export type ToDatapoint =
  | ToAgeDatapoint
  | ToYearDatapoint
  | ToBirthsDeathsDatapoint;

export type Datapoint = AgeDatapoint | YearDatapoint | BirthsDeathsDatapoint;

export type DatapointArray =
  | AgeDatapoint[]
  | YearDatapoint[]
  | BirthsDeathsDatapoint[];
