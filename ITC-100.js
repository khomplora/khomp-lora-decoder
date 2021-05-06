/**
* Decode an uplink message from a buffer (array) of bytes to an object of fields.
* If use ChirpStack, rename the function to "function Decode(port, bytes, variables)"
*/

function Decoder(bytes, port) {
    var i = 0;
    var decoded = {};
    var device = {};

    decoded.device = []; // vector to keep data after treatment

    switch (port) {
        //LoRaWAN port communication for ITC 100
        case 9:
            device.model = "ITC100";
            break;
        default:
            device.model = "unknow_model";
            return decoded;
    }

    // OPERATION MODE
    if (bytes[i++] === 0x4A) {
        device.mode = 'multi_mode';
    }
    else if (bytes[i] == 0x4B)
    {
        device.mode = 'digital_reflux_mode';
    }
    else {
        device.mode = 'single_mode';
    }

    // BIT STATUS
    // Message type

    decoded.message = [];
    var message = {};

    if ((bytes[i] >> 6) === 0x00) // 00
    {
        message.type = 'normal_report';
    } else if ((bytes[i] >> 6) === 0x01) // 01
    {
        message.type = 'fraud_report';
    } else if ((bytes[i] >> 6) === 0x02) // 10
    {
        message.type = 'tamper_fraud_report';
    } else if ((bytes[i] >> 6) === 0x03) // 11
    {
        message.type = 'ack_configuration';
    }

    // Fraud detection
    var frauddec = {};
    decoded.frauddec = [];
    if (((bytes[i] >> 5) & 0x01) === 0x00) {
        frauddec.fraud = 'no_fraud';
    } else {
        frauddec.fraud = 'fraud_detected';
    }

    // Tamper Fraud detection
    var tamper = {};
    decoded.tamper = [];
    if (((bytes[i] >> 4) & 0x01) === 0x00) {
        tamper.state = 'tamper_closed';
    } else {
        tamper.state = 'tamper_open';
    }

    // Resolution
    var resol = {};
    decoded.resol = [];

    if (((bytes[i] >> 1) & 0x03) === 0x00) {
        resol.n = 'count_resolution_not_configured';
        resol.v = '';
        resol.u = 'l';
    } else if (((bytes[i] >> 1) & 0x03) === 0x01) {
        resol.n = 'count_resolution';
        resol.v = 1.0;
        resol.u = 'l';
    } else if (((bytes[i] >> 1) & 0x03) === 0x02) {
        resol.n = 'count_resolution';
        resol.v = 10.0;
        resol.u = 'l';
    } else if (((bytes[i] >> 1) & 0x03) === 0x03) {
        resol.n = 'count_resolution';
        resol.v = 100.0;
        resol.u = 'l';
    } else if (((bytes[i] >> 1) & 0x03) === 0x04) {
        resol.n = 'count_resolution';
        resol.v = 1000.0;
        resol.u = 'l';
    } else if (((bytes[i] >> 1) & 0x03) === 0x05) {
        resol.n = 'count_resolution';
        resol.v = 10000.0;
        resol.u = 'l';
    }
    i++;

    // BATTERY
    decoded.voltage = [];
    var voltage = {};

    voltage.n = 'battery';
    voltage.v = ((bytes[i++]) / 10.0).toFixed(1);
    voltage.u = 'V';

    // FIRMWARE
    var conv = parseInt(((bytes[i++] << 8) | bytes[i++]));
    device.firmware = (conv / 1000).toFixed(0) + '.' + ((conv % 1000) / 100).toFixed(0) + '.' + ((conv % 100) / 10).toFixed(0) + '.' + ((conv % 10)).toFixed(0);

    decoded.device.push(device);
    decoded.message.push(message);
    decoded.frauddec.push(frauddec);
    decoded.tamper.push(tamper);
    decoded.resol.push(resol);
    decoded.voltage.push(voltage);

    // FLUX A
    decoded.fluxA = [];
    var fluxA = {};

    fluxA.n = 'pulse_count_flux_a';
    fluxA.v = ((bytes[i++] << 24) | (bytes[i++] << 16) | (bytes[i++] << 8) | (bytes[i++])).toFixed(1);
    fluxA.u = 'count';

    decoded.fluxA.push(fluxA);

    if (device.mode === 'multi_mode') {
        // FLUX B
        decoded.fluxB = [];
        var fluxB = {};

        fluxB.n = 'pulse_count_flux_b';
        fluxB.v = ((bytes[i++] << 24) | (bytes[i++] << 16) | (bytes[i++] << 8) | (bytes[i++])).toFixed(1);
        fluxB.u = 'count';

        // FLUX C
        decoded.fluxC = [];
        var fluxC = {};

        fluxC.n = 'pulse_count_flux_c';
        fluxC.v = ((bytes[i++] << 24) | (bytes[i++] << 16) | (bytes[i++] << 8) | (bytes[i])).toFixed(1);
        fluxC.u = 'count';

        decoded.fluxB.push(fluxB);
        decoded.fluxC.push(fluxC);

    } else {
        decoded.reflux = [];
        var reflux = {};

        reflux.n = 'pulse_count_reflux';
        reflux.v = ((bytes[i++] << 8) | (bytes[i])).toFixed(1);
        reflux.u = 'count';
        decoded.reflux.push(reflux);
    }

    return decoded;
}