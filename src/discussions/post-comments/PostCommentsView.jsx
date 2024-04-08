import React, {
  Suspense, useCallback, useContext, useEffect, useMemo, useState,
} from 'react';

import { Button, Icon, IconButton } from '@openedx/paragon';
import { ArrowBack } from '@openedx/paragon/icons';
import { useLocation, useNavigate } from 'react-router-dom';

import { useIntl } from '@edx/frontend-platform/i18n';

import Spinner from '../../components/Spinner';
import { PostsPages } from '../../data/constants';
import useDispatchWithState from '../../data/hooks';
import DiscussionContext from '../common/context';
import { useIsOnTablet } from '../data/hooks';
import { EmptyPage } from '../empty-posts';
import { Post } from '../posts';
import { fetchThread } from '../posts/data/thunks';
import { discussionsPath } from '../utils';
import { ResponseEditor } from './comments/comment';
import { useCommentsCount, usePost } from './data/hooks';
import messages from './messages';
import PostCommentsContext from './postCommentsContext';

const CommentsSort = React.lazy(() => import('./comments/CommentsSort'));
const CommentsView = React.lazy(() => import('./comments/CommentsView'));

const PostCommentsView = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const location = useLocation();
  const isOnTabletorDesktop = useIsOnTablet();
  const [addingResponse, setAddingResponse] = useState(false);
  const [isLoading, submitDispatch] = useDispatchWithState();
  const {
    courseId, learnerUsername, category, topicId, page, enableInContextSidebar, postId,
  } = useContext(DiscussionContext);
  const commentsCount = useCommentsCount(postId);
  const { closed, id: threadId, type } = usePost(postId);
  const redirectUrl = discussionsPath(PostsPages[page], {
    courseId, learnerUsername, category, topicId,
  })(location);

  useEffect(() => {
    if (!threadId) {
      submitDispatch(fetchThread(postId, courseId, true));
    }

    return () => {
      setAddingResponse(false);
    };
  }, [postId]);

  const handleAddResponseButton = useCallback(() => {
    setAddingResponse(true);
  }, []);

  const handleCloseEditor = useCallback(() => {
    setAddingResponse(false);
  }, []);

  const postCommentsContextValue = useMemo(() => ({
    isClosed: closed,
    postType: type,
    postId,
  }));

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
    <PostCommentsContext.Provider value={postCommentsContextValue}>
      {!isOnTabletorDesktop && (
        enableInContextSidebar ? (
          <>
            <div className="px-4 py-1.5 bg-white">
              <Button
                variant="plain"
                className="px-0 line-height-24 py-0 my-1.5 border-0 font-weight-normal font-style text-primary-500"
                iconBefore={ArrowBack}
                onClick={() => navigate({ ...redirectUrl })}
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
            onClick={() => navigate({ ...redirectUrl })}
            alt={intl.formatMessage(messages.backAlt)}
          />
        )
      )}
      <div
        className="discussion-comments d-flex flex-column card border-0 post-card-margin post-card-padding on-focus mx-4 mt-4 mb-0"
      >
        <Post handleAddResponseButton={handleAddResponseButton} />
        {!closed && (
          <ResponseEditor
            handleCloseEditor={handleCloseEditor}
            addingResponse={addingResponse}
          />
        )}
      </div>
      <Suspense fallback={(<Spinner />)}>
        {!!commentsCount && <CommentsSort />}
        <CommentsView threadType={type} />
      </Suspense>
    </PostCommentsContext.Provider>
  );
};

export default PostCommentsView;
