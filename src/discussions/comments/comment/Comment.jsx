import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Button, useToggle } from '@edx/paragon';

import HTMLLoader from '../../../components/HTMLLoader';
import { ContentActions } from '../../../data/constants';
import { AlertBanner, DeleteConfirmation, EndorsedAlertBanner } from '../../common';
import { DiscussionContext } from '../../common/context';
import { selectBlackoutDate } from '../../data/selectors';
import { fetchThread } from '../../posts/data/thunks';
import { inBlackoutDateRange } from '../../utils';
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
  isClosedPost,
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
  const blackoutDateRange = useSelector(selectBlackoutDate);
  const {
    courseId,
  } = useContext(DiscussionContext);
  useEffect(() => {
    // If the comment has a parent comment, it won't have any children, so don't fetch them.
    if (hasChildren && !currentPage && showFullThread) {
      dispatch(fetchCommentResponses(comment.id, { page: 1 }));
    }
  }, [comment.id]);

  const actionHandlers = {
    [ContentActions.EDIT_CONTENT]: () => setEditing(true),
    [ContentActions.ENDORSE]: async () => {
      await dispatch(editComment(comment.id, { endorsed: !comment.endorsed }, ContentActions.ENDORSE));
      await dispatch(fetchThread(comment.threadId, courseId));
    },
    [ContentActions.DELETE]: showDeleteConfirmation,
    [ContentActions.REPORT]: () => dispatch(editComment(comment.id, { flagged: !comment.abuseFlagged })),
  };

  const handleLoadMoreComments = () => (
    dispatch(fetchCommentResponses(comment.id, { page: currentPage + 1 }))
  );

  return (
    <div className={classNames({ 'py-2 my-3': showFullThread })}>
      <div className="d-flex flex-column card" data-testid={`comment-${comment.id}`} role="listitem">
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
        <EndorsedAlertBanner postType={postType} content={comment} />
        <div className="d-flex flex-column p-4.5">
          <AlertBanner content={comment} />
          <CommentHeader comment={comment} actionHandlers={actionHandlers} postType={postType} />
          {isEditing
            ? (
              <CommentEditor comment={comment} onCloseEditor={() => setEditing(false)} formClasses="pt-3" />
            )
            : <HTMLLoader cssClassName="comment-body pt-4 text-primary-500" componentId="comment" htmlNode={comment.renderedBody} />}
          <CommentIcons
            comment={comment}
            following={comment.following}
            onLike={() => dispatch(editComment(comment.id, { voted: !comment.voted }))}
            createdAt={comment.createdAt}
          />
          <div className="sr-only" role="heading" aria-level="3"> {intl.formatMessage(messages.replies, { count: inlineReplies.length })}</div>
          <div className="d-flex flex-column" role="list">
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
            className="mt-4.5 font-size-14 font-style-normal font-family-inter font-weight-500 px-2.5 py-2"
            data-testid="load-more-comments-responses"
            style={{
              lineHeight: '20px',
            }}
          >
            {intl.formatMessage(messages.loadMoreComments)}
          </Button>
          )}
          {!isNested && showFullThread && (
            isReplying ? (
              <CommentEditor
                comment={{
                  threadId: comment.threadId,
                  parentId: comment.id,
                }}
                edit={false}
                onCloseEditor={() => setReplying(false)}
              />
            ) : (
              <>
                {(!isClosedPost && !inBlackoutDateRange(blackoutDateRange))
                  && (
                    <Button
                      className="d-flex flex-grow mt-3 py-2 font-size-14"
                      variant="outline-primary"
                      style={{
                        lineHeight: '20px',
                      }}
                      onClick={() => setReplying(true)}
                    >
                      {intl.formatMessage(messages.addComment)}
                    </Button>
                  )}
              </>

            )
          )}
        </div>
      </div>
    </div>
  );
}

Comment.propTypes = {
  postType: PropTypes.oneOf(['discussion', 'question']).isRequired,
  comment: commentShape.isRequired,
  showFullThread: PropTypes.bool,
  isClosedPost: PropTypes.bool,
  intl: intlShape.isRequired,
};

Comment.defaultProps = {
  showFullThread: true,
  isClosedPost: false,
};

export default injectIntl(Comment);
