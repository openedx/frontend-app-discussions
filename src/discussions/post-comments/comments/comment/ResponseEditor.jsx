import React, { useContext, useEffect } from 'react';
import PropTypes from 'prop-types';

import classNames from 'classnames';

import DiscussionContext from '../../../common/context';
import CommentEditor from './CommentEditor';

const ResponseEditor = ({
  addWrappingDiv,
  handleCloseEditor,
  addingResponse,
}) => {
  const { postId } = useContext(DiscussionContext);

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
};

ResponseEditor.propTypes = {
  addWrappingDiv: PropTypes.bool,
  handleCloseEditor: PropTypes.func.isRequired,
  addingResponse: PropTypes.bool.isRequired,
};

ResponseEditor.defaultProps = {
  addWrappingDiv: false,
};

export default React.memo(ResponseEditor);
