import React from 'react';

import { useSelector } from 'react-redux';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import { selectArchivedTopics } from '../../../data/selectors';
import messages from '../messages';
import TopicGroupBase from './TopicGroupBase';

function ArchivedTopicGroup({ intl }) {
  const topics = useSelector(selectArchivedTopics);
  return (
    <TopicGroupBase
      groupId="archived"
      groupTitle={intl.formatMessage(messages.archivedTopics)}
      linkToGroup={false}
      topics={topics}
    />
  );
}
ArchivedTopicGroup.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(ArchivedTopicGroup);
