"use client";

import { useAuth } from "@/providers";
import Button from "@/components/ui/button";

export const UserProfile: React.FC = () => {
  const { user, logout, isLoading } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Not logged in</div>;
  }

  return (
    <div
      style={{ padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}
    >
      <h3>User Profile</h3>
      <div>
        <p>
          <strong>Name:</strong> {user.name}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Role:</strong> {user.role}
        </p>
        {user.lastLogin && (
          <p>
            <strong>Last Login:</strong>{" "}
            {new Date(user.lastLogin).toLocaleString()}
          </p>
        )}
      </div>
      <Button
        title="Logout"
        variant="secondary"
        onClick={handleLogout}
        style={{ marginTop: "10px" }}
      />
    </div>
  );
};

export default UserProfile;
