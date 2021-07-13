import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  allPosts: {
    id: 'discussions.posts.filter.all-posts',
    defaultMessage: 'All posts',
    description: 'Option in dropdown to filter to all posts',
  },
  allDiscussions: {
    id: 'discussions.posts.filter.all-discussions',
    defaultMessage: 'All discussions',
    description: 'Option in dropdown to filter to all discussions',
  },
  allQuestions: {
    id: 'discussions.posts.filter.all-questions',
    defaultMessage: 'All questions',
    description: 'Option in dropdown to filter to all questions',
  },
  filterBy: {
    id: 'discussions.posts.filter.message',
    defaultMessage: 'Status: {filterBy}',
    description: 'Display text used to indicate what post status is being filtered',
  },
  filterAll: {
    id: 'discussions.posts.status.filter.all',
    defaultMessage: 'All',
    description: 'Option in dropdown to filter to all post statuses',
  },
  filterUnread: {
    id: 'discussions.posts.status.filter.unread',
    defaultMessage: 'Unread',
    description: 'Option in dropdown to filter to unread posts',
  },
  filterFollowing: {
    id: 'discussions.posts.status.filter.following',
    defaultMessage: 'Following',
    description: 'Option in dropdown to filter to followed posts',
  },
  filterFlagged: {
    id: 'discussions.posts.status.filter.flagged',
    defaultMessage: 'Flagged',
    description: 'Option in dropdown to filter to flagged posts',
  },
  myPosts: {
    id: 'discussions.posts.filter.my-posts',
    defaultMessage: 'My posts',
    description: 'Option in dropdown to filter to all a user\'s posts',
  },
  myDiscussions: {
    id: 'discussions.posts.filter.my-discussions',
    defaultMessage: 'My discussions',
    description: 'Option in dropdown to filter to all a user\'s discussions',
  },
  myQuestions: {
    id: 'discussions.posts.filter.my-questions',
    defaultMessage: 'My questions',
    description: 'Option in dropdown to filter to all a user\'s questions',
  },
  sortedBy: {
    id: 'discussions.posts.sort.message',
    defaultMessage: 'Sorted by {sortBy}',
    description: 'Display text used to indicate how posts are sorted',
  },
  lastActivityAt: {
    id: 'discussions.posts.sort.last-activity',
    defaultMessage: 'Recent activity',
    description: 'Option in dropdown to sort posts by recent activity',
  },
  commentCount: {
    id: 'discussions.posts.sort.comment-count',
    defaultMessage: 'Most activity',
    description: 'Option in dropdown to sort posts by most activity',
  },
  voteCount: {
    id: 'discussions.posts.sort.vote-count',
    defaultMessage: 'Most votes',
    description: 'Option in dropdown to sort posts by most votes',
  },
});

export default messages;
