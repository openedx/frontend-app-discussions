import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  all_posts: {
    id: 'discussions.posts.filter.all-posts',
    defaultMessage: 'All posts',
    description: 'Option in dropdown to filter to all posts',
  },
  all_discussions: {
    id: 'discussions.posts.filter.all-discussions',
    defaultMessage: 'All discussions',
    description: 'Option in dropdown to filter to all discussions',
  },
  all_questions: {
    id: 'discussions.posts.filter.all-questions',
    defaultMessage: 'All questions',
    description: 'Option in dropdown to filter to all questions',
  },
  filter_by: {
    id: 'discussions.posts.filter.message',
    defaultMessage: 'Status: {filterBy}',
    description: 'Display text used to indicate what post status is being filtered',
  },
  filter_all: {
    id: 'discussions.posts.status.filter.all',
    defaultMessage: 'All',
    description: 'Option in dropdown to filter to all post statuses',
  },
  filter_unread: {
    id: 'discussions.posts.status.filter.unread',
    defaultMessage: 'Unread',
    description: 'Option in dropdown to filter to unread posts',
  },
  filter_following: {
    id: 'discussions.posts.status.filter.following',
    defaultMessage: 'Following',
    description: 'Option in dropdown to filter to followed posts',
  },
  filter_flagged: {
    id: 'discussions.posts.status.filter.flagged',
    defaultMessage: 'Flagged',
    description: 'Option in dropdown to filter to flagged posts',
  },
  my_posts: {
    id: 'discussions.posts.filter.my-posts',
    defaultMessage: 'My posts',
    description: 'Option in dropdown to filter to all a user\'s posts',
  },
  my_discussions: {
    id: 'discussions.posts.filter.my-discussions',
    defaultMessage: 'My discussions',
    description: 'Option in dropdown to filter to all a user\'s discussions',
  },
  my_questions: {
    id: 'discussions.posts.filter.my-questions',
    defaultMessage: 'My questions',
    description: 'Option in dropdown to filter to all a user\'s questions',
  },
  sorted_by: {
    id: 'discussions.posts.sort.message',
    defaultMessage: 'Sorted by {sortBy}',
    description: 'Display text used to indicate how posts are sorted',
  },
  sort_by_last_activity: {
    id: 'discussions.posts.sort.last-activity',
    defaultMessage: 'Recent activity',
    description: 'Option in dropdown to sort posts by recent activity',
  },
  sort_by_comment_count: {
    id: 'discussions.posts.sort.comment-count',
    defaultMessage: 'Most activity',
    description: 'Option in dropdown to sort posts by most activity',
  },
  sort_by_vote_count: {
    id: 'discussions.posts.sort.vote-count',
    defaultMessage: 'Most votes',
    description: 'Option in dropdown to sort posts by most votes',
  },
});

export default messages;
