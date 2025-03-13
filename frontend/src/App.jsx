import { useEffect, useState } from "react";
import axios from "axios";
import config from "./config";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await axios.get(`${config.backendUrl}/profile`, {
          withCredentials: true,
        });
        setUser(response.data);
      } catch (error) {
        console.log("Not authenticated");
      }
    }
    fetchProfile();
  }, []);

  const login = () => {
    window.location.href = `${config.backendUrl}/login`;
  };

  const logout = () => {
    window.location.href = `${config.backendUrl}/logout`;
  };

  return (
    <div>
      <h1>Keycloak Authentication</h1>
      {user ? (
        <>
          <pre>{JSON.stringify(user, null, 2)}</pre>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <button onClick={login}>Login</button>
      )}
    </div>
  );
}

export default App;
