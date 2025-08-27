"use server"

import type { Post, Reaction, Comment } from "./types"

// In-memory storage for demo purposes
const posts: Post[] = [
  {
    id: "1",
    content:
      "I've been struggling with grief after losing my grandmother last month. Some days are harder than others, but I'm trying to take it one day at a time. Thank you for providing this space.",
    tags: ["grief", "healing"],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    reactions: [
      { id: "r1", emoji: "❤️", createdAt: new Date().toISOString(), authorId: "demo-user-1" },
      { id: "r2", emoji: "🫂", createdAt: new Date().toISOString(), authorId: "demo-user-2" },
    ],
    reported: false,
    authorId: "demo-user-123456",
    comments: [
      {
        id: "c1",
        content:
          "I'm so sorry for your loss. Grief is such a difficult journey, but you're not alone. Take it one day at a time. 💙",
        authorId: "G-4821",
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        isAnonymous: true,
        reported: false,
      },
    ],
  },
  {
    id: "2",
    content:
      "Anxiety has been overwhelming lately. Work stress, family expectations, and just the general state of the world. Sometimes I feel like I can't breathe. But I'm here, and I'm trying.",
    tags: ["anxiety", "overwhelmed"],
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    reactions: [
      { id: "r3", emoji: "💪", createdAt: new Date().toISOString(), authorId: "demo-user-3" },
      { id: "r4", emoji: "🌟", createdAt: new Date().toISOString(), authorId: "demo-user-4" },
      { id: "r5", emoji: "❤️", createdAt: new Date().toISOString(), authorId: "demo-user-5" },
    ],
    reported: false,
    authorId: "demo-user-789012",
    comments: [
      {
        id: "c2",
        content:
          "I understand this feeling completely. You're doing great by acknowledging it and reaching out. Breathing exercises have helped me.",
        authorId: "G-7392",
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        isAnonymous: true,
        reported: false,
      },
    ],
  },
  {
    id: "3",
    content:
      "Today marks 6 months since I started therapy, and I wanted to share that it does get better. To anyone reading this who's struggling - you're stronger than you know. Keep going. 💙",
    tags: ["hope", "healing"],
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    reactions: [
      { id: "r6", emoji: "🌟", createdAt: new Date().toISOString(), authorId: "demo-user-6" },
      { id: "r7", emoji: "💪", createdAt: new Date().toISOString(), authorId: "demo-user-7" },
      { id: "r8", emoji: "❤️", createdAt: new Date().toISOString(), authorId: "demo-user-8" },
      { id: "r9", emoji: "✨", createdAt: new Date().toISOString(), authorId: "demo-user-9" },
    ],
    reported: false,
    authorId: "demo-user-345678",
    comments: [
      {
        id: "c3",
        content: "Thank you for sharing this hope! It's exactly what I needed to hear today.",
        authorId: "G-1857",
        createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        isAnonymous: true,
        reported: false,
      },
      {
        id: "c4",
        content: "6 months is amazing! I'm just starting my journey and this gives me hope.",
        authorId: "G-9234",
        createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        isAnonymous: true,
        reported: false,
      },
    ],
  },
]

// Generate anonymous ID for comments
function generateAnonymousId(): string {
  return `G-${Math.floor(1000 + Math.random() * 9000)}`
}

// Basic content moderation
function moderateContent(content: string): { isAllowed: boolean; reason?: string } {
  const flaggedWords = [
    "spam",
    "scam",
    "hate",
    "kill",
    "die",
    "stupid",
    "idiot",
    "loser",
    "shut up",
    "go away",
    "worthless",
    "pathetic",
    "disgusting",
  ]

  const lowerContent = content.toLowerCase()
  const containsFlaggedContent = flaggedWords.some((word) => lowerContent.includes(word))

  if (containsFlaggedContent) {
    return { isAllowed: false, reason: "Content contains inappropriate language" }
  }

  if (content.length > 500) {
    return { isAllowed: false, reason: "Comment is too long" }
  }

  return { isAllowed: true }
}

export async function getPosts(): Promise<Post[]> {
  try {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return posts
      .filter((post) => !post.reported)
      .slice()
      .reverse()
  } catch (error) {
    console.error("Error fetching posts:", error)
    return []
  }
}

export async function createPost(
  content: string,
  tags: string[],
  authorId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!content || content.trim().length === 0) {
      return { success: false, error: "Content cannot be empty" }
    }

    if (content.length > 1000) {
      return { success: false, error: "Content too long" }
    }

    const moderation = moderateContent(content)
    if (!moderation.isAllowed) {
      return { success: false, error: moderation.reason }
    }

    const newPost: Post = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      content: content.trim(),
      tags: tags.filter((tag) => tag.length > 0),
      createdAt: new Date().toISOString(),
      reactions: [],
      reported: false,
      authorId,
      isGuestPost: authorId.startsWith("G-"),
      comments: [],
    }

    posts.unshift(newPost)

    await new Promise((resolve) => setTimeout(resolve, 200))
    return { success: true }
  } catch (error) {
    console.error("Error creating post:", error)
    return { success: false, error: "Failed to create post" }
  }
}

export async function addComment(
  postId: string,
  content: string,
): Promise<{ success: boolean; error?: string; commentId?: string }> {
  try {
    if (!content || content.trim().length === 0) {
      return { success: false, error: "Comment cannot be empty" }
    }

    const moderation = moderateContent(content)
    if (!moderation.isAllowed) {
      return { success: false, error: moderation.reason }
    }

    const post = posts.find((p) => p.id === postId)
    if (!post) {
      return { success: false, error: "Post not found" }
    }

    const newComment: Comment = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      content: content.trim(),
      authorId: generateAnonymousId(),
      createdAt: new Date().toISOString(),
      isAnonymous: true,
      reported: false,
    }

    post.comments.push(newComment)

    await new Promise((resolve) => setTimeout(resolve, 200))
    return { success: true, commentId: newComment.id }
  } catch (error) {
    console.error("Error adding comment:", error)
    return { success: false, error: "Failed to add comment" }
  }
}

export async function addReaction(
  postId: string,
  emoji: string,
  authorId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const post = posts.find((p) => p.id === postId)
    if (!post) {
      return { success: false, error: "Post not found" }
    }

    const existingReaction = post.reactions.find((r) => r.emoji === emoji && r.authorId === authorId)
    if (existingReaction) {
      return { success: false, error: "Already reacted with this emoji" }
    }

    const newReaction: Reaction = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      emoji,
      createdAt: new Date().toISOString(),
      authorId,
    }

    post.reactions.push(newReaction)

    await new Promise((resolve) => setTimeout(resolve, 100))
    return { success: true }
  } catch (error) {
    console.error("Error adding reaction:", error)
    return { success: false, error: "Failed to add reaction" }
  }
}

export async function reportPost(postId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const post = posts.find((p) => p.id === postId)
    if (!post) {
      return { success: false, error: "Post not found" }
    }

    post.reported = true

    await new Promise((resolve) => setTimeout(resolve, 200))
    return { success: true }
  } catch (error) {
    console.error("Error reporting post:", error)
    return { success: false, error: "Failed to report post" }
  }
}

export async function reportComment(postId: string, commentId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const post = posts.find((p) => p.id === postId)
    if (!post) {
      return { success: false, error: "Post not found" }
    }

    const comment = post.comments.find((c) => c.id === commentId)
    if (!comment) {
      return { success: false, error: "Comment not found" }
    }

    comment.reported = true

    await new Promise((resolve) => setTimeout(resolve, 200))
    return { success: true }
  } catch (error) {
    console.error("Error reporting comment:", error)
    return { success: false, error: "Failed to report comment" }
  }
}

export async function getUserDisplayName(authorId: string, numericId?: number): Promise<string> {
  // Simulate async operation
  await new Promise((resolve) => setTimeout(resolve, 10))

  if (authorId.startsWith("G-")) {
    return authorId
  }
  if (numericId) {
    return `User #${numericId}`
  }
  return "Anonymous User"
}
