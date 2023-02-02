import React, {
  useContext, useEffect, useMemo, useState,
} from 'react';
import PropTypes from 'prop-types';

import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router';
import { useHistory, useLocation } from 'react-router-dom';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  Button, Icon, IconButton,
  Spinner,
} from '@edx/paragon';
import { ArrowBack } from '@edx/paragon/icons';

import {
  EndorsementStatus, PostsPages, ThreadType,
} from '../../data/constants';
import { useDispatchWithState } from '../../data/hooks';
import { DiscussionContext } from '../common/context';
import { useIsOnDesktop, useUserCanAddThreadInBlackoutDate } from '../data/hooks';
import { EmptyPage } from '../empty-posts';
import { Post } from '../posts';
import { selectThread } from '../posts/data/selectors';
import { fetchThread, markThreadAsRead } from '../posts/data/thunks';
import { discussionsPath, filterPosts, isLastElementOfList } from '../utils';
import { selectThreadComments, selectThreadCurrentPage, selectThreadHasMorePages } from './data/selectors';
import { fetchThreadComments } from './data/thunks';
import { Comment, ResponseEditor } from './comment';
import messages from './messages';

function usePost(postId) {
  const dispatch = useDispatch();
  const thread = useSelector(selectThread(postId));

  useEffect(() => {
    if (thread && !thread.read) {
      dispatch(markThreadAsRead(postId));
    }
  }, [postId]);

  return thread;
}

function usePostComments(postId, endorsed = null) {
  const [isLoading, dispatch] = useDispatchWithState();
  const comments = useSelector(selectThreadComments(postId, endorsed));
  const hasMorePages = useSelector(selectThreadHasMorePages(postId, endorsed));
  const currentPage = useSelector(selectThreadCurrentPage(postId, endorsed));
  const handleLoadMoreResponses = async () => dispatch(fetchThreadComments(postId, {
    endorsed,
    page: currentPage + 1,
  }));
  useEffect(() => {
    dispatch(fetchThreadComments(postId, {
      endorsed,
      page: 1,
    }));
  }, [postId]);
  return {
    comments,
    hasMorePages,
    isLoading,
    handleLoadMoreResponses,
  };
}

function DiscussionCommentsView({
  postType,
  postId,
  intl,
  endorsed,
  isClosed,
}) {
  const {
    comments,
    hasMorePages,
    isLoading,
    handleLoadMoreResponses,
  } = usePostComments(postId, endorsed);

  const endorsedComments = useMemo(() => [...filterPosts(comments, 'endorsed')], [comments]);
  const unEndorsedComments = useMemo(() => [...filterPosts(comments, 'unendorsed')], [comments]);
  const userCanAddThreadInBlackoutDate = useUserCanAddThreadInBlackoutDate();
  const [addingResponse, setAddingResponse] = useState(false);

  const handleDefinition = (message, commentsLength) => (
    <div
      className="mx-4 my-14px text-gray-700 font-style-normal font-family-inter"
      role="heading"
      aria-level="2"
      style={{ lineHeight: '24px' }}
    >
      {intl.formatMessage(message, { num: commentsLength })}
    </div>
  );

  const handleComments = (postComments, showLoadMoreResponses = false) => (
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
          className="px-4 mt-3 py-0 mb-2 font-style-normal font-family-inter font-weight-500 font-size-14"
          style={{
            lineHeight: '24px',
            border: '0px',
          }}
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
  );
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
                      className="card mb-4 px-0 py-10px mt-2 fontStyle font-weight-500 font-size-14 text-primary-500"
                      style={{
                        lineHeight: '24px',
                        border: '0px',
                      }}
                      onClick={() => setAddingResponse(true)}
                      data-testid="add-response"
                    >
                      {intl.formatMessage(messages.addResponse)}
                    </Button>
                  )}

                  <ResponseEditor
                    postId={postId}
                    handleCloseEditor={() => setAddingResponse(false)}
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

DiscussionCommentsView.propTypes = {
  postId: PropTypes.string.isRequired,
  postType: PropTypes.string.isRequired,
  isClosed: PropTypes.bool.isRequired,
  intl: intlShape.isRequired,
  endorsed: PropTypes.oneOf([
    EndorsementStatus.ENDORSED, EndorsementStatus.UNENDORSED, EndorsementStatus.DISCUSSION,
  ]).isRequired,
};

function CommentsView({ intl }) {
  const [isLoading, submitDispatch] = useDispatchWithState();
  const { postId } = useParams();
  const thread = usePost(postId);
  const history = useHistory();
  const location = useLocation();
  const isOnDesktop = useIsOnDesktop();
  const [addingResponse, setAddingResponse] = useState(false);
  const {
    courseId, learnerUsername, category, topicId, page, enableInContextSidebar,
  } = useContext(DiscussionContext);

  useEffect(() => {
    if (!thread) { submitDispatch(fetchThread(postId, courseId, true)); }
    setAddingResponse(false);
  }, [postId]);

  if (!thread) {
    if (!isLoading) {
      return (
        <EmptyPage title={intl.formatMessage(messages.noThreadFound)} />
      );
    }
    return (
      <div style={{
        position: 'absolute',
        top: '50%',
      }}
      >
        <Spinner animation="border" variant="primary" data-testid="loading-indicator" />
      </div>
    );
  }

  return (
    <>
      {!isOnDesktop && (
        enableInContextSidebar ? (
          <>
            <div className="px-4 py-1.5 bg-white">
              <Button
                variant="plain"
                className="px-0 py-0 my-1.5 border-0 font-weight-normal fontStyle text-primary-500"
                iconBefore={ArrowBack}
                onClick={() => history.push(discussionsPath(PostsPages[page], {
                  courseId, learnerUsername, category, topicId,
                })(location))}
                size="sm"
                style={{ lineHeight: '24px' }}
              >
                {intl.formatMessage(messages.backAlt)}
              </Button>
            </div>
            <div className="border-bottom border-light-400" />
          </>
        ) : (
          <IconButton
            src={ArrowBack}
            iconAs={Icon}
            style={{ padding: '18px' }}
            size="inline"
            className="ml-4 mt-4"
            onClick={() => history.push(discussionsPath(PostsPages[page], {
              courseId, learnerUsername, category, topicId,
            })(location))}
            alt={intl.formatMessage(messages.backAlt)}
          />
        )
      )}
      <div
        className="discussion-comments d-flex flex-column card border-0 post-card-margin post-card-padding"
      >
        <Post post={thread} handleAddResponseButton={() => setAddingResponse(true)} />
        {!thread.closed && (
          <ResponseEditor
            postId={postId}
            handleCloseEditor={() => setAddingResponse(false)}
            addingResponse={addingResponse}
          />
        )}
      </div>
      {
        thread.type === ThreadType.DISCUSSION && (
          <DiscussionCommentsView
            postId={postId}
            intl={intl}
            postType={thread.type}
            endorsed={EndorsementStatus.DISCUSSION}
            isClosed={thread.closed}
          />
        )
      }
      {
        thread.type === ThreadType.QUESTION && (
          <>
            <DiscussionCommentsView
              postId={postId}
              intl={intl}
              postType={thread.type}
              endorsed={EndorsementStatus.ENDORSED}
              isClosed={thread.closed}
            />
            <DiscussionCommentsView
              postId={postId}
              intl={intl}
              postType={thread.type}
              endorsed={EndorsementStatus.UNENDORSED}
              isClosed={thread.closed}
            />
          </>
        )
      }
    </>
  );
}

CommentsView.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(CommentsView);
