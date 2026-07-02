import { useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { AppShell, setNavigate } from "@sapporta/frontend/app";
import { BootLoader } from "@sapporta/frontend/app";
import { useAuthStore } from "@sapporta/frontend/auth/runtime";
import {
  appHomeRoute,
  appNavigation,
  appProtectedRoutes,
  appPublicRoutes,
} from "./App";
import {
  sapportaNotFoundRoute,
  sapportaProtectedRoutes,
  sapportaPublicRoutes,
} from "./SapportaRoutes";

export function SapportaApp() {
  const navigate = useNavigate();
  useEffect(() => {
    setNavigate(navigate);
  }, [navigate]);

  return (
    <Routes>
      {sapportaPublicRoutes}

      <Route
        element={
          <BootLoader>
            <ShellAuthLoader />
            <AppShell navigation={appNavigation} showFrameworkNavigation />
          </BootLoader>
        }
      >
        {appHomeRoute}
        {appPublicRoutes}
        {appProtectedRoutes}
        {sapportaProtectedRoutes}
        {sapportaNotFoundRoute}
      </Route>
    </Routes>
  );
}

function ShellAuthLoader() {
  const status = useAuthStore((s) => s.status);
  const load = useAuthStore((s) => s.load);

  useEffect(() => {
    if (status === "idle") void load();
  }, [load, status]);

  return null;
}
