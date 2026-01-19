import React from "react";
import { useAuth } from "../contexts/AuthContext";

function Profile() {
  const { user, logout } = useAuth();

  return <div>
    <h3>{user?.email}</h3>
    <button onClick={() => logout()}>Logout</button>
  </div>;
}

export default Profile;
