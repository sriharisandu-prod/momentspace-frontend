import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useAuth } from "../contexts/AuthContext";

import useCall from "../hooks/useCall";

import CallPanel from "../components/CallPanel";

import {
  FiSearch,
  FiMessageCircle,
  FiSend,
  FiChevronRight,
  FiPhone,
  FiVideo,
} from "react-icons/fi";

import {
  getConversation,
} from "../services/messageService";

import {
  getAllUsers,
} from "../services/userService";

import {
  connectMessageSocket,
  disconnectMessageSocket,
  sendMessage,
} from "../services/messageSocket";

import "./Messages.css";


const getUnreadStorageKey = (userId) => {
  return `memorieshub_unread_messages_${userId}`;
};


const getLastMessageStorageKey = (userId) => {
  return `memorieshub_last_messages_${userId}`;
};


const Messages = () => {

  const { user } = useAuth();


  /*
   * =========================
   * CALL SYSTEM
   * =========================
   */

  const {
  isConnected: callSocketConnected,

  incomingCall,

  activeCall,

  callConnected,

  isMuted,

  startCall,

  acceptCall,

  rejectCall,

  endCall,

  toggleMute,

  localVideoRef,

  remoteVideoRef,

  remoteAudioRef,
} = useCall(user?.id);


  /*
   * =========================
   * MESSAGE STATE
   * =========================
   */

  const [users, setUsers] =
    useState([]);

  const [selectedUser, setSelectedUser] =
    useState(null);

  const [messages, setMessages] =
    useState([]);

  const [messageText, setMessageText] =
    useState("");

  const [searchText, setSearchText] =
    useState("");

  const [loadingUsers, setLoadingUsers] =
    useState(true);

  const [loadingMessages, setLoadingMessages] =
    useState(false);


  const [unreadUsers, setUnreadUsers] =
    useState({});


  const [lastMessages, setLastMessages] =
    useState({});


  /*
   * =========================
   * REFS
   * =========================
   */

  const selectedUserRef =
    useRef(null);

  const usersRef =
    useRef([]);

  const messagesEndRef =
    useRef(null);


  /*
   * Keep selected user ref updated.
   */

  useEffect(() => {

    selectedUserRef.current =
      selectedUser;

  }, [selectedUser]);


  /*
   * Keep users ref updated.
   */

  useEffect(() => {

    usersRef.current =
      users;

  }, [users]);


  /*
   * =========================
   * RESTORE MESSAGE STATE
   * =========================
   */

  useEffect(() => {

    if (!user?.id) {
      return;
    }

    try {

      const storedUnread =
        localStorage.getItem(
          getUnreadStorageKey(user.id)
        );

      if (storedUnread) {

        setUnreadUsers(
          JSON.parse(storedUnread)
        );

      }


      const storedLastMessages =
        localStorage.getItem(
          getLastMessageStorageKey(
            user.id
          )
        );

      if (storedLastMessages) {

        setLastMessages(
          JSON.parse(
            storedLastMessages
          )
        );

      }

    } catch (error) {

      console.error(
        "Failed to restore message state:",
        error
      );

    }

  }, [user?.id]);


  /*
   * =========================
   * LOAD USERS
   * =========================
   */

  useEffect(() => {

    const loadUsers = async () => {

      if (!user?.id) {
        return;
      }

      try {

        setLoadingUsers(true);

        const data =
          await getAllUsers();

        const otherUsers =
          Array.isArray(data)
            ? data.filter(
                (item) =>
                  Number(item.id) !==
                  Number(user.id)
              )
            : [];

        setUsers(
          otherUsers
        );

      } catch (error) {

        console.error(
          "Failed to load users:",
          error
        );

        setUsers([]);

      } finally {

        setLoadingUsers(false);

      }
    };

    loadUsers();

  }, [user?.id]);


  /*
   * =========================
   * GLOBAL MESSAGE SOCKET
   * =========================
   */

  useEffect(() => {

    if (
      !user?.id ||
      !user?.email
    ) {
      return;
    }

    console.log(
      "Starting global message listener:",
      user.email
    );


    connectMessageSocket(
      (newMessage) => {

        console.log(
          "GLOBAL MESSAGE RECEIVED:",
          newMessage
        );


        /*
         * Ignore own message.
         */

        if (
          newMessage.senderEmail ===
          user.email
        ) {
          return;
        }


        /*
         * Only messages addressed
         * to current user.
         */

        if (
          newMessage.receiverEmail !==
          user.email
        ) {
          return;
        }


        const currentSelectedUser =
          selectedUserRef.current;

        const currentUsers =
          usersRef.current;


        /*
         * Find sender.
         */

        const sender =
          currentUsers.find(
            (item) =>
              item.email ===
              newMessage.senderEmail
          );


        /*
         * Current open conversation.
         */

        if (
          currentSelectedUser &&
          currentSelectedUser.email ===
            newMessage.senderEmail
        ) {

          setMessages(
            (previousMessages) => {

              const alreadyExists =
                previousMessages.some(
                  (item) =>
                    item.id &&
                    newMessage.id &&
                    Number(item.id) ===
                      Number(newMessage.id)
                );

              if (alreadyExists) {
                return previousMessages;
              }

              return [
                ...previousMessages,
                newMessage,
              ];
            }
          );


          if (sender?.id) {

            setLastMessages(
              (previous) => {

                const next = {
                  ...previous,
                  [sender.id]:
                    newMessage.content,
                };

                localStorage.setItem(
                  getLastMessageStorageKey(
                    user.id
                  ),
                  JSON.stringify(next)
                );

                return next;
              }
            );

          }

          return;
        }


        /*
         * Message from another conversation.
         */

        if (sender?.id) {

          setUnreadUsers(
            (previous) => {

              const next = {
                ...previous,
                [sender.id]: true,
              };

              localStorage.setItem(
                getUnreadStorageKey(
                  user.id
                ),
                JSON.stringify(next)
              );

              return next;
            }
          );


          setLastMessages(
            (previous) => {

              const next = {
                ...previous,
                [sender.id]:
                  newMessage.content,
              };

              localStorage.setItem(
                getLastMessageStorageKey(
                  user.id
                ),
                JSON.stringify(next)
              );

              return next;
            }
          );

        }

      }
    );


    return () => {

      disconnectMessageSocket();

    };

  }, [
    user?.id,
    user?.email,
  ]);


  /*
   * =========================
   * SCROLL TO BOTTOM
   * =========================
   */

  useEffect(() => {

    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });

  }, [messages]);


  /*
   * =========================
   * OPEN CHAT
   * =========================
   */

  const openChat = async (
    chatUser
  ) => {

    if (!chatUser) {
      return;
    }


    setSelectedUser(
      chatUser
    );


    /*
     * Clear unread.
     */

    setUnreadUsers(
      (previous) => {

        const next = {
          ...previous,
        };

        delete next[
          chatUser.id
        ];


        if (user?.id) {

          localStorage.setItem(
            getUnreadStorageKey(
              user.id
            ),
            JSON.stringify(next)
          );

        }

        return next;
      }
    );


    setMessages([]);

    setLoadingMessages(true);


    try {

      const data =
        await getConversation(
          user.email,
          chatUser.email
        );


      const loadedMessages =
        Array.isArray(data)
          ? data
          : [];


      setMessages(
        loadedMessages
      );


      if (
        loadedMessages.length > 0
      ) {

        const lastMessage =
          loadedMessages[
            loadedMessages.length - 1
          ];


        setLastMessages(
          (previous) => {

            const next = {
              ...previous,
              [chatUser.id]:
                lastMessage.content,
            };


            localStorage.setItem(
              getLastMessageStorageKey(
                user.id
              ),
              JSON.stringify(next)
            );


            return next;
          }
        );

      }

    } catch (error) {

      console.error(
        "Failed to load conversation:",
        error
      );

      setMessages([]);

    } finally {

      setLoadingMessages(false);

    }

  };


  /*
   * =========================
   * SEND MESSAGE
   * =========================
   */

  const handleSendMessage = () => {

    const content =
      messageText.trim();


    if (
      !content ||
      !selectedUser ||
      !user
    ) {
      return;
    }


    const localMessage = {

      id:
        `local-${Date.now()}`,

      content,

      senderEmail:
        user.email,

      receiverEmail:
        selectedUser.email,

      sentAt:
        new Date().toISOString(),

    };


    /*
     * Show immediately.
     */

    setMessages(
      (previousMessages) => [
        ...previousMessages,
        localMessage,
      ]
    );


    /*
     * Update preview.
     */

    setLastMessages(
      (previous) => {

        const next = {
          ...previous,
          [selectedUser.id]:
            content,
        };


        localStorage.setItem(
          getLastMessageStorageKey(
            user.id
          ),
          JSON.stringify(next)
        );


        return next;
      }
    );


    /*
     * Send backend message.
     */

    const sent =
      sendMessage({

        content,

        senderEmail:
          user.email,

        receiverEmail:
          selectedUser.email,

      });


    /*
     * If socket isn't connected,
     * remove temporary message.
     */

    if (!sent) {

      setMessages(
        (previousMessages) =>
          previousMessages.filter(
            (message) =>
              message.id !==
              localMessage.id
          )
      );

      return;
    }


    setMessageText("");

  };


  /*
   * =========================
   * ENTER KEY
   * =========================
   */

  const handleKeyDown = (
    event
  ) => {

    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {

      event.preventDefault();

      handleSendMessage();

    }

  };


  /*
   * =========================
   * SEARCH USERS
   * =========================
   */

  const filteredUsers =
    useMemo(() => {

      const query =
        searchText
          .trim()
          .toLowerCase();


      if (!query) {
        return users;
      }


      return users.filter(
        (item) =>
          item.username
            ?.toLowerCase()
            .includes(query) ||
          item.email
            ?.toLowerCase()
            .includes(query)
      );

    }, [
      users,
      searchText,
    ]);


  /*
   * =========================
   * PROFILE IMAGE
   * =========================
   */

  const getProfileImage = (
    chatUser
  ) => {

    return (
      chatUser?.profilePhotoUrl ||
      "/default-avatar.png"
    );

  };


  /*
   * =========================
   * RENDER
   * =========================
   */

  return (

    <div className="messages-page">

      {/* =========================
          LEFT USERS PANEL
      ========================== */}

      <div className="messages-users-panel">

        <div className="messages-search">

          <FiSearch />

          <input
            type="text"
            placeholder="Search"
            value={searchText}
            onChange={(event) =>
              setSearchText(
                event.target.value
              )
            }
          />

        </div>


        <div className="messages-users-list">

          {loadingUsers ? (

            <div className="messages-empty">
              Loading users...
            </div>

          ) : filteredUsers.length === 0 ? (

            <div className="messages-empty">

              <FiMessageCircle
                size={32}
              />

              <p>
                No users found
              </p>

            </div>

          ) : (

            filteredUsers.map(
              (chatUser) => {

                const isSelected =
                  selectedUser?.id ===
                  chatUser.id;


                const isUnread =
                  Boolean(
                    unreadUsers[
                      chatUser.id
                    ]
                  );


                const preview =
                  lastMessages[
                    chatUser.id
                  ] ||
                  "Start a conversation";


                return (

                  <button
                    key={chatUser.id}
                    className={`messages-user ${
                      isSelected
                        ? "messages-user-selected"
                        : ""
                    }`}
                    onClick={() =>
                      openChat(
                        chatUser
                      )
                    }
                  >

                    <div className="messages-avatar-wrapper">

                      <img
                        src={getProfileImage(
                          chatUser
                        )}
                        alt={
                          chatUser.username
                        }
                        className="messages-avatar"
                      />


                      {isUnread && (
                        <span className="messages-unread-dot" />
                      )}

                    </div>


                    <div className="messages-user-info">

                      <div className="messages-user-top">

                        <span
                          className={
                            isUnread
                              ? "messages-user-name-unread"
                              : "messages-user-name"
                          }
                        >
                          {
                            chatUser.username
                          }
                        </span>


                        {isUnread && (
                          <span className="messages-unread-label">
                            New
                          </span>
                        )}

                      </div>


                      <div
                        className={`messages-user-preview ${
                          isUnread
                            ? "messages-user-preview-unread"
                            : ""
                        }`}
                      >
                        {preview}
                      </div>

                    </div>


                    <FiChevronRight
                      className="messages-user-arrow"
                    />

                  </button>

                );

              }
            )

          )}

        </div>

      </div>


      {/* =========================
          CHAT PANEL
      ========================== */}

      <div className="messages-chat-panel">

        {!selectedUser ? (

          <div className="messages-no-chat">

            <FiMessageCircle
              size={36}
            />

            <p>
              Select a conversation
            </p>

          </div>

        ) : (

          <>

            {/* =========================
                CHAT HEADER
            ========================== */}

            <div className="messages-chat-header">

              <img
                src={getProfileImage(
                  selectedUser
                )}
                alt={
                  selectedUser.username
                }
                className="messages-chat-avatar"
              />


              <div className="messages-chat-user-details">

                <div className="messages-chat-name">
                  {
                    selectedUser.username
                  }
                </div>


                <div className="messages-chat-email">
                  {
                    selectedUser.email
                  }
                </div>

              </div>


              {/* =========================
                  CALL BUTTONS
              ========================== */}

              <div className="messages-call-actions">

                <button
                  type="button"
                  title="Voice call"
                  aria-label="Voice call"
                  onClick={() =>
                    startCall(
                      selectedUser.id,
                      "VOICE"
                    )
                  }
                  disabled={
                    !callSocketConnected
                  }
                >
                  <FiPhone
                    size={19}
                  />
                </button>


                <button
                  type="button"
                  title="Video call"
                  aria-label="Video call"
                  onClick={() =>
                    startCall(
                      selectedUser.id,
                      "VIDEO"
                    )
                  }
                  disabled={
                    !callSocketConnected
                  }
                >
                  <FiVideo
                    size={19}
                  />
                </button>

              </div>

            </div>


            {/* =========================
                CHAT BODY
            ========================== */}

            <div className="messages-chat-body">

              {loadingMessages ? (

                <div className="messages-loading">
                  Loading messages...
                </div>

              ) : messages.length === 0 ? (

                <div className="messages-start">

                  <FiMessageCircle
                    size={32}
                  />

                  <p>
                    Start a conversation with{" "}
                    {
                      selectedUser.username
                    }
                  </p>

                </div>

              ) : (

                messages.map(
                  (
                    message,
                    index
                  ) => {

                    const isMine =
                      message.senderEmail ===
                      user?.email;


                    return (

                      <div
                        key={
                          message.id ||
                          index
                        }
                        className={`message-row ${
                          isMine
                            ? "message-row-mine"
                            : "message-row-other"
                        }`}
                      >

                        <div
                          className={`message-bubble ${
                            isMine
                              ? "message-bubble-mine"
                              : "message-bubble-other"
                          }`}
                        >
                          {
                            message.content
                          }
                        </div>

                      </div>

                    );

                  }
                )

              )}


              <div
                ref={messagesEndRef}
              />

            </div>


            {/* =========================
                MESSAGE INPUT
            ========================== */}

            <div className="messages-input-area">

              <input
                type="text"
                placeholder={`Message ${selectedUser.username}...`}
                value={messageText}
                onChange={(event) =>
                  setMessageText(
                    event.target.value
                  )
                }
                onKeyDown={
                  handleKeyDown
                }
              />


              <button
                onClick={
                  handleSendMessage
                }
                disabled={
                  !messageText.trim()
                }
              >

                <FiSend />

                <span>
                  Send
                </span>

              </button>

            </div>

          </>

        )}

      </div>


      {/* =========================
          CALL OVERLAY
      ========================== */}

      <CallPanel
  call={activeCall}
  incomingCall={incomingCall}

  onAccept={acceptCall}
  onReject={rejectCall}
  onEnd={endCall}

  callConnected={callConnected}

  isMuted={isMuted}
  onToggleMute={toggleMute}

  localVideoRef={localVideoRef}
  remoteVideoRef={remoteVideoRef}
  remoteAudioRef={remoteAudioRef}
/>

    </div>
  );
};


export default Messages;