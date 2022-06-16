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
  back: {
    id: 'discussions.learner.back',
    defaultMessage: 'Back',
    description: 'Text on button for back to learners list',
  },
  activityForLearner: {
    id: 'discussions.learner.activityForLearner',
    defaultMessage: 'Activity for {username}',
    description: 'Text for learners post header',
  },
  mostActivity: {
    id: 'discussions.learner.mostActivity',
    defaultMessage: 'Most activity',
    description: 'Text for learners sorting by most activity',
  },
  reportedActivity: {
    id: 'discussions.learner.reportedActivity',
    defaultMessage: 'Reported activity',
    description: 'Text for learners sorting by reported activity',
  },
  sortFilterStatus: {
    id: 'discussions.learner.sortFilterStatus',
    defaultMessage: `All learners by {sort, select,
      flagged {reported activity}
      activity {most activity}
    }`,
    description: 'Text for current selected learners filter',
  },
});

export default messages;
