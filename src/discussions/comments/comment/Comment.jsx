import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { useDispatch, useSelector } from 'react-redux';
import * as timeago from 'timeago.js';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Alert, Button, Hyperlink } from '@edx/paragon';
import { CheckCircle, Verified } from '@edx/paragon/icons';

import { ContentActions, ThreadType } from '../../../data/constants';
import CommentIcons from '../comment-icons/CommentIcons';
import { selectCommentResponses } from '../data/selectors';
import { editComment, fetchCommentResponses, removeComment } from '../data/thunks';
import messages from '../messages';
import CommentEditor from './CommentEditor';
import CommentHeader from './CommentHeader';
import { commentShape } from './proptypes';

function CommentBanner({
  intl,
  comment,
  postType,
}) {
  const isQuestion = postType === ThreadType.QUESTION;
  const classes = isQuestion ? 'bg-success-500 text-white' : 'bg-dark-500 text-white';
  const iconClass = isQuestion ? CheckCircle : Verified;
  return comment.endorsed ? (
    <Alert variant="plain" className={`p-3 m-0 rounded-0 shadow-none ${classes}`} icon={iconClass}>
      <div className="d-flex justify-content-between">
        <strong>{intl.formatMessage(
          isQuestion
            ? messages.answer
            : messages.endorsed,
        )}
        </strong>
        <span>
          {intl.formatMessage(
            isQuestion
              ? messages.answeredLabel
              : messages.endorsedLabel,
          )}&nbsp;
          <Hyperlink>{comment.endorsedBy}</Hyperlink>&nbsp;
          {timeago.format(comment.endorsedAt, intl.locale)}
        </span>
      </div>
    </Alert>
  ) : null;
}

CommentBanner.propTypes = {
  intl: intlShape.isRequired,
  comment: commentShape.isRequired,
  postType: PropTypes.string.isRequired,
};

function Comment({
  postType,
  comment,
  intl,
}) {
  const dispatch = useDispatch();
  const hasChildren = comment.childCount > 0;
  const isNested = Boolean(comment.parentId);
  const inlineReplies = useSelector(selectCommentResponses(comment.id));
  const [isEditing, setEditing] = useState(false);
  const [isReplying, setReplying] = useState(false);
  useEffect(() => {
    // If the comment has a parent comment, it won't have any children, so don't fetch them.
    if (hasChildren) {
      dispatch(fetchCommentResponses(comment.id));
    }
  }, [comment.id]);
  const actionHandlers = {
    [ContentActions.EDIT_CONTENT]: () => setEditing(true),
    [ContentActions.ENDORSE]: () => dispatch(editComment(comment.id, { endorsed: !comment.endorsed })),
    // TODO: Add flow to confirm before deleting
    [ContentActions.DELETE]: () => dispatch(removeComment(comment.id)),
    [ContentActions.REPORT]: () => dispatch(editComment(comment.id, { flagged: !comment.abuseFlagged })),
  };
  return (
    <div className="discussion-comment d-flex flex-column card my-3">
      <CommentBanner postType={postType} comment={comment} intl={intl} />
      <div className="p-4">
        <CommentHeader comment={comment} actionHandlers={actionHandlers} />
        {isEditing
          ? (
            <CommentEditor comment={comment} onCloseEditor={() => setEditing(false)} />
          )
          : <div className="comment-body px-2" dangerouslySetInnerHTML={{ __html: comment.renderedBody }} />}
        <CommentIcons
          abuseFlagged={comment.abuseFlagged}
          count={comment.voteCount}
          following={comment.following}
          onLike={() => dispatch(editComment(comment.id, { voted: !comment.voted }))}
          voted={comment.voted}
        />
      </div>
      <div className="ml-4">
        {/* Pass along intl since component used here is the one before it's injected with `injectIntl` */}
        {inlineReplies.map(inlineReply => (
          <Comment
            postType={postType}
            comment={inlineReply}
            key={inlineReply.id}
            intl={intl}
          />
        ))}
      </div>
      {!isNested
      && (
        isReplying
          ? (
            <CommentEditor
              comment={{
                threadId: comment.threadId,
                parentId: comment.id,
              }}
              onCloseEditor={() => setReplying(false)}
            />
          )
          : (
            <Button className="d-flex m-4 flex-fill" variant="outline-secondary" onClick={() => setReplying(true)}>
              {intl.formatMessage(messages.addComment)}
            </Button>
          )
      )}
    </div>
  );
}

Comment.propTypes = {
  postType: PropTypes.oneOf(['discussion', 'question']).isRequired,
  comment: commentShape.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(Comment);
