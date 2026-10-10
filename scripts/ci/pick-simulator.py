# Print the UDID of an available simulator whose name starts with argv[1] ("iPhone" or
# "iPad"), preferring the newest iOS runtime.
import json
import re
import subprocess
import sys

want = sys.argv[1]
devices = json.loads(subprocess.check_output(["xcrun", "simctl", "list", "devices", "available", "-j"]))["devices"]


def version(runtime):
    m = re.search(r"iOS-(\d+)-(\d+)", runtime)
    return (int(m.group(1)), int(m.group(2))) if m else (0, 0)


for runtime in sorted(devices, key=version, reverse=True):
    if "iOS" not in runtime:
        continue
    for d in devices[runtime]:
        if d["name"].startswith(want):
            print(d["udid"])
            sys.exit(0)
sys.exit(f"no {want} simulator available")
