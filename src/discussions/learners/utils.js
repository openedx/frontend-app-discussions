import { useMemo } from 'react';

import {
  Block, Delete,
} from '@openedx/paragon/icons';
import { useSelector } from 'react-redux';

import { useIntl } from '@edx/frontend-platform/i18n';

import { ContentActions, PostsStatusFilter } from '../../data/constants';
import {
  selectEnableDiscussionBan,
  selectUserCanBanAtCourseLevel,
  selectUserCanBanAtOrgLevel,
  selectUserHasModerationPrivileges,
  selectUserIsStaff,
  selectUserRoles,
} from '../data/selectors';
import { getAuthorRoles } from '../utils';
import { checkBanActionDisabled } from '../utils/banUtils';
import { BAN_SCOPES } from './data/constants';
import messages from './messages';

export const LEARNER_ACTIONS_LIST = [
  {
    id: 'ban',
    icon: Block,
    label: messages.banUser,
    hasSubmenu: true,
    submenu: [
      {
        id: 'ban-course',
        action: ContentActions.BAN_COURSE,
        label: messages.banUserCourse,
        disabledConditions: { isAuthorBanned: true, $scope: BAN_SCOPES.COURSE },
      },
      {
        id: 'ban-org',
        action: ContentActions.BAN_ORG,
        label: messages.banUserOrg,
        disabledConditions: { isAuthorBanned: true, $scope: BAN_SCOPES.ORGANIZATION },
      },
      {
        id: 'unban-course',
        action: ContentActions.UNBAN_COURSE,
        label: messages.unbanUserCourse,
        disabledConditions: { isAuthorBanned: false, $scope: BAN_SCOPES.COURSE },
      },
      {
        id: 'unban-org',
        action: ContentActions.UNBAN_ORG,
        label: messages.unbanUserOrg,
        disabledConditions: { isAuthorBanned: false, $scope: BAN_SCOPES.ORGANIZATION },
      },
    ],
  },
  {
    id: 'delete-activity',
    icon: Delete,
    label: messages.deleteActivity,
    hasSubmenu: true,
    submenu: [
      {
        id: 'delete-course-posts',
        action: ContentActions.DELETE_COURSE_POSTS,
        label: messages.deleteUserCourse,
      },
      {
        id: 'delete-org-posts',
        action: ContentActions.DELETE_ORG_POSTS,
        label: messages.deleteUserOrg,
      },
    ],
  },
  {
    id: 'restore-activity',
    icon: Delete,
    label: messages.restoreActivity,
    hasSubmenu: true,
    submenu: [
      {
        id: 'restore-course-posts',
        action: ContentActions.RESTORE_COURSE_POSTS,
        label: messages.restoreCoursePosts,
      },
      {
        id: 'restore-org-posts',
        action: ContentActions.RESTORE_ORG_POSTS,
        label: messages.restoreOrgPosts,
      },
    ],
  },
];

/**
 * Checks if an action should be disabled based on disabled conditions.
 * Uses the banUtils module for ban-related logic.
 * @param {Object} learnerBanInfo - Ban information for the learner
 * @param {Object} disabledConditions - Conditions that determine if action should be disabled
 * @returns {boolean} - True if the action should be disabled
 */
const checkDisabled = (learnerBanInfo, disabledConditions) => {
  if (!disabledConditions) {
    return false;
  }

  // Handle ban status with scope awareness using dedicated utility
  if ('isAuthorBanned' in disabledConditions) {
    return checkBanActionDisabled(learnerBanInfo, disabledConditions);
  }

  return false;
};

export function useLearnerActions(
  userHasBulkDeletePrivileges = false,
  learnerBanInfo = {},
  contentStatus = PostsStatusFilter.ACTIVE,
  targetAuthorLabel = null,
) {
  const intl = useIntl();
  const enableDiscussionBan = useSelector(selectEnableDiscussionBan);
  const userHasModerationPrivileges = useSelector(selectUserHasModerationPrivileges);
  const userCanBanAtCourseLevel = useSelector(selectUserCanBanAtCourseLevel);
  const userCanBanAtOrgLevel = useSelector(selectUserCanBanAtOrgLevel);
  const userRoles = useSelector(selectUserRoles);
  const userIsGlobalStaff = useSelector(selectUserIsStaff);

  const actions = useMemo(() => {
    if (!userHasBulkDeletePrivileges || !userHasModerationPrivileges) {
      return [];
    }

    // Check if user has discussion roles (Administrator or Moderator)
    const roles = userRoles || [];
    const userIsAdmin = roles.includes('Administrator');
    const userIsModerator = roles.includes('Moderator');
    const userHasDiscussionRole = userIsAdmin || userIsModerator;

    // Check target user's role badges (handle both new and legacy label formats)
    const targetRoles = getAuthorRoles(targetAuthorLabel);

    const targetIsGlobalStaff = targetRoles.includes('Global Staff')
      || targetRoles.includes('Staff');

    const targetIsDiscussionAdmin = targetRoles.includes('Administrator');

    const targetIsDiscussionModerator = targetRoles.includes('Moderator');

    const targetHasPrivilegedRole = targetIsGlobalStaff
      || targetIsDiscussionAdmin
      || targetIsDiscussionModerator;

    let shouldShowBanOption = true;

    // Global Staff (no discussion role) cannot ban users with privileged roles
    if (userIsGlobalStaff && !userHasDiscussionRole && targetHasPrivilegedRole) {
      shouldShowBanOption = false;
    }

    // Discussion Moderator cannot ban Discussion Admin or another Discussion Moderator
    if (userIsModerator && !userIsAdmin && (targetIsDiscussionAdmin || targetIsDiscussionModerator)) {
      shouldShowBanOption = false;
    }

    // Discussion Admin cannot ban another Discussion Admin
    if (userIsAdmin && targetIsDiscussionAdmin) {
      shouldShowBanOption = false;
    }

    return LEARNER_ACTIONS_LIST.filter(action => {
      if (action.id === 'ban' && (!enableDiscussionBan || !userCanBanAtCourseLevel || !shouldShowBanOption)) {
        return false;
      }

      if (contentStatus === PostsStatusFilter.DELETED && action.id === 'delete-activity') {
        return false;
      }

      if (contentStatus !== PostsStatusFilter.DELETED && action.id === 'restore-activity') {
        return false;
      }

      return true;
    }).map(action => {
      // Special handling for ban action based on user permissions
      if (action.id === 'ban') {
        // Users without org-level permissions: show direct course-level action only
        if (!userCanBanAtOrgLevel) {
          const isBanned = learnerBanInfo.isAuthorBanned;
          const banScope = learnerBanInfo.authorBanScope;

          // Determine which action to show based on ban state
          // Only show course-level ban/unban for users without org permissions
          if (isBanned && banScope === BAN_SCOPES.COURSE) {
            // User is banned at course level, show simple unban option
            return {
              id: 'unban-course',
              icon: Block,
              action: ContentActions.UNBAN_COURSE,
              label: {
                id: messages.unbanUserSimple.id,
                defaultMessage: intl.formatMessage(messages.unbanUserSimple),
              },
              disabled: false,
            };
          } if (isBanned && banScope === BAN_SCOPES.ORGANIZATION) {
            // User is banned at org level, users without org permissions can't unban
            // Don't show any ban action
            return null;
          }
          // User is not banned, show simple ban option
          return {
            id: 'ban-course',
            icon: Block,
            action: ContentActions.BAN_COURSE,
            label: {
              id: messages.banUserSimple.id,
              defaultMessage: intl.formatMessage(messages.banUserSimple),
            },
            disabled: false,
          };
        }

        // Users with org-level permissions: keep the existing submenu with both course and org options
      }

      // For actions with submenus (including ban action for users with org permissions)
      if (action.submenu) {
        const processedSubmenu = action.submenu
          .filter(subAction => {
            // Filter ban-related actions if feature flag is disabled
            if (!enableDiscussionBan && (
              subAction.action === ContentActions.BAN_COURSE
              || subAction.action === ContentActions.BAN_ORG
              || subAction.action === ContentActions.UNBAN_COURSE
              || subAction.action === ContentActions.UNBAN_ORG
            )) {
              return false;
            }

            // For users without org-level permissions, filter out org-level actions
            if (!userCanBanAtOrgLevel && (
              subAction.action === ContentActions.BAN_ORG
              || subAction.action === ContentActions.UNBAN_ORG
              || subAction.action === ContentActions.DELETE_ORG_POSTS
              || subAction.action === ContentActions.RESTORE_ORG_POSTS
            )) {
              return false;
            }

            return true;
          })
          .map(subAction => {
            const disabled = checkDisabled(learnerBanInfo, subAction.disabledConditions);
            return {
              ...subAction,
              label: {
                id: subAction.label.id,
                defaultMessage: intl.formatMessage(subAction.label),
              },
              disabled,
            };
          });

        // If no submenu items remain, filter out this action
        if (processedSubmenu.length === 0) {
          return null;
        }

        return {
          ...action,
          label: {
            id: action.label.id,
            defaultMessage: intl.formatMessage(action.label),
          },
          submenu: processedSubmenu,
        };
      }

      return {
        ...action,
        label: {
          id: action.label.id,
          defaultMessage: intl.formatMessage(action.label),
        },
      };
    }).filter(Boolean); // Remove null entries (actions with empty submenus)
  }, [
    userHasBulkDeletePrivileges,
    userHasModerationPrivileges,
    userCanBanAtCourseLevel,
    userCanBanAtOrgLevel,
    learnerBanInfo,
    contentStatus,
    enableDiscussionBan,
    intl,
    userRoles,
    userIsGlobalStaff,
    targetAuthorLabel,
  ]);

  return actions;
}
