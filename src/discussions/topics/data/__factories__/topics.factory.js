import { Factory } from 'rosie';

Factory.define('topic')
  .option('topicPrefix', null, '')
  .sequence('id', ['topicPrefix'], (idx, topicPrefix) => `${topicPrefix}topic-${idx}`)
  .sequence('name', ['topicPrefix'], (idx, topicPrefix) => `${topicPrefix}topic ${idx}`)
  .attr('thread_counts', [], {
    discussion: 0,
    question: 0,
  })
  .attr('children', []);

Factory.define('category')
  .attr('id', [], null)
  .sequence('name', (idx) => `category-${idx}`)
  .attr('thread_counts', [], {
    discussion: 0,
    question: 0,
  })
  .attr('children', ['name'], (name) => {
    Factory.reset('topic');
    return Factory.buildList('topic', 4, null, { topicPrefix: `${name}-` });
  });
