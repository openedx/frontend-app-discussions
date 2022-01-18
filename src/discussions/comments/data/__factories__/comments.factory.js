import { Factory } from 'rosie';

Factory.define('comment')
  .sequence('id', (idx) => `comment-${idx}`)
  .sequence('raw_body', ['endorsed'], (idx, endorsed) => `Some contents for **${endorsed ? 'endorsed ' : 'unendorsed '}comment number ${idx}**.`)
  .sequence('rendered_body', ['endorsed'], (idx, endorsed) => `Some contents for <b>${endorsed ? 'endorsed ' : 'unendorsed '}comment number ${idx}</b>.`)
  .attr('thread_id', null, 'test-thread')
  .option('endorsedBy', null, null)
  .attr('endorsed', ['endorsedBy'], (endorsedBy) => !!endorsedBy)
  .attr('endorsed_by', ['endorsedBy'], (endorsedBy) => endorsedBy)
  .attr('endorsed_by_label', ['endorsedBy'], (endorsedBy) => (endorsedBy ? 'Staff' : null))
  .attr('endorsed_at', ['endorsedBy'], (endorsedBy) => (endorsedBy ? (new Date()).toISOString() : null))
  .option('childCount', null, 0)
  .attr('child_count', ['childCount'], (childCount) => childCount)
  .attrs({
    author: 'edx',
    author_label: 'Staff',
    can_delete: true,
    created_at: () => (new Date()).toISOString(),
    updated_at: () => (new Date()).toISOString(),
    abuse_flagged: false,
    voted: false,
    vote_count: 0,
    editable_fields: [
      'abuse_flagged',
      'endorsed',
      'raw_body',
      'voted',
    ],
    parent_id: null,
    children: [],
    abuse_flagged_any_user: false,
  });

Factory.define('commentsResult')
  .option('count', null, 3)
  .option('page', null, 1)
  .option('pageSize', null, 5)
  .option('threadId', null, 'test-thread')
  .option('parentId', null, null)
  .option('endorsed', null, null)
  .option('childCount', null, 0)
  .attr('pagination', ['threadId', 'count', 'page', 'pageSize'], (threadId, count, page, pageSize) => {
    const numPages = Math.ceil(count / pageSize);
    const next = (page < numPages) ? `http://test.site/api/discussion/v1/comments/?thread_id=${threadId}&page=${page + 1}` : null;
    const prev = (page > 1) ? `http://test.site/api/discussion/v1/comments/?thread_id=${threadId}&page=${page - 1}` : null;
    return {
      next,
      prev,
      count,
      num_pages: numPages,
    };
  })
  .attr(
    'results',
    ['count', 'pageSize', 'page', 'threadId', 'parentId', 'endorsed', 'childCount'],
    (count, pageSize, page, threadId, parentId, endorsed, childCount) => {
      const len = (pageSize * page <= count) ? pageSize : count % pageSize;
      return Factory.buildList('comment', len, {
        thread_id: threadId,
        parent_id: parentId,
      }, {
        endorsedBy: endorsed ? 'staff' : null,
        childCount,
      });
    },
  );
