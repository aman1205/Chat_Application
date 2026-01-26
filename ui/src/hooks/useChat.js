import { useState, useCallback, useEffect, useMemo } from 'react';
import { uniqBy } from 'lodash';
import toast from 'react-hot-toast';
import api from '../axios';

/**
 * Custom hook for chat functionality
 * Manages messages, users (online/offline), and selected conversation
 */
export const useChat = (currentUser) => {
  const [onlinePeople, setOnlinePeople] = useState({});
  const [offlinePeople, setOfflinePeople] = useState({});
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [selectedUserName, setSelectedUserName] = useState(null);

  // Update online users
  const updateOnlinePeople = useCallback((peopleArray) => {
    const people = {};
    peopleArray.forEach(({ userId, username, profilePhoto }) => {
      if (userId) {
        people[userId] = { username, profilePhoto, id: userId };
      }
    });
    setOnlinePeople((prev) => {
      if (JSON.stringify(prev) !== JSON.stringify(people)) {
        return people;
      }
      return prev;
    });
  }, []);

  // Update offline users
  const updateOfflinePeople = useCallback((peopleArray) => {
    const people = {};
    peopleArray.forEach(({ userId, username, profilePhoto }) => {
      if (userId) {
        people[userId] = { username, profilePhoto, id: userId };
      }
    });
    setOfflinePeople((prev) => {
      if (JSON.stringify(prev) !== JSON.stringify(people)) {
        return people;
      }
      return prev;
    });
  }, []);

  // Handle incoming WebSocket message
  const handleIncomingMessage = useCallback(
    (messageData) => {
      if ('online' in messageData && 'offline' in messageData) {
        updateOnlinePeople(messageData.online);
        updateOfflinePeople(messageData.offline);
      } else if ('text' in messageData) {
        setMessages((prev) => [...prev, messageData]);
      }
    },
    [updateOnlinePeople, updateOfflinePeople]
  );

  // Add message optimistically
  const addOptimisticMessage = useCallback(
    (text, recipientId) => {
      const optimisticMessage = {
        text,
        sender: currentUser.id,
        recipient: recipientId,
        _id: Date.now(),
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimisticMessage]);
    },
    [currentUser.id]
  );

  // Fetch messages for selected user
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedUserId) {
        setMessages([]);
        return;
      }

      try {
        const response = await api.get(`/api/messages/${selectedUserId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });

        // Handle different response formats
        const messages = response.data.messages || response.data || [];
        setMessages(messages);
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast.error('Failed to load messages. Please try again.');
      }
    };

    fetchMessages();
  }, [selectedUserId]);

  // Find and set selected user name
  useEffect(() => {
    if (!selectedUserId) {
      setSelectedUserName(null);
      return;
    }

    if (onlinePeople[selectedUserId]) {
      setSelectedUserName(onlinePeople[selectedUserId].username);
    } else if (offlinePeople[selectedUserId]) {
      setSelectedUserName(offlinePeople[selectedUserId].username);
    }
  }, [selectedUserId, onlinePeople, offlinePeople]);

  // Memoized values
  const messageWithoutDuplicates = useMemo(
    () => uniqBy(messages, '_id'),
    [messages]
  );

  const onlinePeopleExcludingCurrent = useMemo(() => {
    const people = { ...onlinePeople };
    if (currentUser && currentUser.id) {
      delete people[currentUser.id];
    }
    return people;
  }, [onlinePeople, currentUser]);

  const isUserOnline = useCallback(
    (userId) => !!onlinePeople[userId],
    [onlinePeople]
  );

  return {
    // State
    onlinePeople: onlinePeopleExcludingCurrent,
    offlinePeople,
    selectedUserId,
    selectedUserName,
    messages: messageWithoutDuplicates,

    // Actions
    setSelectedUserId,
    handleIncomingMessage,
    addOptimisticMessage,
    isUserOnline,
  };
};
