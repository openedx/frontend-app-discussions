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
  loadMore: {
    id: 'discussions.learner.loadMostLearners',
    defaultMessage: 'Load more',
    description: 'Text on button for loading more learners',
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
  recentActivity: {
    id: 'discussions.learner.recentActivity',
    defaultMessage: 'Recent activity',
    description: 'Text for learners sorting by recent activity',
  },
  sortFilterStatus: {
    id: 'discussions.learner.sortFilterStatus',
    defaultMessage: `All learners sorted by {sort, select,
      flagged {reported activity}
      activity {most activity}
      other {{sort}}
    }`,
    description: 'Text for current selected learners filter',
  },
  allActivity: {
    id: 'discussion.learner.allActivity',
    defaultMessage: 'All activity',
    description: 'Tooltip text for all activity icon',
  },
  posts: {
    id: 'discussion.learner.posts',
    defaultMessage: 'Posts',
    description: 'Tooltip text for all posts icon',
  },
});

export default messages;
