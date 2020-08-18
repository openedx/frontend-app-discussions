import PropTypes from 'prop-types';
import React from 'react';
import Comment, { commentShape } from './comment/Comment';

function CommentsView({ comments }) {
  return (
    <div className="discussion-comments d-flex flex-column">
      {
        comments.map(comment => <Comment comment={comment} key={comment.id} />)
      }
    </div>
  );
}

CommentsView.propTypes = {
  comments: PropTypes.arrayOf(commentShape).isRequired,
};

export default CommentsView;
