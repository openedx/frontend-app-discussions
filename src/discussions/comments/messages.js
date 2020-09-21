import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  submit: {
    id: 'discussions.comments.comment.submit',
    defaultMessage: 'Submit',
    description: 'Button to add a response in a thread of forum posts',
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
  replyTime: {
    id: 'discussions.comments.comment.repliedTime',
    defaultMessage: 'posted {relativeTime}',
    description: 'Message about hwo long ago a reply was posted. Appears as "username posted 7 minutes ago"',
  },
});

export default messages;
