|Build Status| |Codecov| |license|

frontend-app-discussions
========================

Please tag **@edx/fedx-team** on any PRs or issues.  Thanks.

Introduction
------------

This repository is a React-based micro frontend for the Open edX discussion forums.

**Installation and Startup**

1. Clone your new repo:

  ``git clone https://github.com/openedx/frontend-app-discussions.git``

2. Install npm dependencies:

  ``cd frontend-app-discussions && npm install``

3. Start the dev server:

  ``npm start``

The dev server is running at `http://localhost:2002 <http://localhost:2002>`_.

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
