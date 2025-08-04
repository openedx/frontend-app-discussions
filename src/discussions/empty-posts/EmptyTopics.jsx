import React, { useCallback } from 'react';
import propTypes from 'prop-types';

import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { useIntl } from '@edx/frontend-platform/i18n';

import withPostingRestrictions from '../common/withPostingRestrictions';
import { useIsOnTablet, useTotalTopicThreadCount } from '../data/hooks';
import { selectContentCreationRateLimited, selectShouldShowEmailConfirmation, selectTopicThreadCount } from '../data/selectors';
import messages from '../messages';
import { showPostEditor } from '../posts/data';
import postMessages from '../posts/post-actions-bar/messages';
import EmptyPage from './EmptyPage';

const EmptyTopics = ({ openRestrictionDialogue }) => {
  const intl = useIntl();
  const { topicId } = useParams();
  const dispatch = useDispatch();
  const isOnTabletorDesktop = useIsOnTablet();
  const hasGlobalThreads = useTotalTopicThreadCount() > 0;
  const topicThreadCount = useSelector(selectTopicThreadCount(topicId));
  const shouldShowEmailConfirmation = useSelector(selectShouldShowEmailConfirmation);
  const contentCreationRateLimited = useSelector(selectContentCreationRateLimited);

  const addPost = useCallback(() => {
    if (shouldShowEmailConfirmation || contentCreationRateLimited) {
      openRestrictionDialogue();
    } else {
      dispatch(showPostEditor());
    }
  }, [shouldShowEmailConfirmation, openRestrictionDialogue, contentCreationRateLimited]);

  let title = messages.emptyTitle;
  let fullWidth = false;
  let subTitle;
  let action;
  let actionText;

  if (!isOnTabletorDesktop) {
    return null;
  }

  if (topicId) {
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

EmptyTopics.propTypes = {
  openRestrictionDialogue: propTypes.func.isRequired,
};

export default React.memo(withPostingRestrictions(EmptyTopics));
