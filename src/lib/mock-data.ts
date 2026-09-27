export type User = {
  id: string;
  name: string;
  avatar: string;
  online: boolean;
  lastSeen?: string;
  status?: string;
  about?: string;
};

export type Message = {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  type: 'text' | 'image' | 'video' | 'audio' | 'file';
  mediaUrl?: string;
  reactions?: { emoji: string; count: number; userReacted: boolean }[];
};

export type Chat = {
  id: string;
  type: 'direct' | 'group';
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  isTyping?: boolean;
  draft?: string;
  name?: string; // For groups
  groupAvatar?: string; // For groups
};

export const currentUser: User = {
  id: 'u0',
  name: 'Mohim',
  avatar: 'https://i.pravatar.cc/150?u=u0',
  online: true,
  status: 'Better things take time.',
};

export const mockUsers: User[] = [
  { id: 'u1', name: 'Maria', avatar: 'https://i.pravatar.cc/150?u=u1', online: true, status: 'Good vibes only 💙' },
  { id: 'u2', name: 'Rakib', avatar: 'https://i.pravatar.cc/150?u=u2', online: false, lastSeen: '12 min ago' },
  { id: 'u3', name: 'Sanjida', avatar: 'https://i.pravatar.cc/150?u=u3', online: false, lastSeen: '5 min ago' },
  { id: 'u4', name: 'Tariq', avatar: 'https://i.pravatar.cc/150?u=u4', online: false, lastSeen: '1 hour ago' },
  { id: 'u5', name: 'Arif', avatar: 'https://i.pravatar.cc/150?u=u5', online: true },
  { id: 'u6', name: 'Nusrat', avatar: 'https://i.pravatar.cc/150?u=u6', online: true },
  { id: 'u7', name: 'Arafat', avatar: 'https://i.pravatar.cc/150?u=u7', online: false, lastSeen: '2 hours ago' },
];

export const mockChats: Chat[] = [
  {
    id: 'c1',
    type: 'direct',
    participants: [currentUser, mockUsers[0]], // Maria
    unreadCount: 0,
    lastMessage: {
      id: 'm1',
      chatId: 'c1',
      senderId: 'u1',
      text: 'Will be there in 30 minutes. ❤️',
      timestamp: '10:29 AM',
      status: 'read',
      type: 'text',
    },
  },
  {
    id: 'c2',
    type: 'group',
    name: 'Team Softvence',
    groupAvatar: 'https://i.pravatar.cc/150?u=g1',
    participants: [currentUser, mockUsers[1], mockUsers[2]],
    unreadCount: 5,
    lastMessage: {
      id: 'm2',
      chatId: 'c2',
      senderId: 'u2',
      text: 'Rafi: The new update is live now...',
      timestamp: '09:45 AM',
      status: 'delivered',
      type: 'text',
    },
  },
  {
    id: 'c3',
    type: 'group',
    name: 'Family Group',
    groupAvatar: 'https://i.pravatar.cc/150?u=g2',
    participants: [currentUser, mockUsers[0], mockUsers[3]],
    unreadCount: 0,
    lastMessage: {
      id: 'm3',
      chatId: 'c3',
      senderId: 'u3',
      text: 'Mama: Alhamdulillah ❤️',
      timestamp: '08:12 AM',
      status: 'read',
      type: 'text',
    },
  },
  {
    id: 'c4',
    type: 'direct',
    participants: [currentUser, mockUsers[1]], // Rakib
    unreadCount: 0,
    lastMessage: {
      id: 'm4',
      chatId: 'c4',
      senderId: 'u0',
      text: '📞 Voice call - 12 min',
      timestamp: 'Yesterday',
      status: 'read',
      type: 'text',
    },
  },
  {
    id: 'c5',
    type: 'group',
    name: 'Design Team',
    groupAvatar: 'https://i.pravatar.cc/150?u=g3',
    participants: [currentUser, mockUsers[0], mockUsers[4]],
    unreadCount: 3,
    lastMessage: {
      id: 'm5',
      chatId: 'c5',
      senderId: 'u0',
      text: 'You: Shared a file',
      timestamp: 'Yesterday',
      status: 'read',
      type: 'text',
    },
  },
  {
    id: 'c6',
    type: 'direct',
    participants: [currentUser, mockUsers[2]], // Sanjida
    unreadCount: 0,
    lastMessage: {
      id: 'm6',
      chatId: 'c6',
      senderId: 'u2',
      text: 'Okay, see you!',
      timestamp: 'Yesterday',
      status: 'read',
      type: 'text',
    },
  },
];

export const mockMessages: Message[] = [
  { id: 'msg1', chatId: 'c1', senderId: 'u1', text: 'Hey! Are you coming today?', timestamp: '10:24 AM', status: 'read', type: 'text' },
  { id: 'msg2', chatId: 'c1', senderId: 'u0', text: 'I miss you already 🥺', timestamp: '10:26 AM', status: 'read', type: 'text' },
  { id: 'msg3', chatId: 'c1', senderId: 'u0', text: 'Yes baby, I\'m on my way now 🚗', timestamp: '10:24 AM', status: 'read', type: 'text' },
  { id: 'msg4', chatId: 'c1', senderId: 'u0', text: 'Just finishing some work.', timestamp: '10:26 AM', status: 'read', type: 'text' },
  { id: 'msg5', chatId: 'c1', senderId: 'u0', text: 'Will be there in 30 minutes. ❤️', timestamp: '10:29 AM', status: 'read', type: 'text' },
];

export type Call = {
  id: string;
  type: 'voice' | 'video';
  direction: 'incoming' | 'outgoing' | 'missed';
  caller: User;
  timestamp: string;
  duration?: string;
};

export const mockCalls: Call[] = [
  { id: 'call1', type: 'video', direction: 'incoming', caller: mockUsers[0], timestamp: '10:12 AM', duration: '12 min' },
  { id: 'call2', type: 'voice', direction: 'outgoing', caller: mockUsers[1], timestamp: 'Yesterday', duration: '8 min' },
  { id: 'call3', type: 'voice', direction: 'missed', caller: mockUsers[2], timestamp: 'Yesterday' },
];
