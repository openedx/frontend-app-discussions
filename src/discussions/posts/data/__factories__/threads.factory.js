import { Factory } from 'rosie';

Factory.define('thread')
  .sequence('id', (idx) => `thread-${idx}`)
  .sequence('title', (idx) => `This is Thread-${idx}`)
  .sequence('raw_body', (idx) => `Some contents for **thread number ${idx}**.`)
  .sequence('rendered_body', (idx) => `Some contents for <b>thread number ${idx}</b>.`)
  .sequence('type', (idx) => (idx % 2 === 1 ? 'discussion' : 'question'))
  .attr('comment_list_url', ['id'], (threadId) => `http://test.site/api/discussion/v1/comments/?thread_id=${threadId}`)
  .attrs({
    created_at: () => (new Date()).toISOString(),
    updated_at: () => (new Date()).toISOString(),
    editable_fields: [
      'abuse_flagged',
      'following',
      'group_id',
      'raw_body',
      'read',
      'title',
      'topic_id',
      'type',
      'voted',
    ],
    author: 'test_user',
    author_label: 'Staff',
    abuse_flagged: false,
    can_delete: true,
    voted: false,
    vote_count: 1,
    course_id: 'course-v1:Test+TestX+Test_Course',
    topic_id: 'some-topic',
    group_id: null,
    group_name: null,
    abuse_flagged_count: 0,
    pinned: false,
    closed: false,
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
  .attr('results', ['count', 'pageSize', 'page', 'courseId', 'topicId'], (count, pageSize, page, courseId, topicId) => {
    const len = (pageSize * page <= count) ? pageSize : count % pageSize;
    return Factory.buildList('thread', len, { course_id: courseId, topic_id: topicId });
  });
