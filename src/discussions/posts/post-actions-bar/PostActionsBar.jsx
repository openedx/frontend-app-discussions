import React from 'react';

import { useDispatch } from 'react-redux';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Button, SearchField } from '@edx/paragon';

import { setSearchQuery, showPostEditor } from '../data';
import messages from './messages';

function PostActionsBar({ intl }) {
  const dispatch = useDispatch();
  return (
    <div className="d-flex justify-content-end py-1">
      <SearchField
        onClear={() => dispatch(setSearchQuery(''))}
        onSubmit={(value) => dispatch(setSearchQuery(value))}
        placeholder={intl.formatMessage(messages.searchAllPosts)}
      />
      <div className="border-right mr-3 ml-4" />
      <Button
        variant="outline-primary"
        className="ml-2"
        onClick={() => dispatch(showPostEditor())}
      >
        {intl.formatMessage(messages.addAPost)}
      </Button>
    </div>
  );
}

PostActionsBar.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(PostActionsBar);
