import React from 'react';
import PropTypes from 'prop-types';

import classNames from 'classnames';
import { useSelector } from 'react-redux';
import {
  Redirect, Route, Switch, useLocation,
} from 'react-router';

import { RequestStatus, Routes } from '../../data/constants';
import { useIsOnDesktop, useIsOnXLDesktop } from '../data/hooks';
import { selectconfigLoadingStatus, selectUserHasModerationPrivileges, selectUserIsGroupTa } from '../data/selectors';
import { LearnerPostsView, LearnersView } from '../learners';
import { PostsView } from '../posts';
import { TopicsView } from '../topics';

export default function DiscussionSidebar({ displaySidebar }) {
  const location = useLocation();
  const isOnDesktop = useIsOnDesktop();
  const isOnXLDesktop = useIsOnXLDesktop();
  const userHasModerationPrivileges = useSelector(selectUserHasModerationPrivileges);
  const userIsGroupTa = useSelector(selectUserIsGroupTa);
  const configStatus = useSelector(selectconfigLoadingStatus);

  return (
    <div
      className={classNames('flex-column', {
        'd-none': !displaySidebar,
        'd-flex h-100 overflow-auto': displaySidebar,
        'w-100': !isOnDesktop,
        'sidebar-desktop-width': isOnDesktop && !isOnXLDesktop,
        'w-25 sidebar-XL-width': isOnXLDesktop,
      })}
      data-testid="sidebar"
    >
      <Switch>
        <Route
          path={[Routes.POSTS.PATH, Routes.POSTS.ALL_POSTS, Routes.TOPICS.CATEGORY, Routes.POSTS.MY_POSTS]}
          component={PostsView}
        />
        <Route path={Routes.TOPICS.PATH} component={TopicsView} />
        <Route path={Routes.LEARNERS.POSTS} component={LearnerPostsView} />
        <Route path={Routes.LEARNERS.PATH} component={LearnersView} />
        {configStatus === RequestStatus.SUCCESSFUL && (
          <Redirect
            from={Routes.DISCUSSIONS.PATH}
            to={{
              ...location,
              pathname: (userHasModerationPrivileges || userIsGroupTa) ? Routes.POSTS.ALL_POSTS : Routes.POSTS.MY_POSTS,
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
