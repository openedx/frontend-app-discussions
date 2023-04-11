import React, {
  useCallback,
  useContext, useEffect, useMemo, useState,
} from 'react';
import PropTypes from 'prop-types';

import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Button, useToggle } from '@edx/paragon';

import HTMLLoader from '../../../../components/HTMLLoader';
import { ContentActions, EndorsementStatus } from '../../../../data/constants';
import { AlertBanner, Confirmation, EndorsedAlertBanner } from '../../../common';
import { DiscussionContext } from '../../../common/context';
import HoverCard from '../../../common/HoverCard';
import { useUserCanAddThreadInBlackoutDate } from '../../../data/hooks';
import { fetchThread } from '../../../posts/data/thunks';
import LikeButton from '../../../posts/post/LikeButton';
import { useActions } from '../../../utils';
import {
  selectCommentCurrentPage,
  selectCommentHasMorePages,
  selectCommentResponses,
  selectCommentSortOrder,
} from '../../data/selectors';
import { editComment, fetchCommentResponses, removeComment } from '../../data/thunks';
import messages from '../../messages';
import CommentEditor from './CommentEditor';
import CommentHeader from './CommentHeader';
import { commentShape } from './proptypes';
import Reply from './Reply';

function Comment({
  comment,
  intl,
  isClosedPost,
  marginBottom,
  postType,
  showFullThread = true,
}) {
  const {
    id, parentId, childCount, abuseFlagged, endorsed, threadId, endorsedAt, endorsedBy, endorsedByLabel,
    pinned, voted, hasEndorsed, following, closedBy, voteCount, groupId,
    groupName, closeReason, authorLabel, author, title, createdAt, renderedBody, lastEdit,
  } = comment;
  const hasChildren = childCount > 0;
  const isNested = Boolean(parentId);
  const dispatch = useDispatch();
  const { courseId } = useContext(DiscussionContext);
  const [isEditing, setEditing] = useState(false);
  const [isReplying, setReplying] = useState(false);
  const [isDeleting, showDeleteConfirmation, hideDeleteConfirmation] = useToggle(false);
  const [isReporting, showReportConfirmation, hideReportConfirmation] = useToggle(false);
  const inlineReplies = useSelector(selectCommentResponses(id));
  const hasMorePages = useSelector(selectCommentHasMorePages(id));
  const currentPage = useSelector(selectCommentCurrentPage(id));
  const sortedOrder = useSelector(selectCommentSortOrder);
  const actions = useActions({ ...comment, postType });
  const userCanAddThreadInBlackoutDate = useUserCanAddThreadInBlackoutDate();

  useEffect(() => {
    // If the comment has a parent comment, it won't have any children, so don't fetch them.
    if (hasChildren && showFullThread) {
      dispatch(fetchCommentResponses(id, {
        page: 1,
        reverseOrder: sortedOrder,
      }));
    }
  }, [id, sortedOrder]);

  const endorseIcons = useMemo(() => (
    actions.find(({ action }) => action === EndorsementStatus.ENDORSED)
  ), [actions]);

  const handleEditContent = useCallback(() => {
    setEditing(true);
  }, []);

  const handleCommentEndorse = useCallback(async () => {
    await dispatch(editComment(id, { endorsed: !endorsed }, ContentActions.ENDORSE));
    await dispatch(fetchThread(threadId, courseId));
  }, [id, endorsed, threadId]);

  const handleAbusedFlag = useCallback(() => {
    if (abuseFlagged) {
      dispatch(editComment(id, { flagged: !abuseFlagged }));
    } else {
      showReportConfirmation();
    }
  }, [abuseFlagged, id, showReportConfirmation]);

  const handleDeleteConfirmation = useCallback(() => {
    dispatch(removeComment(id));
    hideDeleteConfirmation();
  }, [id, hideDeleteConfirmation]);

  const handleReportConfirmation = useCallback(() => {
    dispatch(editComment(id, { flagged: !abuseFlagged }));
    hideReportConfirmation();
  }, [abuseFlagged, id, hideReportConfirmation]);

  const actionHandlers = useMemo(() => ({
    [ContentActions.EDIT_CONTENT]: handleEditContent,
    [ContentActions.ENDORSE]: handleCommentEndorse,
    [ContentActions.DELETE]: showDeleteConfirmation,
    [ContentActions.REPORT]: handleAbusedFlag,
  }), [handleEditContent, handleCommentEndorse, showDeleteConfirmation, handleAbusedFlag]);

  const handleLoadMoreComments = useCallback(() => (
    dispatch(fetchCommentResponses(id, {
      page: currentPage + 1,
      reverseOrder: sortedOrder,
    }))
  ), [id, currentPage, sortedOrder]);

  return (
    <div className={classNames({ 'mb-3': (showFullThread && !marginBottom) })}>
      {/* eslint-disable jsx-a11y/no-noninteractive-tabindex */}
      <div
        tabIndex="0"
        className="d-flex flex-column card on-focus border-0"
        data-testid={`comment-${id}`}
        role="listitem"
      >
        <Confirmation
          isOpen={isDeleting}
          title={intl.formatMessage(messages.deleteResponseTitle)}
          description={intl.formatMessage(messages.deleteResponseDescription)}
          onClose={hideDeleteConfirmation}
          comfirmAction={handleDeleteConfirmation}
          closeButtonVaraint="tertiary"
          confirmButtonText={intl.formatMessage(messages.deleteConfirmationDelete)}
        />
        {!abuseFlagged && (
          <Confirmation
            isOpen={isReporting}
            title={intl.formatMessage(messages.reportResponseTitle)}
            description={intl.formatMessage(messages.reportResponseDescription)}
            onClose={hideReportConfirmation}
            comfirmAction={handleReportConfirmation}
            confirmButtonVariant="danger"
          />
        )}
        <EndorsedAlertBanner
          endorsed={endorsed}
          endorsedAt={endorsedAt}
          endorsedBy={endorsedBy}
          endorsedByLabel={endorsedByLabel}
          postType={postType}
        />
        <div className="d-flex flex-column post-card-comment px-4 pt-3.5 pb-10px" tabIndex="0">
          <HoverCard
            commentOrPost={comment}
            actionHandlers={actionHandlers}
            handleResponseCommentButton={() => setReplying(true)}
            onLike={() => dispatch(editComment(comment.id, { voted: !comment.voted }))}
            addResponseCommentButtonMessage={intl.formatMessage(messages.addComment)}
            isClosedPost={isClosedPost}
            endorseIcons={endorseIcons}
          />
          <AlertBanner content={comment} />
          <CommentHeader comment={comment} />
          {isEditing
            ? (
              <CommentEditor comment={comment} onCloseEditor={() => setEditing(false)} formClasses="pt-3" />
            )
            : (
              <HTMLLoader
                cssClassName="comment-body html-loader text-break mt-14px font-style text-primary-500"
                componentId="comment"
                htmlNode={comment.renderedBody}
                testId={comment.id}
              />
            )}
          {comment.voted && (
            <div className="ml-n1.5 mt-10px">
              <LikeButton
                count={comment.voteCount}
                onClick={() => dispatch(editComment(comment.id, { voted: !comment.voted }))}
                voted={comment.voted}
              />
            </div>
          )}
          {inlineReplies.length > 0 && (
            <div className="d-flex flex-column mt-0.5" role="list">
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
          )}
          {hasMorePages && (
            <Button
              onClick={handleLoadMoreComments}
              variant="link"
              block="true"
              className="font-size-14 line-height-24 font-style pt-10px border-0 font-weight-500 pb-0"
              data-testid="load-more-comments-responses"
            >
              {intl.formatMessage(messages.loadMoreComments)}
            </Button>
          )}
          {!isNested && showFullThread && (
            isReplying ? (
              <div className="mt-2.5">
                <CommentEditor
                  comment={{ threadId: comment.threadId, parentId: comment.id }}
                  edit={false}
                  onCloseEditor={() => setReplying(false)}
                />
              </div>
            ) : (
              <>
                {!isClosedPost && userCanAddThreadInBlackoutDate && (inlineReplies.length >= 5)
                  && (
                    <Button
                      className="d-flex flex-grow mt-2 font-size-14 font-style font-weight-500 text-primary-500"
                      variant="plain"
                      style={{ height: '36px' }}
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
  marginBottom: PropTypes.bool,
};

Comment.defaultProps = {
  showFullThread: true,
  isClosedPost: false,
  marginBottom: false,
};

export default injectIntl(React.memo(Comment));
