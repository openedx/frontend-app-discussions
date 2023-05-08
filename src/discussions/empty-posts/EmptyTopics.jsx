import React, { useCallback } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { useRouteMatch } from 'react-router';

import { useIntl } from '@edx/frontend-platform/i18n';

import { ALL_ROUTES } from '../../data/constants';
import { useIsOnDesktop, useTotalTopicThreadCount } from '../data/hooks';
import { selectTopicThreadCount } from '../data/selectors';
import messages from '../messages';
import { messages as postMessages, showPostEditor } from '../posts';
import EmptyPage from './EmptyPage';

const EmptyTopics = () => {
  const intl = useIntl();
  const match = useRouteMatch(ALL_ROUTES);
  const dispatch = useDispatch();
  const isOnDesktop = useIsOnDesktop();
  const hasGlobalThreads = useTotalTopicThreadCount() > 0;
  const topicThreadCount = useSelector(selectTopicThreadCount(match.params.topicId));

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
    if (topicThreadCount > 0) {
      title = messages.noPostSelected;
    } else {
      action = addPost;
      actionText = postMessages.addAPost;
      subTitle = messages.emptyTopic;
      fullWidth = true;
    }
  } else if (hasGlobalThreads) {
    title = messages.noTopicSelected;
  } else {
    action = addPost;
    actionText = postMessages.addAPost;
    subTitle = messages.emptyAllTopics;
    fullWidth = true;
  }

  return (
    <EmptyPage
      title={intl.formatMessage(title)}
      subTitle={subTitle ? intl.formatMessage(subTitle) : null}
      action={action}
      actionText={actionText ? intl.formatMessage(actionText) : null}
      fullWidth={fullWidth}
    />
  );
};

export default EmptyTopics;
