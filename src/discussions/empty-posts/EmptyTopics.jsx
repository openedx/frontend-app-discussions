import React, { useCallback, useEffect, useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { useIntl } from '@edx/frontend-platform/i18n';

import { RequestStatus } from '../../data/constants';
import { Confirmation } from '../common';
import { useIsOnTablet, useTotalTopicThreadCount } from '../data/hooks';
import {
  selectConfirmEmailStatus, selectIsEmailVerified, selectOnlyVerifiedUsersCanPost, selectTopicThreadCount,
} from '../data/selectors';
import messages from '../messages';
import { showPostEditor } from '../posts/data';
import { sendAccountActivationEmail } from '../posts/data/thunks';
import postMessages from '../posts/post-actions-bar/messages';
import EmptyPage from './EmptyPage';

const EmptyTopics = () => {
  const intl = useIntl();
  const { topicId } = useParams();
  const dispatch = useDispatch();
  const isOnTabletorDesktop = useIsOnTablet();
  const hasGlobalThreads = useTotalTopicThreadCount() > 0;
  const [isConfirming, setIsConfirming] = useState(false);
  const topicThreadCount = useSelector(selectTopicThreadCount(topicId));
  const isEmailVerified = useSelector(selectIsEmailVerified);
  const onlyVerifiedUsersCanPost = useSelector(selectOnlyVerifiedUsersCanPost);
  const confirmEmailStatus = useSelector(selectConfirmEmailStatus);

  useEffect(() => {
    if (confirmEmailStatus === RequestStatus.SUCCESSFUL) {
      setIsConfirming(false);
    }
  }, [confirmEmailStatus]);

  const addPost = useCallback(() => {
    if (isEmailVerified) { dispatch(showPostEditor()); } else { setIsConfirming(true); }
  }, []);

  const handleConfirmation = useCallback(() => {
    dispatch(sendAccountActivationEmail());
  }, []);

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
    <>
      <EmptyPage
        title={intl.formatMessage(title)}
        subTitle={subTitle ? intl.formatMessage(subTitle) : null}
        action={action}
        actionText={actionText ? intl.formatMessage(actionText) : null}
        fullWidth={fullWidth}
      />
      {!onlyVerifiedUsersCanPost && (
      <Confirmation
        isOpen={isConfirming}
        title={intl.formatMessage(postMessages.confirmEmailTitle)}
        description={intl.formatMessage(postMessages.confirmEmailDescription)}
        onClose={() => setIsConfirming(false)}
        confirmAction={handleConfirmation}
        closeButtonVariant="tertiary"
        confirmButtonText={intl.formatMessage(postMessages.confirmEmailButton)}
      />
      )}
    </>
  );
};

export default EmptyTopics;
