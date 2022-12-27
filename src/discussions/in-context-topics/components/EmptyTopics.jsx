import React from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { useRouteMatch } from 'react-router';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import { ALL_ROUTES } from '../../../data/constants';
import { useIsOnDesktop } from '../../data/hooks';
import { selectPostThreadCount } from '../../data/selectors';
import EmptyPage from '../../empty-posts/EmptyPage';
import messages from '../../messages';
import { messages as postMessages, showPostEditor } from '../../posts';
import { selectCourseWareThreadsCount, selectTotalTopicsThreadsCount } from '../data/selectors';

function EmptyTopics({ intl }) {
  const match = useRouteMatch(ALL_ROUTES);
  const dispatch = useDispatch();

  const hasGlobalThreads = useSelector(selectTotalTopicsThreadsCount) > 0;
  const courseWareThreadsCount = useSelector(selectCourseWareThreadsCount(match.params.category));
  const topicThreadsCount = useSelector(selectPostThreadCount);

  console.log('topicThreadCount', topicThreadsCount);
  function addPost() {
    return dispatch(showPostEditor());
  }

  const isOnDesktop = useIsOnDesktop();

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
    if (courseWareThreadsCount > 0) {
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
      subTitle={subTitle ? intl.formatMessage(subTitle) : null}
      action={action}
      actionText={actionText ? intl.formatMessage(actionText) : null}
      fullWidth={fullWidth}
    />
  );
}

EmptyTopics.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(EmptyTopics);
