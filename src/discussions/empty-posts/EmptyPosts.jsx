import React, { useCallback, useEffect, useState } from 'react';
import propTypes from 'prop-types';

import { useDispatch, useSelector } from 'react-redux';

import { useIntl } from '@edx/frontend-platform/i18n';

import { RequestStatus } from '../../data/constants';
import { Confirmation } from '../common';
import { useIsOnTablet } from '../data/hooks';
import {
  selectAreThreadsFiltered,
  selectConfirmEmailStatus,
  selectIsEmailVerified,
  selectOnlyVerifiedUsersCanPost,
  selectPostThreadCount,
} from '../data/selectors';
import messages from '../messages';
import { showPostEditor } from '../posts/data';
import { sendAccountActivationEmail } from '../posts/data/thunks';
import postMessages from '../posts/post-actions-bar/messages';
import EmptyPage from './EmptyPage';

const EmptyPosts = ({ subTitleMessage }) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const isOnTabletorDesktop = useIsOnTablet();
  const [isConfirming, setIsConfirming] = useState(false);
  const isFiltered = useSelector(selectAreThreadsFiltered);
  const totalThreads = useSelector(selectPostThreadCount);
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

  let title = messages.noPostSelected;
  let subTitle = null;
  let action = null;
  let actionText = null;
  let fullWidth = false;

  const isEmpty = [0, null].includes(totalThreads) && !isFiltered;

  const handleConfirmation = useCallback(() => {
    dispatch(sendAccountActivationEmail());
  }, []);

  if (!(isOnTabletorDesktop || isEmpty)) {
    return null;
  } if (isEmpty) {
    subTitle = subTitleMessage;
    title = messages.emptyTitle;
    action = addPost;
    actionText = postMessages.addAPost;
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

EmptyPosts.propTypes = {
  subTitleMessage: propTypes.shape({
    id: propTypes.string,
    defaultMessage: propTypes.string,
    description: propTypes.string,
  }).isRequired,
};

export default React.memo(EmptyPosts);
