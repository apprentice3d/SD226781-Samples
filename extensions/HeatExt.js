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
        this.getBounds = this.getBounds.bind(this);
        this.processSelection = this.processSelection.bind(this);


        this.vertexShader = `
              precision mediump float;
  
              attribute vec2 inPos;
              varying vec2 vertPos;
              
              void main()
              {
                  vertPos = inPos;
                  gl_Position = vec4( inPos.xy, 0.0, 1.0 );
              }
        ` ;

        this.fragmentShader = `
          precision mediump float;
 
          varying vec2 vertPos;
          uniform vec2 resolution;
          
             void main() {
                  vec2 pos_ndc = 2.0 * gl_FragCoord.xy / resolution.xy - 1.0;
                  float dist = length(pos_ndc);
                  
                  vec4 white = vec4(1.0, 1.0, 1.0, 1.0);
                  vec4 red = vec4(1.0, 0.0, 0.0, 1.0);
                  vec4 blue = vec4(0.0, 0.0, 1.0, 1.0);
                  vec4 green = vec4(0.0, 1.0, 0.0, 1.0);
                  float step1 = 0.0;
                  float step2 = 0.33;
                  float step3 = 0.66;
                  float step4 = 1.0;
                
                  vec4 color = mix(white, red, smoothstep(step1, step2, dist));
                  color = mix(color, blue, smoothstep(step2, step3, dist));
                  color = mix(color, green, smoothstep(step3, step4, dist));
                
                  gl_FragColor = color;
        }
        `;

    }

    load() {
        console.log('HeatExtension is loaded!');

        this.tree = this.viewer.model.getData().instanceTree;

        // this.viewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT,
        //     this.processSelection);

        document.addEventListener('click', this.processSelection);

        //Hide all room bodies
        this.viewer.hide(370);

        this.customize();

        return true;
    }
    unload() {
        console.log('HeatExtension is now unloaded!');
        this.viewer.impl.scene.remove(this.some_mesh);
        viewer.impl.sceneUpdated(true);
        viewer.impl.invalidate(true);

        document.removeEventListener('click', this.processSelection);
        // this.viewer.removeEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT,
        //     this.processSelection);

        return true;
    }

    processSelection(event) {
        let floorID = 269;
        let selection = this.viewer.getSelection();

        if(selection.length !== 0 && selection[0] === 269) {
            this.viewer.select(); //clear selection
            console.log(this.viewer.clientToWorld(event.clientX, event.clientY, true));

        }
        else {

        }
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

        this.myMaterial = this.createShaderMaterial(bounds);

        viewer.model.getFragmentList().setMaterial(floorFragmentID, this.myMaterial);

        viewer.impl.sceneUpdated(true);
        viewer.impl.invalidate(true);

    }


    createShaderMaterial(bounds) {

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
