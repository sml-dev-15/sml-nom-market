export type Industry = {
  name: string;
  quantity: number;
};

export type Land = {
  id: string;
  user_id: string;
  owner: string;
  link?: string;
  industry: Industry[];
  created_at: string;
  timers: {
    id: string;
    end_time: string;
  }[];
};

export const industryOptions = [
  "Oven",
  "Mill",
  "Mine",
  "Forestry",
  "Farm",
  "Sawmill",
] as const;
