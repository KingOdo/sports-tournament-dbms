import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css'
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Teams from "./pages/Teams";
import Players from "./pages/Players";
function App() {

  return (
    <>
       <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/teams" element={<Teams />} />
        <Route path="/players" element={<Players />} />
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
