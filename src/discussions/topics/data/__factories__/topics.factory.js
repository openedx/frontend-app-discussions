import { Factory } from 'rosie';

Factory.define('topic')
  .sequence('id', (idx) => `topic-${idx}`)
  .sequence('name', (idx) => `topic ${idx}`)
  .attr('children', []);
