import { NavLink, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const navLinks = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Teams", path: "/teams" },
    { name: "Players", path: "/players" },
    { name: "Tournaments", path: "/tournaments" },
    { name: "Venues", path: "/venues" },
    { name: "Matches", path: "/matches" },
    { name: "Results", path: "/results" },
    { name: "Reports", path: "/reports" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-6">
        <div>
          <h1 className="text-white text-xl font-bold tracking-wide">
            Sports DBMS
          </h1>
          <p className="text-slate-400 text-xs">
            Tournament Management System
          </p>
        </div>

        <nav className="hidden lg:flex items-center justify-center gap-2 bg-white/5 px-3 py-2 rounded-2xl mx-auto">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `px-4 py-2 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? "bg-white text-slate-950"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className=" text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-grey-700 transition cursor-pointer"
        >
          Logout
        </button>
      </div>

      <div className="lg:hidden px-4 pb-4 overflow-x-auto">
        <nav className="flex gap-2 min-w-max">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `px-4 py-2 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? "bg-white text-slate-950"
                    : "bg-white/10 text-white"
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;