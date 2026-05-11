import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import { supabase } from "../lib/supabaseClient";

function Tournaments() {
  const [tournaments, setTournaments] = useState([]);

  const [tournamentName, setTournamentName] = useState("");
  const [sportType, setSportType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("Upcoming");

  const [editingTournament, setEditingTournament] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchTournaments = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("tournaments")
      .select("*")
      .order("tournament_id", { ascending: true });

    if (error) {
      setMessage("Error loading the tournament: " + error.message);
      setTournaments([]);
    } else {
      setTournaments(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  const resetForm = () => {
    setTournamentName("");
    setSportType("");
    setStartDate("");
    setEndDate("");
    setStatus("Upcoming");
    setEditingTournament(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!tournamentName || !sportType || !startDate || !endDate || !status) {
      setMessage("Please fill in all fields.");
      return;
    }

    if (endDate < startDate) {
      setMessage("End date cannot be before start date.");
      return;
    }

    const tournamentData = {
      tournament_name: tournamentName,
      sport_type: sportType,
      start_date: startDate,
      end_date: endDate,
      status: status,
    };

    if (editingTournament) {
      const { error } = await supabase
        .from("tournaments")
        .update(tournamentData)
        .eq("tournament_id", editingTournament.tournament_id);

      if (error) {
        setMessage("Error updating tournament: " + error.message);
      } else {
        setMessage("Tournament updated successfully.");
        resetForm();
        fetchTournaments();
      }
    } else {
      const { error } = await supabase
        .from("tournaments")
        .insert([tournamentData]);

      if (error) {
        setMessage("Error adding tournament: " + error.message);
      } else {
        setMessage("Tournament added successfully.");
        resetForm();
        fetchTournaments();
      }
    }
  };

  const handleEdit = (tournament) => {
    setEditingTournament(tournament);
    setTournamentName(tournament.tournament_name);
    setSportType(tournament.sport_type);
    setStartDate(tournament.start_date);
    setEndDate(tournament.end_date);
    setStatus(tournament.status);
    setMessage("");
  };

  const handleDelete = async (tournamentId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this tournament?"
    );

    if (!confirmDelete) return;

    const { error } = await supabase
      .from("tournaments")
      .delete()
      .eq("tournament_id", tournamentId);

    if (error) {
      setMessage("Error deleting tournament: " + error.message);
    } else {
      setMessage("Tournament deleted successfully.");
      fetchTournaments();
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <main className="max-w-7xl mx-auto p-6 md:p-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <p className="text-slate-500 text-sm">Manage tournament records</p>
            <h2 className="text-3xl font-bold text-slate-900">
              Tournaments Management
            </h2>
          </div>

          <button
            onClick={fetchTournaments}
            className="bg-slate-900 text-white px-5 py-3 rounded-xl font-semibold hover:bg-slate-700"
          >
            Refresh Tournaments
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
                {editingTournament ? "Edit Tournament" : "Add New Tournament"}
              </h3>
              <p className="text-slate-500 text-sm">
                Enter tournament name, sport type, dates, and status.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid md:grid-cols-5 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Tournament Name
                  </label>
                  <input
                    type="text"
                    value={tournamentName}
                    onChange={(e) => setTournamentName(e.target.value)}
                    placeholder="Spring Cup 2026"
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Sport Type
                  </label>
                  <input
                    type="text"
                    value={sportType}
                    onChange={(e) => setSportType(e.target.value)}
                    placeholder="Football"
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900 bg-white"
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-5">
                <button
                  type="submit"
                  className="bg-slate-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-700 transition"
                >
                  {editingTournament ? "Update Tournament" : "Add Tournament"}
                </button>

                {editingTournament && (
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
              <h3 className="text-xl font-bold text-slate-900">
                Tournament List
              </h3>
              <p className="text-slate-500 text-sm mt-1">
                View, edit, and delete tournaments stored in the database.
              </p>
            </div>

            {loading ? (
              <div className="p-6 text-slate-500">Loading tournaments...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-700">
                    <tr>
                      <th className="p-4">ID</th>
                      <th className="p-4">Tournament</th>
                      <th className="p-4">Sport</th>
                      <th className="p-4">Start Date</th>
                      <th className="p-4">End Date</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {tournaments.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="p-4 text-slate-500">
                          No tournaments found.
                        </td>
                      </tr>
                    ) : (
                      tournaments.map((tournament) => (
                        <tr key={tournament.tournament_id} className="border-t">
                          <td className="p-4">{tournament.tournament_id}</td>
                          <td className="p-4 font-semibold text-slate-900">
                            {tournament.tournament_name}
                          </td>
                          <td className="p-4">{tournament.sport_type}</td>
                          <td className="p-4">{tournament.start_date}</td>
                          <td className="p-4">{tournament.end_date}</td>
                          <td className="p-4">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                tournament.status === "Completed"
                                  ? "bg-green-100 text-green-700"
                                  : tournament.status === "Ongoing"
                                  ? "bg-blue-100 text-blue-700"
                                  : tournament.status === "Cancelled"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {tournament.status}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(tournament)}
                                className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700"
                              >
                                Edit
                              </button>

                              <button
                                onClick={() =>
                                  handleDelete(tournament.tournament_id)
                                }
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

export default Tournaments;