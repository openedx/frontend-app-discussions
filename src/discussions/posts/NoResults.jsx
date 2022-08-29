import { useSelector } from 'react-redux';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import { selectAreThreadsFiltered } from '../data/selectors';
import messages from '../messages';

function NoResults({ intl }) {
  const postsFiltered = useSelector(selectAreThreadsFiltered);
  const topicsFilter = useSelector(({ topics }) => topics.filter);
  const filters = useSelector((state) => state.threads.filters);
  const learnersFilter = useSelector(({ learners }) => learners.usernameSearch);
  const isFiltered = postsFiltered || (topicsFilter !== '') || (learnersFilter !== null);

  let helpMessage = messages.removeFilters;
  if (!isFiltered) {
    return null;
  } if (filters.search || learnersFilter) {
    helpMessage = messages.removeKeywords;
  } if (topicsFilter) {
    helpMessage = messages.removeKeywordsOnly;
  }

  return (
    <div className="h-100 align-self-center mx-auto w-50 d-flex flex-column justify-content-center text-center">
      <h4>{intl.formatMessage(messages.noResultsFound)}</h4>
      <small>{intl.formatMessage(helpMessage)}</small>
    </div>
  );
}

NoResults.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(NoResults);
