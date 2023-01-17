import { Factory } from 'rosie';

const discussionTourFactory = new Factory()
  .sequence('id')
  .attr('name', ['id'], (id) => `Discussion Tour ${id}`)
  .attr('description', ['id'], (id) => `This is the description for Discussion Tour ${id}.`);

export default discussionTourFactory;
