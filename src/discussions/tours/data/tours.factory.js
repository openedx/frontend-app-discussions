import { Factory } from 'rosie';

const discussionTourFactory = new Factory()
  .sequence('id')
  .attr('tourName', ['id'], (id) => `Discussion Tour ${id}`)
  .attr('description', ['id'], (id) => `This is the description for Discussion Tour ${id}.`)
  .attr('enabled', ['id'], true);

export default discussionTourFactory;
