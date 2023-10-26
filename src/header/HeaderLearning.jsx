import PropTypes from 'prop-types';
import { getConfig } from '@edx/frontend-platform';
import './headerLearning.scss'
import AuthenticatedUserDropdown from './AuthenticatedUserDropdown';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';


const HeaderLearning = ({
    courseOrg, courseNumber, courseTitle
  }) => {

    const authenticatedUser = getAuthenticatedUser();

    return (
    <header className="learning-header">
       <div>
        <div className="container-fluid py-2 d-flex align-items-center">
          <a href={`${getConfig().LMS_BASE_URL}/dashboard`} className="logo">
            <img className="d-block" src={getConfig().LOGO_URL} alt={getConfig().LOGO_URL} />
          </a>
          <div className="d-flex align-items-center flex-grow-1 course-title-lockup" style={{ gap:'0.5rem' }}>
            <span className="d-block m-0  font-weight-bold ">{courseOrg} {courseNumber}</span>
            <span className="d-block m-0  font-weight-bold  ">{courseTitle}</span>
          </div>
        {authenticatedUser &&  <AuthenticatedUserDropdown username={authenticatedUser.username} />}
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
