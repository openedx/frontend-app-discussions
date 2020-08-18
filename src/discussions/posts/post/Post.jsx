import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { faQuestionCircle, faStar as faEmptyStar } from '@fortawesome/free-regular-svg-icons';
import {
  faCircle, faComments, faFlag, faStar as faSolidStar, faThumbtack,
} from '@fortawesome/free-solid-svg-icons';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import { Routes } from '../../../data/constants';
import messages from './messages';

function Post({ post, intl }) {
  return (
    <div className="discussion-post d-flex border-bottom pl-2 pt-1 pb-1" data-post-id={post.id}>
      <div className="d-flex post-unread-status m-1">
        { post.read || <FontAwesomeIcon icon={faCircle} /> }
      </div>
      <div className="d-flex flex-column">
        <div className="d-flex post-header">
          <div className="d-flex user-avatar m-1">
            [A]
          </div>
          <div className="d-flex post-type-icon m-1">
            { post.type === 'question' && <FontAwesomeIcon icon={faQuestionCircle} /> }
            { post.type === 'discussion' && <FontAwesomeIcon icon={faComments} /> }
          </div>
          <div className="d-flex m-1 flex-column">
            <Link
              className="post-title d-flex post-tile"
              to={
                Routes.POSTS.PATH.replace(':discussionId', post.topic_id)
                  .replace(':courseId', post.course_id)
                  .replace(':threadId', post.id)
              }
            >
              { post.title }
            </Link>
            <div className="d-flex">
              <div className="post-author">
                { post.author }
              </div>
              <div className="post-datetime">
                {
                  post.updated_at
                    ? intl.formatMessage(messages.last_response, { time: post.updated_at })
                    : intl.formatMessage(messages.posted_on, { time: post.created_at })
                }
              </div>
            </div>
          </div>
          <div className="status-icons">
            { post.abuse_flagged && <FontAwesomeIcon icon={faFlag} /> }
            { post.pinned && <FontAwesomeIcon icon={faThumbtack} /> }
          </div>
        </div>
        <div className="d-flex">
          { post.raw_body }
        </div>
        <div className="d-flex">
          { post.following
            ? <FontAwesomeIcon icon={faSolidStar} />
            : <FontAwesomeIcon icon={faEmptyStar} /> }
          <span className="badge">
            <FontAwesomeIcon icon={faComments} /> { post.comment_count }
          </span>
        </div>
      </div>
    </div>
  );
}

export const postShape = PropTypes.shape({
  abuse_flagged: PropTypes.bool,
  author: PropTypes.string,
  comment_count: PropTypes.number,
  course_id: PropTypes.string,
  following: PropTypes.bool,
  id: PropTypes.string,
  pinned: PropTypes.bool,
  raw_body: PropTypes.string,
  read: PropTypes.bool,
  title: PropTypes.string,
  topic_id: PropTypes.string,
  type: PropTypes.string,
  updated_at: PropTypes.string,
});

Post.propTypes = {
  intl: intlShape.isRequired,
  post: postShape.isRequired,
};

export default injectIntl(Post);
