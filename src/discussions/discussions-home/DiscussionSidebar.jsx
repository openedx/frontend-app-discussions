import React, { useContext } from 'react';
import PropTypes from 'prop-types';

import classNames from 'classnames';
import { useSelector } from 'react-redux';
import {
  Redirect, Route, Switch, useLocation,
} from 'react-router';

import { AppContext } from '@edx/frontend-platform/react';

import { RequestStatus, Routes } from '../../data/constants';
import { PostsView } from '../posts';
import {
  selectAllThreads, threadsLoadingStatus,
} from '../posts/data/selectors';
import { TopicsView } from '../topics';

export default function DiscussionSidebar({ displaySidebar }) {
  const location = useLocation();
  const AllThreads = useSelector(selectAllThreads);
  const { authenticatedUser } = useContext(AppContext);
  const userThreads = AllThreads.filter(thread => thread.author === authenticatedUser.username);
  const loadingStatus = useSelector(threadsLoadingStatus());

  return (
    <div
      className={classNames('flex-column', {
        'd-none': !displaySidebar,
        'd-flex w-25 w-xs-100 w-lg-25 overflow-auto h-100 pb-2': displaySidebar,
      })}
      style={{ minWidth: '30rem' }}
      data-testid="sidebar"
    >
      <Switch>
        <Route path={Routes.POSTS.MY_POSTS}>
          <PostsView showOwnPosts />
        </Route>
        <Route
          path={[Routes.POSTS.PATH, Routes.POSTS.ALL_POSTS, Routes.TOPICS.CATEGORY]}
          component={PostsView}
        />
        <Route path={Routes.TOPICS.PATH} component={TopicsView} />
        {RequestStatus.SUCCESSFUL === loadingStatus && (
        <Redirect
          from={Routes.DISCUSSIONS.PATH}
          to={{
            ...location,
            pathname: userThreads.length ? Routes.POSTS.MY_POSTS : Routes.POSTS.ALL_POSTS,
          }}
        />
        )}
      </Switch>
    </div>
  );
}

DiscussionSidebar.defaultProps = {
  displaySidebar: false,
};

DiscussionSidebar.propTypes = {
  displaySidebar: PropTypes.bool,
};
