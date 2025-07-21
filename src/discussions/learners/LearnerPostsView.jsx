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
import { Confirmation } from '../common';
import DiscussionContext from '../common/context';
import { ContentTypes } from '../data/constants';
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
import { deleteCourseUserPosts, deleteOrgUserPosts, fetchUserPosts } from './data/thunks';
import LearnerPostFilterBar from './learner-post-filter-bar/LearnerPostFilterBar';
import LearnerActionsDropdown from './LearnerActionsDropdown';
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
  const userHasBulkDeletePrivileges = useSelector(selectUserHasBulkDeletePrivileges);
  const sortedPostsIds = usePostList(postsIds);
  const [isDeletingCourse, showDeleteCourseConfirmation, hideDeleteCourseConfirmation] = useToggle(false);
  const [isDeletingOrg, showDeleteOrgConfirmation, hideDeleteOrgConfirmation] = useToggle(false);
  const [courseDeleteCounts, setCourseDeleteCounts] = useState({ threadCount: 0, commentCount: 0 });
  const [orgDeleteCounts, setOrgDeleteCounts] = useState({ threadCount: 0, commentCount: 0 });
  const [isLoadingCoursePostsStats, setIsLoadingCoursePostsStats] = useState(false);
  const [isLoadingOrgPostsStats, setIsLoadingOrgPostsStats] = useState(false);

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

  const handleShowDeleteCourseConfirmation = useCallback(async () => {
    setIsLoadingCoursePostsStats(true);
    showDeleteCourseConfirmation();
    const counts = await dispatch(deleteCourseUserPosts(courseId, username, false));
    setCourseDeleteCounts({ threadCount: counts.threadCount, commentCount: counts.commentCount });
    setIsLoadingCoursePostsStats(false);
  }, [courseId, username, showDeleteCourseConfirmation]);

  const handleShowDeleteOrgConfirmation = useCallback(async () => {
    setIsLoadingOrgPostsStats(true);
    showDeleteOrgConfirmation();
    const counts = await dispatch(deleteOrgUserPosts(courseId, username, false));
    setOrgDeleteCounts({ threadCount: counts.threadCount, commentCount: counts.commentCount });
    setIsLoadingOrgPostsStats(false);
  }, [courseId, username, showDeleteOrgConfirmation]);

  const handleDeleteCoursePosts = useCallback(async () => {
    await dispatch(deleteCourseUserPosts(courseId, username, true));
    dispatch(clearPostsPages());
    loadMorePosts();
    hideDeleteCourseConfirmation();
  }, [courseId, username, hideDeleteCourseConfirmation]);

  const handleDeleteOrgPosts = useCallback(async () => {
    await dispatch(deleteOrgUserPosts(courseId, username, true));
    dispatch(clearPostsPages());
    loadMorePosts();
    hideDeleteOrgConfirmation();
  }, [courseId, username, hideDeleteOrgConfirmation]);

  const actionHandlers = useMemo(() => ({
    [ContentActions.DELETE_COURSE_POSTS]: handleShowDeleteCourseConfirmation,
    [ContentActions.DELETE_ORG_POSTS]: handleShowDeleteOrgConfirmation,
  }), [handleShowDeleteCourseConfirmation, handleShowDeleteOrgConfirmation]);

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
      <Confirmation
        isOpen={isDeletingCourse}
        title={intl.formatMessage(messages.deleteCoursePostsTitle)}
        description={!isLoadingCoursePostsStats ? intl.formatMessage(messages.deleteCoursePostsDescription, {
          count: courseDeleteCounts.threadCount + courseDeleteCounts.commentCount,
        }) : ''}
        boldDescription={intl.formatMessage(messages.deletePostsBoldDescription)}
        onClose={hideDeleteCourseConfirmation}
        confirmAction={handleDeleteCoursePosts}
        confirmButtonText={intl.formatMessage(messages.deletePostsConfirm)}
        confirmButtonVariant="danger"
        isDataLoading={isLoadingCoursePostsStats}
      />
      <Confirmation
        isOpen={isDeletingOrg}
        title={intl.formatMessage(messages.deleteOrgPostsTitle)}
        description={!isLoadingOrgPostsStats ? intl.formatMessage(messages.deleteOrgPostsDescription, {
          count: orgDeleteCounts.threadCount + orgDeleteCounts.commentCount,
        }) : ''}
        boldDescription={intl.formatMessage(messages.deletePostsBoldDescription)}
        onClose={hideDeleteOrgConfirmation}
        confirmAction={handleDeleteOrgPosts}
        confirmButtonText={intl.formatMessage(messages.deletePostsConfirm)}
        confirmButtonVariant="danger"
        isDataLoading={isLoadingOrgPostsStats}
      />
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
              contentType={ContentTypes.LEARNER}
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
    </div>
  );
};

export default LearnerPostsView;
