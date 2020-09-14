#!/usr/bin/env python3

from power_api import SixfabPower, Definition, Event
import time
import schedule

api = SixfabPower();

def job():
    try:
        print(str(api.get_input_temp()));
        print(str(api.get_input_voltage()));
        print(str(api.get_input_current()));
        print(str(api.get_input_power()));

        print(str(api.get_system_temp()));
        print(str(api.get_system_voltage()));
        print(str(api.get_system_current()));
        print(str(api.get_system_power()));

        print(str(api.get_battery_temp()));
        print(str(api.get_battery_voltage()));
        print(str(api.get_battery_current()));
        print(str(api.get_battery_power()));
        print(str(api.get_battery_level()));
        print(str(api.get_battery_health()));

        print(str(api.get_fan_health()));
        print(str(api.get_fan_speed()));
        print(str(api.get_fan_mode()));
    except:
        print("An exception occurred in sixfab");

schedule.every(1).minutes.do(job);
# After every 1 to 2 mins in between run job() 
#schedule.every(1).to(2).minutes.do(job) 

while True:
    schedule.run_pending();
    time.sleep(3);
