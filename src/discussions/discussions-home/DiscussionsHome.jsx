import React, { lazy, Suspense, useMemo } from 'react';

import { useRouteMatch } from 'react-router';

import { Spinner } from '../../components';
import { ALL_ROUTES } from '../../data/constants';
import { DiscussionContext } from '../common/context';
import {
  useCourseDiscussionData, useCurrentPage, useEnableInContextSidebar, useRedirectToThread,
} from '../data/hooks';
import DiscussionLayout from './DiscussionLayout';
import useFeedbackWrapper from './FeedbackWrapper';

const DiscussionContent = lazy(() => import('./DiscussionContent'));

const DiscussionsHome = () => {
  useCourseDiscussionData();
  useRedirectToThread();
  useFeedbackWrapper();
  const page = useCurrentPage();
  const enableInContextSidebar = useEnableInContextSidebar();
  const {
    params: {
      courseId, postId, topicId, category, learnerUsername,
    },
  } = useRouteMatch(ALL_ROUTES);

  const contextValues = useMemo(() => ({
    page,
    courseId,
    postId,
    topicId,
    enableInContextSidebar,
    category,
    learnerUsername,
  }), [page, courseId, postId, topicId, enableInContextSidebar, category, learnerUsername]);

  return (
    <Suspense fallback={(<Spinner />)}>
      <DiscussionLayout>
        <DiscussionContext.Provider value={contextValues}>
          <DiscussionContent />
        </DiscussionContext.Provider>
      </DiscussionLayout>
    </Suspense>
  );
};

export default React.memo(DiscussionsHome);
