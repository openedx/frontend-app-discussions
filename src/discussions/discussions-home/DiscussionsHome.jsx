import React, { useContext, useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import {
  generatePath, Redirect, Route, Switch, useHistory, useRouteMatch,
} from 'react-router';

import { AppContext } from '@edx/frontend-platform/react';

import { PostActionsBar } from '../../components';
import { ALL_ROUTES, Routes } from '../../data/constants';
import { fetchCourseBlocks } from '../../data/thunks';
import { CommentsView } from '../comments';
import { DiscussionContext } from '../common/context';
import { fetchCourseConfig } from '../data/thunks';
import { BreadcrumbMenu, NavigationBar } from '../navigation';
import { PostEditor, PostsView } from '../posts';
import { clearRedirect } from '../posts/data';
import { TopicsView } from '../topics';
import { fetchCourseTopics } from '../topics/data/thunks';

export default function DiscussionsHome() {
  const dispatch = useDispatch();
  const history = useHistory();
  const { params } = useRouteMatch(Routes.DISCUSSIONS.PATH);
  const { authenticatedUser } = useContext(AppContext);
  const postEditorVisible = useSelector(state => state.threads.postEditorVisible);
  const { params: { page } } = useRouteMatch(`${Routes.COMMENTS.PAGE}?`);
  const {
    params: {
      courseId,
      postId,
      topicId,
    },
  } = useRouteMatch(ALL_ROUTES);
  const redirectToThread = useSelector(state => state.threads.redirectToThread);
  useEffect(() => {
    dispatch(fetchCourseConfig(courseId));
    dispatch(fetchCourseTopics(courseId));
    dispatch(fetchCourseBlocks(courseId, authenticatedUser.username));
  }, [courseId]);
  useEffect(() => {
    // After posting a new thread we'd like to redirect users to it, the topic and post id are temporarily
    // stored in redirectToThread
    if (redirectToThread) {
      dispatch(clearRedirect());
      history.push(generatePath(Routes.COMMENTS.PAGES['my-posts'], {
        courseId: params.courseId,
        postId: redirectToThread.threadId,
      }));
    }
  }, [redirectToThread]);

  return (
    <DiscussionContext.Provider value={{
      page,
      courseId,
      postId,
      topicId,
    }}
    >
      <main className="container-fluid d-flex flex-column p-0">
        <div className="d-flex flex-row justify-content-between shadow navbar">
          <Route path={Routes.DISCUSSIONS.PATH} component={NavigationBar} />
          <PostActionsBar />
        </div>
        <Route
          path={[
            Routes.POSTS.PATH,
            Routes.TOPICS.CATEGORY,
          ]}
          component={BreadcrumbMenu}
        />
        <div className="d-flex flex-row">
          <div className="d-flex flex-column w-25" style={{ minWidth: '30rem' }}>
            <Switch>
              <Route path={Routes.POSTS.MY_POSTS}>
                <PostsView showOwnPosts />
              </Route>
              <Route path={[Routes.POSTS.PATH, Routes.POSTS.ALL_POSTS]} component={PostsView} />
              <Route path={Routes.TOPICS.PATH} component={TopicsView} />
              <Redirect from={Routes.DISCUSSIONS.PATH} to={Routes.TOPICS.ALL} />
            </Switch>
          </div>
          <div className="d-flex flex-column bg-light-300 w-75">
            {
              postEditorVisible ? (
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
              )
            }
          </div>
        </div>
      </main>
    </DiscussionContext.Provider>
  );
}
