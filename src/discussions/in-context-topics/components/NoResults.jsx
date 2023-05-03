import { useSelector } from 'react-redux';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import { selectTopics } from '../data/selectors';
import messages from '../messages';

const NoResults = ({ intl }) => {
  const topics = useSelector(selectTopics);

  const title = messages.nothingHere;
  let helpMessage = '';
  if (topics.length === 0) {
    helpMessage = messages.noTopicExists;
  }

  return (
    <div className="h-100 mt-5 align-self-center mx-auto w-50 d-flex flex-column justify-content-center text-center">
      <h4 className="font-weight-normal text-primary-500">{intl.formatMessage(title)}</h4>
      { helpMessage && <small className="font-weight-normal text-gray-700">{intl.formatMessage(helpMessage)}</small>}
    </div>
  );
};

NoResults.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(NoResults);
