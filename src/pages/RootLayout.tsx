import { Link, Outlet } from "react-router-dom";

export default function RootLayout() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-8 rounded-[28px] border border-line-100/80 bg-white/80 px-5 py-4 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur sm:px-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-medium tracking-[0.18em] text-accent-600 uppercase">
                Recall Review System
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink-950">
                회상 기반 알고리즘 복습 시스템
              </h1>
              <p className="mt-2 text-sm leading-6 text-ink-500">
                기록보다 중요한 건 다시 떠올리는 연습입니다. 헤더 네비게이션을
                기준으로 문제 정리, 목록 확인, 복습 흐름을 이어가세요.
              </p>
            </div>

            <nav className="grid w-full grid-cols-2 gap-2 sm:grid-cols-4 lg:w-auto lg:grid-cols-2 xl:grid-cols-4">
              <Link
                to="/"
                className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-line-200 bg-surface-50 px-4 py-2 text-center text-sm font-medium text-ink-700 transition hover:border-accent-500 hover:text-accent-600 lg:min-w-28 xl:rounded-full"
              >
                대시보드
              </Link>
              <Link
                to="/add"
                className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-line-200 bg-surface-50 px-4 py-2 text-center text-sm font-medium text-ink-700 transition hover:border-accent-500 hover:text-accent-600 lg:min-w-28 xl:rounded-full"
              >
                문제 등록
              </Link>
              <Link
                to="/problems"
                className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-line-200 bg-surface-50 px-4 py-2 text-center text-sm font-medium text-ink-700 transition hover:border-accent-500 hover:text-accent-600 lg:min-w-28 xl:rounded-full"
              >
                문제 목록
              </Link>
              <Link
                to="/review"
                className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-line-200 bg-surface-50 px-4 py-2 text-center text-sm font-medium text-ink-700 transition hover:border-accent-500 hover:text-accent-600 lg:min-w-28 xl:rounded-full"
              >
                복습하기
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
