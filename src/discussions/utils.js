/* eslint-disable import/prefer-default-export */
import { getIn } from 'formik';
import { uniqBy } from 'lodash';
import { generatePath, useRouteMatch } from 'react-router';

import { getConfig } from '@edx/frontend-platform';
import {
  CheckCircle,
  CheckCircleOutline,
  Delete, Edit, Pin, QuestionAnswer, Report, Verified, VerifiedOutline,
} from '@edx/paragon/icons';

import { InsertLink } from '../components/icons';
import { ContentActions, Routes, ThreadType } from '../data/constants';
import messages from './messages';

/**
 * Get HTTP Error status from generic error.
 * @param error Generic caught error.
 * @returns {number|null}
 */
export const getHttpErrorStatus = error => error?.customAttributes?.httpErrorStatus ?? error?.response?.status;

/**
 * Return true if a field has been modified and is no longer valid
 * @param {string} field Name of field
 * @param {{}} errors formik error object
 * @param {{}} touched formik touched object
 * @returns {boolean}
 */
export function isFormikFieldInvalid(field, {
  errors,
  touched,
}) {
  return Boolean(getIn(touched, field) && getIn(errors, field));
}

/**
 * Hook to return the path for the current comments page
 * @returns {string}
 */
export function useCommentsPagePath() {
  const { params } = useRouteMatch(Routes.COMMENTS.PAGE);
  return Routes.COMMENTS.PAGES[params.page];
}

/**
 * Check if the provided comment or post supports the provided option.
 * @param {{editableFields:[string]}} content
 * @param {ContentActions} action
 * @returns {boolean}
 */
export function checkPermissions(content, action) {
  if (content.editableFields.includes(action)) {
    return true;
  }
  // For delete action we check `content.canDelete`
  if (action === ContentActions.DELETE) {
    return true;
  }
  return false;
}

/**
 * List of all possible actions for comments or posts.
 *
 * * `id` is a unique id for each action.
 * * `action` is the action being performed. One action can
 *    have multiple mutually-exclusive entries (such as close/open)..
 * * `icon` is the icon component to show for the action.
 * * `label` is the translatable label message that can be passed to intl.
 * * `conditions` is the an object where the key and value represent the key and value that should match
 *    in the content/post.
 *    e.g. for {pinned:false} the action will show up if the content/post has post.pinned==false
 */
export const ACTIONS_LIST = [
  {
    id: 'copy-link',
    action: ContentActions.COPY_LINK,
    icon: InsertLink,
    label: messages.copyLink,
  },
  {
    id: 'edit',
    action: ContentActions.EDIT_CONTENT,
    icon: Edit,
    label: messages.editAction,
  },
  {
    id: 'pin',
    action: ContentActions.PIN,
    icon: Pin,
    label: messages.pinAction,
    conditions: { pinned: false },
  },
  {
    id: 'unpin',
    action: ContentActions.PIN,
    icon: Pin,
    label: messages.unpinAction,
    conditions: { pinned: true },
  },
  {
    id: 'endorse',
    action: ContentActions.ENDORSE,
    icon: VerifiedOutline,
    label: messages.endorseAction,
    conditions: {
      endorsed: false,
      postType: ThreadType.DISCUSSION,
    },
  },
  {
    id: 'unendorse',
    action: ContentActions.ENDORSE,
    icon: Verified,
    label: messages.unendorseAction,
    conditions: {
      endorsed: true,
      postType: ThreadType.DISCUSSION,
    },
  },
  {
    id: 'answer',
    action: ContentActions.ENDORSE,
    icon: CheckCircleOutline,
    label: messages.markAnsweredAction,
    conditions: {
      endorsed: false,
      postType: ThreadType.QUESTION,
    },
  },
  {
    id: 'unanswer',
    action: ContentActions.ENDORSE,
    icon: CheckCircle,
    label: messages.unmarkAnsweredAction,
    conditions: {
      endorsed: true,
      postType: ThreadType.QUESTION,
    },
  },
  {
    id: 'close',
    action: ContentActions.CLOSE,
    icon: QuestionAnswer,
    label: messages.closeAction,
    conditions: { closed: false },
  },
  {
    id: 'reopen',
    action: ContentActions.CLOSE,
    icon: QuestionAnswer,
    label: messages.reopenAction,
    conditions: { closed: true },
  },
  {
    id: 'report',
    action: ContentActions.REPORT,
    icon: Report,
    label: messages.reportAction,
    conditions: { abuseFlagged: false },
  },
  {
    id: 'unreport',
    action: ContentActions.REPORT,
    icon: Report,
    label: messages.unreportAction,
    conditions: { abuseFlagged: true },
  },
  {
    id: 'delete',
    action: ContentActions.DELETE,
    icon: Delete,
    label: messages.deleteAction,
    conditions: { canDelete: true },
  },
];

export function useActions(content) {
  const checkConditions = (item, conditions) => (
    conditions
      ? Object.keys(conditions)
        .map(key => item[key] === conditions[key])
        .every(condition => condition === true)
      : true
  );

  return ACTIONS_LIST.filter(
    ({
      action,
      conditions = null,
    }) => checkPermissions(content, action) && checkConditions(content, conditions),
  );
}

export const formikCompatibleHandler = (formikHandler, name) => (value) => formikHandler({
  target: {
    name,
    value,
  },
});

/**
 * A wrapper for the generatePath function that generates a new path that keeps the existing
 * query parameters intact
 * @param path
 * @param params
 * @return {function(*): *&{pathname: *}}
 */
export const discussionsPath = (path, params) => {
  const pathname = generatePath(path, params);
  return (location) => ({ ...location, pathname });
};

/**
 * Helper function to make a postMessage call
 * @param {string} type message type
 * @param {object} payload data to send in message
 */
export function postMessageToParent(type, payload = {}) {
  if (window.parent !== window) {
    const messageTargets = [
      getConfig().LEARNING_BASE_URL,
      getConfig().LMS_BASE_URL,
    ];
    messageTargets.forEach(target => {
      window.parent.postMessage(
        {
          type,
          payload,
        },
        target,
      );
    });
  }
}

export const isPostPreviewAvailable = (htmlNode) => {
  const containsImage = htmlNode.match(/(<img((?:\\.|.)*)>)/);
  const isLatex = htmlNode.match(/(\${1,2})((?:\\.|.)*)/)
    || htmlNode.match(/(\[mathjax](.+?))+/)
    || htmlNode.match(/(\[mathjaxinline](.+?))+/)
    || htmlNode.match(/(\\\[(.+?))+/)
    || htmlNode.match(/(\\\((.+?))+/);

  if (containsImage || isLatex || htmlNode === '') {
    return false;
  }
  return true;
};

/**
 * Helper function to filter posts
 * @param {array} posts arrays of posts
 * @param {string} filterBy name of post object attribute. un will use for reverse
 *  condition. like pinned attribute for pinned post and unpinned for non pinned posts.
 */
export const filterPosts = (posts, filterBy) => uniqBy(posts, 'id').filter(
  post => (filterBy.startsWith('un') ? !post[filterBy.slice(2)] : post[filterBy]),
);

/**
 * Helper function to make a check if date is in given range
 * @param {Date} date this date to be checked in range
 * @param {Date} start start date
 * @param {Date} end end date
 */
export function dateInDateRange(date, start, end) {
  return date >= start && date <= end;
}

/**
 * Helper function to make a check if date is in given range
 * @param {array} blackoutDateRanges start date
 * @return Boolean
 */
export function inBlackoutDateRange(blackoutDateRanges) {
  const now = new Date();
  return blackoutDateRanges.some(
    (blackoutDateRange) => dateInDateRange(now, new Date(blackoutDateRange.start), new Date(blackoutDateRange.end)),
  );
}
