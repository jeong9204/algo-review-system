import { createBrowserRouter } from "react-router-dom";
import RootLayout from "@/pages/RootLayout";
import DashboardPage from "@/pages/DashboardPage";
import ProblemsPage from "@/pages/ProblemsPage";
import ProblemDetailPage from "@/pages/ProblemDetailPage";
import ProblemFormPage from "@/pages/ProblemFormPage";
import ReviewPage from "@/pages/ReviewPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "add", element: <ProblemFormPage /> },
      { path: "problems", element: <ProblemsPage /> },
      { path: "problems/:id", element: <ProblemDetailPage /> },
      { path: "problems/:id/edit", element: <ProblemFormPage /> },
      { path: "review", element: <ReviewPage /> },
    ],
  },
]);
