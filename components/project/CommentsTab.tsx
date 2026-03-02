import type { Comment } from '@/lib/types'
import CommentThread from './CommentThread'

export default function CommentsTab({
  projectId,
  comments,
}: {
  projectId: string
  comments: Comment[]
}) {
  return <CommentThread projectId={projectId} comments={comments} />
}
