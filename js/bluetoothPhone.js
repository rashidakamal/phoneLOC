// based on Jiwon's beautiful code for our pComp final: https://github.com/js6450/MusicBetweenUs
// and the Heart Rate Monitor example: https://webbluetoothcg.github.io/web-bluetooth/#standardized-uuids

// Heavily based on: https://github.com/WebBluetoothCG/demos/blob/gh-pages/heart-rate-sensor/

(function() {

	'use strict';

	class BluetoothPhone{

		constructor(){

			this.device = null;
			this.server = null;
			this.dialData = [];
			this.primaryService = '6e400001-b5a3-f393-e0a9-e50e24dcca9e'; 
			this.txCharacteristic = '6e400003-b5a3-f393-e0a9-e50e24dcca9e'; 

			// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
			this._characteristics = new Map();

		}

		// Connect & get characteristics: 
		// https://googlechrome.github.io/samples/web-bluetooth/get-characteristics.html?service=generic_access

		connect() {

			console.log('Requesting bluetooth device...');
			return navigator.bluetooth.requestDevice({

				filters: [{ name: "Bluefruit LOC Phone"}],
				optionalServices: [this.primaryService]

			})
			.then(device => {
				
				console.log('Connecting to GATT server...'); 
				this.device = device;
				return device.gatt.connect();

				}).then(server => {
		        
					console.log('Getting service...'); 
		        	this.server = server;
		        	return Promise.all([
		          	server.getPrimaryService(this.primaryService)

		          	.then(service => {

		          			console.log('Getting characteristics...'); 
		            		return Promise.all([

		             			this._cacheCharacteristic(service, this.txCharacteristic)
		              		])
		          	})
		        	]);
				})
			.catch(error => {

				console.log("Could not connect: " + error);

			}) // end of catch

    	} // end of connect()


		startNotificationsDial() {
			// hopefully that works, otherwise maybe pass in the UUID? 
			return this._startNotifications(this.txCharacteristic);
		}
		stopNotificationsDial() {
			return this._stopNotifications(this.txCharacteristic);
		}


		parseDial(value) {

			// In Chrome 50+, a DataView is returned instead of an ArrayBuffer.
			value = value.buffer ? value : new DataView(value);

			let flags = value.getUint8(0);
			let rate16Bits = flags & 0x1;

			let result = {};
			let index = 0;

			let edited_val = value.getUint8(index);

			result.digitVal = String.fromCharCode(edited_val)

			return result;
    	}


    	/* Utils */
    	_cacheCharacteristic(service, characteristicUuid) {
      		return service.getCharacteristic(characteristicUuid)

      		.then(characteristic => {
        		this._characteristics.set(characteristicUuid, characteristic);
      		});
    	}


    	_readCharacteristicValue(characteristicUuid) {

			let characteristic = this._characteristics.get(characteristicUuid);
			return characteristic.readValue()

			.then(value => {

				console.log(value);
				// In Chrome 50+, a DataView is returned instead of an ArrayBuffer.
				value = value.buffer ? value : new DataView(value);
				return value;
			});
    	}


    	_startNotifications(characteristicUuid) {

			let characteristic = this._characteristics.get(characteristicUuid);
			// Returns characteristic to set up characteristicvaluechanged event
			// handlers in the resolved promise.
			return characteristic.startNotifications()

			.then(() => characteristic);
		}


    	_stopNotifications(characteristicUuid) {

			let characteristic = this._characteristics.get(characteristicUuid);
			// Returns characteristic to remove characteristicvaluechanged event
			// handlers in the resolved promise.

			return characteristic.stopNotifications()
			.then(() => characteristic);
    	}	

    } // end of class


	window.bluetoothPhone = new BluetoothPhone();


})();