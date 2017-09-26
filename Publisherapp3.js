const fs = require('fs');                                      //file system requiren (Dateien benutzen können)
const path = require('path');                                  //path (um mit Pfaden zu arbeiten)                                 //   require = lädt inhalt des modules
const moment = require('moment');
const ibmiotf = require('ibmiotf');                            //ibmiotf (das hat schon jemand geschrieben und wird hier benutzt)

const gatewayClient = new ibmiotf.IotfGateway({                  //neuer Client als IoT device mit mienem Acc und den nötigen Daten erzeugen
    org: '1emz12',
    id: 'ip.fortiss.laptop',
    domain: 'internetofthings.ibmcloud.com',                     //Daten aus dem erzeugten Gerät in Bluemix
    type: 'ip.fortiss.gateway',
    'auth-method': 'token',
    'auth-token': 'neLE+&rD!AHLKXm*95'
});

gatewayClient.connect();                                          // Funktion die sagt, bau ne Verbindung auf

const connectionHandler = () => {
    console.log('Gateway Connection to the IoT platform successfully established!');

    const directoryToWatch = process.argv[2];                    //process.argv = Argumente, mit denen das Programm aufgerufen wird = Array 0-node.exe, 1-name des scripts(app), alles danach ist das was der user übergibt, also an 3. Stelle der Ordnername zum watchen                        //Was ist process.argv[]

    let alreadyUploaded = [];                                   //ein Array mit den geuploadeten erstellt

    const watchHandler = (eventType, filename) => {                     //(eventType, filename) sind die parameter die die funktion entgegen nimmt "=>" <--- es ist eine funktion (aus der const filePath wird eine Funktion

        const filePath = path.join(directoryToWatch, filename);         // join --> nur zusammengefürt bringt es mich zur Datei und nicht nur zum Ordner, dazu benötigen wir das path modul von oben

        fs.access(filePath, fs.constants.R_OK, error => {               //Hier gucken wir ob die datei wirklich vorhanden ist//access überprüft ob wir die berechtigung haben davon zu lesen (wenn es nicht existieren würde, dann würden wir keine berechtigung haben)  ,   R_OK - überprüfen ob wir das lesen können
            if (error === null) {

                if (alreadyUploaded.indexOf(filePath) === -1) {            // liegt im array schon der/ein dateiname (filepath), wenn ja dann dann index >= 0       EIN Index von etwas was nicht im Array steht ist immer -1

                    const readHandler = (error, data) => {
                        if (error !== null) {                               //wenn es einen Fehler gibt dann throw error
                            throw error;
                        }

                        console.log(data);

                        const content = data.toString();                       // Daten werden in eine variable als String gespeichert //.toString ist ne funktion von Data => Data werden toString (zum String gewandelt)

                        console.log(content);

                        let obj;
                        try {
                            obj = JSON.parse(content);                         // Data-String zu einem JSO geparsed
                        } catch(e) {
                            return;
                        }

                        alreadyUploaded.push(filePath);                        //Dateipfad in Array speichern
                        console.log(filePath);


                        if (obj['Station name'] === 'Pick & Place temp sensor' || obj['Station Name'] === 'Pick & Place cover') {

                            const OutputStationPnP = {
                                '1': 'Conveyor Belt',
                                '2': 'Gripper Retraction',
                                '3': 'Gripper Extension',
                                '4': 'Horizontal Gripper Movement',
                                '5': 'Vacuum Control',
                                '6': 'Separator in the middle of conveyor',
                                '7': 'Conveyor Direction',
                                '8': 'Neighborhood Detection Sender',
                                '9': 'Start Indicator Light 1',
                                '10': 'Start Indicator Light 2',
                                '11': 'Indicator Light 1',
                                '12': 'Indicator Light 2',
                                '13': 'Signal Tower red light',
                                '14': 'Signal Tower yellow light',
                                '15': 'Signal Tower green light',
                                '16': 'nan',
                            };
                            const InputStationPnP = {
                                '1': 'End-of-Conveyor Sensor left',
                                '2': 'Gripper Retracted',
                                '3': 'Gripper Extended',
                                '4': 'Gripper at top Position',
                                '5': 'Vacuum created',
                                '6': 'Middle-of- Conveyor Sensor',
                                '7': 'End-of-Conveyor Sensor right',
                                '8': 'Neighborhood Detection Receiver',
                                '9': 'Start Button pressed',
                                '10': 'Stop Button NOT pressed',
                                '11': 'Manual Mode',
                                '12': 'Reset Button pressed',
                                '13': 'nan',
                                '14': 'nan',
                                '15': 'nan',
                                '16': 'nan',
                            };

                            if (obj.hasOwnProperty('Output')) {
                                for (let i = 0; i < obj.Output.length; i++) {
                                    obj.Output[i].Position = OutputStationPnP[obj.Output[i].Position];
                                }                                                                                               // Loop, das bei jeder Stelle des Output-Arrays die Information bei Position zu checken und entsprechend dann abgeändert
                            }
                            if (obj.hasOwnProperty('Input')) {
                                for (let i = 0; i < obj.Input.length; i++) {
                                    obj.Input[i].Position = InputStationPnP[obj.Input[i].Position];
                                }
                            }

                        }
                        else if (obj['Station name'] === 'sorting') {

                            obj['Station name'] = 'Sorting';

                            const OutputStationsSor = {
                                '1': 'switch 1 (left)',
                                '2': 'nan',
                                '3': 'switch 2 (middle)',
                                '4': 'nan',
                                '5': 'Stopper (next to metal & color sensor)',
                                '6': 'nan',
                                '7': 'switch 3 (right)',
                                '8': 'nan',
                                '9': 'nan',
                                '10': 'nan',
                                '11': 'nan',
                                '12': 'nan',
                                '13': 'Neighborhood Detection sender',
                                '14': 'Conveyor Belt',
                                '15': 'Conveyor Direction',
                                '16': 'nan',
                            };
                            const InputStationSor = {
                                '1': 'End-of-Conveyor Sensor left',
                                '2': 'Metal Detection Sensor',
                                '3': 'Color Detection Sensor',
                                '4': 'Workpiece Detector Slide',
                                '5': 'Switch 1 (left)',
                                '6': 'Switch 1 (left)',
                                '7': 'Switch 2 (middle)',
                                '8': 'Switch 2 (middle)',
                                '9': 'Switch 3 (right)',
                                '10': 'Switch 3 (right)',
                                '11': 'Neighborhood Detection Receiver',
                                '12': 'End-of-Conveyor Sensor right',
                                '13': 'nan',
                                '14': 'nan',
                                '15': 'nan',
                                '16': 'nan',
                            };

                            if (obj.hasOwnProperty('Output')) {
                                for (let i = 0; i < obj.Output.length; i++) {

                                    obj.Output[i].Position = OutputStationsSor[obj.Output[i].Position];
                                }
                                for (let i = 0; i < obj.Output.length; i++) {

                                    for (let j = 0; j < obj.Output[i].Values.length; j++) {

                                        obj.Output[i].Values[j].DeltaT = moment(parseInt(obj.Output[i].Values[j].DeltaT)).format('MMMM Do YYYY, h:mm:ss.SSS a');
                                        console.log(obj.Output[i].Values[j].DeltaT);

                                    }
                                }
                            }
                            if (obj.hasOwnProperty('Input')) {
                                for (let i = 0; i < obj.Input.length; i++) {

                                    obj.Input[i].Position = InputStationSor[obj.Input[i].Position];
                                }

                                //Hier wird deltaT zu einer richtigen Zeit
                                for (let i = 0; i < obj.Input.length; i++) {

                                    for (let j = 0; j < obj.Input[i].Values.length; j++) {

                                        obj.Input[i].Values[j].DeltaT = moment(parseInt(obj.Input[i].Values[j].DeltaT)).format('MMMM Do YYYY, h:mm:ss.SSS a');
                                        console.log(obj.Input[i].Values[j].DeltaT);
                                    }
                                }
                            }

                        }

                        //console.log(obj);

                        //---------------
                        console.log('Sending event...');

                        gatewayClient.publishGatewayEvent('info', 'json', obj);                      // Publish = Daten werden an die Platform gesendet //info=Name des Events, json=Typ der Daten, content= Inhalt     (???? Woher kommen die Sachen, die in der Klammer stehen?)

                    };

                    fs.readFile(filePath, readHandler);                 //File lesen, wenn du fertig bist ruf die Funktion readHandler auf mit den Daten die du herausgefunden hast
                }
            }
        });
    };

    fs.watch(directoryToWatch, watchHandler);        //Beginn Folder Watcher >> Ordner den ich anschaue >> Event (=änderung Datei), das würd von .watch definiert  >> Action //Aus dem fs module ruf ich die watch funktion auf (Direktion)( Callback = Funktion die AUfgerufen wird wenn eine änderung aufgerufen wird
};

gatewayClient.on('connect', connectionHandler); //Wenn connected dann connection handler
