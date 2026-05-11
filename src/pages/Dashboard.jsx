import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

function Dashboard() {
  const [stats, setStats] = useState({
    teams: 0,
    players: 0,
    tournaments: 0,
    venues: 0,
    matches: 0,
    completedMatches: 0,
    scheduledMatches: 0,
  });

  const [recentMatches, setRecentMatches] = useState([]);

  const [user] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [loading, setLoading] = useState(true);

  const getTableCount = async (tableName) => {
    const { count, error } = await supabase
      .from(tableName)
      .select("*", { count: "exact", head: true });

    if (error) {
      console.log(`Error counting ${tableName}:`, error.message);
      return 0;
    }

    return count || 0;
  };

  const fetchDashboardData = async () => {
    setLoading(true);

    const teamsCount = await getTableCount("teams");
    const playersCount = await getTableCount("players");
    const tournamentsCount = await getTableCount("tournaments");
    const venuesCount = await getTableCount("venues");
    const matchesCount = await getTableCount("matches");

    const { count: completedCount, error: completedError } = await supabase
      .from("matches")
      .select("*", { count: "exact", head: true })
      .eq("match_status", "Completed");

    if (completedError) {
      console.log("Error counting completed matches:", completedError.message);
    }

    const { count: scheduledCount, error: scheduledError } = await supabase
      .from("matches")
      .select("*", { count: "exact", head: true })
      .eq("match_status", "Scheduled");

    if (scheduledError) {
      console.log("Error counting scheduled matches:", scheduledError.message);
    }

    const { count: resultsCount, error: resultsError } = await supabase
      .from("match_results")
      .select("*", { count: "exact", head: true });

    if (resultsError) {
      console.log("Error counting results:", resultsError.message);
    }

    setStats({
      teams: teamsCount,
      players: playersCount,
      tournaments: tournamentsCount,
      venues: venuesCount,
      matches: matchesCount,
      completedMatches: completedCount || 0,
      scheduledMatches: scheduledCount || 0,
      results: resultsCount || 0,
    });

    const { data, error } = await supabase
      .from("matches")
      .select(`
        match_id,
        match_date,
        match_status,
        tournaments(tournament_name),
        venues(venue_name),
        home_team:teams!matches_home_team_id_fkey(team_name),
        away_team:teams!matches_away_team_id_fkey(team_name)
      `)
      .order("match_date", { ascending: false })
      .limit(5);

    if (error) {
      console.log("Error fetching recent matches:", error.message);
      setRecentMatches([]);
    } else {
      setRecentMatches(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    const loadDashboard = async () => {
      await fetchDashboardData();
    };

    loadDashboard();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="flex">
        <aside className="hidden md:flex w-64 min-h-screen bg-slate-950 text-white flex-col p-6">
          <h1 className="text-2xl font-bold mb-8">Sports DBMS</h1>

          <nav className="space-y-3">
            <a
              href="/dashboard"
              className="block bg-white/10 px-4 py-3 rounded-xl"
            >
              Dashboard
            </a>
            <a
              href="/teams"
              className="block hover:bg-white/10 px-4 py-3 rounded-xl"
            >
              Teams
            </a>
            <a
              href="/players"
              className="block hover:bg-white/10 px-4 py-3 rounded-xl"
            >
              Players
            </a>
            <a
              href="/tournaments"
              className="block hover:bg-white/10 px-4 py-3 rounded-xl"
            >
              Tournaments
            </a>
            <a
              href="/venues"
              className="block hover:bg-white/10 px-4 py-3 rounded-xl"
            >
              Venues
            </a>
            <a
              href="/matches"
              className="block hover:bg-white/10 px-4 py-3 rounded-xl"
            >
              Matches
            </a>
            <a
              href="/results"
              className="block hover:bg-white/10 px-4 py-3 rounded-xl"
            >
              Results
            </a>
            <a
              href="/reports"
              className="block hover:bg-white/10 px-4 py-3 rounded-xl"
            >
              Reports
            </a>
          </nav>

          <button
            onClick={handleLogout}
            className="mt-auto bg-red-600 hover:bg-red-700 px-4 py-3 rounded-xl font-semibold"
          >
            Logout
          </button>
        </aside>

        <main className="flex-1 p-6 md:p-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <p className="text-slate-500 text-sm">Welcome back</p>
              <h2 className="text-3xl font-bold text-slate-900">
                Tournament Dashboard
              </h2>

              {user && (
                <p className="text-slate-500 mt-1">
                  Logged in as {user.full_name}
                </p>
              )}
            </div>

            <button
              onClick={fetchDashboardData}
              className="bg-slate-900 text-white px-5 py-3 rounded-xl font-semibold hover:bg-slate-700"
            >
              Refresh Data
            </button>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl p-8 shadow">
              <p className="text-slate-600">Loading dashboard data...</p>
            </div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                <StatCard title="Total Teams" value={stats.teams} />
                <StatCard title="Total Players" value={stats.players} />
                <StatCard title="Tournaments" value={stats.tournaments} />
                <StatCard title="Venues" value={stats.venues} />
                <StatCard title="Total Matches" value={stats.matches} />
                <StatCard
                  title="Completed Matches"
                  value={stats.completedMatches}
                />
                <StatCard
                  title="Scheduled Matches"
                  value={stats.scheduledMatches}
                />
                <StatCard title="Results Recorded" value={stats.results} />
              </div>

              <div className="bg-white rounded-2xl shadow overflow-hidden">
                <div className="p-6 border-b">
                  <h3 className="text-xl font-bold text-slate-900">
                    Recent Matches
                  </h3>
                  <p className="text-slate-500 text-sm mt-1">
                    Latest scheduled or completed tournament matches.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 text-slate-700">
                      <tr>
                        <th className="p-4">Tournament</th>
                        <th className="p-4">Home Team</th>
                        <th className="p-4">Away Team</th>
                        <th className="p-4">Venue</th>
                        <th className="p-4">Date</th>
                        <th className="p-4">Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {recentMatches.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="p-4 text-slate-500">
                            No matches found.
                          </td>
                        </tr>
                      ) : (
                        recentMatches.map((match) => (
                          <tr key={match.match_id} className="border-t">
                            <td className="p-4">
                              {match.tournaments?.tournament_name || "N/A"}
                            </td>
                            <td className="p-4">
                              {match.home_team?.team_name || "N/A"}
                            </td>
                            <td className="p-4">
                              {match.away_team?.team_name || "N/A"}
                            </td>
                            <td className="p-4">
                              {match.venues?.venue_name || "N/A"}
                            </td>
                            <td className="p-4">
                              {match.match_date
                                ? new Date(match.match_date).toLocaleString()
                                : "N/A"}
                            </td>
                            <td className="p-4">
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                  match.match_status === "Completed"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-yellow-100 text-yellow-700"
                                }`}
                              >
                                {match.match_status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow">
      <p className="text-slate-500 text-sm">{title}</p>
      <h3 className="text-3xl font-bold text-slate-900 mt-2">{value}</h3>
    </div>
  );
}

export default Dashboard;