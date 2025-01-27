export function Now(): Date {
  return new Date();
}

export function ToString(d: Date): string {
  return d.toISOString().replace('T', ' ');
}

export type TimeAgoParams = { years?: number, months?: number, days?: number, hours?: number, minutes?: number, seconds?: number, milliseconds?: number };

export function TimeAgo(d: Date, { years, months, days, hours, minutes, seconds, milliseconds }: TimeAgoParams): Date {
  let date = new Date(d);
  if (years) date.setFullYear(d.getFullYear() - years);
  if (months) date.setMonth(d.getMonth() - months);
  if (days) date.setDate(d.getDate() - days);
  if (hours) date.setHours(d.getHours() - hours);
  if (minutes) date.setMinutes(d.getMinutes() - minutes);
  if (seconds) date.setSeconds(d.getSeconds() - seconds);
  if (milliseconds) date.setMilliseconds(d.getMilliseconds() - milliseconds);

  return date
}

export type StartEndParams = { start?: TimeAgoParams, end?: TimeAgoParams };
export type Start = string
export type End = string
export type StartEndResult = { start: Start, end: End };
export function StartEnd(start: TimeAgoParams = { hours: 24 }, end: TimeAgoParams = {}): StartEndResult {
  let now = Now();
  return {
    start: ToString(TimeAgo(now, start)),
    end: ToString(TimeAgo(now, end))
  }
}

export function OneDayAgo(): string {
  return ToString(TimeAgo(Now(), { days: 1 }));
}

export function NowString(): string {
  return ToString(Now());
}

