import { Navigate, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import { AdminDashboardLayout } from "./layouts/AdminDashboardLayout";
import { StudentDashboardLayout } from "./layouts/StudentDashboardLayout";
import AdminSectionPage from "./pages/admin/AdminSectionPage";
import StudentSectionPage from "./pages/student/StudentSectionPage";
import AdminEventsListPage from "./pages/admin/events/AdminEventsListPage";
import AdminEventFormPage from "./pages/admin/events/AdminEventFormPage";
import AdminMatchesListPage from "./pages/admin/matches/AdminMatchesListPage";
import AdminMatchFormPage from "./pages/admin/matches/AdminMatchFormPage";
import AdminTeamsListPage from "./pages/admin/teams/AdminTeamsListPage";
import AdminTeamCreatePage from "./pages/admin/teams/AdminTeamCreatePage";
import AdminTeamDetailPage from "./pages/admin/teams/AdminTeamDetailPage";
import AdminTeamRequestsPage from "./pages/admin/team-requests/AdminTeamRequestsPage";
import AdminPlayersListPage from "./pages/admin/players/AdminPlayersListPage";
import AdminPlayerFormPage from "./pages/admin/players/AdminPlayerFormPage";
import AdminPlayerRequestsPage from "./pages/admin/player-requests/AdminPlayerRequestsPage";
import AdminVenuesListPage from "./pages/admin/venues/AdminVenuesListPage";
import AdminVenueFormPage from "./pages/admin/venues/AdminVenueFormPage";
import AdminResultsListPage from "./pages/admin/results/AdminResultsListPage";
import AdminResultFormPage from "./pages/admin/results/AdminResultFormPage";
import AdminLeaderboardPage from "./pages/admin/leaderboard/AdminLeaderboardPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin" element={<AdminDashboardLayout />}>
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<AdminSectionPage />} />

        <Route path="events" element={<AdminEventsListPage />} />
        <Route path="events/new" element={<AdminEventFormPage />} />
        <Route path="events/:eventId/edit" element={<AdminEventFormPage />} />

        <Route path="matches" element={<AdminMatchesListPage />} />
        <Route path="matches/new" element={<AdminMatchFormPage />} />
        <Route path="matches/:matchId/edit" element={<AdminMatchFormPage />} />

        <Route path="teams" element={<AdminTeamsListPage />} />
        <Route path="teams/new" element={<AdminTeamCreatePage />} />
        <Route path="teams/:teamId" element={<AdminTeamDetailPage />} />
        <Route path="team-requests" element={<AdminTeamRequestsPage />} />

        <Route path="players" element={<AdminPlayersListPage />} />
        <Route path="players/new" element={<AdminPlayerFormPage />} />
        <Route path="players/:playerId/edit" element={<AdminPlayerFormPage />} />
        <Route path="player-requests" element={<AdminPlayerRequestsPage />} />

        <Route path="venues" element={<AdminVenuesListPage />} />
        <Route path="venues/new" element={<AdminVenueFormPage />} />
        <Route path="venues/:venueId/edit" element={<AdminVenueFormPage />} />

        <Route path="results" element={<AdminResultsListPage />} />
        <Route path="results/new" element={<AdminResultFormPage />} />
        <Route path="results/:resultId/edit" element={<AdminResultFormPage />} />

        <Route path="leaderboard-reports" element={<AdminLeaderboardPage />} />
        <Route path="users" element={<AdminSectionPage />} />
        <Route path="settings" element={<AdminSectionPage />} />
      </Route>
      <Route path="/student" element={<StudentDashboardLayout />}>
        <Route index element={<Navigate to="events" replace />} />
        <Route path=":section" element={<StudentSectionPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
