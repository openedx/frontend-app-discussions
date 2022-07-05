import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  title: {
    id: 'discussions.app.title',
    defaultMessage: 'Discussions',
  },
  searchAllPosts: {
    id: 'discussions.posts.actionBar.searchAllPosts',
    defaultMessage: 'Search all posts',
    description: 'Placeholder text in search box',
  },
  search: {
    id: 'discussions.posts.actionBar.search',
    defaultMessage: `{page, select,
      topics {Find a topic}
      posts {Search all posts}
      learners {Search learner}
      myPosts {Search all posts}
    }`,
    description: 'Placeholder text in search box',
  },
  addAPost: {
    id: 'discussion.posts.actionBar.add',
    defaultMessage: 'Add a post',
    description: 'Button to add a new discussion post',
  },
  close: {
    id: 'discussion.posts.actionBar.close',
    defaultMessage: 'Close',
    description: 'Alt description for close icon button for closing in-context sidebar.',
  },
});

export default messages;
