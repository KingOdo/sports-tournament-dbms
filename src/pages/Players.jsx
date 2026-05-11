import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import { supabase } from "../lib/supabaseClient";

function Players() {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);

  const [teamId, setTeamId] = useState("");
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [position, setPosition] = useState("");
  const [jerseyNumber, setJerseyNumber] = useState("");

  const [editingPlayer, setEditingPlayer] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchTeams = async () => {
    const { data, error } = await supabase
      .from("teams")
      .select("*")
      .order("team_name", { ascending: true });

    if (error) {
      setMessage("Error loading teams: " + error.message);
      setTeams([]);
    } else {
      setTeams(data || []);
    }
  };

  const fetchPlayers = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("players")
      .select(`
        player_id,
        team_id,
        full_name,
        age,
        position,
        jersey_number,
        teams(team_name)
      `)
      .order("player_id", { ascending: true });

    if (error) {
      setMessage("Error loading players: " + error.message);
      setPlayers([]);
    } else {
      setPlayers(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchTeams();
    fetchPlayers();
  }, []);

  const resetForm = () => {
    setTeamId("");
    setFullName("");
    setAge("");
    setPosition("");
    setJerseyNumber("");
    setEditingPlayer(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!teamId || !fullName || !age || !position || !jerseyNumber) {
      setMessage("Please fill in all fields.");
      return;
    }

    if (Number(age) < 10) {
      setMessage("Player age must be at least 10.");
      return;
    }

    const playerData = {
      team_id: Number(teamId),
      full_name: fullName,
      age: Number(age),
      position: position,
      jersey_number: Number(jerseyNumber),
    };

    if (editingPlayer) {
      const { error } = await supabase
        .from("players")
        .update(playerData)
        .eq("player_id", editingPlayer.player_id);

      if (error) {
        setMessage("Error updating player: " + error.message);
      } else {
        setMessage("Player updated successfully.");
        resetForm();
        fetchPlayers();
      }
    } else {
      const { error } = await supabase.from("players").insert([playerData]);

      if (error) {
        setMessage("Error adding player: " + error.message);
      } else {
        setMessage("Player added successfully.");
        resetForm();
        fetchPlayers();
      }
    }
  };

  const handleEdit = (player) => {
    setEditingPlayer(player);
    setTeamId(player.team_id);
    setFullName(player.full_name);
    setAge(player.age);
    setPosition(player.position);
    setJerseyNumber(player.jersey_number);
    setMessage("");
  };

  const handleDelete = async (playerId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this player?"
    );

    if (!confirmDelete) return;

    const { error } = await supabase
      .from("players")
      .delete()
      .eq("player_id", playerId);

    if (error) {
      setMessage("Error deleting player: " + error.message);
    } else {
      setMessage("Player deleted successfully.");
      fetchPlayers();
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <main className="max-w-7xl mx-auto p-6 md:p-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <p className="text-slate-500 text-sm">Manage team players</p>
            <h2 className="text-3xl font-bold text-slate-900">
              Players Management
            </h2>
          </div>

          <button
            onClick={() => {
              fetchTeams();
              fetchPlayers();
            }}
            className="bg-slate-900 text-white px-5 py-3 rounded-xl font-semibold hover:bg-slate-700"
          >
            Refresh Players
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
                {editingPlayer ? "Edit Player" : "Add New Player"}
              </h3>
              <p className="text-slate-500 text-sm">
                Select a team and enter player details.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid md:grid-cols-5 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Team
                  </label>
                  <select
                    value={teamId}
                    onChange={(e) => setTeamId(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900 bg-white"
                  >
                    <option value="">Select team</option>
                    {teams.map((team) => (
                      <option key={team.team_id} value={team.team_id}>
                        {team.team_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Daniel King"
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Age
                  </label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="21"
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Position
                  </label>
                  <input
                    type="text"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder="Forward"
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Jersey No.
                  </label>
                  <input
                    type="number"
                    value={jerseyNumber}
                    onChange={(e) => setJerseyNumber(e.target.value)}
                    placeholder="9"
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-5">
                <button
                  type="submit"
                  className="bg-slate-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-700 transition"
                >
                  {editingPlayer ? "Update Player" : "Add Player"}
                </button>

                {editingPlayer && (
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
              <h3 className="text-xl font-bold text-slate-900">Player List</h3>
              <p className="text-slate-500 text-sm mt-1">
                View, edit, and delete players stored in the database.
              </p>
            </div>

            {loading ? (
              <div className="p-6 text-slate-500">Loading players...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-700">
                    <tr>
                      <th className="p-4">ID</th>
                      <th className="p-4">Full Name</th>
                      <th className="p-4">Team</th>
                      <th className="p-4">Age</th>
                      <th className="p-4">Position</th>
                      <th className="p-4">Jersey</th>
                      <th className="p-4">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {players.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="p-4 text-slate-500">
                          No players found.
                        </td>
                      </tr>
                    ) : (
                      players.map((player) => (
                        <tr key={player.player_id} className="border-t">
                          <td className="p-4">{player.player_id}</td>
                          <td className="p-4 font-semibold text-slate-900">
                            {player.full_name}
                          </td>
                          <td className="p-4">
                            {player.teams?.team_name || "No Team"}
                          </td>
                          <td className="p-4">{player.age}</td>
                          <td className="p-4">{player.position}</td>
                          <td className="p-4">{player.jersey_number}</td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(player)}
                                className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700"
                              >
                                Edit
                              </button>

                              <button
                                onClick={() => handleDelete(player.player_id)}
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

export default Players;