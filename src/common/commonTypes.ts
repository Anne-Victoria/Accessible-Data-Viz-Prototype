export interface AgeDatapoint {
  id: string;
  age_group: string;
  population_size: number;
}

export interface BirthsDeathsDatapoint {
  id: string;
  year: number;
  births: number;
  deaths: number;
}

type ToAgeDatapoint = (row: any) => AgeDatapoint;
type ToBirthsDeathsDatapoint = (row: any) => BirthsDeathsDatapoint;

export type ToDatapoint = ToAgeDatapoint | ToBirthsDeathsDatapoint;

export type Datapoint = AgeDatapoint | BirthsDeathsDatapoint;

export type DatapointArray = AgeDatapoint[] | BirthsDeathsDatapoint[];
