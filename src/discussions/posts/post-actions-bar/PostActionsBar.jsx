import React from 'react';
import PropTypes from 'prop-types';

import { useDispatch, useSelector } from 'react-redux';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  Button, Icon, IconButton,
} from '@edx/paragon';
import { Close } from '@edx/paragon/icons';

import Search from '../../../components/Search';
import { selectBlackoutDate } from '../../data/selectors';
import { inBlackoutDateRange, postMessageToParent } from '../../utils';
import { showPostEditor } from '../data';
import messages from './messages';

import './actionBar.scss';

function PostActionsBar({
  intl,
  inContext,
}) {
  const dispatch = useDispatch();
  const handleCloseInContext = () => {
    postMessageToParent('learning.events.sidebar.close');
  };
  const blackoutDateRange = useSelector(selectBlackoutDate);
  return (
    <div className="d-flex justify-content-end py-1 flex-grow-1">
      {!inContext && (
        <>
          <Search />
          <div className="border-right border-light-400 mx-3" />
        </>
      )}
      {inContext && (
        <h4 className="d-flex flex-grow-1 font-weight-bold my-0 py-0 align-self-center">
          {intl.formatMessage(messages.title)}
        </h4>
      )}
      {
        !inBlackoutDateRange(blackoutDateRange) && (
          <Button
            variant={inContext ? 'plain' : 'brand'}
            className="my-0"
            onClick={() => dispatch(showPostEditor())}
            size="sm"
          >
            {intl.formatMessage(messages.addAPost)}
          </Button>
        )
      }
      {inContext && (
        <>
          <div className="border-right mr-3 ml-4"/>
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
