import React, { useContext, useEffect, useState } from 'react';

import { useSelector } from 'react-redux';
import { useParams } from 'react-router';
import { useHistory, useLocation } from 'react-router-dom';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  Button, Icon, IconButton, Spinner,
} from '@edx/paragon';
import { ArrowBack } from '@edx/paragon/icons';

import {
  EndorsementStatus, PostsPages, RequestStatus, ThreadType,
} from '../../data/constants';
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
import { selectCommentsStatus } from './data/selectors';
import messages from './messages';

function PostCommentsView({ intl }) {
  const [isLoading, submitDispatch] = useDispatchWithState();
  const { postId } = useParams();
  const thread = usePost(postId);
  const commentsStatus = useSelector(selectCommentsStatus);
  const commentsCount = useCommentsCount(postId);
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
      {!!commentsCount && commentsStatus === RequestStatus.SUCCESSFUL && <CommentsSort />}
      {thread.type === ThreadType.DISCUSSION && (
        <CommentsView
          postId={postId}
          intl={intl}
          postType={thread.type}
          endorsed={EndorsementStatus.DISCUSSION}
          isClosed={thread.closed}
        />
      )}
      {thread.type === ThreadType.QUESTION && (
        <>
          <CommentsView
            postId={postId}
            intl={intl}
            postType={thread.type}
            endorsed={EndorsementStatus.ENDORSED}
            isClosed={thread.closed}
          />
          <CommentsView
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

PostCommentsView.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(PostCommentsView);
