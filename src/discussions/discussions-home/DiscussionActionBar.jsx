import React, { memo } from 'react';

import classNames from 'classnames';

import { useEnableInContextSidebar } from '../data/hooks';
import NavigationBar from '../navigation/navigation-bar/NavigationBar';
import PostActionsBar from '../posts/post-actions-bar/PostActionsBar';

const DiscussionActionBar = () => {
  const enableInContextSidebar = useEnableInContextSidebar();

  return (
    <div
      className={classNames('d-flex flex-row justify-content-between navbar fixed-top', {
        'pl-4 pr-3 py-0': enableInContextSidebar,
      })}
    >
      <NavigationBar />
      <PostActionsBar />
    </div>
  );
};

export default memo(DiscussionActionBar);
