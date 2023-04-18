import React, { useCallback, useContext } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { useRouteMatch } from 'react-router';

import { useIntl } from '@edx/frontend-platform/i18n';

import { ALL_ROUTES } from '../../../data/constants';
import { DiscussionContext } from '../../common/context';
import { useIsOnDesktop } from '../../data/hooks';
import { selectPostThreadCount } from '../../data/selectors';
import EmptyPage from '../../empty-posts/EmptyPage';
import messages from '../../messages';
import { messages as postMessages, showPostEditor } from '../../posts';
import { selectCourseWareThreadsCount, selectTotalTopicsThreadsCount } from '../data/selectors';

const EmptyTopics = () => {
  const intl = useIntl();
  const match = useRouteMatch(ALL_ROUTES);
  const dispatch = useDispatch();
  const isOnDesktop = useIsOnDesktop();
  const { enableInContextSidebar } = useContext(DiscussionContext);
  const courseWareThreadsCount = useSelector(selectCourseWareThreadsCount(match.params.category));
  const topicThreadsCount = useSelector(selectPostThreadCount);
  // hasGlobalThreads is used to determine if there are any post available in courseware and non-courseware topics
  const hasGlobalThreads = useSelector(selectTotalTopicsThreadsCount) > 0;

  const addPost = useCallback(() => (
    dispatch(showPostEditor())
  ), []);

  let title = messages.emptyTitle;
  let fullWidth = false;
  let subTitle;
  let action;
  let actionText;

  if (!isOnDesktop) {
    return null;
  }

  if (match.params.topicId) {
    if (topicThreadsCount > 0) {
      title = messages.noPostSelected;
    } else {
      action = addPost;
      actionText = postMessages.addAPost;
      subTitle = messages.emptyTopic;
      fullWidth = true;
    }
  } else if (match.params.category) {
    if (enableInContextSidebar && topicThreadsCount > 0) {
      title = messages.noPostSelected;
    } else if (courseWareThreadsCount > 0) {
      title = messages.noTopicSelected;
    } else {
      action = addPost;
      actionText = postMessages.addAPost;
      subTitle = messages.emptyTopic;
      fullWidth = true;
    }
  } else if (hasGlobalThreads) {
    title = messages.noTopicSelected;
  } else {
    fullWidth = true;
  }

  return (
    <EmptyPage
      title={intl.formatMessage(title)}
      subTitle={subTitle && intl.formatMessage(subTitle)}
      action={action}
      actionText={actionText && intl.formatMessage(actionText)}
      fullWidth={fullWidth}
    />
  );
};

export default React.memo(EmptyTopics);
