import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

import { useDispatch, useSelector } from 'react-redux';
import * as timeago from 'timeago.js';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Avatar } from '@edx/paragon';

import { ContentActions } from '../../../data/constants';
import ActionsDropdown from '../../common/ActionsDropdown';
import { selectAuthorAvatars } from '../../posts/data/selectors';
import CommentIcons from '../comment-icons/CommentIcons';
import { selectCommentResponses } from '../data/selectors';
import { editComment, fetchCommentResponses, removeComment } from '../data/thunks';
import messages from '../messages';

const commentShape = PropTypes.shape({
  createdAt: PropTypes.string,
  abuseFlagged: PropTypes.bool,
  renderedBody: PropTypes.string,
  author: PropTypes.string,
  authorLabel: PropTypes.string,
  users: PropTypes.objectOf(PropTypes.shape({
    profile: PropTypes.shape({
      hasImage: PropTypes.bool,
      imageUrlFull: PropTypes.string,
      imageUrlLarge: PropTypes.string,
      imageUrlMedium: PropTypes.string,
      imageUrlSmall: PropTypes.string,
    }),
  })),
});

function CommentHeader({
  comment,
  actionHandlers,
  intl,
}) {
  const authorAvatars = useSelector(selectAuthorAvatars(comment.author));
  return (
    <div className="d-flex flex-row justify-content-between">
      <div className="align-items-center d-flex flex-row">
        <Avatar className="m-2" alt={comment.author} src={authorAvatars?.imageUrlSmall} />
        <div className="status small">
          <a href="#nowhere" className="font-weight-normal text-info-300 mr-1 small">
            {comment.author} {comment.authorLabel ? `(${comment.authorLabel})` : ''}
          </a>
          <div className="font-weight-normal small text-gray-500" title={comment.createdAt}>
            {intl.formatMessage(messages.commentTime, {
              relativeTime: timeago.format(comment.createdAt, intl.locale),
            })}
          </div>
        </div>
      </div>
      <ActionsDropdown commentOrPost={comment} actionHandlers={actionHandlers} />
    </div>
  );
}

CommentHeader.propTypes = {
  comment: commentShape.isRequired,
  actionHandlers: PropTypes.objectOf(PropTypes.func).isRequired,
  intl: intlShape.isRequired,
};

function Comment({
  comment,
  intl,
}) {
  const dispatch = useDispatch();
  const hasChildren = !comment.parentId;
  const inlineReplies = useSelector(selectCommentResponses(comment.id));
  useEffect(() => {
    // If the comment has a parent comment, it won't have any children, so don't fetch them.
    if (hasChildren) {
      dispatch(fetchCommentResponses(comment.id));
    }
  }, [comment.id]);
  const actionHandlers = {
    // TODO: Will be added with reply editor
    [ContentActions.EDIT_CONTENT]: () => null,
    [ContentActions.ENDORSE]: () => dispatch(editComment(comment.id, { endorsed: !comment.endorsed })),
    // TODO: Add flow to confirm before deleting
    [ContentActions.DELETE]: () => dispatch(removeComment(comment.id)),
    [ContentActions.REPORT]: () => dispatch(editComment(comment.id, { flagged: !comment.abuseFlagged })),
  };

  return (
    <div className="bt-1 discussion-comment d-flex flex-column my-2">
      <CommentHeader comment={comment} intl={intl} actionHandlers={actionHandlers} />
      <div className="comment-body d-flex px-2" dangerouslySetInnerHTML={{ __html: comment.renderedBody }} />
      <CommentIcons
        abuseFlagged={comment.abuseFlagged}
        count={comment.voteCount}
        following={comment.following}
        onLike={() => dispatch(editComment(comment.id, { voted: !comment.voted }))}
        voted={comment.voted}
      />
      <div className="ml-4">
        {/* Pass along intl since component used here is the one before it's injected with `injectIntl` */}
        {inlineReplies.map(inlineReply => <Comment comment={inlineReply} key={inlineReply.id} intl={intl} />)}
      </div>
    </div>
  );
}

Comment.propTypes = {
  comment: commentShape.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(Comment);
