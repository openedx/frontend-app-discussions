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
  BY_LAST_ACTIVITY: 'sort_by_last_activity',
  BY_COMMENT_COUNT: 'sort_by_comment_count',
  BY_VOTE_COUNT: 'sort_by_vote_count',
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
  MY_POSTS: 'my_posts',
  MY_DISCUSSIONS: 'my_discussions',
  MY_QUESTIONS: 'my_questions',
};

/**
 * Enum for filtering all posts.
 * @readonly
 * @enum {string}
 */
export const AllPostsFilter = {
  ALL_POSTS: 'all_posts',
  ALL_DISCUSSIONS: 'all_discussions',
  ALL_QUESTIONS: 'all_questions',
};

/**
 * Enum for filtering topics.
 * @readonly
 * @enum {string}
 */
export const TopicsFilter = {
  ALL: 'all_topics',
  COURSE_SECTION: 'course_section_topics',
  GENERAL: 'general_topics',
};

export const Routes = {
  TOPICS: {
    PATH: '/discussions/:courseId/topics',
    ALL: '/discussions/:courseId/topics',
  },
  POSTS: {
    PATH: '/discussions/:courseId/posts/:topicId/:threadId?',
    MY_POSTS: '/discussions/:courseId/posts/mine',
    ALL_POSTS: '/discussions/:courseId/posts/all',
  },
  COMMENTS: {
    PATH: '/discussions/:courseId/posts/:topicId/:threadId',
  },
};
