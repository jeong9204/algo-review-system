import { useProblemStore } from "@/entities/problem/model/problemStore";

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];
const VISIBLE_WEEKS = 20;
const CELL_SIZE = 16;
const CELL_GAP = 4;
const WEEK_WIDTH = CELL_SIZE + CELL_GAP;
const DASHBOARD_TIME_ZONE = "Asia/Seoul";

const dateKeyFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: DASHBOARD_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const datePartFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: DASHBOARD_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const weekdayFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: DASHBOARD_TIME_ZONE,
  weekday: "short",
});
const WEEKDAY_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

function getZonedDateParts(date: Date) {
  const parts = datePartFormatter.formatToParts(date);
  const year = Number(parts.find((part) => part.type === "year")?.value ?? "0");
  const month = Number(
    parts.find((part) => part.type === "month")?.value ?? "1",
  );
  const day = Number(parts.find((part) => part.type === "day")?.value ?? "1");

  return { year, month, day };
}

function createZonedDate(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month - 1, day, 12));
}

function getTodayInDashboardTimeZone() {
  const { year, month, day } = getZonedDateParts(new Date());
  return createZonedDate(year, month, day);
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setUTCDate(nextDate.getUTCDate() + days);
  return nextDate;
}

function getWeekdayIndex(date: Date) {
  return WEEKDAY_INDEX[weekdayFormatter.format(date)] ?? 0;
}

function toDateKey(date: Date) {
  return dateKeyFormatter.format(date);
}

function formatMonthLabel(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    timeZone: DASHBOARD_TIME_ZONE,
  });
}

function formatFullDate(date: Date) {
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: DASHBOARD_TIME_ZONE,
  });
}

function parseProblemActivityDate(value: string, fallback?: string) {
  const parsed = new Date(value);

  if (!Number.isNaN(parsed.getTime())) {
    return parsed;
  }

  if (fallback) {
    const fallbackDate = new Date(fallback);
    if (!Number.isNaN(fallbackDate.getTime())) {
      return fallbackDate;
    }
  }

  return null;
}

function getHeatColor(count: number) {
  if (count === 0) return "bg-slate-100 dark:bg-slate-800";
  if (count === 1) return "bg-amber-200 dark:bg-amber-900/55";
  if (count === 2) return "bg-amber-300 dark:bg-amber-700/70";
  if (count === 3) return "bg-amber-500 dark:bg-amber-500/85";

  return "bg-amber-700 dark:bg-amber-300";
}

export default function DashboardPage() {
  const problems = useProblemStore((state) => state.problems);

  const reviewCount = problems.filter(
    (problem) => problem.status === "review",
  ).length;
  const masteredCount = problems.filter(
    (problem) => problem.status === "mastered",
  ).length;
  const priorityCount = problems.filter(
    (problem) => problem.isPriorityReview,
  ).length;

  const countsByDate = problems.reduce<Record<string, number>>(
    (acc, problem) => {
      const createdAt = parseProblemActivityDate(
        problem.createdAt,
        problem.updatedAt,
      );

      if (!createdAt) {
        return acc;
      }

      const key = toDateKey(createdAt);
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    },
    {},
  );

  const today = getTodayInDashboardTimeZone();
  const currentWeekStart = addDays(today, -getWeekdayIndex(today));
  const startDate = addDays(currentWeekStart, -((VISIBLE_WEEKS - 1) * 7));

  const totalDays = VISIBLE_WEEKS * 7;
  const calendarDays = Array.from({ length: totalDays }, (_, index) => {
    const date = addDays(startDate, index);
    const isFuture = date.getTime() > today.getTime();
    const dateKey = toDateKey(date);

    return {
      date,
      key: dateKey,
      count: isFuture ? 0 : countsByDate[dateKey] ?? 0,
      isFuture,
    };
  });

  const weeks = Array.from({ length: VISIBLE_WEEKS }, (_, weekIndex) =>
    calendarDays.slice(weekIndex * 7, weekIndex * 7 + 7),
  );

  const monthLabels = weeks.map((week, weekIndex) => {
    if (weekIndex === 0) {
      return formatMonthLabel(week[0].date);
    }

    const monthStartDay = week.find((day) => day.date.getDate() === 1);

    return monthStartDay ? formatMonthLabel(monthStartDay.date) : "";
  });
  const monthLabelPositions = monthLabels
    .map((label, weekIndex) => ({ label, weekIndex }))
    .filter((item) => item.label);

  const activeDayCount = calendarDays.filter((day) => day.count > 0).length;

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-line-100 bg-white px-6 py-8 text-ink-950 shadow-[0_24px_70px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-ink-950 dark:text-white dark:shadow-[0_24px_70px_rgba(2,6,23,0.38)] sm:px-8">
        <p className="text-sm font-medium tracking-[0.2em] text-accent-600 dark:text-teal-200 uppercase">
          Recall Snapshot
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink-950 dark:text-white sm:text-4xl">
          회상 기반 복습 현황
        </h1>
        <p className="mt-3 text-sm leading-6 text-ink-500 dark:text-slate-300 sm:text-base">
          이 앱은 단순 CRUD가 아니라, 문제를 다시 떠올릴 수 있는지 점검하는 회상
          루틴을 돕기 위한 공간입니다.
          <br />
          아래 카드와 잔디로 현재 복습 밀도를 먼저 확인해보세요.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-[24px] border border-line-100 bg-white p-6 text-ink-950 shadow-[0_18px_50px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:shadow-[0_16px_40px_rgba(2,6,23,0.34)]">
          <p className="text-sm font-medium text-ink-500 dark:text-slate-400">총 문제 수</p>
          <p className="mt-3 text-4xl font-semibold tracking-tight text-ink-950 dark:text-slate-50">
            {problems.length}
          </p>
        </div>

        <div className="rounded-[24px] border border-line-100 bg-white p-6 text-ink-950 shadow-[0_18px_50px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:shadow-[0_16px_40px_rgba(2,6,23,0.34)]">
          <p className="text-sm font-medium text-ink-500 dark:text-slate-400">복습 필요</p>
          <p className="mt-3 text-4xl font-semibold tracking-tight text-amber-600">
            {reviewCount}
          </p>
        </div>

        <div className="rounded-[24px] border border-line-100 bg-white p-6 text-ink-950 shadow-[0_18px_50px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:shadow-[0_16px_40px_rgba(2,6,23,0.34)]">
          <p className="text-sm font-medium text-ink-500 dark:text-slate-400">익숙해진 문제</p>
          <p className="mt-3 text-4xl font-semibold tracking-tight text-accent-600">
            {masteredCount}
          </p>
        </div>

        <div className="rounded-[24px] border border-line-100 bg-white p-6 text-ink-950 shadow-[0_18px_50px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:shadow-[0_16px_40px_rgba(2,6,23,0.34)]">
          <p className="text-sm font-medium text-ink-500 dark:text-slate-400">복습 우선 문제</p>
          <p className="mt-3 text-4xl font-semibold tracking-tight text-rose-500">
            {priorityCount}
          </p>
        </div>
      </section>

      <section className="rounded-[28px] border border-line-100 bg-white p-6 text-ink-950 shadow-[0_18px_50px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:shadow-[0_16px_40px_rgba(2,6,23,0.34)] sm:p-8">
        <div>
          <p className="text-sm font-medium tracking-[0.18em] text-accent-600 uppercase">
            Study Grass
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink-950 dark:text-slate-50">
            문제 등록 잔디
          </h2>
          <p className="mt-2 text-sm leading-6 text-ink-500 dark:text-slate-300">
            등록한 날짜를 기준으로 칸이 채워지고, 같은 날 많이 등록할수록 색이
            더 진해집니다.
          </p>
          <p className="mt-2 text-xs text-ink-400 dark:text-slate-400">
            최근 {VISIBLE_WEEKS}주 동안 {activeDayCount}일 활동
          </p>
        </div>

        <div className="mt-6 overflow-x-auto">
          <div className="inline-flex min-w-max">
            <div className="flex gap-3">
              <div className="grid grid-rows-[20px_repeat(7,16px)] gap-1 text-xs text-ink-400 dark:text-slate-400">
                <span />
                {DAY_LABELS.map((label) => (
                  <span
                    key={label}
                    className="flex h-4 items-center justify-end pr-1"
                  >
                    {label}
                  </span>
                ))}
              </div>

              <div className="relative pt-5">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-5 text-xs text-ink-400 dark:text-slate-400">
                  {monthLabelPositions.map((item) => (
                    <span
                      key={`${item.label}-${item.weekIndex}`}
                      className="absolute top-0"
                      style={{ left: `${item.weekIndex * WEEK_WIDTH}px` }}
                    >
                      {item.label}
                    </span>
                  ))}
                </div>

                <div className="grid grid-flow-col grid-rows-7 gap-1">
                  {weeks.flatMap((week) =>
                    week.map((day) => (
                      <div
                        key={day.key}
                        title={
                          day.isFuture
                            ? `${formatFullDate(day.date)} · 아직 지나지 않은 날짜`
                            : `${formatFullDate(day.date)} · ${day.count}개 등록`
                        }
                        className={`h-4 w-4 rounded-[4px] border border-white/60 dark:border-slate-950/60 ${
                          day.isFuture
                            ? "bg-slate-50/80 dark:bg-slate-900/80"
                            : getHeatColor(day.count)
                        }`}
                      />
                    )),
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2 text-xs text-ink-500 dark:text-slate-400">
          <span>적음</span>
          <span className="h-3.5 w-3.5 rounded-[4px] bg-slate-100 dark:bg-slate-800" />
          <span className="h-3.5 w-3.5 rounded-[4px] bg-amber-200 dark:bg-amber-900/55" />
          <span className="h-3.5 w-3.5 rounded-[4px] bg-amber-300 dark:bg-amber-700/70" />
          <span className="h-3.5 w-3.5 rounded-[4px] bg-amber-500 dark:bg-amber-500/85" />
          <span className="h-3.5 w-3.5 rounded-[4px] bg-amber-700 dark:bg-amber-300" />
          <span>많음</span>
        </div>
      </section>
    </div>
  );
}
