import React from 'react';
import PropTypes from 'prop-types';

import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Hyperlink, useToggle } from '@edx/paragon';

import { ContentActions } from '../../../data/constants';
import { selectorForUnitSubsection, selectTopicContext } from '../../../data/selectors';
import { AlertBanner, DeleteConfirmation } from '../../common';
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
  const getTopicSubsection = useSelector(selectorForUnitSubsection);
  const topicContext = useSelector(selectTopicContext(post.topicId));
  const [isDeleting, showDeleteConfirmation, hideDeleteConfirmation] = useToggle(false);
  const actionHandlers = {
    [ContentActions.EDIT_CONTENT]: () => history.push({
      ...location,
      pathname: `${location.pathname}/edit`,
    }),
    [ContentActions.DELETE]: showDeleteConfirmation,
    [ContentActions.CLOSE]: () => dispatch(updateExistingThread(post.id, { closed: !post.closed })),
    [ContentActions.PIN]: () => dispatch(updateExistingThread(post.id, { pinned: !post.pinned })),
    [ContentActions.REPORT]: () => dispatch(updateExistingThread(post.id, { flagged: !post.abuseFlagged })),
  };

  const getTopicCategoryName = topicData => (
    topicData.usageKey ? getTopicSubsection(topicData.usageKey)?.displayName : topicData.categoryId
  );
  return (
    <div className="d-flex flex-column p-2.5 w-100 mw-100" data-testid={`post-${post.id}`}>
      <DeleteConfirmation
        isOpen={isDeleting}
        title={intl.formatMessage(messages.deletePostTitle)}
        description={intl.formatMessage(messages.deletePostDescription)}
        onClose={hideDeleteConfirmation}
        onDelete={() => {
          dispatch(removeThread(post.id));
          history.push('.');
          hideDeleteConfirmation();
        }}
      />
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
          <Hyperlink destination={topicContext.unitLink}>{`${getTopicCategoryName(topic)} / ${topic.name}`}</Hyperlink>
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
