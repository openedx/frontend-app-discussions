import { getConfig } from '@edx/frontend-platform';

export const API_BASE_URL = getConfig().LMS_BASE_URL;

export const LoadingStatus = {
  LOADING: 'loading',
  LOADED: 'loaded',
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
    PATH: '/courses/:courseId/discussion/forum',
  },
  POSTS: {
    PATH: '/courses/:courseId/discussion/forum/:discussionId/threads/:threadId?',
  },
};
