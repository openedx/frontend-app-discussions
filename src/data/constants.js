import { getConfig } from '@edx/frontend-platform';

export const API_BASE_URL = getConfig().LMS_BASE_URL;

export const RequestStatus = {
  IN_PROGRESS: 'in-progress',
  SUCCESSFUL: 'successful',
  FAILED: 'failed',
  DENIED: 'denied',
};

export const ThreadOrdering = {
  BY_LAST_ACTIVITY: 'sort_by_last_activity',
  BY_COMMENT_COUNT: 'sort_by_comment_count',
  BY_VOTE_COUNT: 'sort_by_vote_count',
};

export const ThreadView = {
  UNREAD: 'unread',
  UNANSWERED: 'unanswered',
};

export const MyPostsFilter = {
  MY_POSTS: 'my_posts',
  MY_DISCUSSIONS: 'my_discussions',
  MY_QUESTIONS: 'my_questions',
};

export const AllPostsFilter = {
  ALL_POSTS: 'all_posts',
  ALL_DISCUSSIONS: 'all_discussions',
  ALL_QUESTIONS: 'all_questions',
};

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
};
