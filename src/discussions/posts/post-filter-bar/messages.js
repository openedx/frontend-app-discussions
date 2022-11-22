import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  allPosts: {
    id: 'discussions.posts.filter.showALl',
    defaultMessage: 'Show all',
    description: 'Option in dropdown to filter to all posts',
  },
  filterDiscussions: {
    id: 'discussions.posts.filter.discussions',
    defaultMessage: 'Discussions',
    description: 'Option in dropdown to filter to all discussions',
  },
  filterQuestions: {
    id: 'discussions.posts.filter.questions',
    defaultMessage: 'Questions',
    description: 'Option in dropdown to filter to all questions',
  },
  filterBy: {
    id: 'discussions.posts.filter.message',
    defaultMessage: 'Status: {filterBy}',
    description: 'Display text used to indicate what post status is being filtered',
  },
  filterAnyStatus: {
    id: 'discussions.posts.status.filter.anyStatus',
    defaultMessage: 'Any status',
    description: 'Option in dropdown to filter to all post statuses',
  },
  filterUnread: {
    id: 'discussions.posts.status.filter.unread',
    defaultMessage: 'Unread',
    description: 'Option in dropdown to filter to unread posts',
  },
  filterFollowing: {
    id: 'discussions.posts.status.filter.following',
    defaultMessage: 'Following',
    description: 'Option in dropdown to filter to followed posts',
  },
  filterReported: {
    id: 'discussions.posts.status.filter.reported',
    defaultMessage: 'Reported',
    description: 'Option in dropdown to filter to reported posts',
  },
  filterUnanswered: {
    id: 'discussions.posts.status.filter.unanswered',
    defaultMessage: 'Unanswered',
    description: 'Option in dropdown to filter to unanswered posts',
  },
  filterUnresponded: {
    id: 'discussions.posts.status.filter.unresponded',
    defaultMessage: 'Not responded',
    description: 'Option in dropdown to filter to unresponded posts',
  },
  myPosts: {
    id: 'discussions.posts.filter.myPosts',
    defaultMessage: 'My posts',
    description: 'Option in dropdown to filter to all a user\'s posts',
  },
  myDiscussions: {
    id: 'discussions.posts.filter.myDiscussions',
    defaultMessage: 'My discussions',
    description: 'Option in dropdown to filter to all a user\'s discussions',
  },
  myQuestions: {
    id: 'discussions.posts.filter.myQuestions',
    defaultMessage: 'My questions',
    description: 'Option in dropdown to filter to all a user\'s questions',
  },
  sortedBy: {
    id: 'discussions.posts.sort.message',
    defaultMessage: 'Sorted by {sortBy}',
    description: 'Display text used to indicate how posts are sorted',
  },
  lastActivityAt: {
    id: 'discussions.posts.sort.lastActivity',
    defaultMessage: 'Recent activity',
    description: 'Option in dropdown to sort posts by recent activity',
  },
  commentCount: {
    id: 'discussions.posts.sort.commentCount',
    defaultMessage: 'Most activity',
    description: 'Option in dropdown to sort posts by most activity',
  },
  voteCount: {
    id: 'discussions.posts.sort.voteCount',
    defaultMessage: 'Most likes',
    description: 'Option in dropdown to sort posts by most votes',
  },
  sortFilterStatus: {
    id: 'discussions.posts.sort-filter.sortFilterStatus',
    defaultMessage: `{own, select,
      false {All}
      true {Own}
      other {{own}}
    } {status, select,
      statusAll {}
      statusUnread {unread}
      statusFollowing {followed}
      statusReported {reported}
      statusUnanswered {unanswered}
      statusUnresponded {unresponded}
      other {{status}}
    } {type, select,
      discussion {discussions}
      question {questions}
      all {posts}
      other {{type}}
    } {cohortType, select,
        all {}
        group {in {cohort}}
        other {{cohortType}}
    } sorted by {sort, select,
      lastActivityAt {recent activity}
      commentCount {most activity}
      voteCount {most likes}
      other {{sort}}
    }`,
    description: 'Status message showing current sorting and filtering status',
  },
});

export default messages;
