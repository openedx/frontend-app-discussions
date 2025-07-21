import React, {
  useCallback, useContext, useEffect, useState,
} from 'react';

import {
  Button, Icon, IconButton,
} from '@openedx/paragon';
import { Close } from '@openedx/paragon/icons';
import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';

import { useIntl } from '@edx/frontend-platform/i18n';

import Search from '../../../components/Search';
import { RequestStatus } from '../../../data/constants';
import { Confirmation } from '../../common';
import DiscussionContext from '../../common/context';
import { useUserPostingEnabled } from '../../data/hooks';
import {
  selectConfigLoadingStatus,
  selectConfirmEmailStatus,
  selectEnableInContext,
  selectIsEmailVerified,
  selectOnlyVerifiedUsersCanPost,
} from '../../data/selectors';
import { TopicSearchBar as IncontextSearch } from '../../in-context-topics/topic-search';
import { postMessageToParent } from '../../utils';
import { showPostEditor } from '../data';
import { sendAccountActivationEmail } from '../data/thunks';
import messages from './messages';

import './actionBar.scss';

const PostActionsBar = () => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const [isConfirming, setIsConfirming] = useState(false);
  const loadingStatus = useSelector(selectConfigLoadingStatus);
  const enableInContext = useSelector(selectEnableInContext);
  const isEmailVerified = useSelector(selectIsEmailVerified);
  const onlyVerifiedUsersCanPost = useSelector(selectOnlyVerifiedUsersCanPost);
  const confirmEmailStatus = useSelector(selectConfirmEmailStatus);
  const isUserPrivilegedInPostingRestriction = useUserPostingEnabled();
  const { enableInContextSidebar, page } = useContext(DiscussionContext);

  useEffect(() => {
    if (confirmEmailStatus === RequestStatus.SUCCESSFUL) {
      setIsConfirming(false);
    }
  }, [confirmEmailStatus]);

  const handleCloseInContext = useCallback(() => {
    postMessageToParent('learning.events.sidebar.close');
  }, []);

  const handleAddPost = useCallback(() => {
    if (isEmailVerified) { dispatch(showPostEditor()); } else { setIsConfirming(true); }
  }, [isEmailVerified]);

  const handleConfirmation = useCallback(() => {
    dispatch(sendAccountActivationEmail());
  }, [sendAccountActivationEmail]);

  return (
    <div className={classNames('d-flex justify-content-end flex-grow-1', { 'py-1': !enableInContextSidebar })}>
      {!enableInContextSidebar && (
        (enableInContext && ['topics', 'category'].includes(page))
          ? <IncontextSearch />
          : <Search />
      )}
      {enableInContextSidebar && (
        <h4 className="d-flex flex-grow-1 font-weight-bold font-style my-0 py-10px align-self-center">
          {intl.formatMessage(messages.title)}
        </h4>
      )}
      {loadingStatus === RequestStatus.SUCCESSFUL && isUserPrivilegedInPostingRestriction && (
        <>
          {!enableInContextSidebar && <div className="border-right border-light-400 mx-3" />}
          <Button
            variant={enableInContextSidebar ? 'plain' : 'brand'}
            className={classNames(
              'my-0 font-style line-height-24',
              { 'px-3 py-10px border-0': enableInContextSidebar },
            )}
            onClick={handleAddPost}
            size={enableInContextSidebar ? 'md' : 'sm'}
          >
            {intl.formatMessage(messages.addAPost)}
          </Button>
        </>
      )}
      {enableInContextSidebar && (
        <>
          <div className="border-right border-light-300 mr-2 my-10px" />
          <div className="d-flex align-items-center justify-content-center">
            <IconButton
              src={Close}
              size="sm"
              iconAs={Icon}
              onClick={handleCloseInContext}
              alt={intl.formatMessage(messages.close)}
            />
          </div>
        </>
      )}
      {!onlyVerifiedUsersCanPost && (
      <Confirmation
        isOpen={isConfirming}
        title={intl.formatMessage(messages.confirmEmailTitle)}
        description={intl.formatMessage(messages.confirmEmailDescription)}
        onClose={() => setIsConfirming(false)}
        confirmAction={handleConfirmation}
        closeButtonVariant="tertiary"
        confirmButtonText={intl.formatMessage(messages.confirmEmailButton)}
      />
      )}
    </div>
  );
};

export default PostActionsBar;
