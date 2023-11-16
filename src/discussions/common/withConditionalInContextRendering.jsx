import { useEnableInContextSidebar } from '../data/hooks';

const withConditionalInContextRendering = (WrappedComponent, condition) => (
  function SidebarConditionalRenderer(props) {
    const enableInContextSidebar = useEnableInContextSidebar();

    return enableInContextSidebar === condition && <WrappedComponent {...props} />;
  }
);

export default withConditionalInContextRendering;
