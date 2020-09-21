import React from 'react';
import PropTypes from 'prop-types';

import * as timeago from 'timeago.js';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import CommentIcons from '../comment-icons/CommentIcons';
import messages from '../messages';

function Comment({
  comment,
  intl,
}) {
  return (
    <div className="discussion-comment d-flex flex-column">
      <div className="header d-flex flex-row">
        <div className="d-flex flex-column flex-fill">
          <h4 className="title">
            {comment.title}
          </h4>
          <div className="status small">
            {intl.formatMessage(messages.postTime, {
              postType: comment.type,
              relativeTime: timeago.format(comment.createdAt, intl.locale),
            })}
            <span className="font-weight-bold text-info-300 ml-1">{comment.author}</span>
          </div>
        </div>
        <CommentIcons abuseFlagged={comment.abuseFlagged} following={comment.following} />
      </div>
      <div className="mt-2">
        <div className="d-flex" dangerouslySetInnerHTML={{ __html: comment.renderedBody }} />
        <div className="d-flex small text-gray-300">
          {intl.formatMessage(messages.postVisibility, { group: comment.groupName })}
        </div>
      </div>
    </div>
  );
}

export const commentShape = PropTypes.shape({
  createdAt: PropTypes.string,
  abuseFlagged: PropTypes.bool,
  renderedBody: PropTypes.string,
  author: PropTypes.string,
});

Comment.propTypes = {
  comment: commentShape.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(Comment);
