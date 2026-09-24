// src/pages/MemoryDetails.jsx

import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Heart,
  MapPin,
  CalendarDays,
  User,
  MessageCircle,
  UserPlus,
  UserCheck,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import memoryService from "../services/memoryService";
import CommentSection from "../components/CommentSection";
import "./MemoryDetails.css";

const MemoryDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  // UI state only for now.
  // Actual follow API can be connected when the Follow endpoint is available.
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    const loadPost = async () => {
      try {
        setLoading(true);

        const response = await memoryService.getPostById(id);

        setPost(response.data);
      } catch (error) {
        console.error("Failed to load memory:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [id]);


  if (loading) {
    return (
      <div className="memory-details-loading">
        Loading memory...
      </div>
    );
  }


  if (!post) {
    return (
      <div className="memory-details-empty">
        <h2>Memory not found</h2>

        <button onClick={() => navigate(-1)}>
          Go back
        </button>
      </div>
    );
  }


  const mediaList = post.mediaList || [];

  const firstMedia = mediaList[0];


  return (
    <div className="memory-details-page">

      {/* Back */}

      <button
        className="memory-details-back"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={18} />
        Back
      </button>


      <article className="memory-details-card">

        {/* Main Media */}

        {firstMedia && (
          <div className="memory-details-media">

            {firstMedia.mediaType === "VIDEO" ? (
              <video
                src={firstMedia.mediaUrl}
                controls
              />
            ) : (
              <img
                src={firstMedia.mediaUrl}
                alt="Memory"
              />
            )}

          </div>
        )}


        {/* Content */}

        <div className="memory-details-content">

          {/* User */}

          <div className="memory-author-row">

            <div className="memory-author">

              <div className="memory-author-avatar">
                <User size={20} />
              </div>

              <div>
                <strong>
                  {post.username || "MemoriesHub User"}
                </strong>

                <span>
                  Shared a memory
                </span>
              </div>

            </div>


            {/* FOLLOW */}

            <button
              className={`follow-button ${
                following ? "following" : ""
              }`}
              onClick={() => setFollowing((value) => !value)}
            >
              {following ? (
                <>
                  <UserCheck size={16} />
                  Following
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  Follow
                </>
              )}
            </button>

          </div>


          {/* Description */}

          <div className="memory-details-text">

            <h1>
              {post.description}
            </h1>

          </div>


          {/* Metadata */}

          <div className="memory-details-meta">

            {post.category && (
              <span className="memory-meta-pill">
                <Heart size={15} />
                {post.category}
              </span>
            )}

            {post.location && (
              <span className="memory-meta-pill">
                <MapPin size={15} />
                {post.location}
              </span>
            )}

            {post.createdAt && (
              <span className="memory-meta-pill">
                <CalendarDays size={15} />
                {new Date(post.createdAt).toLocaleDateString()}
              </span>
            )}

          </div>


          {/* Interaction */}

          <div className="memory-details-actions">

            <button>
              <Heart size={18} />
              Like
            </button>

            <button>
              <MessageCircle size={18} />
              Comment
            </button>

          </div>


          {/* Comments */}

          <div className="memory-comments">

            <CommentSection
              postId={post.id}
              comments={post.comments || []}
            />

          </div>

        </div>

      </article>

    </div>
  );
};

export default MemoryDetails;
