import React from 'react';
import PropTypes from 'prop-types';

import { useDispatch } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';

import { ContentActions } from '../../../data/constants';
import { AlertBanner } from '../../common';
import { removeThread, updateExistingThread } from '../data/thunks';
import PostFooter from './PostFooter';
import PostHeader from './PostHeader';
import { postShape } from './proptypes';

function Post({
  post,
  preview,
}) {
  const location = useLocation();
  const history = useHistory();
  const dispatch = useDispatch();
  const actionHandlers = {
    [ContentActions.EDIT_CONTENT]: () => history.push(`${location.pathname}/edit`),
    // TODO: Add flow to confirm before deleting
    [ContentActions.DELETE]: () => dispatch(removeThread(post.id)),
    [ContentActions.CLOSE]: () => dispatch(updateExistingThread(post.id, { closed: !post.closed })),
    [ContentActions.PIN]: () => dispatch(updateExistingThread(post.id, { pinned: !post.pinned })),
    [ContentActions.REPORT]: () => dispatch(updateExistingThread(post.id, { flagged: !post.abuseFlagged })),
  };

  return (
    <div className="d-flex flex-column p-2.5 w-100 mw-100">
      <div className="mb-4">
        <AlertBanner postType={post.type} content={post} />
      </div>
      <PostHeader post={post} actionHandlers={actionHandlers} />
      <div className="d-flex my-2">
        {/* eslint-disable-next-line react/no-danger */}
        <div dangerouslySetInnerHTML={{ __html: post.renderedBody }} />
      </div>
      <PostFooter post={post} preview={preview} />
    </div>
  );
}

Post.propTypes = {
  post: postShape.isRequired,
  preview: PropTypes.bool,
};

Post.defaultProps = {
  preview: false,
};

export default Post;
