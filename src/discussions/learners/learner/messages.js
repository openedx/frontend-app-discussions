import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  reported: {
    id: 'discussions.learner.reported',
    defaultMessage: '{reported} reported',
  },
  previouslyReported: {
    id: 'discussions.learner.previouslyReported',
    defaultMessage: '{previouslyReported} previously reported',
  },
  lastActive: {
    id: 'discussions.learner.lastLogin',
    defaultMessage: 'Last active {lastActiveTime}',
  },
  loadMorePosts: {
    id: 'discussions.learner.loadMostPosts',
    defaultMessage: 'Load more posts',
    description: 'Text on button for loading more posts by a user',
  },
});

export default messages;
