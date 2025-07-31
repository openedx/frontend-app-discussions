import React, { useCallback } from 'react';
import propTypes from 'prop-types';

import { useDispatch, useSelector } from 'react-redux';

import { useIntl } from '@edx/frontend-platform/i18n';

import withEmailConfirmation from '../common/withEmailConfirmation';
import { useIsOnTablet } from '../data/hooks';
import {
  selectAreThreadsFiltered,
  selectContentCreationRateLimited,
  selectPostThreadCount,
  selectShouldShowEmailConfirmation,
} from '../data/selectors';
import messages from '../messages';
import { showPostEditor } from '../posts/data';
import postMessages from '../posts/post-actions-bar/messages';
import EmptyPage from './EmptyPage';

const EmptyPosts = ({ subTitleMessage, openEmailConfirmation }) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const isOnTabletorDesktop = useIsOnTablet();
  const isFiltered = useSelector(selectAreThreadsFiltered);
  const totalThreads = useSelector(selectPostThreadCount);
  const shouldShowEmailConfirmation = useSelector(selectShouldShowEmailConfirmation);
  const contentCreationRateLimited = useSelector(selectContentCreationRateLimited);

  const addPost = useCallback(() => {
    if (shouldShowEmailConfirmation || contentCreationRateLimited) {
      openEmailConfirmation();
    } else {
      dispatch(showPostEditor());
    }
  }, [shouldShowEmailConfirmation, openEmailConfirmation, contentCreationRateLimited]);

  let title = messages.noPostSelected;
  let subTitle = null;
  let action = null;
  let actionText = null;
  let fullWidth = false;

  const isEmpty = [0, null].includes(totalThreads) && !isFiltered;

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
    <EmptyPage
      title={intl.formatMessage(title)}
      subTitle={subTitle ? intl.formatMessage(subTitle) : null}
      action={action}
      actionText={actionText ? intl.formatMessage(actionText) : null}
      fullWidth={fullWidth}
    />
  );
};

EmptyPosts.propTypes = {
  subTitleMessage: propTypes.shape({
    id: propTypes.string,
    defaultMessage: propTypes.string,
    description: propTypes.string,
  }).isRequired,
  openEmailConfirmation: propTypes.func.isRequired,
};

export default React.memo(withEmailConfirmation(EmptyPosts));
