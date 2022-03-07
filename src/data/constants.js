import { getConfig } from '@edx/frontend-platform';

export const API_BASE_URL = getConfig().LMS_BASE_URL;

/**
 * Enum for thread types.
 * @readonly
 * @enum {string}
 */
export const ThreadType = {
  ALL: 'all',
  QUESTION: 'question',
  DISCUSSION: 'discussion',
};

/**
 * Enum to map between endorsement status and friendly name.
 * @readonly
 * @enum
 */
export const EndorsementStatus = {
  ENDORSED: 'endorsed',
  UNENDORSED: 'unendorsed',
  DISCUSSION: 'discussion',
};

/**
 * Maps endorsement status and the corresponding API parameter.
 * @readonly
 * @enum
 */
export const EndorsementValue = {
  [EndorsementStatus.ENDORSED]: true,
  [EndorsementStatus.UNENDORSED]: false,
  [EndorsementStatus.DISCUSSION]: null,
};

/**
 * Edit actions for posts and comments
 * @readonly
 * @enum {string}
 */
export const ContentActions = {
  EDIT_CONTENT: 'raw_body',
  PIN: 'pinned',
  ENDORSE: 'endorsed',
  CLOSE: 'closed',
  REPORT: 'abuse_flagged',
  DELETE: 'delete',
  FOLLOWING: 'following',
  CHANGE_GROUP: 'group_id',
  MARK_READ: 'read',
  CHANGE_TITLE: 'title',
  CHANGE_TOPIC: 'topic_id',
  CHANGE_TYPE: 'type',
  VOTE: 'voted',
};

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
 * Enum for filtering posts by status.
 * @readonly
 * @enum {string}
 */
export const PostsStatusFilter = {
  ALL: 'statusAll',
  UNREAD: 'statusUnread',
  FOLLOWING: 'statusFollowing',
  REPORTED: 'statusReported',
  UNANSWERED: 'statusUnanswered',
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

export const LearnersOrdering = {
  BY_FLAG: 'flagged',
  BY_LAST_ACTIVITY: 'activity',
};

/**
 * Enum for discussion provider types supported by the MFE.
 * @type {{OPEN_EDX: string, LEGACY: string}}
 */
export const DiscussionProvider = {
  LEGACY: 'legacy',
  OPEN_EDX: 'openedx',
};

const BASE_PATH = '/:courseId';

export const Routes = {
  DISCUSSIONS: {
    PATH: BASE_PATH,
  },
  LEARNERS: {
    PATH: `${BASE_PATH}/learners`,
    LEARNER: `${BASE_PATH}/learners/:learnerUsername`,
  },
  POSTS: {
    PATH: `${BASE_PATH}/topics/:topicId`,
    MY_POSTS: `${BASE_PATH}/my-posts(/:postId)?`,
    ALL_POSTS: `${BASE_PATH}/posts(/:postId)?`,
    NEW_POST: [
      `${BASE_PATH}/topics/:topicId/posts/:postId`,
      `${BASE_PATH}/topics/:topicId`,
      `${BASE_PATH}`,
    ],
    EDIT_POST: [
      `${BASE_PATH}/topics/:topicId/posts/:postId/edit`,
      `${BASE_PATH}/posts/:postId/edit`,
      `${BASE_PATH}/my-posts/:postId/edit`,
    ],
  },
  COMMENTS: {
    PATH: [
      `${BASE_PATH}/topics/:topicId/posts/:postId`,
      `${BASE_PATH}/posts/:postId`,
      `${BASE_PATH}/my-posts/:postId`,
    ],
    PAGE: `${BASE_PATH}/:page`,
    PAGES: {
      topics: `${BASE_PATH}/topics/:topicId/posts/:postId`,
      posts: `${BASE_PATH}/posts/:postId`,
      'my-posts': `${BASE_PATH}/my-posts/:postId`,
    },
  },
  TOPICS: {
    PATH: [
      `${BASE_PATH}/topics/:topicId?`,
    ],
    ALL: `${BASE_PATH}/topics`,
    CATEGORY: `${BASE_PATH}/category/:category`,
    TOPIC: `${BASE_PATH}/topics/:topicId`,
  },
};

export const ALL_ROUTES = []
  .concat([Routes.TOPICS.CATEGORY])
  .concat(Routes.COMMENTS.PATH)
  .concat(Routes.TOPICS.PATH)
  .concat([Routes.POSTS.ALL_POSTS, Routes.POSTS.MY_POSTS])
  .concat([Routes.LEARNERS.LEARNER, Routes.LEARNERS.PATH])
  .concat([Routes.DISCUSSIONS.PATH]);
