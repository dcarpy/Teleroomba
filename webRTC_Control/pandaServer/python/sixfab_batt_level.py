#!/usr/bin/env python3

from power_api import SixfabPower, Definition, Event
import time
import schedule

api = SixfabPower();

def job():
    try:
        print(str(api.get_battery_level()));
    except:
        print("An exception occurred in get_battery_level");

#schedule.every(1).minutes.do(job);
# After every 1 to 2 mins in between run job() 
schedule.every(1).to(2).minutes.do(job) 

while True:
    schedule.run_pending();
    time.sleep(1);
