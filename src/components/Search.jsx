import React, { useContext, useEffect, useRef } from 'react';

import { useDispatch } from 'react-redux';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { SearchField } from '@edx/paragon';

import { DiscussionContext } from '../discussions/common/context';
import { setSearchQuery } from '../discussions/posts/data';
import { default as postsMessages } from '../discussions/posts/post-actions-bar/messages';
import { setFilter as setTopicFilter } from '../discussions/topics/data/slices';
import { default as topicsMessages } from '../discussions/topics/topic-search-bar/messages';

function Search({ intl }) {
  const dispatch = useDispatch();
  const { page } = useContext(DiscussionContext);
  const element = useRef(null);

  useEffect(() => {
    dispatch(setTopicFilter(''));
    dispatch(setSearchQuery(''));
    element.value = '';
  }, [page]);

  const onClear = () => {
    dispatch(setSearchQuery(''));
    dispatch(setTopicFilter(''));
  };
  const onSubmit = (query) => {
    if (page === 'posts') {
      dispatch(setSearchQuery(query));
    } else if (page === 'topics') {
      dispatch(setTopicFilter(query));
    }
  };
  let placeholder = 'Search';

  if (page === 'posts') {
    placeholder = intl.formatMessage(postsMessages.searchAllPosts);
  } else if (page === 'topics') {
    placeholder = intl.formatMessage(topicsMessages.findATopic);
  }

  return (
    <>
      <SearchField
        onClear={onClear}
        onSubmit={onSubmit}
        placeholder={placeholder}
        inputProps={{ className: 'small-font', ref: element }}
      />
    </>
  );
}

Search.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(Search);
