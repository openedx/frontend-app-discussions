import React, { useContext, useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Icon, SearchField } from '@edx/paragon';
import { Search as SearchIcon } from '@edx/paragon/icons';

import { DiscussionContext } from '../../common/context';
import postsMessages from '../../posts/post-actions-bar/messages';
import { setFilter as setTopicFilter } from '../data/slices';

const TopicSearchBar = ({ intl }) => {
  const dispatch = useDispatch();
  const { page } = useContext(DiscussionContext);
  const topicSearch = useSelector(({ inContextTopics }) => inContextTopics.filter);
  let searchValue = '';

  const onClear = () => {
    dispatch(setTopicFilter(''));
  };

  const onChange = (query) => {
    searchValue = query;
  };

  const onSubmit = (query) => {
    if (query === '') {
      return;
    }
    dispatch(setTopicFilter(query));
  };

  useEffect(() => onClear(), [page]);

  return (
    <SearchField.Advanced
      onClear={onClear}
      onChange={onChange}
      onSubmit={onSubmit}
      value={topicSearch}
    >
      <SearchField.Label />
      <SearchField.Input
        style={{ paddingRight: '1rem' }}
        placeholder={intl.formatMessage(postsMessages.search, { page: 'topics' })}
      />
      <span className="mt-auto mb-auto mr-2.5 pointer-cursor-hover">
        <Icon
          src={SearchIcon}
          onClick={() => onSubmit(searchValue)}
          data-testid="search-icon"
        />
      </span>
    </SearchField.Advanced>
  );
};

TopicSearchBar.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(TopicSearchBar);
