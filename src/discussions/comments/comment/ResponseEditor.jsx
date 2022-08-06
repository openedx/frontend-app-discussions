import React, { useState } from 'react';
import PropTypes from 'prop-types';

import classNames from 'classnames';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Button } from '@edx/paragon';

import messages from '../messages';
import CommentEditor from './CommentEditor';

function ResponseEditor({
  postId,
  intl,
  addWrappingDiv,
}) {
  const [addingResponse, setAddingResponse] = useState(false);

  return addingResponse
    ? (
      <div className={classNames({ 'bg-white p-4': addWrappingDiv })}>
        <CommentEditor
          comment={{ threadId: postId }}
          edit={false}
          onCloseEditor={() => setAddingResponse(false)}
        />
      </div>
    ) : (
      <div className={classNames({ 'mb-4': addWrappingDiv }, 'actions d-flex')}>
        <Button variant="primary" className="px-2.5 py-2" onClick={() => setAddingResponse(true)}>
          {intl.formatMessage(messages.addResponse)}
        </Button>
      </div>
    );
}

ResponseEditor.propTypes = {
  postId: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
  addWrappingDiv: PropTypes.bool,
};

ResponseEditor.defaultProps = {
  addWrappingDiv: false,
};

export default injectIntl(ResponseEditor);
