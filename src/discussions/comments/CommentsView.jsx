import React, { useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Button, Spinner } from '@edx/paragon';

import { selectThread } from '../posts/data/selectors';
import Post from '../posts/post/Post';
import { selectThreadComments } from './data/selectors';
import { fetchThreadComments } from './data/thunks';
import Reply from './reply/Reply';
import messages from './messages';

function CommentsView({ intl }) {
  const { postId } = useParams();
  const dispatch = useDispatch();
  const thread = useSelector(selectThread(postId));
  const comments = useSelector(selectThreadComments(postId));
  useEffect(() => {
    dispatch(fetchThreadComments(postId));
  }, [postId]);
  if (!thread) {
    return (
      <Spinner animation="border" variant="primary" />
    );
  }
  return (
    <div className="discussion-comments d-flex flex-column w-100 ml-3">
      <div className="mb-2">
        <div className="list-group list-group-flush">
          <Post post={thread} />
          {
            comments.map(reply => <Reply reply={reply} key={reply.id} />)
          }
        </div>
      </div>
      <div className="actions d-flex">
        <Button variant="outline-primary" className="rounded-lg">
          {intl.formatMessage(messages.submit)}
        </Button>
      </div>
    </div>
  );
}

CommentsView.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(CommentsView);
