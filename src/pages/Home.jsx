import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  saveMemory,
  unsaveMemory,
  getSavedMemories,
} from "../services/savedMemoryService";
import {
  Heart,
  MessageCircle,
  MapPin,
  Compass,
  Plus,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Image as ImageIcon,
  Play,
  UserPlus,
  UserCheck,
  Bookmark,
  Trash2,
  Send,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { getAllPosts } from "../services/postService";

import {
  likePost,
  unlikePost,
  getLikeCount,
  checkLike,
} from "../services/likeService";

import {
  createComment,
  getCommentsByPostId,
  getCommentCount,
  deleteComment,
} from "../services/commentService";

import {
  followUser,
  unfollowUser,
  checkFollowing,
} from "../services/followService";

import { useAuth } from "../contexts/AuthContext";

import "./Home.css";

const Home = () => {
  const { user } = useAuth();

  const currentUserId = Number(user?.id);

  const [posts, setPosts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
   * ============================
   * MEDIA CAROUSEL STATE
   * ============================
   *
   * Stores the currently visible
   * media index for each post.
   *
   * Example:
   * {
   *   10: 0,
   *   11: 2,
   *   12: 1
   * }
   */

  const [mediaIndexes, setMediaIndexes] = useState({});

  /*
   * ============================
   * LIKE STATE
   * ============================
   */

  const [likeCounts, setLikeCounts] = useState({});
  const [likedPosts, setLikedPosts] = useState({});
  const [likeLoading, setLikeLoading] = useState({});

  /*
   * ============================
   * COMMENT STATE
   * ============================
   */

  const [commentCounts, setCommentCounts] = useState({});
  const [comments, setComments] = useState({});
  const [openComments, setOpenComments] = useState({});
  const [commentLoading, setCommentLoading] = useState({});
  const [commentSubmitting, setCommentSubmitting] = useState({});
  const [commentText, setCommentText] = useState({});

  /*
   * ============================
   * FOLLOW STATE
   * ============================
   */

  const [followingUsers, setFollowingUsers] = useState({});
  const [followLoading, setFollowLoading] = useState({});

  /*
   * ============================
   * SAVE STATE
   * ============================
   *
   * Save is kept locally so the button
   * remains functional without changing
   * your current backend.
   */

  const [savedPosts, setSavedPosts] = useState({});

  /*
   * ============================
   * LOAD HOME
   * ============================
   */

  useEffect(() => {
    loadPosts();
  }, []);

  useEffect(() => {
    if (!currentUserId || posts.length === 0) {
      return;
    }

    loadPostInteractions();
  }, [posts, currentUserId]);


  /*
   * ============================
   * LOAD POSTS
   * ============================
   */

  const loadPosts = async () => {
  try {
    setLoading(true);
    setError("");

    const data = await getAllPosts();

    if (Array.isArray(data)) {
      const sortedPosts = [...data].sort((a, b) => {
        const dateA = new Date(a?.createdAt || 0).getTime();
        const dateB = new Date(b?.createdAt || 0).getTime();

        return dateB - dateA;
      });

      setPosts(sortedPosts);
    } else {
      setPosts([]);
    }
  } catch (err) {
    console.error("Failed to load posts:", err);

    setError(
      err?.response?.data?.message ||
        "Unable to load memories. Please try again."
    );
  } finally {
    setLoading(false);
  }
};

  /*
   * ============================
   * LOAD LIKE / COMMENT / FOLLOW
   * ============================
   */

  const loadPostInteractions = async () => {
    if (!currentUserId) {
      return;
    }

    const nextLikeCounts = {};
    const nextLikedPosts = {};
    const nextCommentCounts = {};
    const nextFollowingUsers = {};

    /*
     * Load likes and comments for every post.
     */

    await Promise.all(
      posts.map(async (post) => {
        const postId = Number(post.id);

        try {
          const count = await getLikeCount(postId);

          nextLikeCounts[postId] = extractNumber(count);
        } catch (err) {
          console.error(
            `Failed to load likes for post ${postId}:`,
            err
          );

          nextLikeCounts[postId] = 0;
        }

        try {
          const liked = await checkLike(
            currentUserId,
            postId
          );

          nextLikedPosts[postId] = extractBoolean(liked);
        } catch (err) {
          console.error(
            `Failed to check like for post ${postId}:`,
            err
          );

          nextLikedPosts[postId] = false;
        }

        try {
          const count = await getCommentCount(postId);

          nextCommentCounts[postId] = extractNumber(count);
        } catch (err) {
          console.error(
            `Failed to load comment count for post ${postId}:`,
            err
          );

          nextCommentCounts[postId] = 0;
        }
      })
    );

    /*
     * Only check each author once.
     */

    const authorIds = [
      ...new Set(
        posts
          .map((post) => Number(post.userId))
          .filter(
            (id) =>
              Number.isFinite(id) &&
              id > 0 &&
              id !== currentUserId
          )
      ),
    ];

    await Promise.all(
      authorIds.map(async (authorId) => {
        try {
          const following = await checkFollowing(
            currentUserId,
            authorId
          );

          nextFollowingUsers[authorId] =
            extractBoolean(following);
        } catch (err) {
          console.error(
            `Failed to check follow for user ${authorId}:`,
            err
          );

          nextFollowingUsers[authorId] = false;
        }
      })
    );

    setLikeCounts(nextLikeCounts);
    setLikedPosts(nextLikedPosts);
    setCommentCounts(nextCommentCounts);
    setFollowingUsers(nextFollowingUsers);
  };

  /*
   * ============================
   * LIKE
   * ============================
   */

  const handleLikeToggle = async (postId) => {
    if (!currentUserId) {
      return;
    }

    if (likeLoading[postId]) {
      return;
    }

    const currentlyLiked = Boolean(
      likedPosts[postId]
    );

    try {
      setLikeLoading((previous) => ({
        ...previous,
        [postId]: true,
      }));

      if (currentlyLiked) {
        await unlikePost(
          currentUserId,
          postId
        );

        setLikedPosts((previous) => ({
          ...previous,
          [postId]: false,
        }));

        setLikeCounts((previous) => ({
          ...previous,
          [postId]: Math.max(
            0,
            Number(previous[postId] || 0) - 1
          ),
        }));
      } else {
        await likePost(
          currentUserId,
          postId
        );

        setLikedPosts((previous) => ({
          ...previous,
          [postId]: true,
        }));

        setLikeCounts((previous) => ({
          ...previous,
          [postId]:
            Number(previous[postId] || 0) + 1,
        }));
      }
    } catch (err) {
      console.error("Like toggle failed:", err);

      /*
       * Re-sync this post from backend.
       */

      try {
        const [count, liked] =
          await Promise.all([
            getLikeCount(postId),
            checkLike(
              currentUserId,
              postId
            ),
          ]);

        setLikeCounts((previous) => ({
          ...previous,
          [postId]: extractNumber(count),
        }));

        setLikedPosts((previous) => ({
          ...previous,
          [postId]: extractBoolean(liked),
        }));
      } catch (syncError) {
        console.error(
          "Failed to resync like:",
          syncError
        );
      }
    } finally {
      setLikeLoading((previous) => ({
        ...previous,
        [postId]: false,
      }));
    }
  };

  /*
   * ============================
   * FOLLOW
   * ============================
   */

  const handleFollowToggle = async (authorId) => {
    if (!currentUserId || !authorId) {
      return;
    }

    if (currentUserId === Number(authorId)) {
      return;
    }

    if (followLoading[authorId]) {
      return;
    }

    const currentlyFollowing = Boolean(
      followingUsers[authorId]
    );

    try {
      setFollowLoading((previous) => ({
        ...previous,
        [authorId]: true,
      }));

      if (currentlyFollowing) {
        await unfollowUser(
          currentUserId,
          Number(authorId)
        );

        setFollowingUsers((previous) => ({
          ...previous,
          [authorId]: false,
        }));
      } else {
        await followUser(
          currentUserId,
          Number(authorId)
        );

        setFollowingUsers((previous) => ({
          ...previous,
          [authorId]: true,
        }));
      }
    } catch (err) {
      console.error(
        "Follow toggle failed:",
        err
      );

      /*
       * Re-sync with backend.
       */

      try {
        const actualFollowing =
          await checkFollowing(
            currentUserId,
            Number(authorId)
          );

        setFollowingUsers((previous) => ({
          ...previous,
          [authorId]:
            extractBoolean(actualFollowing),
        }));
      } catch (syncError) {
        console.error(
          "Failed to resync follow state:",
          syncError
        );
      }
    } finally {
      setFollowLoading((previous) => ({
        ...previous,
        [authorId]: false,
      }));
    }
  };

  /*
   * ============================
   * COMMENTS
   * ============================
   */

  const toggleComments = async (postId) => {
    const currentlyOpen = Boolean(
      openComments[postId]
    );

    setOpenComments((previous) => ({
      ...previous,
      [postId]: !currentlyOpen,
    }));

    if (currentlyOpen) {
      return;
    }

    try {
      setCommentLoading((previous) => ({
        ...previous,
        [postId]: true,
      }));

      const data =
        await getCommentsByPostId(postId);

      const normalizedComments =
        normalizeList(data);

      setComments((previous) => ({
        ...previous,
        [postId]: normalizedComments,
      }));

      try {
        const count =
          await getCommentCount(postId);

        setCommentCounts((previous) => ({
          ...previous,
          [postId]: extractNumber(count),
        }));
      } catch (countError) {
        console.error(
          "Failed to refresh comment count:",
          countError
        );
      }
    } catch (err) {
      console.error(
        `Failed to load comments for post ${postId}:`,
        err
      );

      setComments((previous) => ({
        ...previous,
        [postId]: [],
      }));
    } finally {
      setCommentLoading((previous) => ({
        ...previous,
        [postId]: false,
      }));
    }
  };

  /*
   * ============================
   * SUBMIT COMMENT
   * ============================
   */

  const handleCommentSubmit = async (postId) => {
    const text = (
      commentText[postId] || ""
    ).trim();

    if (!text || !currentUserId) {
      return;
    }

    if (commentSubmitting[postId]) {
      return;
    }

    try {
      setCommentSubmitting((previous) => ({
        ...previous,
        [postId]: true,
      }));

      const newComment =
        await createComment(
          currentUserId,
          Number(postId),
          text
        );

      setComments((previous) => ({
        ...previous,
        [postId]: [
          ...(previous[postId] || []),
          newComment,
        ],
      }));

      setCommentText((previous) => ({
        ...previous,
        [postId]: "",
      }));

      setCommentCounts((previous) => ({
        ...previous,
        [postId]:
          Number(previous[postId] || 0) + 1,
      }));
    } catch (err) {
      console.error(
        "Failed to create comment:",
        err
      );
    } finally {
      setCommentSubmitting((previous) => ({
        ...previous,
        [postId]: false,
      }));
    }
  };

  /*
   * ============================
   * DELETE COMMENT
   * ============================
   */

  const handleDeleteComment = async (
    postId,
    commentId
  ) => {
    try {
      await deleteComment(commentId);

      setComments((previous) => ({
        ...previous,
        [postId]: (
          previous[postId] || []
        ).filter(
          (comment) =>
            Number(comment.id) !==
            Number(commentId)
        ),
      }));

      setCommentCounts((previous) => ({
        ...previous,
        [postId]: Math.max(
          0,
          Number(previous[postId] || 0) - 1
        ),
      }));
    } catch (err) {
      console.error(
        "Failed to delete comment:",
        err
      );
    }
  };

  /*
   * ============================
   * SAVE
   * ============================
   */

  const loadSavedMemories = async () => {
    if (!currentUserId) {
      setSavedPosts({});
      return;
    }

    try {
      const savedPostIds = await getSavedMemories(
        currentUserId
      );

      const savedMap = {};

      if (Array.isArray(savedPostIds)) {
        savedPostIds.forEach((postId) => {
          savedMap[Number(postId)] = true;
        });
      }

      setSavedPosts(savedMap);
    } catch (error) {
      console.error(
        "Failed to load saved memories:",
        error
      );
      setSavedPosts({});
    }
  };

  useEffect(() => {
    loadSavedMemories();
  }, [currentUserId]);

  const handleSave = async (postId) => {
    if (!currentUserId) {
      return;
    }

    const numericPostId = Number(postId);
    const isCurrentlySaved = Boolean(
      savedPosts[numericPostId]
    );

    try {
      if (isCurrentlySaved) {
        await unsaveMemory(
          currentUserId,
          numericPostId
        );

        setSavedPosts((previous) => {
          const next = { ...previous };
          delete next[numericPostId];
          return next;
        });
      } else {
        await saveMemory(
          currentUserId,
          numericPostId
        );

        setSavedPosts((previous) => ({
          ...previous,
          [numericPostId]: true,
        }));
      }
    } catch (error) {
      console.error(
        "Failed to save/unsave memory:",
        error
      );

      console.error(
        "Save memory server response:",
        error?.response?.data
      );
    }
  };

  /*
   * ============================
   * MEDIA HELPERS
   * ============================
   */

  const getMediaItems = (post) => {
    if (
      Array.isArray(post?.mediaList) &&
      post.mediaList.length > 0
    ) {
      return post.mediaList;
    }

    /*
     * These fallbacks make the carousel
     * tolerant of different response shapes.
     */

    if (
      Array.isArray(post?.media) &&
      post.media.length > 0
    ) {
      return post.media;
    }

    if (
      Array.isArray(post?.mediaUrls) &&
      post.mediaUrls.length > 0
    ) {
      return post.mediaUrls.map((url) => ({
        mediaUrl: url,
        mediaType: "IMAGE",
      }));
    }

    if (post?.mediaUrl) {
      return [
        {
          mediaUrl: post.mediaUrl,
          mediaType: post.mediaType || "IMAGE",
        },
      ];
    }

    if (post?.imageUrl) {
      return [
        {
          mediaUrl: post.imageUrl,
          mediaType: "IMAGE",
        },
      ];
    }

    if (post?.videoUrl) {
      return [
        {
          mediaUrl: post.videoUrl,
          mediaType: "VIDEO",
        },
      ];
    }

    return [];
  };

  const getMediaUrl = (media) => {
    if (!media) {
      return "";
    }

    if (typeof media === "string") {
      return media;
    }

    return (
      media.mediaUrl ||
      media.url ||
      media.media_url ||
      media.imageUrl ||
      media.videoUrl ||
      ""
    );
  };

  const getMediaType = (media) => {
    if (!media) {
      return "IMAGE";
    }

    if (typeof media === "string") {
      const lowerUrl = media.toLowerCase();

      if (
        lowerUrl.includes(".mp4") ||
        lowerUrl.includes(".webm") ||
        lowerUrl.includes(".mov") ||
        lowerUrl.includes(".ogg")
      ) {
        return "VIDEO";
      }

      return "IMAGE";
    }

    const type =
      media.mediaType ||
      media.type ||
      media.media_type ||
      media.mimeType ||
      media.mime_type ||
      "";

    if (
      String(type)
        .toUpperCase()
        .includes("VIDEO")
    ) {
      return "VIDEO";
    }

    if (
      String(type)
        .toLowerCase()
        .startsWith("video/")
    ) {
      return "VIDEO";
    }

    return "IMAGE";
  };

  /*
   * ============================
   * MEDIA CAROUSEL CONTROLS
   * ============================
   */

  const goToPreviousMedia = (
    postId,
    mediaCount
  ) => {
    if (mediaCount <= 1) {
      return;
    }

    setMediaIndexes((previous) => {
      const currentIndex =
        Number(previous[postId] || 0);

      const nextIndex =
        currentIndex <= 0
          ? mediaCount - 1
          : currentIndex - 1;

      return {
        ...previous,
        [postId]: nextIndex,
      };
    });
  };

  const goToNextMedia = (
    postId,
    mediaCount
  ) => {
    if (mediaCount <= 1) {
      return;
    }

    setMediaIndexes((previous) => {
      const currentIndex =
        Number(previous[postId] || 0);

      const nextIndex =
        currentIndex >= mediaCount - 1
          ? 0
          : currentIndex + 1;

      return {
        ...previous,
        [postId]: nextIndex,
      };
    });
  };

  const goToMedia = (
    postId,
    mediaIndex
  ) => {
    setMediaIndexes((previous) => ({
      ...previous,
      [postId]: mediaIndex,
    }));
  };

  /*
   * ============================
   * TOUCH SWIPE
   * ============================
   */

  const [touchStartX, setTouchStartX] = useState({});

  const handleMediaTouchStart = (
    postId,
    event
  ) => {
    const touch =
      event.touches?.[0];

    if (!touch) {
      return;
    }

    setTouchStartX((previous) => ({
      ...previous,
      [postId]: touch.clientX,
    }));
  };

  const handleMediaTouchEnd = (
    postId,
    mediaCount,
    event
  ) => {
    const touch =
      event.changedTouches?.[0];

    if (!touch) {
      return;
    }

    const startX =
      Number(touchStartX[postId]);

    if (!Number.isFinite(startX)) {
      return;
    }

    const difference =
      startX - touch.clientX;

    const minimumSwipeDistance = 45;

    if (
      Math.abs(difference) <
      minimumSwipeDistance
    ) {
      return;
    }

    if (difference > 0) {
      goToNextMedia(
        postId,
        mediaCount
      );
    } else {
      goToPreviousMedia(
        postId,
        mediaCount
      );
    }

    setTouchStartX((previous) => {
      const next = {
        ...previous,
      };

      delete next[postId];

      return next;
    });
  };

  /*
   * ============================
   * HELPERS
   * ============================
   */

  const extractNumber = (value) => {
    if (typeof value === "number") {
      return value;
    }

    if (typeof value === "string") {
      const parsed = Number(value);

      return Number.isNaN(parsed)
        ? 0
        : parsed;
    }

    if (value && typeof value === "object") {
      if (typeof value.count === "number") {
        return value.count;
      }

      if (typeof value.likeCount === "number") {
        return value.likeCount;
      }

      if (
        typeof value.commentCount === "number"
      ) {
        return value.commentCount;
      }

      if (
        typeof value.followersCount === "number"
      ) {
        return value.followersCount;
      }
    }

    return 0;
  };

  const extractBoolean = (value) => {
    if (typeof value === "boolean") {
      return value;
    }

    if (typeof value === "string") {
      return value.toLowerCase() === "true";
    }

    if (value && typeof value === "object") {
      if (typeof value.following === "boolean") {
        return value.following;
      }

      if (typeof value.liked === "boolean") {
        return value.liked;
      }

      if (typeof value.isFollowing === "boolean") {
        return value.isFollowing;
      }

      if (typeof value.isLiked === "boolean") {
        return value.isLiked;
      }
    }

    return false;
  };

  const normalizeList = (value) => {
    if (Array.isArray(value)) {
      return value;
    }

    if (
      value &&
      Array.isArray(value.content)
    ) {
      return value.content;
    }

    if (
      value &&
      Array.isArray(value.comments)
    ) {
      return value.comments;
    }

    if (
      value &&
      Array.isArray(value.data)
    ) {
      return value.data;
    }

    return [];
  };

  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) {
      return "Good morning";
    }

    if (hour < 18) {
      return "Good afternoon";
    }

    return "Good evening";
  };

  const getDisplayName = () => {
    if (user?.username) {
      return user.username;
    }

    return "there";
  };

  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    const postDate = new Date(date);

    if (Number.isNaN(postDate.getTime())) {
      return "";
    }

    return postDate.toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  const getDescription = (description) => {
    if (!description) {
      return "A beautiful moment shared on MemoriesHub.";
    }

    if (description.length > 180) {
      return `${description.substring(
        0,
        180
      )}...`;
    }

    return description;
  };

  const getCommentUserName = (comment) => {
    return (
      comment?.username ||
      comment?.user?.username ||
      "MemoriesHub user"
    );
  };

  const getCommentUserId = (comment) => {
    return Number(
      comment?.userId ||
        comment?.user?.id ||
        0
    );
  };

  const getCommentText = (comment) => {
    return (
      comment?.content ||
      comment?.text ||
      ""
    );
  };

  return (
    <div className="home-page">

      {/* =========================================
          HERO
      ========================================= */}

      <section className="home-hero">

        <div className="hero-content">

          <div className="hero-small-label">
            <Sparkles size={16} />
            YOUR MEMORY SPACE
          </div>

          <h1>
            {getGreeting()}, {getDisplayName()}{" "}
            <span className="wave">
              👋
            </span>
          </h1>

          <p>
            Capture today. Relive forever.
            <br />
            Discover beautiful moments shared
            by the MemoriesHub community.
          </p>

          <div className="hero-actions">

            <Link
              to="/create"
              className="primary-create-btn"
            >
              <Plus size={19} />
              Create a memory
            </Link>

            <Link
              to="/explore"
              className="secondary-explore-btn"
            >
              Explore memories
              <ArrowRight size={18} />
            </Link>

          </div>

        </div>

        <div className="hero-decoration">

          <div className="hero-circle hero-circle-one"></div>

          <div className="hero-circle hero-circle-two"></div>

          <div className="hero-memory-card">

            <div className="hero-card-icon">
              <Heart
                size={24}
                fill="currentColor"
              />
            </div>

            <div>
              <strong>
                Make memories.
              </strong>

              <span>
                Keep them forever.
              </span>
            </div>

          </div>

        </div>

      </section>

      {/* =========================================
          QUICK STATS
      ========================================= */}

      <section className="home-stats">

        <div className="stat-card">

          <div className="stat-icon">
            <ImageIcon size={21} />
          </div>

          <div>
            <strong>
              {posts.length}
            </strong>

            <span>
              Community memories
            </span>
          </div>

        </div>

        <div className="stat-card">

          <div className="stat-icon">
            <Compass size={21} />
          </div>

          <div>
            <strong>
              Explore
            </strong>

            <span>
              Discover new places
            </span>
          </div>

        </div>

        <div className="stat-card">

          <div className="stat-icon">
            <Heart size={21} />
          </div>

          <div>
            <strong>
              Share
            </strong>

            <span>
              Create your own story
            </span>
          </div>

        </div>

      </section>

      {/* =========================================
          SECTION HEADER
      ========================================= */}

      <section className="home-section-header">

        <div>

          <div className="section-label">
            <Sparkles size={15} />
            COMMUNITY
          </div>

          <h2>
            Latest memories
          </h2>

          <p>
            See what people are remembering
            and sharing on MemoriesHub.
          </p>

        </div>

        <button
          type="button"
          className="refresh-btn"
          onClick={loadPosts}
          disabled={loading}
        >
          <RefreshCw
            size={17}
            className={
              loading
                ? "refresh-spinning"
                : ""
            }
          />

          Refresh
        </button>

      </section>

      {/* =========================================
          LOADING
      ========================================= */}

      {loading && (
        <section className="posts-grid">

          {[1, 2, 3].map((item) => (

            <div
              className="memory-card skeleton-card"
              key={item}
            >

              <div className="skeleton skeleton-image"></div>

              <div className="memory-card-body">

                <div className="skeleton skeleton-line"></div>

                <div className="skeleton skeleton-line short"></div>

                <div className="skeleton skeleton-line"></div>

              </div>

            </div>

          ))}

        </section>
      )}

      {/* =========================================
          ERROR
      ========================================= */}

      {!loading && error && (

        <section className="home-message error-message">

          <div className="message-icon">
            !
          </div>

          <h3>
            Couldn't load memories
          </h3>

          <p>
            {error}
          </p>

          <button
            type="button"
            className="primary-create-btn"
            onClick={loadPosts}
          >
            <RefreshCw size={17} />
            Try again
          </button>

        </section>

      )}

      {/* =========================================
          EMPTY
      ========================================= */}

      {!loading &&
        !error &&
        posts.length === 0 && (

          <section className="home-message">

            <div className="message-icon">
              <ImageIcon size={25} />
            </div>

            <h3>
              No memories yet
            </h3>

            <p>
              Be the first person to share
              a beautiful memory with the
              MemoriesHub community.
            </p>

            <Link
              to="/create"
              className="primary-create-btn"
            >
              <Plus size={18} />
              Create your first memory
            </Link>

          </section>

        )}

      {/* =========================================
          POSTS
      ========================================= */}

      {!loading &&
        !error &&
        posts.length > 0 && (

          <section className="posts-grid">

            {posts.map((post) => {

              const mediaItems =
                getMediaItems(post);

              const postId =
                Number(post.id);

              const authorId =
                Number(post.userId);

              const isOwnPost =
                currentUserId === authorId;

              const liked =
                Boolean(
                  likedPosts[postId]
                );

              const saved =
                Boolean(
                  savedPosts[postId]
                );

              const following =
                Boolean(
                  followingUsers[authorId]
                );

              const postComments =
                comments[postId] || [];

              const currentMediaIndex =
                Math.min(
                  Number(
                    mediaIndexes[postId] || 0
                  ),
                  Math.max(
                    0,
                    mediaItems.length - 1
                  )
                );

              const currentMedia =
                mediaItems[
                  currentMediaIndex
                ];

              const mediaCount =
                mediaItems.length;

              return (

                <article
                  className="memory-card"
                  key={post.id}
                >

                  {/* =================================
                      MEDIA CAROUSEL
                  ================================= */}

                  <div
                    className="memory-media"
                    onTouchStart={(event) =>
                      handleMediaTouchStart(
                        postId,
                        event
                      )
                    }
                    onTouchEnd={(event) =>
                      handleMediaTouchEnd(
                        postId,
                        mediaCount,
                        event
                      )
                    }
                  >

                    {currentMedia ? (

                      getMediaType(
                        currentMedia
                      ) === "VIDEO" ? (

                        <video
                          key={`${postId}-${currentMediaIndex}`}
                          src={getMediaUrl(
                            currentMedia
                          )}
                          className="memory-media-content"
                          muted
                          controls
                          playsInline
                          preload="metadata"
                        />

                      ) : (

                        <img
                          key={`${postId}-${currentMediaIndex}`}
                          src={getMediaUrl(
                            currentMedia
                          )}
                          alt={
                            post.description ||
                            "Memory"
                          }
                          className="memory-media-content"
                        />

                      )

                    ) : (

                      <div className="no-media">

                        <ImageIcon
                          size={38}
                        />

                        <span>
                          No image
                        </span>

                      </div>

                    )}

                    {/* CATEGORY */}

                    <div className="category-badge">
                      {post.category ||
                        "MEMORY"}
                    </div>

                    {/* VIDEO BADGE */}

                    {currentMedia &&
                      getMediaType(
                        currentMedia
                      ) === "VIDEO" && (

                        <div className="video-badge">

                          <Play
                            size={13}
                            fill="currentColor"
                          />

                          Video

                        </div>

                      )}

                    {/* =================================
                        LEFT ARROW
                    ================================= */}

                    {mediaCount > 1 && (

                      <button
                        type="button"
                        className="media-nav media-nav-left"
                        onClick={(event) => {
                          event.stopPropagation();

                          goToPreviousMedia(
                            postId,
                            mediaCount
                          );
                        }}
                        aria-label="Previous media"
                        title="Previous"
                      >
                        <ChevronLeft
                          size={21}
                        />
                      </button>

                    )}

                    {/* =================================
                        RIGHT ARROW
                    ================================= */}

                    {mediaCount > 1 && (

                      <button
                        type="button"
                        className="media-nav media-nav-right"
                        onClick={(event) => {
                          event.stopPropagation();

                          goToNextMedia(
                            postId,
                            mediaCount
                          );
                        }}
                        aria-label="Next media"
                        title="Next"
                      >
                        <ChevronRight
                          size={21}
                        />
                      </button>

                    )}

                    {/* =================================
                        MEDIA COUNTER
                    ================================= */}

                    {mediaCount > 1 && (

                      <div className="media-counter">
                        {currentMediaIndex + 1} /{" "}
                        {mediaCount}
                      </div>

                    )}

                    {/* =================================
                        MEDIA DOTS
                    ================================= */}

                    {mediaCount > 1 && (

                      <div className="media-dots">

                        {mediaItems.map(
                          (_, index) => (

                            <button
                              type="button"
                              key={index}
                              className={
                                index ===
                                currentMediaIndex
                                  ? "media-dot active"
                                  : "media-dot"
                              }
                              onClick={(event) => {
                                event.stopPropagation();

                                goToMedia(
                                  postId,
                                  index
                                );
                              }}
                              aria-label={`Show media ${index + 1}`}
                            />

                          )
                        )}

                      </div>

                    )}

                  </div>

                  {/* =================================
                      BODY
                  ================================= */}

                  <div className="memory-card-body">

                    {/* LOCATION */}

                    <div className="memory-location">

                      <MapPin size={14} />

                      <span>
                        {post.location ||
                          "Location not specified"}
                      </span>

                    </div>

                    {/* DESCRIPTION */}

                    <h3>
                      {getDescription(
                        post.description
                      )}
                    </h3>

                    {/* AUTHOR */}

                    <div className="memory-author">

                      <Link
                        to={`/profile/${authorId}`}
                        className="author-avatar-link"
                      >
                        <div className="author-avatar">
                          {(
                            post.username ||
                            "U"
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                      </Link>

                      <div className="author-details">

                        <Link
                          to={`/profile/${authorId}`}
                          className="author-name-link"
                        >
                          <strong>
                            {post.username ||
                              "MemoriesHub user"}
                          </strong>
                        </Link>

                        <span>
                          {formatDate(
                            post.createdAt
                          )}
                        </span>

                      </div>

                      {!isOwnPost && (
                        <button
                          type="button"
                          className={
                            following
                              ? "post-follow-btn following"
                              : "post-follow-btn"
                          }
                          onClick={() =>
                            handleFollowToggle(
                              authorId
                            )
                          }
                          disabled={
                            Boolean(
                              followLoading[
                                authorId
                              ]
                            )
                          }
                        >
                          {following ? (
                            <>
                              <UserCheck
                                size={14}
                              />

                              Following
                            </>
                          ) : (
                            <>
                              <UserPlus
                                size={14}
                              />

                              Follow
                            </>
                          )}
                        </button>
                      )}

                    </div>

                    {/* =================================
                        INSTAGRAM-STYLE ACTION ROW
                    ================================= */}

                    <div className="post-actions">

                      <div className="post-actions-left">

                        {/* LIKE */}

                        <button
                          type="button"
                          className={
                            liked
                              ? "post-action like-action active"
                              : "post-action like-action"
                          }
                          onClick={() =>
                            handleLikeToggle(
                              postId
                            )
                          }
                          disabled={
                            Boolean(
                              likeLoading[
                                postId
                              ]
                            )
                          }
                          title={
                            liked
                              ? "Unlike"
                              : "Like"
                          }
                        >
                          <Heart
                            size={22}
                            fill={
                              liked
                                ? "currentColor"
                                : "none"
                            }
                          />

                          <span>
                            {likeCounts[
                              postId
                            ] || 0}
                          </span>
                        </button>

                        {/* COMMENT */}

                        <button
                          type="button"
                          className="post-action"
                          onClick={() =>
                            toggleComments(
                              postId
                            )
                          }
                          title="Comments"
                        >
                          <MessageCircle
                            size={22}
                          />

                          <span>
                            {commentCounts[
                              postId
                            ] || 0}
                          </span>
                        </button>

                      </div>

                      {/* SAVE */}

                      <button
                        type="button"
                        className={
                          saved
                            ? "post-action save-action active"
                            : "post-action save-action"
                        }
                        onClick={() =>
                          handleSave(postId)
                        }
                        title={
                          saved
                            ? "Remove from saved"
                            : "Save"
                        }
                      >
                        <Bookmark
                          size={22}
                          fill={
                            saved
                              ? "currentColor"
                              : "none"
                          }
                        />
                      </button>

                    </div>

                    {/* LIKE COUNT */}

                    <div className="like-summary">

                      {likeCounts[
                        postId
                      ] || 0}{" "}
                      {Number(
                        likeCounts[
                          postId
                        ] || 0
                      ) === 1
                        ? "like"
                        : "likes"}

                    </div>

                    {/* =================================
                        COMMENTS
                    ================================= */}

                    {openComments[
                      postId
                    ] && (

                      <div className="comments-section">

                        <div className="comments-header">

                          <strong>
                            Comments
                          </strong>

                          <button
                            type="button"
                            className="close-comments-btn"
                            onClick={() =>
                              setOpenComments(
                                (previous) => ({
                                  ...previous,
                                  [postId]:
                                    false,
                                })
                              )
                            }
                          >
                            <X size={16} />
                          </button>

                        </div>

                        {commentLoading[
                          postId
                        ] ? (

                          <div className="comments-loading">
                            Loading comments...
                          </div>

                        ) : postComments.length ===
                          0 ? (

                          <div className="comments-empty">
                            No comments yet.
                            Be the first to comment.
                          </div>

                        ) : (

                          <div className="comments-list">

                            {postComments.map(
                              (comment) => {

                                const commentUserId =
                                  getCommentUserId(
                                    comment
                                  );

                                const canDelete =
                                  currentUserId ===
                                    commentUserId ||
                                  currentUserId ===
                                    authorId;

                                return (

                                  <div
                                    className="comment-row"
                                    key={
                                      comment.id
                                    }
                                  >

                                    <div className="comment-avatar">
                                      {getCommentUserName(
                                        comment
                                      )
                                        .charAt(0)
                                        .toUpperCase()}
                                    </div>

                                    <div className="comment-content">

                                      <div className="comment-top">

                                        <strong>
                                          {
                                            getCommentUserName(
                                              comment
                                            )
                                          }
                                        </strong>

                                        {canDelete && (
                                          <button
                                            type="button"
                                            className="delete-comment-btn"
                                            onClick={() =>
                                              handleDeleteComment(
                                                postId,
                                                comment.id
                                              )
                                            }
                                            title="Delete comment"
                                          >
                                            <Trash2
                                              size={14}
                                            />
                                          </button>
                                        )}

                                      </div>

                                      <p>
                                        {getCommentText(
                                          comment
                                        )}
                                      </p>

                                      {comment.createdAt && (
                                        <span className="comment-date">
                                          {formatDate(
                                            comment.createdAt
                                          )}
                                        </span>
                                      )}

                                    </div>

                                  </div>

                                );
                              }
                            )}

                          </div>

                        )}

                        {/* COMMENT INPUT */}

                        <div className="comment-input-row">

                          <div className="comment-input-avatar">
                            {(
                              user?.username ||
                              "U"
                            )
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <input
                            type="text"
                            value={
                              commentText[
                                postId
                              ] || ""
                            }
                            onChange={(event) =>
                              setCommentText(
                                (previous) => ({
                                  ...previous,
                                  [postId]:
                                    event.target
                                      .value,
                                })
                              )
                            }
                            onKeyDown={(event) => {
                              if (
                                event.key ===
                                "Enter"
                              ) {
                                handleCommentSubmit(
                                  postId
                                );
                              }
                            }}
                            placeholder="Add a comment..."
                          />

                          <button
                            type="button"
                            onClick={() =>
                              handleCommentSubmit(
                                postId
                              )
                            }
                            disabled={
                              !(
                                commentText[
                                  postId
                                ] || ""
                              ).trim() ||
                              Boolean(
                                commentSubmitting[
                                  postId
                                ]
                              )
                            }
                            title="Post comment"
                          >
                            <Send size={17} />
                          </button>

                        </div>

                      </div>

                    )}

                  </div>

                </article>

              );
            })}

          </section>

        )}

      {/* =========================================
          CREATE BANNER
      ========================================= */}

      <section className="home-create-banner">

        <div className="create-banner-icon">
          <Plus size={25} />
        </div>

        <div className="create-banner-content">

          <span>
            Create something memorable
          </span>

          <h2>
            Save your moments forever.
          </h2>

          <p>
            Share your travel, events,
            weddings and special moments
            with the MemoriesHub community.
          </p>

        </div>

        <Link
          to="/create"
          className="banner-create-btn"
        >
          Create memory
          <ArrowRight size={18} />
        </Link>

      </section>

    </div>
  );
};

export default Home;