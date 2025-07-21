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
  deletePostsTitle: {
    id: 'discussions.learner.deletePosts.title',
    defaultMessage: 'Are you sure you want to delete this user\'s discussion contributions?',
    description: 'Title for delete course posts confirmation dialog',
  },
  deleteCoursePosts: {
    id: 'discussions.learner.actions.deleteCoursePosts',
    defaultMessage: 'Delete user posts within this course',
    description: 'Action to delete user posts within a specific course',
  },
  deleteCoursePostsDescription: {
    id: 'discussions.learner.deleteCoursePosts.description',
    defaultMessage: 'You are about to delete {count} discussion contributions by this user in this course. This includes all discussion threads, responses, and comments authored by them. ',
    description: 'Description for delete course posts confirmation dialog',
  },
  deleteOrgPosts: {
    id: 'discussions.learner.actions.deleteOrgPosts',
    defaultMessage: 'Delete user posts within this organization',
    description: 'Action to delete user posts within the organization',
  },
  deleteOrgPostsDescription: {
    id: 'discussions.learner.deleteOrgPosts.description',
    defaultMessage: 'You are about to delete {count} discussion contributions by this user across the organization. This includes all discussion threads, responses, and comments authored by them. ',
    description: 'Description for delete organization posts confirmation dialog',
  },
  deletePostsConfirm: {
    id: 'discussions.learner.deleteOrgPosts.confirm',
    defaultMessage: 'Delete',
    description: 'Confirm button text for delete organization posts',
  },
  deletePostsBoldDescription: {
    id: 'discussions.learner.deletePosts.boldDescription',
    defaultMessage: 'This action cannot be undone.',
    description: 'Bold disclaimer description for delete confirmation dialog',
  },
});

export default messages;
