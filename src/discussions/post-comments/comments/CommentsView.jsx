import React, { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Button, Spinner } from '@edx/paragon';

import { EndorsementStatus } from '../../../data/constants';
import { useUserCanAddThreadInBlackoutDate } from '../../data/hooks';
import { filterPosts, isLastElementOfList } from '../../utils';
import { usePostComments } from '../data/hooks';
import messages from '../messages';
import { Comment, ResponseEditor } from './comment';

function CommentsView({
  endorsed,
  intl,
  isClosed,
  postId,
  postType,
}) {
  const [addingResponse, setAddingResponse] = useState(false);
  const userCanAddThreadInBlackoutDate = useUserCanAddThreadInBlackoutDate();
  const {
    comments,
    hasMorePages,
    isLoading,
    handleLoadMoreResponses,
  } = usePostComments(postId, endorsed);

  const endorsedComments = useMemo(() => (
    [...filterPosts(comments, 'endorsed')]
  ), [comments]);

  const unEndorsedComments = useMemo(() => (
    [...filterPosts(comments, 'unendorsed')]
  ), [comments]);

  const handleAddResponse = useCallback(() => {
    setAddingResponse(true);
  }, []);

  const handleCloseResponseEditor = useCallback(() => {
    setAddingResponse(false);
  }, []);

  const handleDefinition = useCallback((message, commentsLength) => (
    <div
      className="mx-4 my-14px text-gray-700 font-style"
      role="heading"
      aria-level="2"
    >
      {intl.formatMessage(message, { num: commentsLength })}
    </div>
  ), []);

  const handleComments = useCallback((postComments, showLoadMoreResponses = false) => (
    <div className="mx-4" role="list">
      {postComments.map((comment) => (
        <Comment
          comment={comment}
          key={comment.id}
          postType={postType}
          isClosedPost={isClosed}
          marginBottom={isLastElementOfList(postComments, comment)}
        />
      ))}
      {hasMorePages && !isLoading && !showLoadMoreResponses && (
        <Button
          onClick={handleLoadMoreResponses}
          variant="link"
          block="true"
          className="px-4 mt-3 border-0 line-height-24 py-0 mb-2 font-style font-weight-500 font-size-14"
          data-testid="load-more-comments"
        >
          {intl.formatMessage(messages.loadMoreResponses)}
        </Button>
      )}
      {isLoading && !showLoadMoreResponses && (
        <div className="mb-2 mt-3 d-flex justify-content-center">
          <Spinner animation="border" variant="primary" className="spinner-dimentions" />
        </div>
      )}
    </div>
  ), [hasMorePages, isLoading, handleLoadMoreResponses]);

  return (
    <>
      {((hasMorePages && isLoading) || !isLoading) && (
        <>
          {endorsedComments.length > 0 && (
            <>
              {handleDefinition(messages.endorsedResponseCount, endorsedComments.length)}
              {endorsed === EndorsementStatus.DISCUSSION
                ? handleComments(endorsedComments, true)
                : handleComments(endorsedComments, false)}
            </>
          )}
          {endorsed !== EndorsementStatus.ENDORSED && (
            <>
              {handleDefinition(messages.responseCount, unEndorsedComments.length)}
              {unEndorsedComments.length === 0 && <br />}
              {handleComments(unEndorsedComments, false)}
              {(userCanAddThreadInBlackoutDate && !!unEndorsedComments.length && !isClosed) && (
                <div className="mx-4">
                  {!addingResponse && (
                    <Button
                      variant="plain"
                      block="true"
                      className="card mb-4 px-0 border-0 py-10px mt-2 font-style font-weight-500
                      line-height-24 font-size-14 text-primary-500"
                      onClick={handleAddResponse}
                      data-testid="add-response"
                    >
                      {intl.formatMessage(messages.addResponse)}
                    </Button>
                  )}
                  <ResponseEditor
                    postId={postId}
                    handleCloseEditor={handleCloseResponseEditor}
                    addWrappingDiv
                    addingResponse={addingResponse}
                  />
                </div>
              )}
            </>
          )}
        </>
      )}
    </>
  );
}

CommentsView.propTypes = {
  postId: PropTypes.string.isRequired,
  postType: PropTypes.string.isRequired,
  isClosed: PropTypes.bool.isRequired,
  intl: intlShape.isRequired,
  endorsed: PropTypes.oneOf([
    EndorsementStatus.ENDORSED, EndorsementStatus.UNENDORSED, EndorsementStatus.DISCUSSION,
  ]).isRequired,
};

export default injectIntl(React.memo(CommentsView));
