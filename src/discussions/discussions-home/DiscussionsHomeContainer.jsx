import Footer from '@edx/frontend-component-footer';
import Header from '@edx/frontend-component-header';
import React from 'react';
import {
  Redirect,
  Route,
  Switch,
  useLocation,
  useRouteMatch,
} from 'react-router';
import { Routes } from '../../data/constants';
import { buildDiscussionsUrl } from '../utils';
import DiscussionsHome from './DiscussionsHome';

export default function DiscussionsHomeContainer() {
  const { pathname } = useLocation();
  const match = useRouteMatch(Routes.VIEWS.ALL);
  const extraPath = pathname.replace(match.url, '');
  const redirectPath = buildDiscussionsUrl(
    Routes.VIEWS.DISCUSSION,
    {
      ...match.params,
      view: 'discussion',
    },
  ).concat(extraPath);
  return (
    <Switch>
      <Route path={Routes.EMBED.PATH} component={DiscussionsHome} />
      <Route path={Routes.VIEWS.DISCUSSION}>
        <Header />
        <DiscussionsHome />
        <Footer />
      </Route>
      <Route path={[Routes.VIEWS.TOPIC, Routes.VIEWS.POST]}>
        <Redirect to={redirectPath} />
      </Route>
    </Switch>
  );
}
