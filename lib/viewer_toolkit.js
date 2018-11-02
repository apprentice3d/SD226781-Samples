let viewerUtilityReport = "VIEWERTOOLKIT:";
let viewerUtilityVersion = "v0.0.8";

class ViewerUtility {
    constructor(viewer) {

        /* Private components */
        this._viewer = viewer;
        this._tree = null;


        /* Public components */
        this.Nodes = new NodeTree(this);
        this.NODE_TREE_CREATED = document.createEvent("Event");
        this.NODE_TREE_CREATED.initEvent("NODE_TREE_CREATED", true, true);


        /* bindings */

        /* local setup */
        if (!this._viewer.model) {
            let waitForTreeCreation = () => {
                this._viewer.removeEventListener(Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT,
                    waitForTreeCreation);
                this._tree = this._viewer.model.getData().instanceTree;
                this.Nodes._parseInstanceTree(this._tree);
            };

            this._viewer.addEventListener(Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT,
                waitForTreeCreation);
        } else {
            this._tree = this._viewer.model.getData().instanceTree;
            this.Nodes._parseInstanceTree(this._tree);
        }

    }


    //Return the version of the toolkit as a String
    static Version() {
        return "0.0.1";
    }
}


class NodeTree {
    constructor(viewerUtility) {

        /* Private components */
        this._viewerUtil = viewerUtility;
        this._nodes = [];
        this._parseInstanceTree = this._parseInstanceTree.bind(this);
        this._getFragmentWorldMatrixByNodeId = this._getFragmentWorldMatrixByNodeId.bind(this);
        this._updateFragmentsOfTheNode = this._updateFragmentsOfTheNode.bind(this);

        /* bindings */
        this.GetNodeByID = this.GetNodeByID.bind(this);
        this.RotateNode = this.RotateNode.bind(this);
        this.LinkPivotToPivotNode = this.LinkPivotToPivotNode.bind(this);
        this.AttachNodeToPivotNode = this.AttachNodeToPivotNode.bind(this);
        this._accumulatePivotOffsets = this._accumulatePivotOffsets.bind(this);

    }

    /* Public Methods */
    GetNodes() {
        return this._nodes;
    }


    GetNodeByID(nodeID) {
        for (let i = 0; i < this._nodes.length; i++) {
            if (this._nodes[i]["ID"] === nodeID) {
                return this._nodes[i];
            }
        }
    }

    PrepareNodeForAnimation(nodeID) {
        let node = this.GetNodeByID(nodeID);
        if (!node.IsAnimatable || node.IsPreparedForAnimation) {
            return false;
        }

        // for debug purposes
        node._helper = new THREE.Mesh(
            // new THREE.BoxGeometry(5, 5, 5),
            // new THREE.MeshBasicMaterial({
            //     color: 0x0000ff
            // })
        );

        node._pivot = new THREE.Mesh(
            // new THREE.BoxGeometry(5, 5, 5),
            // new THREE.MeshBasicMaterial({
            //     color: 0xff0000
            // })
        );

        node._pivot.position.x = node.Position.x;
        node._pivot.position.y = node.Position.y;
        node._pivot.position.z = node.Position.z;

        node._helper.position.x = -node.Position.x;
        node._helper.position.y = -node.Position.y;
        node._helper.position.z = -node.Position.z;
        node._pivot.add(node._helper);


        this._viewerUtil._viewer.impl.scene.add(node._pivot);

        node.IsPreparedForAnimation = true;

        return true;
    }


    LinkPivotToPivotNode(node, parent) {
        if (!node.IsPreparedForAnimation || !parent.IsPreparedForAnimation) {
            return false;
        }

        node.Parent = parent.ID;
        parent.Children.push(node);
        this._viewerUtil._viewer.impl.scene.remove(node._pivot);


        let offsetSum = this._accumulatePivotOffsets(parent);

        node._pivot.position.x = node._pivot.position.x - offsetSum.x;
        node._pivot.position.y = node._pivot.position.y - offsetSum.y;
        node._pivot.position.z = node._pivot.position.z - offsetSum.z;

        parent._pivot.add(node._pivot);
    }


    AttachNodeToPivotNode(node, parent) {
        if (!node.IsPreparedForAnimation || !parent.IsPreparedForAnimation) {
            return false;
        }

        node.Parent = parent.ID;
        parent.Children.push(node);
        this._viewerUtil._viewer.impl.scene.remove(node._pivot);
        node._helper.position.x = node._helper.position.x + parent._helper.position.x;
        node._helper.position.y = node._helper.position.y + parent._helper.position.y;
        node._helper.position.z = node._helper.position.z + parent._helper.position.z;
        parent._pivot.add(node._pivot);
    }


    RotateNode(nodeID, x, y, z) {
        let node = this.GetNodeByID(nodeID);
        if (!node.IsAnimatable || !node.IsPreparedForAnimation) {
            return false;
        }

        node._pivot.rotation.x = x;
        node._pivot.rotation.y = y;
        node._pivot.rotation.z = z;

        this._updateFragmentsOfTheNode(node);

        return true;
    }


    /* Private Methods */

    _accumulatePivotOffsets(pivot) {
        if(!pivot._pivot) {
            return {x:0,y:0,z:0};
        }

        let parentPosition = this._accumulatePivotOffsets(this.GetNodeByID(pivot.Parent));

        return {
            x: pivot._pivot.position.x + parentPosition.x,
            y: pivot._pivot.position.y + parentPosition.y,
            z: pivot._pivot.position.z + parentPosition.z
        }

    }

    _updateFragmentsOfTheNode(node) {
        if (!node.IsAnimatable || !node.IsPreparedForAnimation) {
            console.log("pass ", node.ID);
            return false;
        }
        node._helper.parent.updateMatrixWorld();
        var position = new THREE.Vector3();
        var rotation = new THREE.Quaternion();
        var scale = new THREE.Vector3();
        node._helper.matrixWorld.decompose(position, rotation, scale);

        let viewer = this._viewerUtil._viewer;

        this._viewerUtil._tree.enumNodeFragments(node.ID, function (frag) {
            var fragProxy = viewer.impl.getFragmentProxy(viewer.model, frag);
            fragProxy.getAnimTransform();
            fragProxy.position = position;
            fragProxy.quaternion = rotation;
            fragProxy.updateAnimTransform();
        });

        node.Children.forEach(child => {
            this._updateFragmentsOfTheNode(child);
        });
    }

    _parseInstanceTree(tree) {

        window.dbg_tree = tree; //for DEBUG only


        console.log(viewerUtilityReport, `found ${(tree.objectCount)} objects.`);
        for (let i = 0; i < tree.objectCount; i++) {
            let inode = new Node();
            inode.ID = tree.nodeAccess.dbIdToIndex[i];
            inode.Name = tree.nodeAccess.name(inode.ID);
            inode.Parent = tree.nodeAccess.getParentId(inode.ID);
            tree.nodeAccess.enumNodeChildren(inode.ID, ch => {
                inode.Children.push(ch)
            });

            if (inode.Children.length === 0 &&
                inode.Parent !== inode.ID //exclude the main/root node

            ) {

                //TODO: Fix for cases when there are several fragments with several matrices!
                let transMat = this._getFragmentWorldMatrixByNodeId(inode.ID).matrix[0];

                inode.IsAnimatable = true;
                inode.Position.getPositionFromMatrix(transMat);
            }


            this._nodes.push(inode);
        }

        // inform listeners that inodes are available
        document.dispatchEvent(this._viewerUtil.NODE_TREE_CREATED);
    }

    _getFragmentWorldMatrixByNodeId(nodeId) {
        let viewer = this._viewerUtil._viewer;
        let tree = this._viewerUtil._tree;

        let result = {
            fragId: [],
            matrix: [],
        };

        tree.enumNodeFragments(nodeId, function (frag) {

            let fragProxy = viewer.impl.getFragmentProxy(viewer.model, frag);
            let matrix = new THREE.Matrix4();

            fragProxy.getWorldMatrix(matrix);

            result.fragId.push(frag);
            result.matrix.push(matrix);
        });
        return result;
    }


}


class Node {
    constructor() {

        /* Public components */
        this.ID = null;
        this.Name = null;
        this.Parent = null;
        this.Children = [];
        this.Position = new THREE.Vector3();
        this.Rotation = new THREE.Vector3();
        this.Scale = new THREE.Vector3();
        this.IsAnimatable = false;
        this.IsPreparedForAnimation = false;

        this._helper = null;
        this._pivot = null;

    }


}


