import React, { useEffect, useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Button } from '@edx/paragon';

import { ContentActions } from '../../../data/constants';
import CommentIcons from '../comment-icons/CommentIcons';
import { selectCommentResponses } from '../data/selectors';
import { editComment, fetchCommentResponses, removeComment } from '../data/thunks';
import messages from '../messages';
import CommentEditor from './CommentEditor';
import CommentHeader from './CommentHeader';
import { commentShape } from './proptypes';

function Comment({
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
    <div className="bt-1 discussion-comment d-flex flex-column">
      <div className="p-3">
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
      <div className="bg-light-200 border-top">
        {/* Pass along intl since component used here is the one before it's injected with `injectIntl` */}
        {inlineReplies.map(inlineReply => <Comment comment={inlineReply} key={inlineReply.id} intl={intl} />)}
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
  comment: commentShape.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(Comment);
