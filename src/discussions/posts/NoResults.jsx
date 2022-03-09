import { useSelector } from 'react-redux';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import { selectAreThreadsFiltered } from '../data/selectors';
import messages from '../messages';

function NoResults({ intl }) {
  const isFiltered = useSelector(selectAreThreadsFiltered);
  const filters = useSelector((state) => state.threads.filters);

  let helpMessage = messages.removeFilters;
  if (!isFiltered) {
    return null;
  } if (filters.search) {
    helpMessage = messages.removeKeywords;
  }

  return (
    <div className="h-100 mt-5 align-self-center w-50 d-flex flex-column justify-content-center text-center">
      <h4>{intl.formatMessage(messages.noResultsFound)}</h4>
      <small>{intl.formatMessage(helpMessage)}</small>
    </div>
  );
}

NoResults.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(NoResults);
