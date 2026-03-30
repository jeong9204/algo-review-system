import { createBrowserRouter } from "react-router-dom";
import DashboardPage from "../pages/DashboardPage";
import AddProblemPage from "../pages/AddProblemPage";
import ProblemsPage from "../pages/ProblemsPage";
import ProblemDetailPage from "../pages/ProblemDetailPage";
import ReviewPage from "../pages/ReviewPage";

export const router = createBrowserRouter([
  { path: "/", element: <DashboardPage /> },
  { path: "/add", element: <AddProblemPage /> },
  { path: "/problems", element: <ProblemsPage /> },
  { path: "/problems/:id", element: <ProblemDetailPage /> },
  { path: "/review", element: <ReviewPage /> },
]);
