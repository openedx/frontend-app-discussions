import React, { useContext, useEffect } from 'react';
import PropType from 'prop-types';

import { useSelector } from 'react-redux';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Button } from '@edx/paragon';

import { useDispatchWithState } from '../../../data/hooks';
import Comment from '../../comments/comment/Comment';
import messages from '../../comments/messages';
import { DiscussionContext } from '../../common/context';
import { selectLearnerCommentsNextPage, selectUserComments } from '../data/selectors';
import { fetchUserComments } from '../data/thunks';

function CommentsTabContent({ tab, intl }) {
  const [loading, dispatch] = useDispatchWithState();
  const { courseId, learnerUsername: username } = useContext(DiscussionContext);
  const comments = useSelector(selectUserComments(username, tab));
  const nextPage = useSelector(selectLearnerCommentsNextPage(username));

  useEffect(() => {
    dispatch(fetchUserComments(courseId, username));
  }, [courseId, username]);

  const handleLoadMoreComments = () => dispatch(fetchUserComments(courseId, username, { page: nextPage }));
  return (
    <div className="mx-3 my-3">
      {comments.map(
        (comment) => <Comment key={comment.id} comment={comment} showFullThread={false} postType="discussion" />,
      )}
      {nextPage && !loading && (
        <Button
          onClick={handleLoadMoreComments}
          variant="link"
          block="true"
          className="card p-4"
        >
          {intl.formatMessage(messages.loadMoreComments)}
        </Button>
      )}
    </div>
  );
}

CommentsTabContent.propTypes = {
  intl: intlShape.isRequired,
  tab: PropType.string.isRequired,
};

export default injectIntl(CommentsTabContent);
