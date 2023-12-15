import PropTypes from 'prop-types';
import { getConfig } from '@edx/frontend-platform';
import './headerLearning.scss'
import AuthenticatedUserDropdown from './AuthenticatedUserDropdown';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { useParams } from "react-router-dom";
import notification_icon from "./assets/notification.svg";

const HeaderLearning = ({
  courseOrg,
  courseNumber,
  courseTitle,
  intl,
  loading,
  isDashoard,
  }) => {

    const authenticatedUser = getAuthenticatedUser();
    const { courseId: courseIdFromUrl } = useParams();
    return (
    <header className="learning-header">
        <div
        className={`header2-container d-flex align-items-center`}
      >
        <div className="logo-container">
          {" "}
          <a
            href={`${getConfig().LMS_BASE_URL}/dashboard`}
            className="logo logo_img"
          >
            <img
              className="d-block"
              src={getConfig().LOGO_URL}
              alt={getConfig().LOGO_URL}
            />
          </a>
        </div>

        <div
          className={`d-flex align-items-center course-title-lockup`}
        >
          <span className={`d-block header-2`}>
            {`${courseTitle}`}
          </span>
        </div>
        <div className="actions d-flex align-items-center">
          <button className="action-button">
            <img src={notification_icon} alt={notification_icon} />
          </button>

          {authenticatedUser && (
            <AuthenticatedUserDropdown
              username={authenticatedUser.username}
              isLoading={loading}
              courseId={courseIdFromUrl}
            />
          )}
        </div>
      </div>
    </header>
    )
}

HeaderLearning.propTypes = {
    courseOrg: PropTypes.string,
    courseNumber: PropTypes.string,
    courseTitle: PropTypes.string,

    
  };
  
HeaderLearning.defaultProps = {
    courseOrg: null,
    courseNumber: null,
    courseTitle: null,

  };
  
export default HeaderLearning;
