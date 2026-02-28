![Logo](admin/starline_git.jpg)
# ioBroker.starline
![Number of Installations](http://iobroker.live/badges/starline-installed.svg) ![Number of Installations](http://iobroker.live/badges/starline-stable.svg) 
[![NPM version](https://img.shields.io/npm/v/iobroker.starline.svg)](https://www.npmjs.com/package/iobroker.starline)
[![Downloads](https://img.shields.io/npm/dm/iobroker.starline.svg)](https://www.npmjs.com/package/iobroker.starline)
[![Tests](https://github.com/instalator/iobroker.starline/workflows/Test%20and%20Release/badge.svg)](https://github.com/instalator/ioBroker.starline/actions/)

[![NPM](https://nodei.co/npm/iobroker.starline.png?downloads=true)](https://nodei.co/npm/iobroker.starline/)

[![Donate](https://img.shields.io/badge/donate-YooMoney-green)](https://sobe.ru/na/instalator)
[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=PFUALWTR2CTPY)

The adapter requires an anti-theft device installed and configured that supports StarLine Telematics Service 2.0.

The adapter makes it possible to receive vehicle status data via the StarLine telematics service. https://starline-online.ru.

##### Management of the main operating modes of the car alarm:
   - Arming/Disarming
   - Activation of the AntiHiJack function
   - Auto-Start
   - Activation of service mode (Valet)
   - Activation of additional channels
   - Switching the Webasto heater on/off (if available)
   - Request vehicle coordinates
   - Disable shock and tilt sensors

## Changelog

<!--
    Placeholder for the next version (at the beginning of the line):
    ### **WORK IN PROGRESS**
-->

### **WORK IN PROGRESS**
- (copilot) Adapter requires admin >= 7.7.22 now
- (copilot) Adapter requires js-controller >= 6.0.11 now
- (copilot) Adapter requires admin >= 7.6.17 now

### 1.2.0 (2024-04-28)
* (mcm1957) Adapter requires node.js >= 18 and js-controller >= 5 now
* (mcm1957) Dependencies have been updated

### 1.1.3
* (instalator) fixed error parse mayak

### 1.1.2
* (instalator) fixed objects
* (instalator) fixed interval

### 1.1.1
* (instalator) fixed send command

### 1.1.0
* (instalator) fixed auth
* (instalator) added support admin3

## License
The MIT License (MIT)

Copyright (c) 2023-2026 iobroker-community-adapters <iobroker-community-adapters@gmx.de>  
Copyright (c) 2021 instalator <vvvalt@mail.ru>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
