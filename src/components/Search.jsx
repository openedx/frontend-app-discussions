import React, { useContext, useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { SearchField } from '@edx/paragon';

import { DiscussionContext } from '../discussions/common/context';
import { setSearchQuery } from '../discussions/posts/data';
import postsMessages from '../discussions/posts/post-actions-bar/messages';
import { setFilter as setTopicFilter } from '../discussions/topics/data/slices';

function Search({ intl }) {
  const dispatch = useDispatch();
  const { page } = useContext(DiscussionContext);
  const postSearch = useSelector(({ threads }) => threads.filters.search);
  const topicSearch = useSelector(({ topics }) => topics.filter);
  const isPostSearch = ['posts', 'my-posts', 'learners'].includes(page);

  const onClear = () => {
    dispatch(setSearchQuery(''));
    dispatch(setTopicFilter(''));
  };

  const onSubmit = (query) => {
    if (isPostSearch) {
      dispatch(setSearchQuery(query));
    } else if (page === 'topics') {
      dispatch(setTopicFilter(query));
    }
  };

  useEffect(() => onClear(), [page]);

  return (
    <SearchField
      onClear={onClear}
      onSubmit={onSubmit}
      value={isPostSearch ? postSearch : topicSearch}
      placeholder={intl.formatMessage(postsMessages.search, { page })}
      inputProps={{ className: 'small-font' }}
    />
  );
}

Search.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(Search);
