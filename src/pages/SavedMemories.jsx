import React, { useEffect, useState } from "react";
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  Play,
  RefreshCw,
  X,
} from "lucide-react";

import { useAuth } from "../contexts/AuthContext";
import { getAllPosts } from "../services/postService";
import {
  getSavedMemories,
  unsaveMemory,
} from "../services/savedMemoryService";

import "./SavedMemories.css";

const SavedMemories = () => {
  const { user } = useAuth();

  const currentUserId = Number(user?.id);

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
   * Stores the currently displayed media index
   * for each saved post.
   *
   * Example:
   * {
   *   15: 0,
   *   22: 1
   * }
   */
  const [activeMediaIndexes, setActiveMediaIndexes] = useState({});

  useEffect(() => {
    loadSavedMemories();
  }, [currentUserId]);

  const loadSavedMemories = async () => {
    if (!currentUserId) {
      setPosts([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const savedPostIds = await getSavedMemories(currentUserId);

      if (
        !Array.isArray(savedPostIds) ||
        savedPostIds.length === 0
      ) {
        setPosts([]);
        setActiveMediaIndexes({});
        return;
      }

      const allPosts = await getAllPosts();

      const savedIdSet = new Set(
        savedPostIds.map((postId) => Number(postId))
      );

      const savedPosts = allPosts
        .filter((post) =>
          savedIdSet.has(Number(post?.id))
        )
        .sort((a, b) => {
          const dateA = new Date(
            a?.createdAt || 0
          ).getTime();

          const dateB = new Date(
            b?.createdAt || 0
          ).getTime();

          return dateB - dateA;
        });

      setPosts(savedPosts);

      /*
       * Every newly loaded saved memory starts
       * from its first media item.
       */
      const initialIndexes = {};

      savedPosts.forEach((post) => {
        initialIndexes[post.id] = 0;
      });

      setActiveMediaIndexes(initialIndexes);
    } catch (err) {
      console.error(
        "Failed to load saved memories:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Unable to load saved memories. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (postId) => {
    if (!currentUserId) {
      return;
    }

    try {
      await unsaveMemory(
        currentUserId,
        Number(postId)
      );

      setPosts((previousPosts) =>
        previousPosts.filter(
          (post) =>
            Number(post?.id) !== Number(postId)
        )
      );

      setActiveMediaIndexes((previousIndexes) => {
        const nextIndexes = {
          ...previousIndexes,
        };

        delete nextIndexes[postId];

        return nextIndexes;
      });
    } catch (err) {
      console.error(
        "Failed to remove saved memory:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Unable to remove this saved memory. Please try again."
      );
    }
  };

  /*
   * Supports the different media structures
   * used by the backend.
   */
  const getMediaItems = (post) => {
    if (
      Array.isArray(post?.mediaList) &&
      post.mediaList.length > 0
    ) {
      return post.mediaList;
    }

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
          mediaType:
            post.mediaType || "IMAGE",
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
      const lowerUrl =
        media.toLowerCase();

      return /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/.test(
        lowerUrl
      )
        ? "VIDEO"
        : "IMAGE";
    }

    const type = String(
      media.mediaType ||
        media.type ||
        media.mimeType ||
        media.mime_type ||
        ""
    ).toUpperCase();

    if (
      type.includes("VIDEO") ||
      type.startsWith("VIDEO/")
    ) {
      return "VIDEO";
    }

    const url =
      getMediaUrl(media).toLowerCase();

    if (
      /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/.test(url)
    ) {
      return "VIDEO";
    }

    return "IMAGE";
  };

  const getAuthorName = (post) => {
    return (
      post?.username ||
      post?.user?.username ||
      post?.authorUsername ||
      "MemoriesHub user"
    );
  };

  const getDescription = (post) => {
    return (
      post?.description ||
      post?.caption ||
      post?.content ||
      "A saved memory"
    );
  };

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleDateString(
      undefined,
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  const getActiveMediaIndex = (
    postId,
    mediaLength
  ) => {
    if (!mediaLength) {
      return 0;
    }

    const currentIndex =
      activeMediaIndexes[postId] ?? 0;

    return Math.min(
      Math.max(currentIndex, 0),
      mediaLength - 1
    );
  };

  const showPreviousMedia = (
    postId,
    mediaLength
  ) => {
    if (mediaLength <= 1) {
      return;
    }

    setActiveMediaIndexes(
      (previousIndexes) => {
        const currentIndex =
          getActiveMediaIndex(
            postId,
            mediaLength
          );

        return {
          ...previousIndexes,
          [postId]:
            currentIndex === 0
              ? mediaLength - 1
              : currentIndex - 1,
        };
      }
    );
  };

  const showNextMedia = (
    postId,
    mediaLength
  ) => {
    if (mediaLength <= 1) {
      return;
    }

    setActiveMediaIndexes(
      (previousIndexes) => {
        const currentIndex =
          getActiveMediaIndex(
            postId,
            mediaLength
          );

        return {
          ...previousIndexes,
          [postId]:
            currentIndex === mediaLength - 1
              ? 0
              : currentIndex + 1,
        };
      }
    );
  };

  return (
    <div className="saved-memories-page">
      <div className="saved-memories-container">

        {/* =========================================
            HEADER
        ========================================= */}

        <section className="saved-memories-header">
          <div>
            <div className="saved-memories-label">
              <Bookmark size={16} />
              YOUR COLLECTION
            </div>

            <h1>Saved Memories</h1>

            <p>
              Keep the memories you want to come back to.
            </p>
          </div>

          <button
            type="button"
            className="saved-refresh-btn"
            onClick={loadSavedMemories}
            disabled={loading}
            title="Refresh saved memories"
          >
            <RefreshCw
              size={17}
              className={
                loading
                  ? "saved-refresh-spinning"
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
          <section className="saved-memories-grid">
            {[1, 2, 3].map((item) => (
              <div
                className="saved-memory-card saved-skeleton-card"
                key={item}
              >
                <div className="saved-skeleton saved-skeleton-media" />

                <div className="saved-skeleton-body">
                  <div className="saved-skeleton saved-skeleton-line" />

                  <div className="saved-skeleton saved-skeleton-line short" />

                  <div className="saved-skeleton saved-skeleton-line" />
                </div>
              </div>
            ))}
          </section>
        )}

        {/* =========================================
            ERROR
        ========================================= */}

        {!loading && error && (
          <section className="saved-memories-message saved-error-message">
            <div className="saved-message-icon">
              <X size={25} />
            </div>

            <h3>
              Couldn't load saved memories
            </h3>

            <p>{error}</p>

            <button
              type="button"
              className="saved-primary-btn"
              onClick={loadSavedMemories}
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
            <section className="saved-memories-message">
              <div className="saved-message-icon">
                <Bookmark size={26} />
              </div>

              <h3>
                No saved memories yet
              </h3>

              <p>
                When you save a memory from Home,
                it will appear here.
              </p>
            </section>
          )}

        {/* =========================================
            SAVED MEMORY GRID
        ========================================= */}

        {!loading &&
          !error &&
          posts.length > 0 && (
            <section className="saved-memories-grid">
              {posts.map((post) => {
                const mediaItems =
                  getMediaItems(post);

                const activeMediaIndex =
                  getActiveMediaIndex(
                    post.id,
                    mediaItems.length
                  );

                const media =
                  mediaItems[activeMediaIndex];

                const mediaUrl =
                  getMediaUrl(media);

                const mediaType =
                  getMediaType(media);

                const hasMultipleMedia =
                  mediaItems.length > 1;

                return (
                  <article
                    className="saved-memory-card"
                    key={post.id}
                  >
                    {/* =========================================
                        MEDIA
                    ========================================= */}

                    <div className="saved-memory-media">

                      {mediaUrl ? (
                        mediaType === "VIDEO" ? (
                          <>
                            <video
                              src={mediaUrl}
                              className="saved-memory-media-content"
                              muted
                              controls
                              playsInline
                              preload="metadata"
                            />

                            <div className="saved-video-badge">
                              <Play
                                size={13}
                                fill="currentColor"
                              />
                            </div>
                          </>
                        ) : (
                          <img
                            src={mediaUrl}
                            alt={getDescription(post)}
                            className="saved-memory-media-content"
                          />
                        )
                      ) : (
                        <div className="saved-no-media">
                          <ImageIcon size={38} />
                          <span>
                            No image
                          </span>
                        </div>
                      )}

                      {/* =========================================
                          CAROUSEL CONTROLS
                      ========================================= */}

                      {hasMultipleMedia && (
                        <>
                          <button
                            type="button"
                            className="saved-carousel-btn saved-carousel-btn-left"
                            onClick={() =>
                              showPreviousMedia(
                                post.id,
                                mediaItems.length
                              )
                            }
                            aria-label="Previous media"
                            title="Previous media"
                          >
                            <ChevronLeft
                              size={20}
                            />
                          </button>

                          <button
                            type="button"
                            className="saved-carousel-btn saved-carousel-btn-right"
                            onClick={() =>
                              showNextMedia(
                                post.id,
                                mediaItems.length
                              )
                            }
                            aria-label="Next media"
                            title="Next media"
                          >
                            <ChevronRight
                              size={20}
                            />
                          </button>

                          <span className="saved-carousel-position">
                            {activeMediaIndex + 1} /{" "}
                            {mediaItems.length}
                          </span>

                          <span className="saved-media-count">
                            {mediaItems.length} media
                          </span>
                        </>
                      )}

                      {!hasMultipleMedia &&
                        mediaItems.length === 1 && (
                          <span className="saved-media-count">
                            1 media
                          </span>
                        )}
                    </div>

                    {/* =========================================
                        CARD BODY
                    ========================================= */}

                    <div className="saved-memory-body">
                      <div className="saved-memory-top">
                        <div>
                          <span className="saved-memory-author">
                            {getAuthorName(post)}
                          </span>

                          <span className="saved-memory-date">
                            {formatDate(
                              post?.createdAt
                            )}
                          </span>
                        </div>

                        <button
                          type="button"
                          className="saved-remove-btn"
                          onClick={() =>
                            handleUnsave(
                              post.id
                            )
                          }
                          title="Remove from saved"
                        >
                          <Bookmark
                            size={20}
                            fill="currentColor"
                          />
                        </button>
                      </div>

                      <p className="saved-memory-description">
                        {getDescription(post)}
                      </p>

                      {post?.location && (
                        <span className="saved-memory-location">
                          {post.location}
                        </span>
                      )}
                    </div>
                  </article>
                );
              })}
            </section>
          )}
      </div>
    </div>
  );
};

export default SavedMemories;