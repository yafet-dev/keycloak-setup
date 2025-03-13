// src/components/Profile.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import config from "./config";
import { useNavigate } from "react-router-dom";

function Profile() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await axios.get(`${config.backendUrl}/profile`, {
          withCredentials: true,
        });
        setUser(response.data);
        setError(null); // Clear any previous errors
      } catch (error) {
        if (error.response && error.response.status === 401) {
          setError("You are not authenticated. Please log in.");
          navigate("/"); // Redirect to home page if not authenticated
        } else {
          setError("An error occurred while fetching your profile.");
        }
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [navigate]);

  const logout = () => {
    window.location.href = `${config.backendUrl}/logout`;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Profile</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {user ? (
        <div>
          <p>
            <strong>Username:</strong> {user.username}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Roles:</strong> {user.roles.join(", ")}
          </p>
          {Object.keys(user.attributes).length > 0 ? (
            <>
              <p>
                <strong>Attributes:</strong>
              </p>
              <pre>{JSON.stringify(user.attributes, null, 2)}</pre>
            </>
          ) : (
            <p>
              <strong>Attributes:</strong> No attributes available.
            </p>
          )}
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <p>Please log in to view your profile.</p>
      )}
    </div>
  );
}

export default Profile;
