import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import { supabase } from "../lib/supabaseClient";

function Venue() {
  const [venues, setVenues] = useState([]);

  const [venueName, setVenueName] = useState("");
  const [location, setLocation] = useState("");
  const [capacity, setCapacity] = useState("");

  const [editingVenue, setEditingVenue] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchVenues = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("venues")
      .select("*")
      .order("venue_id", { ascending: true });

    if (error) {
      setMessage("Error loading venues: " + error.message);
      setVenues([]);
    } else {
      setVenues(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    const loadVenues = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("venues")
        .select("*")
        .order("venue_id", { ascending: true });

      if (error) {
        setMessage("Error loading venues: " + error.message);
        setVenues([]);
      } else {
        setVenues(data || []);
      }

      setLoading(false);
    };

    loadVenues();
  }, []);

  const resetForm = () => {
    setVenueName("");
    setLocation("");
    setCapacity("");
    setEditingVenue(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!venueName || !location || !capacity) {
      setMessage("Please fill in all fields.");
      return;
    }

    if (Number(capacity) <= 0) {
      setMessage("Capacity must be greater than zero.");
      return;
    }

    const venueData = {
      venue_name: venueName,
      location: location,
      capacity: Number(capacity),
    };

    if (editingVenue) {
      const { error } = await supabase
        .from("venues")
        .update(venueData)
        .eq("venue_id", editingVenue.venue_id);

      if (error) {
        setMessage("Error updating venue: " + error.message);
      } else {
        setMessage("Venue updated successfully.");
        resetForm();
        fetchVenues();
      }
    } else {
      const { error } = await supabase.from("venues").insert([venueData]);

      if (error) {
        setMessage("Error adding venue: " + error.message);
      } else {
        setMessage("Venue added successfully.");
        resetForm();
        fetchVenues();
      }
    }
  };

  const handleEdit = (venue) => {
    setEditingVenue(venue);
    setVenueName(venue.venue_name);
    setLocation(venue.location);
    setCapacity(venue.capacity);
    setMessage("");
  };

  const handleDelete = async (venueId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this venue?"
    );

    if (!confirmDelete) return;

    const { error } = await supabase
      .from("venues")
      .delete()
      .eq("venue_id", venueId);

    if (error) {
      setMessage("Error deleting venue: " + error.message);
    } else {
      setMessage("Venue deleted successfully.");
      fetchVenues();
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <main className="max-w-7xl mx-auto p-6 md:p-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <p className="text-slate-500 text-sm">Manage match venues</p>
            <h2 className="text-3xl font-bold text-slate-900">
              Venues Management
            </h2>
          </div>

          {/*<button
            onClick={fetchVenues}
            className="bg-slate-900 text-white px-5 py-3 rounded-xl font-semibold hover:bg-slate-700"
          >
            Refresh Venues
          </button> */}
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
                {editingVenue ? "Edit Venue" : "Add New Venue"}
              </h3>
              <p className="text-slate-500 text-sm">
                Enter venue name, location, and capacity.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Venue Name
                  </label>
                  <input
                    type="text"
                    value={venueName}
                    onChange={(e) => setVenueName(e.target.value)}
                    placeholder="Central Stadium"
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Nicosia"
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Capacity
                  </label>
                  <input
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    placeholder="25000"
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-5">
                <button
                  type="submit"
                  className="bg-slate-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-700 transition"
                >
                  {editingVenue ? "Update Venue" : "Add Venue"}
                </button>

                {editingVenue && (
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
              <h3 className="text-xl font-bold text-slate-900">Venue List</h3>
              <p className="text-slate-500 text-sm mt-1">
                View, edit, and delete venues stored in the database.
              </p>
            </div>

            {loading ? (
              <div className="p-6 text-slate-500">Loading venues...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-700">
                    <tr>
                      <th className="p-4">ID</th>
                      <th className="p-4">Venue Name</th>
                      <th className="p-4">Location</th>
                      <th className="p-4">Capacity</th>
                      <th className="p-4">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {venues.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="p-4 text-slate-500">
                          No venues found.
                        </td>
                      </tr>
                    ) : (
                      venues.map((venue) => (
                        <tr key={venue.venue_id} className="border-t">
                          <td className="p-4">{venue.venue_id}</td>
                          <td className="p-4 font-semibold text-slate-900">
                            {venue.venue_name}
                          </td>
                          <td className="p-4">{venue.location}</td>
                          <td className="p-4">
                            {Number(venue.capacity).toLocaleString()}
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(venue)}
                                className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700"
                              >
                                Edit
                              </button>

                              <button
                                onClick={() => handleDelete(venue.venue_id)}
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

export default Venue;