import { PluginSlot } from '@openedx/frontend-plugin-framework';

import { LearningHeader as Header } from '@edx/frontend-component-header';

interface HeaderSlotProps {
  courseOrg?: string | null;
  courseNumber?: string | null;
  courseTitle?: string | null;
  showUserDropdown?: boolean;
}

const HeaderSlot = ({
  courseOrg = null,
  courseNumber = null,
  courseTitle = null,
  showUserDropdown = true,
}: HeaderSlotProps) => (
  <PluginSlot
    id="org.openedx.frontend.layout.header_discussions.v1"
    slotOptions={{
      mergeProps: true,
    }}
    pluginProps={{
      courseOrg,
      courseNumber,
      courseTitle,
      showUserDropdown,
    }}
  >
    <Header
      courseOrg={courseOrg}
      courseNumber={courseNumber}
      courseTitle={courseTitle}
      showUserDropdown={showUserDropdown}
    />
  </PluginSlot>
);

export default HeaderSlot;
