import React, {
  useCallback, useContext, useEffect, useMemo,
} from 'react';
import PropTypes from 'prop-types';

import { useDispatch, useSelector } from 'react-redux';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import { Button, Spinner } from '@edx/paragon';

import { RequestStatus } from '../../data/constants';
import { DiscussionContext } from '../common/context';
import { selectconfigLoadingStatus, selectUserHasModerationPrivileges, selectUserIsStaff } from '../data/selectors';
import { fetchUserPosts } from '../learners/data/thunks';
import messages from '../messages';
import { filterPosts } from '../utils';
import {
  selectThreadFilters, selectThreadNextPage, selectThreadSorting, threadsLoadingStatus,
} from './data/selectors';
import { fetchThreads } from './data/thunks';
import NoResults from './NoResults';
import { PostLink } from './post';

function PostsList({ posts, topics, intl }) {
  const dispatch = useDispatch();
  const {
    courseId,
    page,
  } = useContext(DiscussionContext);
  const loadingStatus = useSelector(threadsLoadingStatus());
  const { authenticatedUser } = useContext(AppContext);
  const orderBy = useSelector(selectThreadSorting());
  const filters = useSelector(selectThreadFilters());
  const nextPage = useSelector(selectThreadNextPage());
  const showOwnPosts = page === 'my-posts';
  const userHasModerationPrivileges = useSelector(selectUserHasModerationPrivileges);
  const userIsStaff = useSelector(selectUserIsStaff);
  const configStatus = useSelector(selectconfigLoadingStatus);

  const loadThreads = (topicIds, pageNum = undefined) => {
    const params = {
      orderBy,
      filters,
      page: pageNum,
      author: showOwnPosts ? authenticatedUser.username : null,
      countFlagged: (userHasModerationPrivileges || userIsStaff) || undefined,
      topicIds,
    };

    if (showOwnPosts) {
      dispatch(fetchUserPosts(courseId, params));
    } else {
      dispatch(fetchThreads(courseId, params));
    }
  };

  useEffect(() => {
    if (topics !== undefined && configStatus === RequestStatus.SUCCESSFUL) {
      loadThreads(topics);
    }
  }, [courseId, orderBy, filters, page, JSON.stringify(topics), configStatus]);

  const checkIsSelected = (id) => window.location.pathname.includes(id);
  const pinnedPosts = useMemo(() => filterPosts(posts, 'pinned'), [posts]);
  const unpinnedPosts = useMemo(() => filterPosts(posts, 'unpinned'), [posts]);

  const postInstances = useCallback((sortedPosts) => (
    sortedPosts.map((post, idx) => (
      <PostLink
        post={post}
        key={post.id}
        isSelected={checkIsSelected}
        idx={idx}
        showDivider={(sortedPosts.length - 1) !== idx}
      />
    ))
  ), []);

  return (
    <>
      {postInstances(pinnedPosts)}
      {postInstances(unpinnedPosts)}
      {posts?.length === 0 && loadingStatus === RequestStatus.SUCCESSFUL && <NoResults />}
      {loadingStatus === RequestStatus.IN_PROGRESS ? (
        <div className="d-flex justify-content-center p-4">
          <Spinner animation="border" variant="primary" size="lg" />
        </div>
      ) : (
        nextPage && loadingStatus === RequestStatus.SUCCESSFUL && (
          <Button onClick={() => loadThreads(topics, nextPage)} variant="primary" size="md">
            {intl.formatMessage(messages.loadMorePosts)}
          </Button>
        )
      )}
    </>
  );
}

PostsList.propTypes = {
  posts: PropTypes.arrayOf(PropTypes.shape({
    pinned: PropTypes.bool.isRequired,
    id: PropTypes.string.isRequired,
  })),
  topics: PropTypes.arrayOf(PropTypes.string),
  intl: intlShape.isRequired,
};

PostsList.defaultProps = {
  posts: [],
  topics: undefined,
};

export default injectIntl(PostsList);
