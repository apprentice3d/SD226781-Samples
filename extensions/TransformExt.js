///////////////////////////////////////////////////////////////////////////////
// Transform Extension, illustrating simple component transformation
// by Denis Grigor, September 2018
//
///////////////////////////////////////////////////////////////////////////////

class TransformExtension extends Autodesk.Viewing.Extension {
    constructor(viewer, options) {
        super(viewer, options);
        this.viewer = viewer;
        this.tree = this.viewer.model.getData().instanceTree;

        this.defaultState = null;

        this.customize = this.customize.bind(this);
        this.createUI = this.createUI.bind(this);
        this.setTransformation = this.setTransformation.bind(this);

        this.getFragmentWorldMatrixByNodeId = this.getFragmentWorldMatrixByNodeId.bind(this);
        this.assignTransformations = this.assignTransformations.bind(this);
    }

    load() {
        console.log('TransformExtension is loaded!');

        //Start custom code here ...
        this.customize();
        this.createUI();
        this.setTransformation();

        return true;
    }

    unload() {
        console.log('TransformExtension is now unloaded!');
        this.viewer.restoreState(this.defaultState);

        return true;
    }

    setTransformation() {
        let pivotBaseID = 15;
        let mainArmID = 4;

        let dummy_center = new THREE.Mesh(new THREE.BoxGeometry(5, 5, 10), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
        let center_position = this.getFragmentWorldMatrixByNodeId(pivotBaseID).matrix[0].getPosition().clone();
        console.log("base position: ", center_position);
        dummy_center.position.x = center_position.x;
        dummy_center.position.y = center_position.y;
        dummy_center.position.z = center_position.z;
        this.viewer.impl.scene.add(dummy_center);

        let dummy_mainArm = new THREE.Mesh(new THREE.BoxGeometry(5, 5, 10), new THREE.MeshBasicMaterial({ color: 0x00ff00 }));
        let element_position = this.getFragmentWorldMatrixByNodeId(mainArmID).matrix[0].getPosition().clone();
        console.log("arm position: ", element_position);
        dummy_mainArm.position.x = -element_position.x + Math.abs(element_position.x - center_position.x);
        dummy_mainArm.position.y = -element_position.y + Math.abs(element_position.y - center_position.y);
        dummy_mainArm.position.z = -element_position.z + Math.abs(element_position.z - center_position.z);
        dummy_center.add(dummy_mainArm);


        let animate = () => {
            requestAnimationFrame(animate);
            dummy_center.rotation.y += 0.01;
            this.assignTransformations(dummy_mainArm, mainArmID);
            this.viewer.impl.sceneUpdated(true);
        };

        // animate();

        let baseControlSlider = document.getElementById("baseControl");

        baseControlSlider.oninput = (event) => {

            dummy_center.rotation.y = Math.PI/180 * event.target.value;
            console.log(Math.PI/180 * event.target.value);
            this.assignTransformations(dummy_mainArm, mainArmID);
            this.viewer.impl.sceneUpdated(true);
        }


    }




    getFragmentWorldMatrixByNodeId(nodeId) {
        let viewer = this.viewer;

        let result = {
            fragId: [],
            matrix: [],
        };
        this.tree.enumNodeFragments(nodeId, function (frag) {

            let fragProxy = viewer.impl.getFragmentProxy(viewer.model, frag);
            let matrix = new THREE.Matrix4();

            fragProxy.getWorldMatrix(matrix);

            result.fragId.push(frag);
            result.matrix.push(matrix);
        });
        return result;
    }


    assignTransformations(ref_obj, nodeId) {
        let viewer = this.viewer;

        ref_obj.parent.updateMatrixWorld();
        var position = new THREE.Vector3();
        var rotation = new THREE.Quaternion();
        var scale = new THREE.Vector3();
        ref_obj.matrixWorld.decompose(position, rotation, scale);

        this.tree.enumNodeFragments(nodeId, function (frag) {
            var fragProxy = viewer.impl.getFragmentProxy(viewer.model, frag);
            fragProxy.getAnimTransform();
            fragProxy.position = position;
            fragProxy.quaternion = rotation;
            fragProxy.updateAnimTransform();
        });
    }





    customize() {

        this.defaultState = this.viewer.getState();
        this.viewer.restoreState(someViewerState);
        this.viewer.impl.setPostProcessParameter("style", "edging");
        this.viewer.impl.setPostProcessParameter("depthEdges", false);
        this.viewer.setBackgroundColor(255,255,255,255,255,255);
        this.viewer.setTheme("light-theme");

    }

    createUI() {
        this.ui = document.createElement("div");
        this.ui.id = "control_area";
        this.ui.classList.add("docking-panel-container-solid-color-a");
        this.ui.innerHTML = `
            <div id="controlsArea">
                <div><span>Base: </span><input type="range" min="0" max="360" value="0" class="slider" id="baseControl"></div>
                <div><span>FirstArm: </span><input type="range" min="0" max="360" value="0" class="slider" id="firstArm"></div>
            </div>
        `;

        let panel = this.panel;
        let viewer = this.viewer;
        // check https://forge.autodesk.com/blog/extension-skeleton-toolbar-docking-panel
        let toolbarButtonRobot = new Autodesk.Viewing.UI.Button('RobotControl');

        if (panel == null) {
            panel = new TransformControlPanel(viewer, viewer.container,
                'controlPanel', 'Control Panel', {"innerDiv":this.ui});
        }

        toolbarButtonRobot.onClick = (e) => {

            panel.setVisible(!panel.isVisible());
        };


        toolbarButtonRobot.addClass('toolbarButtonRobot');
        toolbarButtonRobot.setToolTip('Show/Hide Robot Controls');

        // SubToolbar
        this.subToolbar = new Autodesk.Viewing.UI.ControlGroup('ExtensionRobotControlToolbar');
        this.subToolbar.addControl(toolbarButtonRobot);

        this.viewer.toolbar.addControl(this.subToolbar);
    }
}

Autodesk.Viewing.theExtensionManager.registerExtension('TransformExtension',
    TransformExtension);


// *******************************************
// Transform Control Panel
// *******************************************
function TransformControlPanel(viewer, container, id, title, options) {
    this.viewer = viewer;

    Autodesk.Viewing.UI.DockingPanel.call(this, container, id, title, options);

    // the style of the docking panel
    // use this built-in style to support Themes on Viewer 4+
    this.container.classList.add('docking-panel-container-solid-color-a');
    this.container.id = "robotControlPanelContainer";

    this.container.appendChild(options.innerDiv);

}
TransformControlPanel.prototype = Object.create(Autodesk.Viewing.UI.DockingPanel.prototype);
TransformControlPanel.prototype.constructor = TransformControlPanel;


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