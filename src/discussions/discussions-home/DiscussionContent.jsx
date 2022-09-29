import React, { useContext } from 'react';

import { useSelector } from 'react-redux';
import { Route, Switch } from 'react-router';
import { useHistory, useLocation } from 'react-router-dom';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Icon, IconButton } from '@edx/paragon';
import { ArrowBack } from '@edx/paragon/icons';

import { PostsPages, Routes } from '../../data/constants';
import { CommentsView } from '../comments';
import { DiscussionContext } from '../common/context';
import { useIsOnDesktop } from '../data/hooks';
import messages from '../messages';
import { PostEditor } from '../posts';
import { discussionsPath } from '../utils';

function DiscussionContent({ intl }) {
  const location = useLocation();
  const history = useHistory();
  const postEditorVisible = useSelector((state) => state.threads.postEditorVisible);
  const isOnDesktop = useIsOnDesktop();
  const {
    courseId, learnerUsername, category, topicId, page,
  } = useContext(DiscussionContext);

  return (
    <div className="d-flex bg-light-400 flex-column w-75 w-xs-100 w-xl-75 align-items-center">
      <div className="d-flex flex-column w-100">
        {!isOnDesktop && (
          <IconButton
            src={ArrowBack}
            iconAs={Icon}
            style={{ padding: '18px' }}
            size="inline"
            className="ml-4 mt-4"
            onClick={() => history.push(discussionsPath(PostsPages[page], {
              courseId, learnerUsername, category, topicId,
            })(location))}
            alt={intl.formatMessage(messages.backAlt)}
          />
        )}
        {postEditorVisible ? (
          <Route path={Routes.POSTS.NEW_POST}>
            <PostEditor />
          </Route>
        ) : (
          <Switch>
            <Route path={Routes.POSTS.EDIT_POST}>
              <PostEditor editExisting />
            </Route>
            <Route path={Routes.COMMENTS.PATH}>
              <CommentsView />
            </Route>
          </Switch>
        )}
      </div>
    </div>
  );
}

DiscussionContent.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(DiscussionContent);
