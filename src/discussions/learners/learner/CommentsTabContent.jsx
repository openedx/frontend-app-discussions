import React, { useContext, useEffect } from 'react';
import PropType from 'prop-types';

import { useDispatch, useSelector } from 'react-redux';

import Comment from '../../comments/comment/Comment';
import { DiscussionContext } from '../../common/context';
import { selectUserComments } from '../data/selectors';
import { fetchUserComments } from '../data/thunks';

function CommentsTabContent({ tab }) {
  const dispatch = useDispatch();
  const { courseId, learnerUsername: username } = useContext(DiscussionContext);
  const comments = useSelector(selectUserComments(username, tab));

  useEffect(() => {
    dispatch(fetchUserComments(courseId, username));
  }, [courseId, username]);

  return (
    <div className="mx-3 my-3">
      {comments.map(
        (comment) => <Comment key={comment.id} comment={comment} showFullThread={false} postType="discussion" />,
      )}
    </div>
  );
}

CommentsTabContent.propTypes = {
  tab: PropType.string.isRequired,
};

export default CommentsTabContent;
