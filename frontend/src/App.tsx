import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import GuestRoute from "./components/GuestRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import Organizations from "./pages/Organizations";
import Projects from "./pages/Projects";
import TaskBoard from "./pages/TaskBoard";
import Layout from "./components/Layout";
import OrganizationSettings from "./pages/OrganizationSettings";
import AcceptInvite from "./pages/AcceptInvite";
import Billing from "./pages/Billing";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Organizations />} />
            <Route
              path="/organizations/:organizationId/projects"
              element={<Projects />}
            />
            <Route
              path="/organizations/:organizationId/projects/:projectId/board"
              element={<TaskBoard />}
            />
            <Route
              path="/organizations/:organizationId/settings"
              element={<OrganizationSettings />}
            />
            <Route
              path="/organizations/:organizationId/billing"
              element={<Billing />}
            />
          </Route>
          <Route
            path="/login"
            element={
              <GuestRoute>
                <Login />
              </GuestRoute>
            }
          />
          <Route
            path="/register"
            element={
              <GuestRoute>
                <Register />
              </GuestRoute>
            }
          />
          <Route path="/invites/accept" element={<AcceptInvite />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
