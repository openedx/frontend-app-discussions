import React from 'react';

import { useDispatch } from 'react-redux';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Icon, SearchField } from '@edx/paragon';
import { ArrowDropUpDown } from '@edx/paragon/icons';

import { SelectableDropdown } from '../../../components';
import { TopicOrdering } from '../../../data/constants';
import { buildIntlSelectionList } from '../../utils';
import { setFilter, setSortBy } from '../data';
import messages from './messages';

function TopicSearchBar({ intl }) {
  const dispatch = useDispatch();
  const topicOrderingOptions = buildIntlSelectionList(TopicOrdering, intl, messages);
  return (
    <div className="d-flex flex-row p-1 align-items-center">
      <SearchField
        className="flex-fill m-1 border-0"
        placeholder={intl.formatMessage(messages.findATopic)}
        onSubmit={(query) => dispatch(setFilter(query))}
        onChange={(query) => dispatch(setFilter(query))}
      />
      <SelectableDropdown
        options={topicOrderingOptions}
        onChange={(option) => dispatch(setSortBy(option.value))}
        label={<Icon src={ArrowDropUpDown} />}
      />
    </div>
  );
}

TopicSearchBar.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(TopicSearchBar);
