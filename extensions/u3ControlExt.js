///////////////////////////////////////////////////////////////////////////////
// U3 Robot control Extension
// by Denis Grigor, July 2018
//
///////////////////////////////////////////////////////////////////////////////


// Warning: assumes that 'viewer_toolkit.js' was imported


class U3ControlExtension extends Autodesk.Viewing.Extension {
    constructor(viewer, options) {
        super(viewer, options);
        this.toolkit = null;
        this.viewer = viewer;
        this.tree = null;
        this.panel = null;

        this.axisControl01 = null;
        this.axisControl02 = null;
        this.axisControl03 = null;
        this.axisControl04 = null;
        this.axisControl05 = null;
        this.axisControl06 = null;
        this.axisControl07 = null;
        this.axisControl08 = null;
        this.axisControl09 = null;

        // tailored for this model
        this.pivot01 = 53;
        this.pivot02 = 54;
        this.pivot03 = 55;
        this.pivot04 = 57;
        this.pivot05 = 58;
        // this.pivot06 = 59; //useless node, duplicate rotation axis of pivot '60'
        this.pivot06 = 60;
        this.pivot07 = 61;
        this.pivot08 = 62;

        this.IDsLinkedToPivot01 = [10, 11, 12, 13, 14, 15];
        this.IDSLinkedToPivot02 = [17, 18, 19, 21, 20, 22, 24, 25, 26];
        this.IDSLinkedToPivot03 = [31, 33, 56];
        this.IDSLinkedToPivot04 = [28, 29];
        this.IDSLinkedToPivot05 = [36, 35, 38, 39, 49, 59];
        this.IDSLinkedToPivot06 = [41, 42, 51];
        this.IDSLinkedToPivot07 = [44, 45, 47];
        this.IDSLinkedToPivot08 = [8, 7];


        this.customize = this.customize.bind(this);
        this.prepareTheModel = this.prepareTheModel.bind(this);
        this.setupUI = this.setupUI.bind(this);
        this.animateComponents = this.animateComponents.bind(this);
        // this.createAxis = this.createAxis.bind(this);
        this.rotateAxis01 = this.rotateAxis01.bind(this);
        this.rotateAxis02 = this.rotateAxis02.bind(this);
        this.rotateAxis03 = this.rotateAxis03.bind(this);
        this.rotateAxis04 = this.rotateAxis04.bind(this);
        this.rotateAxis05 = this.rotateAxis05.bind(this);
        this.rotateAxis06 = this.rotateAxis06.bind(this);
        this.rotateAxis07 = this.rotateAxis07.bind(this);
        this.rotateAxis08 = this.rotateAxis08.bind(this);
    }

    load() {
        console.log('U3ControlExtension is loaded!');
        this.viewer.addEventListener(Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT,
            this.customize);
        if (this.viewer.model) {
            this.customize();
        }
        return true;
    }

    // noinspection JSMethodCanBeStatic
    unload() {
        console.log('U3ControlExtension is now unloaded!');

        return true;
    }

    customize() {
        this.viewer.removeEventListener(Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT,
            this.customize);


        //Custom code starts here ...
        this.viewer.setGroundReflection(true);
        this.viewer.setTheme("light-theme");
        this.prepareTheModel();
        this.setupUI();
        // this.animateComponents();

    }

    prepareTheModel() {
        this.toolkit = new ViewerUtility(this.viewer);


        let baseControl = this.toolkit.Nodes.GetNodeByID(this.pivot01);
        this.toolkit.Nodes.PrepareNodeForAnimation(this.pivot01);

        this.IDsLinkedToPivot01.forEach(nodeID => {
            this.toolkit.Nodes.PrepareNodeForAnimation(nodeID);
            this.toolkit.Nodes.AttachNodeToPivotNode(this.toolkit.Nodes.GetNodeByID(nodeID),
                baseControl);
        });

        let secondControl = this.toolkit.Nodes.GetNodeByID(this.pivot02);
        this.toolkit.Nodes.PrepareNodeForAnimation(this.pivot02);
        this.toolkit.Nodes.LinkPivotToPivotNode(secondControl, baseControl);


        this.IDSLinkedToPivot02.forEach(nodeID => {
            this.toolkit.Nodes.PrepareNodeForAnimation(nodeID);
            this.toolkit.Nodes.AttachNodeToPivotNode(this.toolkit.Nodes.GetNodeByID(nodeID),
                secondControl);
        });


        let thirdControl = this.toolkit.Nodes.GetNodeByID(this.pivot03);
        this.toolkit.Nodes.PrepareNodeForAnimation(this.pivot03);
        this.toolkit.Nodes.LinkPivotToPivotNode(thirdControl, secondControl);

        this.IDSLinkedToPivot03.forEach(nodeID => {
            this.toolkit.Nodes.PrepareNodeForAnimation(nodeID);
            this.toolkit.Nodes.AttachNodeToPivotNode(this.toolkit.Nodes.GetNodeByID(nodeID),
                thirdControl);
        });

        let fourthControl = this.toolkit.Nodes.GetNodeByID(this.pivot04);
        this.toolkit.Nodes.PrepareNodeForAnimation(this.pivot04);
        this.toolkit.Nodes.LinkPivotToPivotNode(fourthControl, thirdControl);

        this.IDSLinkedToPivot04.forEach(nodeID => {
            this.toolkit.Nodes.PrepareNodeForAnimation(nodeID);
            this.toolkit.Nodes.AttachNodeToPivotNode(this.toolkit.Nodes.GetNodeByID(nodeID),
                fourthControl);
        });

        let fifthControl = this.toolkit.Nodes.GetNodeByID(this.pivot05);
        this.toolkit.Nodes.PrepareNodeForAnimation(this.pivot05);
        this.toolkit.Nodes.LinkPivotToPivotNode(fifthControl, fourthControl);

        this.IDSLinkedToPivot05.forEach(nodeID => {
            this.toolkit.Nodes.PrepareNodeForAnimation(nodeID);
            this.toolkit.Nodes.AttachNodeToPivotNode(this.toolkit.Nodes.GetNodeByID(nodeID),
                fifthControl);
        });

        let sixthControl = this.toolkit.Nodes.GetNodeByID(this.pivot06);
        this.toolkit.Nodes.PrepareNodeForAnimation(this.pivot06);
        this.toolkit.Nodes.LinkPivotToPivotNode(sixthControl, fifthControl);

        this.IDSLinkedToPivot06.forEach(nodeID => {
            this.toolkit.Nodes.PrepareNodeForAnimation(nodeID);
            this.toolkit.Nodes.AttachNodeToPivotNode(this.toolkit.Nodes.GetNodeByID(nodeID),
                sixthControl);
        });

        let seventhControl = this.toolkit.Nodes.GetNodeByID(this.pivot07);
        this.toolkit.Nodes.PrepareNodeForAnimation(this.pivot07);
        this.toolkit.Nodes.LinkPivotToPivotNode(seventhControl, sixthControl);

        this.IDSLinkedToPivot07.forEach(nodeID => {
            this.toolkit.Nodes.PrepareNodeForAnimation(nodeID);
            this.toolkit.Nodes.AttachNodeToPivotNode(this.toolkit.Nodes.GetNodeByID(nodeID),
                seventhControl);
        });

        let eighthControl = this.toolkit.Nodes.GetNodeByID(this.pivot08);
        this.toolkit.Nodes.PrepareNodeForAnimation(this.pivot08);
        this.toolkit.Nodes.LinkPivotToPivotNode(eighthControl, seventhControl);

        this.IDSLinkedToPivot08.forEach(nodeID => {
            this.toolkit.Nodes.PrepareNodeForAnimation(nodeID);
            this.toolkit.Nodes.AttachNodeToPivotNode(this.toolkit.Nodes.GetNodeByID(nodeID),
                eighthControl);
        });


    }


    createAxis(id) {
        let controlBlock = document.createElement('div');
        controlBlock.className = "controlBlock";
        controlBlock.innerHTML = `
        <span>${(id)}</span>
        `;

        let input = document.createElement('input');
        input.type = 'range';
        input.value = 0;
        input.max = 50;
        input.min = -50;
        input.id = id;
        // input.step = 3.6;
        controlBlock.appendChild(input);

        let label = document.createElement('span');
        label.id = id + '_label';
        label.innerText = input.value;
        controlBlock.appendChild(label);

        return controlBlock;
    };


    setupUI() {

        let customUI = document.createElement('div');
        customUI.id = "U3_Control_UI";

        this.axisControl01 = this.createAxis('axis01');
        this.axisControl01.oninput = this.rotateAxis01;
        customUI.appendChild(this.axisControl01);

        this.axisControl02 = this.createAxis('axis02');
        this.axisControl02.oninput = this.rotateAxis02;
        customUI.appendChild(this.axisControl02);

        this.axisControl03 = this.createAxis('axis03');
        this.axisControl03.oninput = this.rotateAxis03;
        customUI.appendChild(this.axisControl03);

        this.axisControl04 = this.createAxis('axis04');
        this.axisControl04.oninput = this.rotateAxis04;
        customUI.appendChild(this.axisControl04);

        this.axisControl05 = this.createAxis('axis05');
        this.axisControl05.oninput = this.rotateAxis05;
        customUI.appendChild(this.axisControl05);

        this.axisControl06 = this.createAxis('axis06');
        this.axisControl06.oninput = this.rotateAxis06;
        customUI.appendChild(this.axisControl06);

        this.axisControl07 = this.createAxis('axis07');
        this.axisControl07.oninput = this.rotateAxis07;
        customUI.appendChild(this.axisControl07);

        this.axisControl08 = this.createAxis('axis08');
        this.axisControl08.oninput = this.rotateAxis08;
        customUI.appendChild(this.axisControl08);


        let panel = this.panel;
        let viewer = this.viewer;
        // check https://forge.autodesk.com/blog/extension-skeleton-toolbar-docking-panel
        let toolbarButtonU3 = new Autodesk.Viewing.UI.Button('U3Control');

        if (panel == null) {
            panel = new U3ControlPanel(viewer, viewer.container,
                'u3ControlPanel', 'U3 Control Panel', {"innerDiv": customUI});
        }

        toolbarButtonU3.onClick = (e) => {

            panel.setVisible(!panel.isVisible());
        };


        toolbarButtonU3.addClass('toolbarButtonRobot');
        toolbarButtonU3.setToolTip('Show/Hide U3 Controls');

        // SubToolbar
        this.subToolbar = new Autodesk.Viewing.UI.ControlGroup('ExtensionRobotControlToolbar');
        this.subToolbar.addControl(toolbarButtonU3);

        this.viewer.toolbar.addControl(this.subToolbar);

        this.resetButton = document.createElement('button');
        this.resetButton.innerText = "RESET";
        this.resetButton.style = `
            text-align: center;
            margin: 5px 20%;
            width: 60%;
            height: 20px;
        `;


        this.resetButton.onclick = () => {

            let axis01 = document.getElementById('axis01');
            let axis02 = document.getElementById('axis02');
            let axis03 = document.getElementById('axis03');
            let axis04 = document.getElementById('axis04');
            let axis05 = document.getElementById('axis05');
            let axis06 = document.getElementById('axis06');
            let axis07 = document.getElementById('axis07');
            let axis08 = document.getElementById('axis08');
            console.log(axis01);
            axis01.value = 0;
            axis02.value = 0;
            axis03.value = 0;
            axis04.value = 0;
            axis05.value = 0;
            axis06.value = 0;
            axis07.value = 0;
            axis08.value = 0;

            this.rotateAxis01({target: {value: 0}});
            this.rotateAxis02({target: {value: 0}});
            this.rotateAxis03({target: {value: 0}});
            this.rotateAxis04({target: {value: 0}});
            this.rotateAxis05({target: {value: 0}});
            this.rotateAxis06({target: {value: 0}});
            this.rotateAxis07({target: {value: 0}});
            this.rotateAxis08({target: {value: 0}});

        };

        customUI.appendChild(this.resetButton);
    }

    rotateAxis01(event) {
        let value = event.target.value;
        let label = document.getElementById('axis01_label');
        label.innerText = value;

        this.toolkit.Nodes.RotateNode(this.pivot01, 0, value * 2 * Math.PI / 100, 0);
        this.viewer.impl.sceneUpdated(true);
    };

    rotateAxis02(event) {
        let value = event.target.value;
        let label = document.getElementById('axis02_label');
        label.innerText = value;

        this.toolkit.Nodes.RotateNode(this.pivot02, 0, 0, value * 2 * Math.PI / 100);
        this.viewer.impl.sceneUpdated(true);
    };

    rotateAxis03(event) {
        let value = event.target.value;
        let label = document.getElementById('axis03_label');
        label.innerText = value;

        this.toolkit.Nodes.RotateNode(this.pivot03, 0, value * 2 * Math.PI / 100, 0);
        this.viewer.impl.sceneUpdated(true);
    };

    rotateAxis04(event) {
        let value = event.target.value;
        let label = document.getElementById('axis04_label');
        label.innerText = value;

        this.toolkit.Nodes.RotateNode(this.pivot04, 0, 0, value * 2 * Math.PI / 100);
        this.viewer.impl.sceneUpdated(true);
    };

    rotateAxis05(event) {
        let value = event.target.value;
        let label = document.getElementById('axis05_label');
        label.innerText = value;

        this.toolkit.Nodes.RotateNode(this.pivot05, 0, value * 2 * Math.PI / 100, 0);
        this.viewer.impl.sceneUpdated(true);
    };

    rotateAxis06(event) {
        let value = event.target.value;
        let label = document.getElementById('axis06_label');
        label.innerText = value;

        this.toolkit.Nodes.RotateNode(this.pivot06, 0, 0, value * 2 * Math.PI / 100);
        this.viewer.impl.sceneUpdated(true);
    };

    rotateAxis07(event) {
        let value = event.target.value;
        let label = document.getElementById('axis07_label');
        label.innerText = value;

        this.toolkit.Nodes.RotateNode(this.pivot07, 0, value * 2 * Math.PI / 100, 0);
        this.viewer.impl.sceneUpdated(true);
    };

    rotateAxis08(event) {
        let value = event.target.value;
        let label = document.getElementById('axis08_label');
        label.innerText = value;

        this.toolkit.Nodes.RotateNode(this.pivot08, 0, 0, value * 2 * Math.PI / 100);
        this.viewer.impl.sceneUpdated(true);
    };

    animateComponents() {
        let pivot01 = this.pivot01;
        let pivot02 = this.pivot02;
        let pivot03 = this.pivot03;
        let pivot04 = this.pivot04;
        let pivot05 = this.pivot05;
        let pivot06 = this.pivot06;
        let pivot07 = this.pivot07;
        let pivot08 = this.pivot08;
        let nodes = this.toolkit.Nodes;
        let viewer = this.viewer.impl;

        let rotations = {pivot01: 0, pivot02: -Math.PI / 2};


        let testTimeline = anime.timeline({
            // loop:true,
            // direction: 'alternate',
        });

        testTimeline
            .add({
                targets: rotations,
                pivot01: 2 * Math.PI,
                duration: 10000,
                pivot02: Math.PI / 2,
                easing: 'easeOutSine',
                update: function () {
                    nodes.RotateNode(pivot01, 0, rotations.pivot01, 0);
                    nodes.RotateNode(pivot02, 0, 0, rotations.pivot02);
                    nodes.RotateNode(pivot03, 0, rotations.pivot01, 0);
                    nodes.RotateNode(pivot04, 0, 0, rotations.pivot02);
                    nodes.RotateNode(pivot05, 0, rotations.pivot01, 0);
                    nodes.RotateNode(pivot06, 0, 0, rotations.pivot02);
                    nodes.RotateNode(pivot07, 0, rotations.pivot01, 0);
                    nodes.RotateNode(pivot08, 0, 0, rotations.pivot02);
                    viewer.sceneUpdated(true);
                }
            })
            .add({
                targets: rotations,
                pivot01: 0,
                duration: 10000,
                pivot02: -Math.PI / 2,
                delay: 1000,
                easing: 'easeOutSine',
                loop: true,
                update: function () {
                    nodes.RotateNode(pivot01, 0, rotations.pivot01, 0);
                    nodes.RotateNode(pivot02, 0, 0, rotations.pivot02);
                    nodes.RotateNode(pivot03, 0, rotations.pivot01, 0);
                    nodes.RotateNode(pivot04, 0, 0, rotations.pivot02);
                    nodes.RotateNode(pivot05, 0, rotations.pivot01, 0);
                    nodes.RotateNode(pivot06, 0, 0, rotations.pivot02);
                    nodes.RotateNode(pivot07, 0, rotations.pivot01, 0);
                    nodes.RotateNode(pivot08, 0, 0, rotations.pivot02);
                    viewer.sceneUpdated(true);
                }
            })
            .add({
                targets: rotations,
                pivot01: 0,
                duration: 5000,
                pivot02: 0,
                easing: 'easeOutSine',
                update: function () {
                    nodes.RotateNode(pivot01, 0, rotations.pivot01, 0);
                    nodes.RotateNode(pivot02, 0, 0, rotations.pivot02);
                    nodes.RotateNode(pivot03, 0, rotations.pivot01, 0);
                    nodes.RotateNode(pivot04, 0, 0, rotations.pivot02);
                    nodes.RotateNode(pivot05, 0, rotations.pivot01, 0);
                    nodes.RotateNode(pivot06, 0, 0, rotations.pivot02);
                    nodes.RotateNode(pivot07, 0, rotations.pivot01, 0);
                    nodes.RotateNode(pivot08, 0, 0, rotations.pivot02);
                    viewer.sceneUpdated(true);
                }
            });


        // let rotate = {Y: 0};


        // let mainRotation = anime({
        //     targets: rotate,
        //     Y: 2*Math.PI,
        //     duration: 3000,
        //     loop: true,
        //     easing:'linear',
        //     update: function() {
        //         nodes.RotateNode(mainPivot, 0,rotate.Y,0);
        //         viewer.sceneUpdated(true);
        //     }
        // });

    }

}

Autodesk.Viewing.theExtensionManager.registerExtension('U3ControlExtension',
    U3ControlExtension);


// *******************************************
// U3 Control Panel
// *******************************************
function U3ControlPanel(viewer, container, id, title, options) {
    this.viewer = viewer;

    Autodesk.Viewing.UI.DockingPanel.call(this, container, id, title, options);

    // the style of the docking panel
    // use this built-in style to support Themes on Viewer 4+
    this.container.classList.add('docking-panel-container-solid-color-a');
    this.container.id = "u3ControlPanelContainer";

    this.container.appendChild(options.innerDiv);

}
U3ControlPanel.prototype = Object.create(Autodesk.Viewing.UI.DockingPanel.prototype);
U3ControlPanel.prototype.constructor = U3ControlPanel;