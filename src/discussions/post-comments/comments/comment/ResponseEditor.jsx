import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

import classNames from 'classnames';

import { injectIntl } from '@edx/frontend-platform/i18n';

import CommentEditor from './CommentEditor';

function ResponseEditor({
  postId,
  addWrappingDiv,
  handleCloseEditor,
  addingResponse,
}) {
  useEffect(() => {
    handleCloseEditor();
  }, [postId]);

  return addingResponse && (
    <div className={classNames({ 'bg-white p-4 mb-4 rounded mt-2': addWrappingDiv })}>
      <CommentEditor
        comment={{ threadId: postId }}
        edit={false}
        onCloseEditor={handleCloseEditor}
      />
    </div>
  );
}

ResponseEditor.propTypes = {
  postId: PropTypes.string.isRequired,
  addWrappingDiv: PropTypes.bool,
  handleCloseEditor: PropTypes.func.isRequired,
  addingResponse: PropTypes.bool.isRequired,
};

ResponseEditor.defaultProps = {
  addWrappingDiv: false,
};

export default injectIntl(React.memo(ResponseEditor));
