import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Button, useToggle } from '@edx/paragon';

import HTMLLoader from '../../../components/HTMLLoader';
import { ContentActions } from '../../../data/constants';
import { AlertBanner, DeleteConfirmation } from '../../common';
import { fetchThread } from '../../posts/data/thunks';
import CommentIcons from '../comment-icons/CommentIcons';
import { selectCommentCurrentPage, selectCommentHasMorePages, selectCommentResponses } from '../data/selectors';
import { editComment, fetchCommentResponses, removeComment } from '../data/thunks';
import messages from '../messages';
import CommentEditor from './CommentEditor';
import CommentHeader from './CommentHeader';
import { commentShape } from './proptypes';
import Reply from './Reply';

function Comment({
  postType,
  comment,
  showFullThread = true,
  intl,
}) {
  const dispatch = useDispatch();
  const hasChildren = comment.childCount > 0;
  const isNested = Boolean(comment.parentId);
  const inlineReplies = useSelector(selectCommentResponses(comment.id));
  const [isEditing, setEditing] = useState(false);
  const [isDeleting, showDeleteConfirmation, hideDeleteConfirmation] = useToggle(false);
  const [isReplying, setReplying] = useState(false);
  const hasMorePages = useSelector(selectCommentHasMorePages(comment.id));
  const currentPage = useSelector(selectCommentCurrentPage(comment.id));
  useEffect(() => {
    // If the comment has a parent comment, it won't have any children, so don't fetch them.
    if (hasChildren && !currentPage && showFullThread) {
      dispatch(fetchCommentResponses(comment.id, { page: 1 }));
    }
  }, [comment.id]);
  const actionHandlers = {
    [ContentActions.EDIT_CONTENT]: () => setEditing(true),
    [ContentActions.ENDORSE]: async () => {
      await dispatch(editComment(comment.id, { endorsed: !comment.endorsed }));
      await dispatch(fetchThread(comment.threadId));
    },
    [ContentActions.DELETE]: showDeleteConfirmation,
    [ContentActions.REPORT]: () => dispatch(editComment(comment.id, { flagged: !comment.abuseFlagged })),
  };
  const handleLoadMoreComments = () => (
    dispatch(fetchCommentResponses(comment.id, { page: currentPage + 1 }))
  );
  const commentClasses = classNames('d-flex flex-column card', { 'my-3': showFullThread });

  return (
    <div className={commentClasses} data-testid={`comment-${comment.id}`}>
      <DeleteConfirmation
        isOpen={isDeleting}
        title={intl.formatMessage(messages.deleteResponseTitle)}
        description={intl.formatMessage(messages.deleteResponseDescription)}
        onClose={hideDeleteConfirmation}
        onDelete={() => {
          dispatch(removeComment(comment.id));
          hideDeleteConfirmation();
        }}
      />
      <AlertBanner postType={postType} content={comment} />
      <div className="d-flex flex-column px-4 pb-4">
        <CommentHeader comment={comment} actionHandlers={actionHandlers} postType={postType} />
        {isEditing
          ? (
            <CommentEditor comment={comment} onCloseEditor={() => setEditing(false)} />
          )
          : <HTMLLoader cssClassName="comment-body px-2" componentId="comment" htmlNode={comment.renderedBody} />}
        <CommentIcons
          comment={comment}
          following={comment.following}
          onLike={() => dispatch(editComment(comment.id, { voted: !comment.voted }))}
          createdAt={comment.createdAt}
        />
        <div className="d-flex my-2 flex-column">
          {/* Pass along intl since component used here is the one before it's injected with `injectIntl` */}
          {inlineReplies.map(inlineReply => (
            <Reply
              reply={inlineReply}
              postType={postType}
              key={inlineReply.id}
              intl={intl}
            />
          ))}
        </div>
        {hasMorePages && (
          <Button
            onClick={handleLoadMoreComments}
            variant="link"
            block="true"
            className="my-4"
            data-testid="load-more-comments-responses"
          >
            {intl.formatMessage(messages.loadMoreResponses)}
          </Button>
        )}
        {!isNested && showFullThread
          && (
            isReplying
              ? (
                <CommentEditor
                  comment={{
                    threadId: comment.threadId,
                    parentId: comment.id,
                  }}
                  edit={false}
                  onCloseEditor={() => setReplying(false)}
                />
              )
              : (
                <Button className="d-flex flex-grow " variant="outline-secondary" onClick={() => setReplying(true)}>
                  {intl.formatMessage(messages.addComment)}
                </Button>
              )
          )}
      </div>
    </div>
  );
}

Comment.propTypes = {
  postType: PropTypes.oneOf(['discussion', 'question']).isRequired,
  comment: commentShape.isRequired,
  showFullThread: PropTypes.bool,
  intl: intlShape.isRequired,
};

Comment.defaultProps = {
  showFullThread: true,
};

export default injectIntl(Comment);
