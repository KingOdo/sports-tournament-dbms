import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import { supabase } from "../lib/supabaseClient";

function Teams() {
  const [teams, setTeams] = useState([]);
  const [teamName, setTeamName] = useState("");
  const [coachName, setCoachName] = useState("");
  const [city, setCity] = useState("");
  const [editingTeam, setEditingTeam] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchTeams = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("teams")
      .select("*")
      .order("team_id", { ascending: true });

    if (error) {
      setMessage("Error loading teams: " + error.message);
      setTeams([]);
    } else {
      setTeams(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const resetForm = () => {
    setTeamName("");
    setCoachName("");
    setCity("");
    setEditingTeam(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!teamName || !coachName || !city) {
      setMessage("Please fill in all fields.");
      return;
    }

    if (editingTeam) {
      const { error } = await supabase
        .from("teams")
        .update({
          team_name: teamName,
          coach_name: coachName,
          city: city,
        })
        .eq("team_id", editingTeam.team_id);

      if (error) {
        setMessage("Error updating team: " + error.message);
      } else {
        setMessage("Team updated successfully.");
        resetForm();
        fetchTeams();
      }
    } else {
      const { error } = await supabase.from("teams").insert([
        {
          team_name: teamName,
          coach_name: coachName,
          city: city,
        },
      ]);

      if (error) {
        setMessage("Error adding team: " + error.message);
      } else {
        setMessage("Team added successfully.");
        resetForm();
        fetchTeams();
      }
    }
  };

  const handleEdit = (team) => {
    setEditingTeam(team);
    setTeamName(team.team_name);
    setCoachName(team.coach_name);
    setCity(team.city);
    setMessage("");
  };

  const handleDelete = async (teamId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this team?"
    );

    if (!confirmDelete) return;

    const { error } = await supabase
      .from("teams")
      .delete()
      .eq("team_id", teamId);

    if (error) {
      setMessage("Error deleting team: " + error.message);
    } else {
      setMessage("Team deleted successfully.");
      fetchTeams();
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <main className="max-w-7xl mx-auto p-6 md:p-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <p className="text-slate-500 text-sm">Manage tournament teams</p>
            <h2 className="text-3xl font-bold text-slate-900">
              Teams Management
            </h2>
          </div>

          <button
            onClick={fetchTeams}
            className="bg-slate-900 text-white px-5 py-3 rounded-xl font-semibold hover:bg-slate-700"
          >
            Refresh Teams
          </button>
        </div>

        {message && (
          <div className="mb-6 bg-white border border-slate-200 rounded-2xl px-5 py-4 text-slate-700 shadow-sm">
            {message}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <section className="bg-white rounded-2xl shadow p-6 lg:col-span-1">
            <h3 className="text-xl font-bold text-slate-900 mb-1">
              {editingTeam ? "Edit Team" : "Add New Team"}
            </h3>
            <p className="text-slate-500 text-sm mb-6">
              Enter team details below.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Team Name
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Example: Lions FC"
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Coach Name
                </label>
                <input
                  type="text"
                  value={coachName}
                  onChange={(e) => setCoachName(e.target.value)}
                  placeholder="Example: John Peters"
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Example: Nicosia"
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-slate-700 transition"
                >
                  {editingTeam ? "Update Team" : "Add Team"}
                </button>

                {editingTeam && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-slate-200 text-slate-900 py-3 rounded-xl font-semibold hover:bg-slate-300 transition"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </section>

          <section className="bg-white rounded-2xl shadow overflow-hidden lg:col-span-2">
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold text-slate-900">Team List</h3>
              <p className="text-slate-500 text-sm mt-1">
                View, edit, and delete teams stored in the database.
              </p>
            </div>

            {loading ? (
              <div className="p-6 text-slate-500">Loading teams...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-700">
                    <tr>
                      <th className="p-4">ID</th>
                      <th className="p-4">Team Name</th>
                      <th className="p-4">Coach</th>
                      <th className="p-4">City</th>
                      <th className="p-4">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {teams.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="p-4 text-slate-500">
                          No teams found.
                        </td>
                      </tr>
                    ) : (
                      teams.map((team) => (
                        <tr key={team.team_id} className="border-t">
                          <td className="p-4">{team.team_id}</td>
                          <td className="p-4 font-semibold text-slate-900">
                            {team.team_name}
                          </td>
                          <td className="p-4">{team.coach_name}</td>
                          <td className="p-4">{team.city}</td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(team)}
                                className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700"
                              >
                                Edit
                              </button>

                              <button
                                onClick={() => handleDelete(team.team_id)}
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

export default Teams;