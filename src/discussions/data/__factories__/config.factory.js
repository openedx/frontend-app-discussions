import { Factory } from 'rosie';

Factory.define('config')
  .attrs({
    allow_anonymous: false,
    allow_anonymous_to_peers: false,
    has_moderation_privileges: false,
  })
  .attr('user_roles', ['has_moderation_privileges'], (hasModerationPrivileges) => (hasModerationPrivileges ? ['Student', 'Moderator'] : ['Student']));
