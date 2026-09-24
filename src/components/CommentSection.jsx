import React, { useState } from "react";
import { Send } from "lucide-react";

import { createComment } from "../services/commentService";
import { useAuth } from "../contexts/AuthContext";

const CommentSection = ({
  postId,
  onCommentAdded,
}) => {
  const { user } = useAuth();

  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleAddComment = async () => {
    const content = newComment.trim();

    if (!content) {
      return;
    }

    /*
     * Get the actual numeric user ID.
     */
    const userId =
      typeof user === "object"
        ? user?.id
        : user;

    /*
     * Get the actual numeric post ID.
     */
    const actualPostId =
      typeof postId === "object"
        ? postId?.id
        : postId;

    console.log("COMMENT DATA BEFORE REQUEST:", {
      userId,
      postId: actualPostId,
      content,
    });

    /*
     * Both IDs must exist.
     */
    if (!userId) {
      console.error(
        "User ID is missing:",
        user
      );
      return;
    }

    if (!actualPostId) {
      console.error(
        "Post ID is missing:",
        postId
      );
      return;
    }

    try {
      setSubmitting(true);

      const createdComment = await createComment(
        Number(userId),
        Number(actualPostId),
        content
      );

      console.log(
        "COMMENT CREATED:",
        createdComment
      );

      setNewComment("");

      if (onCommentAdded) {
        onCommentAdded(createdComment);
      }
    } catch (error) {
      console.error(
        "COMMENT REQUEST FAILED:",
        error
      );

      console.error(
        "STATUS:",
        error?.response?.status
      );

      console.error(
        "BACKEND RESPONSE:",
        error?.response?.data
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="post-comment">
      <div className="post-comment-avatar">
        {(user?.username || "U")
          .charAt(0)
          .toUpperCase()}
      </div>

      <div className="post-comment-input">
        <input
          type="text"
          value={newComment}
          onChange={(e) =>
            setNewComment(e.target.value)
          }
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              !submitting
            ) {
              e.preventDefault();
              handleAddComment();
            }
          }}
          placeholder="Write a comment..."
          disabled={submitting}
        />

        <button
          type="button"
          onClick={handleAddComment}
          disabled={
            submitting ||
            !newComment.trim()
          }
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  );
};

export default CommentSection;