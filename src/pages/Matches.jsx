import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import { supabase } from "../lib/supabaseClient";

function Matches() {
    //matches table will be connected with tournaments, venue and teams tables.
  const [matches, setMatches] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [venues, setVenues] = useState([]);
  const [teams, setTeams] = useState([]);

  const [tournamentId, setTournamentId] = useState("");
  const [venueId, setVenueId] = useState("");
  const [homeTeamId, setHomeTeamId] = useState("");
  const [awayTeamId, setAwayTeamId] = useState("");
  const [matchDate, setMatchDate] = useState("");
  const [matchStatus, setMatchStatus] = useState("Scheduled");

  const [editingMatch, setEditingMatch] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchDropdownData = async () => {
    const { data: tournamentData } = await supabase
      .from("tournaments")
      .select("*")
      .order("tournament_name", { ascending: true });

    const { data: venueData } = await supabase
      .from("venues")
      .select("*")
      .order("venue_name", { ascending: true });

    const { data: teamData } = await supabase
      .from("teams")
      .select("*")
      .order("team_name", { ascending: true });

    setTournaments(tournamentData || []);
    setVenues(venueData || []);
    setTeams(teamData || []);
  };

  const fetchMatches = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("matches")
      .select(`
        match_id,
        tournament_id,
        venue_id,
        home_team_id,
        away_team_id,
        match_date,
        match_status,
        tournaments(tournament_name),
        venues(venue_name),
        home_team:teams!matches_home_team_id_fkey(team_name),
        away_team:teams!matches_away_team_id_fkey(team_name)
      `)
      .order("match_date", { ascending: false });

    if (error) {
      setMessage("Error loading matches: " + error.message);
      setMatches([]);
    } else {
      setMatches(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    const loadMatchesPage = async () => {
      await fetchDropdownData();
      await fetchMatches();
    };

    loadMatchesPage();
  }, []);

  const resetForm = () => {
    setTournamentId("");
    setVenueId("");
    setHomeTeamId("");
    setAwayTeamId("");
    setMatchDate("");
    setMatchStatus("Scheduled");
    setEditingMatch(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (
      !tournamentId ||
      !venueId ||
      !homeTeamId ||
      !awayTeamId ||
      !matchDate ||
      !matchStatus
    ) {
      setMessage("Please fill in all fields.");
      return;
    }

    if (homeTeamId === awayTeamId) {
      setMessage("Home team and away team cannot be the same.");
      return;
    }

    const matchData = {
      tournament_id: Number(tournamentId),
      venue_id: Number(venueId),
      home_team_id: Number(homeTeamId),
      away_team_id: Number(awayTeamId),
      match_date: matchDate,
      match_status: matchStatus,
    };

    if (editingMatch) {
      const { error } = await supabase
        .from("matches")
        .update(matchData)
        .eq("match_id", editingMatch.match_id);

      if (error) {
        setMessage("Error updating match: " + error.message);
      } else {
        setMessage("Match updated successfully.");
        resetForm();
        fetchMatches();
      }
    } else {
      const { error } = await supabase.from("matches").insert([matchData]);

      if (error) {
        setMessage("Error adding match: " + error.message);
      } else {
        setMessage("Match added successfully.");
        resetForm();
        fetchMatches();
      }
    }
  };

  const handleEdit = (match) => {
    setEditingMatch(match);
    setTournamentId(match.tournament_id);
    setVenueId(match.venue_id);
    setHomeTeamId(match.home_team_id);
    setAwayTeamId(match.away_team_id);
    setMatchDate(match.match_date ? match.match_date.slice(0, 16) : "");
    setMatchStatus(match.match_status);
    setMessage("");
  };

  const handleDelete = async (matchId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this match?"
    );

    if (!confirmDelete) return;

    const { error } = await supabase
      .from("matches")
      .delete()
      .eq("match_id", matchId);

    if (error) {
      setMessage("Error deleting match: " + error.message);
    } else {
      setMessage("Match deleted successfully.");
      fetchMatches();
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <main className="max-w-7xl mx-auto p-6 md:p-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <p className="text-slate-500 text-sm">Schedule tournament matches</p>
            <h2 className="text-3xl font-bold text-slate-900">
              Matches Management
            </h2>
          </div>

          <button
            onClick={() => {
              fetchDropdownData();
              fetchMatches();
            }}
            className="bg-slate-900 text-white px-5 py-3 rounded-xl font-semibold hover:bg-slate-700"
          >
            Refresh Matches
          </button>
        </div>

        {message && (
          <div className="mb-6 bg-white border border-slate-200 rounded-2xl px-5 py-4 text-slate-700 shadow-sm">
            {message}
          </div>
        )}

        <div className="space-y-6">
          <section className="bg-white rounded-2xl shadow p-6">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900 mb-1">
                {editingMatch ? "Edit Match" : "Schedule New Match"}
              </h3>
              <p className="text-slate-500 text-sm">
                Select tournament, venue, teams, date, and match status.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Tournament
                  </label>
                  <select
                    value={tournamentId}
                    onChange={(e) => setTournamentId(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900 bg-white"
                  >
                    <option value="">Select tournament</option>
                    {tournaments.map((tournament) => (
                      <option
                        key={tournament.tournament_id}
                        value={tournament.tournament_id}
                      >
                        {tournament.tournament_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Venue
                  </label>
                  <select
                    value={venueId}
                    onChange={(e) => setVenueId(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900 bg-white"
                  >
                    <option value="">Select venue</option>
                    {venues.map((venue) => (
                      <option key={venue.venue_id} value={venue.venue_id}>
                        {venue.venue_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Home Team
                  </label>
                  <select
                    value={homeTeamId}
                    onChange={(e) => setHomeTeamId(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900 bg-white"
                  >
                    <option value="">Select home team</option>
                    {teams.map((team) => (
                      <option key={team.team_id} value={team.team_id}>
                        {team.team_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Away Team
                  </label>
                  <select
                    value={awayTeamId}
                    onChange={(e) => setAwayTeamId(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900 bg-white"
                  >
                    <option value="">Select away team</option>
                    {teams.map((team) => (
                      <option key={team.team_id} value={team.team_id}>
                        {team.team_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Match Date
                  </label>
                  <input
                    type="datetime-local"
                    value={matchDate}
                    onChange={(e) => setMatchDate(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Status
                  </label>
                  <select
                    value={matchStatus}
                    onChange={(e) => setMatchStatus(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900 bg-white"
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="Completed">Completed</option>
                    <option value="Postponed">Postponed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-5">
                <button
                  type="submit"
                  className="bg-slate-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-700 transition"
                >
                  {editingMatch ? "Update Match" : "Add Match"}
                </button>

                {editingMatch && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-slate-200 text-slate-900 px-6 py-3 rounded-xl font-semibold hover:bg-slate-300 transition"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </section>

          <section className="bg-white rounded-2xl shadow overflow-hidden">
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold text-slate-900">Match List</h3>
              <p className="text-slate-500 text-sm mt-1">
                View, edit, and delete scheduled matches.
              </p>
            </div>

            {loading ? (
              <div className="p-6 text-slate-500">Loading matches...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-700">
                    <tr>
                      <th className="p-4">ID</th>
                      <th className="p-4">Tournament</th>
                      <th className="p-4">Home Team</th>
                      <th className="p-4">Away Team</th>
                      <th className="p-4">Venue</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {matches.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="p-4 text-slate-500">
                          No matches found.
                        </td>
                      </tr>
                    ) : (
                      matches.map((match) => (
                        <tr key={match.match_id} className="border-t">
                          <td className="p-4">{match.match_id}</td>
                          <td className="p-4">
                            {match.tournaments?.tournament_name || "N/A"}
                          </td>
                          <td className="p-4 font-semibold text-slate-900">
                            {match.home_team?.team_name || "N/A"}
                          </td>
                          <td className="p-4 font-semibold text-slate-900">
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
                                  : match.match_status === "Postponed"
                                  ? "bg-orange-100 text-orange-700"
                                  : match.match_status === "Cancelled"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {match.match_status}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(match)}
                                className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700"
                              >
                                Edit
                              </button>

                              <button
                                onClick={() => handleDelete(match.match_id)}
                                className="bg-red-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-700"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default Matches;