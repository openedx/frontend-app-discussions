import React, { useCallback, useContext, useMemo } from 'react';
import PropTypes from 'prop-types';

import classNames from 'classnames';
import { toString } from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';

import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Hyperlink, useToggle } from '@edx/paragon';

import HTMLLoader from '../../../components/HTMLLoader';
import { ContentActions } from '../../../data/constants';
import { selectorForUnitSubsection, selectTopicContext } from '../../../data/selectors';
import { AlertBanner, Confirmation } from '../../common';
import { DiscussionContext } from '../../common/context';
import HoverCard from '../../common/HoverCard';
import { ContentTypes } from '../../data/constants';
import { selectModerationSettings, selectUserHasModerationPrivileges } from '../../data/selectors';
import { selectTopic } from '../../topics/data/selectors';
import { selectThread } from '../data/selectors';
import { removeThread, updateExistingThread } from '../data/thunks';
import ClosePostReasonModal from './ClosePostReasonModal';
import messages from './messages';
import PostFooter from './PostFooter';
import PostHeader from './PostHeader';

const Post = ({ handleAddResponseButton }) => {
  const { enableInContextSidebar, postId } = useContext(DiscussionContext);
  const {
    topicId, abuseFlagged, closed, pinned, voted, hasEndorsed, following, closedBy, voteCount, groupId, groupName,
    closeReason, authorLabel, type: postType, author, title, createdAt, renderedBody, lastEdit, editByLabel,
    closedByLabel,
  } = useSelector(selectThread(postId));
  const intl = useIntl();
  const location = useLocation();
  const history = useHistory();
  const dispatch = useDispatch();
  const courseId = useSelector((state) => state.config.id);
  const topic = useSelector(selectTopic(topicId));
  const getTopicSubsection = useSelector(selectorForUnitSubsection);
  const topicContext = useSelector(selectTopicContext(topicId));
  const { reasonCodesEnabled } = useSelector(selectModerationSettings);
  const [isDeleting, showDeleteConfirmation, hideDeleteConfirmation] = useToggle(false);
  const [isReporting, showReportConfirmation, hideReportConfirmation] = useToggle(false);
  const [isClosing, showClosePostModal, hideClosePostModal] = useToggle(false);
  const userHasModerationPrivileges = useSelector(selectUserHasModerationPrivileges);
  const displayPostFooter = following || voteCount || closed || (groupId && userHasModerationPrivileges);

  const handleDeleteConfirmation = useCallback(async () => {
    await dispatch(removeThread(postId));
    history.push({
      pathname: '.',
      search: enableInContextSidebar && '?inContextSidebar',
    });
    hideDeleteConfirmation();
  }, [enableInContextSidebar, postId, hideDeleteConfirmation]);

  const handleReportConfirmation = useCallback(() => {
    dispatch(updateExistingThread(postId, { flagged: !abuseFlagged }));
    hideReportConfirmation();
  }, [abuseFlagged, postId, hideReportConfirmation]);

  const handlePostContentEdit = useCallback(() => history.push({
    ...location,
    pathname: `${location.pathname}/edit`,
  }), [location.pathname]);

  const handlePostClose = useCallback(() => {
    if (closed) {
      dispatch(updateExistingThread(postId, { closed: false }));
    } else if (reasonCodesEnabled) {
      showClosePostModal();
    } else {
      dispatch(updateExistingThread(postId, { closed: true }));
    }
  }, [closed, postId, reasonCodesEnabled, showClosePostModal]);

  const handlePostCopyLink = useCallback(() => {
    const postURL = new URL(`${getConfig().PUBLIC_PATH}${courseId}/posts/${postId}`, window.location.origin);
    navigator.clipboard.writeText(postURL.href);
  }, [window.location.origin, postId, courseId]);

  const handlePostPin = useCallback(() => dispatch(
    updateExistingThread(postId, { pinned: !pinned }),
  ), [postId, pinned]);

  const handlePostReport = useCallback(() => {
    if (abuseFlagged) {
      dispatch(updateExistingThread(postId, { flagged: !abuseFlagged }));
    } else {
      showReportConfirmation();
    }
  }, [abuseFlagged, postId, showReportConfirmation]);

  const actionHandlers = useMemo(() => ({
    [ContentActions.EDIT_CONTENT]: handlePostContentEdit,
    [ContentActions.DELETE]: showDeleteConfirmation,
    [ContentActions.CLOSE]: handlePostClose,
    [ContentActions.COPY_LINK]: handlePostCopyLink,
    [ContentActions.PIN]: handlePostPin,
    [ContentActions.REPORT]: handlePostReport,
  }), [
    handlePostClose, handlePostContentEdit, handlePostCopyLink, handlePostPin, handlePostReport, showDeleteConfirmation,
  ]);

  const handleClosePostConfirmation = useCallback((closeReasonCode) => {
    dispatch(updateExistingThread(postId, { closed: true, closeReasonCode }));
    hideClosePostModal();
  }, [postId, hideClosePostModal]);

  const handlePostLike = useCallback(() => {
    dispatch(updateExistingThread(postId, { voted: !voted }));
  }, [postId, voted]);

  const handlePostFollow = useCallback(() => {
    dispatch(updateExistingThread(postId, { following: !following }));
  }, [postId, following]);

  const getTopicCategoryName = useCallback(topicData => (
    topicData.usageKey ? getTopicSubsection(topicData.usageKey)?.displayName : topicData.categoryId
  ), [getTopicSubsection]);

  const getTopicInfo = useCallback(topicData => (
    getTopicCategoryName(topicData) ? `${getTopicCategoryName(topicData)} / ${topicData.name}` : `${topicData.name}`
  ), [getTopicCategoryName]);

  return (
    <div
      className="d-flex flex-column w-100 mw-100 post-card-comment"
      data-testid={`post-${postId}`}
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
      {!abuseFlagged && (
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
        id={postId}
        contentType={ContentTypes.POST}
        actionHandlers={actionHandlers}
        handleResponseCommentButton={handleAddResponseButton}
        addResponseCommentButtonMessage={intl.formatMessage(messages.addResponse)}
        onLike={handlePostLike}
        onFollow={handlePostFollow}
        voted={voted}
        following={following}
      />
      <AlertBanner
        author={author}
        abuseFlagged={abuseFlagged}
        lastEdit={lastEdit}
        closed={closed}
        closedBy={closedBy}
        closeReason={closeReason}
        editByLabel={editByLabel}
        closedByLabel={closedByLabel}
      />
      <PostHeader
        abuseFlagged={abuseFlagged}
        author={author}
        authorLabel={authorLabel}
        closed={closed}
        createdAt={createdAt}
        hasEndorsed={hasEndorsed}
        lastEdit={lastEdit}
        postType={postType}
        title={title}
      />
      <div className="d-flex mt-14px text-break font-style text-primary-500">
        <HTMLLoader htmlNode={renderedBody} componentId="post" cssClassName="html-loader" testId={postId} />
      </div>
      {(topicContext || topic) && (
        <div
          className={classNames(
            'mt-14px font-style font-size-12',
            { 'w-100': enableInContextSidebar, 'mb-1': !displayPostFooter },
          )}
          style={{ lineHeight: '20px' }}
        >
          <span className="text-gray-500" style={{ lineHeight: '20px' }}>
            {intl.formatMessage(messages.relatedTo)}{' '}
          </span>
          <Hyperlink
            target="_top"
            destination={topicContext ? (
              topicContext.unitLink
            ) : (
              `${getConfig().BASE_URL}/${courseId}/topics/${topicId}`
            )}
          >
            {(topicContext && !topic) ? (
              <>
                <span className="w-auto">{topicContext.chapterName}</span>
                <span className="mx-1">/</span>
                <span className="w-auto">{topicContext.verticalName}</span>
                <span className="mx-1">/</span>
                <span className="w-auto">{topicContext.unitName}</span>
              </>
            ) : (
              getTopicInfo(topic)
            )}
          </Hyperlink>
        </div>
      )}
      {displayPostFooter && (
        <PostFooter
          id={postId}
          voteCount={voteCount}
          voted={voted}
          following={following}
          groupId={toString(groupId)}
          groupName={groupName}
          closed={closed}
          userHasModerationPrivileges={userHasModerationPrivileges}
        />
      )}
      <ClosePostReasonModal
        isOpen={isClosing}
        onCancel={hideClosePostModal}
        onConfirm={handleClosePostConfirmation}
      />
    </div>
  );
};

Post.propTypes = {
  handleAddResponseButton: PropTypes.func.isRequired,
};

export default React.memo(Post);
