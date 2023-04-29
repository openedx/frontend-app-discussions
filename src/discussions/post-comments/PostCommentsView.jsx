import React, {
  useCallback, useContext, useEffect, useState,
} from 'react';

import { useHistory, useLocation } from 'react-router-dom';

import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Button, Icon, IconButton, Spinner,
} from '@edx/paragon';
import { ArrowBack } from '@edx/paragon/icons';

import { EndorsementStatus, PostsPages, ThreadType } from '../../data/constants';
import { useDispatchWithState } from '../../data/hooks';
import { DiscussionContext } from '../common/context';
import { useIsOnDesktop } from '../data/hooks';
import { EmptyPage } from '../empty-posts';
import { Post } from '../posts';
import { fetchThread } from '../posts/data/thunks';
import { discussionsPath } from '../utils';
import { ResponseEditor } from './comments/comment';
import CommentsSort from './comments/CommentsSort';
import CommentsView from './comments/CommentsView';
import { useCommentsCount, usePost } from './data/hooks';
import messages from './messages';
import { PostCommentsContext } from './postCommentsContext';

// const CommentsSort = React.lazy(() => import('./comments/CommentsSort'));
// const CommentsView = React.lazy(() => import('./comments/CommentsView'));

const PostCommentsView = () => {
  console.log('PostCommentsView');

  const intl = useIntl();
  const history = useHistory();
  const location = useLocation();
  const isOnDesktop = useIsOnDesktop();
  const [addingResponse, setAddingResponse] = useState(false);
  const [isLoading, submitDispatch] = useDispatchWithState();
  const {
    courseId, learnerUsername, category, topicId, page, enableInContextSidebar, postId,
  } = useContext(DiscussionContext);
  const commentsCount = useCommentsCount(postId);
  const { closed, id: threadId, type } = usePost(postId);

  useEffect(() => {
    if (!postId) {
      submitDispatch(fetchThread(postId, courseId, true));
    }

    return () => {
      setAddingResponse(false);
    };
  }, [postId, courseId]);

  const handleAddResponseButton = useCallback(() => {
    setAddingResponse(true);
  }, []);

  const handleCloseEditor = useCallback(() => {
    setAddingResponse(false);
  }, []);

  if (!threadId) {
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
    <PostCommentsContext.Provider value={{
      isClosed: closed,
      postType: type,
      postId,
    }}
    >
      {!isOnDesktop && (
        enableInContextSidebar ? (
          <>
            <div className="px-4 py-1.5 bg-white">
              <Button
                variant="plain"
                className="px-0 line-height-24 py-0 my-1.5 border-0 font-weight-normal font-style text-primary-500"
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
      <div
        className="discussion-comments d-flex flex-column card border-0 post-card-margin post-card-padding on-focus"
      >
        <Post handleAddResponseButton={handleAddResponseButton} />
        {!closed && (
          <ResponseEditor
            handleCloseEditor={handleCloseEditor}
            addingResponse={addingResponse}
          />
        )}
      </div>
      {!!commentsCount && <CommentsSort />}
      {type === ThreadType.DISCUSSION && (
      <CommentsView endorsed={EndorsementStatus.DISCUSSION} />
      )}
      {type === ThreadType.QUESTION && (
      <>
        <CommentsView endorsed={EndorsementStatus.ENDORSED} />
        <CommentsView endorsed={EndorsementStatus.UNENDORSED} />
      </>
      )}
    </PostCommentsContext.Provider>
  );
};

export default PostCommentsView;
