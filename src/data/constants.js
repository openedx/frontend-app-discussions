import { getConfig } from '@edx/frontend-platform';

export const API_BASE_URL = getConfig().LMS_BASE_URL;

export const LoadingStatus = {
  LOADING: 'loading',
  LOADED: 'loaded',
  FAILED: 'failed',
  DENIED: 'denied',
};

export const PostOrdering = {
  BY_LAST_ACTIVITY: 'sort_by_last_activity',
  BY_COMMENT_COUNT: 'sort_by_comment_count',
  BY_VOTE_COUNT: 'sort_by_vote_count',
};

export const TopicOrdering = {
  BY_COURSE_STRUCTURE: 'sort_by_course_structure',
  BY_LAST_ACTIVITY: 'sort_by_last_activity',
  BY_COMMENT_COUNT: 'sort_by_comment_count',
};

export const PostView = {
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

export const PostsStatusFilter = {
  ALL: 'filter_all',
  UNREAD: 'filter_unread',
  FOLLOWING: 'filter_following',
  FLAGGED: 'filter_flagged',
};

export const TopicsFilter = {
  ALL: 'all_topics',
  COURSE_SECTION: 'course_section_topics',
  GENERAL: 'general_topics',
};

export const Routes = {
  COMMENTS: {
    PATH: '/:courseId/:embed(embed)?/:view(discussion|topic|post)/posts/:postId',
  },
  VIEWS: {
    ALL: '/:courseId/:embed(embed)?/:view(discussion|topic|post)',
    DISCUSSION: '/:courseId/:embed(embed)?/:view(discussion)',
    TOPIC: '/:courseId/:embed(embed)?/:view(topic)',
    POST: '/:courseId/:embed(embed)?/:view(post)',
  },
  EMBED: {
    PATH: '/:courseId/:embed(embed)/:view(discussion|topic|post)',
  },
  POSTS: {
    PATH: '/:courseId/:embed(embed)?/:view(discussion|topic)/topics/:topicId',
    FILTER: '/:courseId/:embed(embed)?/:view(discussion)/posts/:postFilter(all|mine)',
  },
  TOPICS: {
    PATH: '/:courseId/:embed(embed)?/:view(discussion)/topics',
    CATEGORY: '/:courseId/:embed(embed)?/:view(discussion|topic)/category/:categoryName',
  },
};
