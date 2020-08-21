/* eslint-disable import/prefer-default-export */
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
 * Given a URL object, add the parameters from the supplied params object as query params.
 * @param {URL} url A URL object to add query parameters to.
 * @param {{}} params An object containing query parameters to set.
 */
export function addQueryParamsToUrl(url, params) {
  Object.keys(params)
    .forEach(
      (paramName) => {
        const paramValue = params[paramName];
        if (paramValue) {
          url.searchParams.set(paramName, paramValue);
        }
      },
    );
}

/**
 * Get HTTP Error status from generic error.
 * @param error Generic caught errot.
 * @returns {number|undefined}
 */
export const getHttpErrorStatus = error => error && error.customAttributes && error.customAttributes.httpErrorStatus;
