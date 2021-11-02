import { Factory } from 'rosie';

Factory.define('cohort')
  .sequence('id', (idx) => `cohort-${idx}`)
  .sequence('name', (idx) => `cohort ${idx}`)
  .sequence('group_id', (idx) => `group-${idx}`)
  .attr('user_count', 0)
  .attr('assignment_type', 'manual');
