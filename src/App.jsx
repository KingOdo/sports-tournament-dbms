import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css'
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Teams from "./pages/Teams";
import Players from "./pages/Players";
import Tournaments from "./pages/Tournament";
import Venue from "./pages/Venue";
import Matches from "./pages/Matches";
import Results from "./pages/Results";
function App() {

  return (
    <>
       <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/teams" element={<Teams />} />
        <Route path="/players" element={<Players />} />
        <Route path="/tournaments" element={<Tournaments />} />
        <Route path="/venues" element={<Venue />} />
        <Route path="/matches" element={<Matches />} />
        <Route path="/results" element={<Results />} />
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
