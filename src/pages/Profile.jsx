import React, { useEffect, useMemo, useState } from "react";
import {
  Camera,
  MapPin,
  CalendarDays,
  Settings,
  Heart,
  Bookmark,
  Image as ImageIcon,
  Grid3X3,
  UserRound,
  Users,
  UserPlus,
  Edit3,
  Plus,
  ArrowRight,
  MoreHorizontal,
  Loader2,
  RefreshCw,
  X,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import api from "../services/axios";
import { getAllPosts } from "../services/postService";
import {
  getFollowers,
  getFollowing,
} from "../services/followService";
import { useAuth } from "../contexts/AuthContext";

import "./Profile.css";

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);

  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);

  const [activeTab, setActiveTab] = useState("memories");

  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  const [error, setError] = useState("");

  /*
   =========================================================
   FOLLOWERS / FOLLOWING MODAL
   =========================================================
  */

  const [connectionType, setConnectionType] = useState(null);
  const [connectionUsers, setConnectionUsers] = useState([]);
  const [connectionLoading, setConnectionLoading] = useState(false);
  const [connectionError, setConnectionError] = useState("");

  const userId = user?.id;

  /* =========================================================
     LOAD PROFILE
  ========================================================= */

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      setPostsLoading(false);
      setStatsLoading(false);
      return;
    }

    loadProfile();
    loadProfileStats();
    loadUserPosts();
  }, [userId]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/api/users/${userId}`);

      setProfile(response.data);
    } catch (err) {
      console.error("Failed to load profile:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to load your profile."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     LOAD FOLLOWERS / FOLLOWING COUNTS
  ========================================================= */

  const loadProfileStats = async () => {
    try {
      setStatsLoading(true);

      const [followersResponse, followingResponse] =
        await Promise.all([
          api.get(`/api/follows/followers/${userId}`),
          api.get(`/api/follows/following/${userId}`),
        ]);

      setFollowers(Number(followersResponse.data) || 0);
      setFollowing(Number(followingResponse.data) || 0);
    } catch (err) {
      console.error("Failed to load profile stats:", err);

      setFollowers(0);
      setFollowing(0);
    } finally {
      setStatsLoading(false);
    }
  };

  /* =========================================================
     LOAD MY POSTS
  ========================================================= */

  const loadUserPosts = async () => {
    try {
      setPostsLoading(true);

      const data = await getAllPosts();

      const allPosts = Array.isArray(data) ? data : [];

      const myPosts = allPosts.filter(
        (post) => Number(post.userId) === Number(userId)
      );

      setPosts(myPosts);
    } catch (err) {
      console.error("Failed to load user memories:", err);

      setPosts([]);
    } finally {
      setPostsLoading(false);
    }
  };

  /* =========================================================
     OPEN FOLLOWERS / FOLLOWING
  ========================================================= */

  const openConnections = async (type) => {
    if (!userId) {
      return;
    }

    try {
      setConnectionType(type);
      setConnectionUsers([]);
      setConnectionError("");
      setConnectionLoading(true);

      let responseData;

      if (type === "followers") {
        responseData = await getFollowers(Number(userId));
      } else {
        responseData = await getFollowing(Number(userId));
      }

      /*
       * Backend normally returns:
       *
       * [
       *   {
       *     id,
       *     username,
       *     email,
       *     profilePhotoUrl
       *   }
       * ]
       *
       * These extra checks also make the frontend safe if
       * the API response is wrapped in another object.
       */

      let users = [];

      if (Array.isArray(responseData)) {
        users = responseData;
      } else if (Array.isArray(responseData?.content)) {
        users = responseData.content;
      } else if (Array.isArray(responseData?.users)) {
        users = responseData.users;
      } else if (Array.isArray(responseData?.data)) {
        users = responseData.data;
      }

      setConnectionUsers(users);
    } catch (err) {
      console.error(
        `Failed to load ${type}:`,
        err
      );

      setConnectionUsers([]);

      setConnectionError(
        err?.response?.data?.message ||
          `Unable to load your ${
            type === "followers"
              ? "followers"
              : "following"
          }.`
      );
    } finally {
      setConnectionLoading(false);
    }
  };

  /* =========================================================
     CLOSE FOLLOWERS / FOLLOWING MODAL
  ========================================================= */

  const closeConnections = () => {
    setConnectionType(null);
    setConnectionUsers([]);
    setConnectionLoading(false);
    setConnectionError("");
  };

  /* =========================================================
     ESC KEY FOR MODAL
  ========================================================= */

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        closeConnections();
      }
    };

    if (connectionType) {
      document.addEventListener(
        "keydown",
        handleEscape
      );
    }

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [connectionType]);

  /* =========================================================
     REFRESH EVERYTHING
  ========================================================= */

  const refreshProfile = async () => {
    if (!userId) return;

    await Promise.all([
      loadProfile(),
      loadProfileStats(),
      loadUserPosts(),
    ]);
  };

  /* =========================================================
     DISPLAY DATA
  ========================================================= */

  const displayName =
    profile?.username ||
    user?.username ||
    "MemoriesHub User";

  const email =
    profile?.email ||
    user?.email ||
    "";

  const profilePhoto =
    profile?.profilePhotoUrl ||
    "https://i.pravatar.cc/300?img=12";

  const formattedMemberDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString(
        "en-IN",
        {
          month: "long",
          year: "numeric",
        }
      )
    : "2025";

  const totalMemories = posts.length;

  const firstPost =
    posts.length > 0 ? posts[0] : null;

  const location =
    firstPost?.location ||
    "India";

  /* =========================================================
     TABS
  ========================================================= */

  const visiblePosts = useMemo(() => {
    if (activeTab === "saved") {
      return [];
    }

    return posts;
  }, [posts, activeTab]);

  /* =========================================================
     DATE FORMAT
  ========================================================= */

  const formatDate = (date) => {
    if (!date) return "";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "";
    }

    return parsed.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  /* =========================================================
     NOT LOGGED IN
  ========================================================= */

  if (!userId) {
    return (
      <div className="profile-page">
        <div className="profile-empty-login">
          <div className="profile-empty-icon">
            <UserRound size={34} />
          </div>

          <h2>Please log in</h2>

          <p>
            You need to be logged in to view your profile.
          </p>

          <Link
            to="/login"
            className="profile-primary-btn"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div className="profile-page">

      {/* =====================================================
          PROFILE HERO
      ===================================================== */}

      <section className="profile-hero-card">

        {/* COVER */}
        <div className="profile-cover">

          <div className="cover-gradient-one"></div>

          <div className="cover-gradient-two"></div>

          <div className="cover-pattern">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>

          <button
            type="button"
            className="cover-camera-btn"
            title="Change cover photo"
          >
            <Camera size={17} />
          </button>
        </div>

        {/* MAIN PROFILE */}
        <div className="profile-main">

          {/* AVATAR */}
          <div className="profile-avatar-wrapper">

            <img
              src={profilePhoto}
              alt={displayName}
              className="profile-avatar"
              onError={(event) => {
                event.currentTarget.src =
                  "https://i.pravatar.cc/300?img=12";
              }}
            />

            <button
              type="button"
              className="avatar-camera-btn"
              title="Change profile photo"
            >
              <Camera size={15} />
            </button>
          </div>

          {/* ACTIONS */}
          <div className="profile-actions">

            <Link
              to="/settings"
              className="profile-secondary-btn"
            >
              <Edit3 size={17} />
              Edit Profile
            </Link>

            <button
              type="button"
              className="profile-icon-btn"
              title="Profile settings"
            >
              <Settings size={19} />
            </button>

            <button
              type="button"
              className="profile-more-btn"
              title="More"
            >
              <MoreHorizontal size={20} />
            </button>

          </div>

          {/* PROFILE INFORMATION */}
          <div className="profile-information">

            <div className="profile-name-row">

              <div>

                <h1>{displayName}</h1>

                <p className="profile-username">
                  @{displayName
                    .toLowerCase()
                    .replace(/\s+/g, "")}
                </p>

              </div>

              <div className="profile-online">
                <span></span>
                Active
              </div>

            </div>

            <p className="profile-bio">
              Creating memories, one beautiful moment at a
              time. ✨
            </p>

            <div className="profile-meta">

              <span>
                <MapPin size={16} />
                {location}
              </span>

              <span>
                <CalendarDays size={16} />
                Member since {formattedMemberDate}
              </span>

              {email && (
                <span className="profile-email">
                  {email}
                </span>
              )}

            </div>

          </div>

          {/* =================================================
              STATS
          ================================================= */}

          <div className="profile-stats">

            {/* MEMORIES */}
            <div className="profile-stat">

              <div className="profile-stat-icon memories">
                <ImageIcon size={18} />
              </div>

              <div>
                <strong>
                  {totalMemories}
                </strong>

                <span>
                  Memories
                </span>
              </div>

            </div>

            <div className="profile-stat-divider"></div>

            {/* FOLLOWERS */}
            <button
              type="button"
              className="profile-stat profile-stat-button"
              onClick={() =>
                openConnections("followers")
              }
              title="View followers"
            >

              <div className="profile-stat-icon followers">
                <Users size={18} />
              </div>

              <div>

                <strong>
                  {statsLoading ? "—" : followers}
                </strong>

                <span>
                  Followers
                </span>

              </div>

            </button>

            <div className="profile-stat-divider"></div>

            {/* FOLLOWING */}
            <button
              type="button"
              className="profile-stat profile-stat-button"
              onClick={() =>
                openConnections("following")
              }
              title="View following"
            >

              <div className="profile-stat-icon following">
                <UserPlus size={18} />
              </div>

              <div>

                <strong>
                  {statsLoading ? "—" : following}
                </strong>

                <span>
                  Following
                </span>

              </div>

            </button>

            <div className="profile-stat-divider"></div>

            {/* SAVED */}
            <div className="profile-stat">

              <div className="profile-stat-icon saved">
                <Bookmark size={18} />
              </div>

              <div>

                <strong>
                  0
                </strong>

                <span>
                  Saved
                </span>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <section className="profile-content">

        {/* HEADER */}
        <div className="profile-content-header">

          <div>

            <span className="profile-section-label">
              <Heart size={15} />
              YOUR SPACE
            </span>

            <h2>
              My memories
            </h2>

            <p>
              Moments and stories you've shared with the
              world.
            </p>

          </div>

          <div className="profile-content-actions">

            <button
              type="button"
              className="profile-refresh-btn"
              onClick={refreshProfile}
              disabled={
                loading ||
                postsLoading ||
                statsLoading
              }
            >
              <RefreshCw
                size={17}
                className={
                  loading ||
                  postsLoading ||
                  statsLoading
                    ? "profile-refresh-spin"
                    : ""
                }
              />

              Refresh
            </button>

            <Link
              to="/create"
              className="profile-create-btn"
            >
              <Plus size={18} />
              Create Memory
            </Link>

          </div>

        </div>

        {/* =================================================
            TABS
        ================================================= */}

        <div className="profile-tabs">

          <button
            type="button"
            className={
              activeTab === "memories"
                ? "profile-tab active"
                : "profile-tab"
            }
            onClick={() =>
              setActiveTab("memories")
            }
          >
            <Grid3X3 size={17} />

            My Memories

            <span>
              {totalMemories}
            </span>
          </button>

          <button
            type="button"
            className={
              activeTab === "saved"
                ? "profile-tab active"
                : "profile-tab"
            }
            onClick={() =>
              setActiveTab("saved")
            }
          >
            <Bookmark size={17} />

            Saved

            <span>
              0
            </span>
          </button>

        </div>

        {/* =================================================
            LOADING
        ================================================= */}

        {(loading || postsLoading) && (
          <div className="profile-loading">

            <div className="profile-loader">
              <Loader2 size={27} />
            </div>

            <h3>
              Loading your memories...
            </h3>

            <p>
              Bringing your beautiful moments together.
            </p>

          </div>
        )}

        {/* =================================================
            ERROR
        ================================================= */}

        {!loading && error && (
          <div className="profile-error">

            <div className="profile-error-icon">
              !
            </div>

            <h3>
              {error}
            </h3>

            <p>
              Something went wrong while loading your
              profile.
            </p>

            <button
              type="button"
              onClick={refreshProfile}
            >
              <RefreshCw size={16} />
              Try again
            </button>

          </div>
        )}

        {/* =================================================
            EMPTY SAVED
        ================================================= */}

        {!loading &&
          !postsLoading &&
          !error &&
          activeTab === "saved" && (
            <div className="profile-empty">

              <div className="profile-empty-art">

                <div className="empty-art-circle">
                  <Bookmark size={35} />
                </div>

                <span className="empty-art-dot dot-one"></span>
                <span className="empty-art-dot dot-two"></span>
                <span className="empty-art-dot dot-three"></span>

              </div>

              <h3>
                No saved memories yet
              </h3>

              <p>
                Memories you save will appear here.
              </p>

              <Link
                to="/explore"
                className="profile-empty-create"
              >
                <ArrowRight size={18} />
                Explore memories
              </Link>

            </div>
          )}

        {/* =================================================
            EMPTY MY MEMORIES
        ================================================= */}

        {!loading &&
          !postsLoading &&
          !error &&
          activeTab === "memories" &&
          visiblePosts.length === 0 && (
            <div className="profile-empty">

              <div className="profile-empty-art">

                <div className="empty-art-circle">
                  <ImageIcon size={35} />
                </div>

                <span className="empty-art-dot dot-one"></span>
                <span className="empty-art-dot dot-two"></span>
                <span className="empty-art-dot dot-three"></span>

              </div>

              <h3>
                Your memories live here
              </h3>

              <p>
                Start creating beautiful memories and they
                will appear on your profile.
              </p>

              <Link
                to="/create"
                className="profile-empty-create"
              >
                <Plus size={18} />
                Create your first memory
              </Link>

            </div>
          )}

        {/* =================================================
            MEMORY GRID
        ================================================= */}

        {!loading &&
          !postsLoading &&
          !error &&
          activeTab === "memories" &&
          visiblePosts.length > 0 && (

            <div className="profile-memory-grid">

              {visiblePosts.map((post) => {

                const media =
                  Array.isArray(post.mediaList) &&
                  post.mediaList.length > 0
                    ? post.mediaList[0]
                    : null;

                return (
                  <article
                    className="profile-memory-card"
                    key={post.id}
                  >

                    {/* IMAGE */}
                    <Link
                      to="/explore"
                      className="profile-memory-image-wrapper"
                    >

                      {media ? (

                        media.mediaType === "VIDEO" ? (

                          <video
                            src={media.mediaUrl}
                            className="profile-memory-image"
                            muted
                            preload="metadata"
                            playsInline
                          />

                        ) : (

                          <img
                            src={media.mediaUrl}
                            alt={
                              post.description ||
                              "Memory"
                            }
                            className="profile-memory-image"
                            loading="lazy"
                          />

                        )

                      ) : (

                        <div className="profile-no-image">
                          <ImageIcon size={30} />
                          <span>
                            No image
                          </span>
                        </div>

                      )}

                      <div className="profile-memory-overlay">

                        <span>
                          <Heart size={17} />
                          Memory
                        </span>

                        <span>
                          <ArrowRight size={17} />
                        </span>

                      </div>

                      {post.category && (
                        <span className="profile-memory-category">
                          {post.category}
                        </span>
                      )}

                    </Link>

                    {/* CARD BODY */}
                    <div className="profile-memory-body">

                      <div className="profile-memory-location">

                        <MapPin size={14} />

                        <span>
                          {post.location ||
                            "Location not specified"}
                        </span>

                      </div>

                      <h3>
                        {post.description ||
                          "Beautiful memory"}
                      </h3>

                      <div className="profile-memory-footer">

                        <span>
                          {formatDate(
                            post.createdAt
                          )}
                        </span>

                        <Link to="/explore">
                          View
                          <ArrowRight size={14} />
                        </Link>

                      </div>

                    </div>

                  </article>
                );
              })}

            </div>
          )}

      </section>

      {/* =====================================================
          FOLLOWERS / FOLLOWING MODAL
      ===================================================== */}

      {connectionType && (
        <div
          className="profile-connections-overlay"
          onClick={closeConnections}
        >

          <div
            className="profile-connections-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* MODAL HEADER */}
            <div className="profile-connections-header">

              <div>
                <h3>
                  {connectionType === "followers"
                    ? "Followers"
                    : "Following"}
                </h3>

                <p>
                  {connectionType === "followers"
                    ? `${followers} ${
                        followers === 1
                          ? "follower"
                          : "followers"
                      }`
                    : `${following} ${
                        following === 1
                          ? "following"
                          : "following"
                      }`}
                </p>
              </div>

              <button
                type="button"
                className="profile-connections-close"
                onClick={closeConnections}
                aria-label="Close"
              >
                <X size={20} />
              </button>

            </div>

            {/* MODAL BODY */}
            <div className="profile-connections-body">

              {/* LOADING */}
              {connectionLoading && (
                <div className="profile-connections-loading">

                  <Loader2
                    size={28}
                    className="profile-connections-spinner"
                  />

                  <p>
                    Loading{" "}
                    {connectionType === "followers"
                      ? "followers"
                      : "following"}
                    ...
                  </p>

                </div>
              )}

              {/* ERROR */}
              {!connectionLoading &&
                connectionError && (
                  <div className="profile-connections-empty">

                    <div className="profile-connections-empty-icon">
                      !
                    </div>

                    <h4>
                      Unable to load users
                    </h4>

                    <p>
                      {connectionError}
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        openConnections(
                          connectionType
                        )
                      }
                    >
                      <RefreshCw size={15} />
                      Try again
                    </button>

                  </div>
                )}

              {/* EMPTY */}
              {!connectionLoading &&
                !connectionError &&
                connectionUsers.length === 0 && (
                  <div className="profile-connections-empty">

                    <div className="profile-connections-empty-icon">
                      <Users size={25} />
                    </div>

                    <h4>
                      {connectionType === "followers"
                        ? "No followers yet"
                        : "Not following anyone yet"}
                    </h4>

                    <p>
                      {connectionType === "followers"
                        ? "When people follow you, they will appear here."
                        : "People you follow will appear here."}
                    </p>

                  </div>
                )}

              {/* USERS */}
              {!connectionLoading &&
                !connectionError &&
                connectionUsers.length > 0 && (
                  <div className="profile-connection-list">

                    {connectionUsers.map(
                      (connectionUser) => {

                        const connectionUserName =
                          connectionUser?.username ||
                          "MemoriesHub User";

                        const connectionUserPhoto =
                          connectionUser?.profilePhotoUrl ||
                          "https://i.pravatar.cc/150?img=12";

                        return (
                          <button
                            type="button"
                            className="profile-connection-user"
                            key={
                              connectionUser.id
                            }
                            onClick={() => {
                              closeConnections();

                              navigate(
                                `/profile/${connectionUser.id}`
                              );
                            }}
                          >

                            <img
                              src={
                                connectionUserPhoto
                              }
                              alt={
                                connectionUserName
                              }
                              className="profile-connection-avatar"
                              onError={(event) => {
                                event.currentTarget.src =
                                  "https://i.pravatar.cc/150?img=12";
                              }}
                            />

                            <div className="profile-connection-info">

                              <strong>
                                {
                                  connectionUserName
                                }
                              </strong>

                              <span>
                                @
                                {connectionUserName
                                  .toLowerCase()
                                  .replace(
                                    /\s+/g,
                                    ""
                                  )}
                              </span>

                              {connectionUser?.email && (
                                <small>
                                  {
                                    connectionUser.email
                                  }
                                </small>
                              )}

                            </div>

                            <ArrowRight
                              size={18}
                              className="profile-connection-arrow"
                            />

                          </button>
                        );
                      }
                    )}

                  </div>
                )}

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default Profile;