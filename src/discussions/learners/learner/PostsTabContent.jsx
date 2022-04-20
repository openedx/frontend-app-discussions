import React, { useContext, useEffect } from 'react';

import { useSelector } from 'react-redux';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Button } from '@edx/paragon';

import { useDispatchWithState } from '../../../data/hooks';
import { DiscussionContext } from '../../common/context';
import { Post } from '../../posts';
import { selectLearnerPostsNextPage, selectUserPosts } from '../data/selectors';
import { fetchUserPosts } from '../data/thunks';
import messages from './messages';

function PostsTabContent({ intl }) {
  const [loading, dispatch] = useDispatchWithState();
  const { courseId, learnerUsername: username } = useContext(DiscussionContext);
  const posts = useSelector(selectUserPosts(username));
  const nextPage = useSelector(selectLearnerPostsNextPage(username));

  useEffect(() => {
    dispatch(fetchUserPosts(courseId, username));
  }, [courseId, username]);
  // console.log({ posts });
  const handleLoadMorePosts = () => dispatch(fetchUserPosts(courseId, username, { page: nextPage }));

  return (
    <div className="d-flex flex-column my-3 mx-3 bg-white rounded">
      {posts.map((post) => (
        <div
          data-testid="post"
          key={post.id}
          className="px-3 pb-3 border-bottom border-light-500"
        >
          <Post post={post} />
        </div>
      ))}
      {nextPage && !loading && (
        <Button
          onClick={handleLoadMorePosts}
          variant="link"
          block="true"
          className="card p-4"
        >
          {intl.formatMessage(messages.loadMorePosts)}
        </Button>
      )}
    </div>
  );
}

PostsTabContent.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(PostsTabContent);
