export interface Stop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  neighborhood?: string;
}

export interface Line {
  id: string;
  number: string;
  name: string;
  stopIds: string[];
}