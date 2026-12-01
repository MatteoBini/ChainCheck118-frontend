import { createBrowserRouter } from 'react-router-dom';
import { PATHS } from '@/components/layout';
import { HistoryPage } from '@/features/audit';
import { LoginPage, ProfilePage } from '@/features/auth';
import { CrewChecklistPage } from '@/features/crew-checklist';
import { DispatchDashboardPage } from '@/features/dispatch-dashboard';
import { InspectorPage } from '@/features/inspector';
import { MapPage } from '@/features/map';
import { AboutPage, LandingPage } from '@/features/landing';
import { StaffRegistryPage, VehicleRegistryPage } from '@/features/registry';
import { MyReportsPage } from '@/features/reports';
import { RequireAuth, RequireRole } from './guards';
import { HomeRedirect } from './HomeRedirect';
import { ShellLayout } from './ShellLayout';

export const router = createBrowserRouter([
  { index: true, element: <LandingPage /> },
  { path: PATHS.about, element: <AboutPage /> },
  { path: PATHS.login, element: <LoginPage /> },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <ShellLayout />,
        children: [
          { path: PATHS.profile, element: <ProfilePage /> },
          { path: PATHS.history, element: <HistoryPage /> },
          {
            element: <RequireRole roles={['SOCCORRITORE']} />,
            children: [
              { path: PATHS.crewChecklist, element: <CrewChecklistPage /> },
              { path: PATHS.reports, element: <MyReportsPage /> },
            ],
          },
          {
            element: <RequireRole roles={['ISPETTORE']} />,
            children: [{ path: `${PATHS.inspection}/*`, element: <InspectorPage /> }],
          },
          {
            element: <RequireRole roles={['OPERATORE']} />,
            children: [
              { path: PATHS.dispatch, element: <DispatchDashboardPage /> },
              { path: PATHS.vehicleRegistry, element: <VehicleRegistryPage /> },
              { path: PATHS.staffRegistry, element: <StaffRegistryPage /> },
            ],
          },
          {
            element: <RequireRole roles={['SOCCORRITORE', 'ISPETTORE', 'OPERATORE']} />,
            children: [{ path: PATHS.map, element: <MapPage /> }],
          },
          { path: '*', element: <HomeRedirect /> },
        ],
      },
    ],
  },
]);
