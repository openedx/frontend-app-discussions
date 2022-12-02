import React, { useContext } from 'react';
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
}) {
  const location = useLocation();
  const history = useHistory();
  const dispatch = useDispatch();
  const { courseId } = useSelector((state) => state.courseTabs);
  const topic = useSelector(selectTopic(post.topicId));
  const getTopicSubsection = useSelector(selectorForUnitSubsection);
  const topicContext = useSelector(selectTopicContext(post.topicId));
  const { reasonCodesEnabled } = useSelector(selectModerationSettings);
  const [isDeleting, showDeleteConfirmation, hideDeleteConfirmation] = useToggle(false);
  const [isReporting, showReportConfirmation, hideReportConfirmation] = useToggle(false);
  const [isClosing, showClosePostModal, hideClosePostModal] = useToggle(false);

  const handleAbusedFlag = () => {
    if (post.abuseFlagged) {
      dispatch(updateExistingThread(post.id, { flagged: !post.abuseFlagged }));
    } else {
      showReportConfirmation();
    }
  };

  const handleDeleteConfirmation = () => {
    dispatch(removeThread(post.id));
    history.push('.');
    hideDeleteConfirmation();
  };

  const handleReportConfirmation = () => {
    dispatch(updateExistingThread(post.id, { flagged: !post.abuseFlagged }));
    hideReportConfirmation();
  };

  const { inContext } = useContext(DiscussionContext);
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
    <div className="d-flex flex-column w-100 mw-100" data-testid={`post-${post.id}`}>
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
      <AlertBanner content={post} />
      <PostHeader post={post} actionHandlers={actionHandlers} />
      <div className="d-flex mt-4 mb-2 text-break font-style-normal text-primary-500">
        <HTMLLoader htmlNode={post.renderedBody} id="post" />
      </div>
      {topicContext && topic && (
        <div className={classNames('border px-3 rounded mb-4 border-light-400 align-self-start py-2.5',
          { 'w-100': inContext })}
        >
          <span className="text-gray-500">{intl.formatMessage(messages.relatedTo)}{' '}</span>
          <Hyperlink
            destination={topicContext.unitLink}
            target="_top"
          >
            {inContext
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
      <div className="mb-3">
        <PostFooter post={post} preview={preview} />
      </div>
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
};

Post.defaultProps = {
  preview: false,
};

export default injectIntl(Post);
