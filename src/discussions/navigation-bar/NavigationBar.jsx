import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import SearchField from '@edx/paragon/dist/SearchField';
import { faSortAmountDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { SelectableDropdown } from '../../components';
import {
  AllPostsFilter, MyPostsFilter, ThreadOrdering, TopicsFilter,
} from '../../data/constants';
import { buildIntlSelectionList } from '../utils';
import messages from './messages';


function SearchFilterBar({ intl }) {
  const myPostsFilterOptions = buildIntlSelectionList(MyPostsFilter, intl, messages);
  const allPostsFilterOptions = buildIntlSelectionList(AllPostsFilter, intl, messages);
  const topicsFilterOptions = buildIntlSelectionList(TopicsFilter, intl, messages);
  const threadOrderingOptions = buildIntlSelectionList(ThreadOrdering, intl, messages);
  return (
    <div className="navigation-bar d-flex flex-column">
      <div className="navigation-filter d-flex border-bottom">
        <SelectableDropdown
          defaultOption={MyPostsFilter.MY_POSTS}
          options={myPostsFilterOptions}
        />
        <SelectableDropdown
          defaultOption={AllPostsFilter.ALL_POSTS}
          options={allPostsFilterOptions}
        />
        <SelectableDropdown
          defaultOption={TopicsFilter.ALL}
          options={topicsFilterOptions}
        />
      </div>
      <div className="d-flex">
        <SearchField onSubmit={() => null} />
        <SelectableDropdown
          label={<FontAwesomeIcon icon={faSortAmountDown} />}
          defaultOption={ThreadOrdering.BY_LAST_ACTIVITY}
          options={threadOrderingOptions}
        />
      </div>
      <div className="d-flex">
        {/* TODO: hook into store */ }
        { intl.formatMessage(messages.sorted_by, { sortBy: 'something' }) }
      </div>
    </div>
  );
}

SearchFilterBar.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(SearchFilterBar);
