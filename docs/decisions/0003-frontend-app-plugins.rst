3. Frontend App Plugins
-----------------------

Status
------

Proposed

Context
-------

Frontend apps already support a mechanism for replacing components with alternative components
via npm aliases. While this approach may work well for replacing components, it doesn't allow
UI additions or extensions.

For instance, if the core platform support two kinds of discussion post editors, a markdown-based
editor and a WYSIWYG-based editor, there is no way for a plugin to add a third kind of editor.
Likewise for editing discussion settings, the platform can ship the editor for the base forums
and for other forums that are supported out of the box, however for third-party plugins there is
no way to add their own settings editor without a PR to the frontend repo.

This document outlines an approach for making it possible for third party plugins to extend the
UI in the ways described above.

Decision
--------

We can create a new convention for placing any such plugins into appropriately-named directories in
a `plugins` folder next to the `src` folder. Any plugin that needs to be loaded by the frontend can
be git-cloned or otherwise copied into this directory. This directory will be ignore in git.

An alias to this directory can be created in the WebPack config, such that any import from `plugin/*`
will resolve to this directory.

Wherever we might need a UI to load a plugin, we can use a dynamic import like
``import(`plugin/${pluginName}`)`` to get the plugin content. React already support lazy-loading of
components so this will work. We can also fall back to an internal view or component in case this plugin loading fails.

Main parts of this can potentially be implemented in the frontend-build repo, allowing all frontend apps
to take advantage of this.

Limitations
-----------

Currently there are a couple of limitation of Webpack that prevent this from being as smooth as possible.

One of the first approaches considered was based on auto-discovering plugins installed via npm.
This would allow installing plugins via ``npm install --no-save``, The WebPack config file could
then be build dynamically by using `read-package-tree`_ and reading metadata about the pluing from
package.json. This would be similar to the approach used for django plugins.

However, WebPack is unable to resolve this. When WebPack sees a dynamic import like `plugins/${var}`,
It reads the `plugins` folder and creates an dynamically importable module for each possibility in that
folder. It is not able to smartly resolve different plugins to different packages.

This also means that we need to have plugin files arranged in a specific structure to be able to load them.
So in the above example, we if want to support discussions settings plugins and also discussion editor
plugins, we could require plugins to follow a structure like:

/plugins/
  /<plugin_name>/
    /frontend-app-discussions-plugin/
        /editor/index.jsx
        /settings/index.jsx

Here the plugin_name directory is cloned from git or otherwise installed in the plugins folder in the
frontend repo.

This will allow the same repo to contain multiple plugins for the same app and also for multiple
frontend apps. In fact the same repo can be used for the backend code since the rest will be ignored
anyway.

Alternatively, we can write plugins for WebPack itself to support a simple import system for us.

Sample code for loading a plugin
--------------------------------

The following code will create a lazy react component that will try to load a plugin at render time,
and on failure, will try to load the internal component, failing which it will load a fallback
component.


```JavaScript

const getPluginComponent = plugin => (
  React.lazy(async () => {
    try {
     return await import(`plugins/${plugin}`);
    } catch (error) {
      try {
       return await import(`./editors/${plugin}`);
    } catch(error) {
      return await import('./editors/fallback');
    }
    }
  })
)

```

With the above code the plugin can potentially replace the internal component. Which plugin
should be loaded can be decided at run time, after loading data from APIs.

Consequences
------------

This frontend plugin approach will enable support for all kinds of plugins, that replace
existing functionality, improve it or extend it.

It is also entirely possible to support generic extensions that add new routes to an app
thus allowing for entirely new URL extensions, similar to the ones in edx-platform.

.. _read-package-tree: https://www.npmjs.com/package/read-package-tree
