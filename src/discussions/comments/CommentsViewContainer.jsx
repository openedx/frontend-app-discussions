import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router';
import CommentsView from './CommentsView';
import { selectTopicComments } from './data/selectors';
import { fetchTopicComments } from './data/thunks';


function CommentsViewContainer() {
  const { threadId } = useParams();
  const dispatch = useDispatch();
  const comments = useSelector(selectTopicComments(threadId));
  useEffect(() => {
    // The courseId from the URL is the course we WANT to load.
    dispatch(fetchTopicComments(threadId));
  }, [threadId]);

  return (
    <CommentsView comments={comments} />
  );
}

CommentsViewContainer.propTypes = {};

export default CommentsViewContainer;
