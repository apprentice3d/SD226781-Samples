///////////////////////////////////////////////////////////////////////////////
// Tempreature Color extension, illustrating custom color materials applied
// to existing components
// by Denis Grigor, August 2018
//
///////////////////////////////////////////////////////////////////////////////

class TempColorExtension extends Autodesk.Viewing.Extension {
    constructor(viewer, options) {
        super(viewer, options);
        this.viewer = viewer;
        this.tree = null;

        this.rooms = [
            {
                "name": "Technical Support",
                "id": 372,
                "temperature": 24
            },
            {
                "name": "Accounting",
                "id": 374,
                "temperature": 26
            },
            {
                "name": "Back office",
                "id": 376,
                "temperature": 20
            },
            {
                "name": "Sales",
                "id": 378,
                "temperature": 24
            },
            {
                "name": "WC 1",
                "id": 380,
                "temperature": 24
            },
            {
                "name": "WC 2",
                "id": 382,
                "temperature": 24
            },
            {
                "name": "Training",
                "id": 372,
                "temperature": 19
            },

            {
                "name": "Salle principale",
                "id": 404,
                "temperature": 20
            },

            {
                "name": "Kitchen",
                "id": 412,
                "temperature": 24
            },

            {
                "name": "Meeting Room",
                "id": 414,
                "temperature": 19
            },

            {
                "name": "Training",
                "id": 402,
                "temperature": 25
            },

            {
                "name": "Board",
                "id": 400,
                "temperature": 17
            },

            {
                "name": "Development",
                "id": 398,
                "temperature": 30
            },

        ];

        this.colorPresets = [
            '#73CEFF',
            '#92CF00',
            '#FFF365',
            '#FFA923',
            '#FF1600'
        ];

        this.customMaterialList = [];

        this.minTemp = 19;
        this.maxTemp = 26;
        this.minColor = 0;
        this.maxColor = this.colorPresets.length - 1;


        this.customize = this.customize.bind(this);
        this.setupUI = this.setupUI.bind(this);
        this.createMaterial = this.createMaterial.bind(this);
        this.updateTemperatureColor = this.updateTemperatureColor.bind(this);
        this.mapTempToColor = this.mapTempToColor.bind(this);
    }

    load() {
        console.log('TempColorExtension is loaded!');

        this.customize();
        return true;
    }

    unload() {
        console.log('TempColorExtension is now unloaded!');

        return true;
    }

    customize() {

        this.tree = this.viewer.model.getData().instanceTree;

        // Start of custom code.
        this.setupUI();

        //prepare the customMaterialList
        this.colorPresets.forEach(color => this.customMaterialList.push(this.createMaterial(color)));

        this.updateTemperatureColor();
    }

    setupUI() {
        // info panel part
        let tempPanel = document.createElement('div');
        tempPanel.id = "tempPanel";
        // tempPanel.className = "infoPanel";
        tempPanel.style.cssText = `
            right: 25px;
            bottom: 155px;
            min-width: 220px;
            // height: 300px;
            
            position: absolute;
            z-index: 2;
            padding: 10px;
            background-color: '#B8C6D1';
            box-shadow: 0px 0px 12px #D1C7B8;
            color: black;
            `;


        tempPanel.innerHTML = `
        <h4 style='text-align: center; padding: 0; margin:0;'>Temperature Map</h4>
        <!--<hr>-->
        <img src="./img/tempMap.svg" alt="temperatureMap" style="margin-bottom: 5px; margin-left: 5px;">
        <!--<hr>-->
        <div style="max-height: 220px; overflow-y: scroll">
            <table id="roomList" style="list-style-type: none; padding-left: 0; padding-top: 0;">
            </table>
        </div>
        `;

        document.body.appendChild(tempPanel);
        this.roomList = document.getElementById("roomList");

        this.rooms.forEach((room) => {
            let roomElem = document.createElement("tr");
            roomElem.id = room.id;
            let roomName = document.createElement("td");
            roomName.style.cssText = `
            user-select:none;
            min-width: 150px;
            `;
            roomName.id = room.id;
            roomName.innerText = room.name;

            let roomTemp = document.createElement("td");
            roomTemp.innerHTML = room.temperature + "&deg;C";
            roomTemp.style.cssText = `
            padding: 5px;
            width: 40px;
            text-align:center;
            border-radius: 3px;
            background-color: ${(this.colorPresets[this.mapTempToColor(room.temperature)])}
            `;
            roomElem.appendChild(roomName);
            roomElem.appendChild(roomTemp);


            // roomElem.appendChild(document.createTextNode(`[${(room.name)}] ${(room.temperature)}`));
            roomElem.onclick = (event) => {
                this.viewer.select(parseInt(event.target.id));
                console.log("clicked: ", event.target.id);
            };
            this.roomList.appendChild(roomElem);
        })
    }

    updateTemperatureColor() {


        let viewer = this.viewer;

        // used to rescale and remove the z-fighting
        let scaleRatio = 0.995; // this was determined as optimal through visual inspection

        this.rooms.forEach(room => {

            let colorPosition = this.mapTempToColor(room.temperature);
            let temperatureMaterial = this.customMaterialList[colorPosition];

            this.tree.enumNodeFragments(room.id, (fragId) => {
                viewer.model.getFragmentList().setMaterial(fragId, temperatureMaterial);
                let fragProxy = viewer.impl.getFragmentProxy(viewer.model, fragId);

                // to rescale and remove the z-fighting
                fragProxy.scale = new THREE.Vector3(scaleRatio,scaleRatio,scaleRatio);


                fragProxy.updateAnimTransform();
            });
        });

        viewer.impl.invalidate(true);

    }

    createMaterial(color) {

        const material = new THREE.MeshPhongMaterial({
            side: THREE.DoubleSide,
            reflectivity: 0.0,
            flatShading: true,
            transparent: true,
            opacity: 0.5,
            color
        });

        const materials = this.viewer.impl.matman();

        materials.addMaterial(
            "MyCustomMaterial" + color.toString(),
            material,
            true);

        return material;
    }


    mapTempToColor(temperature) {

        // equation of mapping the temperature range on color range
        let colorPosition = Math.ceil(this.maxColor/(this.maxTemp - this.minTemp)*(temperature - this.minTemp));
        // assure that the colorPosition will be set to min/max if the temperature falls outside the temp interval
        colorPosition = Math.min(Math.max(colorPosition, this.minColor), this.maxColor);

        return colorPosition;
    }

}

Autodesk.Viewing.theExtensionManager.registerExtension('TempColorExtension',
    TempColorExtension);