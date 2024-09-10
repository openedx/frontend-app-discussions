import React, {
  useCallback, useContext, useEffect, useMemo,
} from 'react';
import PropTypes from 'prop-types';

import { Button, Spinner } from '@openedx/paragon';
import { useDispatch, useSelector } from 'react-redux';

import { useIntl } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';

import { RequestStatus } from '../../data/constants';
import DiscussionContext from '../common/context';
import { selectConfigLoadingStatus, selectUserHasModerationPrivileges, selectUserIsStaff } from '../data/selectors';
import { fetchUserPosts } from '../learners/data/thunks';
import messages from '../messages';
import usePostList from './data/hooks';
import {
  selectThreadFilters, selectThreadNextPage, selectThreadSorting, threadsLoadingStatus,
} from './data/selectors';
import { fetchThreads } from './data/thunks';
import NoResults from './NoResults';
import { PostLink } from './post';

const PostsList = ({
  postsIds, topicsIds, isTopicTab, parentIsLoading,
}) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const { authenticatedUser } = useContext(AppContext);
  const { courseId, page } = useContext(DiscussionContext);
  const loadingStatus = useSelector(threadsLoadingStatus());
  const orderBy = useSelector(selectThreadSorting());
  const filters = useSelector(selectThreadFilters());
  const nextPage = useSelector(selectThreadNextPage());
  const userHasModerationPrivileges = useSelector(selectUserHasModerationPrivileges);
  const userIsStaff = useSelector(selectUserIsStaff);
  const configStatus = useSelector(selectConfigLoadingStatus);
  const sortedPostsIds = usePostList(postsIds);
  const showOwnPosts = page === 'my-posts';

  const loadThreads = useCallback((topicIds, pageNum = undefined, isFilterChanged = false) => {
    const params = {
      orderBy,
      filters,
      page: pageNum,
      author: showOwnPosts ? authenticatedUser.username : null,
      countFlagged: (userHasModerationPrivileges || userIsStaff) || undefined,
      topicIds,
      isFilterChanged,
    };

    if (showOwnPosts && filters.search === '') {
      dispatch(fetchUserPosts(courseId, params));
    } else {
      dispatch(fetchThreads(courseId, params));
    }
  }, [courseId, orderBy, filters, showOwnPosts, authenticatedUser.username, userHasModerationPrivileges, userIsStaff]);

  useEffect(() => {
    if (topicsIds !== undefined && configStatus === RequestStatus.SUCCESSFUL) {
      loadThreads(topicsIds);
    }
  }, [courseId, filters, orderBy, page, JSON.stringify(topicsIds), configStatus]);

  useEffect(() => {
    if (isTopicTab) {
      loadThreads(topicsIds, 1, true);
    }
  }, [filters]);

  const postInstances = useMemo(() => (
    sortedPostsIds?.map((postId, idx) => (
      <PostLink
        postId={postId}
        idx={idx}
        key={postId}
        showDivider={(sortedPostsIds.length - 1) !== idx}
      />
    ))
  ), [sortedPostsIds]);

  return (
    <>
      {!parentIsLoading && postInstances}
      {sortedPostsIds?.length === 0 && loadingStatus === RequestStatus.SUCCESSFUL && <NoResults />}
      {loadingStatus === RequestStatus.IN_PROGRESS || parentIsLoading ? (
        <div className="d-flex justify-content-center p-4 mx-auto my-auto">
          <Spinner animation="border" variant="primary" size="lg" />
        </div>
      ) : (
        nextPage && loadingStatus === RequestStatus.SUCCESSFUL && (
          <Button onClick={() => loadThreads(topicsIds, nextPage)} variant="primary" size="md">
            {intl.formatMessage(messages.loadMorePosts)}
          </Button>
        )
      )}
    </>
  );
};

PostsList.propTypes = {
  postsIds: PropTypes.arrayOf(PropTypes.string),
  topicsIds: PropTypes.arrayOf(PropTypes.string),
  isTopicTab: PropTypes.bool,
  parentIsLoading: PropTypes.bool,
};

PostsList.defaultProps = {
  postsIds: [],
  topicsIds: undefined,
  isTopicTab: false,
  parentIsLoading: undefined,
};

export default React.memo(PostsList);
