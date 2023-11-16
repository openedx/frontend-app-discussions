import React, { memo } from 'react';

import { useSelector } from 'react-redux';
import { Route } from 'react-router-dom';

import { DiscussionProvider, Routes } from '../../data/constants';
import { selectDiscussionProvider } from '../data/selectors';
import LegacyBreadcrumbMenu from '../navigation/breadcrumb-menu/LegacyBreadcrumbMenu';

const LegacyBreadcrumb = () => {
  const provider = useSelector(selectDiscussionProvider);

  return (
    provider === DiscussionProvider.LEGACY && (
      <Route
        path={[Routes.POSTS.PATH, Routes.TOPICS.CATEGORY]}
        component={LegacyBreadcrumbMenu}
      />
    )
  );
};

export default memo(LegacyBreadcrumb);
