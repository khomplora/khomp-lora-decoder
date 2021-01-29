/**
* Decode an uplink message from a buffer (array) of bytes to an object of fields.
* If use ChirpStack, rename the function to "function Decode(port, bytes, variables)"
*/

function Decoder(bytes, port) {
  var i = 0;
  var decoded = {};
  var device = {};
  var decode_ver = bytes[i++];

  decoded.device = []; 

  if (decode_ver == 1) {

    switch (port) {
      case 10: device.model = "ITE10Lx"; break;
      default: device.model = "Unknow Model"; return decoded;
    }

    mask = (bytes[i++] << 8) | bytes[i++];

    // Firmware
    if (mask >> 0 & 0x01) {
      device.firmware = (bytes[i] >> 4 & 0x0F) + '.' + (bytes[i++] & 0x0F) + '.'; 
      device.firmware += (bytes[i] >> 4 & 0x0F) + '.' + (bytes[i++] & 0x0F);
    }

    decoded.device.push(device);

    decoded.power_meter = [];

    var power_meter = [];

    // Temperature
    if (mask >> 1 & 0x01) {
      var temperature = {};
      temperature.n = 'temperature';
      temperature.v = (bytes[i++] / 2).toFixed(1);
      temperature.u = 'C';
      power_meter.push(temperature);
    }

    // Frequency
    if (mask >> 2 & 0x01) {
      var frequency = {};
      frequency.n = 'frequency';
      frequency.v = ((bytes[i++] / 10.0) + 45).toFixed(1);
      frequency.u = 'Hz';
      power_meter.push(frequency);
    }    

    var phases_name = ["Phase A", "Phase B", "Phase C"];

    for (var index = 0; index < 3; index++) {
      if (mask >> (3+index) & 0x01) {
        var phase = [];
        var voltage = {};
        var current = {};
        var pwr_factor = {};
        var active_energy = {};
        var reactive_energy = {};

        phase.push(phases_name[index]);
        
        voltage.n = 'voltage';
        voltage.v = (((bytes[i++] << 8) | bytes[i++]) / 10.0).toFixed(1);
        voltage.u = 'V';
        phase.push(voltage);
        
        current.n = 'current';
        current.v = (((bytes[i++] << 8) | bytes[i++]) / 1000.0).toFixed(3);
        current.u = 'A';
        phase.push(current);
        
        pwr_factor.n = 'pwr_factor'; 
        pwr_factor.v = ((bytes[i++] / 100.0) - 1).toFixed(2);
        pwr_factor.u = '/';
        phase.push(pwr_factor);
        
        active_energy.n = 'active_energy';
        active_energy.v = ((bytes[i++] << 24) | (bytes[i++] << 16) | (bytes[i++] << 8) | bytes[i++]);
        active_energy.v = (active_energy.v / 100.0).toFixed(2);
        active_energy.u = 'kWh';
        phase.push(active_energy);
        
        reactive_energy.n = 'reactive_energy';
        reactive_energy.v = ((bytes[i++] << 24) | (bytes[i++] << 16) | (bytes[i++] << 8) | bytes[i++]);
        reactive_energy.v = (reactive_energy.v / 100.0).toFixed(2);
        reactive_energy.u = 'kWh';
        phase.push(reactive_energy);

        power_meter.push(phase);        
      }      
    }
    decoded.power_meter.push(power_meter);
  }

  return decoded;
}