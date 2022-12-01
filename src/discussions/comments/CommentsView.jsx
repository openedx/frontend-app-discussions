import React, { useContext, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';

import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router';
import { useHistory, useLocation } from 'react-router-dom';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  Button, Icon, IconButton, Spinner,
} from '@edx/paragon';
import { ArrowBack } from '@edx/paragon/icons';

import {
  EndorsementStatus, PostsPages, ThreadType,
} from '../../data/constants';
import { useDispatchWithState } from '../../data/hooks';
import { DiscussionContext } from '../common/context';
import { useIsOnDesktop } from '../data/hooks';
import { EmptyPage } from '../empty-posts';
import { Post } from '../posts';
import { selectThread } from '../posts/data/selectors';
import { fetchThread, markThreadAsRead } from '../posts/data/thunks';
import { discussionsPath, filterPosts } from '../utils';
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
  const sortedComments = useMemo(() => [...filterPosts(comments, 'endorsed'),
    ...filterPosts(comments, 'unendorsed')], [comments]);

  return (
    <>
      {((hasMorePages && isLoading) || !isLoading)
      && (
      <div className="mx-4 text-primary-700" role="heading" aria-level="2" style={{ lineHeight: '28px' }}>
        {endorsed === EndorsementStatus.ENDORSED
          ? intl.formatMessage(messages.endorsedResponseCount, { num: sortedComments.length })
          : intl.formatMessage(messages.responseCount, { num: sortedComments.length })}
      </div>
      )}

      <div className="mx-4" role="list">
        {sortedComments.map(comment => (
          <Comment comment={comment} key={comment.id} postType={postType} isClosedPost={isClosed} />
        ))}
        {hasMorePages && !isLoading && (
          <Button
            onClick={handleLoadMoreResponses}
            variant="link"
            block="true"
            className="card p-4 mb-4 font-weight-500 font-size-14"
            style={{
              lineHeight: '20px',
            }}
            data-testid="load-more-comments"
          >
            {intl.formatMessage(messages.loadMoreResponses)}
          </Button>
        )}
        {isLoading
        && (
          <div className="card my-4 p-4 d-flex align-items-center">
            <Spinner animation="border" variant="primary" />
          </div>
        )}
        {!!sortedComments.length && !isClosed
          && <ResponseEditor postId={postId} addWrappingDiv />}
      </div>
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
  const {
    courseId, learnerUsername, category, topicId, page, inContext,
  } = useContext(DiscussionContext);

  useEffect(() => {
    if (!thread) { submitDispatch(fetchThread(postId, courseId, true)); }
  }, [postId]);

  if (!thread) {
    if (!isLoading) {
      return (
        <EmptyPage title={intl.formatMessage(messages.noThreadFound)} />
      );
    }
    return (
      <Spinner animation="border" variant="primary" data-testid="loading-indicator" />
    );
  }

  return (
    <>
      {!isOnDesktop && (
        inContext ? (
          <>
            <div className="px-4 py-1.5 bg-white">
              <Button
                variant="plain"
                className="px-0 font-weight-light text-primary-500"
                iconBefore={ArrowBack}
                onClick={() => history.push(discussionsPath(PostsPages[page], {
                  courseId, learnerUsername, category, topicId,
                })(location))}
                size="sm"
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
      <div className={classNames('discussion-comments d-flex flex-column card', {
        'm-4 p-4.5': !inContext,
        'p-4 rounded-0 border-0 mb-4': inContext,
      })}
      >
        <Post post={thread} />
        {!thread.closed && <ResponseEditor postId={postId} /> }
      </div>
      {thread.type === ThreadType.DISCUSSION && (
        <DiscussionCommentsView
          postId={postId}
          intl={intl}
          postType={thread.type}
          endorsed={EndorsementStatus.DISCUSSION}
          isClosed={thread.closed}
        />
      )}
      {thread.type === ThreadType.QUESTION && (
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
      )}
    </>
  );
}

CommentsView.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(CommentsView);
