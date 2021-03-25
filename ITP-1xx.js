/**
* Decode an uplink message from a buffer (array) of bytes to an object of fields.
* If use ChirpStack, rename the function to "function Decode(port, bytes, variables)"
*/
function Decoder(bytes, port) {
    var decoded = {};
 
    switch(port)
    {
      case 5: decoded.Model = "ITP100"; break;
      case 6: decoded.Model = "ITP101"; break;
      case 7: decoded.Model = "ITP110"; break;
      case 8: decoded.Model = "ITP111"; break;
    }
   
    if(bytes[0] == 0x4C && bytes[1] == 0x01)
    {
      decoded.FirmwareVersion = (bytes[3] & 0x0F) + '.' +  ((bytes[3] >> 4) & 0x0F) + '.' + 
                                (bytes[2] & 0x0F) + '.' +  ((bytes[2] >> 4) & 0x0F);
   
      SensorMask = (bytes[4] << 24) +  (bytes[5] << 16) + (bytes[6] << 8)  +   bytes[7]; 
   
      var i = 7;
   
      if(SensorMask >> 0 & 0x01)
      {
        decoded.Voltage = ((bytes[++i] << 8) + bytes[++i])/10.0;
      }
   
      if(SensorMask >> 1 & 0x01)
      {
        decoded.Current = ((bytes[++i] << 16) + (bytes[++i] << 8) + bytes[++i])/10000.0;
      }
   
      if(SensorMask >> 2 & 0x01)
      {
        decoded.PowerFactor = ((bytes[++i] << 8) + bytes[++i])/1000.0;
      }
   
      if(SensorMask >> 3 & 0x01)
      {
        decoded.Frequency = ((bytes[++i] << 8) + bytes[++i])/1000.0;
      }
   
      if(SensorMask >> 4 & 0x01)
      {
        decoded.Temperature = ((bytes[++i] << 8) + bytes[++i])/100.0;
      }
   
      if(SensorMask >> 5 & 0x01)
      {
        decoded.Lux = ((bytes[++i] << 8) + bytes[++i])/1.0;
      }
   
      if(SensorMask >> 6 & 0x01)
      {
        decoded.Angle = ((bytes[++i] << 8) + bytes[++i])/100.0;
      }
   
      if(SensorMask >> 7 & 0x01)
      {
        decoded.SwingDuty = ((bytes[++i] << 8) + bytes[++i])/100.0;
      }
   
      if(SensorMask >> 8 & 0x01)
      {
        decoded.StandardDeviation = ((bytes[++i] << 8) + bytes[++i])/100.0;
      }
   
      if(SensorMask >> 9 & 0x01)
      {
        decoded.ActiveEnergy = ((bytes[++i] << 56) + (bytes[++i] << 48) + 
                                (bytes[++i] << 40) + (bytes[++i] << 32) + 
                                (bytes[++i] << 24) + (bytes[++i] << 16) + 
                                (bytes[++i] << 8))/1000000.0;
      }
   
      if(SensorMask >> 10 & 0x01)
      {
        decoded.ReactiveEnergy = ((bytes[++i] << 56) + (bytes[++i] << 48) + 
                                  (bytes[++i] << 40) + (bytes[++i] << 32) + 
                                  (bytes[++i] << 24) + (bytes[++i] << 16) + 
                                  (bytes[++i] << 8))/1000000.0;
      }
   
      if(SensorMask >> 11 & 0x01)
      {
        var Latitude = ((bytes[++i] << 24)  + (bytes[++i] << 16) + 
                        (bytes[++i] << 8)   +  bytes[++i]) >>> 0;
   
        var Longitude = ((bytes[++i] << 24) + (bytes[++i] << 16) + 
                         (bytes[++i] << 8)  +  bytes[++i]) >>> 0;
   
        if(Latitude  >> 31 & 0x01)
        {
          Latitude = - (Latitude - 0x80000000);
        }
   
        Latitude = Latitude/1000000.0;
   
   
        if(Longitude  >> 31 & 0x01)
        {
          Longitude = - (Longitude - 0x80000000);
        }
   
        Longitude = Longitude/1000000.0;
   
        decoded.Coordinates = Latitude + ',' + Longitude;
   
      }
   
      if(SensorMask >> 12 & 0x01)
      {
        decoded.DimmerDuty = bytes[++i];
      }
   
      if(SensorMask >> 13 & 0x01)
      {
        decoded.LastCommutation = (bytes[++i] << 8) + bytes[++i];
      }
   
      if(SensorMask >> 14 & 0x01)
      {
        decoded.LightOn = "True";
      }
      else
      {
        decoded.LightOn = "False"; 
      }
   
      switch(SensorMask >> 16 & 0x03)
      {
        case 0:  decoded.OperationMode = "Manual";    break;
        case 1:  decoded.OperationMode = "Automatic"; break;
        case 2:  decoded.OperationMode = "Slots";     break;
        default: decoded.OperationMode = "Error";     break;
      }
   
      if(SensorMask >> 18 & 0x01)
      {
        decoded.RTC = "Syncronized";
      }
      else
      {
        decoded.RTC = "Not Syncronized"; 
      }
   
      if(SensorMask >> 19 & 0x01)
      {
        decoded.Timestamp = (bytes[++i] << 24) + (bytes[++i] << 16) + 
                            (bytes[++i] << 8)  +  bytes[++i];
      }
   
      switch(SensorMask >> 20 & 0x03)
      {
        case 0:  decoded.SlotRunning = "Slot 0"; break;
        case 1:  decoded.SlotRunning = "Slot 1"; break;
        case 2:  decoded.SlotRunning = "Slot 2"; break;
        case 15: decoded.SlotRunning = "None";   break;
        default: decoded.SlotRunning = "None";   break;
      }
   
      return decoded;
    }
   
   
    else if(bytes[0] == 0x4B && bytes[1] == 0x02)
    {
      decoded.Message = "TILT Alarm Event!";
   
      return decoded;
    } 
   
    else if(bytes[0] == 0x4B && bytes[1] == 0x03)
    {
      decoded.Message = "Power Alarm Event!";
   
      return decoded;
    }
   
    else if(bytes[0] == 0x4B && bytes[1] == 0x04)
    {
      decoded.Message = "Report Alarm Event! ";
   
      if(bytes[2] >> 0 & 0x01)
      {
        decoded.Message = decoded.Message + "Power Meter FAIL";
      }
   
      if(bytes[2] >> 1 & 0x01)
      {
        decoded.Message = decoded.Message + "Lux Sensor FAIL";
      }
   
      if(bytes[2] >> 2 & 0x01)
      {
        decoded.Message = decoded.Message + "GPS Sensor FAIL";
      }
   
      if(bytes[2] >> 3 & 0x01)
      {
        decoded.Message = decoded.Message + "Accelerometer Sensor FAIL";
      }
   
      return decoded;
    }
   
    else if(bytes[0] == 0x4B && bytes[1] == 0x05)
    {
      if(bytes[2] == 0x01)
      {
        decoded.LightOn = "True";
      }
      else
      {
        decoded.LightOn = "False";
      }
   
      decoded.EventTime = ((bytes[3] << 24)  + (bytes[4] << 16) + 
                           (bytes[5] << 8)   +  bytes[6]) >>> 0;
   
      return decoded;
    }
}