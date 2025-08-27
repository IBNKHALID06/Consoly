export interface Post {
  id: string
  content: string
  tags: string[]
  createdAt: string
  reactions: Reaction[]
  reported: boolean
  authorId: string
  isGuestPost?: boolean
  comments: Comment[]
}

export interface Reaction {
  id: string
  emoji: string
  createdAt: string
  authorId: string
}

export interface Comment {
  id: string
  content: string
  authorId: string
  createdAt: string
  isAnonymous: boolean
  reported: boolean
}

export interface User {
  id: string
  numericId: number
  isGuest: boolean
  sessionId?: string
  email?: string
  hashedPassword?: string
  isAuthenticated: boolean
  createdAt: string
  friends: string[]
  blockedUsers: string[]
}

export interface FriendRequest {
  id: string
  fromUserId: string
  toUserId: string
  status: "pending" | "accepted" | "rejected"
  createdAt: string
}

export interface AuthCredentials {
  email: string
  password: string
}
