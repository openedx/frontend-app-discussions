import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import classNames from 'classnames';

import { useWindowSize } from '@edx/paragon';

import {
  useContainerSize, useEnableInContextSidebar, useIsOnDesktop, useIsOnXLDesktop,
} from '../data/hooks';

const ResizableSidebar = ({ children, postActionBarRef }) => {
  const sidebarRef = useRef(null);
  const isOnDesktop = useIsOnDesktop();
  const isOnXLDesktop = useIsOnXLDesktop();
  const enableInContextSidebar = useEnableInContextSidebar();
  const postActionBarHeight = useContainerSize(postActionBarRef);
  const { height: windowHeight } = useWindowSize();

  useEffect(() => {
    if (sidebarRef && postActionBarHeight && !enableInContextSidebar) {
      if (isOnDesktop) {
        sidebarRef.current.style.maxHeight = `${windowHeight - postActionBarHeight}px`;
      }
      sidebarRef.current.style.minHeight = `${windowHeight - postActionBarHeight}px`;
      sidebarRef.current.style.top = `${postActionBarHeight}px`;
    }
  }, [sidebarRef, postActionBarHeight, enableInContextSidebar]);

  return (
    <div
      data-testid="sidebar"
      ref={sidebarRef}
      className={classNames('flex-column position-sticky d-flex overflow-auto box-shadow-centered-1', {
        'w-100': !isOnDesktop,
        'sidebar-desktop-width': isOnDesktop && !isOnXLDesktop,
        'w-25 sidebar-XL-width': isOnXLDesktop,
        'min-content-height': !enableInContextSidebar,
      })}
    >
      {children}
    </div>
  );
};

ResizableSidebar.propTypes = {
  children: PropTypes.node.isRequired,
  postActionBarRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  ]).isRequired,
};

export default React.memo(ResizableSidebar);
