import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

function Login() {
  const navigate = useNavigate();

  const [isSignup, setIsSignup] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [roleId, setRoleId] = useState("");

  const [message, setMessage] = useState("");

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setRoleId("");
    setMessage("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!email.trim() || !password.trim()) {
      setMessage("Please enter your email and password.");
      return;
    }

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email.trim())
      .eq("password", password)
      .single();

    if (error || !data) {
      setMessage("Invalid email or password.");
      return;
    }

    localStorage.setItem("user", JSON.stringify(data));
    navigate("/dashboard");
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage("");

    if (
      !fullName.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim() ||
      !roleId
    ) {
      setMessage("Please fill in all signup fields.");
      return;
    }

    if (!email.includes("@")) {
      setMessage("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    const { data: existingUser } = await supabase
      .from("users")
      .select("*")
      .eq("email", email.trim())
      .maybeSingle();

    if (existingUser) {
      setMessage("This email already exists. Please login instead.");
      return;
    }

    const { error } = await supabase.from("users").insert([
      {
        full_name: fullName.trim(),
        email: email.trim(),
        password: password,
        role_id: Number(roleId),
      },
    ]);

    if (error) {
      setMessage("Signup failed: " + error.message);
      return;
    }

    setMessage("Account created successfully. You can now login.");
    setIsSignup(false);
    resetForm();
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl min-h-[90vh] grid md:grid-cols-2 bg-white rounded-3xl overflow-hidden shadow-2xl">
        <div className="hidden md:block relative bg-[url('/sports.jpeg')] bg-cover bg-center">
          <div className="absolute inset-0 bg-gradient-to-br from-black/85 via-black/65 to-black/85"></div>

          <div className="absolute inset-0 flex flex-col justify-between p-10 text-white">
            <div>
              <h1 className="text-4xl font-bold leading-tight">
                Sports Tournament System
              </h1>
              <p className="text-gray-300 mt-4 leading-relaxed">
                Manage players, teams, matches, venues, results, and tournament
                records in one system.
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5">
                <p className="text-sm text-gray-300">Current Focus</p>
                <h2 className="text-xl font-semibold mt-1">
                  Tournament Management
                </h2>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-3">
                  <h3 className="font-bold">Teams</h3>
                  <p className="text-xs text-gray-300">Manage</p>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-xl p-3">
                  <h3 className="font-bold">Matches</h3>
                  <p className="text-xs text-gray-300">Schedule</p>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-xl p-3">
                  <h3 className="font-bold">Results</h3>
                  <p className="text-xs text-gray-300">Track</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center p-6 md:p-12">
          <div className="w-full max-w-md">
            <p className="text-sm text-slate-500 mb-2">
              {isSignup ? "Create your account" : "Welcome back"}
            </p>

            <h2 className="text-3xl font-bold text-slate-900 mb-6">
              {isSignup ? "Sign Up" : "Login"}
            </h2>

            {message && (
              <div className="mb-4 rounded-xl bg-slate-100 border border-slate-200 px-4 py-3 text-sm text-slate-700">
                {message}
              </div>
            )}

            <form
              className="space-y-4"
              onSubmit={isSignup ? handleSignup : handleLogin}
            >
              {isSignup && (
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                  />
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                />
              </div>

              {isSignup && (
                <>
                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      Role
                    </label>
                    <select
                      value={roleId}
                      onChange={(e) => setRoleId(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900 bg-white"
                    >
                      <option value="">Select role</option>
                      <option value="1">Admin</option>
                      <option value="2">Tournament Manager</option>
                      <option value="3">Referee</option>
                      <option value="4">Team Manager</option>
                    </select>
                  </div>
                </>
              )}

              <button
                type="submit"
                className="w-full bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-slate-700 transition"
              >
                {isSignup ? "Create Account" : "Login"}
              </button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-6">
              {isSignup ? "Already have an account?" : "Don’t have an account?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setIsSignup(!isSignup);
                  resetForm();
                }}
                className="text-slate-900 font-semibold hover:underline"
              >
                {isSignup ? "Login" : "Sign up"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;