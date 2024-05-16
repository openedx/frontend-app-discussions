########################
frontend-app-discussions
########################

|Codecov| |license|

.. |Codecov| image:: https://codecov.io/gh/openedx/frontend-app-discussions/branch/master/graph/badge.svg?token=3z7XvuzTq3
   :target: https://codecov.io/gh/openedx/frontend-app-discussions
.. |license| image:: https://img.shields.io/badge/license-AGPL-informational
   :target: https://github.com/openedx/frontend-app-discussions/blob/master/LICENSE

********
Purpose
********

This repository is a React-based micro frontend for the Open edX discussion forums.

***************
Getting Started
***************

Prerequisites
=============

The `devstack`_ is currently recommended as a development environment for your
new MFE.  If you start it with ``make dev.up.lms`` that should give you
everything you need as a companion to this frontend.

Note that it is also possible to use `Tutor`_ to develop an MFE.  You can refer
to the `relevant tutor-mfe documentation`_ to get started using it.

.. _Devstack: https://github.com/openedx/devstack

.. _Tutor: https://github.com/overhangio/tutor

.. _relevant tutor-mfe documentation: https://github.com/overhangio/tutor-mfe#mfe-development

Cloning and Startup
===================

1. Clone your new repo:

  ``git clone https://github.com/openedx/frontend-app-discussions.git``

2. Install npm dependencies:

  ``cd frontend-app-discussions && npm install``

3. Start the dev server:

  ``npm start``

The dev server is running at `http://localhost:2002 <http://localhost:2002>`_.

Plugins
=======
This MFE can be customized using `Frontend Plugin Framework <https://github.com/openedx/frontend-plugin-framework>`_.

The parts of this MFE that can be customized in that manner are documented `here </src/plugin-slots>`_.

Getting Help
============
Please tag **@openedx/edx-infinity ** on any PRs or issues.  Thanks.

If you're having trouble, we have discussion forums at https://discuss.openedx.org where you can connect with others in the community.
For anything non-trivial, the best path is to open an issue in this repository with as many details about the issue you are facing as you can provide.

https://github.com/openedx/frontend-app-discussions/issues

For more information about these options, see the `Getting Help`_ page.

.. _Getting Help: https://openedx.org/getting-help

How to Contribute
=================

Details about how to become a contributor to the Open edX project may be found in the wiki at `How to contribute`_

.. _How to contribute: https://edx.readthedocs.io/projects/edx-developer-guide/en/latest/process/index.html

PR description template should be automatically applied if you are sending PR from github interface; otherwise you
can find it it at `PULL_REQUEST_TEMPLATE.md <https://github.com/openedx/frontend-app-discussions/blob/master/.github/pull_request_template.md>`_

This project is currently accepting all types of contributions, bug fixes and security fixes

The Open edX Code of Conduct
============================
All community members should familiarize themselves with the `Open edX Code of Conduct`_.

.. _Open edX Code of Conduct: https://openedx.org/code-of-conduct/

People
======
The assigned maintainers for this component and other project details may be found in Backstage or from inspecting catalog-info.yaml.

Reporting Security Issues
-------------------------
Please do not report security issues in public. Please email security@openedx.org.

Project Structure
=================

The source for this project is organized into nested submodules according to the ADR `Feature-based Application Organization <https://github.com/openedx/frontend-app-discussions/blob/master/docs/decisions/0002-feature-based-application-organization.rst>`_.

Build Process Notes
===================

**Production Build**

The production build is created with ``npm run build``.

License
=======

The code in this repository is licensed under the AGPLv3 unless otherwise
noted.

Please see `LICENSE <LICENSE>`_ for details.

Internationalization
====================

Please see `edx/frontend-platform's i18n module <https://edx.github.io/frontend-platform/module-Internationalization.html>`_ for documentation on internationalization.  The documentation explains how to use it, and the `How To <https://github.com/openedx/frontend-i18n/blob/master/docs/how_tos/i18n.rst>`_ has more detail.

Reporting Security Issues
=========================

Please do not report security issues in public. Please email security@openedx.org.