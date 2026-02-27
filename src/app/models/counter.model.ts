export interface Counter {
  id: string;
  title: string;
  value: number;
}

export interface CounterGroup {
  id: string;
  name: string;
  counters: Counter[];
}