import React from 'react';
import propTypes from 'prop-types';

import { useDispatch, useSelector } from 'react-redux';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import { useIsOnDesktop } from '../data/hooks';
import { selectAreThreadsFiltered, selectPostThreadCount } from '../data/selectors';
import messages from '../messages';
import { messages as postMessages, showPostEditor } from '../posts';
import EmptyPage from './EmptyPage';

function EmptyPosts({ intl, subTitleMessage }) {
  const dispatch = useDispatch();

  const isFiltered = useSelector(selectAreThreadsFiltered);
  const totalThreads = useSelector(selectPostThreadCount);
  const isOnDesktop = useIsOnDesktop();

  function addPost() {
    return dispatch(showPostEditor());
  }

  let title = messages.noPostSelected;
  let subTitle = null;
  let action = null;
  let actionText = null;
  let fullWidth = false;

  const isEmpty = [0, null].includes(totalThreads) && !isFiltered;

  if (!(isOnDesktop || isEmpty)) {
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
}

EmptyPosts.propTypes = {
  subTitleMessage: propTypes.string.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(EmptyPosts);
