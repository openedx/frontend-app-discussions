import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import SearchField from '@edx/paragon/dist/SearchField';
import React, { useState } from 'react';
import { buildIntlSelectionList } from '../../utils';
import { SelectableDropdown } from '../../../components/selectable-dropdown';
import { TopicOrdering } from '../../../data/constants';
import messages from './messages';

function TopicSearchBar({ intl }) {
  const topicOrderingOptions = buildIntlSelectionList(TopicOrdering, intl, messages);

  const [currentTopicOrder, setTopicOrder] = useState(TopicOrdering.BY_COURSE_STRUCTURE);
  return (
    <div className="d-flex flex-row card-header p-1">
      <div className="flex-fill m-1">
        <SearchField
          inputLabel=""
          placeholder="Find a topic"
          onSubmit={() => null}
        />
      </div>
      <div className="my-auto">
        <SelectableDropdown
          defaultOption={TopicOrdering.BY_COURSE_STRUCTURE}
          options={topicOrderingOptions}
          onChange={(option) => setTopicOrder(option.value)}
          label={
            intl.formatMessage(
              messages.sorted_by,
              { sortBy: intl.formatMessage(messages[currentTopicOrder]) },
            )
          }
        />
      </div>
    </div>
  );
}

TopicSearchBar.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(TopicSearchBar);
