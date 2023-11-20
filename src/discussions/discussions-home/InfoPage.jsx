import React from 'react';

import { useSelector } from 'react-redux';
import { Route, Switch } from 'react-router';

import { Routes } from '../../data/constants';
import { useEnableInContextSidebar, useShowLearnersTab } from '../data/hooks';
import { selectEnableInContext } from '../data/selectors';
import { EmptyLearners, EmptyPosts, EmptyTopics } from '../empty-posts';
import { EmptyTopic as InContextEmptyTopics } from '../in-context-topics/components';
import messages from '../messages';

const InfoPage = () => {
  const enableInContext = useSelector(selectEnableInContext);
  const isRedirectToLearners = useShowLearnersTab();
  const enableInContextSidebar = useEnableInContextSidebar();

  return (
    <Switch>
      <Route
        path={Routes.TOPICS.PATH}
        component={(enableInContext || enableInContextSidebar) ? InContextEmptyTopics : EmptyTopics}
      />
      <Route
        path={Routes.POSTS.MY_POSTS}
        render={routeProps => <EmptyPosts {...routeProps} subTitleMessage={messages.emptyMyPosts} />}
      />
      <Route
        path={[Routes.POSTS.PATH, Routes.POSTS.ALL_POSTS, Routes.LEARNERS.POSTS]}
        render={routeProps => <EmptyPosts {...routeProps} subTitleMessage={messages.emptyAllPosts} />}
      />
      {isRedirectToLearners && <Route path={Routes.LEARNERS.PATH} component={EmptyLearners} />}
    </Switch>
  );
};

export default React.memo(InfoPage);
