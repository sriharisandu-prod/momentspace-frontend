import { UserPlus, Check } from "lucide-react";

import { useState } from "react";


function UserCard({ user }) {

  const [following, setFollowing] =
    useState(false);


  return (
    <div className="user-card">

      <img
        src={user.avatar}
        alt={user.name}
        className="user-card-avatar"
      />


      <div className="user-card-info">

        <strong>
          {user.name}
        </strong>

        <span>
          {user.memories}
        </span>

      </div>


      <button
        className={`follow-button ${
          following ? "following" : ""
        }`}
        onClick={() => setFollowing(!following)}
      >

        {following ? (
          <>
            <Check size={13} />
            Following
          </>
        ) : (
          <>
            <UserPlus size={13} />
            Follow
          </>
        )}

      </button>

    </div>
  );
}

export default UserCard;