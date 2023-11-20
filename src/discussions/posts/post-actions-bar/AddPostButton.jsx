import React, { useCallback } from 'react';

import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';

import { useIntl } from '@edx/frontend-platform/i18n';
import { Button } from '@edx/paragon';

import { RequestStatus } from '../../../data/constants';
import { useEnableInContextSidebar, useUserPostingEnabled } from '../../data/hooks';
import { selectConfigLoadingStatus } from '../../data/selectors';
import { showPostEditor } from '../data';
import messages from './messages';

const AddPostButton = () => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const loadingStatus = useSelector(selectConfigLoadingStatus);
  const enableInContextSidebar = useEnableInContextSidebar();
  const isUserPrivilegedInPostingRestriction = useUserPostingEnabled();

  const handleAddPost = useCallback(() => {
    dispatch(showPostEditor());
  }, []);

  return (
    loadingStatus === RequestStatus.SUCCESSFUL && isUserPrivilegedInPostingRestriction && (
      <>
        {!enableInContextSidebar && <div className="border-right border-light-400 mx-3" />}
        <Button
          variant={enableInContextSidebar ? 'plain' : 'brand'}
          className={classNames(
            'my-0 font-style border-0 line-height-24',
            { 'px-3 py-10px border-0': enableInContextSidebar },
          )}
          onClick={handleAddPost}
          size={enableInContextSidebar ? 'md' : 'sm'}
        >
          {intl.formatMessage(messages.addAPost)}
        </Button>
      </>
    )
  );
};

export default AddPostButton;
