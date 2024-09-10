import React, {
  useCallback, useContext, useEffect, useMemo,
} from 'react';

import {
  Button, Icon, IconButton, Spinner,
} from '@openedx/paragon';
import { ArrowBack } from '@openedx/paragon/icons';
import capitalize from 'lodash/capitalize';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

import { useIntl } from '@edx/frontend-platform/i18n';

import {
  RequestStatus,
  Routes,
} from '../../data/constants';
import DiscussionContext from '../common/context';
import { selectUserHasModerationPrivileges, selectUserIsStaff } from '../data/selectors';
import usePostList from '../posts/data/hooks';
import {
  selectAllThreadsIds,
  selectThreadNextPage,
  threadsLoadingStatus,
} from '../posts/data/selectors';
import { clearPostsPages } from '../posts/data/slices';
import NoResults from '../posts/NoResults';
import { PostLink } from '../posts/post';
import { discussionsPath } from '../utils';
import { fetchUserPosts } from './data/thunks';
import LearnerPostFilterBar from './learner-post-filter-bar/LearnerPostFilterBar';
import messages from './messages';

const LearnerPostsView = () => {
  const intl = useIntl();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const postsIds = useSelector(selectAllThreadsIds);
  const loadingStatus = useSelector(threadsLoadingStatus());
  const postFilter = useSelector(state => state.learners.postFilter);
  const { courseId, learnerUsername: username } = useContext(DiscussionContext);
  const nextPage = useSelector(selectThreadNextPage());
  const userHasModerationPrivileges = useSelector(selectUserHasModerationPrivileges);
  const userIsStaff = useSelector(selectUserIsStaff);
  const sortedPostsIds = usePostList(postsIds);

  const loadMorePosts = useCallback((pageNum = undefined) => {
    const params = {
      author: username,
      page: pageNum,
      filters: postFilter,
      orderBy: postFilter.orderBy,
      countFlagged: (userHasModerationPrivileges || userIsStaff) || undefined,
    };

    dispatch(fetchUserPosts(courseId, params));
  }, [courseId, postFilter, username, userHasModerationPrivileges, userIsStaff]);

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

  useEffect(() => {
    dispatch(clearPostsPages());
    loadMorePosts();
  }, [courseId, postFilter, username]);

  return (
    <div className="discussion-posts d-flex flex-column">
      <div className="d-flex align-items-center justify-content-between px-2.5">
        <IconButton
          src={ArrowBack}
          iconAs={Icon}
          style={{ padding: '18px' }}
          size="inline"
          onClick={() => navigate({ ...discussionsPath(Routes.LEARNERS.PATH, { courseId })(location) })}
          alt={intl.formatMessage(messages.back)}
        />
        <div className="text-primary-500 font-style font-weight-bold py-2.5">
          {intl.formatMessage(messages.activityForLearner, { username: capitalize(username) })}
        </div>
        <div style={{ padding: '18px' }} />
      </div>
      <div className="bg-light-400 border border-light-300" />
      <LearnerPostFilterBar />
      <div className="border-bottom border-light-400" />
      <div className="list-group list-group-flush">
        {postInstances}
        {loadingStatus !== RequestStatus.IN_PROGRESS && sortedPostsIds?.length === 0 && <NoResults />}
        {loadingStatus === RequestStatus.IN_PROGRESS ? (
          <div className="d-flex justify-content-center p-4">
            <Spinner animation="border" variant="primary" size="lg" />
          </div>
        ) : (
          nextPage && loadingStatus === RequestStatus.SUCCESSFUL && (
            <Button onClick={() => loadMorePosts(nextPage)} variant="primary" size="md" data-testid="load-more-posts">
              {intl.formatMessage(messages.loadMore)}
            </Button>
          )
        )}
      </div>
    </div>
  );
};

export default LearnerPostsView;
