
/**
* Decode an uplink message from a buffer (array) of bytes to an object of fields.
* If use ChirpStack, rename the function to "function Decode(port, bytes, variables)"
*/

function Decoder(bytes, port) {
  var i = 0;
  var decoded = {};
  var device = {};
  var axis = {};
  var model = { n: "model" };
  var decode_ver = bytes[i++];

  decoded.device = [];
  decoded.environment = [];
  decoded.axis = [];

  if (decode_ver == 1) {

    // Decode Model
    switch (port) {
      case 13: model.v = "NIT20LV"; break;
      default: model.v = "Unknow Model"; return decoded;
    }

    decoded.device = [];
    decoded.device.push(model);

    mask = (bytes[i++] << 8) | bytes[i++];

    // Firmware
    if (mask >> 0 & 0x01) {
      var firmware = {n : "version"};
      firmware.v = (bytes[i] >> 4 & 0x0F) + '.' + (bytes[i++] & 0x0F) + '.';
      firmware.v += (bytes[i] >> 4 & 0x0F) + '.' + (bytes[i++] & 0x0F);

      decoded.device.push(firmware);
    }

    // Battery
    if (mask >> 1 & 0x01) {
      var battery = {};
      battery.n = 'battery';
      battery.v = ((bytes[i++] / 120) + 1).toFixed(2);
      battery.u = 'V';

      decoded.device.push(battery);
    }

    // Temperature Int
    if (mask >> 2 & 0x01) {
      var temperature = {};
      temperature.v = (bytes[i++] / 3).toFixed(1);
      temperature.n = "temperature";
      temperature.u = "C";

      decoded.device.push(temperature);
    }

    // Humidity Int
    if (mask >> 3 & 0x01) {
      var humidity = {};
      humidity.v = (bytes[i++] / 2).toFixed(1);
      humidity.n = "humidity";
      humidity.u = "%";
      decoded.device.push(humidity);
    }

    axis = [];
    // RMS
    if (mask >> 4 & 0x01) {
      var rms_x = {};  
      rms_x.n = 'rms_x';
      rms_x.v = (((bytes[i++] << 8) | bytes[i++]) / 1000.0).toFixed(4);
      rms_x.u = 'ms2';
      axis.push(rms_x);

      var rms_y = {};
      rms_y.n = 'rms_y';
      rms_y.v = (((bytes[i++] << 8) | bytes[i++]) / 1000.0).toFixed(4);
      rms_y.u = 'ms2';
      axis.push(rms_y);

      var rms_z = {};
      rms_z.n = 'rms_z';
      rms_z.v = (((bytes[i++] << 8) | bytes[i++]) / 1000.0).toFixed(4);
      rms_z.u = 'ms2';
      axis.push(rms_z);
    }

    // Kurtosis
    if (mask >> 5 & 0x01) {
      var kurtosis_x = {};
      kurtosis_x.n = 'kurtosis_x';
      kurtosis_x.v = (((bytes[i++] << 8) | bytes[i++]) / 1000.0).toFixed(4);
      kurtosis_x.u = 'ms2';
      axis.push(kurtosis_x);

      var kurtosis_y = {};
      kurtosis_y.n = 'kurtosis_y';
      kurtosis_y.v = (((bytes[i++] << 8) | bytes[i++]) / 1000.0).toFixed(4);
      kurtosis_y.u = 'ms2';
      axis.push(kurtosis_y);

      var kurtosis_z = {};
      kurtosis_z.n = 'kurtosis_z';
      kurtosis_z.v = (((bytes[i++] << 8) | bytes[i++]) / 1000.0).toFixed(4);
      kurtosis_z.u = 'ms2';
      axis.push(kurtosis_z);
    }

    // Peak to Peak
    if (mask >> 6 & 0x01) {
      var peak_to_peak_x = {};
      peak_to_peak_x.n = 'peak_to_peak_x';
      peak_to_peak_x.v = (((bytes[i++] << 8) | bytes[i++]) / 1000.0).toFixed(4);
      peak_to_peak_x.u = 'ms2';
      axis.push(peak_to_peak_x);

      var peak_to_peak_y = {};
      peak_to_peak_y.n = 'peak_to_peak_y';
      peak_to_peak_y.v = (((bytes[i++] << 8) | bytes[i++]) / 1000.0).toFixed(4);
      peak_to_peak_y.u = 'ms2';
      axis.push(peak_to_peak_y);

      var peak_to_peak_z = {};
      peak_to_peak_z.n = 'peak_to_peak_z';
      peak_to_peak_z.v = (((bytes[i++] << 8) | bytes[i++]) / 1000.0).toFixed(4);
      peak_to_peak_z.u = 'ms2';
      axis.push(peak_to_peak_z);
    }

    // Crest Factor
    if (mask >> 7 & 0x01) {
      var crest_factor_x = {};
      crest_factor_x.n = 'crest_factor_x';
      crest_factor_x.v = (((bytes[i++] << 8) | bytes[i++]) / 1000.0).toFixed(4);
      crest_factor_x.u = 'ms2';
      axis.push(crest_factor_x);

      var crest_factor_y = {};
      crest_factor_y.n = 'crest_factor_y';
      crest_factor_y.v = (((bytes[i++] << 8) | bytes[i++]) / 1000.0).toFixed(4);
      crest_factor_y.u = 'ms2';
      axis.push(crest_factor_y);

      var crest_factor_z = {};
      crest_factor_z.n = 'crest_factor_z';
      crest_factor_z.v = (((bytes[i++] << 8) | bytes[i++]) / 1000.0).toFixed(4);
      crest_factor_z.u = 'ms2';
      axis.push(crest_factor_z);
    }

    decoded.axis = axis;
  }

  decoded.device.push(device);

  return decoded;
}