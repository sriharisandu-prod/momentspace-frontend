import React, { useState } from "react";

import {
  MoreHorizontal,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MapPin,
  Send,
  Play,
} from "lucide-react";

import { useAuth } from "../contexts/AuthContext";

import {
  likePost,
  unlikePost,
} from "../services/likeService";

import CommentSection from "./CommentSection";

const PostCard = ({ post }) => {
  const { user } = useAuth();

  const [liked, setLiked] = useState(
    Boolean(post?.liked)
  );

  const [likes, setLikes] = useState(
    Number(post?.likes) || 0
  );

  const [saved, setSaved] = useState(
    Boolean(post?.saved)
  );

  const [comments, setComments] = useState(
    Number(post?.comments) || 0
  );

  const [showComments, setShowComments] =
    useState(false);

  /*
   * =====================================================
   * LIKE
   * =====================================================
   */

  const handleLike = async () => {
    if (!user?.id) {
      console.error(
        "User ID is missing"
      );
      return;
    }

    const previousLiked = liked;

    setLiked(!previousLiked);

    setLikes((previous) =>
      previousLiked
        ? Math.max(0, previous - 1)
        : previous + 1
    );

    try {
      if (previousLiked) {
        await unlikePost(
          user.id,
          post.id
        );
      } else {
        await likePost(
          user.id,
          post.id
        );
      }
    } catch (error) {
      console.error(
        "Like failed:",
        error
      );

      setLiked(previousLiked);

      setLikes((previous) =>
        previousLiked
          ? previous + 1
          : Math.max(0, previous - 1)
      );
    }
  };

  /*
   * =====================================================
   * COMMENT ADDED
   * =====================================================
   */

  const handleCommentAdded = (
    newComment
  ) => {
    console.log(
      "New comment received:",
      newComment
    );

    setComments(
      (previous) => previous + 1
    );
  };

  /*
   * =====================================================
   * MEDIA
   * =====================================================
   */

  const media =
    Array.isArray(post?.mediaList) &&
    post.mediaList.length > 0
      ? post.mediaList[0]
      : null;

  /*
   * =====================================================
   * USER
   * =====================================================
   */

  const username =
    post?.username ||
    "MemoriesHub User";

  /*
   * =====================================================
   * DATE
   * =====================================================
   */

  const formattedDate =
    post?.createdAt
      ? new Date(
          post.createdAt
        ).toLocaleDateString(
          "en-IN",
          {
            day: "numeric",
            month: "short",
            year: "numeric",
          }
        )
      : "";

  return (
    <article className="post-card">

      {/* ================= HEADER ================= */}

      <div className="post-header">

        <div className="post-author">

          <div className="post-avatar-wrapper">

            <div className="post-avatar">
              {username
                .charAt(0)
                .toUpperCase()}
            </div>

            <span className="post-online" />

          </div>

          <div className="post-author-info">

            <div className="post-author-name">
              {username}
            </div>

            <div className="post-subtitle">

              <span>
                {formattedDate}
              </span>

              {post?.location && (
                <>
                  <span className="dot-separator">
                    •
                  </span>

                  <span>
                    {post.location}
                  </span>
                </>
              )}

            </div>

          </div>

        </div>

        <button
          type="button"
          className="more-button"
        >
          <MoreHorizontal size={20} />
        </button>

      </div>

      {/* ================= IMAGE ================= */}

      <div className="post-image-container">

        {media ? (
          media.mediaType ===
          "VIDEO" ? (
            <video
              src={media.mediaUrl}
              className="post-image"
              controls
              muted
            />
          ) : (
            <img
              src={media.mediaUrl}
              alt={
                post?.description ||
                "Memory"
              }
              className="post-image"
            />
          )
        ) : (
          <div className="post-no-image">
            No image
          </div>
        )}

        {post?.category && (
          <div className="post-category">
            <span>✦</span>
            {post.category}
          </div>
        )}

        {media?.mediaType ===
          "VIDEO" && (
          <div className="image-hover-overlay">
            <button type="button">
              <Play
                size={20}
                fill="white"
              />
            </button>
          </div>
        )}

      </div>

      {/* ================= BODY ================= */}

      <div className="post-body">

        <h2 className="post-title">
          {post?.description ||
            "Beautiful memory"}
        </h2>

        {post?.location && (
          <div className="post-location">
            <MapPin size={14} />

            <span>
              {post.location}
            </span>
          </div>
        )}

      </div>

      {/* ================= ACTIONS ================= */}

      <div className="post-actions">

        <div className="post-actions-left">

          {/* LIKE */}

          <button
            type="button"
            className={`post-action ${
              liked ? "liked" : ""
            }`}
            onClick={handleLike}
          >
            <Heart
              size={19}
              fill={
                liked
                  ? "currentColor"
                  : "none"
              }
            />

            <span>
              {likes}
            </span>
          </button>

          {/* COMMENT */}

          <button
            type="button"
            className={`post-action ${
              showComments
                ? "comment-active"
                : ""
            }`}
            onClick={() =>
              setShowComments(
                (previous) =>
                  !previous
              )
            }
          >
            <MessageCircle
              size={19}
            />

            <span>
              {comments}
            </span>
          </button>

          {/* SHARE */}

          <button
            type="button"
            className="post-action"
          >
            <Share2 size={18} />
          </button>

        </div>

        {/* SAVE */}

        <button
          type="button"
          className={`post-save ${
            saved ? "saved" : ""
          }`}
          onClick={() =>
            setSaved(
              (previous) =>
                !previous
            )
          }
        >
          <Bookmark
            size={19}
            fill={
              saved
                ? "currentColor"
                : "none"
            }
          />
        </button>

      </div>

      {/* ================= COMMENT INPUT ================= */}

      {user?.id && (
        <CommentSection
          postId={post.id}
          onCommentAdded={
            handleCommentAdded
          }
        />
      )}

      {/* ================= COMMENT COUNT / OPEN ================= */}

      {showComments && (
        <div className="post-comments-open">
          Comments are available for
          this memory.
        </div>
      )}

    </article>
  );
};

export default PostCard;