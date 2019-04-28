#include <Arduino.h>
#include <SPI.h>
#include "Adafruit_BLE.h"
#include "Adafruit_BluefruitLE_SPI.h"
#include "Adafruit_BluefruitLE_UART.h"

#include "BluefruitConfig.h"

#if SOFTWARE_SERIAL_AVAILABLE
  #include <SoftwareSerial.h>
#endif

#define FACTORYRESET_ENABLE         1
#define MINIMUM_FIRMWARE_VERSION    "0.6.6"
#define MODE_LED_BEHAVIOUR          "MODE"

Adafruit_BluefruitLE_SPI ble(BLUEFRUIT_SPI_CS, BLUEFRUIT_SPI_IRQ, BLUEFRUIT_SPI_RST);

// A small helper
void error(const __FlashStringHelper*err) {
  Serial.println(err);
  while (1);
}

uint8_t value = 50; 

void setup(void) {

  delay(500);

  Serial.begin(115200);
  Serial.println(F("Adafruit Bluefruit Command <-> Data Mode Example"));
  Serial.println(F("------------------------------------------------"));

  /* Initialise the module */
  Serial.print(F("Initialising the Bluefruit LE module: "));

  if ( !ble.begin(VERBOSE_MODE) )
  {
    error(F("Couldn't find Bluefruit, make sure it's in CoMmanD mode & check wiring?"));
  }
  Serial.println( F("OK!") );

  if ( FACTORYRESET_ENABLE )
  {
    /* Perform a factory reset to make sure everything is in a known state */
    Serial.println(F("Performing a factory reset: "));
    if ( ! ble.factoryReset() ){
      error(F("Couldn't factory reset"));
    }
  }

  /* Disable command echo from Bluefruit */
  ble.echo(false);

  Serial.println("Requesting Bluefruit info:");
  /* Print Bluefruit information */
  ble.info();

  Serial.println(F("Setting device name to 'Bluefruit LOC Phone': "));

  if (! ble.sendCommandCheckOK(F("AT+GAPDEVNAME=Bluefruit LOC Phone")) ) {
    error(F("Could not set device name?"));
  }

  ble.verbose(false);  // debug info is a little annoying after this point!

  /* Wait for connection */
  while (! ble.isConnected()) {
      delay(500);
  }

  Serial.println(F("******************************"));

  // LED Activity command is only supported from 0.6.6
  if ( ble.isVersionAtLeast(MINIMUM_FIRMWARE_VERSION) )
  {
    // Change Mode LED Activity
    Serial.println(F("Change LED activity to " MODE_LED_BEHAVIOUR));
    ble.sendCommandCheckOK("AT+HWModeLED=" MODE_LED_BEHAVIOUR);
  }

  // Set module to DATA mode
  Serial.println( F("Switching to DATA mode!") );
  ble.setMode(BLUEFRUIT_MODE_DATA);

  Serial.println(F("******************************"));
}

void loop() {

  
  // I haven't really setup a 
  // eventually, you'll want to do an analogRead, cast that value as 
  // uint8_t and then ble.print(value).
  // Then app.js takes over from there. 

  // Note you are not *really* setting up a properly structured custom GATT
  // service/characteristic structure; instead: naively broadcasting 
  // data. 
  
////  for (uint8_t i = 0; i < 10; i++) {
//      ble.print(50, HEX);
////      delay(50);
////    }

      int heart_rate = random(50, 100);

      ble.print( F("AT+GATTCHAR=") );
      ble.print( hrmMeasureCharId );
      ble.print( F(",00-") );
      ble.println(heart_rate, HEX);
    
      /* Check if command executed OK */
      if ( !ble.waitForOK() )
      {
        Serial.println(F("Failed to get response!"));
      }

    delay(5000);

}
