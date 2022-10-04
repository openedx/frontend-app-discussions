import React from 'react';

import { useDispatch } from 'react-redux';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { SearchField } from '@edx/paragon';

import { setFilter } from '../data';
import messages from '../messages';

function TopicSearchBar({ intl }) {
  const dispatch = useDispatch();
  return (
    <div className="d-flex flex-row p-1 align-items-center">
      <SearchField
        className="flex-fill m-1 border-0"
        placeholder={intl.formatMessage(messages.searchTopics)}
        onSubmit={(query) => dispatch(setFilter(query))}
        onChange={(query) => dispatch(setFilter(query))}
      />
    </div>
  );
}

TopicSearchBar.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(TopicSearchBar);
