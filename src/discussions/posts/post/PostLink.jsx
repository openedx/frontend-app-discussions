import React, { useContext } from 'react';

import classNames from 'classnames';
import { Link } from 'react-router-dom';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Badge, Icon } from '@edx/paragon';
import { Bookmark } from '@edx/paragon/icons';

import HTMLLoader from '../../../components/HTMLLoader';
import { AvatarBorderAndLabelColors, Routes, ThreadType } from '../../../data/constants';
import AuthorLabel from '../../common/AuthorLabel';
import { DiscussionContext } from '../../common/context';
import { discussionsPath } from '../../utils';
import messages from './messages';
import PostFooter from './PostFooter';
import { PostAvatar } from './PostHeader';
import { postShape } from './proptypes';

function PostLink({
  post,
  intl,
}) {
  const {
    page,
    postId,
    inContext,
    category,
  } = useContext(DiscussionContext);
  const linkUrl = discussionsPath(Routes.COMMENTS.PAGES[page], {
    0: inContext ? 'in-context' : undefined,
    courseId: post.courseId,
    topicId: post.topicId,
    postId: post.id,
    category,
  });
  const showAnsweredBadge = post.hasEndorsed && post.type === ThreadType.QUESTION;
  const authorLabelColor = AvatarBorderAndLabelColors[post.authorLabel];
  return (
    <Link
      className="discussion-post list-group-item list-group-item-action p-0 text-decoration-none text-gray-900 mw-100"
      to={linkUrl}
      style={{ lineHeight: '21px', height: '7.5rem' }}
    >
      {post.pinned && (
        <div className="d-flex flex-fill justify-content-end mr-4 text-light-500 p-0">
          <Icon src={Bookmark} className="position-absolute mt-n1" />
        </div>
      )}
      <div
        className={classNames('d-flex flex-row flex-fill mw-100 p-2.5 pr-4 border-primary-500', { 'bg-light-300': post.read })}
        style={post.id === postId ? {
          borderRightWidth: '4px',
          borderRightStyle: 'solid',
        } : null}
      >
        <PostAvatar post={post} authorLabel={post.authorLabel} fromPostLink />
        <div className="d-flex flex-column" style={{ width: 'calc(100% - 4rem)' }}>
          <div className="align-items-center d-flex flex-row flex-fill">
            <div className="d-flex flex-column justify-content-start mw-100 flex-fill">
              <div className="d-flex align-items-center pb-0 mb-0 flex-fill font-weight-500">
                <div className="flex-fill text-truncate text-primary-500 font-weight-500 font-size-14 font-style-normal font-family-inter">
                  {post.title}
                </div>
                {showAnsweredBadge
                  && (
                    <div className="ml-auto">
                      <Badge variant="success">{intl.formatMessage(messages.answered)}</Badge>
                    </div>
                  )}
                {post.abuseFlagged
                  && (
                    <div className={showAnsweredBadge ? 'ml-2' : 'ml-auto'}>
                      <Badge variant="danger" data-testid="reported-post">{intl.formatMessage(messages.contentReported)}</Badge>
                    </div>
                  )}
              </div>
              <AuthorLabel
                author={post.author || intl.formatMessage(messages.anonymous)}
                authorLabel={post.authorLabel}
                labelColor={authorLabelColor && `text-${authorLabelColor}`}
              />
            </div>
          </div>
          <div className="text-truncate text-primary-500 font-weight-normal font-size-14 font-style-normal font-family-inter" style={{ 'max-height': '1.6em' }}>
            <HTMLLoader htmlNode={post.renderedBody || post.rawBody} />
          </div>
          <PostFooter post={post} preview intl={intl} />
        </div>
      </div>
    </Link>
  );
}

PostLink.propTypes = {
  post: postShape.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(PostLink);
