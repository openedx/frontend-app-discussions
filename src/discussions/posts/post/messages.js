import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  lastResponse: {
    id: 'discussions.post.last-response',
    defaultMessage: 'Last response {time}',
  },
  postedOn: {
    id: 'discussions.post.posted-on',
    defaultMessage: 'Posted {time} by {author} {authorLabel}',
  },
  contentReported: {
    id: 'discussions.post.content-reported',
    defaultMessage: 'Content reported for staff review',
  },
  follow: {
    id: 'discussions.post.follow',
    defaultMessage: 'Follow',
    description: 'Tooltip/alttext for button to follow a discussion post',
  },
  unfollow: {
    id: 'discussions.post.unfollow',
    defaultMessage: 'Unfollow',
    description: 'Tooltip/alttext for button to unfollow a discussion post',
  },
  like: {
    id: 'discussions.post.like',
    defaultMessage: 'Like',
    description: 'Tooltip/alttext for button to like a discussion post',
  },
  removeLike: {
    id: 'discussions.post.remove-like',
    defaultMessage: 'Remove like',
    description: 'Tooltip/alttext for button to remove the like applied to a discussion post',
  },
});

export default messages;
