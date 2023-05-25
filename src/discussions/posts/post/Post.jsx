import React, { useCallback, useContext, useMemo } from 'react';
import PropTypes from 'prop-types';

import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';

import { getConfig } from '@edx/frontend-platform';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Hyperlink, useToggle } from '@edx/paragon';

import HTMLLoader from '../../../components/HTMLLoader';
import { ContentActions } from '../../../data/constants';
import { selectorForUnitSubsection, selectTopicContext } from '../../../data/selectors';
import { AlertBanner, Confirmation } from '../../common';
import { DiscussionContext } from '../../common/context';
import HoverCard from '../../common/HoverCard';
import { selectModerationSettings, selectUserHasModerationPrivileges } from '../../data/selectors';
import { selectTopic } from '../../topics/data/selectors';
import { removeThread, updateExistingThread } from '../data/thunks';
import ClosePostReasonModal from './ClosePostReasonModal';
import messages from './messages';
import PostFooter from './PostFooter';
import PostHeader from './PostHeader';
import { postShape } from './proptypes';

const Post = ({
  post,
  intl,
  handleAddResponseButton,
}) => {
  const location = useLocation();
  const history = useHistory();
  const dispatch = useDispatch();
  const { enableInContextSidebar } = useContext(DiscussionContext);
  const courseId = useSelector((state) => state.config.id);
  const topic = useSelector(selectTopic(post.topicId));
  const getTopicSubsection = useSelector(selectorForUnitSubsection);
  const topicContext = useSelector(selectTopicContext(post.topicId));
  const { reasonCodesEnabled } = useSelector(selectModerationSettings);
  const [isDeleting, showDeleteConfirmation, hideDeleteConfirmation] = useToggle(false);
  const [isReporting, showReportConfirmation, hideReportConfirmation] = useToggle(false);
  const [isClosing, showClosePostModal, hideClosePostModal] = useToggle(false);
  const userHasModerationPrivileges = useSelector(selectUserHasModerationPrivileges);
  const displayPostFooter = post.following || post.voteCount || post.closed
  || (post.groupId && userHasModerationPrivileges);

  const handleAbusedFlag = useCallback(() => {
    if (post.abuseFlagged) {
      dispatch(updateExistingThread(post.id, { flagged: !post.abuseFlagged }));
    } else {
      showReportConfirmation();
    }
  }, [dispatch, post.abuseFlagged, post.id, showReportConfirmation]);

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

  const handlePostCopyLink = useCallback(() => {
    const postURL = new URL(`${getConfig().PUBLIC_PATH}${courseId}/posts/${post.id}`, window.location.origin);
    navigator.clipboard.writeText(postURL.href);
  }, [window.location.origin, post.id, courseId]);

  const actionHandlers = useMemo(() => ({
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
    [ContentActions.COPY_LINK]: handlePostCopyLink,
    [ContentActions.PIN]: () => dispatch(updateExistingThread(post.id, { pinned: !post.pinned })),
    [ContentActions.REPORT]: () => handleAbusedFlag(),
  }), [
    showDeleteConfirmation,
    history,
    location,
    post.closed,
    post.id,
    post.pinned,
    reasonCodesEnabled,
    dispatch,
    showClosePostModal,
    courseId,
    handleAbusedFlag,
  ]);

  const getTopicCategoryName = topicData => (
    topicData.usageKey ? getTopicSubsection(topicData.usageKey)?.displayName : topicData.categoryId
  );

  const getTopicInfo = topicData => (
    getTopicCategoryName(topicData) ? `${getTopicCategoryName(topicData)} / ${topicData.name}` : `${topicData.name}`
  );

  return (
    <div
      className="d-flex flex-column w-100 mw-100 post-card-comment"
      data-testid={`post-${post.id}`}
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex="0"
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
      <HoverCard
        commentOrPost={post}
        actionHandlers={actionHandlers}
        handleResponseCommentButton={handleAddResponseButton}
        addResponseCommentButtonMessage={intl.formatMessage(messages.addResponse)}
        onLike={() => dispatch(updateExistingThread(post.id, { voted: !post.voted }))}
        onFollow={() => dispatch(updateExistingThread(post.id, { following: !post.following }))}
        isClosedPost={post.closed}
      />
      <AlertBanner content={post} />
      <PostHeader post={post} />
      <div className="d-flex mt-14px text-break font-style text-primary-500">
        <HTMLLoader htmlNode={post.renderedBody} componentId="post" cssClassName="html-loader" testId={post.id} />
      </div>
      {(topicContext || topic) && (
        <div
          className={classNames(
            'mt-14px font-style font-size-12',
            { 'w-100': enableInContextSidebar, 'mb-1': !displayPostFooter },
          )}
          style={{ lineHeight: '20px' }}
        >
          <span className="text-gray-500" style={{ lineHeight: '20px' }}>{intl.formatMessage(messages.relatedTo)}{' '}</span>
          <Hyperlink
            destination={topicContext ? topicContext.unitLink : `${getConfig().BASE_URL}/${courseId}/topics/${post.topicId}`}
            target="_top"
          >
            {(topicContext && !topic)
              ? (
                <>
                  <span className="w-auto">{topicContext.chapterName}</span>
                  <span className="mx-1">/</span>
                  <span className="w-auto">{topicContext.verticalName}</span>
                  <span className="mx-1">/</span>
                  <span className="w-auto">{topicContext.unitName}</span>
                </>
              )
              : getTopicInfo(topic)}
          </Hyperlink>
        </div>
      )}
      {displayPostFooter && <PostFooter post={post} userHasModerationPrivileges={userHasModerationPrivileges} />}
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
};

Post.propTypes = {
  intl: intlShape.isRequired,
  post: postShape.isRequired,
  handleAddResponseButton: PropTypes.func.isRequired,
};

export default injectIntl(Post);
