import { Factory } from 'rosie';

Factory.define('config')
  .attrs({
    allow_anonymous: false,
    allow_anonymous_to_peers: false,
    user_is_privileged: false,
  })
  .attr('user_roles', ['user_is_privileged'], (userIsPrivileged) => (userIsPrivileged ? ['Student', 'Moderator'] : ['Student']));
