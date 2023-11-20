import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import { useSelector } from 'react-redux';

import {
  useIsOnDesktop, useLearnerUsername, usePostId, useSidebarVisible,
} from '../data/hooks';
import { selectPostEditorVisible } from '../posts/data/selectors';

const LayoutSwitcher = ({ children, sidebar, infoPage }) => {
  const postId = usePostId();
  const learnerUsername = useLearnerUsername();
  const isOnDesktop = useIsOnDesktop();
  let displaySidebar = useSidebarVisible();
  const postEditorVisible = useSelector(selectPostEditorVisible);

  const displayContentArea = useMemo(() => {
    const isContentVisible = postId || postEditorVisible || (learnerUsername && postId);
    if (isContentVisible) {
      displaySidebar = isOnDesktop;
    }
    return isContentVisible;
  }, [postId, postEditorVisible, learnerUsername, isOnDesktop]);

  return (
    <div className="d-flex flex-row position-relative">
      {displaySidebar && sidebar }
      {displayContentArea ? children : infoPage }
    </div>
  );
};

LayoutSwitcher.propTypes = {
  children: PropTypes.node.isRequired,
  sidebar: PropTypes.node.isRequired,
  infoPage: PropTypes.node.isRequired,
};

export default React.memo(LayoutSwitcher);
