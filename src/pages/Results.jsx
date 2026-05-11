import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import { supabase } from "../lib/supabaseClient";

function Results() {
  const [results, setResults] = useState([]);
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);

  const [matchId, setMatchId] = useState("");
  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");
  const [winnerTeamId, setWinnerTeamId] = useState("");

  const [editingResult, setEditingResult] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchDropdownData = async () => {
    const { data: matchData, error: matchError } = await supabase
      .from("matches")
      .select(`
        match_id,
        home_team_id,
        away_team_id,
        match_date,
        home_team:teams!matches_home_team_id_fkey(team_name),
        away_team:teams!matches_away_team_id_fkey(team_name)
      `)
      .order("match_date", { ascending: false });

    if (matchError) {
      setMessage("Error loading matches: " + matchError.message);
      setMatches([]);
    } else {
      setMatches(matchData || []);
    }

    const { data: teamData, error: teamError } = await supabase
      .from("teams")
      .select("*")
      .order("team_name", { ascending: true });

    if (teamError) {
      setMessage("Error loading teams: " + teamError.message);
      setTeams([]);
    } else {
      setTeams(teamData || []);
    }
  };

  const fetchResults = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("match_results")
      .select(`
        result_id,
        match_id,
        home_score,
        away_score,
        winner_team_id,
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

    if (error) {
      setMessage("Error loading results: " + error.message);
      setResults([]);
    } else {
      setResults(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    const loadResultsPage = async () => {
      await fetchDropdownData();
      await fetchResults();
    };

    loadResultsPage();
  }, []);

  const resetForm = () => {
    setMatchId("");
    setHomeScore("");
    setAwayScore("");
    setWinnerTeamId("");
    setEditingResult(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!matchId || homeScore === "" || awayScore === "" || !winnerTeamId) {
      setMessage("Please fill in all fields.");
      return;
    }

    if (Number(homeScore) < 0 || Number(awayScore) < 0) {
      setMessage("Scores cannot be negative.");
      return;
    }

    const resultData = {
      match_id: Number(matchId),
      home_score: Number(homeScore),
      away_score: Number(awayScore),
      winner_team_id: Number(winnerTeamId),
    };

    if (editingResult) {
      const { error } = await supabase
        .from("match_results")
        .update(resultData)
        .eq("result_id", editingResult.result_id);

      if (error) {
        setMessage("Error updating result: " + error.message);
      } else {
        await supabase
          .from("matches")
          .update({ match_status: "Completed" })
          .eq("match_id", Number(matchId));

        setMessage("Result updated successfully.");
        resetForm();
        fetchResults();
      }
    } else {
      const { error } = await supabase.from("match_results").insert([resultData]);

      if (error) {
        setMessage("Error adding result: " + error.message);
      } else {
        await supabase
          .from("matches")
          .update({ match_status: "Completed" })
          .eq("match_id", Number(matchId));

        setMessage("Result added successfully.");
        resetForm();
        fetchResults();
      }
    }
  };

  const handleEdit = (result) => {
    setEditingResult(result);
    setMatchId(result.match_id);
    setHomeScore(result.home_score);
    setAwayScore(result.away_score);
    setWinnerTeamId(result.winner_team_id);
    setMessage("");
  };

  const handleDelete = async (resultId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this result?"
    );

    if (!confirmDelete) return;

    const { error } = await supabase
      .from("match_results")
      .delete()
      .eq("result_id", resultId);

    if (error) {
      setMessage("Error deleting result: " + error.message);
    } else {
      setMessage("Result deleted successfully.");
      fetchResults();
    }
  };

  const formatMatchName = (match) => {
    const home = match.home_team?.team_name || "Home Team";
    const away = match.away_team?.team_name || "Away Team";
    const date = match.match_date
      ? new Date(match.match_date).toLocaleDateString()
      : "No Date";

    return `${home} vs ${away} - ${date}`;
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <main className="max-w-7xl mx-auto p-6 md:p-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <p className="text-slate-500 text-sm">Record match scores</p>
            <h2 className="text-3xl font-bold text-slate-900">
              Results Management
            </h2>
          </div>

          <button
            onClick={() => {
              fetchDropdownData();
              fetchResults();
            }}
            className="bg-slate-900 text-white px-5 py-3 rounded-xl font-semibold hover:bg-slate-700"
          >
            Refresh Results
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
                {editingResult ? "Edit Result" : "Add Match Result"}
              </h3>
              <p className="text-slate-500 text-sm">
                Select a match, enter scores, and choose the winning team.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Match
                  </label>
                  <select
                    value={matchId}
                    onChange={(e) => setMatchId(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900 bg-white"
                  >
                    <option value="">Select match</option>
                    {matches.map((match) => (
                      <option key={match.match_id} value={match.match_id}>
                        {formatMatchName(match)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Home Score
                  </label>
                  <input
                    type="number"
                    value={homeScore}
                    onChange={(e) => setHomeScore(e.target.value)}
                    placeholder="2"
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Away Score
                  </label>
                  <input
                    type="number"
                    value={awayScore}
                    onChange={(e) => setAwayScore(e.target.value)}
                    placeholder="1"
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Winner
                  </label>
                  <select
                    value={winnerTeamId}
                    onChange={(e) => setWinnerTeamId(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900 bg-white"
                  >
                    <option value="">Select winner</option>
                    {teams.map((team) => (
                      <option key={team.team_id} value={team.team_id}>
                        {team.team_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-5">
                <button
                  type="submit"
                  className="bg-slate-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-700 transition"
                >
                  {editingResult ? "Update Result" : "Add Result"}
                </button>

                {editingResult && (
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
              <h3 className="text-xl font-bold text-slate-900">Result List</h3>
              <p className="text-slate-500 text-sm mt-1">
                View, edit, and delete match results.
              </p>
            </div>

            {loading ? (
              <div className="p-6 text-slate-500">Loading results...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-700">
                    <tr>
                      <th className="p-4">ID</th>
                      <th className="p-4">Match</th>
                      <th className="p-4">Home Score</th>
                      <th className="p-4">Away Score</th>
                      <th className="p-4">Winner</th>
                      <th className="p-4">Recorded At</th>
                      <th className="p-4">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {results.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="p-4 text-slate-500">
                          No results found.
                        </td>
                      </tr>
                    ) : (
                      results.map((result) => (
                        <tr key={result.result_id} className="border-t">
                          <td className="p-4">{result.result_id}</td>
                          <td className="p-4 font-semibold text-slate-900">
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
                              ? new Date(
                                  result.result_recorded_at
                                ).toLocaleString()
                              : "N/A"}
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(result)}
                                className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700"
                              >
                                Edit
                              </button>

                              <button
                                onClick={() => handleDelete(result.result_id)}
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

export default Results;