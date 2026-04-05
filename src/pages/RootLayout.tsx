import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  auth,
  db,
  signInWithGoogle,
  signOutUser,
} from "@/shared/config/firebase";
import {
  normalizeProblemRecord,
  useProblemStore,
  type ProblemRecord,
} from "@/entities/problem/model/problemStore";

const THEME_STORAGE_KEY = "algonote-theme";
type ThemeMode = "light" | "dark" | "system";

function getInitialThemeMode(): ThemeMode {
  if (typeof window === "undefined") {
    return "system";
  }

  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);

  if (
    storedTheme === "dark" ||
    storedTheme === "light" ||
    storedTheme === "system"
  ) {
    return storedTheme;
  }

  return "system";
}

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function SunIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2.2" />
      <path d="M12 19.3v2.2" />
      <path d="M21.5 12h-2.2" />
      <path d="M4.7 12H2.5" />
      <path d="m18.7 5.3-1.6 1.6" />
      <path d="m6.9 17.1-1.6 1.6" />
      <path d="m18.7 18.7-1.6-1.6" />
      <path d="m6.9 6.9-1.6-1.6" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.8A8.9 8.9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z" />
    </svg>
  );
}

function MonitorIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8" />
      <path d="M12 16v4" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="currentColor"
    >
      <path d="M21.8 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.5a4.7 4.7 0 0 1-2 3.1v2.6h3.3c1.9-1.8 3-4.4 3-7.5Z" />
      <path d="M12 22c2.7 0 5-.9 6.7-2.4l-3.3-2.6c-.9.6-2.1 1-3.4 1-2.6 0-4.8-1.8-5.6-4.2H3.1v2.7A10 10 0 0 0 12 22Z" />
      <path d="M6.4 13.8a6 6 0 0 1 0-3.7V7.4H3.1a10 10 0 0 0 0 9.1l3.3-2.7Z" />
      <path d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.8-2.8C17 3 14.7 2 12 2A10 10 0 0 0 3.1 7.4l3.3 2.7C7.2 7.7 9.4 5.9 12 5.9Z" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

export default function RootLayout() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [themeMode, setThemeMode] = useState<ThemeMode>(getInitialThemeMode);
  const [systemTheme, setSystemTheme] = useState<"light" | "dark">(
    getSystemTheme,
  );
  const setProblems = useProblemStore((state) => state.setProblems);
  const location = useLocation();
  const navigate = useNavigate();
  const resolvedTheme = themeMode === "system" ? systemTheme : themeMode;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleSystemThemeChange = (event: MediaQueryListEvent) => {
      setSystemTheme(event.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
    localStorage.setItem(THEME_STORAGE_KEY, themeMode);
  }, [resolvedTheme, themeMode]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setIsAuthLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!user) {
      setProblems([]);
      return;
    }

    const syncProblemsFromFirestore = async () => {
      try {
        const snapshot = await getDocs(
          collection(db, "users", user.uid, "problems"),
        );

        const problems = snapshot.docs
          .map((docSnapshot) =>
            normalizeProblemRecord(docSnapshot.data() as ProblemRecord),
          )
          .sort((left, right) => right.createdAt.localeCompare(left.createdAt));

        setProblems(problems);
      } catch (error) {
        console.error("problems sync failed", error);
      }
    };

    void syncProblemsFromFirestore();
  }, [isAuthLoading, setProblems, user]);

  useEffect(() => {
    if (isAuthLoading) return;

    const searchParams = new URLSearchParams(location.search);
    const currentUid = searchParams.get("uid");
    const nextUid = user?.uid ?? null;

    if (currentUid === nextUid) {
      return;
    }

    if (nextUid) {
      searchParams.set("uid", nextUid);
    } else {
      searchParams.delete("uid");
    }

    const nextSearch = searchParams.toString();

    navigate(
      {
        pathname: location.pathname,
        search: nextSearch ? `?${nextSearch}` : "",
      },
      { replace: true },
    );
  }, [isAuthLoading, location.pathname, location.search, navigate, user?.uid]);

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Google login failed", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <div className="min-h-screen text-ink-950 transition-colors dark:text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-8 rounded-[28px] border border-line-100/80 bg-white/80 px-5 py-4 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur transition-colors dark:border-slate-700/80 dark:bg-slate-900/75 dark:shadow-[0_18px_50px_rgba(0,0,0,0.35)] sm:px-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-medium tracking-[0.18em] text-accent-600 uppercase">
                Recall Review System
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink-950 dark:text-slate-50">
                회상 기반 알고리즘 복습 시스템
              </h1>
              <p className="mt-2 text-sm leading-6 text-ink-500 dark:text-slate-300">
                기록보다 중요한 건 다시 떠올리는 연습입니다. 헤더 네비게이션을
                기준으로 문제 정리, 목록 확인, 복습 흐름을 이어가세요.
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  {(
                    [
                      { value: "light", label: "Light", icon: <SunIcon /> },
                      { value: "dark", label: "Dark", icon: <MoonIcon /> },
                      {
                        value: "system",
                        label: "System",
                        icon: <MonitorIcon />,
                      },
                    ] as const
                  ).map((option) => {
                    const isActive = themeMode === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setThemeMode(option.value)}
                        aria-pressed={isActive}
                        className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-full px-2.5 py-2 text-sm font-medium transition ${
                          isActive
                            ? "text-ink-950 dark:text-slate-50"
                            : "text-ink-500 hover:text-accent-600 dark:text-slate-400 dark:hover:text-teal-300"
                        }`}
                      >
                        {option.icon}
                        {option.label}
                      </button>
                    );
                  })}
                </div>

                <p className="text-sm text-ink-500 dark:text-slate-300">
                  현재 적용:{" "}
                  <span className="font-semibold text-ink-700 dark:text-slate-100">
                    {themeMode === "system"
                      ? `System (${resolvedTheme === "dark" ? "다크" : "라이트"})`
                      : themeMode === "dark"
                        ? "Dark"
                        : "Light"}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex w-full flex-col gap-4 lg:w-auto lg:min-w-[22rem] lg:items-end">
              {isAuthLoading ? (
                <p className="text-sm text-ink-400 dark:text-slate-400">
                  로그인 상태를 확인하는 중...
                </p>
              ) : user ? (
                <div className="flex w-full flex-wrap items-center justify-start gap-3 lg:justify-end">
                  <p className="text-sm font-semibold text-ink-950 dark:text-slate-100">
                    {user.displayName || "사용자"}
                  </p>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full px-2 py-2 text-sm font-medium text-ink-500 transition hover:text-accent-600 dark:text-slate-400 dark:hover:text-teal-300"
                  >
                    <LogoutIcon />
                    로그아웃
                  </button>
                </div>
              ) : (
                <div className="flex w-full flex-col items-start gap-2 lg:items-end">
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full px-2 py-2 text-sm font-semibold text-ink-700 transition hover:text-accent-600 dark:text-slate-200 dark:hover:text-teal-300"
                  >
                    <GoogleIcon />
                    Google로 로그인
                  </button>
                  <p className="text-sm text-ink-500 dark:text-slate-300 lg:text-right">
                    로그인하면 복습 기록을 계정 기준으로 이어서 관리할 수
                    있어요.
                  </p>
                </div>
              )}

              <nav className="grid w-full grid-cols-2 gap-2 sm:grid-cols-4 lg:w-auto lg:grid-cols-2 xl:grid-cols-4">
                <Link
                  to="/"
                  className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-line-200 bg-surface-50 px-4 py-2 text-center text-sm font-medium text-ink-700 transition hover:border-accent-500 hover:text-accent-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-accent-500 dark:hover:text-teal-300 lg:min-w-28 xl:rounded-full"
                >
                  대시보드
                </Link>
                <Link
                  to="/add"
                  className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-line-200 bg-surface-50 px-4 py-2 text-center text-sm font-medium text-ink-700 transition hover:border-accent-500 hover:text-accent-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-accent-500 dark:hover:text-teal-300 lg:min-w-28 xl:rounded-full"
                >
                  문제 등록
                </Link>
                <Link
                  to="/problems"
                  className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-line-200 bg-surface-50 px-4 py-2 text-center text-sm font-medium text-ink-700 transition hover:border-accent-500 hover:text-accent-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-accent-500 dark:hover:text-teal-300 lg:min-w-28 xl:rounded-full"
                >
                  문제 목록
                </Link>
                <Link
                  to="/review"
                  className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-line-200 bg-surface-50 px-4 py-2 text-center text-sm font-medium text-ink-700 transition hover:border-accent-500 hover:text-accent-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-accent-500 dark:hover:text-teal-300 lg:min-w-28 xl:rounded-full"
                >
                  복습하기
                </Link>
              </nav>
            </div>
          </div>
        </header>

        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
