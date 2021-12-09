import React from 'react';
import PropTypes from 'prop-types';

import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Hyperlink } from '@edx/paragon';

import { ContentActions } from '../../../data/constants';
import { selectTopicContext } from '../../../data/selectors';
import { AlertBanner } from '../../common';
import { selectTopic } from '../../topics/data/selectors';
import { removeThread, updateExistingThread } from '../data/thunks';
import messages from './messages';
import PostFooter from './PostFooter';
import PostHeader from './PostHeader';
import { postShape } from './proptypes';

function Post({
  post,
  preview,
  intl,
}) {
  const location = useLocation();
  const history = useHistory();
  const dispatch = useDispatch();
  const topic = useSelector(selectTopic(post.topicId));
  const topicContext = useSelector(selectTopicContext(post.topicId));
  const actionHandlers = {
    [ContentActions.EDIT_CONTENT]: () => history.push({ ...location, pathname: `${location.pathname}/edit` }),
    // TODO: Add flow to confirm before deleting
    [ContentActions.DELETE]: () => dispatch(removeThread(post.id)),
    [ContentActions.CLOSE]: () => dispatch(updateExistingThread(post.id, { closed: !post.closed })),
    [ContentActions.PIN]: () => dispatch(updateExistingThread(post.id, { pinned: !post.pinned })),
    [ContentActions.REPORT]: () => dispatch(updateExistingThread(post.id, { flagged: !post.abuseFlagged })),
  };
  return (
    <div className="d-flex flex-column p-2.5 w-100 mw-100">
      <div className="mb-4">
        <AlertBanner postType={post.type} content={post} />
      </div>
      <PostHeader post={post} actionHandlers={actionHandlers} />
      <div className="d-flex my-2">
        {/* eslint-disable-next-line react/no-danger */}
        <div dangerouslySetInnerHTML={{ __html: post.renderedBody }} />
      </div>
      {topicContext && topic && (
        <div className="border p-3 rounded mb-3 mt-2 align-self-start">
          {intl.formatMessage(messages.relatedTo)}{' '}
          <Hyperlink destination={topicContext.unitLink}>{`${topic.categoryId} / ${topic.name}`}</Hyperlink>
        </div>
      )}
      <PostFooter post={post} preview={preview} />
    </div>
  );
}

Post.propTypes = {
  intl: intlShape.isRequired,
  post: postShape.isRequired,
  preview: PropTypes.bool,
};

Post.defaultProps = {
  preview: false,
};

export default injectIntl(Post);
