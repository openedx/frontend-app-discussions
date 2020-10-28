import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router';
import CommentsView from './CommentsView';
import { selectPostComment, selectPostReplies } from './data/selectors';
import { fetchComment, fetchPostReplies } from './data/thunks';

function CommentsViewContainer() {
  const { postId } = useParams();
  const dispatch = useDispatch();
  const comment = useSelector(selectPostComment(postId));
  const replies = useSelector(selectPostReplies(postId));
  useEffect(() => {
    // The courseId from the URL is the course we WANT to load.
    dispatch(fetchComment(postId));
    dispatch(fetchPostReplies(postId));
  }, [postId]);

  return comment
    ? <CommentsView comment={comment} replies={replies} />
    : null;
}

CommentsViewContainer.propTypes = {};

export default CommentsViewContainer;
