/* eslint-disable import/prefer-default-export */
import React from 'react';

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

export const getPluginComponent = plugin => (
  React.lazy(async () => {
    try {
     return await import(`plugins/${plugin}`);
    } catch (error) {
      try {
       return await import(`./editors/${plugin}`);
    } catch(error) {
      return await import('./editors/fallback');
    }
    }
  })
)
