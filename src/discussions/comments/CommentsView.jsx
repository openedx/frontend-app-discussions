import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';
import React from 'react';
import Button from '@edx/paragon/dist/Button';
import Comment, { commentShape } from './comment/Comment';
import Reply from './reply/Reply';
import messages from './messages';

function CommentsView({ intl, comment, replies }) {
  return (
    <div className="discussion-comments d-flex flex-column w-100 ml-3">
      <div className="mb-2">
        <div className="list-group list-group-flush">
          <Comment comment={comment} key={comment.id} />
          {
            replies.map(reply => <Reply reply={reply} key={reply.id} />)
          }
        </div>
      </div>
      <div className="actions d-flex">
        <Button variant="outline-primary" className="rounded-lg">
          { intl.formatMessage(messages.submit) }
        </Button>
      </div>
    </div>
  );
}

CommentsView.propTypes = {
  intl: intlShape.isRequired,
  comment: commentShape.isRequired,
  replies: PropTypes.arrayOf(commentShape).isRequired,
};

export default injectIntl(CommentsView);
