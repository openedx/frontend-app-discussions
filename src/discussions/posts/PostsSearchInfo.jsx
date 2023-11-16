import React, { memo, useCallback } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import SearchInfo from '../../components/SearchInfo';
import { setSearchQuery } from './data/slices';

const PostsSearchInfo = () => {
  const dispatch = useDispatch();
  const searchString = useSelector(({ threads }) => threads.filters.search);
  const resultsFound = useSelector(({ threads }) => threads.totalThreads);
  const textSearchRewrite = useSelector(({ threads }) => threads.textSearchRewrite);
  const loadingStatus = useSelector(({ threads }) => threads.status);

  const handleOnClear = useCallback(() => {
    dispatch(setSearchQuery(''));
  }, []);

  return (
    searchString && (
      <SearchInfo
        count={resultsFound}
        text={searchString}
        loadingStatus={loadingStatus}
        onClear={handleOnClear}
        textSearchRewrite={textSearchRewrite}
      />
    )
  );
};

export default memo(PostsSearchInfo);
