import PropTypes from 'prop-types';
import React from 'react';
import * as timeago from 'timeago.js';
import CommentIcons from '../comment-icons/CommentIcons';

function Comment({ comment }) {
  return (
    <div className="discussion-comment d-flex flex-column">
      <div className="header d-flex flex-row">
        <div className="d-flex flex-column flex-fill">
          <div className="title h4">
            { comment.title }
          </div>
          <div className="status small">
            { comment.type } posted { timeago.format(comment.created_at) } by <span className="font-weight-bold text-info-300">{ comment.author }</span>
          </div>
        </div>
        <CommentIcons abuseFlagged={comment.abuse_flagged} following={comment.following} />
      </div>
      <div className="mt-2">
        <div className="comment-body d-flex" dangerouslySetInnerHTML={{ __html: comment.rendered_body }} />
        <div className="visibility-comment d-flex small text-gray-300">
          This post is visible to everyone
        </div>
      </div>
    </div>
  );
}

export const commentShape = PropTypes.shape({
  posted_on: PropTypes.string,
  abuse_flagged: PropTypes.bool,
  rendered_body: PropTypes.string,
  author: PropTypes.string,
});

Comment.propTypes = {
  comment: commentShape.isRequired,
};

export default Comment;
