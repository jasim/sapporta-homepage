import { lazy, Suspense } from "react";
import { Route } from "react-router-dom";
import type { Navigation } from "@sapporta/frontend/shell";
import { AppPage } from "@sapporta/frontend/layout";
import { House } from "lucide-react";

/**
 * Add the application's routes and navigation here. `SapportaApp.tsx` combines
 * them with Sapporta's account and table routes. Table links are added from the
 * loaded schema.
 */
const homePath = "/";

const Home = lazy(() => import("./Home").then((m) => ({ default: m.Home })));

const PublicPage = lazy(() =>
  import("./PublicPage").then((m) => ({ default: m.PublicPage })),
);

function RouteFallback() {
  return (
    <AppPage
      title="Loading"
      bodyClassName="p-[18px] text-sap-data text-sap-muted"
    >
      Loading...
    </AppPage>
  );
}

// Add domain screens here with their navigation items.
export const appNavigation: Navigation = [
  {
    label: "Views",
    items: [
      {
        label: "Home",
        icon: House,
        to: homePath,
      },
    ],
  },
];

// The screen at `/`. Replace `Home` with the screen your app should open on.
export const appHomeRoute = (
  <Route
    index
    element={
      <Suspense fallback={<RouteFallback />}>
        <Home />
      </Suspense>
    }
  />
);

// Routes here render inside the app shell without requiring a signed-in session.
export const appPublicRoutes = (
  <>
    {/* PUBLIC: anyone can load this page. Keep its data intentionally public. */}
    <Route
      path="public"
      element={
        <Suspense fallback={<RouteFallback />}>
          <PublicPage />
        </Suspense>
      }
    />
  </>
);

// Routes here render inside the authenticated app shell.
export const appProtectedRoutes = (
  <>
    {/* Add protected app routes here, e.g.:
        <Route
          path="views/imports"
          element={
            <Suspense fallback={<RouteFallback />}>
              <Imports />
            </Suspense>
          }
        /> */}
  </>
);
