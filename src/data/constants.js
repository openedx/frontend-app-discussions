import { getConfig } from '@edx/frontend-platform';

export const API_BASE_URL = getConfig().LMS_BASE_URL;

/**
 * Enum for request status.
 * @readonly
 * @enum {string}
 */
export const RequestStatus = {
  IN_PROGRESS: 'in-progress',
  SUCCESSFUL: 'successful',
  FAILED: 'failed',
  DENIED: 'denied',
};

/**
 * Enum for thread ordering.
 * @readonly
 * @enum {string}
 */
export const ThreadOrdering = {
  BY_LAST_ACTIVITY: 'lastActivityAt',
  BY_COMMENT_COUNT: 'commentCount',
  BY_VOTE_COUNT: 'voteCount',
};

/**
 * Enum for thread view status filtering.
 * @readonly
 * @enum {string}
 */
export const ThreadViewStatus = {
  UNREAD: 'unread',
  UNANSWERED: 'unanswered',
};

/**
 * Enum for filtering user posts.
 * @readonly
 * @enum {string}
 */
export const MyPostsFilter = {
  MY_POSTS: 'myPosts',
  MY_DISCUSSIONS: 'myDiscussions',
  MY_QUESTIONS: 'myQuestions',
};

/**
 * Enum for filtering posts by status.
 * @readonly
 * @enum {string}
 */
export const PostsStatusFilter = {
  ALL: 'filterAll',
  UNREAD: 'filterUnread',
  FOLLOWING: 'filterFollowing',
  FLAGGED: 'filterFlagged',
};

/**
 * Enum for filtering all posts.
 * @readonly
 * @enum {string}
 */
export const AllPostsFilter = {
  ALL_POSTS: 'allPosts',
  ALL_DISCUSSIONS: 'allDiscussions',
  ALL_QUESTIONS: 'allQuestions',
};

/**
 * Enum for filtering topics.
 * @readonly
 * @enum {string}
 */
export const TopicsFilter = {
  ALL: 'allTopics',
  COURSE_SECTION: 'courseSectionTopics',
  GENERAL: 'generalTopics',
};

export const TopicOrdering = {
  BY_COURSE_STRUCTURE: 'sortByCourseStructure',
  BY_LAST_ACTIVITY: 'sortByLastActivity',
  BY_COMMENT_COUNT: 'sortByCommentCount',
};

export const Routes = {
  DISCUSSIONS: {
    PATH: '/discussions/:courseId?',
  },
  POSTS: {
    PATH: '/discussions/:courseId/topics/:topicId/posts',
    MY_POSTS: '/discussions/:courseId/posts/mine',
    ALL_POSTS: '/discussions/:courseId/posts/all',
  },
  COMMENTS: {
    PATH: '/discussions/:courseId/topics/:topicId/posts/:postId',
  },
  TOPICS: {
    PATH: '/discussions/:courseId/topics/:category?',
    ALL: '/discussions/:courseId/topics',
    CATEGORY: '/discussions/:courseId/topics/:category',
  },
};
