import React, { lazy, useRef } from 'react';
import PropTypes from 'prop-types';

import classNames from 'classnames';

import { useEnableInContextSidebar } from '../data/hooks';
import DiscussionsProductTour from '../tours/DiscussionsProductTour';
import DiscussionActionBar from './DiscussionActionBar';
import DiscussionFooter from './DiscussionFooter';
import DiscussionHeader from './DiscussionHeader';
import DiscussionSidebar from './DiscussionSidebar';
import InfoPage from './InfoPage';
import LayoutSwitcher from './LayoutSwitcher';
import LegacyBreadcrumb from './LegacyBreadcrumb';

const DiscussionsRestrictionBanner = lazy(() => import('./DiscussionsRestrictionBanner'));

const DiscussionsLayout = ({ children }) => {
  const postActionBarRef = useRef(null);
  const enableInContextSidebar = useEnableInContextSidebar();

  return (
    <>
      <DiscussionHeader />
      <main className="container-fluid d-flex flex-column p-0 w-100" id="main" tabIndex="-1">
        <div
          ref={postActionBarRef}
          className={classNames('header-action-bar', {
            'shadow-none border-light-300 border-bottom': enableInContextSidebar,
          })}
        >
          <DiscussionActionBar />
          <DiscussionsRestrictionBanner />
        </div>
        <LegacyBreadcrumb />
        <LayoutSwitcher
          sidebar={<DiscussionSidebar postActionBarRef={postActionBarRef} />}
          infoPage={<InfoPage />}
        >
          {children}
        </LayoutSwitcher>
        <DiscussionsProductTour />
      </main>
      <DiscussionFooter />
    </>
  );
};

DiscussionsLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default React.memo(DiscussionsLayout);
