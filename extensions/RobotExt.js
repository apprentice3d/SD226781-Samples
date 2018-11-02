///////////////////////////////////////////////////////////////////////////////
// Robot Extension, illustrating application of gemoetry transformation on
// a simple robotic arm
// by Denis Grigor, September 2018
//
///////////////////////////////////////////////////////////////////////////////

class RobotExtension extends Autodesk.Viewing.Extension {
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
        this.findNodeIdbyName = this.findNodeIdbyName.bind(this);
    }

    load() {
        console.log('RobotExtension is loaded!');

        //Start custom code here ...
        this.customize();
        this.createUI();
        this.setTransformation();

        return true;
    }

    unload() {
        console.log('RobotExtension is now unloaded!');
        this.viewer.restoreState(this.defaultState);

        return true;
    }

    setTransformation() {
        let tree = this.tree;
        let ID_BaseRod = this.findNodeIdbyName('BaseRod');
        let ID_LowerArmBody = this.findNodeIdbyName("LowerArmBody");
        let ID_LowerRodBody = this.findNodeIdbyName('LowerRodBody');
        let ID_MiddleArmBody = this.findNodeIdbyName('MiddleArmBody');
        let ID_UpperRodBody = this.findNodeIdbyName('UpperRodBody');
        let ID_UpperArmBody = this.findNodeIdbyName('UpperArmBody');
        let ID_HookBody = this.findNodeIdbyName('HookBody');


        /* ====================== MainAxis ================= */
        let Pivot_BaseRod = new THREE.Mesh(new THREE.BoxGeometry(5, 5, 5), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
        let Position_BaseRod = this.getFragmentWorldMatrixByNodeId(ID_BaseRod).matrix[0].getPosition().clone();
        Pivot_BaseRod.position.x = Position_BaseRod.x;
        Pivot_BaseRod.position.y = Position_BaseRod.y;
        Pivot_BaseRod.position.z = Position_BaseRod.z;
        viewer.impl.scene.add(Pivot_BaseRod);

        let Helper_LowerArmBody = new THREE.Mesh();
        let Position_LowerArmBody = this.getFragmentWorldMatrixByNodeId(ID_LowerArmBody).matrix[0].getPosition().clone();
        Helper_LowerArmBody.position.x = - Position_LowerArmBody.x + Math.abs(Position_LowerArmBody.x - Pivot_BaseRod.position.x);
        Helper_LowerArmBody.position.y = - Position_LowerArmBody.y + Math.abs(Position_LowerArmBody.y - Pivot_BaseRod.position.y);
        Helper_LowerArmBody.position.z = - Position_LowerArmBody.z + Math.abs(Position_LowerArmBody.z - Pivot_BaseRod.position.z);
        Pivot_BaseRod.add(Helper_LowerArmBody);


        // /* ====================== SecondAxis ================= */


        let Pivot_LowerRodBody = new THREE.Mesh();
        let Position_LowerRodBody = this.getFragmentWorldMatrixByNodeId(ID_LowerRodBody).matrix[0].getPosition().clone();

        Pivot_LowerRodBody.position.x = Position_LowerRodBody.x - Pivot_BaseRod.position.x;
        Pivot_LowerRodBody.position.y = Position_LowerRodBody.y - Pivot_BaseRod.position.y;
        Pivot_LowerRodBody.position.z = Position_LowerRodBody.z - Pivot_BaseRod.position.z;
        Pivot_BaseRod.add(Pivot_LowerRodBody);

        let Helper_LowerRodBody = new THREE.Mesh();
        Helper_LowerRodBody.position.x = - Position_LowerRodBody.x + Math.abs(Position_LowerRodBody.x - Pivot_LowerRodBody.position.x - Pivot_BaseRod.position.x);
        Helper_LowerRodBody.position.y = - Position_LowerRodBody.y + Math.abs(Position_LowerRodBody.y - Pivot_LowerRodBody.position.y - Pivot_BaseRod.position.y);
        Helper_LowerRodBody.position.z = - Position_LowerRodBody.z + Math.abs(Position_LowerRodBody.z - Pivot_LowerRodBody.position.z - Pivot_BaseRod.position.z);
        Pivot_LowerRodBody.add(Helper_LowerRodBody);

        let Helper_MiddleArmBody = new THREE.Mesh();
        let Position_MiddleArmBody = this.getFragmentWorldMatrixByNodeId(ID_MiddleArmBody).matrix[0].getPosition().clone();
        Helper_MiddleArmBody.position.x = - Position_MiddleArmBody.x + Math.abs(Position_MiddleArmBody.x - Pivot_LowerRodBody.position.x - Pivot_BaseRod.position.x);
        Helper_MiddleArmBody.position.y = - Position_MiddleArmBody.y + Math.abs(Position_MiddleArmBody.y - Pivot_LowerRodBody.position.y - Pivot_BaseRod.position.y);
        Helper_MiddleArmBody.position.z = - Position_MiddleArmBody.z + Math.abs(Position_MiddleArmBody.z - Pivot_LowerRodBody.position.z - Pivot_BaseRod.position.z);
        Pivot_LowerRodBody.add(Helper_MiddleArmBody);

        // /* ====================== ThirdAxis ================= */

        let Pivot_UpperRodBody = new THREE.Mesh();
        let Position_UpperRodBody = this.getFragmentWorldMatrixByNodeId(ID_UpperRodBody).matrix[0].getPosition().clone();

        Pivot_UpperRodBody.position.x = Position_UpperRodBody.x - Pivot_LowerRodBody.position.x - Pivot_BaseRod.position.x;
        Pivot_UpperRodBody.position.y = Position_UpperRodBody.y - Pivot_LowerRodBody.position.y - Pivot_BaseRod.position.y;
        Pivot_UpperRodBody.position.z = Position_UpperRodBody.z - Pivot_LowerRodBody.position.z - Pivot_BaseRod.position.z;
        Pivot_LowerRodBody.add(Pivot_UpperRodBody);


        let Helper_UpperRodBody = new THREE.Mesh();

        Helper_UpperRodBody.position.x = - Position_UpperRodBody.x + Math.abs(Position_UpperRodBody.x - Pivot_UpperRodBody.position.x - Pivot_LowerRodBody.position.x - Pivot_BaseRod.position.x);
        Helper_UpperRodBody.position.y = - Position_UpperRodBody.y + Math.abs(Position_UpperRodBody.y - Pivot_UpperRodBody.position.y - Pivot_LowerRodBody.position.y - Pivot_BaseRod.position.y);
        Helper_UpperRodBody.position.z = - Position_UpperRodBody.z + Math.abs(Position_UpperRodBody.z - Pivot_UpperRodBody.position.z - Pivot_LowerRodBody.position.z - Pivot_BaseRod.position.z);
        Pivot_UpperRodBody.add(Helper_UpperRodBody);


        let Helper_UpperArmBody = new THREE.Mesh();
        let Position_UpperArmBody = this.getFragmentWorldMatrixByNodeId(ID_UpperArmBody).matrix[0].getPosition().clone();

        Helper_UpperArmBody.position.x = - Position_UpperArmBody.x + Math.abs(Position_UpperArmBody.x - Pivot_UpperRodBody.position.x - Pivot_LowerRodBody.position.x - Pivot_BaseRod.position.x);
        Helper_UpperArmBody.position.y = - Position_UpperArmBody.y + Math.abs(Position_UpperArmBody.y - Pivot_UpperRodBody.position.y - Pivot_LowerRodBody.position.y - Pivot_BaseRod.position.y) - 0.7;
        Helper_UpperArmBody.position.z = - Position_UpperArmBody.z + Math.abs(Position_UpperArmBody.z - Pivot_UpperRodBody.position.z - Pivot_LowerRodBody.position.z - Pivot_BaseRod.position.z) - 1;
        Pivot_UpperRodBody.add(Helper_UpperArmBody);

        // /* ====================== FourthAxis ================= */

        let Pivot_HookBody = new THREE.Mesh();
        let Position_HookBody = this.getFragmentWorldMatrixByNodeId(ID_HookBody).matrix[0].getPosition().clone();

        Pivot_HookBody.position.x = Position_HookBody.x - Pivot_UpperRodBody.position.x - Pivot_LowerRodBody.position.x - Pivot_BaseRod.position.x;
        Pivot_HookBody.position.y = Position_HookBody.y - Pivot_UpperRodBody.position.y - Pivot_LowerRodBody.position.y - Pivot_BaseRod.position.y + 1.3;
        Pivot_HookBody.position.z = Position_HookBody.z - Pivot_UpperRodBody.position.z - Pivot_LowerRodBody.position.z - Pivot_BaseRod.position.z;
        Pivot_UpperRodBody.add(Pivot_HookBody);


        let Helper_HookBody = new THREE.Mesh();
        Helper_HookBody.position.x = - Position_HookBody.x + Math.abs(Position_HookBody.x - Pivot_HookBody.position.x - Pivot_UpperRodBody.position.x - Pivot_LowerRodBody.position.x - Pivot_BaseRod.position.x);
        Helper_HookBody.position.y = - Position_HookBody.y + Math.abs(Position_HookBody.y - Pivot_HookBody.position.y - Pivot_UpperRodBody.position.y - Pivot_LowerRodBody.position.y - Pivot_BaseRod.position.y) -2.6;
        Helper_HookBody.position.z = - Position_HookBody.z + Math.abs(Position_HookBody.z - Pivot_HookBody.position.z - Pivot_UpperRodBody.position.z - Pivot_LowerRodBody.position.z - Pivot_BaseRod.position.z);
        Pivot_HookBody.add(Helper_HookBody);



        this.assignTransformations(Helper_LowerArmBody, ID_LowerArmBody);
        this.assignTransformations(Helper_LowerRodBody, ID_LowerRodBody);
        this.assignTransformations(Helper_MiddleArmBody, ID_MiddleArmBody);
        this.assignTransformations(Helper_UpperRodBody, ID_UpperRodBody);
        this.assignTransformations(Helper_UpperArmBody, ID_UpperArmBody);
        this.assignTransformations(Helper_HookBody, ID_HookBody);



        /* ====================== Link to controls ================= */

        let baseControlSlider = document.getElementById("baseControl");
        let firstControlSlider = document.getElementById("firstArm");
        let secondControlSlider = document.getElementById("secondArm");
        let thirdControlSlider = document.getElementById("thirdArm");

        baseControlSlider.oninput = (event) => {
            Pivot_BaseRod.rotation.y = Math.PI/180 * event.target.value;
            this.assignTransformations(Helper_LowerArmBody, ID_LowerArmBody);
            this.assignTransformations(Helper_LowerRodBody, ID_LowerRodBody);
            this.assignTransformations(Helper_MiddleArmBody, ID_MiddleArmBody);
            this.assignTransformations(Helper_UpperRodBody, ID_UpperRodBody);
            this.assignTransformations(Helper_UpperArmBody, ID_UpperArmBody);
            this.assignTransformations(Helper_HookBody, ID_HookBody);
            this.viewer.impl.sceneUpdated(true);
        };

        firstControlSlider.oninput = (event) => {
            Pivot_LowerRodBody.rotation.z = Math.PI/180 * event.target.value;
            this.assignTransformations(Helper_MiddleArmBody, ID_MiddleArmBody);
            this.assignTransformations(Helper_UpperRodBody, ID_UpperRodBody);
            this.assignTransformations(Helper_UpperArmBody, ID_UpperArmBody);
            this.assignTransformations(Helper_HookBody, ID_HookBody);
            this.viewer.impl.sceneUpdated(true);
        };

        secondControlSlider.oninput = (event) => {
            Pivot_UpperRodBody.rotation.z = Math.PI/180 * event.target.value;
            this.assignTransformations(Helper_UpperRodBody, ID_UpperRodBody);
            this.assignTransformations(Helper_UpperArmBody, ID_UpperArmBody);
            this.assignTransformations(Helper_HookBody, ID_HookBody);
            this.viewer.impl.sceneUpdated(true);
        };

        thirdControlSlider.oninput = (event) => {
            Pivot_HookBody.rotation.x = Math.PI/180 * event.target.value;
            this.assignTransformations(Helper_HookBody, ID_HookBody);
            this.viewer.impl.sceneUpdated(true);
        };


    }

    findNodeIdbyName(name) {
        let tree = this.tree;
        let nodeList = Object.values(tree.nodeAccess.dbIdToIndex);
        for (let i = 1, len = nodeList.length; i < len; ++i) {
            let node_name = tree.getNodeName(nodeList[i]);
            if (node_name === name) {
                return nodeList[i];
            }
        }
        return null;
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
        this.viewer.setGroundShadow(false);
        this.viewer.setGroundReflection(true);
        this.viewer.setTheme("light-theme");

    }

    createUI() {
        this.ui = document.createElement("div");
        this.ui.id = "control_area";
        this.ui.classList.add("docking-panel-container-solid-color-a");
        this.ui.innerHTML = `
            <div id="controlsArea">
                <div><span>Base: </span><input type="range" min="0" max="360" value="0" class="slider" id="baseControl"></div>
                <div><span>FirstArm: </span><input type="range" min="-65" max="65" value="0" class="slider" id="firstArm"></div>
                <div><span>SecondArm: </span><input type="range" min="-100" max="200" value="0" class="slider" id="secondArm"></div>
                <div><span>Hook: </span><input type="range" min="0" max="360" value="0" class="slider" id="thirdArm"></div>
            </div>
        `;

        let panel = this.panel;
        let viewer = this.viewer;
        // check https://forge.autodesk.com/blog/extension-skeleton-toolbar-docking-panel
        let toolbarButtonRobot = new Autodesk.Viewing.UI.Button('RobotControl');

        if (panel == null) {
            panel = new RobotControlPanel(viewer, viewer.container,
                'controlPanel', 'Robot Control Panel', {"innerDiv":this.ui});
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

Autodesk.Viewing.theExtensionManager.registerExtension('RobotExtension',
    RobotExtension);


// *******************************************
// Robot Control Panel
// *******************************************
function RobotControlPanel(viewer, container, id, title, options) {
    this.viewer = viewer;

    Autodesk.Viewing.UI.DockingPanel.call(this, container, id, title, options);

    // the style of the docking panel
    // use this built-in style to support Themes on Viewer 4+
    this.container.classList.add('docking-panel-container-solid-color-a');
    this.container.id = "robotControlPanelContainer";

    this.container.appendChild(options.innerDiv);

}
RobotControlPanel.prototype = Object.create(Autodesk.Viewing.UI.DockingPanel.prototype);
RobotControlPanel.prototype.constructor = RobotControlPanel;


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