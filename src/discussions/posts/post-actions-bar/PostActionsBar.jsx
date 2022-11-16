import React from 'react';
import PropTypes from 'prop-types';

import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  Button, Icon, IconButton,
} from '@edx/paragon';
import { Close } from '@edx/paragon/icons';

import Search from '../../../components/Search';
import { RequestStatus } from '../../../data/constants';
import { selectBlackoutDate, selectconfigLoadingStatus } from '../../data/selectors';
import { inBlackoutDateRange, postMessageToParent } from '../../utils';
import { showPostEditor } from '../data';
import messages from './messages';

import './actionBar.scss';

function PostActionsBar({
  intl,
  inContext,
}) {
  const dispatch = useDispatch();
  const loadingStatus = useSelector(selectconfigLoadingStatus);
  const blackoutDateRange = useSelector(selectBlackoutDate);

  const handleCloseInContext = () => {
    postMessageToParent('learning.events.sidebar.close');
  };

  return (
    <div className={classNames('d-flex justify-content-end flex-grow-1', { 'py-1': !inContext })}>
      {!inContext && <Search />}
      {inContext && (
        <h4 className="d-flex flex-grow-1 font-weight-bold my-0 py-0 align-self-center">
          {intl.formatMessage(messages.title)}
        </h4>
      )}
      {(!inBlackoutDateRange(blackoutDateRange) && loadingStatus === RequestStatus.SUCCESSFUL) && (
        <>
          {!inContext && <div className="border-right border-light-400 mx-3" />}
          <Button
            variant={inContext ? 'plain' : 'brand'}
            className={classNames('my-0', { 'p-0': inContext })}
            onClick={() => dispatch(showPostEditor())}
            size={inContext ? 'md' : 'sm'}
          >
            {intl.formatMessage(messages.addAPost)}
          </Button>
        </>
      )}
      {inContext && (
        <>
          <div className="border-right border-light-300 mr-2 ml-3.5 my-2" />
          <IconButton
            src={Close}
            iconAs={Icon}
            onClick={handleCloseInContext}
            alt={intl.formatMessage(messages.close)}
          />
        </>
      )}
    </div>
  );
}

PostActionsBar.propTypes = {
  intl: intlShape.isRequired,
  inContext: PropTypes.bool.isRequired,
};

export default injectIntl(PostActionsBar);
