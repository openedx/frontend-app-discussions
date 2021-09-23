/* eslint-disable import/prefer-default-export */
import { useContext } from 'react';

import { getIn } from 'formik';
import { useRouteMatch } from 'react-router';

import { AppContext } from '@edx/frontend-platform/react';
import {
  Delete, Edit, Flag, Pin, QuestionAnswer, VerifiedBadge,
} from '@edx/paragon/icons';

import { ContentActions, Routes } from '../data/constants';
import messages from './messages';

export function buildIntlSelectionList(options, intl, messagesData) {
  return Object.values(options)
    .map(
      option => (
        {
          label: intl.formatMessage(messagesData[option]),
          value: option,
        }
      ),
    );
}

/**
 * Get HTTP Error status from generic error.
 * @param error Generic caught error.
 * @returns {number|undefined}
 */
export const getHttpErrorStatus = error => error && error.customAttributes && error.customAttributes.httpErrorStatus;

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
 * @param {{}} commentOrPost
 * @param {ContentActions} action
 * @param {UserData} user
 * @returns {boolean}
 */
export function permissionCheck(commentOrPost, action, user) {
  if (commentOrPost.editableFields.includes(action)) {
    return true;
  }
  if (action === ContentActions.DELETE && (user.administrator || commentOrPost.author === user.username)) {
    return true;
  }
  if ((action === ContentActions.CLOSE || action === ContentActions.PIN) && user.administrator) {
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
 * * `condition` is the array where the first one is a property of the post
 *    or comment and the second is the value.
 *    e.g. for ['pinned', false] the action will show up if the comment/post has post.pinned=false
 */
const ACTIONS_LIST = [
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
    condition: ['pinned', false],
  },
  {
    id: 'unpin',
    action: ContentActions.PIN,
    icon: Pin,
    label: messages.unpinAction,
    condition: ['pinned', true],
  },
  {
    id: 'endorse',
    action: ContentActions.ENDORSE,
    icon: VerifiedBadge,
    label: messages.endorseAction,
    condition: ['endorsed', false],
  },
  {
    id: 'unendorse',
    action: ContentActions.ENDORSE,
    icon: VerifiedBadge,
    label: messages.unendorseAction,
    condition: ['endorsed', true],
  },
  {
    id: 'close',
    action: ContentActions.CLOSE,
    icon: QuestionAnswer,
    label: messages.closeAction,
    condition: ['closed', false],
  },
  {
    id: 'reopen',
    action: ContentActions.CLOSE,
    icon: QuestionAnswer,
    label: messages.reopenAction,
    condition: ['closed', true],
  },
  {
    id: 'report',
    action: ContentActions.REPORT,
    icon: Flag,
    label: messages.reportAction,
    condition: ['abuseFlagged', false],
  },
  {
    id: 'unreport',
    action: ContentActions.REPORT,
    icon: Flag,
    label: messages.unreportAction,
    condition: ['abuseFlagged', true],
  },
  {
    id: 'delete',
    action: ContentActions.DELETE,
    icon: Delete,
    label: messages.deleteAction,
  },
];

export function useActions(commentOrPost) {
  const { authenticatedUser } = useContext(AppContext);
  return ACTIONS_LIST.filter(
    ({
      action,
      condition = null,
    }) => (
      permissionCheck(commentOrPost, action, authenticatedUser)
      && (condition ? commentOrPost[condition[0]] === condition[1] : true)
    ),
  );
}

export const formikCompatibleHandler = (formikHandler, name) => (value) => formikHandler({
  target: {
    name,
    value,
  },
});
