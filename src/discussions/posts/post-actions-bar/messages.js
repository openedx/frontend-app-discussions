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
      topics {Search topics}
      posts {Search all posts}
      learners {Search learners}
      myPosts {Search all posts}
      other {{page}}
    }`,
    description: 'Placeholder text in search box',
  },
  searchInfo: {
    id: 'discussions.actionBar.searchInfo',
    defaultMessage: 'Showing {count} results for "{text}"',
    description: 'Message displayed when user performs a search',
  },
  searchRewriteInfo: {
    id: 'discussions.actionBar.searchRewriteInfo',
    defaultMessage: 'No results found for "{searchString}". Showing {count} results for "{textSearchRewrite}".',
    description: 'Message displayed when user performs a search and search query is rewritten because matching results are not found',
  },
  searchInfoSearching: {
    id: 'discussions.actionBar.searchInfoSearching',
    defaultMessage: 'Searching...',
    description: 'Message displayed when user performs a search',
  },
  clearSearch: {
    id: 'discussions.actionBar.clearSearch',
    defaultMessage: 'Clear results',
    description: 'Button to clear search',
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
  confirmEmailTitle: {
    id: 'discussion.posts.confirm.email.title',
    defaultMessage: 'Confirm your email',
    description: 'Confirm email title for unverified users.',
  },
  confirmEmailDescription: {
    id: 'discussion.posts.confirm.email.description',
    defaultMessage: 'You need to confirm your email to make a contribution in discussion forums. Click on the button to receive an email with confirmation link. Please reload the page once you have done so.',
    description: 'Confirm email description for unverified users.',
  },
  confirmEmailButton: {
    id: 'discussion.posts.confirm.email.button',
    defaultMessage: 'Send confirmation link',
    description: 'Confirmation link email button.',
  },
});

export default messages;
