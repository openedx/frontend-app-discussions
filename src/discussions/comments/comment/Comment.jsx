import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Button, useToggle } from '@edx/paragon';

import HTMLLoader from '../../../components/HTMLLoader';
import { ContentActions, EndorsementStatus } from '../../../data/constants';
import { AlertBanner, Confirmation, EndorsedAlertBanner } from '../../common';
import { DiscussionContext } from '../../common/context';
import HoverCard from '../../common/HoverCard';
import { useUserCanAddThreadInBlackoutDate } from '../../data/hooks';
import { fetchThread } from '../../posts/data/thunks';
import { useActions } from '../../utils';
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
  marginBottom,
}) {
  const dispatch = useDispatch();
  const hasChildren = comment.childCount > 0;
  const isNested = Boolean(comment.parentId);
  const inlineReplies = useSelector(selectCommentResponses(comment.id));
  const [isEditing, setEditing] = useState(false);
  const [isDeleting, showDeleteConfirmation, hideDeleteConfirmation] = useToggle(false);
  const [isReporting, showReportConfirmation, hideReportConfirmation] = useToggle(false);
  const [isReplying, setReplying] = useState(false);
  const hasMorePages = useSelector(selectCommentHasMorePages(comment.id));
  const currentPage = useSelector(selectCommentCurrentPage(comment.id));
  const userCanAddThreadInBlackoutDate = useUserCanAddThreadInBlackoutDate();
  const [showHoverCard, setShowHoverCard] = useState(false);
  const {
    courseId,
  } = useContext(DiscussionContext);
  useEffect(() => {
    // If the comment has a parent comment, it won't have any children, so don't fetch them.
    if (hasChildren && !currentPage && showFullThread) {
      dispatch(fetchCommentResponses(comment.id, { page: 1 }));
    }
  }, [comment.id]);
  const actions = useActions({
    ...comment,
    postType,
  });
  const endorseIcons = actions.find(({ action }) => action === EndorsementStatus.ENDORSED);

  const handleAbusedFlag = () => {
    if (comment.abuseFlagged) {
      dispatch(editComment(comment.id, { flagged: !comment.abuseFlagged }));
    } else {
      showReportConfirmation();
    }
  };

  const handleDeleteConfirmation = () => {
    dispatch(removeComment(comment.id));
    hideDeleteConfirmation();
  };

  const handleReportConfirmation = () => {
    dispatch(editComment(comment.id, { flagged: !comment.abuseFlagged }));
    hideReportConfirmation();
  };

  const actionHandlers = {
    [ContentActions.EDIT_CONTENT]: () => setEditing(true),
    [ContentActions.ENDORSE]: async () => {
      await dispatch(editComment(comment.id, { endorsed: !comment.endorsed }, ContentActions.ENDORSE));
      await dispatch(fetchThread(comment.threadId, courseId));
    },
    [ContentActions.DELETE]: showDeleteConfirmation,
    [ContentActions.REPORT]: () => handleAbusedFlag(),
  };

  const handleLoadMoreComments = () => (
    dispatch(fetchCommentResponses(comment.id, { page: currentPage + 1 }))
  );
  return (
    <div className={classNames({ 'mb-3': (showFullThread && !marginBottom) })}>
      {/* eslint-disable jsx-a11y/no-noninteractive-tabindex */}
      <div
        tabIndex="0"
        className="d-flex flex-column card on-focus"
        data-testid={`comment-${comment.id}`}
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
        {!comment.abuseFlagged && (
          <Confirmation
            isOpen={isReporting}
            title={intl.formatMessage(messages.reportResponseTitle)}
            description={intl.formatMessage(messages.reportResponseDescription)}
            onClose={hideReportConfirmation}
            comfirmAction={handleReportConfirmation}
            confirmButtonVariant="danger"
          />
        )}
        <EndorsedAlertBanner postType={postType} content={comment} />
        <div
          className="d-flex flex-column post-card-comment px-4 pt-3.5 pb-10px"
          aria-level={5}
          onMouseEnter={() => setShowHoverCard(true)}
          onMouseLeave={() => setShowHoverCard(false)}
          onFocus={() => setShowHoverCard(true)}
          onBlur={() => setShowHoverCard(false)}
        >
          {showHoverCard && (
            <HoverCard
              commentOrPost={comment}
              actionHandlers={actionHandlers}
              handleResponseCommentButton={() => setReplying(true)}
              onLike={() => dispatch(editComment(comment.id, { voted: !comment.voted }))}
              addResponseCommentButtonMessage={intl.formatMessage(messages.addComment)}
              isClosedPost={isClosedPost}
              endorseIcons={endorseIcons}
            />
          )}
          <AlertBanner content={comment} />
          <CommentHeader comment={comment} />
          {isEditing
            ? (
              <CommentEditor comment={comment} onCloseEditor={() => setEditing(false)} formClasses="pt-3" />
            )
            : (
              <HTMLLoader
                cssClassName="comment-body html-loader text-break mt-14px font-style-normal font-family-inter text-primary-500"
                componentId="comment"
                htmlNode={comment.renderedBody}
              />
            )}
          <CommentIcons
            comment={comment}
            following={comment.following}
            onLike={() => dispatch(editComment(comment.id, { voted: !comment.voted }))}
            createdAt={comment.createdAt}
          />
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
              className="font-size-14 font-style-normal font-family-inter pt-10px border-0 font-weight-500 pb-0"
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
              <div className="mt-2.5">
                <CommentEditor
                  comment={{
                    threadId: comment.threadId,
                    parentId: comment.id,
                  }}
                  edit={false}
                  onCloseEditor={() => setReplying(false)}
                />
              </div>
            ) : (
              <>
                {!isClosedPost && userCanAddThreadInBlackoutDate && (inlineReplies.length >= 5)
                  && (
                    <Button
                      className="d-flex flex-grow mt-2 font-size-14 font-style-normal font-family-inter font-weight-500 text-primary-500"
                      variant="plain"
                      style={{
                        lineHeight: '24px',
                        height: '36px',
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
  marginBottom: PropTypes.bool,
};

Comment.defaultProps = {
  showFullThread: true,
  isClosedPost: false,
  marginBottom: true,
};

export default injectIntl(Comment);
