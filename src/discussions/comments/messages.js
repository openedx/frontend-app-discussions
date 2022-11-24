import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  addResponse: {
    id: 'discussions.comments.comment.addResponse',
    defaultMessage: 'Add a response',
    description: 'Button to add a response in a thread of forum posts',
  },
  addComment: {
    id: 'discussions.comments.comment.addComment',
    defaultMessage: 'Add a comment',
    description: 'Button to add a comment to a response',
  },
  abuseFlaggedMessage: {
    id: 'discussions.comments.comment.abuseFlaggedMessage',
    defaultMessage: 'Content reported for staff to review',
    description: 'Alert banner over comment that has been reported for abuse',
  },
  backAlt: {
    id: 'discussions.actions.back.alt',
    defaultMessage: 'Back to list',
    description: 'Back to Posts list button text',
  },
  responseCount: {
    id: 'discussions.comments.comment.responseCount',
    defaultMessage: `{num, plural,
      =0 {No responses}
      one {Showing # response}
      other {Showing # responses}
    }`,
  },
  endorsedResponseCount: {
    id: 'discussions.comments.comment.endorsedResponseCount',
    defaultMessage: `{num, plural,
      =0 {No endorsed responses}
      one {Showing # endorsed response}
      other {Showing # endorsed responses}
    }`,
  },
  loadMoreComments: {
    id: 'discussions.comments.comment.loadMoreComments',
    defaultMessage: 'Load more comments',
    description: 'Button to load more comments on responses',
  },
  loadMoreResponses: {
    id: 'discussions.comments.comment.loadMoreResponses',
    defaultMessage: 'Load more responses',
    description: 'Button to load more responses of forum posts',
  },
  postVisibility: {
    id: 'discussions.comments.comment.visibility',
    defaultMessage: `This post is visible to {group, select,
         null {Everyone}
         other {{group}}
    }.`,
    description: 'Message on comment mentioning the group a particular post is visible to',
  },
  postTime: {
    id: 'discussions.comments.comment.postedTime',
    defaultMessage: `{postType, select,
      discussion {Discussion}
      question {Question}
      other {{postType}}
    } posted {relativeTime} by`,
    description: 'Timestamp for when a user posted the message followed by username. The relative time is already translated.',
  },
  commentTime: {
    id: 'discussions.comments.comment.commentTime',
    defaultMessage: 'Posted {relativeTime}',
    description: 'Message about how long ago a comment was posted. Appears as "username posted 7 minutes ago"',
  },
  answer: {
    id: 'discussions.comments.comment.answer',
    defaultMessage: 'Answer',
    description: 'Message above a comment that has been marked as the answer.',
  },
  answeredLabel: {
    id: 'discussions.comments.comment.answeredlabel',
    defaultMessage: 'Marked as answered by',
    description: 'Message above a comment that has been marked as answered. Appears as "Marked as answered by Username"',
  },
  endorsed: {
    id: 'discussions.comments.comment.endorsed',
    defaultMessage: 'Endorsed',
    description: 'Message above a comment that has been endorsed.',
  },
  endorsedLabel: {
    id: 'discussions.comments.comment.endorsedlabel',
    defaultMessage: 'Endorsed by',
    description: 'Message above a comment that has been endorsed. Appears as "Endorsed by Username"',
  },
  actionsAlt: {
    id: 'discussions.actions.label',
    defaultMessage: 'Actions menu',
    description: 'Button to see actions for a post or comment',
  },
  editAction: {
    id: 'discussions.actions.edit',
    defaultMessage: 'Edit',
    description: 'Action to edit a comment or post',
  },
  pinAction: {
    id: 'discussions.actions.pin',
    defaultMessage: 'Pin',
    description: 'Action to pin a post',
  },
  deleteAction: {
    id: 'discussions.actions.delete',
    defaultMessage: 'Delete',
    description: 'Action to delete a post or comment',
  },
  submit: {
    id: 'discussions.editor.submit',
    defaultMessage: 'Submit',
    description: 'Button to submit a response or comment',
  },
  submitting: {
    id: 'discussions.editor.submitting',
    defaultMessage: 'Submitting',
  },
  cancel: {
    id: 'discussions.editor.cancel',
    defaultMessage: 'Cancel',
    description: 'Button to cancel posting a response or comment',
  },
  commentError: {
    id: 'discussions.editor.error.empty',
    defaultMessage: 'Post content cannot be empty.',
    description: 'Error message displayed when post content is left empty',
  },
  deleteResponseTitle: {
    id: 'discussions.editor.delete.response.title',
    defaultMessage: 'Delete response',
    description: 'Title of confirmation dialog shown when deleting a response',
  },
  deleteResponseDescription: {
    id: 'discussions.editor.delete.response.description',
    defaultMessage: 'Are you sure you want to permanently delete this response?',
    description: 'Text displayed in confirmation dialog when deleting a response',
  },
  deleteCommentTitle: {
    id: 'discussions.editor.delete.comment.title',
    defaultMessage: 'Delete comment',
    description: 'Title of confirmation dialog shown when deleting a comment',
  },
  deleteCommentDescription: {
    id: 'discussions.editor.delete.comment.description',
    defaultMessage: 'Are you sure you want to permanently delete this comment?',
    description: 'Text displayed in confirmation dialog when deleting a comment',
  },
  editReasonCode: {
    id: 'discussions.editor.comments.editReasonCode',
    defaultMessage: 'Reason for editing',
    description: 'Label for field visible to moderators that allows them to select a reason for editing another user\'s response',
  },
  editReasonCodeError: {
    id: 'discussions.editor.posts.editReasonCode.error',
    defaultMessage: 'Select reason for editing',
    description: 'Error message visible to moderators when they submit the post/response/comment without select reason for editing',
  },
  editedBy: {
    id: 'discussions.comment.comments.editedBy',
    defaultMessage: 'Edited by',
    description: 'Text shown to users to indicate who edited a post. Followed by the username of editor.',
  },
  reason: {
    id: 'discussions.comment.comments.reason',
    defaultMessage: 'Reason',
    description: 'Text shown to users to indicate why a post was edited, followed by a reason.',
  },
  closedBy: {
    id: 'discussions.post.closedBy',
    defaultMessage: 'Post closed by',
  },
  replies: {
    id: 'discussion.comment.repliesHeading',
    defaultMessage: '{count} replies for the response added',
    description: 'Text added for screen reader to understand nesting replies.',
  },
  time: {
    id: 'discussion.comment.time',
    defaultMessage: '{time} ago',
    description: 'Time text for endorse banner',
  },
  noThreadFound: {
    id: 'discussion.thread.notFound',
    defaultMessage: 'Thread not found',
    description: 'message to show on screen if the request thread is not found in course',
  },
});

export default messages;
