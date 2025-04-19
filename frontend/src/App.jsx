import "./App.css";

// Router
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// Pages
import Home from "./pages/Home/home";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
// Hooks
import { useAuth } from "./hooks/useAuth";

function App() {
  const { auth, loading } = useAuth();

  if (loading) {
    return <p>Carregando...</p>;
  }

  return (
    <>
      <BrowserRouter>
        <Navbar />
        <div className="container">
          <Routes>
            <Route
              path="/"
              element={auth ? <Home /> : <Navigate to="/login" />}
            />
            <Route
              path="/login"
              element={!auth ? <Login /> : <Navigate to="/" />}
            />
            <Route
              path="/register"
              element={!auth ? <Register /> : <Navigate to="/" />}
            />
          </Routes>
        </div>
        <Footer />
      </BrowserRouter>
    </>
  );
}

export default App;
