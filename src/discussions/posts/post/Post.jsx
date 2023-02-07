import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';

import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Hyperlink, useToggle } from '@edx/paragon';

import HTMLLoader from '../../../components/HTMLLoader';
import { ContentActions } from '../../../data/constants';
import { selectorForUnitSubsection, selectTopicContext } from '../../../data/selectors';
import { AlertBanner, Confirmation } from '../../common';
import { DiscussionContext } from '../../common/context';
import HoverCard from '../../common/HoverCard';
import { selectModerationSettings } from '../../data/selectors';
import { selectTopic } from '../../topics/data/selectors';
import { removeThread, updateExistingThread } from '../data/thunks';
import ClosePostReasonModal from './ClosePostReasonModal';
import messages from './messages';
import PostFooter from './PostFooter';
import PostHeader from './PostHeader';
import { postShape } from './proptypes';

function Post({
  post,
  preview,
  intl,
  handleAddResponseButton,
}) {
  const location = useLocation();
  const history = useHistory();
  const dispatch = useDispatch();
  const { enableInContextSidebar } = useContext(DiscussionContext);
  const { courseId } = useSelector((state) => state.courseTabs);
  const topic = useSelector(selectTopic(post.topicId));
  const getTopicSubsection = useSelector(selectorForUnitSubsection);
  const topicContext = useSelector(selectTopicContext(post.topicId));
  const { reasonCodesEnabled } = useSelector(selectModerationSettings);
  const [isDeleting, showDeleteConfirmation, hideDeleteConfirmation] = useToggle(false);
  const [isReporting, showReportConfirmation, hideReportConfirmation] = useToggle(false);
  const [isClosing, showClosePostModal, hideClosePostModal] = useToggle(false);
  const [showHoverCard, setShowHoverCard] = useState(false);
  const handleAbusedFlag = () => {
    if (post.abuseFlagged) {
      dispatch(updateExistingThread(post.id, { flagged: !post.abuseFlagged }));
    } else {
      showReportConfirmation();
    }
  };

  const handleDeleteConfirmation = async () => {
    await dispatch(removeThread(post.id));
    history.push({
      pathname: '.',
      search: enableInContextSidebar && '?inContextSidebar',
    });
    hideDeleteConfirmation();
  };

  const handleReportConfirmation = () => {
    dispatch(updateExistingThread(post.id, { flagged: !post.abuseFlagged }));
    hideReportConfirmation();
  };

  const handleHoverCardBlurEvent = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setShowHoverCard(false);
    }
  };

  const actionHandlers = {
    [ContentActions.EDIT_CONTENT]: () => history.push({
      ...location,
      pathname: `${location.pathname}/edit`,
    }),
    [ContentActions.DELETE]: showDeleteConfirmation,
    [ContentActions.CLOSE]: () => {
      if (post.closed) {
        dispatch(updateExistingThread(post.id, { closed: false }));
      } else if (reasonCodesEnabled) {
        showClosePostModal();
      } else {
        dispatch(updateExistingThread(post.id, { closed: true }));
      }
    },
    [ContentActions.COPY_LINK]: () => { navigator.clipboard.writeText(`${window.location.origin}/${courseId}/posts/${post.id}`); },
    [ContentActions.PIN]: () => dispatch(updateExistingThread(post.id, { pinned: !post.pinned })),
    [ContentActions.REPORT]: () => handleAbusedFlag(),
  };

  const getTopicCategoryName = topicData => (
    topicData.usageKey ? getTopicSubsection(topicData.usageKey)?.displayName : topicData.categoryId
  );

  return (
    <div
      className="d-flex flex-column w-100 mw-100 post-card-comment"
      aria-level={5}
      data-testid={`post-${post.id}`}
      onMouseEnter={() => setShowHoverCard(true)}
      onMouseLeave={() => setShowHoverCard(false)}
      onFocus={() => setShowHoverCard(true)}
      onBlur={(e) => handleHoverCardBlurEvent(e)}
    >
      <Confirmation
        isOpen={isDeleting}
        title={intl.formatMessage(messages.deletePostTitle)}
        description={intl.formatMessage(messages.deletePostDescription)}
        onClose={hideDeleteConfirmation}
        comfirmAction={handleDeleteConfirmation}
        closeButtonVaraint="tertiary"
        confirmButtonText={intl.formatMessage(messages.deleteConfirmationDelete)}
      />
      {!post.abuseFlagged && (
        <Confirmation
          isOpen={isReporting}
          title={intl.formatMessage(messages.reportPostTitle)}
          description={intl.formatMessage(messages.reportPostDescription)}
          onClose={hideReportConfirmation}
          comfirmAction={handleReportConfirmation}
          confirmButtonVariant="danger"
        />
      )}
      {showHoverCard && (
        <HoverCard
          commentOrPost={post}
          actionHandlers={actionHandlers}
          handleResponseCommentButton={handleAddResponseButton}
          addResponseCommentButtonMessage={intl.formatMessage(messages.addResponse)}
          onLike={() => dispatch(updateExistingThread(post.id, { voted: !post.voted }))}
          onFollow={() => dispatch(updateExistingThread(post.id, { following: !post.following }))}
          isClosedPost={post.closed}
        />
      )}
      <AlertBanner content={post} />
      <PostHeader post={post} />
      <div className="d-flex mt-14px text-break font-style text-primary-500">
        <HTMLLoader htmlNode={post.renderedBody} componentId="post" cssClassName="html-loader" testId={post.id} />
      </div>
      {topicContext && topic && (
        <div
          className={classNames('mt-14px mb-1 font-style font-size-12',
            { 'w-100': enableInContextSidebar })}
          style={{ lineHeight: '20px' }}
        >
          <span className="text-gray-500" style={{ lineHeight: '20px' }}>{intl.formatMessage(messages.relatedTo)}{' '}</span>
          <Hyperlink
            destination={topicContext.unitLink}
            target="_top"
          >
            {enableInContextSidebar
              ? (
                <>
                  <span className="w-auto">{topicContext.chapterName}</span>
                  <span className="mx-1">/</span>
                  <span className="w-auto">{topicContext.verticalName}</span>
                  <span className="mx-1">/</span>
                  <span className="w-auto">{topicContext.unitName}</span>
                </>
              )
              : `${getTopicCategoryName(topic)} / ${topic.name}`}
          </Hyperlink>
        </div>
      )}
      <PostFooter post={post} preview={preview} />
      <ClosePostReasonModal
        isOpen={isClosing}
        onCancel={hideClosePostModal}
        onConfirm={closeReasonCode => {
          dispatch(updateExistingThread(post.id, { closed: true, closeReasonCode }));
          hideClosePostModal();
        }}
      />
    </div>
  );
}

Post.propTypes = {
  intl: intlShape.isRequired,
  post: postShape.isRequired,
  preview: PropTypes.bool,
  handleAddResponseButton: PropTypes.func.isRequired,
};

Post.defaultProps = {
  preview: false,
};

export default injectIntl(Post);
