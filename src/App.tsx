/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { TransitProvider } from './services/transitStore';
import { LoginPortalPage } from './pages/LoginPortalPage';
import { PassengerSearchPage } from './pages/passenger/PassengerSearchPage';
import { BusDetailBookingPage } from './pages/passenger/BusDetailBookingPage';
import { TicketPassPage } from './pages/passenger/TicketPassPage';
import { PassengerTicketsPage } from './pages/passenger/PassengerTicketsPage';
import { PassengerProfilePage } from './pages/passenger/PassengerProfilePage';
import { ConductorDashboardPage } from './pages/conductor/ConductorDashboardPage';
import { ConductorScannerPage } from './pages/conductor/ConductorScannerPage';
import { ConductorRoutePage } from './pages/conductor/ConductorRoutePage';
import { ConductorAlertsPage } from './pages/conductor/ConductorAlertsPage';

export default function App() {
  return (
    <TransitProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPortalPage />} />

          {/* Passenger Interface */}
          <Route path="/passenger" element={<PassengerSearchPage />} />
          <Route path="/passenger/bus/:busId" element={<BusDetailBookingPage />} />
          <Route path="/passenger/ticket/:ticketId" element={<TicketPassPage />} />
          <Route path="/passenger/tickets" element={<PassengerTicketsPage />} />
          <Route path="/passenger/profile" element={<PassengerProfilePage />} />

          {/* Conductor Interface */}
          <Route path="/conductor" element={<ConductorDashboardPage />} />
          <Route path="/conductor/scanner" element={<ConductorScannerPage />} />
          <Route path="/conductor/route" element={<ConductorRoutePage />} />
          <Route path="/conductor/alerts" element={<ConductorAlertsPage />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </TransitProvider>
  );
}
