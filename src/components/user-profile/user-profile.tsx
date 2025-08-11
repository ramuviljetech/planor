"use client";

import { useAuth } from "@/providers";
import Button from "@/components/ui/button";
import styles from "./styles.module.css";
import {
  avatarIcon,
  myAccountIcon,
  editProfileIcon,
  supportIcon,
  logoutIcon,
} from "@/resources/images";
import Avatar from "../ui/avatar";
import Image from "next/image";
import classNames from "classnames";

export const UserProfile: React.FC = () => {
  const { user, logout, isLoading, isAuthenticated } = useAuth();

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

  if (!isAuthenticated) {
    return <div>Not logged in</div>;
  }

  return (
    <div className={styles.user_profile_container}>
      <div className={styles.user_profile_header_container}>
        <div className={styles.user_profile_avatar_container}>
          <Image
            src={avatarIcon}
            alt="User Avatar"
            className={styles.user_profile_avatar}
          />
        </div>
        <div className={styles.user_profile_name_container}>
          <p className={styles.user_name}>{user?.name || "John Doe"}</p>
          <p className={styles.user_role}>{user?.role || "Admin"}</p>
        </div>
      </div>
      <div className={styles.profile_actions}>
        <div className={styles.profile_actions_options}>
          <div className={styles.profile_actions_icons}>
            <Image src={myAccountIcon} alt="My Account" />
          </div>

          <div className={styles.profile_actions_text}>My Account</div>
        </div>
        <div className={styles.profile_actions_options}>
          <div className={styles.profile_actions_icons}>
            <Image src={editProfileIcon} alt="Edit Profile" />
          </div>
          <div className={styles.profile_actions_text}>Edit Profile</div>
        </div>
        <div className={styles.profile_actions_options}>
          <div className={styles.profile_actions_icons}>
            <Image src={supportIcon} alt="Support" />
          </div>
          <div className={styles.profile_actions_text}>Support</div>
        </div>
      </div>
      <div className={styles.logout_container}>
        <div className={styles.logout_button_section}>
          <div className={styles.logout_icon}>
            <Image src={logoutIcon} alt="Logout" />
          </div>
          <div onClick={handleLogout} className={styles.logout_text}>
            Log out
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
