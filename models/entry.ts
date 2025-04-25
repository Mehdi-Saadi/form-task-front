export interface Entry {
  title: string;
  description: string;
  date: string;
  photos: string[]
}

export interface BackendEntry {
  id: number;
  title: string;
  description: string;
  date: string;
  photos: {
    url: string;
    name: string;
  }[];
  created_at: string;
  updated_at: string;
}

export interface Photo {
  url: string | null;
  progress?: number;
  name: string;
}
