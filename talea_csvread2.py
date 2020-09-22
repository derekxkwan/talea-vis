import csv
import os
import sys
import json

filename = sys.argv[1]
curpath, curfile = os.path.split(filename)
basename, ext = os.path.splitext(curfile)
outfile = os.path.join(curpath, basename + ".js")

cur_arr = []

def convert_ints(cur_arr):
    return [int(x) if x.isdigit() else x for x in cur_arr]

with open(filename) as f:
    cur_read = csv.reader(f, delimiter=",")
    cur_keys = next(cur_read)
    int_keys = cur_keys[:3]
    rest_keys = cur_keys[3:]
    for row in cur_read:
        int_elts = convert_ints(row[:3])
        rest_elts = row[3:]
        int_dict = dict(zip(int_keys, int_elts))
        rest_dict = dict(zip(rest_keys, rest_elts))
        cur_dict = {**int_dict, **rest_dict}
        cur_arr += [cur_dict]

ret_json = {"data": cur_arr}

with open(outfile, 'w') as o:
    json.dump(ret_json, o)
