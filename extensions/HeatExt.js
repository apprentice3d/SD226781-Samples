///////////////////////////////////////////////////////////////////////////////
// Heat Extension, illustrating custom shader assigned to an existing
// component
// by Denis Grigor, October 2018
//
///////////////////////////////////////////////////////////////////////////////

class HeatExtension extends Autodesk.Viewing.Extension {
    constructor(viewer, options) {
        super(viewer, options);
        this.viewer = viewer;
        this.tree = null;
        this.myMaterial = null;
        this.some_mesh = null;

        this.customize = this.customize.bind(this);
        this.createShaderMaterial = this.createShaderMaterial.bind(this);
        this.createShadeMaterialWithOffset = this.createShadeMaterialWithOffset.bind(this);
        this.getBounds = this.getBounds.bind(this);
        this.processSelection = this.processSelection.bind(this);
        this.computeClickRelativeToFloorPosition = this.computeClickRelativeToFloorPosition.bind(this);


        // constants put here for optimization only
        this.floorID = 269;
        this.floorFragmentID = 0;
        this.bounds = {
            height: 53.08399200439453*2,
            width: 115.7926254272461*2
        };

        this.textureCoords = {
            maxWidth:  0.746,
            maxHeight: 0.742,
            minWidth: 0.255,
            minHeight: 0.259,
        };

    }

    load() {
        console.log('HeatExtension is loaded!');

        this.tree = this.viewer.model.getData().instanceTree;

        document.addEventListener('click', this.processSelection);

        //Hide all room bodies
        this.viewer.hide(370);

        this.viewer.setBackgroundColor(255,255,255,255,255,255);
        this.viewer.setEnvMapBackground(false);
        this.viewer.setGroundShadow(true);
        this.viewer.setGroundReflection(true);
        this.viewer.setTheme("light-theme");

        this.customize();

        return true;
    }
    unload() {
        console.log('HeatExtension is now unloaded!');
        this.viewer.impl.scene.remove(this.some_mesh);
        viewer.impl.sceneUpdated(true);
        viewer.impl.invalidate(true);

        document.removeEventListener('click', this.processSelection);

        return true;
    }

    processSelection(event) {

        let selection = this.viewer.getSelection();

        if(selection.length !== 0 && selection[0] === this.floorID) {
            this.viewer.select(); //clear selection
            let intersectPoint = this.viewer.clientToWorld(event.clientX, event.clientY, true).intersectPoint;
            let offset = this.computeClickRelativeToFloorPosition(intersectPoint, this.bounds, this.textureCoords);
            console.log(offset);

            this.myMaterial = this.createShadeMaterialWithOffset(offset.X,offset.Y,this.bounds);

            viewer.model.getFragmentList().setMaterial(this.floorFragmentID, this.myMaterial);

            viewer.impl.sceneUpdated(true);
            viewer.impl.invalidate(true);

        }
    }

    computeClickRelativeToFloorPosition(intersectionPoint, bounds, texCoord) {
        let maxWidth = bounds.width/4*-1;
        let minWidth = bounds.width/4;
        let maxHeight = bounds.height/4;
        let minHeight = bounds.height/4*-1;

        let A = (texCoord.minWidth - texCoord.maxWidth)/(minWidth-maxWidth);
        let B = texCoord.maxWidth - A*maxWidth;
        let offSetX = A*intersectionPoint.x + B;

        A = (texCoord.minHeight - texCoord.maxHeight)/(minHeight-maxHeight);
        B = texCoord.maxHeight - A*maxHeight;
        let offSetY = A*intersectionPoint.y + B;

        return {X: offSetX, Y: offSetY}
    }

    customize() {

        //Start custom code here ...
        let viewer = this.viewer;



        let floorBox = new THREE.Box3();
        this.viewer.model.getFragmentList()
            .getWorldBounds(this.floorFragmentID, floorBox);

        const width = Math.abs(floorBox.max.x - floorBox.min.x);
        const height = Math.abs(floorBox.max.y - floorBox.min.y);

        // min is used to shift for the shader, the others are roof dimensions
        let bounds =  {
            width: width,
            height: height};

        console.log(bounds);

        // this.myMaterial = this.createShaderMaterial(bounds);
        this.myMaterial = this.createShadeMaterialWithOffset(0.5,0.5,this.bounds);

        viewer.model.getFragmentList().setMaterial(this.floorFragmentID, this.myMaterial);

        viewer.impl.sceneUpdated(true);
        viewer.impl.invalidate(true);

    }

    createShadeMaterialWithOffset(offsetX, offsetY, bounds) {
        const uniforms = {
            height: {
                type: 'f',
                value: bounds.height
            },
            width: {
                type: 'f',
                value: bounds.width
            },
            offsetx: {
                type: 'f',
                value: offsetX
            },
            offsety: {
                type: 'f',
                value: offsetY
            },
            texture1: {
                type: "t",
                value: THREE.ImageUtils.loadTexture( "../img/radial.png" )
            }
        };

        const myVertexShader =  `
        varying vec2 vUv;
        uniform float height;
        uniform float width;
        uniform float offsetx;
        uniform float offsety;
        
        void main() {
             
            vec3 projection = vec3(position.x, position.y, 0.);
        
            vUv = vec2((projection.x) / width + offsetx,
                (height + projection.y) / height - offsety);

            vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
                    gl_Position = projectionMatrix * mvPosition;
        }
        ` ;

        const myFragmentShader = `
        uniform sampler2D texture1;
        varying vec2 vUv;
        
             void main() {
             // gl_FragColor = vec4(0,0,1, 1);
             gl_FragColor = texture2D(texture1, vUv);
        }
        `;

        const material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: myVertexShader,
            fragmentShader: myFragmentShader,
            side: THREE.DoubleSide,
        });

        const materials = this.viewer.impl.matman();

        materials.removeMaterial("MyTextureShaderMaterial");

        materials.addMaterial(
            "MyTextureShaderMaterial",
            material,
            true);

        viewer.impl.invalidate(true);

        return material;
    }


    createShaderMaterial(bounds) {

        const myVertexShader =  `
        varying vec2 vUv;
        uniform float width;
        uniform float height;
        
        void main() {
            // vUv = uv;
            
            float OFFSET_X = 0.5;//0.5;
            float OFFSET_Y = 0.5;//0.5;
             
            vec3 projection = vec3(position.x, position.y, 0.);
        
            vUv = vec2((projection.x) / height + OFFSET_X,
                (height + projection.y) / height - OFFSET_Y);

            vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
                    gl_Position = projectionMatrix * mvPosition;
        }
        ` ;

        const myFragmentShader = `
        uniform sampler2D texture1;
        varying vec2 vUv;
        
             void main() {
             // gl_FragColor = vec4(0,0,1, 1);
             gl_FragColor = texture2D(texture1, vUv);
        }
        `;


        const uniforms = {
            width: {
                type: 'f',
                value: bounds.width
            },
            height: {
                type: 'f',
                value: bounds.height
            },
            texture1: {
                type: "t",
                value: THREE.ImageUtils.loadTexture( "../img/radial.png" )
            }
        };

        const material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: myVertexShader,
            fragmentShader: myFragmentShader,
            side: THREE.DoubleSide,
        });

        const materials = this.viewer.impl.matman();

        materials.removeMaterial("MyTextureShaderMaterial");

        materials.addMaterial(
            "MyTextureShaderMaterial",
            material,
            true);

        viewer.impl.invalidate(true);

        return material;
    }

    getBounds(fragId) {

        let bBox = new THREE.Box3();
        this.viewer.model.getFragmentList()
            .getWorldBounds(fragId, bBox);

        const width = Math.abs(bBox.max.x - bBox.min.x);
        const height = Math.abs(bBox.max.y - bBox.min.y);
        const depth = Math.abs(bBox.max.z - bBox.min.z);

        // min is used to shift for the shader, the others are roof dimensions
        return {width: width, height: height, depth: depth, max: bBox.max, min: bBox.min};
    }
}

Autodesk.Viewing.theExtensionManager.registerExtension('HeatExtension',
    HeatExtension);
