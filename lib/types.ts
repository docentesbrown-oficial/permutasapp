export type ScheduleItem = {
  day: string;
  from: string;
  to: string;
};

export type Puesto = {
  id: string;
  description: string;
  pid: string;
  school: string;
  district: string;
  schedule: ScheduleItem[];
  status: "published" | "paused" | "matched" | "in_process" | "permuted";
  created_at: string;
};
