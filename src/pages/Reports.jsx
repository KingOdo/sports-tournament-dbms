import { useCallback, useEffect, useState } from "react";
import Navbar from "./Navbar";
import { supabase } from "../lib/supabaseClient";

function Reports() {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [summary, setSummary] = useState({
    totalTeams: 0,
    totalPlayers: 0,
    totalMatches: 0,
    completedMatches: 0,
    totalVenues: 0,
    totalResults: 0,
  });

  const [playersPerTeam, setPlayersPerTeam] = useState([]);
  const [averageAgePerTeam, setAverageAgePerTeam] = useState([]);
  const [matchesPerTournament, setMatchesPerTournament] = useState([]);
  const [highestCapacityVenues, setHighestCapacityVenues] = useState([]);
  const [completedMatches, setCompletedMatches] = useState([]);
  const [matchResults, setMatchResults] = useState([]);

  const getCount = async (tableName) => {
    const { count, error } = await supabase
      .from(tableName)
      .select("*", { count: "exact", head: true });

    if (error) {
      console.log(`Error counting ${tableName}:`, error.message);
      return 0;
    }

    return count || 0;
  };

  const loadReports = useCallback(async () => {
    setLoading(true);
    setMessage("");

    try {
      const totalTeams = await getCount("teams");
      const totalPlayers = await getCount("players");
      const totalMatches = await getCount("matches");
      const totalVenues = await getCount("venues");
      const totalResults = await getCount("match_results");

      const { count: completedCount } = await supabase
        .from("matches")
        .select("*", { count: "exact", head: true })
        .eq("match_status", "Completed");

      setSummary({
        totalTeams,
        totalPlayers,
        totalMatches,
        completedMatches: completedCount || 0,
        totalVenues,
        totalResults,
      });

      const { data: teamsData, error: teamsError } = await supabase
        .from("teams")
        .select(`
          team_id,
          team_name,
          city,
          players(player_id, age)
        `)
        .order("team_name", { ascending: true });

      if (teamsError) throw teamsError;

      const playerCountData = (teamsData || []).map((team) => ({
        team_id: team.team_id,
        team_name: team.team_name,
        city: team.city,
        total_players: team.players ? team.players.length : 0,
      }));

      setPlayersPerTeam(playerCountData);

      const averageAgeData = (teamsData || []).map((team) => {
        const players = team.players || [];
        const totalAge = players.reduce(
          (sum, player) => sum + Number(player.age || 0),
          0
        );

        const averageAge =
          players.length > 0 ? (totalAge / players.length).toFixed(1) : "0";

        return {
          team_id: team.team_id,
          team_name: team.team_name,
          average_age: averageAge,
        };
      });

      setAverageAgePerTeam(averageAgeData);

      const { data: tournamentData, error: tournamentError } = await supabase
        .from("tournaments")
        .select(`
          tournament_id,
          tournament_name,
          sport_type,
          status,
          matches(match_id)
        `)
        .order("tournament_name", { ascending: true });

      if (tournamentError) throw tournamentError;

      const tournamentMatchData = (tournamentData || []).map((tournament) => ({
        tournament_id: tournament.tournament_id,
        tournament_name: tournament.tournament_name,
        sport_type: tournament.sport_type,
        status: tournament.status,
        total_matches: tournament.matches ? tournament.matches.length : 0,
      }));

      setMatchesPerTournament(tournamentMatchData);

      const { data: venueData, error: venueError } = await supabase
        .from("venues")
        .select("*")
        .order("capacity", { ascending: false });

      if (venueError) throw venueError;

      setHighestCapacityVenues(venueData || []);

      const { data: completedData, error: completedError } = await supabase
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
        .eq("match_status", "Completed")
        .order("match_date", { ascending: false });

      if (completedError) throw completedError;

      setCompletedMatches(completedData || []);

      const { data: resultData, error: resultError } = await supabase
        .from("match_results")
        .select(`
          result_id,
          home_score,
          away_score,
          result_recorded_at,
          matches(
            match_id,
            match_date,
            home_team:teams!matches_home_team_id_fkey(team_name),
            away_team:teams!matches_away_team_id_fkey(team_name)
          ),
          winner:teams!match_results_winner_team_id_fkey(team_name)
        `)
        .order("result_id", { ascending: true });

      if (resultError) throw resultError;

      setMatchResults(resultData || []);
    } catch (error) {
      setMessage("Error loading reports: " + error.message);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <main className="max-w-7xl mx-auto p-6 md:p-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <p className="text-slate-500 text-sm">
              Management statistics and database query results
            </p>
            <h2 className="text-3xl font-bold text-slate-900">
              Reports Dashboard
            </h2>
          </div>

          <button
            onClick={loadReports}
            className="bg-slate-900 text-white px-5 py-3 rounded-xl font-semibold hover:bg-slate-700"
          >
            Refresh Reports
          </button>
        </div>

        {message && (
          <div className="mb-6 bg-white border border-red-200 rounded-2xl px-5 py-4 text-red-700 shadow-sm">
            {message}
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-2xl p-8 shadow">
            <p className="text-slate-600">Loading reports...</p>
          </div>
        ) : (
          <div className="space-y-8">
            <section className="grid sm:grid-cols-2 lg:grid-cols-6 gap-5">
              <ReportCard title="Teams" value={summary.totalTeams} />
              <ReportCard title="Players" value={summary.totalPlayers} />
              <ReportCard title="Matches" value={summary.totalMatches} />
              <ReportCard title="Completed" value={summary.completedMatches} />
              <ReportCard title="Venues" value={summary.totalVenues} />
              <ReportCard title="Results" value={summary.totalResults} />
            </section>

            <ReportTable title="Players Per Team" description="Shows each team and the total number of registered players.">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="p-4">Team</th>
                  <th className="p-4">City</th>
                  <th className="p-4">Total Players</th>
                </tr>
              </thead>
              <tbody>
                {playersPerTeam.map((team) => (
                  <tr key={team.team_id} className="border-t">
                    <td className="p-4 font-semibold">{team.team_name}</td>
                    <td className="p-4">{team.city}</td>
                    <td className="p-4">{team.total_players}</td>
                  </tr>
                ))}
              </tbody>
            </ReportTable>

            <ReportTable title="Average Player Age by Team" description="Calculates the average age of players in each team.">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="p-4">Team</th>
                  <th className="p-4">Average Age</th>
                </tr>
              </thead>
              <tbody>
                {averageAgePerTeam.map((team) => (
                  <tr key={team.team_id} className="border-t">
                    <td className="p-4 font-semibold">{team.team_name}</td>
                    <td className="p-4">{team.average_age}</td>
                  </tr>
                ))}
              </tbody>
            </ReportTable>

            <ReportTable title="Matches Per Tournament" description="Shows how many matches are scheduled under each tournament.">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="p-4">Tournament</th>
                  <th className="p-4">Sport</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Total Matches</th>
                </tr>
              </thead>
              <tbody>
                {matchesPerTournament.map((tournament) => (
                  <tr key={tournament.tournament_id} className="border-t">
                    <td className="p-4 font-semibold">
                      {tournament.tournament_name}
                    </td>
                    <td className="p-4">{tournament.sport_type}</td>
                    <td className="p-4">{tournament.status}</td>
                    <td className="p-4">{tournament.total_matches}</td>
                  </tr>
                ))}
              </tbody>
            </ReportTable>

            <ReportTable title="Highest Capacity Venues" description="Lists venues ordered by capacity from highest to lowest.">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="p-4">Venue</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Capacity</th>
                </tr>
              </thead>
              <tbody>
                {highestCapacityVenues.map((venue) => (
                  <tr key={venue.venue_id} className="border-t">
                    <td className="p-4 font-semibold">{venue.venue_name}</td>
                    <td className="p-4">{venue.location}</td>
                    <td className="p-4">
                      {Number(venue.capacity).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </ReportTable>

            <ReportTable title="Completed Matches" description="Displays only completed matches with tournament, teams, venue, and date.">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="p-4">Tournament</th>
                  <th className="p-4">Home Team</th>
                  <th className="p-4">Away Team</th>
                  <th className="p-4">Venue</th>
                  <th className="p-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {completedMatches.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-4 text-slate-500">
                      No completed matches found.
                    </td>
                  </tr>
                ) : (
                  completedMatches.map((match) => (
                    <tr key={match.match_id} className="border-t">
                      <td className="p-4">
                        {match.tournaments?.tournament_name || "N/A"}
                      </td>
                      <td className="p-4 font-semibold">
                        {match.home_team?.team_name || "N/A"}
                      </td>
                      <td className="p-4 font-semibold">
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
                    </tr>
                  ))
                )}
              </tbody>
            </ReportTable>

            <ReportTable title="Match Results and Winners" description="Displays recorded scores and winners for completed matches.">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="p-4">Match</th>
                  <th className="p-4">Home Score</th>
                  <th className="p-4">Away Score</th>
                  <th className="p-4">Winner</th>
                  <th className="p-4">Recorded At</th>
                </tr>
              </thead>
              <tbody>
                {matchResults.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-4 text-slate-500">
                      No results found.
                    </td>
                  </tr>
                ) : (
                  matchResults.map((result) => (
                    <tr key={result.result_id} className="border-t">
                      <td className="p-4 font-semibold">
                        {result.matches?.home_team?.team_name || "Home"} vs{" "}
                        {result.matches?.away_team?.team_name || "Away"}
                      </td>
                      <td className="p-4">{result.home_score}</td>
                      <td className="p-4">{result.away_score}</td>
                      <td className="p-4">
                        {result.winner?.team_name || "Draw/No winner"}
                      </td>
                      <td className="p-4">
                        {result.result_recorded_at
                          ? new Date(result.result_recorded_at).toLocaleString()
                          : "N/A"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </ReportTable>
          </div>
        )}
      </main>
    </div>
  );
}

function ReportCard({ title, value }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow">
      <p className="text-slate-500 text-sm">{title}</p>
      <h3 className="text-3xl font-bold text-slate-900 mt-2">{value}</h3>
    </div>
  );
}

function ReportTable({ title, description, children }) {
  return (
    <section className="bg-white rounded-2xl shadow overflow-hidden">
      <div className="p-6 border-b">
        <h3 className="text-xl font-bold text-slate-900">{title}</h3>
        <p className="text-slate-500 text-sm mt-1">{description}</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">{children}</table>
      </div>
    </section>
  );
}

export default Reports;