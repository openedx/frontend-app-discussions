/* eslint-disable import/prefer-default-export */
import { getIn } from 'formik';
import { useRouteMatch } from 'react-router';

import { Routes } from '../data/constants';

export function buildIntlSelectionList(options, intl, messages) {
  return Object.values(options)
    .map(
      option => (
        {
          label: intl.formatMessage(messages[option]),
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
