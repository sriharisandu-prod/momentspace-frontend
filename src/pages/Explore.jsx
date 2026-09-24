import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  TrendingUp,
  Compass,
  Heart,
  MessageCircle,
  MapPin,
  ImageIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import "./Explore.css";
import { getAllPosts } from "../services/postService";

const Explore = () => {
  const [posts, setPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
   * Stores the currently visible media for each post.
   *
   * Example:
   * {
   *   10: 0,
   *   15: 1
   * }
   */
  const [activeMediaIndexes, setActiveMediaIndexes] =
    useState({});

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAllPosts();

      if (Array.isArray(data)) {
        const sortedPosts = [...data].sort((a, b) => {
          const dateA = new Date(
            a?.createdAt || 0
          ).getTime();

          const dateB = new Date(
            b?.createdAt || 0
          ).getTime();

          return dateB - dateA;
        });

        setPosts(sortedPosts);
      } else {
        setPosts([]);
      }
    } catch (err) {
      console.error(
        "Failed to load Explore memories:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Unable to load memories. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * =========================================
   * MEDIA HELPERS
   * =========================================
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
      const url = media.toLowerCase();

      return /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/.test(
        url
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

  /*
   * =========================================
   * POST INFORMATION
   * =========================================
   */

  const getUsername = (post) => {
    return (
      post?.username ||
      post?.user?.username ||
      post?.authorUsername ||
      "MemoriesHub user"
    );
  };

  const getTitle = (post) => {
    return (
      post?.title ||
      post?.description ||
      post?.caption ||
      post?.content ||
      "Untitled memory"
    );
  };

  const getDescription = (post) => {
    return (
      post?.description ||
      post?.caption ||
      post?.content ||
      ""
    );
  };

  const getLocationName = (post) => {
    /*
     * This intentionally supports several possible
     * backend response shapes.
     *
     * We can standardize this once your Post DTO
     * is finalized.
     */

    if (typeof post?.location === "string") {
      return post.location;
    }

    return (
      post?.location?.name ||
      post?.location?.locationName ||
      post?.locationName ||
      post?.city ||
      ""
    );
  };

  const getCityName = (post) => {
    if (post?.city) {
      return post.city;
    }

    if (
      post?.location &&
      typeof post.location === "object"
    ) {
      return (
        post.location.city ||
        ""
      );
    }

    return "";
  };

  const getLikeCount = (post) => {
    return (
      post?.likeCount ??
      post?.likesCount ??
      post?.likes ??
      0
    );
  };

  const getCommentCount = (post) => {
    return (
      post?.commentCount ??
      post?.commentsCount ??
      post?.comments?.length ??
      0
    );
  };

  /*
   * =========================================
   * SEARCH
   * =========================================
   */

  const normalizedSearch =
    searchQuery.trim().toLowerCase();

  const filteredPosts = useMemo(() => {
    if (!normalizedSearch) {
      return posts;
    }

    return posts.filter((post) => {
      const username =
        getUsername(post).toLowerCase();

      const title =
        getTitle(post).toLowerCase();

      const description =
        getDescription(post).toLowerCase();

      const location =
        getLocationName(post).toLowerCase();

      const city =
        getCityName(post).toLowerCase();

      return (
        username.includes(normalizedSearch) ||
        title.includes(normalizedSearch) ||
        description.includes(normalizedSearch) ||
        location.includes(normalizedSearch) ||
        city.includes(normalizedSearch)
      );
    });
  }, [posts, normalizedSearch]);

  /*
   * =========================================
   * DYNAMIC CITIES
   * =========================================
   *
   * This does NOT use Google Places.
   *
   * Cities are extracted from the memories
   * returned by our own backend.
   */

  const cities = useMemo(() => {
    const cityMap = new Map();

    posts.forEach((post) => {
      const city = getCityName(post);

      if (!city) {
        return;
      }

      const normalizedCity =
        city.trim();

      if (!normalizedCity) {
        return;
      }

      const existing =
        cityMap.get(normalizedCity);

      if (existing) {
        existing.memoryCount += 1;
      } else {
        cityMap.set(normalizedCity, {
          name: normalizedCity,
          memoryCount: 1,
        });
      }
    });

    return Array.from(
      cityMap.values()
    ).sort(
      (a, b) =>
        b.memoryCount -
        a.memoryCount
    );
  }, [posts]);

  /*
   * =========================================
   * MEDIA NAVIGATION
   * =========================================
   */

  const getActiveMediaIndex = (
    postId,
    mediaLength
  ) => {
    if (!mediaLength) {
      return 0;
    }

    const index =
      activeMediaIndexes[postId] ?? 0;

    return Math.min(
      Math.max(index, 0),
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

  /*
   * =========================================
   * RENDER
   * =========================================
   */

  return (
    <div className="page-container">

      {/* =========================================
          HERO
      ========================================= */}

      <div className="explore-hero card">

        <div className="explore-hero-icon">
          <Compass size={30} />
        </div>

        <div>
          <div className="eyebrow">
            <TrendingUp size={15} />
            DISCOVER
          </div>

          <h1>Explore memories</h1>

          <p>
            Discover beautiful stories and moments
            shared by the MemoriesHub community.
          </p>
        </div>

        <div className="explore-search">
          <Search size={19} />

          <input
            type="text"
            placeholder="Search memories..."
            value={searchQuery}
            onChange={(event) =>
              setSearchQuery(
                event.target.value
              )
            }
          />
        </div>
      </div>

      {/* =========================================
          EXPLORE BY PLACE
      ========================================= */}

      {!loading &&
        !error &&
        cities.length > 0 && (
          <section className="explore-places-section">

            <div className="explore-section-title">
              <div>
                <h2>
                  Explore by place
                </h2>

                <p>
                  Discover memories from places
                  shared by the community.
                </p>
              </div>
            </div>

            <div className="explore-city-list">
              {cities.map((city) => (
                <button
                  type="button"
                  className="explore-city-card"
                  key={city.name}
                  onClick={() =>
                    setSearchQuery(
                      city.name
                    )
                  }
                >
                  <span className="explore-city-icon">
                    <MapPin size={18} />
                  </span>

                  <span className="explore-city-content">
                    <strong>
                      {city.name}
                    </strong>

                    <small>
                      {city.memoryCount}{" "}
                      {city.memoryCount === 1
                        ? "memory"
                        : "memories"}
                    </small>
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

      {/* =========================================
          TRENDING MEMORIES
      ========================================= */}

      <div className="explore-section-title">
        <div>
          <h2>
            {normalizedSearch
              ? "Search results"
              : "Trending memories"}
          </h2>

          <p>
            {normalizedSearch
              ? `Memories matching "${searchQuery}"`
              : "Moments people are loving right now"}
          </p>
        </div>
      </div>

      {/* =========================================
          LOADING
      ========================================= */}

      {loading && (
        <div className="explore-grid">
          {[1, 2, 3].map((item) => (
            <article
              className="explore-post card"
              key={item}
            >
              <div className="explore-loading-media" />

              <div className="explore-post-body">
                <div className="explore-loading-line" />
                <div className="explore-loading-line short" />
                <div className="explore-loading-line" />
              </div>
            </article>
          ))}
        </div>
      )}

      {/* =========================================
          ERROR
      ========================================= */}

      {!loading && error && (
        <div className="explore-message card">
          <div className="explore-message-icon">
            <Compass size={26} />
          </div>

          <h3>
            Unable to load memories
          </h3>

          <p>{error}</p>

          <button
            type="button"
            onClick={loadPosts}
          >
            Try again
          </button>
        </div>
      )}

      {/* =========================================
          EMPTY SEARCH
      ========================================= */}

      {!loading &&
        !error &&
        filteredPosts.length === 0 && (
          <div className="explore-message card">
            <div className="explore-message-icon">
              <Search size={26} />
            </div>

            <h3>
              No memories found
            </h3>

            <p>
              Try searching for another memory,
              person, city, or place.
            </p>
          </div>
        )}

      {/* =========================================
          POSTS
      ========================================= */}

      {!loading &&
        !error &&
        filteredPosts.length > 0 && (
          <div className="explore-grid">

            {filteredPosts.map((post) => {
              const mediaItems =
                getMediaItems(post);

              const activeMediaIndex =
                getActiveMediaIndex(
                  post.id,
                  mediaItems.length
                );

              const activeMedia =
                mediaItems[
                  activeMediaIndex
                ];

              const mediaUrl =
                getMediaUrl(
                  activeMedia
                );

              const mediaType =
                getMediaType(
                  activeMedia
                );

              const hasMultipleMedia =
                mediaItems.length > 1;

              return (
                <article
                  className="explore-post card"
                  key={post.id}
                >

                  {/* MEDIA */}

                  <div className="explore-post-media">

                    {mediaUrl ? (
                      mediaType ===
                      "VIDEO" ? (
                        <video
                          src={mediaUrl}
                          className="explore-post-media-content"
                          muted
                          controls
                          playsInline
                          preload="metadata"
                        />
                      ) : (
                        <img
                          src={mediaUrl}
                          alt={getTitle(post)}
                          className="explore-post-media-content"
                        />
                      )
                    ) : (
                      <div className="explore-no-media">
                        <ImageIcon
                          size={36}
                        />

                        <span>
                          No media
                        </span>
                      </div>
                    )}

                    {/* CAROUSEL */}

                    {hasMultipleMedia && (
                      <>
                        <button
                          type="button"
                          className="explore-carousel-btn explore-carousel-btn-left"
                          onClick={() =>
                            showPreviousMedia(
                              post.id,
                              mediaItems.length
                            )
                          }
                          aria-label="Previous media"
                        >
                          <ChevronLeft
                            size={19}
                          />
                        </button>

                        <button
                          type="button"
                          className="explore-carousel-btn explore-carousel-btn-right"
                          onClick={() =>
                            showNextMedia(
                              post.id,
                              mediaItems.length
                            )
                          }
                          aria-label="Next media"
                        >
                          <ChevronRight
                            size={19}
                          />
                        </button>

                        <span className="explore-media-position">
                          {activeMediaIndex + 1}{" "}
                          /{" "}
                          {mediaItems.length}
                        </span>
                      </>
                    )}
                  </div>

                  {/* BODY */}

                  <div className="explore-post-body">

                    <span className="explore-post-author">
                      By {getUsername(post)}
                    </span>

                    <h3>
                      {getTitle(post)}
                    </h3>

                    {getLocationName(post) && (
                      <div className="explore-post-location">
                        <MapPin size={14} />

                        <span>
                          {getLocationName(
                            post
                          )}
                        </span>
                      </div>
                    )}

                    <div className="explore-post-actions">

                      <button
                        type="button"
                      >
                        <Heart size={17} />

                        {getLikeCount(
                          post
                        )}
                      </button>

                      <button
                        type="button"
                      >
                        <MessageCircle
                          size={17}
                        />

                        {getCommentCount(
                          post
                        )}
                      </button>

                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
    </div>
  );
};

export default Explore;