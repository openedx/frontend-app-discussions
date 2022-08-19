import React, { useContext, useEffect } from 'react';

import capitalize from 'lodash/capitalize';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  Button, Icon, IconButton, Spinner,
} from '@edx/paragon';
import { ArrowBack } from '@edx/paragon/icons';

import { RequestStatus, Routes } from '../../data/constants';
import { DiscussionContext } from '../common/context';
import {
  selectAllThreads,
  selectThreadNextPage,
  threadsLoadingStatus,
} from '../posts/data/selectors';
import NoResults from '../posts/NoResults';
import { PostLink } from '../posts/post';
import { discussionsPath } from '../utils';
import { fetchUserPosts } from './data/thunks';
import messages from './messages';

function LearnerPostsView({ intl }) {
  const location = useLocation();
  const history = useHistory();
  const dispatch = useDispatch();

  const posts = useSelector(selectAllThreads);
  const loadingStatus = useSelector(threadsLoadingStatus());
  const { courseId, learnerUsername: username } = useContext(DiscussionContext);
  const nextPage = useSelector(selectThreadNextPage());

  useEffect(() => {
    dispatch(fetchUserPosts(courseId, username));
  }, [courseId, username]);

  const loadMorePosts = () => (
    dispatch(fetchUserPosts(courseId, username, {
      page: nextPage,
    }))
  );

  const checkIsSelected = (id) => window.location.pathname.includes(id);

  let lastPinnedIdx = null;
  const postInstances = posts?.map((post, idx) => {
    if (post.pinned && lastPinnedIdx !== false) {
      lastPinnedIdx = idx;
    } else if (lastPinnedIdx != null && lastPinnedIdx !== false) {
      lastPinnedIdx = false;
      // Add a spacing after the group of pinned posts
      return (
        <React.Fragment key={post.id}>
          <PostLink post={post} key={post.id} isSelected={checkIsSelected} learnerTab showDivider />
        </React.Fragment>
      );
    }
    return (<PostLink post={post} key={post.id} isSelected={checkIsSelected} learnerTab />);
  });

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
      <div className="list-group list-group-flush">
        {postInstances}
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
