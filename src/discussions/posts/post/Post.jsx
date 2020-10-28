import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { faQuestionCircle, faStar as faEmptyStar } from '@fortawesome/free-regular-svg-icons';
import {
  faCircle, faComments, faFlag, faStar as faSolidStar, faThumbtack,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';
import { Image } from '@edx/paragon';
import * as timeago from 'timeago.js';
import { Routes } from '../../../data/constants';
import { DiscussionAppLink } from '../../navigation';
import messages from './messages';

function Post({ post, intl }) {
  return (
    <DiscussionAppLink
      className="discussion-post d-flex list-group-item px-2 py-3 text-decoration-none text-gray-900"
      data-post-id={post.id}
      to={Routes.COMMENTS.PATH}
      urlParams={{ postId: post.id }}
    >
      <div className="post-unread-status ml-1">
        <FontAwesomeIcon icon={faCircle} className="text-success-300" size="xs" />
      </div>
      <div className="d-flex flex-column">
        <div className="d-flex post-header">
          <div className="d-flex user-avatar mr-1 px-0">
            <Image
              className="my-auto p-0"
              src="https://source.unsplash.com/50x50/?nature,flower"
              roundedCircle
            />
          </div>
          <div className="d-flex m-1 flex-column">
            <div className="d-flex flex-row">
              <div className="d-flex post-type-icon m-1">
                { post.type === 'question' && <FontAwesomeIcon icon={faQuestionCircle} /> }
                { post.type === 'discussion' && <FontAwesomeIcon icon={faComments} /> }
              </div>
              <div className="post-title d-flex mx-1 font-weight-bold text-gray-700">
                { post.title }
              </div>
            </div>
            <div className="d-flex small text-gray-300">
              <div className="post-author mx-1">
                { post.author }
              </div>
              |
              <div className="post-datetime mx-1">
                {
                  post.updated_at
                    ? intl.formatMessage(messages.last_response, { time: timeago.format(post.updated_at) })
                    : intl.formatMessage(messages.posted_on, { time: timeago.format(post.created_at) })
                }
              </div>
            </div>
          </div>
        </div>
        <div className="d-flex my-2">
          { post.raw_body }
        </div>
        <div className="d-flex h4 text-gray-300">
          { post.pinned && (
            <div className="badge mx-1">
              <FontAwesomeIcon icon={faThumbtack} />
            </div>
          )}
          <div className="badge mx-1">
            { post.following
              ? <FontAwesomeIcon icon={faSolidStar} />
              : <FontAwesomeIcon icon={faEmptyStar} /> }
          </div>
          { post.abuse_flagged && (
            <div className="badge mx-1">
              <FontAwesomeIcon icon={faFlag} />
            </div>
          )}
          <div className="badge mx-1">
            <FontAwesomeIcon icon={faComments} /> { post.comment_count }
          </div>
        </div>
      </div>
    </DiscussionAppLink>
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
