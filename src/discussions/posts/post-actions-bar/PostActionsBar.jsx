import React, { memo, useCallback } from 'react';

import classNames from 'classnames';

import { useIntl } from '@edx/frontend-platform/i18n';
import { Icon, IconButton } from '@edx/paragon';
import { Close } from '@edx/paragon/icons';

import { useEnableInContextSidebar } from '../../data/hooks';
import { postMessageToParent } from '../../utils';
import AddPostButton from './AddPostButton';
import messages from './messages';
import SearchField from './SearchField';

import './actionBar.scss';

const PostActionsBar = () => {
  const intl = useIntl();
  const enableInContextSidebar = useEnableInContextSidebar();

  const handleCloseInContext = useCallback(() => {
    postMessageToParent('learning.events.sidebar.close');
  }, []);

  return (
    <div className={classNames('d-flex justify-content-end flex-grow-1', { 'py-1': !enableInContextSidebar })}>
      <SearchField />
      {enableInContextSidebar && (
        <h4 className="d-flex flex-grow-1 font-weight-bold font-style my-0 py-10px align-self-center">
          {intl.formatMessage(messages.title)}
        </h4>
      )}
      <AddPostButton />
      {enableInContextSidebar && (
        <>
          <div className="border-right border-light-300 mr-3 ml-1.5 my-10px" />
          <div className="justify-content-center mt-2.5 mx-3px">
            <IconButton
              src={Close}
              iconAs={Icon}
              onClick={handleCloseInContext}
              alt={intl.formatMessage(messages.close)}
              iconClassNames="spinner-dimensions"
              className="spinner-dimensions"
            />
          </div>
        </>
      )}
    </div>
  );
};

export default memo(PostActionsBar);
