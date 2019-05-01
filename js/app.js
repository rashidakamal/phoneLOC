var statusText = document.querySelector('#statusText');
var dials = [];

console.log("App is starting up");

statusText.addEventListener('click', function() {

    statusText.textContent = 'SCROLL FOR MORE';
    dials = [];
    bluetoothPhone.connect()
        .then(() => bluetoothPhone.startNotificationsDial().then(handleDial))
        .catch(error => {
            statusText.textContent = error;
        });

});


function handleDial(dial) {

    dial.addEventListener('characteristicvaluechanged', event => {

        var dial = bluetoothPhone.parseDial(event.target.value);
        statusText.innerHTML = dial.digitVal + ' &#x2764;' + 'rashida';

        dials.push(dial.digitVal);

        console.log(dial.digitVal);

    });
}

