import { Factory } from 'rosie';

Factory.define('settings')
  .attr('division_scheme', null, 'none')
  .attr('always_divide_inline_discussions', null, false)
  .attr('divided_inline_discussions', null, [])
  .attr('divided_course_wide_discussions', null, []);
