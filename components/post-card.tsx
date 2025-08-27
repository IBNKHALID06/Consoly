"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Heart, Flag, Clock, Hash, MessageCircle, Send, ChevronDown, ChevronUp, Lock } from "lucide-react"
import { addReaction, reportPost, addComment, reportComment, getUserDisplayName } from "@/lib/actions"
import type { Post, User } from "@/lib/types"

const SUPPORTIVE_REACTIONS = [
  { emoji: "❤️", label: "Love" },
  { emoji: "🫂", label: "Hug" },
  { emoji: "💪", label: "Strength" },
  { emoji: "🌟", label: "Hope" },
  { emoji: "🙏", label: "Prayer" },
  { emoji: "✨", label: "Support" },
]

const EMOTION_TAG_COLORS: Record<string, string> = {
  grief: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
  anxiety: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  loneliness: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  anger: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  hope: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  betrayal: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  healing: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  overwhelmed: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
}

interface PostCardProps {
  post: Post
  currentUser: User | null
  onUpdate: () => void
}

export function PostCard({ post, currentUser, onUpdate }: PostCardProps) {
  const [showReactions, setShowReactions] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [isReporting, setIsReporting] = useState(false)
  const [reported, setReported] = useState(false)
  const [authorDisplay, setAuthorDisplay] = useState<string>("Loading...")

  const canInteract = currentUser && !currentUser.isGuest && currentUser.isAuthenticated
  const canComment = canInteract

  const handleReaction = async (emoji: string) => {
    if (!canInteract) return

    try {
      const result = await addReaction(post.id, emoji, currentUser.id)
      if (result.success) {
        onUpdate()
        setShowReactions(false)
      } else {
        console.error("Failed to add reaction:", result.error)
      }
    } catch (error) {
      console.error("Failed to add reaction:", error)
    }
  }

  const handleReport = async () => {
    if (!canInteract) return

    setIsReporting(true)
    try {
      const result = await reportPost(post.id)
      if (result.success) {
        setReported(true)
      } else {
        console.error("Failed to report post:", result.error)
      }
    } catch (error) {
      console.error("Failed to report post:", error)
    } finally {
      setIsReporting(false)
    }
  }

  const handleCommentSubmit = async () => {
    if (!newComment.trim() || !canComment) return

    setIsSubmittingComment(true)
    try {
      const result = await addComment(post.id, newComment)
      if (result.success) {
        setNewComment("")
        onUpdate()
      } else {
        console.error("Failed to add comment:", result.error)
      }
    } catch (error) {
      console.error("Failed to add comment:", error)
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleCommentReport = async (commentId: string) => {
    if (!canInteract) return

    try {
      const result = await reportComment(post.id, commentId)
      if (result.success) {
        onUpdate()
      } else {
        console.error("Failed to report comment:", result.error)
      }
    } catch (error) {
      console.error("Failed to report comment:", error)
    }
  }

  const formatTimeAgo = (date: string) => {
    const now = new Date()
    const postDate = new Date(date)
    const diffInHours = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    return `${Math.floor(diffInHours / 24)}d ago`
  }

  const getAuthorDisplay = async () => {
    if (post.isGuestPost) {
      return post.authorId
    }
    const match = post.authorId.match(/(\d{6})/)
    if (match) {
      return await getUserDisplayName(post.authorId, Number.parseInt(match[1]))
    }
    return await getUserDisplayName(post.authorId)
  }

  useEffect(() => {
    const loadAuthorDisplay = async () => {
      const display = await getAuthorDisplay()
      setAuthorDisplay(display)
    }
    loadAuthorDisplay()
  }, [post.authorId, post.isGuestPost])

  const visibleComments = post.comments.filter((comment) => !comment.reported)

  return (
    <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm border-l-4 border-l-indigo-400 hover:shadow-lg transition-all">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>{formatTimeAgo(post.createdAt)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Hash className="h-4 w-4" />
              <span>{authorDisplay}</span>
            </div>
          </div>

          <p className="text-foreground leading-relaxed whitespace-pre-wrap">{post.content}</p>

          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge
                  key={tag}
                  className={`text-xs ${EMOTION_TAG_COLORS[tag] || "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"}`}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex flex-col space-y-4 pt-0">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReactions(!showReactions)}
                className="flex items-center space-x-2 hover:bg-indigo-50 dark:hover:bg-indigo-950"
                disabled={!canInteract}
              >
                <Heart className="h-4 w-4" />
                <span>Support ({post.reactions.length})</span>
                {!canInteract && <Lock className="h-3 w-3 ml-1" />}
              </Button>

              {showReactions && canInteract && (
                <div className="absolute top-full left-0 mt-2 p-3 bg-white dark:bg-slate-800 rounded-lg shadow-lg border z-10">
                  <div className="grid grid-cols-3 gap-2">
                    {SUPPORTIVE_REACTIONS.map((reaction) => (
                      <Button
                        key={reaction.emoji}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReaction(reaction.emoji)}
                        className="flex flex-col items-center space-y-1 h-auto py-2"
                      >
                        <span className="text-lg">{reaction.emoji}</span>
                        <span className="text-xs">{reaction.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-2 hover:bg-blue-50 dark:hover:bg-blue-950"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Comments ({visibleComments.length})</span>
              {showComments ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </Button>

            {post.reactions.length > 0 && (
              <div className="flex items-center space-x-1">
                {Object.entries(
                  post.reactions.reduce(
                    (acc, reaction) => {
                      acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1
                      return acc
                    },
                    {} as Record<string, number>,
                  ),
                ).map(([emoji, count]) => (
                  <span key={emoji} className="text-sm flex items-center space-x-1">
                    <span>{emoji}</span>
                    <span className="text-muted-foreground">{count}</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleReport}
            disabled={isReporting || reported || !canInteract}
            className="text-muted-foreground hover:text-red-600"
          >
            <Flag className="h-4 w-4 mr-1" />
            {reported ? "Reported" : "Report"}
            {!canInteract && <Lock className="h-3 w-3 ml-1" />}
          </Button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="w-full space-y-4 border-t pt-4">
            {/* Add Comment Form - Only for authenticated users */}
            {canComment ? (
              <div className="space-y-2">
                <Textarea
                  placeholder="Share a supportive message anonymously..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[80px] resize-none"
                  maxLength={500}
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{newComment.length}/500 characters</span>
                  <Button
                    onClick={handleCommentSubmit}
                    disabled={!newComment.trim() || isSubmittingComment}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="h-3 w-3 mr-2" />
                    {isSubmittingComment ? "Posting..." : "Post Anonymously"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                  <Lock className="h-4 w-4" />
                  <span className="text-sm">
                    {currentUser?.isGuest
                      ? "Create an account to comment and support others"
                      : "Log in to comment and support others"}
                  </span>
                </div>
              </div>
            )}

            {/* Comments List */}
            {visibleComments.length > 0 && (
              <div className="space-y-3">
                {visibleComments.map((comment) => (
                  <div key={comment.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Hash className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs font-medium text-muted-foreground">{comment.authorId}</span>
                          <span className="text-xs text-muted-foreground">{formatTimeAgo(comment.createdAt)}</span>
                        </div>
                        <p className="text-sm text-foreground leading-relaxed">{comment.content}</p>
                      </div>
                      {canInteract && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCommentReport(comment.id)}
                          className="text-muted-foreground hover:text-red-600 ml-2"
                        >
                          <Flag className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {visibleComments.length === 0 && (
              <p className="text-center text-muted-foreground text-sm py-4">
                No comments yet. {canComment ? "Be the first to share some support!" : ""}
              </p>
            )}
          </div>
        )}
      </CardFooter>

      {reported && (
        <Alert className="mx-6 mb-4 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <AlertDescription className="text-green-800 dark:text-green-200">
            Thank you for helping keep our community safe. This post has been reported for review.
          </AlertDescription>
        </Alert>
      )}
    </Card>
  )
}
