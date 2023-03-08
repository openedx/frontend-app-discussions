import { Factory } from 'rosie';

const discussionTourFactory = new Factory()
  .sequence('id')
  .option('tourNameList', ['id'], (id) => `Discussion Tour ${id}`)
  .attr('tourName', ['id', 'tourNameList'], (id, tourNameList) => tourNameList[id] ?? `Discussion Tour ${id}`)
  .attr('description', ['id'], (id) => `This is the description for Discussion Tour ${id}.`)
  .attr('enabled', ['id'], true);

export default discussionTourFactory;
