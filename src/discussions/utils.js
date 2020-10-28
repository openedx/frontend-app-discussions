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

export function buildDiscussionsUrl(route, urlParams, removeUnusedParams = false) {
  /* Given a path and map of url parameter names to values, it formats the url with those values */
  let compiledPath = Object.entries(urlParams).reduce((path, [paramName, value]) => (
    value === undefined || value.length === 0
      ? path.split('/').filter(part => !part.startsWith(':'.concat(paramName))).join('/')
      : path.split('/').map(part => (part.startsWith(':'.concat(paramName)) ? value : part)).join('/')
  ), route);

  // Remove any unused params after inserting all the ones passed to us
  if (removeUnusedParams) {
    compiledPath = compiledPath.split('/').filter(part => !part.startsWith(':')).join('/');
  }

  return compiledPath;
}
