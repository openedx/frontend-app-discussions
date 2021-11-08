import React from 'react';
import PropTypes from 'prop-types';

import { useDispatch } from 'react-redux';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  Button, Icon, IconButton, SearchField,
} from '@edx/paragon';
import { Close } from '@edx/paragon/icons';

import { setSearchQuery, showPostEditor } from '../data';
import messages from './messages';

function PostActionsBar({
  intl,
  inContext,
}) {
  const dispatch = useDispatch();
  // TODO: Use a postMessage based API to close the in-context discussion here.
  const handleCloseInContext = () => null;
  return (
    <div className="d-flex justify-content-end py-1 flex-grow-1">
      {!inContext && (
        <>
          <SearchField
            onClear={() => dispatch(setSearchQuery(''))}
            onSubmit={(value) => dispatch(setSearchQuery(value))}
            placeholder={intl.formatMessage(messages.searchAllPosts)}
          />
          <div className="border-right mr-3 ml-4" />
        </>
      )}
      {inContext && (
        <h4 className="d-flex flex-grow-1 font-weight-bold my-0 py-0 align-self-center">
          {intl.formatMessage(messages.title)}
        </h4>
      )}

      <Button
        variant={inContext ? 'plain' : 'brand'}
        className="ml-2 my-0"
        onClick={() => dispatch(showPostEditor())}
      >
        {intl.formatMessage(messages.addAPost)}
      </Button>
      {inContext && (
        <>
          <div className="border-right mr-3 ml-4" />
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
