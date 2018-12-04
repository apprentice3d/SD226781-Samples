///////////////////////////////////////////////////////////////////////////////
// Geometry Extension, illustrating custom geometry
// by Denis Grigor, September 2018
//
///////////////////////////////////////////////////////////////////////////////

class GeometryExtension extends Autodesk.Viewing.Extension {
    constructor(viewer, options) {
        super(viewer, options);
        this.viewer = viewer;

        this.some_mesh = null;

        this.customize = this.customize.bind(this);
    }

    load() {
        console.log('GeometryExtension is loaded!');

        this.customize();

        return true;
    }
    unload() {
        console.log('GeometryExtension is now unloaded!');
        this.viewer.impl.scene.remove(this.some_mesh);
        this.viewer.impl.sceneUpdated(true);
        return true;
    }

    customize() {

        //Start custom code here ...

        let color = 0xff0000;

        let geometry = new THREE.BoxGeometry(1000, 2000, 3000);
        const material = new THREE.MeshPhongMaterial({
            specular: new THREE.Color(color),
            side: THREE.DoubleSide,
            color,
            transparent: true,
            opacity: 0.5
        });

        this.some_mesh = new THREE.Mesh(geometry, material);

        this.viewer.impl.scene.add(this.some_mesh);


        /* Important part if you want your material to be "seen" by the scene lights*/
        // const materials = this.viewer.impl.getMaterials();
        //
        // materials.addMaterial(
        //     color.toString(16), material, true);

        viewer.impl.invalidate(true);
        this.viewer.impl.sceneUpdated(true);
    }
}

Autodesk.Viewing.theExtensionManager.registerExtension('GeometryExtension',
    GeometryExtension);



/* some simple illustrations*/
/*
        this.viewer.impl.setPostProcessParameter("style", "edging");
        this.viewer.impl.setPostProcessParameter("depthEdges", false);
 */
