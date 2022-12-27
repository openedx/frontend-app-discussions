import { useSelector } from 'react-redux';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import { selectTopics } from '../data/selectors';
import messages from '../messages';

function NoResults({ intl }) {
  const topics = useSelector(selectTopics);

  let title = messages.nothingHere;
  const helpMessage = '';
  if (topics.length === 0) {
    title = messages.noTopicExists;
  }
  console.log('NoResults', topics);

  return (
    <div className="h-100 mt-5 align-self-center mx-auto w-50 d-flex flex-column justify-content-center text-center">
      <h4 className="font-weight-normal text-primary-500">{intl.formatMessage(title)}</h4>
      { helpMessage && <small className="font-weight-normal text-gray-700">{intl.formatMessage(helpMessage)}</small>}
    </div>
  );
}

NoResults.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(NoResults);
