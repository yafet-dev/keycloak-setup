import { useEffect, useState } from "react";
import axios from "axios";
import config from "./config";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
} from "react-router-dom";

function Home() {
  return (
    <div>
      <h1>Welcome to Keycloak Authentication</h1>
      <Link to="/profile">
        <button>Go to Profile</button>
      </Link>
    </div>
  );
}

function Profile() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await axios.get(`${config.backendUrl}/profile`, {
          withCredentials: true,
        });
        setUser(response.data);
      } catch (error) {
        console.log("Not authenticated, redirecting to login");
        window.location.href = `${config.backendUrl}/login`;
      }
    }
    fetchProfile();
  }, []);

  const logout = () => {
    window.location.href = `${config.backendUrl}/logout`;
  };

  return (
    <div>
      <h1>Profile</h1>
      {user ? (
        <>
          <pre>{JSON.stringify(user, null, 2)}</pre>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <p>Loading user data...</p>
      )}
      <Link to="/">
        <button>Back to Home</button>
      </Link>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;
