import React from 'react';
import PropTypes from 'prop-types';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import messages from '../messages';
import Topic, { topicShape } from './Topic';

const ArchivedBaseGroup = ({
  archivedTopics,
  showDivider,
  intl,
}) => (
  <>
    {showDivider && (
    <>
      <div className="divider border-top border-light-500" />
      <div className="divider pt-1 bg-light-300" />
    </>
    )}
    <div
      className="discussion-topic-group d-flex flex-column text-primary-500"
      data-testid="archived-group"
    >
      <div className="pt-3 px-4 font-weight-bold">{intl.formatMessage(messages.archivedTopics)}</div>
      {archivedTopics?.map((topic, index) => (
        <Topic
          key={topic.id}
          topic={topic}
          showDivider={(archivedTopics.length - 1) !== index}
        />
      ))}
    </div>
  </>
);

ArchivedBaseGroup.propTypes = {
  archivedTopics: PropTypes.arrayOf(topicShape).isRequired,
  showDivider: PropTypes.bool,
  intl: intlShape.isRequired,
};

ArchivedBaseGroup.defaultProps = {
  showDivider: false,
};
export default injectIntl(ArchivedBaseGroup);
