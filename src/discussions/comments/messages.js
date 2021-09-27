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
  loadMoreComments: {
    id: 'discussions.comments.comment.loadMoreComments',
    defaultMessage: 'Load more comments',
    description: 'Button to load more comments of forum posts',
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
    } posted {relativeTime} by`,
    description: 'Timestamp for when a user posted the message followed by username. The relative time is already translated.',
  },
  commentTime: {
    id: 'discussions.comments.comment.commentTime',
    defaultMessage: 'Posted {relativeTime}',
    description: 'Message about how long ago a comment was posted. Appears as "username posted 7 minutes ago"',
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
  },
  cancel: {
    id: 'discussions.editor.cancel',
    defaultMessage: 'Cancel',
  },
});

export default messages;
