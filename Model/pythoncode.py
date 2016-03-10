import sys
import json

a = sys.argv[1]
print(sys.version_info)
print(json.loads(a))
print(__name__ + ": hello " + a)
sys.stdout.flush()