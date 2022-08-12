import classNames from 'classnames';
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
  const titleCssClasses = classNames(
    { 'font-weight-normal text-primary-500': topicsFilter || learnersFilter },
  );
  const textCssClasses = classNames(
    { 'font-weight-normal text-gray-700': topicsFilter || learnersFilter },
  );

  return (
    <div className="h-100 mt-5 align-self-center mx-auto w-50 d-flex flex-column justify-content-center text-center">
      <h4 className={titleCssClasses}>{intl.formatMessage(messages.noResultsFound)}</h4>
      <small className={textCssClasses}>{intl.formatMessage(helpMessage)}</small>
    </div>
  );
}

NoResults.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(NoResults);
