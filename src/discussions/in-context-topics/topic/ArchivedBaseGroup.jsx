import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import { useIntl } from '@edx/frontend-platform/i18n';

import messages from '../messages';
import Topic, { topicShape } from './Topic';

const ArchivedBaseGroup = ({
  archivedTopics,
  showDivider,
}) => {
  const intl = useIntl();

  const renderArchivedTopics = useMemo(() => (
    archivedTopics?.map((topic, index) => (
      <Topic
        key={topic.id}
        topic={topic}
        showDivider={(archivedTopics.length - 1) !== index}
      />
    ))
  ), [archivedTopics]);

  return (
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
        {renderArchivedTopics}
      </div>
    </>
  );
};

ArchivedBaseGroup.propTypes = {
  archivedTopics: PropTypes.arrayOf(topicShape).isRequired,
  showDivider: PropTypes.bool,
};

ArchivedBaseGroup.defaultProps = {
  showDivider: false,
};
export default React.memo(ArchivedBaseGroup);
