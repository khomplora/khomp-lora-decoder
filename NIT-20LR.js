
/**
* Decode an uplink message from a buffer (array) of bytes to an object of fields.
* If use ChirpStack, rename the function to "function Decode(port, bytes, variables)"
*/

function Decoder(bytes, port) {
    var i = 0;
    var decoded = {};
    var device = {};
    var base = {};
    var decode_ver = bytes[i++];
  
    decoded.device = []; 
  
    if (decode_ver == 0x4D) {
  
      switch (port) {
        case 12: device.model = "NIT 20LR"; break;
        default: device.model = "Unknow Model"; return decoded;
      }
  
      mask = (bytes[i++] << 8) | bytes[i++];
  
      // Firmware Modulo
      if (mask >> 0 & 0x01) {
        device.firmware = (bytes[i] >> 4 & 0x0F) + '.' + (bytes[i++] & 0x0F) + '.'; 
        device.firmware += (bytes[i] >> 4 & 0x0F) + '.' + (bytes[i++] & 0x0F);
      }
  
      decoded.device.push(device);      
  
      decoded.radar = [];  
      var radar = [];
  
      // Range
      if (mask >> 1 & 0x01) {
        var range = {};
        range.n = 'range';
        range.v = (bytes[i++] << 8) | (bytes[i++] << 0);
        range.u = 'cm';
        radar.push(range);
      }      
      
      decoded.radar.push(radar);  

      decoded.base = [];  
      
      // Firmware Base
      if (mask >> 2 & 0x01) {
        base.firmware = (bytes[i] >> 4 & 0x0F) + '.' + (bytes[i++] & 0x0F) + '.';
        base.firmware += (bytes[i] >> 4 & 0x0F) + '.' + (bytes[i++] & 0x0F);   
        decoded.base.push(base);     
      }        
    }
  
    return decoded;
  }