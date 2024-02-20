import React, { useCallback, useContext, useEffect } from 'react';

import { Icon, SearchField } from '@openedx/paragon';
import { Search as SearchIcon } from '@openedx/paragon/icons';
import { useDispatch, useSelector } from 'react-redux';

import { useIntl } from '@edx/frontend-platform/i18n';

import DiscussionContext from '../../common/context';
import postsMessages from '../../posts/post-actions-bar/messages';
import { setFilter as setTopicFilter } from '../data/slices';

const TopicSearchBar = () => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const { page } = useContext(DiscussionContext);
  const topicSearch = useSelector(({ inContextTopics }) => inContextTopics.filter);
  let searchValue = '';

  const onClear = useCallback(() => {
    dispatch(setTopicFilter(''));
  }, []);

  const onChange = useCallback((query) => {
    searchValue = query;
  }, []);

  const onSubmit = useCallback((query) => {
    if (query === '') {
      return;
    }
    dispatch(setTopicFilter(query));
  }, []);

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

export default TopicSearchBar;
