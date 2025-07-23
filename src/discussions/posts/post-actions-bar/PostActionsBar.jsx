import React, { useCallback, useContext } from 'react';
import PropTypes from 'prop-types';

import {
  Button, Icon, IconButton,
} from '@openedx/paragon';
import { Close } from '@openedx/paragon/icons';
import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';

import { useIntl } from '@edx/frontend-platform/i18n';

import Search from '../../../components/Search';
import { RequestStatus } from '../../../data/constants';
import DiscussionContext from '../../common/context';
import withEmailConfirmation from '../../common/withEmailConfirmation';
import { useUserPostingEnabled } from '../../data/hooks';
import {
  selectConfigLoadingStatus,
  selectEnableInContext,
  selectIsEmailVerified,
  selectOnlyVerifiedUsersCanPost,
} from '../../data/selectors';
import { TopicSearchBar as IncontextSearch } from '../../in-context-topics/topic-search';
import { postMessageToParent } from '../../utils';
import { showPostEditor } from '../data';
import messages from './messages';

import './actionBar.scss';

const PostActionsBar = ({ openEmailConfirmation }) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const loadingStatus = useSelector(selectConfigLoadingStatus);
  const enableInContext = useSelector(selectEnableInContext);
  const isEmailVerified = useSelector(selectIsEmailVerified);
  const isUserPrivilegedInPostingRestriction = useUserPostingEnabled();
  const { enableInContextSidebar, page } = useContext(DiscussionContext);
  const onlyVerifiedUsersCanPost = useSelector(selectOnlyVerifiedUsersCanPost);

  const handleCloseInContext = useCallback(() => {
    postMessageToParent('learning.events.sidebar.close');
  }, []);

  const handleAddPost = useCallback(() => {
    if (!isEmailVerified && onlyVerifiedUsersCanPost) { openEmailConfirmation(); } else { dispatch(showPostEditor()); }
  }, [isEmailVerified, openEmailConfirmation, onlyVerifiedUsersCanPost]);

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
    </div>
  );
};

PostActionsBar.propTypes = {
  openEmailConfirmation: PropTypes.func.isRequired,
};

export default React.memo(withEmailConfirmation(PostActionsBar));
