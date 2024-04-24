import React, { useCallback } from 'react';
import propTypes from 'prop-types';

import { useDispatch, useSelector } from 'react-redux';

import { useIntl } from '@edx/frontend-platform/i18n';

import { useIsOnTablet } from '../data/hooks';
import { selectAreThreadsFiltered, selectPostThreadCount } from '../data/selectors';
import messages from '../messages';
import { showPostEditor } from '../posts/data';
import postMessages from '../posts/post-actions-bar/messages';
import EmptyPage from './EmptyPage';

const EmptyPosts = ({ subTitleMessage }) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const isOnTabletorDesktop = useIsOnTablet();
  const isFiltered = useSelector(selectAreThreadsFiltered);
  const totalThreads = useSelector(selectPostThreadCount);

  const addPost = useCallback(() => (
    dispatch(showPostEditor())
  ), []);

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
};

export default React.memo(EmptyPosts);
