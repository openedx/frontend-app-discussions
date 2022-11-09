import React, {
  useCallback, useContext, useEffect, useMemo,
} from 'react';

import snakeCase from 'lodash.snakecase';
import capitalize from 'lodash/capitalize';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  Button, Icon, IconButton, Spinner,
} from '@edx/paragon';
import { ArrowBack } from '@edx/paragon/icons';

import {
  PostsStatusFilter,
  RequestStatus,
  Routes,
  ThreadType,
} from '../../data/constants';
import { DiscussionContext } from '../common/context';
import { selectUserHasModerationPrivileges, selectUserIsStaff } from '../data/selectors';
import {
  selectAllThreads,
  selectThreadFilters,
  selectThreadNextPage,
  selectThreadSorting,
  threadsLoadingStatus,
} from '../posts/data/selectors';
import { clearPostsPages } from '../posts/data/slices';
import NoResults from '../posts/NoResults';
import { PostLink } from '../posts/post';
import { discussionsPath, filterPosts } from '../utils';
import { fetchUserPosts } from './data/thunks';
import LearnerPostFilterBar from './learner-post-filter-bar/LearnerPostFilterBar';
import messages from './messages';

function LearnerPostsView({ intl }) {
  const location = useLocation();
  const history = useHistory();
  const dispatch = useDispatch();

  const posts = useSelector(selectAllThreads);
  const orderBy = useSelector(selectThreadSorting());
  const filters = useSelector(selectThreadFilters());
  const loadingStatus = useSelector(threadsLoadingStatus());
  const postFilter = useSelector(state => state.learners.postFilter);
  const { courseId, learnerUsername: username } = useContext(DiscussionContext);
  const nextPage = useSelector(selectThreadNextPage());
  const userHasModerationPrivileges = useSelector(selectUserHasModerationPrivileges);
  const userIsStaff = useSelector(selectUserIsStaff);
  const countFlagged = userHasModerationPrivileges || userIsStaff;
  const params = {
    orderBy: snakeCase(postFilter.orderBy),
    username,
    page: 1,
  };
  if (postFilter.type !== ThreadType.ALL) {
    params.threadType = postFilter.type;
  }
  if (postFilter.status !== PostsStatusFilter.ALL) {
    const statusMapping = {
      statusUnread: 'unread',
      statusReported: 'flagged',
      statusUnanswered: 'unanswered',
      statusUnresponded: 'unresponded',
    };
    params.status = statusMapping[postFilter.status];
  }
  if (postFilter.cohort !== '') {
    params.groupId = postFilter.cohort;
  }
  if (countFlagged) {
    params.countFlagged = countFlagged;
  }

  useEffect(() => {
    dispatch(fetchUserPosts(courseId, {
      author: username,
      orderBy,
      filters,
    }));
  }, [courseId, username, orderBy, filters]);

  useEffect(() => {
    dispatch(clearPostsPages());
    dispatch(fetchUserPosts(courseId, params));
  }, [postFilter]);

  const loadMorePosts = () => (
    dispatch(fetchUserPosts(courseId, {
      author: username,
      page: nextPage,
      orderBy,
      filters,
    }))
  );

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
    <div className="discussion-posts d-flex flex-column">
      <div className="d-flex align-items-center justify-content-between px-2.5">
        <IconButton
          src={ArrowBack}
          iconAs={Icon}
          style={{ padding: '18px' }}
          size="inline"
          onClick={() => history.push(discussionsPath(Routes.LEARNERS.PATH, { courseId })(location))}
          alt={intl.formatMessage(messages.back)}
        />
        <div className="text-primary-500 font-style-normal font-family-inter font-weight-bold py-2.5">
          {intl.formatMessage(messages.activityForLearner, { username: capitalize(username) })}
        </div>
        <div style={{ padding: '18px' }} />
      </div>
      <div className="bg-light-400 border border-light-300" />
      <LearnerPostFilterBar />
      <div className="list-group list-group-flush">
        {postInstances(pinnedPosts)}
        {postInstances(unpinnedPosts)}
        {loadingStatus !== RequestStatus.IN_PROGRESS && posts?.length === 0 && <NoResults />}
        {loadingStatus === RequestStatus.IN_PROGRESS ? (
          <div className="d-flex justify-content-center p-4">
            <Spinner animation="border" variant="primary" size="lg" />
          </div>
        ) : (
          nextPage && loadingStatus === RequestStatus.SUCCESSFUL && (
            <Button onClick={() => loadMorePosts()} variant="primary" size="md">
              {intl.formatMessage(messages.loadMore)}
            </Button>
          )
        )}
      </div>
    </div>
  );
}

LearnerPostsView.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(LearnerPostsView);
