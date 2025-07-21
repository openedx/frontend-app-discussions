import React, {
  useCallback, useContext, useEffect, useState,
} from 'react';
import PropTypes from 'prop-types';

import { Button, Spinner } from '@openedx/paragon';
import { useDispatch, useSelector } from 'react-redux';

import { useIntl } from '@edx/frontend-platform/i18n';

import { RequestStatus, ThreadType } from '../../../data/constants';
import { Confirmation } from '../../common';
import { useUserPostingEnabled } from '../../data/hooks';
import { selectConfirmEmailStatus, selectIsEmailVerified, selectOnlyVerifiedUsersCanPost } from '../../data/selectors';
import { sendAccountActivationEmail } from '../../posts/data/thunks';
import postMessages from '../../posts/post-actions-bar/messages';
import { isLastElementOfList } from '../../utils';
import { usePostComments } from '../data/hooks';
import messages from '../messages';
import PostCommentsContext from '../postCommentsContext';
import { Comment, ResponseEditor } from './comment';

const CommentsView = ({ threadType }) => {
  const intl = useIntl();
  const [addingResponse, setAddingResponse] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const dispatch = useDispatch();
  const { isClosed } = useContext(PostCommentsContext);
  const isEmailVerified = useSelector(selectIsEmailVerified);
  const onlyVerifiedUsersCanPost = useSelector(selectOnlyVerifiedUsersCanPost);
  const confirmEmailStatus = useSelector(selectConfirmEmailStatus);
  const isUserPrivilegedInPostingRestriction = useUserPostingEnabled();

  useEffect(() => {
    if (confirmEmailStatus === RequestStatus.SUCCESSFUL) {
      setIsConfirming(false);
    }
  }, [confirmEmailStatus]);

  const {
    endorsedCommentsIds,
    unEndorsedCommentsIds,
    hasMorePages,
    isLoading,
    handleLoadMoreResponses,
  } = usePostComments(threadType);

  const handleAddResponse = useCallback(() => {
    if (isEmailVerified) { setAddingResponse(true); } else { setIsConfirming(true); }
  }, []);

  const handleCloseResponseEditor = useCallback(() => {
    setAddingResponse(false);
  }, []);

  const handleConfirmation = useCallback(() => {
    dispatch(sendAccountActivationEmail());
  }, [sendAccountActivationEmail]);

  const handleDefinition = useCallback((message, commentsLength) => (
    <div
      className="comment-line line-height-24 mx-4 my-14px text-gray-700 font-style"
      role="heading"
      aria-level="2"
    >
      {intl.formatMessage(message, { num: commentsLength })}
    </div>
  ), []);

  const handleComments = useCallback((postCommentsIds) => (
    <div className="mx-4" role="list">
      {postCommentsIds.map((commentId) => (
        <Comment
          commentId={commentId}
          key={commentId}
          marginBottom={isLastElementOfList(postCommentsIds, commentId)}
        />
      ))}
    </div>
  ), [hasMorePages, isLoading, handleLoadMoreResponses]);

  return (
    ((hasMorePages && isLoading) || !isLoading) && (
    <>
      {endorsedCommentsIds.length > 0 && (
      <>
        {handleDefinition(messages.endorsedResponseCount, endorsedCommentsIds.length)}
        {handleComments(endorsedCommentsIds)}
      </>
      )}
      {handleDefinition(messages.responseCount, unEndorsedCommentsIds.length)}
      {unEndorsedCommentsIds.length > 0 && handleComments(unEndorsedCommentsIds)}
      {hasMorePages && !isLoading && (!!unEndorsedCommentsIds.length || !!endorsedCommentsIds.length) && (
      <Button
        onClick={handleLoadMoreResponses}
        variant="link"
        block="true"
        className="px-4 mt-3 border-0 line-height-24 py-0 mb-2 font-style font-weight-500"
        data-testid="load-more-comments"
      >
        {intl.formatMessage(messages.loadMoreResponses)}
      </Button>
      )}
      {isLoading && (
      <div className="mb-2 mt-3 d-flex justify-content-center">
        <Spinner animation="border" variant="primary" className="spinner-dimensions" />
      </div>
      )}
      {(isUserPrivilegedInPostingRestriction && (!!unEndorsedCommentsIds.length || !!endorsedCommentsIds.length)
         && !isClosed) && (
         <div className="mx-4">
           {!addingResponse && (
           <Button
             variant="plain"
             block="true"
             className="card mb-4 px-0 border-0 py-10px mt-2 font-style font-weight-500
                    line-height-24 text-primary-500 bg-white"
             onClick={handleAddResponse}
             data-testid="add-response"
           >
             {intl.formatMessage(messages.addResponse)}
           </Button>
           )}
           <ResponseEditor
             addWrappingDiv
             addingResponse={addingResponse}
             handleCloseEditor={handleCloseResponseEditor}
           />
           {!onlyVerifiedUsersCanPost && (
           <Confirmation
             isOpen={isConfirming}
             title={intl.formatMessage(postMessages.confirmEmailTitle)}
             description={intl.formatMessage(postMessages.confirmEmailDescription)}
             onClose={() => setIsConfirming(false)}
             confirmAction={handleConfirmation}
             closeButtonVariant="tertiary"
             confirmButtonText={intl.formatMessage(postMessages.confirmEmailButton)}
           />
           )}
         </div>
      )}
    </>
    )
  );
};

CommentsView.propTypes = {
  threadType: PropTypes.oneOf([
    ThreadType.DISCUSSION, ThreadType.QUESTION,
  ]).isRequired,
};

export default React.memo(CommentsView);
