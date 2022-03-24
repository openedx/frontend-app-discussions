import { Factory } from 'rosie';

Factory.define('thread')
  .sequence('id', (idx) => `thread-${idx}`)
  .sequence('title', ['topic_id'], (idx, topicId) => `This is Thread-${idx} in topic ${topicId}`)
  .sequence('raw_body', (idx) => `Some contents for **thread number ${idx}**.`)
  .sequence('rendered_body', (idx) => `Some contents for <b>thread number ${idx}</b>.`)
  .sequence('type', (idx) => (idx % 2 === 1 ? 'discussion' : 'question'))
  .sequence('pinned', idx => (idx < 3))
  .sequence('topic_id', idx => `some-topic-${(idx % 3)}`)
  .sequence('closed', idx => Boolean(idx % 3 === 2)) // Mark every 3rd post closed
  .attr('comment_list_url', ['id'], (threadId) => `http://test.site/api/discussion/v1/comments/?thread_id=${threadId}`)
  .attrs({
    created_at: () => (new Date()).toISOString(),
    updated_at: () => (new Date()).toISOString(),
    editable_fields: [
      'abuse_flagged',
      'following',
      'group_id',
      'raw_body',
      'closed',
      'read',
      'title',
      'topic_id',
      'type',
      'voted',
      'pinned',
    ],
    author: 'test_user',
    author_label: 'Staff',
    abuse_flagged: false,
    can_delete: true,
    voted: false,
    vote_count: 1,
    course_id: 'course-v1:Test+TestX+Test_Course',
    group_id: null,
    group_name: null,
    abuse_flagged_count: 0,
    following: false,
    comment_count: 8,
    unread_comment_count: 0,
    endorsed_comment_list_url: null,
    non_endorsed_comment_list_url: null,
    read: false,
    has_endorsed: false,
  });

Factory.define('threadsResult')
  .option('count', null, 3)
  .option('page', null, 1)
  .option('pageSize', null, 5)
  .option('courseId', null, 'course-v1:Test+TestX+Test_Course')
  .option('topicId', null, 'test-topic')
  .option('threadAttrs', null, {})
  .option('threadOptions', null, {})
  .attr('pagination', ['courseId', 'count', 'page', 'pageSize'], (courseId, count, page, pageSize) => {
    const numPages = Math.ceil(count / pageSize);
    const next = (page < numPages) ? `http://test.site/api/discussion/v1/threads/?course_id=${courseId}&page=${page + 1}` : null;
    const prev = (page > 1) ? `http://test.site/api/discussion/v1/threads/?course_id=${courseId}&page=${page - 1}` : null;
    return {
      next,
      prev,
      count,
      num_pages: numPages,
    };
  })
  .attr('results', ['count', 'pageSize', 'page', 'courseId', 'topicId', 'threadAttrs', 'threadOptions'], (count, pageSize, page, courseId, topicId, threadAttrs, threadOptions) => {
    const attrs = { course_id: courseId, topic_id: topicId, ...threadAttrs };
    Object.keys(attrs).forEach(key => (attrs[key] === undefined ? delete attrs[key] : {}));
    const len = (pageSize * page <= count) ? pageSize : count % pageSize;
    return Factory.buildList('thread', len, attrs, threadOptions);
  });
