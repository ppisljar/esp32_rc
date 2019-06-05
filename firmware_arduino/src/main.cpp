#include <Arduino.h>
#include <WiFi.h>
#include <WiFiUdp.h>
#include <ESPAsyncWebServer.h>
#include <ESPmDNS.h>
#include <Update.h>
#include <Servo.h>
#include <Wire.h>
#include <BMI160Gen.h>
#include <ArduinoOTA.h>
#include "FS.h"
#include "SPIFFS.h"
#include "pins.h"
#include "DRV8833.h"
#include "store.h"
#include "log.h"

const char *host = "car";
const char *ssid = "MicroRCCar";
const char *password = "password";

AsyncWebServer server(80);
WiFiUDP wifiUdp;
WiFiClient client;


DRV8833 motor1(MOTOR1_PWM, MOTOR1_DIR, MOTOR1_CHANNEL, MOTOR2_CHANNEL, 0, 255, 20, false, true); 
DRV8833 motor2(MOTOR2_PWM, MOTOR2_DIR, MOTOR3_CHANNEL, MOTOR4_CHANNEL, 0, 255, 20, false, true); 
Servo servo1;
Servo servo2;

void registerLoop(void *pvParameters);
void httpServerLoop(void *pvParameters);

struct settings {
  bool motor1_enabled;
  bool motor2_enabled;
  bool servo1_enabled;
  bool servo2_enabled;
  bool light1_enabled;
  bool light2_enabled;
  byte motor1_max;
  byte motor2_max;
  byte servo1_left;
  byte servo1_right;
  byte servo2_left;
  byte servo2_right;
  byte speed;
  byte handling;
  byte climb;
  byte offroad;
  byte battery;
  String image;
  String name;
  String wifi_ssid;
  String wifi_password;
  String wifi_server;
} settings;

void loadSettings() {
  settings.motor1_enabled = EEPROM.readBool(E_ADDR_MOTOR1_ENABLED);
  settings.motor2_enabled = EEPROM.readBool(E_ADDR_MOTOR2_ENABLED);
  settings.servo1_enabled = EEPROM.readBool(E_ADDR_SERVO1_ENABLED);
  settings.servo2_enabled = EEPROM.readBool(E_ADDR_SERVO2_ENABLED);
  byte peripherials = EEPROM.readByte(E_ADDR_PERIPHERIALS);
  settings.light1_enabled = peripherials & 1;
  settings.light2_enabled = peripherials & 2;
  settings.motor1_max = byte(EEPROM.read(E_ADDR_MOTOR1_MAX));
  settings.motor2_max = byte(EEPROM.read(E_ADDR_MOTOR2_MAX));
  settings.servo1_left = byte(EEPROM.read(E_ADDR_SERVO1_LEFT));
  settings.servo1_right = byte(EEPROM.read(E_ADDR_SERVO1_RIGHT));
  settings.servo2_left = byte(EEPROM.read(E_ADDR_SERVO2_LEFT));
  settings.servo2_right = byte(EEPROM.read(E_ADDR_SERVO2_RIGHT));
  settings.speed = byte(EEPROM.read(E_ADDR_SPEED));
  settings.handling = byte(EEPROM.read(E_ADDR_HANDLING));
  settings.climb = byte(EEPROM.read(E_ADDR_CLIMB));
  settings.offroad = byte(EEPROM.read(E_ADDR_OFFROAD));
  settings.battery = byte(EEPROM.read(E_ADDR_BATTERY));
  settings.image = EEPROM.readString(E_ADDR_IMAGE);
  settings.name = EEPROM.readString(E_ADDR_NAME);
  settings.wifi_ssid = EEPROM.readString(E_ADDR_WIFI_SSID);
  settings.wifi_password = EEPROM.readString(E_ADDR_WIFI_PASSWORD);
  settings.wifi_server = EEPROM.readString(E_ADDR_WIFI_SERVER);
}

void writeSettings() {
  EEPROM.writeBool(E_ADDR_MOTOR1_ENABLED, settings.motor1_enabled);
  EEPROM.writeBool(E_ADDR_MOTOR2_ENABLED, settings.motor2_enabled);
  EEPROM.writeBool(E_ADDR_SERVO1_ENABLED, settings.servo1_enabled);
  EEPROM.writeBool(E_ADDR_SERVO2_ENABLED, settings.servo2_enabled);
  byte peripherials = settings.light1_enabled | settings.light2_enabled << 1;
  EEPROM.writeByte(E_ADDR_PERIPHERIALS, peripherials);
  EEPROM.writeByte(E_ADDR_MOTOR1_MAX, settings.motor1_max);
  EEPROM.write(E_ADDR_MOTOR2_MAX, settings.motor2_max);
  EEPROM.write(E_ADDR_SERVO1_LEFT, settings.servo1_left);
  EEPROM.write(E_ADDR_SERVO1_RIGHT, settings.servo1_right);
  EEPROM.write(E_ADDR_SERVO2_LEFT, settings.servo2_left);
  EEPROM.write(E_ADDR_SERVO2_RIGHT, settings.servo2_right);
  EEPROM.write(E_ADDR_SPEED, settings.speed);
  EEPROM.write(E_ADDR_HANDLING, settings.handling);
  EEPROM.write(E_ADDR_CLIMB, settings.climb);
  EEPROM.write(E_ADDR_OFFROAD, settings.offroad);
  EEPROM.write(E_ADDR_BATTERY, settings.battery);
  EEPROM.writeString(E_ADDR_IMAGE, settings.image);
  EEPROM.writeString(E_ADDR_NAME, settings.name);
  EEPROM.writeString(E_ADDR_WIFI_SSID, settings.wifi_ssid);
  EEPROM.writeString(E_ADDR_WIFI_PASSWORD, settings.wifi_password);
  EEPROM.writeString(E_ADDR_WIFI_SERVER, settings.wifi_server);
  EEPROM.commit();
}

void parseMotor2Byte(byte command) {
  if (!settings.motor2_enabled) return;
  motor2.drive(command, settings.motor2_max, 7, false, false);
}

void parseMotorByte(byte command, uint motor_dir, uint motor_pwm) {
  if (!settings.motor1_enabled) return;
  motor1.drive(command, settings.motor1_max, 7, false, false);
}

void parseServo1Byte(uint position) {
  if (!settings.servo1_enabled) return;
  uint MIN_POS = settings.servo1_left;
  uint MAX_POS = settings.servo1_right;
  uint pos = map(position, 0, 255, MIN_POS, MAX_POS); // scale from 0 - 255 to MIN_POS - MAX_POS

  servo1.write(pos);
}

void parseServo2Byte(uint position) {
  if (!settings.servo2_enabled) return;
  uint MIN_POS = settings.servo2_left;
  uint MAX_POS = settings.servo2_right;
  uint pos = map(position, 0, 255, MIN_POS, MAX_POS); // scale from 0 - 255 to MIN_POS - MAX_POS

  servo2.write(pos);
}

char buffer[8];
// HEADER HEADER MOTOR1 MOTOR2 SERVO1 SERVO2 SWITCHES CHECKSUM
char command[8] = { 81, 91, 127, 127, 127, 127, 0, 0 };

void setup() {
  // put your setup code here, to run once:
  Serial.begin(115200);
  // Debug.begin(host);
  bool i2c_started = Wire.begin(I2C_SDA, I2C_SCL);
  if (!i2c_started) {
    log(LOG_WARNING, "cant start i2c");
  }

  log(LOG_INFO, "starting up");

  if (!EEPROM.begin(EEPROM_SIZE))
  {
    log(LOG_ERROR, "failed to initialise EEPROM");
    delay(1000000);
    ESP.restart();
  }

  if(!SPIFFS.begin(true)){
      Serial.println("SPIFFS Mount Failed");
      return;
  }
  
  loadSettings();

  pinMode(VOLT_SENS, INPUT);

  // if (i2c_started) BMI160.begin(BMI160GenClass::I2C_MODE);

  // pinMode(0, OUTPUT);
  // pinMode(2, OUTPUT);
  // pinMode(27, OUTPUT);

  if (settings.servo1_enabled) {
    pinMode(SERVO1, OUTPUT);
    servo1.attach(SERVO1, SERVO1_CHANNEL); //, optional int minAngle, optional int maxAngle, optional int minPulseWidth, optional int maxPulseWidth
  }
  if (settings.servo2_enabled) {
    pinMode(SERVO2, OUTPUT);
    servo2.attach(SERVO2, SERVO2_CHANNEL);
  }
  if (settings.light1_enabled) {
    pinMode(LIGHT1, OUTPUT);
  }
  if (settings.light2_enabled) {
    pinMode(LIGHT2, OUTPUT);
  }


  // attempt to connect to Wifi network:
  // try to connect to the game server ... if its not found go to single mode
  int i = 0;
  int status;
  
  if (settings.wifi_ssid.length() && settings.wifi_password.length()) {
    
    settings.wifi_ssid = "Teltonika_Router";
    settings.wifi_password = "secpass123";
    
    WiFi.begin(settings.wifi_ssid.c_str(), settings.wifi_password.c_str());
    
    while (status != WL_CONNECTED && i < 10) {
      // Connect to WPA/WPA2 network:
      log(LOG_ALL, "Attempting to connect to WPA SSID: %s:%s", settings.wifi_ssid.c_str(), settings.wifi_password.c_str());
      status = WiFi.status();
      i++;
      // wait 10 seconds for connection:
      delay(1000);
    }
  }
  

  if (status == WL_CONNECTED) {
    log(LOG_ALL, "connected to wifi! IP:");
    Serial.println(WiFi.localIP());
    xTaskCreatePinnedToCore(registerLoop, "registerLoop", 4096, NULL, 1, NULL, 1);
  } else {
    log(LOG_ALL, "Can't connect to wifi, starting in AP mode");
    WiFi.softAP(ssid, password);
    //log(LOG_ALL, "IP Address: %s", WiFi.softAPIP());

    /*use mdns for host name resolution*/
    if (!MDNS.begin(host)) { //http://esp32.local
      log(LOG_ERROR, "Error setting up MDNS responder!");
      while (1) {
        delay(1000);
      }
    }
    log(LOG_INFO, "mDNS responder started");
  }

  ArduinoOTA
    .onStart([]() {
      String type;
      if (ArduinoOTA.getCommand() == U_FLASH)
        type = "sketch";
      else // U_SPIFFS
        type = "filesystem";

      // NOTE: if updating SPIFFS this would be the place to unmount SPIFFS using SPIFFS.end()
      Serial.println("Start updating " + type);
    })
    .onEnd([]() {
      Serial.println("\nEnd");
    })
    .onProgress([](unsigned int progress, unsigned int total) {
      Serial.printf("Progress: %u%%\r", (progress / (total / 100)));
    })
    .onError([](ota_error_t error) {
      Serial.printf("Error[%u]: ", error);
      if (error == OTA_AUTH_ERROR) Serial.println("Auth Failed");
      else if (error == OTA_BEGIN_ERROR) Serial.println("Begin Failed");
      else if (error == OTA_CONNECT_ERROR) Serial.println("Connect Failed");
      else if (error == OTA_RECEIVE_ERROR) Serial.println("Receive Failed");
      else if (error == OTA_END_ERROR) Serial.println("End Failed");
    });

  ArduinoOTA.begin();

  wifiUdp.begin(2222);

  
  xTaskCreatePinnedToCore(httpServerLoop, "httpServerLoop", 4096, NULL, 1, NULL, 1);
}



char checksum(char* buf) {
  return 0;
}

bool newCommand = false;
void loop() {
    int packetLength = wifiUdp.parsePacket();
    if (packetLength) {
      int x = 0;

      // handle reading data packages (protocol)
      // wait for header byte, read next X bytes, calculate CRC, push to the command buffer
      while (wifiUdp.available()>0) {
        buffer[x] = wifiUdp.read();
        if (x == 0 && buffer[0] != 129) continue;
        if (x == 1 && buffer[1] != 145) {
          x = 0;
          continue;
        }
        if (x == 7) {
          if (buffer[x] != checksum(buffer)) {
            x = 0;
            continue;
          } else {
            log(LOG_INFO, "got new command!");
            newCommand = true;
            memcpy(command, buffer, 8);

            x = 0;
            continue;
          }
        }
        log(LOG_INFO, "packet: %d - %d", x, buffer[x]);
        x++;
      }
    }

    parseMotorByte(command[2], 0, 0);
    parseMotor2Byte(command[3]);
    parseServo1Byte(command[4]);
    parseServo2Byte(command[5]);
}


unsigned long lastConnectionTime = 0;            // last time you connected to the server, in milliseconds
const unsigned long postingInterval = 10L * 1000L; // delay between updates, in milliseconds
void registerWithServer() {
  // close any connection before send a new request.
  // This will free the socket on the WiFi shield
  client.stop();

  float voltage = analogRead(VOLT_SENS);
  int ax, ay, az, gx, gy, gz, t;
  BMI160.readAccelerometer(ax, ay, az);
  BMI160.readGyro(gx, gy, gz);
  t = BMI160.readTemperature();

  char serverIp[sizeof(settings.wifi_server)];
  settings.wifi_server.toCharArray(serverIp, sizeof(serverIp));

  // if there's a successful connection:
  if (client.connect(settings.wifi_server.c_str(), 3000)) {
    log(LOG_INFO, "connecting to server...");
    // send the HTTP PUT request:
    String registrationRequest = "GET /register?car={\"id\":\"truck1\",\"name\":\"{{name}}\",\"image\":\"{{image}}\",\"sensors\":{\"ax\":\"{{ax}}\",\"ay\":\"{{ay}}\",\"az\":\"{{az}}\",\"gx\":\"{{gx}}\",\"gy\":\"{{gy}}\",\"gz\":\"{{gz}}\",\"temperature\":\"{{temperature}}\",\"voltage\":\"{{voltage}}\"},\"values\":{\"handling\":{{handling}},\"speed\":{{speed}},\"climb\":{{climb}},\"offroad\":{{offroad}},\"battery\":{{battery}}}} HTTP/1.1";
    registrationRequest.replace("{{name}}", settings.name);
    registrationRequest.replace("{{image}}", settings.image);
    registrationRequest.replace("{{speed}}", String(settings.speed, DEC));
    registrationRequest.replace("{{handling}}", String(settings.handling, DEC));
    registrationRequest.replace("{{climb}}", String(settings.climb, DEC));
    registrationRequest.replace("{{offroad}}", String(settings.offroad, DEC));
    registrationRequest.replace("{{battery}}", String(settings.battery, DEC));
    registrationRequest.replace("{{voltage}}", String(voltage, DEC));
    registrationRequest.replace("{{temperature}}", String(t));
    registrationRequest.replace("{{ax}}", String(ax));
    registrationRequest.replace("{{ay}}", String(ay));
    registrationRequest.replace("{{az}}", String(az));
    registrationRequest.replace("{{gx}}", String(gx));
    registrationRequest.replace("{{gy}}", String(gy));
    registrationRequest.replace("{{gz}}", String(gz));
    client.println(registrationRequest);
    client.println("Connection: close");
    client.println();

    // note the time that the connection was made:
    lastConnectionTime = millis();
  } else {
    // if you couldn't make a connection:
    log(LOG_ERROR, "connection to /register failed");
  }
}

void registerLoop(void *pvParameters) {
  while (1) {
    registerWithServer();
    delay(5000);
  }
}

String template_processor(const String& var)
{
  if(var == "motor1_enabled") return settings.motor1_enabled ? F("checked") : String();
  else if(var == "motor2_enabled") return settings.motor2_enabled ? F("checked") : String();
  else if(var == "servo1_enabled") settings, settings.servo1_enabled ? F("checked") : String();
  else if(var == "servo2_enabled") return settings.servo2_enabled ? F("checked") : String();
  else if(var == "light1_enabled") return settings.light1_enabled ? F("checked") : String();
  else if(var == "light2_enabled") return settings.light2_enabled ? F("checked") : String();
  else if(var == "motor1_max") return String(settings.motor1_max, DEC);
  else if(var == "motor2_max") return String(settings.motor2_max, DEC);
  else if(var == "servo1_left") return String(settings.servo1_left, DEC);
  else if(var == "servo1_right") return String(settings.servo1_right, DEC);
  else if(var == "servo2_left") return String(settings.servo2_left, DEC);
  else if(var == "servo2_right") return String(settings.servo2_right, DEC);
  else if(var == "speed") return String(settings.speed, DEC);
  else if(var == "handling") return String(settings.handling, DEC);
  else if(var == "climb") return String(settings.climb, DEC);
  else if(var == "offroad") return String(settings.offroad, DEC);
  else if(var == "battery") return String(settings.battery, DEC);
  else if(var == "image") return settings.image;
  else if(var == "name") return settings.name;
  else if(var == "wifi_ssid") return settings.wifi_ssid;
  else if(var == "wifi_password") return settings.wifi_password;
  else if(var == "wifi_server") return settings.wifi_server;

  return String();
}

void httpServerLoop(void *pvParameters) {

  server.on("/", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(SPIFFS, "/index.html", "text/html");
  });

  server.on("/settings", HTTP_GET, [](AsyncWebServerRequest *request) {
    log(LOG_INFO, "web /settings");    
    request->send(SPIFFS, "/settings.html", String(), false, template_processor);
  });

  server.on("/drive", HTTP_GET, [](AsyncWebServerRequest *request) {
    log(LOG_INFO, "web /drive");
    request->send(SPIFFS, "/drive.html", String(), false, template_processor);
  });

  server.on("/update", HTTP_GET, [](AsyncWebServerRequest *request) {
    request->send(SPIFFS, "/update.html", "text/html");
  });

  server.on("/nipple.js", HTTP_GET, [](AsyncWebServerRequest *request) {
    request->send(SPIFFS, "/nipple.js", "text/javascript");
  });

  server.on("/style.css", HTTP_GET, [](AsyncWebServerRequest *request) {
    request->send(SPIFFS, "/style.css", "text/css");
  });


  server.on("/restart", HTTP_GET, [](AsyncWebServerRequest *request) {
    request->send(200, "text/html", "<head><meta http-equiv='refresh' content='3;url=/' /><body>OK, redirecting ...</body>");
    ESP.restart();
  });

  server.on("/settings", HTTP_POST, [](AsyncWebServerRequest *request) {
    settings.motor1_enabled = request->hasArg("motor1");
    settings.motor2_enabled = request->hasArg("motor2");
    settings.servo1_enabled = request->hasArg("servo1");
    settings.servo2_enabled = request->hasArg("servo2");
    settings.light1_enabled = request->hasArg("light1");
    settings.light2_enabled = request->hasArg("light2");
    settings.motor1_max = request->arg("motor1_max").toInt();
    settings.motor2_max = request->arg("motor2_max").toInt();
    settings.servo1_left = request->arg("servo1_left").toInt();
    settings.servo1_right = request->arg("servo1_right").toInt();
    settings.servo2_left = request->arg("servo2_left").toInt();
    settings.servo2_right = request->arg("servo2_right").toInt();
    settings.speed = request->arg("speed").toInt();
    settings.handling = request->arg("handling").toInt();
    settings.climb = request->arg("climb").toInt();
    settings.offroad = request->arg("offroad").toInt();
    settings.battery = request->arg("battery").toInt();
    settings.image = request->arg("image");
    settings.name = request->arg("name");
    settings.wifi_ssid = request->arg("wifi_ssid");
    settings.wifi_password = request->arg("wifi_password");
    settings.wifi_server = request->arg("wifi_server");

    log(LOG_ALL, "setting wifi to %s:%s", settings.wifi_ssid.c_str(), settings.wifi_password.c_str());

    writeSettings();

    request->send(200, "text/html", (Update.hasError()) ? "FAIL" : "<head><meta http-equiv='refresh' content='3;url=/settings' /><head><body>OK ... redirecting</body>");
  });

  /*handling uploading firmware file */
  server.on("/update", HTTP_POST, [](AsyncWebServerRequest *request) {
    request->send(200, "text/html", (Update.hasError()) ? "FAIL" : "<head><meta http-equiv='refresh' content='3;url=/' /><head><body>OK ... redirecting</body>");
    ESP.restart();
  }, [](AsyncWebServerRequest *request, String filename, size_t index, uint8_t *data, size_t len, bool final) {
    if (!index) {
      log(LOG_INFO, "Update: %s\n", filename.c_str());
      if (!Update.begin(UPDATE_SIZE_UNKNOWN)) { //start with max available size
        Update.printError(Serial);
      }
    } 
    /* flashing firmware to ESP*/
    if (Update.write(data, len) != len) {
      Update.printError(Serial);
    }
    if (final) {
      if (Update.end(true)) { //true to set the size to the current progress
        log(LOG_INFO, "Update Success: %u\nRebooting...\n", 0);
      } else {
        Update.printError(Serial);
      }
    }
  });

  /* handling value updates */
  server.on("/value", HTTP_GET, [](AsyncWebServerRequest *request) {
    log(LOG_INFO, "web /value");
    if (request->hasArg("servo1")) {
      command[4] = request->arg("servo1").toInt();
    }
    if (request->hasArg("servo2")) {
      command[5] = request->arg("servo2").toInt();
    }
    if (request->hasArg("motor1")) {
      command[2] = request->arg("motor1").toInt();
    }
    if (request->hasArg("motor2")) {
      command[3] = request->arg("motor2").toInt();
    }

    request->send(200, "text/plain", (Update.hasError()) ? "FAIL" : "OK");
  });

  server.begin();

  while(1) {
    
    Debug.handle();
    ArduinoOTA.handle();
    delay(100);
  }
}
