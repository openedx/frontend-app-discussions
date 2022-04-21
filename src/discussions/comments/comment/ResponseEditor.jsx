import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Button } from '@edx/paragon';

import messages from '../messages';
import CommentEditor from './CommentEditor';

function ResponseEditor({
  postId,
  intl,
}) {
  const [addingResponse, setAddingResponse] = useState(false);
  return addingResponse
    ? (
      <CommentEditor
        comment={{ threadId: postId }}
        editing={false}
        onCloseEditor={() => setAddingResponse(false)}
      />
    ) : (
      <div className="actions d-flex">
        <Button variant="primary" onClick={() => setAddingResponse(true)}>
          {intl.formatMessage(messages.addResponse)}
        </Button>
      </div>
    );
}

ResponseEditor.propTypes = {
  postId: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(ResponseEditor);
