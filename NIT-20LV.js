
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
      battery.v = ((bytes[index++] / 120) + 1).toFixed(2);
      battery.u = 'V';

      decoded.device.push(battery);
    }

    // Temperature Int
    if (mask >> 2 & 0x01) {
      var temperature = {};
      temperature.v = (bytes[index++] / 3).toFixed(1);
      temperature.n = "temperature";
      temperature.u = "C";

      decoded.device.push(temperature);
    }

    // Humidity Int
    if (mask >> 3 & 0x01) {
      var humidity = {};
      humidity.v = (bytes[index++] / 2).toFixed(1);
      humidity.n = "humidity";
      humidity.u = "%";
      decoded.device.push(humidity);
    }

    // RMS
    if (mask >> 4 & 0x01) {
      var rms = [];

      rms.n = 'rms_x';
      rms.v = (((bytes[i++] << 8) | bytes[i++]) / 1000.0).toFixed(4);
      rms.u = 'ms2';

      axis.push(rms);

      rms.n = 'rms_y';
      rms.v = (((bytes[i++] << 8) | bytes[i++]) / 1000.0).toFixed(4);
      rms.u = 'ms2';

      axis.push(rms);

      rms.n = 'rms_x';
      rms.v = (((bytes[i++] << 8) | bytes[i++]) / 1000.0).toFixed(4);
      rms.u = 'ms2';

      axis.push(rms);
    }

    // Kurtosis
    if (mask >> 5 & 0x01) {
      var kurtosis = [];

      kurtosis.n = 'kurtosis_x';
      kurtosis.v = (((bytes[i++] << 8) | bytes[i++]) / 1000.0).toFixed(4);
      kurtosis.u = 'ms2';

      axis.push(kurtosis);

      kurtosis.n = 'kurtosis_y';
      kurtosis.v = (((bytes[i++] << 8) | bytes[i++]) / 1000.0).toFixed(4);
      kurtosis.u = 'ms2';

      axis.push(kurtosis);

      kurtosis.n = 'kurtosis_z';
      kurtosis.v = (((bytes[i++] << 8) | bytes[i++]) / 1000.0).toFixed(4);
      kurtosis.u = 'ms2';

      axis.push(kurtosis);
    }

    // Peak to Peak
    if (mask >> 6 & 0x01) {
      var peak_to_peak = [];

      kurtosis.n = 'peak_to_peak_x';
      kurtosis.v = (((bytes[i++] << 8) | bytes[i++]) / 1000.0).toFixed(4);
      kurtosis.u = 'ms2';

      axis.push(peak_to_peak);

      peak_to_peak.n = 'peak_to_peak_y';
      peak_to_peak.v = (((bytes[i++] << 8) | bytes[i++]) / 1000.0).toFixed(4);
      peak_to_peak.u = 'ms2';

      axis.push(peak_to_peak);

      peak_to_peak.n = 'peak_to_peak_z';
      peak_to_peak.v = (((bytes[i++] << 8) | bytes[i++]) / 1000.0).toFixed(4);
      peak_to_peak.u = 'ms2';

      axis.push(peak_to_peak);
    }

    // Crest Factor
    if (mask >> 7 & 0x01) {
      var crest_factor = [];

      crest_factor.n = 'crest_factor_x';
      crest_factor.v = (((bytes[i++] << 8) | bytes[i++]) / 1000.0).toFixed(4);
      crest_factor.u = 'ms2';

      axis.push(crest_factor);

      crest_factor.n = 'crest_factor_y';
      crest_factor.v = (((bytes[i++] << 8) | bytes[i++]) / 1000.0).toFixed(4);
      crest_factor.u = 'ms2';

      axis.push(crest_factor);

      crest_factor.n = 'crest_factor_z';
      crest_factor.v = (((bytes[i++] << 8) | bytes[i++]) / 1000.0).toFixed(4);
      crest_factor.u = 'ms2';

      axis.push(crest_factor);
    }

    decoded.axis.push(axis);
  }

  decoded.device.push(device);

  return decoded;
}