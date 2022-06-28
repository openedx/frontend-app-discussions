/* eslint-disable no-restricted-syntax */
/* eslint-disable import/no-named-default */
import React, { useContext, useEffect, useState } from 'react';

import { useDispatch } from 'react-redux';
import { matchPath, useHistory } from 'react-router';
import { useLocation } from 'react-router-dom';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { SearchField } from '@edx/paragon';

import { Routes } from '../data/constants';
import { DiscussionContext } from '../discussions/common/context';
import { setSearchQuery } from '../discussions/posts/data';
import { default as postsMessages } from '../discussions/posts/post-actions-bar/messages';
import { setFilter as setTopicFilter } from '../discussions/topics/data/slices';
import { default as topicsMessages } from '../discussions/topics/topic-search-bar/messages';
import { discussionsPath } from '../discussions/utils';

const matchPaths = (path, pathsList) => {
  let matched = false;
  for (const pathregex of pathsList) {
    const pathMatched = matchPath(path, { path: pathregex, strict: false });
    if (pathMatched) {
      matched = true;
    }
  }
  return matched;
};

function Search({ intl }) {
  const dispatch = useDispatch();
  const location = useLocation();
  const history = useHistory();
  const { courseId } = useContext(DiscussionContext);
  const [value, setValue] = useState('');
  const path = location.pathname;

  useEffect(() => {
    dispatch(setTopicFilter(''));
    dispatch(setSearchQuery(''));
    setValue('');
  }, [location]);

  let onClear = () => {};
  let onChange = () => {};
  let onSubmit = () => {};
  let placeholder = 'Search';

  const topicPaths = Routes.TOPICS.PATH;
  const postPaths = [Routes.POSTS.MY_POSTS, Routes.POSTS.ALL_POSTS];

  if (matchPaths(path, postPaths)) {
    placeholder = intl.formatMessage(postsMessages.searchAllPosts);
    onClear = () => dispatch(setSearchQuery(''));
    onSubmit = (query) => {
      dispatch(setSearchQuery(query));
      history.push(discussionsPath(Routes.POSTS.ALL_POSTS, { courseId })(location));
    };
  } else if (matchPaths(path, topicPaths)) {
    placeholder = intl.formatMessage(topicsMessages.findATopic);
    onChange = (query) => dispatch(setTopicFilter(query));
  }

  return (
    <>
      <SearchField
        onClear={onClear}
        onSubmit={onSubmit}
        onChange={onChange}
        value={value}
        placeholder={placeholder}
        inputProps={{ className: 'small-font' }}
      />
    </>
  );
}

Search.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(Search);
