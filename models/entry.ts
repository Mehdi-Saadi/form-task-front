export interface Entry {
  title: string;
  description: string;
  date: string;
  photos: string[]
}

export interface Photo {
  url: string | null;
  progress: number;
  name: string;
}
