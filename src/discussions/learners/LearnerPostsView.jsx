import React, {
  useCallback, useContext, useEffect, useMemo, useState,
} from 'react';

import {
  Button, Icon, IconButton, Spinner, useToggle,
} from '@openedx/paragon';
import { ArrowBack } from '@openedx/paragon/icons';
import capitalize from 'lodash/capitalize';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

import { useIntl } from '@edx/frontend-platform/i18n';

import {
  ContentActions,
  RequestStatus,
  Routes,
} from '../../data/constants';
import useDispatchWithState from '../../data/hooks';
import { Confirmation } from '../common';
import DiscussionContext from '../common/context';
import {
  selectUserHasBulkDeletePrivileges,
  selectUserHasModerationPrivileges,
  selectUserIsStaff,
} from '../data/selectors';
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
import { BulkDeleteType } from './data/constants';
import { learnersLoadingStatus, selectBulkDeleteStats } from './data/selectors';
import { deleteUserPosts, fetchUserPosts } from './data/thunks';
import LearnerPostFilterBar from './learner-post-filter-bar/LearnerPostFilterBar';
import LearnerActionsDropdown from './LearnerActionsDropdown';
import messages from './messages';

const LearnerPostsView = () => {
  const intl = useIntl();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [bulkDeleting, dispatchDelete] = useDispatchWithState();
  const postsIds = useSelector(selectAllThreadsIds);
  const loadingStatus = useSelector(threadsLoadingStatus());
  const learnerLoadingStatus = useSelector(learnersLoadingStatus());
  const postFilter = useSelector(state => state.learners.postFilter);
  const { courseId, learnerUsername: username } = useContext(DiscussionContext);
  const nextPage = useSelector(selectThreadNextPage());
  const userHasModerationPrivileges = useSelector(selectUserHasModerationPrivileges);
  const userIsStaff = useSelector(selectUserIsStaff);
  const userHasBulkDeletePrivileges = useSelector(selectUserHasBulkDeletePrivileges);
  const bulkDeleteStats = useSelector(selectBulkDeleteStats());
  const sortedPostsIds = usePostList(postsIds);
  const [isDeleting, showDeleteConfirmation, hideDeleteConfirmation] = useToggle(false);
  const [isDeletingCourseOrOrg, setIsDeletingCourseOrOrg] = useState(BulkDeleteType.COURSE);

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

  const handleShowDeleteConfirmation = useCallback(async (courseOrOrg) => {
    setIsDeletingCourseOrOrg(courseOrOrg);
    showDeleteConfirmation();
    await dispatch(deleteUserPosts(courseId, username, courseOrOrg, false));
  }, [courseId, username, showDeleteConfirmation]);

  const handleDeletePosts = useCallback(async (courseOrOrg) => {
    await dispatchDelete(deleteUserPosts(courseId, username, courseOrOrg, true));
    navigate({ ...discussionsPath(Routes.LEARNERS.PATH, { courseId })(location) });
    hideDeleteConfirmation();
  }, [courseId, username, hideDeleteConfirmation]);

  const actionHandlers = useMemo(() => ({
    [ContentActions.DELETE_COURSE_POSTS]: () => handleShowDeleteConfirmation(BulkDeleteType.COURSE),
    [ContentActions.DELETE_ORG_POSTS]: () => handleShowDeleteConfirmation(BulkDeleteType.ORG),
  }), [handleShowDeleteConfirmation]);

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
      <div className="row d-flex align-items-center justify-content-between px-2.5">
        <div className="col-1">
          <IconButton
            src={ArrowBack}
            iconAs={Icon}
            style={{ padding: '18px' }}
            size="inline"
            onClick={() => navigate({ ...discussionsPath(Routes.LEARNERS.PATH, { courseId })(location) })}
            alt={intl.formatMessage(messages.back)}
          />
        </div>
        <div className=" col-auto text-primary-500 font-style font-weight-bold py-2.5">
          {intl.formatMessage(messages.activityForLearner, { username: capitalize(username) })}
        </div>
        {userHasBulkDeletePrivileges ? (
          <div className="col-2">
            <LearnerActionsDropdown
              id={username}
              actionHandlers={actionHandlers}
              userHasBulkDeletePrivileges={userHasBulkDeletePrivileges}
              dropDownIconSize
            />
          </div>
        )
          : (<div style={{ padding: '18px' }} />)}
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
      <Confirmation
        isOpen={isDeleting}
        title={intl.formatMessage(messages.deletePostsTitle)}
        description={intl.formatMessage(messages.deletePostsDescription, {
          count: bulkDeleteStats.threadCount + bulkDeleteStats.commentCount,
          bulkType: isDeletingCourseOrOrg,
        })}
        boldDescription={intl.formatMessage(messages.deletePostsBoldDescription)}
        onClose={hideDeleteConfirmation}
        confirmAction={() => handleDeletePosts(isDeletingCourseOrOrg)}
        confirmButtonText={intl.formatMessage(messages.deletePostsConfirm)}
        confirmButtonVariant="danger"
        isDataLoading={!(learnerLoadingStatus === RequestStatus.SUCCESSFUL)}
        isConfirmButtonPending={bulkDeleting}
        pendingConfirmButtonText={intl.formatMessage(messages.deletePostConfirmPending)}
      />
    </div>
  );
};

export default LearnerPostsView;
