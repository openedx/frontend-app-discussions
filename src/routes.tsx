import { DiscussionsHome } from './discussions';
import Main from './Main';

const routes = [
  {
    id: 'org.openedx.frontend.route.discussions.main',
    path: '',
    Component: Main,
    children: [
      {
        path: '*',
        element: (<DiscussionsHome />),
        // NOTE: if required we can add nested routes here while
        // adding the appropriate <Outlet /> in the components, the pattern can be repeated
        // as needed. ex:
        //
        // children: [
        //   {
        //     path: Routes.POSTS.MY_POSTS,
        //     element: (<PostCommentsView />),
        //   },
        // ]
      },
    ]
  },
];

export default routes;
