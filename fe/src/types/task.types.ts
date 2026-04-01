export type TaskType = 'scheduled' | 'flexible';

export interface Task {
  type: TaskType;
  scheduledAt: string | null;
  duration: number | null;
  rangeFrom: string | null;
  rangeTo: string | null;
  done: boolean;
}
