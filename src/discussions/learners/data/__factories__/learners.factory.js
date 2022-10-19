import { Factory } from 'rosie';

Factory.define('learner')
  .sequence('id')
  .attr('username', ['id'], (id) => `leaner-${id}`)
  .option('activeFlags', null, null)
  .attr('active_flags', ['activeFlags'], (activeFlags) => activeFlags)
  .attrs({
    threads: 1,
    replies: 0,
    responses: 3,
    inactive_flags: null,
  });

Factory.define('learnersResult')
  .option('count', null, 3)
  .option('page', null, 1)
  .option('pageSize', null, 5)
  .option('courseId', null, 'course-v1:Test+TestX+Test_Course')
  .option('activeFlags', null, 0)
  .attr(
    'pagination',
    ['courseId', 'count', 'page', 'pageSize'],
    (courseId, count, page, pageSize) => {
      const numPages = Math.ceil(count / pageSize);
      const next = page < numPages
        ? `http://test.site/api/discussion/v1/courses/course-v1:edX+DemoX+Demo_Course/activity_stats?page=${page + 1
        }`
        : null;
      const prev = page > 1
        ? `http://test.site/api/discussion/v1/courses/course-v1:edX+DemoX+Demo_Course/activity_stats?page=${page - 1
        }`
        : null;
      return {
        next,
        prev,
        count,
        num_pages: numPages,
      };
    },
  )
  .attr(
    'results',
    ['count', 'pageSize', 'page', 'courseId', 'activeFlags'],
    (count, pageSize, page, courseId, activeFlags) => {
      const attrs = { course_id: courseId };
      Object.keys(attrs).forEach((key) => (attrs[key] === undefined ? delete attrs[key] : {}));
      const len = pageSize * page <= count ? pageSize : count % pageSize;
      let learners = [];

      if (activeFlags && activeFlags <= len) {
        learners = Factory.buildList('learner', len - activeFlags, attrs);
        learners = learners.concat(
          Factory.buildList(
            'learner',
            activeFlags,
            { ...attrs, active_flags: Math.floor(Math.random() * 10) + 1 },
          ),
        );
      } else {
        learners = Factory.buildList('learner', len, attrs);
      }
      return learners;
    },
  );

Factory.define('learnersProfile')
  .option('usernames', null, ['leaner-1', 'leaner-2', 'leaner-3'])
  .attr('profiles', ['usernames'], (usernames) => {
    const profiles = usernames.map((user) => ({
      account_privacy: 'private',
      profile_image: {
        has_image: false,
        image_url_full:
          'http://localhost:18000/static/images/profiles/default_500.png',
        image_url_large:
          'http://localhost:18000/static/images/profiles/default_120.png',
        image_url_medium:
          'http://localhost:18000/static/images/profiles/default_50.png',
        image_url_small:
          'http://localhost:18000/static/images/profiles/default_30.png',
      },
      last_login: new Date(Date.now() - 1000 * 60).toISOString(),
      username: user,
      name: 'Test User',
    }));
    return profiles;
  });

Factory.define('learnerPosts')
  .option('abuseFlaggedCount', null, null)
  .option('courseId', null, 'course-v1:edX+TestX+Test_Course')
  .attr(
    'results',
    ['abuseFlaggedCount', 'courseId'],
    (abuseFlaggedCount, courseId) => {
      const threads = [];
      for (let i = 0; i < 2; i++) {
        threads.push({
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
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
          id: `post_id${i}`,
          author: 'test_user',
          author_label: 'Staff',
          abuse_flagged: false,
          can_delete: true,
          voted: false,
          vote_count: 1,
          title: `Title ${i}`,
          raw_body: `<p>body ${i}</p>`,
          preview_body: `<p>body ${i}</p>`,
          course_id: courseId,
          group_id: null,
          group_name: null,
          abuse_flagged_count: abuseFlaggedCount,
          following: false,
          comment_count: 8,
          unread_comment_count: 0,
          endorsed_comment_list_url: null,
          non_endorsed_comment_list_url: null,
          read: false,
          has_endorsed: false,
          pinned: false,
          topic_id: 'topic',
        });
      }
      return threads;
    },
  )
  .attr('pagination', [], () => ({
    next: null,
    prev: null,
    count: 2,
    num_pages: 1,
  }));
