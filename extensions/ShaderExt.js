///////////////////////////////////////////////////////////////////////////////
// Shader Extension, illustrating simple custom shaders
// by Denis Grigor, October 2018
//
///////////////////////////////////////////////////////////////////////////////

class ShaderExtension extends Autodesk.Viewing.Extension {
    constructor(viewer, options) {
        super(viewer, options);
        this.viewer = viewer;
        this.tree = null;
        this.myMaterial = null;
        this.some_mesh = null;

        this.customize = this.customize.bind(this);
        this.addMesh = this.addMesh.bind(this);
        this.createShaderMaterial = this.createShaderMaterial.bind(this);
        this.createTexturedShaderMaterial = this.createTexturedShaderMaterial.bind(this);



        this.vertexShader = `
            varying vec3 fNormal; 
            void main() {
            
            fNormal = normal;
            vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
				gl_Position = projectionMatrix * mvPosition;
        }
        ` ;

        this.fragmentShader = `
            varying vec3 fNormal;
             void main() {
             // gl_FragColor = vec4(1,0,1, 1);
             gl_FragColor = vec4(fNormal, 1);
        }
        `;

    }

    load() {
        console.log('ShaderExtension is loaded!');
        this.tree = this.viewer.model.getData().instanceTree;

        this.viewer.setBackgroundColor(255,255,255,255,255,255);
        this.viewer.setEnvMapBackground(false);
        this.viewer.setGroundShadow(true);
        this.viewer.setGroundReflection(true);
        this.viewer.setTheme("light-theme");




        //Hide all room bodies
        this.viewer.hide(370);

        this.addMesh();
        // this.customize();

        return true;
    }
    unload() {
        console.log('ShaderExtension is now unloaded!');
        this.viewer.impl.scene.remove(this.some_mesh);
        viewer.impl.sceneUpdated(true);
        viewer.impl.invalidate(true);


        return true;
    }

    customize() {

        //Start custom code here ...
        let viewer = this.viewer;
        let floorFragmentID = 0;



        let floorBox = new THREE.Box3();
        this.viewer.model.getFragmentList()
            .getWorldBounds(floorFragmentID, floorBox);

        const width = Math.abs(floorBox.max.x - floorBox.min.x);
        const height = Math.abs(floorBox.max.y - floorBox.min.y);

        // min is used to shift for the shader, the others are roof dimensions
        let bounds =  {
            width: width,
            height: height};

        // this.myMaterial = this.createShaderMaterial();
        this.myMaterial = this.createTexturedShaderMaterial(bounds);

        viewer.model.getFragmentList().setMaterial(floorFragmentID, this.myMaterial);

        viewer.impl.sceneUpdated(true);
        viewer.impl.invalidate(true);

    }

    addMesh() {

        //Start custom code here ...
        let viewer = this.viewer;

        this.myMaterial = this.createShaderMaterial();
        // this.myMaterial = this.createTexturedShaderMaterial({width: 30, height: 15});

        let geometry = new THREE.BoxGeometry(30, 15, 0.1);

        this.some_mesh = new THREE.Mesh(geometry, this.myMaterial);
        this.some_mesh.position.y = 27;
        this.some_mesh.position.z = 10;
        this.some_mesh.rotation.x = Math.PI/2;

        viewer.impl.scene.add(this.some_mesh);

        viewer.impl.sceneUpdated(true);

    }


    createShaderMaterial() {

        const material = new THREE.ShaderMaterial({
            vertexShader: this.vertexShader,
            fragmentShader: this.fragmentShader,
            side: THREE.DoubleSide,
            transparent: true,
        });

        const materials = this.viewer.impl.matman();

        materials.addMaterial(
            "MyCustomShaderMaterial",
            material,
            true);

        return material;
    }


    createTexturedShaderMaterial(bounds) {

        const myVertexShader =  `
        varying vec2 vUv;
        uniform float width;
        uniform float height;
        
        void main() {
            // vUv = uv;
            
            float OFFSET_X = 0.5;
            float OFFSET_Y = 0.5;
             
            vec3 projection = vec3(position.x, position.y, 0.);
        
            vUv = vec2((projection.x) / width + OFFSET_X,
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
                value: THREE.ImageUtils.loadTexture( "../img/plan.png" )
            }
        };

        const material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: myVertexShader,
            fragmentShader: myFragmentShader,
            side: THREE.DoubleSide,
        });

        const materials = this.viewer.impl.matman();

        materials.addMaterial(
            "MyTextureShaderMaterial",
            material,
            true);

        viewer.impl.invalidate(true);

        return material;
    }





}

Autodesk.Viewing.theExtensionManager.registerExtension('ShaderExtension',
    ShaderExtension);
