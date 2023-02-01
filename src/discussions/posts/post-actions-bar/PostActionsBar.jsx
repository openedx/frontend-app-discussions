import React, { useContext } from 'react';

import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  Button, Icon, IconButton,
} from '@edx/paragon';
import { Close } from '@edx/paragon/icons';

import Search from '../../../components/Search';
import { RequestStatus } from '../../../data/constants';
import { DiscussionContext } from '../../common/context';
import { useUserCanAddThreadInBlackoutDate } from '../../data/hooks';
import { selectconfigLoadingStatus, selectEnableInContext } from '../../data/selectors';
import { TopicSearchBar as IncontextSearch } from '../../in-context-topics/topic-search';
import { postMessageToParent } from '../../utils';
import { showPostEditor } from '../data';
import messages from './messages';

import './actionBar.scss';

function PostActionsBar({
  intl,
}) {
  const dispatch = useDispatch();
  const loadingStatus = useSelector(selectconfigLoadingStatus);
  const enableInContext = useSelector(selectEnableInContext);
  const userCanAddThreadInBlackoutDate = useUserCanAddThreadInBlackoutDate();
  const { enableInContextSidebar, page } = useContext(DiscussionContext);

  const handleCloseInContext = () => {
    postMessageToParent('learning.events.sidebar.close');
  };

  return (
    <div className={classNames('d-flex justify-content-end flex-grow-1', { 'py-1': !enableInContextSidebar })}>
      {!enableInContextSidebar && (
        (enableInContext && ['topics', 'category'].includes(page))
          ? <IncontextSearch />
          : <Search />
      )}
      {enableInContextSidebar && (
        <h4 className="d-flex flex-grow-1 font-weight-bold fontStyle my-0 py-10px align-self-center">
          {intl.formatMessage(messages.title)}
        </h4>
      )}
      {loadingStatus === RequestStatus.SUCCESSFUL && userCanAddThreadInBlackoutDate
        && (
          <>
            {!enableInContextSidebar && <div className="border-right border-light-400 mx-3" />}
            <Button
              variant={enableInContextSidebar ? 'plain' : 'brand'}
              className={classNames('my-0 fontStyle', { 'px-3 py-10px border-0': enableInContextSidebar })}
              onClick={() => dispatch(showPostEditor())}
              size={enableInContextSidebar ? 'md' : 'sm'}
              style={{
                lineHeight: '24px',
                border: '0px',
              }}
            >
              {intl.formatMessage(messages.addAPost)}
            </Button>
          </>
        )}
      {enableInContextSidebar && (
        <>
          <div className="border-right border-light-300 mr-3 ml-1.5 my-10px" />
          <div className="justify-content-center mt-2.5 mx-3px">
            <IconButton
              src={Close}
              iconAs={Icon}
              onClick={handleCloseInContext}
              alt={intl.formatMessage(messages.close)}
              iconClassNames="spinner-dimentions"
              className="spinner-dimentions"
            />
          </div>
        </>
      )}
    </div>
  );
}

PostActionsBar.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(PostActionsBar);
