///////////////////////////////////////////////////////////////////////////////
// Template extension to be used as a reference for extension development
// by Denis Grigor, July 2018
//
///////////////////////////////////////////////////////////////////////////////

class TemplateExtension extends Autodesk.Viewing.Extension {
    constructor(viewer, options) {
        super(viewer, options);
        this.viewer = viewer;
    }

    load() {
        console.log('TemplateExtension is loaded!');

        return true;
    }
    unload() {
        console.log('TemplateExtension is now unloaded!');
        return true;
    }
}

Autodesk.Viewing.theExtensionManager.registerExtension('TemplateExtension',
    TemplateExtension);





/* some simple illustrations*/
// this.viewer.setEnvMapBackground(false);
// this.viewer.setBackgroundColor(234, 136, 89, 240,235,223);