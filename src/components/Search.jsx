import React, { useContext, useEffect } from 'react';

import camelCase from 'lodash/camelCase';
import { useDispatch, useSelector } from 'react-redux';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Icon, SearchField } from '@edx/paragon';
import { Search as SearchIcon } from '@edx/paragon/icons';

import { DiscussionContext } from '../discussions/common/context';
import { setUsernameSearch } from '../discussions/learners/data';
import { setSearchQuery } from '../discussions/posts/data';
import postsMessages from '../discussions/posts/post-actions-bar/messages';
import { setFilter as setTopicFilter } from '../discussions/topics/data/slices';

function Search({ intl }) {
  const dispatch = useDispatch();
  const { page } = useContext(DiscussionContext);
  const postSearch = useSelector(({ threads }) => threads.filters.search);
  const topicSearch = useSelector(({ topics }) => topics.filter);
  const learnerSearch = useSelector(({ learners }) => learners.usernameSearch);
  const isPostSearch = ['posts', 'my-posts'].includes(page);
  const isTopicSearch = 'topics'.includes(page);
  let searchValue = '';
  let currentValue = '';
  if (isPostSearch) {
    currentValue = postSearch;
  } else if (isTopicSearch) {
    currentValue = topicSearch;
  } else {
    currentValue = learnerSearch;
  }

  const onClear = () => {
    dispatch(setSearchQuery(''));
    dispatch(setTopicFilter(''));
    dispatch(setUsernameSearch(''));
  };

  const onChange = (query) => {
    searchValue = query;
  };

  const onSubmit = (query) => {
    if (query === '') {
      return;
    }
    if (isPostSearch) {
      dispatch(setSearchQuery(query));
    } else if (page === 'topics') {
      dispatch(setTopicFilter(query));
    } else if (page === 'learners') {
      dispatch(setUsernameSearch(query));
    }
  };

  useEffect(() => onClear(), [page]);
  return (
    <>
      <SearchField.Advanced
        onClear={onClear}
        onChange={onChange}
        onSubmit={onSubmit}
        value={currentValue}
      >
        <SearchField.Label />
        <SearchField.Input
          style={{ paddingRight: '1rem' }}
          placeholder={intl.formatMessage(postsMessages.search, { page: camelCase(page) })}
        />
        <span className="mt-auto mb-auto mr-2.5 pointer-cursor-hover">
          <Icon
            src={SearchIcon}
            onClick={() => onSubmit(searchValue)}
          />
        </span>
      </SearchField.Advanced>
    </>
  );
}

Search.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(Search);
