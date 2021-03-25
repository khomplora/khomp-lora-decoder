
/**
* Decode an uplink message from a buffer (array) of bytes to an object of fields.
* If use ChirpStack, rename the function to "function Decode(port, bytes, variables)"
*/
function Decoder(bytes, port) {
    var decoded = {};
    var index = 0;
    var mask_sensor_int = bytes[index++];
    var mask_sensor_ext = bytes[index++];
    var status_dry = ["OPEN", "CLOSED"];
    var status_relay = ["NO", "NC"];

    var model = {n : "model"};
    // Decode Model
    switch (port) {
        case 3: model.v = "NIT20L"; break;
        case 4: model.v = "NIT21L"; break;
        default: model.v = "Unknow Model"; return decoded;
    }
    decoded.device = [];
    decoded.device.push(model);

    if (mask_sensor_int & 0x19) {
        decoded.internal_sensors = [];
    }

    // Decode Battery
    if (mask_sensor_int >> 0 & 0x01) {
        var battery = {};
        battery.n = 'battery';
        battery.v = (bytes[index++] / 10.0).toFixed(1);
        battery.u = 'V';

        decoded.internal_sensors.push(battery);
    }

    // Decode Firmware Version
    if (mask_sensor_int >> 2 & 0x01) {
        var firmware_version = {n : "version"};
        var firmware = bytes[index++] | (bytes[index++] << 8) | (bytes[index++] << 16);
        var hardware = (firmware / 1000000) >>> 0;
        var compatibility = ((firmware / 10000) - (hardware * 100)) >>> 0;
        var feature = ((firmware - (hardware * 1000000) - (compatibility * 10000)) / 100) >>> 0;
        var bug = (firmware - (hardware * 1000000) - (compatibility * 10000) - (feature * 100)) >>> 0;

        firmware_version.v = hardware + '.' + compatibility + '.' + feature + '.' + bug;
        decoded.device.push(firmware_version);
    }

    // Decode Temperature Int
    if (mask_sensor_int >> 3 & 0x01) {
        var temperature = {};
        temperature.v = bytes[index++] | (bytes[index++] << 8);
        temperature.v = ((temperature.v / 100.0) - 273.15).toFixed(2);
        temperature.n = "temperature";
        temperature.u = "C";

        decoded.internal_sensors.push(temperature);
    }

    // Decode Moisture Int
    if (mask_sensor_int >> 4 & 0x01) {
        var humidity = {};
        humidity.v = bytes[index++] | (bytes[index++] << 8);
        humidity.v = (humidity.v / 10.0).toFixed(2);
        humidity.n = "humidity";
        humidity.u = "%";
        decoded.internal_sensors.push(humidity);
    }

    // Decode Drys
    if (mask_sensor_ext & 0x0F) {
        decoded.drys = [];

        // Decode Dry 1 State
        if (mask_sensor_ext >> 0 & 0x01) {
            var dry = {};
            dry.n = 'C1 State';
            dry.v = status_dry[bytes[index++]];
            decoded.drys.push(dry);
        }

        // Decode Dry 1 Count
        if (mask_sensor_ext >> 1 & 0x01) {
            var dry = {};
            dry.n = 'C1 Count';
            dry.v = bytes[index++] | (bytes[index++] << 8);
            decoded.drys.push(dry);
        }

        // Decode Dry 2 State
        if (mask_sensor_ext >> 2 & 0x01) {
            var dry = {};
            dry.n = 'C2 State';
            dry.v = status_dry[bytes[index++]];
            decoded.drys.push(dry);
        }

        // Decode Dry 2 Count
        if (mask_sensor_ext >> 3 & 0x01) {
            var dry = {};
            dry.n = 'C2 Count';
            dry.v = bytes[index++] | (bytes[index++] << 8);
            decoded.drys.push(dry);
        }
    }

    // Decode DS18B20 Probe
    if (mask_sensor_ext >> 4 & 0x07) {
        var nb_probes = (mask_sensor_ext >> 4 & 0x07) >>> 0;

        decoded.probes = [];

        for (var i = 0; i < nb_probes; i++) {
            var probe = {};

            probe.n = 'temperature';
            probe.v = (((bytes[index++] | (bytes[index++] << 8)) / 100.0) - 273).toFixed(2);
            probe.u = 'C';

            if (mask_sensor_ext >> 7 & 0x01) {
                index += 7;
                probe.rom = (bytes[index--]).toString(16);

                for (var j = 0; j < 7; j++) {
                    probe.rom += (bytes[index--]).toString(16);
                }
                index += 9;
            } else {
                probe.rom = bytes[index++];
            }
            probe.rom = probe.rom.toUpperCase();
            decoded.probes.push(probe);
        }
    }

    // Decode Extension Module(s).
    if (bytes.length > index) {
        decoded.modules = [];

        while (bytes.length > index) {
            var module_type = {n : "module"};
            switch (bytes[index]) {
                case 1:
                    {
                        module_type.v = "EM S104";
                        index++;
                        var mask_ems104 = bytes[index++];

                        // E1
                        if (mask_ems104 >> 0 & 0x01) {
                            var conn = {};
                            conn.n = 'e1_temp';
                            conn.v = (bytes[index++] | (bytes[index++] << 8));
                            conn.v = ((conn.v / 100.0) - 273.15).toFixed(2);
                            conn.u = 'C';
                            decoded.modules.push(conn);
                        }

                        // E2
                        if (mask_ems104 >> 1 & 0x01) {
                            var conn = {};
                            conn.n = 'e2_kpa';
                            conn.v = ((bytes[index++] | (bytes[index++] << 8)) / 100.0).toFixed(2);
                            conn.u = 'kPa';
                            decoded.modules.push(conn);
                        }

                        // E3
                        if (mask_ems104 >> 2 & 0x01) {
                            var conn = {};
                            conn.n = 'e3_kpa';
                            conn.v = ((bytes[index++] | (bytes[index++] << 8)) / 100.0).toFixed(2);
                            conn.u = 'kPa';
                            decoded.modules.push(conn);
                        }

                        // E4
                        if (mask_ems104 >> 3 & 0x01) {
                            var conn = {};
                            conn.n = 'e4_kpa';
                            conn.v = ((bytes[index++] | (bytes[index++] << 8)) / 100.0).toFixed(2);
                            conn.u = 'kPa';
                            decoded.modules.push(conn);
                        }
                    }
                    break;

                case 2:
                    {
                        module_type.v = "EM C104";
                        index++;
                        var mask_emc104 = bytes[index++];


                        // Plus (Min Max and Avg)
                        if (mask_emc104 >> 4 & 0x01) {
                            for (var k = 0; k < 4; k++) {
                                if ((mask_emc104 >> k) & 0x01) {
                                    var conn = {};
                                    conn.n = 'e' + (k + 1) + '_curr';
                                    conn.u = "mA";
                                    // Min
                                    if (mask_emc104 >> 5 & 0x01) {
                                        conn.min = (bytes[index++] / 12.0).toFixed(2);
                                    }
                                    // Max
                                    if (mask_emc104 >> 6 & 0x01) {
                                        conn.max = (bytes[index++] / 12.0).toFixed(2);
                                    }
                                    // Avg
                                    if (mask_emc104 >> 7 & 0x01) {
                                        conn.avg = (bytes[index++] / 12.0).toFixed(2);
                                    }
                                    decoded.modules.push(conn);
                                }
                            }
                        } else {
                            // E1
                            if (mask_emc104 >> 0 & 0x01) {
                                var conn = {};
                                conn.n = 'e1_curr';
                                conn.v = ((bytes[index++] | (bytes[index++] << 8)) / 1000).toFixed(2);
                                conn.u = "mA";
                                decoded.modules.push(conn);
                            }

                            // E2
                            if (mask_emc104 >> 1 & 0x01) {
                                var conn = {};
                                conn.n = 'e2_curr';
                                conn.v = ((bytes[index++] | (bytes[index++] << 8)) / 1000).toFixed(2);
                                conn.u = "mA";
                                decoded.modules.push(conn);
                            }

                            // E3
                            if (mask_emc104 >> 2 & 0x01) {
                                var conn = {};
                                conn.n = 'e3_curr';
                                conn.v = ((bytes[index++] | (bytes[index++] << 8)) / 1000).toFixed(2);
                                conn.u = "mA";
                                decoded.modules.push(conn);
                            }

                            // E4
                            if (mask_emc104 >> 3 & 0x01) {
                                var conn = {};
                                conn.n = 'e4_curr';
                                conn.v = ((bytes[index++] | (bytes[index++] << 8)) / 1000).toFixed(2);
                                conn.u = "mA";
                                decoded.modules.push(conn);
                            }
                        }

                    }
                    break;

                // EM W104
                case 4:
                    {
                        module_type.v = "EM W104";
                        index++;
                        var mask_emw104 = bytes[index++];

                        //Weather Station
                        if (mask_emw104 >> 0 & 0x01) {
                            //Rain
                            var conn = {};
                            conn.n = 'rain_lvl';
                            conn.v = (((bytes[index++] << 8) | bytes[index++]) / 10.0).toFixed(1);
                            conn.u = 'mm';
                            decoded.modules.push(conn);

                            //Average Wind Speed
                            var conn = {};
                            conn.n = 'avg_wind_speed'
                            conn.v = bytes[index++].toFixed(0);
                            conn.u = 'km/h';
                            decoded.modules.push(conn);

                            //Gust Wind Speed
                            var conn = {};
                            conn.n = 'gust_wind_speed';
                            conn.v = bytes[index++].toFixed(0);
                            conn.u = 'km/h';
                            decoded.modules.push(conn);

                            //Wind Direction
                            var conn = {};
                            conn.n = 'wind_direction';
                            conn.v = ((bytes[index++] << 8) | bytes[index++]).toFixed(0);
                            conn.u = 'graus';
                            decoded.modules.push(conn);

                            //Temperature
                            var conn = {};
                            conn.n = 'temperature';
                            conn.v = ((bytes[index++] << 8) | bytes[index++]) / 10.0;
                            conn.v = (conn.v - 273.15).toFixed(1);
                            conn.u = 'C';
                            decoded.modules.push(conn);

                            //Humidity
                            var conn = {};
                            conn.n = 'humidity';
                            conn.v = bytes[index++].toFixed(0);
                            conn.u = '%';
                            decoded.modules.push(conn);

                            //Lux and UV
                            if (mask_emw104 >> 1 & 0x01) {
                                var conn = {};
                                conn.n = 'luminosity';
                                conn.v = (bytes[index++] << 16) | (bytes[index++] << 8) | bytes[index++];
                                conn.u = 'lx';
                                decoded.modules.push(conn);

                                var conn = {};
                                conn.n = 'uv';
                                conn.v = bytes[index++];
                                conn.v = (conn.v / 10.0).toFixed(1);
                                conn.u = '/';
                                decoded.modules.push(conn);
                            }
                        }

                        //Pyranometer
                        if (mask_emw104 >> 2 & 0x01) {
                            var conn = {};
                            conn.n = 'solar_radiation';
                            conn.v = (bytes[index++] << 8) | bytes[index++];
                            conn.v = (conn.v / 10.0).toFixed(1);
                            conn.u = 'W/m²';
                            decoded.modules.push(conn);
                        }

                        //Barometer
                        if (mask_emw104 >> 3 & 0x01) {
                            var conn = {};
                            conn.n = 'atm_pres';
                            conn.v = (bytes[index++] << 16);    
                            conn.v |= (bytes[index++] << 8) | bytes[index++] << 0;                        
                            conn.v = (conn.v / 100.0).toFixed(1);
                            conn.u = 'hPa²';
                            decoded.modules.push(conn);
                        }
                    }
                    break;

                // EM R102
                case 5:
                    {
                        index++;
                        module_type.v = "EM R102";

                        var mask_emr102 = bytes[index++];
                        var mask_data = bytes[index++];

                        // E1
                        if (mask_emr102 >> 0 & 0x01) {
                            var conn = {};
                            conn.n = 'C3 Status';
                            conn.v = status_dry[(mask_data >> 0 & 0x01)];
                            conn.u = "bool";
                            decoded.modules.push(conn);

                            var conn = {};
                            conn.n = 'C3 Count';
                            conn.v = bytes[index++] | (bytes[index++] << 8);
                            decoded.modules.push(conn);
                        }

                        // E2
                        if (mask_emr102 >> 1 & 0x01) {
                            var conn = {};
                            conn.n = 'C4 Status';
                            conn.v = status_dry[(mask_data >> 1 & 0x01)];
                            conn.u = "bool";
                            decoded.modules.push(conn);

                            var conn = {};
                            conn.n = 'C4 Count';
                            conn.v = bytes[index++] | (bytes[index++] << 8);
                            decoded.modules.push(conn);
                        }

                        // E3
                        if (mask_emr102 >> 2 & 0x01) {
                            var conn = {};
                            conn.n = 'B3 Relay';
                            conn.v = status_relay[(mask_data >> 2 & 0x01)];
                            decoded.modules.push(conn);
                        }

                        // E4
                        if (mask_emr102 >> 3 & 0x01) {
                            var conn = {};
                            conn.n = 'B4 Relay';
                            conn.v = status_relay[(mask_data >> 3 & 0x01)];
                            decoded.modules.push(conn);
                        }

                    }
                    break;

                // EM ACW100 & EM THW 100/200/201
                case 6:
                    {
                        index++;

                        var rom = {};
                        var one_wire_ext_model = 0x00;
                        var mask_em_acw_thw = bytes[index++];

                        if (mask_em_acw_thw == 0x03) {
                            one_wire_ext_model = 0x06;
                        }
                        else {
                            if (mask_em_acw_thw >> 0 & 0x01) {
                                one_wire_ext_model |= 0x01;
                            }

                            if (mask_em_acw_thw >> 4 & 0x01) {
                                one_wire_ext_model |= 0x02;
                            }
                        }

                        switch (one_wire_ext_model) {
                            case 0x01:
                                module_type.v = "EM THW 200";
                                break;
                            case 0x02:
                                module_type.v = "EM ACW 100";
                                break;
                            case 0x03:
                                module_type.v = "EM THW 201";
                                break;
                            case 0x06:
                                module_type.v = "EM THW 100";
                                break;
                            default:
                                module_type.v = "Unknow";
                                break;
                        }
                        decoded.modules.push(module_type);
                        //ROM
                        if ((mask_sensor_ext >> 4 & 0x07) && (mask_sensor_ext >> 7 & 0x00)) {
                            rom.v = bytes[index++];
                        } else {
                            index += 7;
                            rom.v = (bytes[index--]).toString(16);

                            for (var j = 0; j < 7; j++) {
                                rom.v += (bytes[index--]).toString(16);
                            }
                            index += 9;
                        }

                        rom.v = rom.v.toUpperCase();
                        rom.n = 'ROM';
                        decoded.modules.push(rom);

                        //Temperature
                        if (mask_em_acw_thw >> 0 & 0x01) {
                            var sensor = {};
                            sensor.n = 'temperature';
                            sensor.u = 'C';
                            sensor.v = ((bytes[index++] | (bytes[index++] << 8)) / 100.0) - 273.15;
                            sensor.v = sensor.v.toFixed(2);
                            decoded.modules.push(sensor);
                        }

                        //Humidity
                        if (mask_em_acw_thw >> 1 & 0x01) {
                            var sensor = {};
                            sensor.n = 'humidity';
                            sensor.u = '%';
                            sensor.v = (bytes[index++] | (bytes[index++] << 8)) / 100.0;
                            sensor.v = sensor.v.toFixed(2);
                            decoded.modules.push(sensor);
                        }

                        //Lux
                        if (mask_em_acw_thw >> 2 & 0x01) {
                            var sensor = {};
                            sensor.n = 'luminosity';
                            sensor.u = 'lux';
                            sensor.v = bytes[index++] | (bytes[index++] << 8);
                            sensor.v = sensor.v.toFixed(2);
                            decoded.modules.push(sensor);
                        }

                        //Noise
                        if (mask_em_acw_thw >> 3 & 0x01) {
                            var sensor = {};
                            sensor.n = 'noise';
                            sensor.u = 'dB';
                            sensor.v = (bytes[index++] | (bytes[index++] << 8)) / 100.0;
                            sensor.v = sensor.v.toFixed(2);
                            decoded.modules.push(sensor);
                        }

                        //Temperature RTDT
                        if (mask_em_acw_thw >> 4 & 0x01) {
                            var sensor = {};
                            sensor.n = 'temperature_rtdt';
                            sensor.u = 'C';
                            sensor.v = bytes[index++];
                            for (var j = 1; j < 4; j++) {
                                sensor.v |= (bytes[index++] << (8 * j));
                            }
                            sensor.v = ((sensor.v / 100.0) - 273.15).toFixed(2);
                            decoded.modules.push(sensor);
                        }
                    }
                    break;

                default:
                    {
                        return decoded;
                    }
            }
        }
    }
    return decoded;
}
