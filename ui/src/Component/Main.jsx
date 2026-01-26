import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import api from '../axios';
import { logout as logoutAction } from '../redux/actions/authActions';
import { useWebSocket } from '../hooks/useWebSocket';
import { useChat } from '../hooks/useChat';
import ChatSidebar from './ChatSidebar';
import ChatArea from './ChatArea';

api.defaults.withCredentials = true;

const Main = () => {
  const [newMessageText, setNewMessageText] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('direct');

  const user = useSelector((state) => state.authReducer.user);
  const dispatch = useDispatch();

  // Custom hooks for chat functionality
  const {
    onlinePeople,
    offlinePeople,
    selectedUserId,
    selectedUserName,
    messages,
    setSelectedUserId,
    handleIncomingMessage,
    addOptimisticMessage,
    isUserOnline,
  } = useChat(user);

  // WebSocket connection
  const { sendMessage: wsSendMessage, closeConnection } = useWebSocket(handleIncomingMessage);

  // Handle message send
  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!newMessageText.trim() || !selectedUserId) return;

    const success = wsSendMessage({
      recipient: selectedUserId,
      text: newMessageText,
    });

    if (success) {
      addOptimisticMessage(newMessageText, selectedUserId);
      setNewMessageText('');
    } else {
      toast.error('Unable to send message. Please check your connection.');
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await api.post('/api/logout', {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      localStorage.removeItem('accessToken');
      dispatch(logoutAction());
      closeConnection();
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Logout failed. Please try again.');
    }
  };

  // Close mobile menu when user is selected
  React.useEffect(() => {
    if (selectedUserId && window.innerWidth < 768) {
      setIsMobileMenuOpen(false);
    }
  }, [selectedUserId]);

  return (
    <div className="flex h-screen w-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-200 opacity-20 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-200 opacity-20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '1s' }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-200 opacity-10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '2s' }}
        ></div>
      </div>

      {/* Sidebar */}
      <ChatSidebar
        user={user}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onlinePeople={onlinePeople}
        offlinePeople={offlinePeople}
        selectedUserId={selectedUserId}
        setSelectedUserId={setSelectedUserId}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      />

      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 p-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200"
      >
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          viewBox="0 0 24 24"
        >
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Chat Area */}
      <main className="flex-1 flex flex-col h-full min-w-0 relative z-10">
        <ChatArea
          selectedUserId={selectedUserId}
          selectedUserName={selectedUserName}
          isUserOnline={isUserOnline(selectedUserId)}
          messages={messages}
          user={user}
          newMessageText={newMessageText}
          setNewMessageText={setNewMessageText}
          onSendMessage={handleSendMessage}
          onBack={() => setSelectedUserId(null)}
        />
      </main>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-gradient-to-br from-indigo-900/50 via-purple-900/50 to-pink-900/50 backdrop-blur-sm z-20 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default Main;
