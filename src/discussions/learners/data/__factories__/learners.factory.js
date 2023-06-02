import { Factory } from 'rosie';

import '../../../posts/data/__factories__';

Factory.define('learner')
  .sequence('id')
  .attr('username', ['id'], (id) => `learner-${id}`)
  .option('activeFlags', null, null)
  .attr('active_flags', ['activeFlags'], (activeFlags) => activeFlags)
  .option('inactiveFlags', null, null)
  .attr('inactive_flags', ['inactiveFlags'], (inactiveFlags) => inactiveFlags)
  .attrs({
    threads: 1,
    replies: 0,
    responses: 3,
    inactive_flags: null,
  });

Factory.define('learnersResult')
  .option('count', null)
  .option('page', null)
  .option('pageSize', null)
  .option('courseId', null, 'course-v1:Test+TestX+Test_Course')
  .option('activeFlags', null, 0)
  .option('inactiveFlags', null, 0)
  .attr(
    'pagination',
    ['courseId', 'count', 'page', 'pageSize'],
    (courseId, count, page, pageSize) => {
      const numPages = Math.ceil(pageSize / count);
      const next = page < numPages ? page + 1 : null;
      const prev = page > 1 ? page - 1 : null;
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
    ['count', 'pageSize', 'page', 'courseId', 'activeFlags', 'inactiveFlags'],
    (count, pageSize, page, courseId, activeFlags, inactiveFlags) => {
      const attrs = { course_id: courseId };
      Object.keys(attrs).forEach((key) => (attrs[key] === undefined ? delete attrs[key] : {}));
      const len = pageSize * page <= count ? pageSize : count % pageSize;
      let learners = [];

      if (activeFlags <= len) {
        learners = Factory.buildList('learner', len - activeFlags, attrs);
        learners = learners.concat(
          Factory.buildList(
            'learner',
            activeFlags,
            { ...attrs, active_flags: activeFlags + 1, inactive_flags: inactiveFlags },
          ),
        );
      } else {
        learners = Factory.buildList('learner', len, attrs, activeFlags, inactiveFlags);
      }
      return learners;
    },
  );

Factory.define('learnersProfile')
  .option('usernames', null, ['learner-1', 'learner-2', 'learner-3'])
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
      const attrs = { course_id: courseId, abuse_flagged_count: abuseFlaggedCount };
      return Factory.buildList('thread', 2, attrs);
    },
  )
  .attr('pagination', [], () => ({
    next: 1,
    prev: null,
    count: 2,
    num_pages: 2,
  }));
