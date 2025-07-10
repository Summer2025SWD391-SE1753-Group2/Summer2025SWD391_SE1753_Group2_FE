import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Reply, Trash2, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import type { Comment } from "@/types/comment";
import type { UserInfo } from "@/types/auth";

interface CommentItemProps {
  comment: Comment;
  depth: number;
  currentUser: UserInfo | null;
  onReply: (commentId: string, content: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  replyingTo: string | null;
  setReplyingTo: (commentId: string | null) => void;
  expandedComments: Set<string>;
  toggleExpandComment: (commentId: string) => void;
  deletingComments: Set<string>;
  formatDate: (dateString: string) => string;
  getInitials: (name: string) => string;
  showDeletedComments: boolean;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  depth,
  currentUser,
  onReply,
  onDelete,
  replyingTo,
  setReplyingTo,
  expandedComments,
  toggleExpandComment,
  deletingComments,
  formatDate,
  getInitials,
  showDeletedComments,
}) => {
  const [replyContent, setReplyContent] = useState("");
  const [isRepliesHidden, setIsRepliesHidden] = useState(false);

  const hasReplies = comment.replies && comment.replies.length > 0;
  const shouldCollapse = depth >= 3 && hasReplies;
  const isExpanded = expandedComments.has(comment.comment_id);
  const isDeleting = deletingComments.has(comment.comment_id);
  const isDeleted = comment.status === "deleted";

  // Check if comment has 2 or more replies for the hide button
  const hasTwoOrMoreReplies = comment.replies && comment.replies.length >= 2;

  // If comment is deleted and has no replies, hide it completely unless showDeletedComments is true
  if (isDeleted && !hasReplies && !showDeletedComments) {
    return null;
  }

  // Check if current user can delete this comment
  const canDelete =
    currentUser &&
    !isDeleted &&
    // Owner can delete their own comment
    (comment.account?.account_id === currentUser.account_id ||
      // Admin and moderator can delete any comment
      ["admin", "moderator"].includes(currentUser.role.role_name));

  const countNestedReplies = (comment: Comment): number => {
    if (!comment.replies || comment.replies.length === 0) return 0;
    return comment.replies.reduce(
      (count, reply) => count + 1 + countNestedReplies(reply),
      0
    );
  };

  const totalReplies = countNestedReplies(comment);

  const handleSubmitReply = async () => {
    if (!replyContent.trim()) return;

    try {
      await onReply(comment.comment_id, replyContent);
      setReplyContent("");
      setReplyingTo(null);
    } catch (error) {
      console.error("Error submitting reply:", error);
    }
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
    setReplyContent("");
  };

  const toggleRepliesVisibility = () => {
    setIsRepliesHidden(!isRepliesHidden);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-3">
        <Avatar className={`${depth > 0 ? "h-6 w-6" : "h-8 w-8"}`}>
          <AvatarImage
            src={comment.account?.avatar}
            alt={comment.account?.username || "User"}
          />
          <AvatarFallback className={depth > 0 ? "text-xs" : ""}>
            {getInitials(comment.account?.username || "User")}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          {isDeleted && hasReplies ? (
            /* Compact deleted comment with replies */
            <div className="bg-gray-50 rounded-lg p-3 mb-2">
              <div className="flex items-center gap-2">
                <p className="text-xs text-gray-600 italic">
                  Bình luận đã bị xóa • {formatDate(comment.created_at)}
                </p>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {totalReplies} phản hồi
                </span>
              </div>
            </div>
          ) : isDeleted && !hasReplies ? (
            /* This will be hidden by the return null logic above when showDeletedComments is false */
            <div className="bg-gray-50 rounded-lg p-3 mb-2">
              <div className="flex items-center gap-2">
                <p className="text-xs text-gray-600 italic">
                  Bình luận đã bị xóa • {formatDate(comment.created_at)}
                </p>
              </div>
            </div>
          ) : (
            /* Normal active comment */
            <div
              className={`rounded-lg p-3 transition-all duration-200 ${
                depth > 0 ? "bg-gray-50" : "bg-gray-100"
              } ${isDeleting ? "opacity-50" : ""}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <p
                  className={`font-medium ${
                    depth > 0
                      ? "text-xs text-gray-700"
                      : "text-sm text-gray-800"
                  }`}
                >
                  @{comment.account?.username || "user"}
                </p>
                <p className="text-xs text-gray-500">
                  {formatDate(comment.created_at)}
                </p>
                {canDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 ml-auto transition-colors"
                    onClick={() => onDelete(comment.comment_id)}
                    disabled={isDeleting}
                    title="Xóa bình luận"
                  >
                    {isDeleting ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                  </Button>
                )}
              </div>
              <p
                className={`leading-relaxed ${
                  depth > 0 ? "text-xs text-gray-600" : "text-sm text-gray-700"
                }`}
              >
                {comment.content}
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-2 mt-1 px-3">
            {!isDeleted && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors"
                onClick={() => setReplyingTo(comment.comment_id)}
                disabled={isDeleting}
              >
                <Reply className="h-3 w-3 mr-1" />
                Trả lời
              </Button>
            )}
            {shouldCollapse && totalReplies > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs text-gray-600 font-medium hover:text-gray-800 hover:bg-gray-100 transition-colors"
                onClick={() => toggleExpandComment(comment.comment_id)}
              >
                {isExpanded ? "Ẩn bớt comment" : `Xem ${totalReplies} comment`}
              </Button>
            )}
            {hasTwoOrMoreReplies && !shouldCollapse && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs text-gray-600 font-medium hover:text-gray-800 hover:bg-gray-100 flex items-center gap-1 transition-colors"
                onClick={toggleRepliesVisibility}
              >
                {isRepliesHidden ? (
                  <>
                    <ChevronDown className="h-3 w-3" />
                    <span>Hiện {comment.replies!.length} comment</span>
                  </>
                ) : (
                  <>
                    <ChevronUp className="h-3 w-3" />
                    <span>Ẩn {comment.replies!.length} comment</span>
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Reply form */}
          {replyingTo === comment.comment_id && (
            <div className="ml-3 mt-3 p-4 bg-gray-50 rounded-lg space-y-3">
              <Textarea
                placeholder={`Trả lời @${
                  comment.account?.username || "user"
                }...`}
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="min-h-16 text-sm bg-white"
                disabled={isDeleting}
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelReply}
                  className="text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                >
                  Hủy
                </Button>
                <Button
                  size="sm"
                  onClick={handleSubmitReply}
                  disabled={!replyContent.trim()}
                  className="bg-gray-700 hover:bg-gray-800 text-white disabled:bg-gray-300"
                >
                  Trả lời
                </Button>
              </div>
            </div>
          )}

          {/* Nested replies */}
          {hasReplies &&
            (!shouldCollapse || isExpanded) &&
            !isRepliesHidden && (
              <div className={`mt-3 space-y-2 ${depth < 2 ? "ml-6" : "ml-3"}`}>
                {comment.replies!.map((reply) => (
                  <CommentItem
                    key={reply.comment_id}
                    comment={reply}
                    depth={depth + 1}
                    currentUser={currentUser}
                    onReply={onReply}
                    onDelete={onDelete}
                    replyingTo={replyingTo}
                    setReplyingTo={setReplyingTo}
                    expandedComments={expandedComments}
                    toggleExpandComment={toggleExpandComment}
                    deletingComments={deletingComments}
                    formatDate={formatDate}
                    getInitials={getInitials}
                    showDeletedComments={showDeletedComments}
                  />
                ))}
              </div>
            )}
        </div>
      </div>
    </div>
  );
};
