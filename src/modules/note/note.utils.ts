export enum SchedulerType {
  DAY = 'day',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

export const schedulerImportant = (schedulerType?: SchedulerType) => {
  if (!schedulerType) return null;
  if (schedulerType === 'day') return 1;
  if (schedulerType === 'weekly') return 2;
  if (schedulerType === 'monthly') return 3;
};
