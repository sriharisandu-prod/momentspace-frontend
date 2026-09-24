import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useNotifications } from "../contexts/NotificationContext";

import "./Notifications.css";

const Notifications = () => {
  const navigate = useNavigate();

  const {
    notifications = [],
    unreadCount = 0,
    loading,
    markAsRead,
    refreshNotifications,
  } = useNotifications();

  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.isRead) {
        await markAsRead(notification.id);
      }
    } catch (error) {
      console.error(
        "Failed to mark notification as read:",
        error
      );
    }

    if (notification.senderId) {
      navigate(`/profile/${notification.senderId}`);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "LIKE":
        return "❤️";

      case "COMMENT":
        return "💬";

      case "FOLLOW":
        return "👤";

      default:
        return "🔔";
    }
  };

  const getNotificationType = (type) => {
    switch (type) {
      case "LIKE":
        return "Like";

      case "COMMENT":
        return "Comment";

      case "FOLLOW":
        return "Follow";

      default:
        return "Notification";
    }
  };

  return (
    <div className="notifications-page">

      {/* =========================
          HEADER
      ========================== */}

      <div className="notifications-header">

        <div>
          <h1>Notifications</h1>

          <p>
            Stay updated with your latest activity
          </p>
        </div>

        {unreadCount > 0 && (
          <div className="notifications-unread-count">
            {unreadCount} unread
          </div>
        )}

      </div>


      {/* =========================
          LOADING
      ========================== */}

      {loading && (
        <div className="notifications-loading">
          Loading notifications...
        </div>
      )}


      {/* =========================
          EMPTY
      ========================== */}

      {!loading && notifications.length === 0 && (
        <div className="notifications-empty">

          <div className="notifications-empty-icon">
            🔔
          </div>

          <h2>
            No notifications yet
          </h2>

          <p>
            When someone likes, comments on,
            or follows you, you'll see it here.
          </p>

        </div>
      )}


      {/* =========================
          NOTIFICATION LIST
      ========================== */}

      {!loading && notifications.length > 0 && (
        <div className="notifications-list">

          {notifications.map((notification) => (

            <div
              key={notification.id}
              className={`notification-item ${
                !notification.isRead
                  ? "notification-unread"
                  : ""
              }`}
              onClick={() =>
                handleNotificationClick(notification)
              }
            >

              {/* =========================
                  ICON
              ========================== */}

              <div className="notification-icon">
                {getNotificationIcon(
                  notification.type
                )}
              </div>


              {/* =========================
                  CONTENT
              ========================== */}

              <div className="notification-content">

                <div className="notification-type">
                  {getNotificationType(
                    notification.type
                  )}
                </div>


                {/* =========================
                    MESSAGE
                ========================== */}

                {notification.type === "COMMENT" ? (
                  <div className="notification-message">

                    <strong>
                      {notification.senderName ||
                        "Someone"}
                    </strong>

                    <span>
                      {" commented: "}
                    </span>

                    <span className="notification-comment">
                      {getCommentText(notification)}
                    </span>

                  </div>
                ) : (
                  <div className="notification-message">
                    {notification.message || ""}
                  </div>
                )}


                {/* =========================
                    TIME
                ========================== */}

                {notification.createdAt && (
                  <div className="notification-time">
                    {formatNotificationTime(
                      notification.createdAt
                    )}
                  </div>
                )}

              </div>


              {/* =========================
                  UNREAD DOT
              ========================== */}

              {!notification.isRead && (
                <div className="notification-unread-dot" />
              )}

            </div>
          ))}

        </div>
      )}

    </div>
  );
};


/* =====================================================
   GET COMMENT TEXT
===================================================== */

const getCommentText = (notification) => {

  /*
   1. commentContent
  */

  if (
    notification.commentContent &&
    String(notification.commentContent).trim()
  ) {
    return notification.commentContent;
  }


  /*
   2. commentText
  */

  if (
    notification.commentText &&
    String(notification.commentText).trim()
  ) {
    return notification.commentText;
  }


  /*
   3. content
  */

  if (
    notification.content &&
    String(notification.content).trim()
  ) {
    return notification.content;
  }


  /*
   4. comment object
  */

  if (
    notification.comment &&
    typeof notification.comment === "object"
  ) {

    if (
      notification.comment.content &&
      String(
        notification.comment.content
      ).trim()
    ) {
      return notification.comment.content;
    }

    if (
      notification.comment.text &&
      String(
        notification.comment.text
      ).trim()
    ) {
      return notification.comment.text;
    }

    if (
      notification.comment.comment &&
      String(
        notification.comment.comment
      ).trim()
    ) {
      return notification.comment.comment;
    }
  }


  /*
   5. Extract from message

   Example:

   "Srihari commented: \"Beautiful memory!\""
  */

  const message =
    notification.message || "";

  const marker =
    " commented: ";

  const markerIndex =
    message.indexOf(marker);

  if (markerIndex !== -1) {

    let text =
      message
        .substring(
          markerIndex + marker.length
        )
        .trim();

    if (
      text.startsWith('"') &&
      text.endsWith('"')
    ) {
      text =
        text.substring(
          1,
          text.length - 1
        );
    }

    if (
      text.startsWith("'") &&
      text.endsWith("'")
    ) {
      text =
        text.substring(
          1,
          text.length - 1
        );
    }

    return text;
  }


  /*
   6. Older message format

   "Srihari commented on your post: Nice!"
  */

  const oldMarker =
    " commented on your post: ";

  const oldIndex =
    message.indexOf(oldMarker);

  if (oldIndex !== -1) {

    return message
      .substring(
        oldIndex + oldMarker.length
      )
      .trim();
  }


  /*
   Nothing available.

   IMPORTANT:
   Do NOT return "Comment".
  */

  return "";
};


/* =====================================================
   TIME
===================================================== */

const formatNotificationTime = (
  dateString
) => {

  if (!dateString) {
    return "";
  }

  const date =
    new Date(dateString);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  const now =
    new Date();

  const difference =
    now.getTime() -
    date.getTime();

  const seconds =
    Math.floor(
      difference / 1000
    );

  const minutes =
    Math.floor(
      seconds / 60
    );

  const hours =
    Math.floor(
      minutes / 60
    );

  const days =
    Math.floor(
      hours / 24
    );


  if (seconds < 60) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  if (hours < 24) {
    return `${hours}h ago`;
  }

  if (days < 7) {
    return `${days}d ago`;
  }

  return date.toLocaleDateString();
};


export default Notifications;