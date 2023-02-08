frontend-app-discussions
========================

|Build Status| |Codecov| |license|

Purpose
-------

This repository is a React-based micro frontend for the Open edX discussion forums.

Getting Started
---------------

1. Clone your new repo:

  ``git clone https://github.com/openedx/frontend-app-discussions.git``

2. Install npm dependencies:

  ``cd frontend-app-discussions && npm install``

3. Start the dev server:

  ``npm start``

The dev server is running at `http://localhost:2002 <http://localhost:2002>`_.

Getting Help
------------
Please tag **@openedx/edx-infinity ** on any PRs or issues.  Thanks.

If you're having trouble, we have discussion forums at https://discuss.openedx.org where you can connect with others in the community.
For anything non-trivial, the best path is to open an issue in this repository with as many details about the issue you are facing as you can provide.

https://github.com/openedx/frontend-app-discussions/issues

For more information about these options, see the `Getting Help`_ page.

.. _Getting Help: https://openedx.org/getting-help

How to Contribute
-----------------
Details about how to become a contributor to the Open edX project may be found in the wiki at `How to contribute`_

.. _How to contribute: https://edx.readthedocs.io/projects/edx-developer-guide/en/latest/process/index.html

PR description template should be automatically applied if you are sending PR from github interface; otherwise you
can find it it at `PULL_REQUEST_TEMPLATE.md <https://github.com/openedx/frontend-app-discussions/blob/master/.github/pull_request_template.md>`_

This project is currently accepting all types of contributions, bug fixes and security fixes

The Open edX Code of Conduct
----------------------------
All community members should familiarize themselves with the `Open edX Code of Conduct`_.

.. _Open edX Code of Conduct: https://openedx.org/code-of-conduct/

People
------
The assigned maintainers for this component and other project details may be found in Backstage or from inspecting catalog-info.yaml.

Reporting Security Issues
-------------------------
Please do not report security issues in public. Please email security@edx.org.

Project Structure
-----------------

The source for this project is organized into nested submodules according to the ADR `Feature-based Application Organization <https://github.com/openedx/frontend-app-discussions/blob/master/docs/decisions/0002-feature-based-application-organization.rst>`_.

Build Process Notes
-------------------

**Production Build**

The production build is created with ``npm run build``.

Internationalization
--------------------

Please see `edx/frontend-platform's i18n module <https://edx.github.io/frontend-platform/module-Internationalization.html>`_ for documentation on internationalization.  The documentation explains how to use it, and the `How To <https://github.com/openedx/frontend-i18n/blob/master/docs/how_tos/i18n.rst>`_ has more detail.

.. |Build Status| image:: https://api.travis-ci.org/edx/frontend-app-discussions.svg?branch=master
   :target: https://travis-ci.org/edx/frontend-app-discussions
.. |Codecov| image:: https://codecov.io/gh/edx/frontend-app-discussions/branch/master/graph/badge.svg
   :target: https://codecov.io/gh/edx/frontend-app-discussions
.. |license| image:: https://img.shields.io/npm/l/@edx/frontend-app-discussions.svg
   :target: @edx/frontend-app-discussions