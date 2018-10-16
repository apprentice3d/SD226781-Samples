///////////////////////////////////////////////////////////////////////////////
// Transform Extension, illustrating custom geometry
// by Denis Grigor, September 2018
//
///////////////////////////////////////////////////////////////////////////////

const someViewerState = {
    "seedURN": "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6Y2xvY2tfcmVwby8wMUR1bW15LmYzZA",
    "objectSet": [
        {
            "id": [],
            "isolated": [],
            "hidden": [],
            "explodeScale": 0,
            "idType": "lmv"
        }
    ],
    "viewport": {
        "name": "",
        "eye": [
            204.48330126505937,
            100.3164039523009,
            182.73839807077565
        ],
        "target": [
            1.0011920928955078,
            2.052783966064453,
            0
        ],
        "up": [
            -0.25157238314283936,
            0.9410997291372207,
            -0.2259261734675335
        ],
        "worldUpVector": [
            0,
            1,
            0
        ],
        "pivotPoint": [
            1.0011920928955078,
            2.052783966064453,
            0
        ],
        "distanceToOrbit": 290.6097553342371,
        "aspectRatio": 1.3423517169614985,
        "projection": "perspective",
        "isOrthographic": false,
        "fieldOfView": 22.61986532341139
    },
    "renderOptions": {
        "environment": "(Custom: Model defined)",
        "ambientOcclusion": {
            "enabled": true,
            "radius": 5.945260721973842,
            "intensity": 0.4
        },
        "toneMap": {
            "method": 1,
            "exposure": -8.974,
            "lightMultiplier": -1e-20
        },
        "appearance": {
            "ghostHidden": true,
            "ambientShadow": true,
            "antiAliasing": true,
            "progressiveDisplay": true,
            "swapBlackAndWhite": false,
            "displayLines": true,
            "displayPoints": true
        }
    },
    "cutplanes": []
};


class TransformExtension extends Autodesk.Viewing.Extension {
    constructor(viewer, options) {
        super(viewer, options);
        this.viewer = viewer;

        this.some_mesh = null;
        this.defaultState = null;

        this.customize = this.customize.bind(this);
    }

    load() {
        console.log('TransformExtension is loaded!');

        this.customize();

        return true;
    }

    unload() {
        console.log('TransformExtension is now unloaded!');
        this.viewer.restoreState(this.defaultState);

        return true;
    }

    customize() {

        //Start custom code here ...
        this.defaultState = this.viewer.getState();
        this.viewer.restoreState(someViewerState);
        this.viewer.impl.setPostProcessParameter("style", "edging");
        this.viewer.impl.setPostProcessParameter("depthEdges", false);
        this.viewer.setBackgroundColor(255,255,255,255,255,255);

    }
}

Autodesk.Viewing.theExtensionManager.registerExtension('TransformExtension',
    TransformExtension);


// simple goodies

// this.viewer.impl.setPostProcessParameter("style", "edging");
// this.viewer.impl.setPostProcessParameter("depthEdges", false);


/*


 */
