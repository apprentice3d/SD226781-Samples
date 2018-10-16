AutodeskNamespace('Autodesk.Viewing.Extensions.WebVR');

var avp = Autodesk.Viewing.Private;

Autodesk.Viewing.Extensions.WebVR.StereoRenderContext = function(_vrDisplay, camera, HUD, toolConfig) {



    var _vrDisplay; //holds the VR device object info supported by webVR
    var _context;
    var _renderer;
    var _w, _h;
    var pose;
    var RADIUS = 2.1;


    var leftEyeParams = _vrDisplay.getEyeParameters("left");
    var rightEyeParams = _vrDisplay.getEyeParameters("right");
    var eyeTranslationL = new THREE.Vector3();
    var eyeTranslationR = new THREE.Vector3();
    var cameraL = new THREE.PerspectiveCamera();
    var cameraR = new THREE.PerspectiveCamera();

    var _standing = false;
    var _userHeight = 0.5;
    var _scale = 10.0 * _vrDisplay.modelScaleFactor; // scale factor 10.0 of a 'toy house'.  Make a UI for this.

    var frameData = null;

    this.init = function(renderer, width, height) {
        _context = new avp.RenderContext();
        _renderer = renderer;

        var dpr = window.devicePixelRatio * 1.5;
        _w = _vrDisplay.getEyeParameters("left").renderWidth * 2 / dpr;
        _h = _vrDisplay.getEyeParameters("right").renderHeight / dpr;

        this.settings = _context.settings;
        _context.init(_renderer, _w, _h);
        eyeTranslationL.fromArray(leftEyeParams.offset);
        eyeTranslationR.fromArray(rightEyeParams.offset);

        frameData = new VRFrameData();

        if (camera.worldup && camera.worldup.z == 1)
            toolConfig.webVR_orbitModel = false;  // model is not fusion, switch to walkthrough mode
    };

    this.modeFusion = function(pose) {
        var position = new THREE.Vector3(0, 0, 1);
        position.applyQuaternion(new THREE.Quaternion().fromArray(pose.orientation)).multiplyScalar(_scale * RADIUS);
        camera.position.set(position.x, position.y, position.z);
        camera.lookAt(_vrDisplay.target); // compute quaternion
        //camera.quaternion.z = pose.orientation[2];  // roll camera based on head tilt
        camera.up.set(0, 1, 0); // override touch events
    };

    this.modeWalkthrough = function(pose) {
        if (pose.orientation && pose.orientation[1] != 0)
            camera.quaternion.fromArray(pose.orientation);
        if (pose.position && pose.position[0] != 0)
            camera.position.fromArray(pose.position).multiplyScalar(_scale);

        // adjust for alternate worldup
        if (camera.worldup && camera.worldup.z == 1) {
            camera.quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2);
            camera.quaternion.multiply(new THREE.Quaternion().fromArray(pose.orientation));
            if (pose.position && pose.position[0] != 0)
                camera.position.set(camera.position.x, -camera.position.z, camera.position.y);
        }
        // adjust camera target
        var lookAtDir = new THREE.Vector3(0, 0, -1);
        lookAtDir.applyQuaternion(camera.quaternion);
        camera.target = camera.position.clone().add(lookAtDir.clone().multiplyScalar(10));
    };

    this.updateCamera = function() {
        if (!(_vrDisplay && _vrDisplay._isPresenting)) return;

        // set position and orientation
        _vrDisplay.depthNear = camera.near;
        _vrDisplay.depthFar = camera.far;
        _vrDisplay.getFrameData(frameData);

        pose = frameData.pose;
        if (!pose.orientation) return;

        if (toolConfig.webVR_orbitModel)
            this.modeFusion(pose);
        else
            this.modeWalkthrough(pose);

        if (_standing) //MB: perhaps add configurable user height option in settings menu
            camera.position.setY(camera.position.y + _userHeight);
        //_vrDisplay.stageParameters.sittingToStandingTransform;

        camera.updateMatrixWorld();
        camera.dirty = true;

        getStereoCamera(camera, frameData, true, false, cameraL);
        getStereoCamera(camera, frameData, false, false, cameraR);

        if (HUD) {

            HUD.camera = camera.clone();
            HUD.camera.position.set(0 ,0, 0);

            getStereoCamera(camera, frameData, true, true, HUD.cameraL);
            getStereoCamera(camera, frameData, false, true, HUD.cameraR);
        }

        return {L:cameraL, R:cameraR, C:camera}
    };

    this.beginScene = function(prototypeScene, _camera, customLights, needClear) {
        _context.beginScene(prototypeScene, camera, customLights, needClear);
    };


    this.renderScenePart = function(scene, want_colorTarget, want_saoTarget, want_idTarget, want_highlightTarget, updateLights) {

        var halfW = _w / 2;

        _renderer.setViewport(0, 0, halfW, _h);
        _context.setCamera(cameraL);
        _context.renderScenePart(scene, true, false, false, 0, false);

        _renderer.setViewport(halfW, 0, halfW, _h);
        _context.setCamera(cameraR);
        _context.renderScenePart(scene, true, false, false, 0, false);

        if (HUD) {

            _renderer.setViewport(0, 0, halfW, _h);
            _context.setCamera(HUD.cameraL);
            _context.renderScenePart(HUD.scene, true, false, false, 0, false);

            _renderer.setViewport(halfW, 0, halfW, _h);
            _context.setCamera(HUD.cameraR);
            _context.renderScenePart(HUD.scene, true, false, false, 0, false);
        }

        _renderer.setViewport(0, 0, _w, _h);
    };

    this.sceneDirty = function(camera, bbox) {
        _context.sceneDirty(camera, bbox);
    };

    //TODO: get rid of this and combine it with composeFinalFrame
    this.endScene = function() {
        _context.endScene();
    };

    this.clearAllOverlays = function() {};

    this.renderOverlays = function(overlays) {
        // disabled, due to performance hit on mobile
    };

    this.composeFinalFrame = function(skipAOPass, skipPresent) {
        _context.composeFinalFrame(true, skipPresent);
        if (_vrDisplay._isPresenting) _vrDisplay.submitFrame();
    };

    this.cleanup = function() {
        _context.cleanup();
    };

    this.setSize = function(w, h, force) {
        _w = w;
        _h = h;
        _context.setSize(_w, _h, force);
    };

    this.getMaxAnisotropy = function() {
        return _context.getMaxAnisotropy();
    };

    this.hasMRT = function() {
        return _context.hasMRT();
    };

    this.initPostPipeline = function(useSAO, useFXAA, useIDBuffer) {
        _context.initPostPipeline(false, false, false);
    };

    this.setClearColors = function(colorTop, colorBot) {
        _context.setClearColors(colorTop, colorBot);
    };

    this.setAOOptions = function(radius, intensity) {
        _context.setAOOptions(radius, intensity);
    };

    this.getAORadius = function() {
        return _context.getAORadius();
    };

    this.getAOIntensity = function() {
        return _context.getAOIntensity();
    };

    this.setTonemapExposureBias = function(bias) {
        _context.setTonemapExposureBias(bias);
    };

    this.getExposureBias = function() {
        return _context.getExposureBias();
    };

    this.setTonemapMethod = function(value) {
        _context.setTonemapMethod(value);
    };

    this.getToneMapMethod = function() {
        return _context.getToneMapMethod();
    };

    this.toggleTwoSided = function(isTwoSided) {
        _context.toggleTwoSided(isTwoSided);
    };

    this.enter2DMode = function(idMaterial) {
        _context.enter2DMode(idMaterial);
    };

    this.getAOEnabled = function() {
        return false
    };

    this.idAtPixel = function(vpx, vpy) {
        // idAtPixel not implemented in stereo context
        return 0;
    };

    this.setHighlightLights = function(customLights) {
        // Nothing
    };

    this.setStencilEnabled = function(enabled) {
        // Nothing
    };

    this.overlayUpdate = function(highResTimer) {
        _context.overlayUpdate(highResTimer);
    };

    this.rolloverObjectViewport = function(vpx, vpy) {};

    this.screenCapture = function() {
        console.warn("Screen capture not implemented by stereo render context");
        return null;
    };

    this.setUnitScale = function(metersPerUnit) {
        _context.setUnitScale(metersPerUnit);
    };

    this.getUnitScale = function() {
        return _context.getUnitScale();
    };

    // TODO_NOP: hack expose colorTarget so shadow/reflection can draw into
    this.getColorTarget = function() {
        return null;
    };

    function getStereoCamera(camera, frameData, leftEye, fixed, result) {

        // Copy world transform and move camera to origin if it's fixed.
        camera.matrixWorld.decompose(result.position, result.quaternion, result.scale);
        if (fixed) {
            result.position.set(0, 0, 0);
        }

        // Translate eye bye scene scaling.
        result.translateOnAxis(leftEye ? eyeTranslationL : eyeTranslationR, _scale);

        // Copy projection matrix.
        result.projectionMatrix.elements =
            leftEye ? frameData.leftProjectionMatrix : frameData.rightProjectionMatrix;

    }
};
//
// WebVR extension (both Toolbar icon and mode)
//

'use strict';

AutodeskNamespace('Autodesk.Viewing.Extensions.WebVR');

/**
 * First Person navigation tool, similar to those found in videogames.
 *
 * It will also replace the default walk tool button when {@link Autodesk.Viewing.GuiViewer3D} is present.
 * @constructor
 * @extends {Autodesk.Viewing.Extension}
 * @param {Autodesk.Viewing.Viewer3D} viewer - Viewer instance.
 * @param {object} options - Not used.
 */

Autodesk.Viewing.Extensions.WebVR.VRExtension = function(viewer, options) {
    Autodesk.Viewing.Extension.call(this, viewer, options);
    this.name = 'webvr';
};

/**
 * Static function internally used that provides info on what are the configuration options
 * available to this extension.
 * @private
 */
Autodesk.Viewing.Extensions.WebVR.VRExtension.populateDefaultOptions = function(options) {
    // Use double-dashes to prevent flag from being active by default while still surfacing them out (cuz why not)
    options.experimental.push('--webVR_orbitModel');
    options.experimental.push('--webVR_cursor');
    options.experimental.push('--webVR_menu');
};

Autodesk.Viewing.Extensions.WebVR.VRExtension.prototype = Object.create(Autodesk.Viewing.Extension.prototype);
Autodesk.Viewing.Extensions.WebVR.VRExtension.prototype.constructor = Autodesk.Viewing.Extensions.WebVR.VRExtension;

var proto = Autodesk.Viewing.Extensions.WebVR.VRExtension.prototype;

proto.load = function() {
    var self = this;
    var _vrDisplay = null;

    avp.injectCSS('extensions/WebVR/WebVR.css');

    // check if browser supports webVR1.1 natively, if not, load polyfill
    avp.loadDependency('VRFrameData', 'webvr-polyfill.min.js', function() {
        navigator.getVRDisplays().then(function(displays) {
            if (displays.length > 0) {
                _vrDisplay = displays[0];
                if (_vrDisplay.capabilities.canPresent) {

                    // VR detected, add the 'VR button'
                    var viewer = self.viewer;
                    var toolbar = viewer.getToolbar(true);
                    var avu = Autodesk.Viewing.UI;

                    // Register tool
                    self.tool = new Autodesk.Viewing.Extensions.WebVR.VRTool(viewer, self, _vrDisplay);
                    viewer.toolController.registerTool(self.tool);
                    self.createUI(toolbar);

                    // Register listeners
                    self.onToolChanged = function(e) {
                        var vrToolActive = (e.toolName === 'vr') && e.active;
                        var state = vrToolActive ? avu.Button.State.ACTIVE : avu.Button.State.INACTIVE;
                        self.vrToolButton && self.vrToolButton.setState(state);
                    };
                    viewer.addEventListener(Autodesk.Viewing.TOOL_CHANGE_EVENT, self.onToolChanged);
                    return;
                }
            }
            avp.logger.warn('Attempted to load WebVR extension, but WebVR is not supported.');
        });
    });

    return true;
};

proto.createUI = function(toolbar) {
    var self = this;
    var viewer = this.viewer;
    var avu = Autodesk.Viewing.UI;
    var navTools = toolbar.getControl(Autodesk.Viewing.TOOLBAR.NAVTOOLSID);

    // Create a button for the VR Tool.
    this.vrToolButton = new avu.Button('toolbar-vrTool');
    this.vrToolButton.setToolTip('Enable VR mode');
    this.vrToolButton.setIcon("adsk-icon-webvr");
    this.vrToolButton.onClick = function(e) {
        var state = self.vrToolButton.getState();
        if (state === avu.Button.State.INACTIVE) {
            self.activate();
        } else if (state === avu.Button.State.ACTIVE) {
            self.deactivate();
        }
    };

    var cameraSubmenuTool = navTools.getControl('toolbar-cameraSubmenuTool');
    if (cameraSubmenuTool) {
        navTools.addControl(this.vrToolButton, {
            index: navTools.indexOf(cameraSubmenuTool.getId())
        });
    } else {
        navTools.addControl(this.vrToolButton);
    }
};

proto.unload = function() {
    var viewer = this.viewer;

    // Remove listeners
    if (this.onToolChanged) {
        viewer.removeEventListener(Autodesk.Viewing.TOOL_CHANGE_EVENT, this.onToolChanged);
        this.onToolChanged = undefined;
    }

    // Remove the UI
    var toolbar = viewer.getToolbar(false);
    if (toolbar && this.vrToolButton) {
        toolbar.getControl(Autodesk.Viewing.TOOLBAR.NAVTOOLSID).removeControl(this.vrToolButton.getId());
    }
    this.vrToolButton = null;

    // Deregister tool
    if (this.tool) {
        viewer.toolController.deregisterTool(this.tool);
        this.tool = null;
    }

    return true;
};

proto.activate = function () {
    if(!this.activeStatus) {
        this.viewer.setActiveNavigationTool("vr");
        this.activeStatus = true;
    }
    return true;
};

proto.deactivate = function () {
    if(this.activeStatus) {
        this.viewer.setActiveNavigationTool();
        this.activeStatus = false;
    }
    return true;
};

Autodesk.Viewing.theExtensionManager.registerExtension('Autodesk.Viewing.WebVR', Autodesk.Viewing.Extensions.WebVR.VRExtension);


///////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////

Autodesk.Viewing.Extensions.WebVR.VRTool = function(viewer, vrExtension, _vrDisplay) {
    var _canvas = viewer.canvas;
    var _navapi = viewer.navigation;
    var _camera = _navapi.getCamera();
    var _stereoRenderContext, _HUD;
    var toolConfig = {
        webVR_cursor : avp.isExperimentalFlagEnabled('webVR_cursor', vrExtension.options),
        webVR_menu : avp.isExperimentalFlagEnabled('webVR_menu', vrExtension.options),
        webVR_orbitModel : avp.isExperimentalFlagEnabled('webVR_orbitModel', vrExtension.options)
    };

    // VR state
    var _names = ["vr"];
    var _isActive = false;
    var _isPresenting = false;

    this.activate = function(name) {
        _isActive = true;

        // prepare camera for VR mode
        viewer.impl.toggleGroundShadow(false);
        viewer.impl.toggleGroundReflection(false);
        _navapi.toPerspective();
        _navapi.setVerticalFov(75, true); // same as firstPerson FOV
        _navapi.setRequestFitToView(true);

        // Calculate a model scale factor based on the model bounds.
        var boundsSize = viewer.model.getBoundingBox().size();
        _vrDisplay.target = viewer.model.getBoundingBox().center();
        _navapi.setPivotPoint(_vrDisplay.target, true, true);
        _navapi.setView(_camera.position, _vrDisplay.target);
        _navapi.setCameraUpVector(new THREE.Vector3(0, 1, 0));
        _vrDisplay.modelScaleFactor = Math.max(Math.min(Math.min(boundsSize.x, boundsSize.y), boundsSize.z) / 10.0, 0.0001);

        // Request webVR full screen
        _vrDisplay._isPresenting = av.isMobileDevice();
        _vrDisplay.requestPresent([{
            source: _canvas
        }]).then(function() {
            viewer.impl.setLmvDisplay(_vrDisplay);
            _vrDisplay._isPresenting = true;
            //viewer.resize(viewer.canvas.clientWidth, viewer.canvas.clientHeight);
        });
        _vrDisplay.resetPose();

        // handle fullscreen on mobile/cardboard differently.  Add 'exit VR' button and hide toolbar
        if (av.isMobileDevice()) {
            var self = this;
            showHUD(false);
            viewer.setScreenMode(Autodesk.Viewing.ScreenMode.kFullScreen);
            _canvas.addEventListener("dblclick", function() {
                if (_isActive)
                    viewer.setActiveNavigationTool();
            });
        }
        if (toolConfig.webVR_cursor || toolConfig.webVR_menu)
            _HUD = this.initHUD();

        _stereoRenderContext = new Autodesk.Viewing.Extensions.WebVR.StereoRenderContext(_vrDisplay, _camera, _HUD, toolConfig);
        viewer.impl.setUserRenderContext(_stereoRenderContext);
    };

    this.initHUD = function() {
        // Create HUD overlay scene and camera
        var scene = new THREE.Scene();
        var HUDCamera = _camera.clone();

        //    new THREE.PerspectiveCamera(_camera.fov, _camera.aspect * 0.5, 0.1, 2000);
        //    HUDcamera.position.set(0, 0, 0);
        //    scene.add(HUDcamera);

        if (toolConfig.webVR_menu) {
            // Add menu and cursor to the HUD scene
            var menu = new Autodesk.Viewing.Extensions.WebVR.Menu(_vrDisplay.modelScaleFactor);
            menu.init(scene);
        }

        if (toolConfig.webVR_cursor) {
            var camYup = (_camera.worldup && _camera.worldup.z == 1);
            var cursor = new Autodesk.Viewing.Extensions.WebVR.Cursor(viewer.impl, viewer.autocam, _vrDisplay.modelScaleFactor, camYup);
            cursor.init(scene);
            _canvas.addEventListener("click", cursor.onClick);
        }

        return {
            scene: scene,
            camera: HUDCamera,
            cameraL: HUDCamera.clone(),
            cameraR: HUDCamera.clone(),
            menu: menu,
            cursor: cursor,
            IPD: 1.2
        }
    }

    this.update = function(timeStamp) {

        if (!_vrDisplay) {
            return true;
        }

        if (_isPresenting && !_vrDisplay.isPresenting && _isActive) {
            viewer.setActiveNavigationTool();
        }
        _isPresenting = _vrDisplay.isPresenting;

        var cam = _stereoRenderContext.updateCamera();
        if (!_HUD) return true;

        if (toolConfig.webVR_cursor)
            _HUD.cursor.update(cam.C, _HUD);

        if (toolConfig.webVR_menu)
            _HUD.menu.update(_HUD.camera);

        return true;
    };

    this.deactivate = function(name) {
        if (_vrDisplay) {
            if (_vrDisplay.isPresenting)
                _vrDisplay.exitPresent(); // Stops VR mode
            _vrDisplay._isPresenting = false;
        }
        _isActive = false;
        showHUD(true);

        viewer.impl.setUserRenderContext(null);
        viewer.setScreenMode(Autodesk.Viewing.ScreenMode.kNormal);
        viewer.resize(viewer.canvas.clientWidth, viewer.canvas.clientHeight);
        viewer.autocam.resetHome();
        if (_HUD && toolConfig.webVR_cursor)
            _canvas.removeEventListener("click", _HUD.cursor.onClick);
    };

    var showHUD = function(isVisible) {
        // Show/hide the toolbar (don't show when in mobile)
        viewer.displayViewCubeUI(isVisible);
        viewer.displayViewCube(isVisible && !av.isMobileDevice());

        var tbar = document.getElementsByClassName('adsk-toolbar');
        if (tbar.length > 0) { // HACK: Assume only 1
            if (tbar[0] !== '')
                tbar[0].style.display = isVisible ? 'block' : 'none';
        }
    };

    this.isActive = function() {
        return _isActive;
    };

    this.getNames = function() {
        return _names;
    };

    this.getName = function() {
        return _names[0];
    };
};
Autodesk.Viewing.Extensions.WebVR.Menu = function(_scale) {
    var DEFAULT_COLOR = 0xffffff; // default color of menu items
    var YOFFSET = -12;
    var DEPTH = -14;

    var _menu, menuAnchor, menuRotOffset;
    var prevMenuIdx;

    this.init = function(scene) {
        if (_menu) return;

        var getResourceUrl = Autodesk.Viewing.Private.getResourceUrl;
        var imgLoader = THREE.ImageUtils;
        imgLoader.crossOrigin = 'anonymous';
        var BASE_URL = "res/webvr/";
        var icons = [
            "back.png",
            "zoomin.png",
            "zoomout.png",
            "next.png"
        ];

        // position the menu so it is floating at waist level in front of the user
        _menu = new THREE.Object3D();
        menuAnchor = new THREE.Object3D();
        var menuOffset = new THREE.Object3D();
        menuOffset.position.set(0, YOFFSET, DEPTH);
        menuOffset.rotateX(-0.6);

        // create each menu item
        function createMenuItem(url, xScale, opacity) {
            return new THREE.Mesh(
                new THREE.PlaneBufferGeometry(xScale, 1),
                new THREE.MeshBasicMaterial({
                    map: imgLoader.loadTexture( getResourceUrl(url) ),
                    color: DEFAULT_COLOR,
                    side: THREE.DoubleSide,
                    depthTest: false,
                    transparent: true,
                    opacity: opacity
                })
            );
        }
        // horizontal menu layout
        for (var i = 0; i < icons.length; i++) {
            var item = createMenuItem(BASE_URL + icons[i], 2, 1);
            item.position.set(2 * (i - icons.length / 2), 0, 0.1);
            item.scale.set(0.94, 0.94, 0.1);
            menuOffset.add(item);
        };
        // add wide transparent black background for menu container
        var menuBg = createMenuItem(BASE_URL + "bg.png", 48, 0.1);
        menuOffset.add(menuBg);
        menuAnchor.add(menuOffset)
        _menu.add(menuAnchor);

        _menu.visible = true;
        scene.add(_menu);
    }

    this.onVisible = function(camera) {
        menuAnchor.rotation.y = camera.rotation._z;
        menuRotOffset = -_menu.quaternion.y;
    }

    this.update = function(camera) {
        // move menu based on camera orientation only
        var cam = camera.quaternion.clone().inverse();
        _menu.quaternion.copy(cam);

        // look down for menu to appear in front of user
        var tmp = _menu.visible;
        _menu.visible = (_menu.quaternion.x > 0.26) && (_menu.quaternion.x < 0.4);
        if (!tmp && _menu.visible)
            this.onVisible(camera);
        /*
        // fade in/out
        _menu.traverse(function(node) {
            if (node.material)
                node.material.opacity = (_menu.quaternion.x * _menu.quaternion.x) - 0.1;
        });
        */
        if ((prevMenuIdx >= 0) && (prevMenuIdx < 4)) {
            _menu.children[0].children[0].children[prevMenuIdx].material.color.setHex(DEFAULT_COLOR);
        }
        prevMenuIdx = Math.floor((menuRotOffset + _menu.quaternion.y + 0.14) * 4.54 * 4);
        if ((prevMenuIdx >= 0) && (prevMenuIdx < 4)) {
            _menu.children[0].children[0].children[prevMenuIdx].material.color.setHex(0xaaaaff);
        }
    };

    this.onClick = function() {
        // handle menu click
    }
};

Autodesk.Viewing.Extensions.WebVR.Cursor = function(viewerImpl, autocam, _scale, USE_YUP) {

    var STANDING_HEIGHT = 5;
    var DEFAULT_GREEN = 0x0022aa;
    var DEFAULT_RED = 0xaa0022;
    var _cursor;
    var hit;

    var USE_ANGLECURSOR = true;

    this.init = function(scene) {
        // Create Cursor
        _cursor = new THREE.Object3D();
        _cursor.scale.set(0.25, 0.25, 1);
        _cursor.add(new THREE.Mesh(
            new THREE.RingGeometry(.6, 1, 32, 32),
            new THREE.MeshBasicMaterial({
                color: DEFAULT_RED,
                depthTest: false,
                side: THREE.DoubleSide
            })
        ));

        scene.add(_cursor);
    };

    this.update = function(camera, hud) {

        var dist;

        // set cursor red, not available to move or to green otherwise
        hit = viewerImpl.hitTestViewport(new THREE.Vector3(), false);
        if (hit) {
            _cursor.children[0].material.color.setHex(DEFAULT_GREEN);
            dist = hit.intersectPoint.clone().sub(camera.position).length();
        } else {
            _cursor.children[0].material.color.setHex(DEFAULT_RED);
            dist = (camera.far - camera.near) * 0.5;
        }

        var matrix = new THREE.Matrix4();
        matrix.extractRotation(hud.camera.matrixWorld);

        var direction = new THREE.Vector3(0, 0, -1);
        direction = matrix.multiplyVector3(direction);
        direction.multiplyScalar(dist);

        _cursor.scale.set(_scale, _scale, _scale);
        _cursor.position.copy(direction);
        _cursor.lookAt(hud.camera.position);

        // orientate the cursor angle with the terrain and position it's distance
        // this technique reduces cursor jitter
        if (USE_ANGLECURSOR) {
            //        _cursor.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), hit.face.normal.clone().normalize());
            //        _cursor.quaternion.multiply(camera.quaternion);
            //        _cursor.quaternion.inverse();
            //_cursor.quaternion.y = 0;
        }

        // if (Math.round(hit.face.normal.x*10)/10 == -0.7) {}

    };

    this.onClick = function() {
        if (!hit) return;
        var hitpt = hit.intersectPoint;
        var hitangle = hit.face.normal;
        if (USE_YUP)
            hitpt.z += STANDING_HEIGHT;
        else
            hitpt.y += STANDING_HEIGHT;

        var view = autocam.getCurrentView();
        view.position.copy(hitpt);

        // optional: force walkthrough pivot effect, using existing nav controls (used within desktop browser)
        view.center.set(hitpt.x + 0.000001, hitpt.y, hitpt.z);
        view.pivot.set(hitpt.x, hitpt.y, hitpt.z);

        autocam.goToView(view);
    }
};