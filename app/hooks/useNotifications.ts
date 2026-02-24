import { useState, useEffect, useRef } from 'react';
import { api } from '@/app/context/AuthContext';
import { io, Socket } from 'socket.io-client';

export function useNotifications(userId: string | undefined) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState<any[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!userId) return;

    // Fetch initial unread count
    fetchUnreadCount();
    fetchUnreadMessages();

    // Setup socket for real-time updates
    const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const socket = io(`${SOCKET_URL}/marketplace-chat`, {
      transports: ['polling', 'websocket'],
      reconnection: true,
    });

    socket.on('connect', () => {
      console.log('Notifications socket connected');
    });

    // Listen for new notification events
    socket.on('newNotification', (data: any) => {
      if (data.recipientId === userId) {
        fetchUnreadCount();
        fetchUnreadMessages();
      }
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/notifications/unread/count');
      setUnreadCount(res.data.count);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  const fetchUnreadMessages = async () => {
    try {
      const res = await api.get('/notifications/unread');
      setUnreadMessages(res.data);
    } catch (err) {
      console.error('Error fetching unread messages:', err);
    }
  };

  const markAsRead = async (serviceId: string) => {
    try {
      await api.post(`/notifications/mark-read/${serviceId}`);
      await fetchUnreadCount();
      await fetchUnreadMessages();
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/mark-all-read');
      setUnreadCount(0);
      setUnreadMessages([]);
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  return {
    unreadCount,
    unreadMessages,
    markAsRead,
    markAllAsRead,
    refresh: fetchUnreadCount,
  };
}